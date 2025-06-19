from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from api.deps import get_db
from services import post_service
from services import handle_service
from schema import PublishRequest

router = APIRouter()

@router.post("/post/{handle}/{slug}", response_model=dict)
def publish_post(
    handle: str = Path(...),
    slug: str = Path(...),
    post_data: PublishRequest = None,
    db: Session = Depends(get_db)
):
    post_data.handle = handle
    post_data.slug = slug

    # Verify or register the handle
    handle_service.verify_or_register_handle(db, handle, post_data.public_key, post_data.signature)

    post_id = post_service.save_post(db, post_data)
    return {"status": "ok", "id": post_id}

@router.get("/post/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = post_service.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.get("/post/{handle}/{slug}")
def get_post_by_slug(handle: str, slug: str, db: Session = Depends(get_db)):
    post = post_service.get_post_by_slug(db, handle, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# Delete a published post by handle and slug
@router.delete("/post/{handle}/{slug}", response_model=dict)
def delete_post_by_slug(handle: str, slug: str, db: Session = Depends(get_db)):
    post = post_service.get_post_by_slug(db, handle, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post_service.delete_post(db, post["id"])
    return {"status": "deleted"}
