from pydantic import BaseModel, Field
from decimal import Decimal
from app.schemas.user import User

class TeacherProfileBase(BaseModel):
    specialty: str = Field(..., min_length=2)
    bio: str | None = None
    price_per_hour: int = Field(..., ge=0)
    whatsapp: str | None = None
    location: str | None = None
    subject_tags: str | None = None

class TeacherProfileCreate(TeacherProfileBase):
    pass

class TeacherProfile(TeacherProfileBase):
    id: int
    user_id: int
    rating: Decimal
    user: User | None = None

    class Config:
        from_attributes = True
