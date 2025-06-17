from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from db.models import Post, Revision
from schema import PublishRequest

def save_post(session: Session, post_data: PublishRequest):
    """
    Save or update a post, and create a new revision if content changed.
    """
    try:
        stmt = select(Post).where(
            Post.handle.ilike(post_data.handle),
            Post.slug.ilike(post_data.slug)
        )
        post = session.execute(stmt).scalar_one_or_none()

        if not post:
            post = Post(
                handle=post_data.handle,
                slug=post_data.slug,
                byline=post_data.byline
            )
            session.add(post)
            session.flush()  # Ensure post.id is populated
        else:
            post.byline = post_data.byline

        revision_stmt = (
            select(Revision)
            .where(Revision.post_id == post.id)
            .order_by(desc(Revision.created_at))
            .limit(1)
        )
        last_revision = session.execute(revision_stmt).scalar_one_or_none()

        if last_revision and last_revision.content == post_data.content:
            session.commit()
            return post.id  # No new revision needed

        revision = Revision(
            post_id=post.id,
            content=post_data.content
        )
        session.add(revision)
        session.commit()

        return post.id
    except IntegrityError as e:
        session.rollback()
        raise HTTPException(status_code=409, detail="Integrity error occurred while saving post.")


def get_post_by_id(session: Session, post_id: int):
    """
    Retrieve a post along with its latest revision.
    """
    stmt = select(Post).where(Post.id == post_id)
    post = session.execute(stmt).scalar_one_or_none()
    if not post:
        return None

    revision_stmt = (
        select(Revision)
        .where(Revision.post_id == post.id)
        .order_by(desc(Revision.created_at))
        .limit(1)
    )
    latest_revision = session.execute(revision_stmt).scalar_one_or_none()

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
    stmt = select(Post).where(
        Post.handle.ilike(handle),
        Post.slug.ilike(slug)
    )
    post = session.execute(stmt).scalar_one_or_none()

    if not post:
        return None

    revision_stmt = (
        select(Revision)
        .where(Revision.post_id == post.id)
        .order_by(desc(Revision.created_at))
        .limit(1)
    )
    latest_revision = session.execute(revision_stmt).scalar_one_or_none()

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