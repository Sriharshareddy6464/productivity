import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_session
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalResponse, GoalUpdate

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalResponse])
async def list_goals(
    group_id: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if group_id:
        result = await session.execute(
            select(Goal).where(Goal.group_id == group_id).order_by(Goal.created_at.desc())
        )
    else:
        result = await session.execute(
            select(Goal).where(Goal.user_id == current_user.id).order_by(Goal.created_at.desc())
        )
    return result.scalars().all()


@router.post("", response_model=GoalResponse, status_code=201)
async def create_goal(
    body: GoalCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    goal = Goal(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        group_id=body.group_id,
        title=body.title,
        description=body.description,
        created_at=datetime.utcnow(),
    )
    session.add(goal)
    await session.commit()
    await session.refresh(goal)
    return goal


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Goal).where(Goal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id and goal.group_id is None:
        raise HTTPException(status_code=403, detail="Not authorized")
    return goal


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    body: GoalUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Goal).where(Goal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)
    await session.commit()
    await session.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Goal).where(Goal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    await session.execute(delete(Goal).where(Goal.id == goal_id))
    await session.commit()
