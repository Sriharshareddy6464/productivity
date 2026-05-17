import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from app.db.base import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    group_id = Column(CHAR(36), ForeignKey("groups.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="goals")
    group = relationship("Group", back_populates="goals")
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")
