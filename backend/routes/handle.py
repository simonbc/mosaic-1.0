from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_db
from services import handle_service

router = APIRouter()

@router.post("/handle/{handle}")
def register_or_verify_handle(
    handle: str,
    public_key: str = None,
    signature: str = None,
    db: Session = Depends(get_db)
):
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    handle_service.verify_or_register_handle(db, handle, public_key, signature)
    return {"message": "Handle verified or registered successfully."}