import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    google_refresh_token = Column(String(512), nullable=True)
    contacts_permission_granted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    group_memberships = relationship("GroupMember", back_populates="user", cascade="all, delete-orphan")
