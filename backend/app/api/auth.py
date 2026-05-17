import uuid
from datetime import datetime

from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, Request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import create_access_token
from app.db.engine import get_session
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google")
async def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + "&".join(
        f"{k}={v}" for k, v in params.items()
    )
    return {"auth_url": auth_url}


@router.get("/google/callback")
async def google_callback(code: str, session: AsyncSession = Depends(get_session)):
    import httpx

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        token_json = token_response.json()

    if "error" in token_json:
        raise HTTPException(status_code=400, detail=token_json["error_description"])

    id_token_str = token_json.get("id_token")
    if not id_token_str:
        raise HTTPException(status_code=400, detail="No id_token in Google response")

    try:
        info = id_token.verify_oauth2_token(id_token_str, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {e}")

    email = info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            display_name=info.get("name"),
            avatar_url=info.get("picture"),
            created_at=datetime.utcnow(),
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "display_name": user.display_name, "avatar_url": user.avatar_url}}


class ContactsPermissionRequest(BaseModel):
    granted: bool


@router.post("/contacts-permission")
async def contacts_permission(
    body: ContactsPermissionRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.contacts_permission_granted:
        raise HTTPException(status_code=400, detail="Permission already granted")

    if body.granted:
        current_user.contacts_permission_granted = True
        await session.commit()
    else:
        current_user.contacts_permission_granted = False
        await session.commit()

    return {"contacts_permission_granted": current_user.contacts_permission_granted}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "display_name": current_user.display_name,
        "avatar_url": current_user.avatar_url,
        "contacts_permission_granted": current_user.contacts_permission_granted,
    }
