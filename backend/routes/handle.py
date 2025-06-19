from db.models import Handle
from fastapi import APIRouter, Depends, Path, Body
from sqlalchemy.orm import Session
from schema import HandleRegistrationRequest, HandleVerificationRequest

from api.deps import get_db
from services import handle_service

router = APIRouter()

@router.post("/handle/{handle}")
def register_or_verify_handle(
    handle: str = Path(...),
    payload: HandleRegistrationRequest = Body(...),
    db: Session = Depends(get_db)
):
    handle_service.verify_or_register_handle(db, handle, payload.public_key, payload.signature)
    return {"message": "Handle verified or registered successfully."}



@router.post("/handle/{handle}/check")
def check_handle_availability(
    handle: str = Path(...),
    payload: HandleVerificationRequest = Body(...),
    db: Session = Depends(get_db)
):
    existing = db.query(Handle).filter(Handle.handle == handle).first()
    if not existing:
        return {"available": True}
    try:
        handle_service.verify_handle(existing, payload.signature)
        return {"available": True}
    except Exception:
        return {"available": False}