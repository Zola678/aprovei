from pydantic import BaseModel, Field
from datetime import datetime

class StudyTaskBase(BaseModel):
    title: str = Field(..., min_length=2)
    description: str | None = None
    due_date: datetime | None = None
    completed: bool = False

class StudyTaskCreate(StudyTaskBase):
    pass

class StudyTask(StudyTaskBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
