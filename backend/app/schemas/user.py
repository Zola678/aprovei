from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(..., pattern="^(student|teacher|admin)$")
    full_name: str | None = None
    phone: str | None = None
    is_premium: bool = False
    educational_level: str = "university_access"
    photo_url: str | None = None
    status: str = "active"
    experience: str | None = None
    years_of_experience: int | None = None
    what_intends: str | None = None
    resume_pdf_url: str | None = None
    xp: int = 0

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    educational_level: str | None = None
    password: str | None = None
    experience: str | None = None
    years_of_experience: int | None = None
    what_intends: str | None = None
    specialty: str | None = None
    bio: str | None = None
    price_per_hour: int | None = None
    whatsapp: str | None = None
    location: str | None = None
    subject_tags: str | None = None
    xp: int | None = None
