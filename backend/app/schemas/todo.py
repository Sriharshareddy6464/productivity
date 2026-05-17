from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TodoCreate(BaseModel):
    content: str


class TodoUpdate(BaseModel):
    content: Optional[str] = None
    is_completed: Optional[bool] = None


class TodoResponse(BaseModel):
    id: str
    task_id: str
    content: str
    is_completed: bool
    updated_at: datetime

    model_config = {"from_attributes": True}
