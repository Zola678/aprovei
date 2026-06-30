from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

# Um mini schema de User simplificado para evitar dependências circulares
class UserInClassroom(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    role: str
    is_premium: bool

    class Config:
        from_attributes = True

class ClassroomBase(BaseModel):
    name: str
    description: str | None = None
    subject: str
    price: Decimal = Decimal("0.00")

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomResponse(ClassroomBase):
    id: int
    teacher_id: int
    created_at: datetime
    teacher: UserInClassroom | None = None

    class Config:
        from_attributes = True

class ClassroomEnrollmentResponse(BaseModel):
    id: int
    classroom_id: int
    student_id: int
    status: str
    payment_reference: str | None = None
    created_at: datetime
    classroom: ClassroomResponse | None = None
    student: UserInClassroom | None = None

    class Config:
        from_attributes = True
