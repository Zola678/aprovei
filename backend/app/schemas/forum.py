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

class ForumPostBase(BaseModel):
    title: str = Field(..., min_length=2)
    content: str = Field(..., min_length=5)
    category: str = "Geral"

class ForumPostCreate(ForumPostBase):
    pass

class ForumPost(ForumPostBase):
    id: int
    user_id: int
    created_at: datetime
    likes: int
    author: User | None = None
    comments: list[ForumComment] = []

    class Config:
        from_attributes = True
