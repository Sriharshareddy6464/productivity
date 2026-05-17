import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_session
from app.models.task import Task
from app.models.todo_item import TodoItem
from app.models.user import User
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate

router = APIRouter(tags=["todos"])


@router.get("/tasks/{task_id}/todos", response_model=list[TodoResponse])
async def list_todos(
    task_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(TodoItem).where(TodoItem.task_id == task_id).order_by(TodoItem.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/tasks/{task_id}/todos", response_model=TodoResponse, status_code=201)
async def create_todo(
    task_id: str,
    body: TodoCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task_result = await session.execute(select(Task).where(Task.id == task_id))
    task = task_result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    todo = TodoItem(
        id=str(uuid.uuid4()),
        task_id=task_id,
        content=body.content,
        updated_at=datetime.utcnow(),
    )
    session.add(todo)
    await session.commit()
    await session.refresh(todo)
    return todo


@router.patch("/tasks/{task_id}/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(
    task_id: str,
    todo_id: str,
    body: TodoUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(TodoItem).where(TodoItem.id == todo_id, TodoItem.task_id == task_id)
    )
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)
    todo.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(todo)
    return todo


@router.delete("/tasks/{task_id}/todos/{todo_id}", status_code=204)
async def delete_todo(
    task_id: str,
    todo_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(TodoItem).where(TodoItem.id == todo_id, TodoItem.task_id == task_id)
    )
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    await session.execute(delete(TodoItem).where(TodoItem.id == todo_id))
    await session.commit()
