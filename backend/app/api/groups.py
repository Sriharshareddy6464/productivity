import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_session
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.user import User
from app.schemas.group import GroupCreate, GroupResponse, MemberInvite, MemberResponse

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("", response_model=GroupResponse, status_code=201)
async def create_group(
    body: GroupCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    group = Group(
        id=str(uuid.uuid4()),
        name=body.name,
        created_by=current_user.id,
        created_at=datetime.utcnow(),
    )
    session.add(group)
    await session.flush()

    member = GroupMember(
        id=str(uuid.uuid4()),
        group_id=group.id,
        user_id=current_user.id,
        role="admin",
    )
    session.add(member)
    await session.commit()
    await session.refresh(group)
    return group


@router.get("", response_model=list[GroupResponse])
async def list_groups(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Group).join(GroupMember).where(GroupMember.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/{group_id}/members", response_model=list[MemberResponse])
async def list_members(
    group_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(GroupMember).where(GroupMember.group_id == group_id)
    )
    return result.scalars().all()


@router.post("/{group_id}/members", response_model=MemberResponse, status_code=201)
async def invite_member(
    group_id: str,
    body: MemberInvite,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    group_result = await session.execute(select(Group).where(Group.id == group_id))
    group = group_result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    membership_result = await session.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.role == "admin",
        )
    )
    if not membership_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Only admins can invite members")

    user_result = await session.execute(select(User).where(User.email == body.email))
    invited_user = user_result.scalar_one_or_none()
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found")

    member = GroupMember(
        id=str(uuid.uuid4()),
        group_id=group_id,
        user_id=invited_user.id,
        role="member",
    )
    session.add(member)
    await session.commit()
    await session.refresh(member)
    return member


@router.delete("/{group_id}/members/{user_id}", status_code=204)
async def remove_member(
    group_id: str,
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    membership_result = await session.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.role == "admin",
        )
    )
    if not membership_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Only admins can remove members")

    await session.execute(
        delete(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    await session.commit()
