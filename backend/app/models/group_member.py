import uuid
from sqlalchemy import Column, Enum, ForeignKey
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from app.db.base import Base


class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(CHAR(36), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(Enum("admin", "member"), default="member", nullable=False)

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")
