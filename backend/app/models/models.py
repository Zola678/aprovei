from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, DECIMAL, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'student', 'teacher', 'admin'
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_premium = Column(Boolean, default=False)
    educational_level = Column(String, default="university_access") # 'high_school', 'university_access', 'university'
    photo_url = Column(String, nullable=True)
    status = Column(String, default="active") # 'active', 'pending_interview', 'pending_approval', 'rejected'
    experience = Column(String, nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    what_intends = Column(String, nullable=True)
    resume_pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False)
    forum_posts = relationship("ForumPost", back_populates="author")
    forum_comments = relationship("ForumComment", back_populates="author")
    study_tasks = relationship("StudyTask", back_populates="user")
    payments = relationship("Payment", back_populates="user")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    university = Column(String, nullable=False) # UAN, UMN, ISUTIC, etc.
    subject = Column(String, nullable=False)    # Matemática, Física, Português, etc.
    year = Column(Integer, nullable=False)
    pdf_url = Column(String, nullable=False)
    category = Column(String)                   # 'acesso', 'exame_especial'
    solved = Column(Boolean, default=False)
    solution_pdf_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    answer_key = Column(String, nullable=True)  # Gabarito oficial / chave de resposta
    questions_text = Column(String, nullable=True) # Texto das perguntas da prova
    created_at = Column(DateTime, default=datetime.utcnow)

class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialty = Column(String, nullable=False)  # Ex: Matemática Geral, Redação e Português
    bio = Column(String, nullable=True)
    price_per_hour = Column(Integer, nullable=False) # Em Kwanzas (Kz)
    whatsapp = Column(String, nullable=True)     # Link direto de contacto
    location = Column(String, nullable=True)     # Província e Município: Ex: "Luanda, Talatona"
    rating = Column(DECIMAL(3, 2), default=5.0)
    subject_tags = Column(String, nullable=True)  # Ex: "Matemática, Física, Geometria"
    
    user = relationship("User", back_populates="teacher_profile")

class ForumPost(Base):
    __tablename__ = "forum_posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    category = Column(String, default="Geral")  # Geral, Dúvidas, Editais, Dicas
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    likes = Column(Integer, default=0)
    
    author = relationship("User", back_populates="forum_posts")
    comments = relationship("ForumComment", back_populates="post", cascade="all, delete-orphan")

class ForumComment(Base):
    __tablename__ = "forum_comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("ForumPost", back_populates="comments")
    author = relationship("User", back_populates="forum_comments")

class StudyTask(Base):
    __tablename__ = "study_tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="study_tasks")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String, default="pending") # pending, completed, failed
    gateway_transaction_id = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="payments")

class HighSchoolMaterial(Base):
    __tablename__ = "high_school_materials"
    id = Column(Integer, primary_key=True, index=True)
    grade = Column(Integer, nullable=False) # 10, 11, 12
    subject = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    file_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIChatSession(Base):
    __tablename__ = "ai_chat_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True) # Prova vinculada
    title = Column(String, default="Nova Conversa")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    exam = relationship("Exam")
    messages = relationship("AIChatMessage", back_populates="session", cascade="all, delete-orphan")

class AIChatMessage(Base):
    __tablename__ = "ai_chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ai_chat_sessions.id"))
    sender = Column(String, nullable=False) # 'user' or 'ai'
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("AIChatSession", back_populates="messages")
