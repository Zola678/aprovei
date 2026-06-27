from pydantic import BaseModel, Field
from datetime import datetime

class HighSchoolMaterialBase(BaseModel):
    grade: int = Field(..., ge=10, le=12)
    subject: str = Field(..., min_length=2)
    title: str = Field(..., min_length=2)
    description: str | None = None

class HighSchoolMaterialCreate(HighSchoolMaterialBase):
    pass

class HighSchoolMaterial(HighSchoolMaterialBase):
    id: int
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True
