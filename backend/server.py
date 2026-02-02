import logging
import os
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, String, Boolean, DateTime, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# --- 1. CONFIGURATION ---
ROOT_DIR = Path(__file__).parent
# Try to load .env, but don't fail if missing (Docker env vars take precedence)
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security Config
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "change_this_in_production_to_a_long_random_string":
    logger.warning("⚠️  SECURITY WARNING: Using default/weak SECRET_KEY. Set a strong key in .env.")
    SECRET_KEY = str(uuid.uuid4())

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# File Storage
UPLOAD_DIR = os.path.join(ROOT_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Database
# In Docker, we might want to map this to a volume
DB_PATH = os.path.join(ROOT_DIR, "medassoc.db")
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

limiter = Limiter(key_func=get_remote_address)

# --- 2. DATABASE MODELS ---
class UserModel(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
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

class EventModel(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    date = Column(String)
    time = Column(String)
    location = Column(String)
    description = Column(String)
    image_url = Column(String, nullable=True)
    external_link = Column(String, nullable=True)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- 3. API SCHEMAS (Pydantic) ---
class Token(BaseModel):
    access_token: str
    token_type: str

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

class EventCreate(BaseModel):
    title: str
    date: str
    time: str
    location: str
    description: str
    image_url: Optional[str] = None
    external_link: Optional[str] = None
    status: str

class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    external_link: Optional[str] = None
    status: Optional[str] = None

class EventResponse(EventCreate):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- 4. SECURITY & AUTH ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    auth_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise auth_exception
    except JWTError:
        raise auth_exception
    
    result = await db.execute(select(UserModel).where(UserModel.username == username))
    user = result.scalars().first()
    if user is None:
        raise auth_exception
    return user

# --- 5. APPLICATION SETUP ---
app = FastAPI(title="S.P.O. API", version="1.0.0")

# Middleware Stack
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Trusted Hosts
# Allow all in production typically behind Nginx/Traefik, or specify exact domains
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"] # Managed by Nginx/Firewall in prod usually
)

# CORS
origins_raw = os.environ.get("CORS_ORIGINS", "*")
origins = origins_raw.split(",") if "," in origins_raw else [origins_raw]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# API Router
api_router = APIRouter(prefix="/api")

# --- 6. ENDPOINTS ---

# Authentication
@api_router.post("/auth/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserModel).where(UserModel.username == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"access_token": create_access_token({"sub": user.username}), "token_type": "bearer"}

# File Upload
@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    user: UserModel = Depends(get_current_user)
):
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Invalid file type. Allowed: JPG, PNG, WEBP.")
        
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(path, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"url": f"/uploads/{filename}"}
    except Exception:
        raise HTTPException(500, "File upload failed.")

# Doctors CRUD
@api_router.get("/doctors", response_model=List[DoctorResponse])
async def list_doctors(
    city: Optional[str] = None, 
    specialty: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = select(DoctorModel)
    if city:
        query = query.where(DoctorModel.city.ilike(f"%{city}%"))
    if specialty:
        query = query.where(DoctorModel.specialty.ilike(f"%{specialty}%"))
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@api_router.post("/doctors", response_model=DoctorResponse, status_code=201)
async def create_doctor(
    doc: DoctorCreate, 
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_doc = DoctorModel(**doc.model_dump())
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    return new_doc

@api_router.put("/doctors/{id}", response_model=DoctorResponse)
async def update_doctor(
    id: str, 
    doc: DoctorUpdate, 
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DoctorModel).where(DoctorModel.id == id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(404, "Doctor not found")
        
    for k, v in doc.model_dump(exclude_unset=True).items():
        setattr(existing, k, v)
        
    await db.commit()
    await db.refresh(existing)
    return existing

@api_router.delete("/doctors/{id}")
async def delete_doctor(
    id: str, 
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DoctorModel).where(DoctorModel.id == id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(404, "Doctor not found")
    
    await db.delete(existing)
    await db.commit()
    return {"message": "Deleted"}

# Events CRUD
@api_router.get("/events", response_model=List[EventResponse])
async def list_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EventModel).order_by(EventModel.created_at.desc()))
    return result.scalars().all()

@api_router.post("/events", response_model=EventResponse, status_code=201)
async def create_event(
    evt: EventCreate, 
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_evt = EventModel(**evt.model_dump())
    db.add(new_evt)
    await db.commit()
    await db.refresh(new_evt)
    return new_evt

@api_router.put("/events/{id}", response_model=EventResponse)
async def update_event(
    id: str, 
    evt: EventUpdate, 
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(EventModel).where(EventModel.id == id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(404, "Event not found")
        
    for k, v in evt.model_dump(exclude_unset=True).items():
        setattr(existing, k, v)
        
    await db.commit()
    await db.refresh(existing)
    return existing

@api_router.delete("/events/{id}")
async def delete_event(
    id: str, 
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(EventModel).where(EventModel.id == id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(404, "Event not found")
    
    await db.delete(existing)
    await db.commit()
    return {"message": "Deleted"}

# Include API Router
app.include_router(api_router)

# Mount Uploads (Before catch-all)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- 7. STATIC FILES (Frontend Serving) ---
# IMPORTANT: This allows us to serve the React app from FastAPI directly
# Simplifies deployment on VPS (Single port to expose)

FRONTEND_BUILD_DIR = Path("/app/frontend/build") # Docker path
LOCAL_BUILD_DIR = ROOT_DIR.parent / "frontend" / "build" # Local path

# Determine which build dir exists
BUILD_DIR = FRONTEND_BUILD_DIR if FRONTEND_BUILD_DIR.exists() else LOCAL_BUILD_DIR

if BUILD_DIR.exists():
    app.mount("/static", StaticFiles(directory=BUILD_DIR / "static"), name="static")
    
    # Catch-all route for SPA (React Router)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Allow API calls to pass through
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        file_path = BUILD_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
            
        # Default to index.html for SPA routing
        return FileResponse(BUILD_DIR / "index.html")
else:
    logger.warning("⚠️ Frontend build directory not found. Run 'yarn build' in frontend.")

# Startup
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserModel).where(UserModel.username == "admin@medassoc.com"))
        if not result.scalars().first():
            admin = UserModel(
                username="admin@medassoc.com",
                full_name="Admin",
                hashed_password=get_password_hash("admin123")
            )
            session.add(admin)
            await session.commit()
            logger.info("Admin user created")
