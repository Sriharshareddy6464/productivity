import uuid
from datetime import datetime
from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from app.db.base import Base


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_id = Column(CHAR(36), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    goal = relationship("Goal", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone", cascade="all, delete-orphan")
