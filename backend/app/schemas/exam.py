from pydantic import BaseModel, Field
from datetime import datetime

class ExamBase(BaseModel):
    university: str = Field(..., min_length=2)
    subject: str = Field(..., min_length=2)
    year: int = Field(..., ge=2000, le=2030)
    category: str = Field(..., pattern="^(acesso|exame_especial)$")
    solved: bool = False
    solution_pdf_url: str | None = None
    description: str | None = None

class ExamCreate(ExamBase):
    pass

class Exam(ExamBase):
    id: int
    pdf_url: str
    created_at: datetime
    
    class Config:
        from_attributes = True
