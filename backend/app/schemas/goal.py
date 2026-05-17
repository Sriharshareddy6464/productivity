from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    group_id: Optional[str] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    group_id: Optional[str] = None


class GoalResponse(BaseModel):
    id: str
    user_id: str
    group_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
