from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from db.models import Handle
from utils.crypto import verify_signature


def verify_handle(handle: Handle, signature: str):
    """
    Verifies an existing handle.
    """
    message = handle.handle.encode("utf-8")

    if not verify_signature(message, signature, handle.public_key):
        raise HTTPException(status_code=403, detail="Invalid signature")
    return True


def register_handle(session: Session, handle: str, public_key: str):
    """
    Registers a new handle.
    """
    if not public_key:
        raise HTTPException(status_code=400, detail="Missing public key for new handle")

    new_handle = Handle(handle=handle.lower(), public_key=public_key)
    session.add(new_handle)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="Handle already exists")


def verify_or_register_handle(session: Session, handle: str, public_key: str, signature: str):
    """
    Verifies an existing handle or registers a new handle if it does not exist.
    """
    existing = session.query(Handle).filter(Handle.handle.ilike(handle)).first()

    if existing:
        verify_handle(existing, signature)
    else:
        register_handle(session, handle, public_key)