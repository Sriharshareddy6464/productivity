from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    assigned_to: Optional[str] = None
    priority: int = 0


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    milestone_id: str
    title: str
    assigned_to: Optional[str] = None
    priority: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
