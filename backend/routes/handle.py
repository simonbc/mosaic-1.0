from db.models import Handle, Post, Revision
from fastapi import APIRouter, Depends, Path, Body, HTTPException
from sqlalchemy.orm import Session, joinedload, aliased
from sqlalchemy import func
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

@router.get("/handle/{handle}/posts")
def get_posts_by_handle(
    handle: str = Path(...),
    db: Session = Depends(get_db)
):
    latest_revision_subquery = (
        db.query(
            Revision.post_id,
            func.max(Revision.created_at).label("max_created_at")
        )
        .group_by(Revision.post_id)
        .subquery()
    )

    latest_revision_alias = aliased(Revision)

    posts = (
        db.query(Post, latest_revision_alias)
        .join(latest_revision_subquery, Post.id == latest_revision_subquery.c.post_id)
        .join(latest_revision_alias,
              (latest_revision_alias.post_id == latest_revision_subquery.c.post_id) &
              (latest_revision_alias.created_at == latest_revision_subquery.c.max_created_at))
        .filter(Post.handle == handle)
        .order_by(Post.created_at.desc())
        .all()
    )

    if not posts:
        raise HTTPException(status_code=404, detail="Handle not found")

    for post, revision in posts:
        post.latest_revision = revision

    return {"posts": [post for post, _ in posts]}