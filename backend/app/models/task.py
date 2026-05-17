import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from app.db.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    milestone_id = Column(CHAR(36), ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    assigned_to = Column(CHAR(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    priority = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    milestone = relationship("Milestone", back_populates="tasks")
    assignee = relationship("User")
    todo_items = relationship("TodoItem", back_populates="task", cascade="all, delete-orphan")
