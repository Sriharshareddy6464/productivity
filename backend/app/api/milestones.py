import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_session
from app.models.goal import Goal
from app.models.milestone import Milestone
from app.models.user import User
from app.schemas.milestone import MilestoneCreate, MilestoneResponse, MilestoneUpdate

router = APIRouter(tags=["milestones"])


@router.get("/goals/{goal_id}/milestones", response_model=list[MilestoneResponse])
async def list_milestones(
    goal_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Milestone).where(Milestone.goal_id == goal_id).order_by(Milestone.created_at.desc())
    )
    return result.scalars().all()


@router.post("/goals/{goal_id}/milestones", response_model=MilestoneResponse, status_code=201)
async def create_milestone(
    goal_id: str,
    body: MilestoneCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    goal_result = await session.execute(select(Goal).where(Goal.id == goal_id))
    goal = goal_result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    milestone = Milestone(
        id=str(uuid.uuid4()),
        goal_id=goal_id,
        title=body.title,
        description=body.description,
        due_date=body.due_date,
        created_at=datetime.utcnow(),
    )
    session.add(milestone)
    await session.commit()
    await session.refresh(milestone)
    return milestone


@router.get("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def get_milestone(
    milestone_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return milestone


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: str,
    body: MilestoneUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(milestone, key, value)
    await session.commit()
    await session.refresh(milestone)
    return milestone


@router.delete("/milestones/{milestone_id}", status_code=204)
async def delete_milestone(
    milestone_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    await session.execute(delete(Milestone).where(Milestone.id == milestone_id))
    await session.commit()
