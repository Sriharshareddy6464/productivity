from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GroupCreate(BaseModel):
    name: str


class GroupResponse(BaseModel):
    id: str
    name: str
    created_by: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MemberInvite(BaseModel):
    email: str


class MemberResponse(BaseModel):
    id: str
    group_id: str
    user_id: str
    role: str

    model_config = {"from_attributes": True}
