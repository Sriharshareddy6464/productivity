from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None


class MilestoneResponse(BaseModel):
    id: str
    goal_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
