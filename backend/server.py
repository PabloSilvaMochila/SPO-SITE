import logging
import os
import shutil
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import Column, String, Boolean, DateTime, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Setup & Configuration
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security: Load Secret from Env (Critical)
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    logger.warning("SECRET_KEY not set in .env! Generating a temporary one.")
    SECRET_KEY = str(uuid.uuid4())

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Uploads Config
UPLOAD_DIR = os.path.join(ROOT_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 2. Database Setup (SQLite + SQLAlchemy)
# Using a file-based SQLite database
DATABASE_URL = "sqlite+aiosqlite:///./medassoc.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

# SQLAlchemy Models (The "Tables")
class UserModel(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String)
    full_name = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)

class DoctorModel(Base):
    __tablename__ = "doctors"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    city = Column(String)
    specialty = Column(String)
    contact_info = Column(String)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# 3. Pydantic Models (The "Shapes" for API validation)
class Token(BaseModel):
    access_token: str
    token_type: str

class UserSchema(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class DoctorCreate(BaseModel):
    name: str
    city: str
    specialty: str
    contact_info: str
    image_url: Optional[str] = None

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    specialty: Optional[str] = None
    contact_info: Optional[str] = None
    image_url: Optional[str] = None

class DoctorResponse(DoctorCreate):
    id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# 4. Auth & Security Logic
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

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

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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
    
    # Query DB for user
    result = await db.execute(select(UserModel).where(UserModel.username == username))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

# 5. App & Router
app = FastAPI()

# Mount uploads (Serve static files securely)
# In production, this would often be handled by Nginx/S3, but fine for standalone.
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Security: CORS Configuration
# In a real scenario, allow_origins should be specific domains from .env
origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# --- Routes ---

# Auth
@api_router.post("/auth/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    # Security: Fetch user securely
    result = await db.execute(select(UserModel).where(UserModel.username == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Security: Generic error message to prevent enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Uploads
@api_router.post("/upload")
async def upload_image(
    file: UploadFile = File(...), 
    current_user: UserModel = Depends(get_current_user)
):
    try:
        # Security: Validate extension
        filename = file.filename
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
             raise HTTPException(status_code=400, detail="File type not allowed")

        # Security: Generate random filename to prevent overwrites/traversal
        secure_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, secure_filename)
        
        with open(file_path, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        return {"url": f"/uploads/{secure_filename}"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Image upload failed")

# Doctors (CRUD)
@api_router.get("/doctors", response_model=List[DoctorResponse])
async def get_doctors(
    city: Optional[str] = None, 
    specialty: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    # SQL Query Construction
    query = select(DoctorModel)
    
    if city:
        # Security: SQLAlchemy handles escaping automatically
        query = query.where(DoctorModel.city.ilike(f"%{city}%"))
    if specialty:
        query = query.where(DoctorModel.specialty.ilike(f"%{specialty}%"))
        
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    doctors = result.scalars().all()
    return doctors

@api_router.post("/doctors", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    doctor: DoctorCreate, 
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_doctor = DoctorModel(**doctor.model_dump())
    db.add(new_doctor)
    await db.commit()
    await db.refresh(new_doctor)
    return new_doctor

@api_router.put("/doctors/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(
    doctor_id: str, 
    doctor_update: DoctorUpdate, 
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if exists
    result = await db.execute(select(DoctorModel).where(DoctorModel.id == doctor_id))
    doctor_db = result.scalars().first()
    
    if not doctor_db:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    update_data = doctor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doctor_db, key, value)
        
    await db.commit()
    await db.refresh(doctor_db)
    return doctor_db

@api_router.delete("/doctors/{doctor_id}")
async def delete_doctor(
    doctor_id: str, 
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DoctorModel).where(DoctorModel.id == doctor_id))
    doctor_db = result.scalars().first()
    
    if not doctor_db:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    await db.delete(doctor_db)
    await db.commit()
    return {"message": "Doctor deleted successfully"}

# Include Router
app.include_router(api_router)

# Startup: Init DB and create Admin
@app.on_event("startup")
async def startup_event():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Create Admin
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(UserModel).where(UserModel.username == "admin@medassoc.com"))
        admin = result.scalars().first()
        
        if not admin:
            hashed_pw = get_password_hash("admin123")
            new_admin = UserModel(
                username="admin@medassoc.com",
                email="admin@medassoc.com",
                full_name="System Administrator",
                hashed_password=hashed_pw
            )
            db.add(new_admin)
            await db.commit()
            logger.info("Created default admin user (SQLite)")
