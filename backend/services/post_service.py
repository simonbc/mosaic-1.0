from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from db.models import Post, Revision
from schema import PublishRequest

def save_post(session: Session, post_data: PublishRequest):
    """
    Save or update a post, and create a new revision if content changed.
    """
    # Try to find existing post
    post = session.query(Post).filter(
        Post.handle.ilike(post_data.handle),
        Post.slug.ilike(post_data.slug)
    ).first()

    if not post:
        # Create new post
        post = Post(
            handle=post_data.handle,
            slug=post_data.slug,
            byline=post_data.byline
        )
        session.add(post)
        session.commit()
        session.refresh(post)
    else:
        # Update existing post metadata
        post.byline = post_data.byline
        session.commit()

    # Check if content has changed since last revision
    last_revision = (
        session.query(Revision)
        .filter(Revision.post_id == post.id)
        .order_by(Revision.created_at.desc())
        .first()
    )

    if last_revision and last_revision.content == post_data.content:
        return post.id  # No new revision needed

    # Create new revision
    revision = Revision(
        post_id=post.id,
        content=post_data.content
    )
    session.add(revision)
    session.commit()

    return post.id


def get_post_by_id(session: Session, post_id: int):
    """
    Retrieve a post along with its latest revision.
    """
    post = session.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    latest_revision = (
        session.query(Revision)
        .filter(Revision.post_id == post.id)
        .order_by(Revision.created_at.desc())
        .first()
    )

    return {
        "id": post.id,
        "handle": post.handle,
        "slug": post.slug,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "byline": post.byline,
        "revision": {
            "id": latest_revision.id,
            "content": latest_revision.content,
            "created_at": latest_revision.created_at
        }
    }


def get_post_by_slug(session: Session, handle: str, slug: str):
    """
    Retrieve a post by handle and slug with its latest revision.
    """
    post = session.query(Post).filter(
        Post.handle.ilike(handle),
        Post.slug.ilike(slug)
    ).first()

    if not post:
        return None

    latest_revision = (
        session.query(Revision)
        .filter(Revision.post_id == post.id)
        .order_by(Revision.created_at.desc())
        .first()
    )

    return {
        "id": post.id,
        "handle": post.handle,
        "slug": post.slug,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "byline": post.byline,
        "revision": {
            "id": latest_revision.id,
            "content": latest_revision.content,
            "created_at": latest_revision.created_at
        }
    }