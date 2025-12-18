from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt

from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
import shutil

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory if it doesn't exist
os.makedirs(os.path.join(ROOT_DIR, "uploads"), exist_ok=True)

# Auth Config
SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey123") # Change in prod
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Models
class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class DoctorBase(BaseModel):
    name: str
    city: str
    specialty: str
    contact_info: str
    image_url: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class Doctor(DoctorBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    specialty: Optional[str] = None
    contact_info: Optional[str] = None
    image_url: Optional[str] = None

# Auth Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return UserInDB(**user)

# App Init
@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Create unique filename
        ext = os.path.splitext(file.filename)[1]
        if not ext:
            ext = ".jpg" # Default fallback
        
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(ROOT_DIR, "uploads", filename)
        
        with open(file_path, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        return {"url": f"/uploads/{filename}"}
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Image upload failed")

app = FastAPI()

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory=os.path.join(ROOT_DIR, "uploads")), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# Routes - Auth
@api_router.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Routes - Doctors
@api_router.get("/doctors", response_model=List[Doctor])
async def get_doctors(
    city: Optional[str] = None, 
    specialty: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = {}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if specialty:
        query["specialty"] = {"$regex": specialty, "$options": "i"}
        
    doctors = await db.doctors.find(query, {"_id": 0}).skip(skip).to_list(limit)
    return doctors

@api_router.post("/doctors", response_model=Doctor, status_code=status.HTTP_201_CREATED)
async def create_doctor(doctor: DoctorCreate, current_user: User = Depends(get_current_user)):
    doc_data = doctor.model_dump()
    new_doctor = Doctor(**doc_data)
    doc_dict = new_doctor.model_dump()
    doc_dict['created_at'] = doc_dict['created_at'].isoformat() # Store as ISO string in Mongo if preferred, or maintain datetime
    # Let's store as ISO string to be safe with Mongo
    
    await db.doctors.insert_one(doc_dict)
    return new_doctor

@api_router.put("/doctors/{doctor_id}", response_model=Doctor)
async def update_doctor(doctor_id: str, doctor_update: DoctorUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in doctor_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
        
    result = await db.doctors.find_one_and_update(
        {"id": doctor_id},
        {"$set": update_data},
        projection={"_id": 0},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    return Doctor(**result)

@api_router.delete("/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str, current_user: User = Depends(get_current_user)):
    result = await db.doctors.delete_one({"id": doctor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Doctor deleted successfully"}

# Include Router
app.include_router(api_router)

# Startup Event to create default admin
@app.on_event("startup")
async def startup_db_client():
    # Check if admin exists
    admin = await db.users.find_one({"username": "admin@medassoc.com"})
    if not admin:
        hashed_pw = get_password_hash("admin123")
        admin_user = UserInDB(
            username="admin@medassoc.com",
            email="admin@medassoc.com",
            full_name="System Administrator",
            hashed_password=hashed_pw
        )
        await db.users.insert_one(admin_user.model_dump())
        logger.info("Created default admin user: admin@medassoc.com / admin123")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
