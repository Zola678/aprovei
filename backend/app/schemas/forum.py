from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.user import User

class ForumCommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class ForumCommentCreate(ForumCommentBase):
    post_id: int

class ForumComment(ForumCommentBase):
    id: int
    post_id: int
    user_id: int
    created_at: datetime
    author: User | None = None

    class Config:
        from_attributes = True

class CallConfirmationSchema(BaseModel):
    id: int
    post_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ForumPostBase(BaseModel):
    title: str = Field(..., min_length=2)
    content: str = Field(..., min_length=5)
    category: str = "Geral"

class ForumPostCreate(ForumPostBase):
    is_call: bool = False
    call_title: str | None = None
    call_scheduled_at: datetime | None = None

class ForumPost(ForumPostBase):
    id: int
    user_id: int
    created_at: datetime
    likes: int
    is_call: bool = False
    call_title: str | None = None
    call_scheduled_at: datetime | None = None
    call_status: str = "scheduled"
    call_url: str | None = None
    confirmations: list[CallConfirmationSchema] = []
    author: User | None = None
    comments: list[ForumComment] = []

    class Config:
        from_attributes = True
