from fastapi import APIRouter, Depends, HTTPException, Path, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from schema import HandleVerificationRequest

from api.deps import get_db
from services import handle_service

router = APIRouter()

@router.post("/handle/{handle}")
def register_or_verify_handle(
    handle: str = Path(...),
    payload: HandleVerificationRequest = Body(...),
    db: Session = Depends(get_db)
):
    handle_service.verify_or_register_handle(db, handle, payload.public_key, payload.signature)
    return {"message": "Handle verified or registered successfully."}