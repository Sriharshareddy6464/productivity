import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from app.db.base import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    created_by = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="group")
