from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from db.models import Handle
from utils.crypto import verify_signature


def verify_or_register_handle(session: Session, handle: str, public_key: str, signature: str):
    """
    Verifies an existing handle or registers a new handle if it does not exist.
    """
    message = handle.encode("utf-8")

    existing = session.query(Handle).filter(Handle.handle.ilike(handle)).first()

    if existing:
        if not verify_signature(message, signature, existing.public_key):
            raise HTTPException(status_code=403, detail="Invalid signature")
    else:
        if not public_key:
            raise HTTPException(status_code=400, detail="Missing public key for new handle")

        new_handle = Handle(handle=handle.lower(), public_key=public_key)
        session.add(new_handle)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()

            raise HTTPException(status_code=409, detail="Handle already exists")