import os
import sqlite3
from schema import PublishRequest
from fastapi import HTTPException

from utils.crypto import verify_signature

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature

import json

DB_PATH = (
    "/data/published.db"
    if os.getenv("FLY_ENV") == "production"
    else os.path.join(os.path.dirname(__file__), "published.db")
)

conn = sqlite3.connect(DB_PATH)

conn = sqlite3.connect("published.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS handles (
    handle TEXT PRIMARY KEY,
    public_key TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT,
    slug TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    byline TEXT
)
""")

cursor.execute("""
CREATE UNIQUE INDEX IF NOT EXISTS idx_handle_slug ON posts(handle, slug)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

def save_post(handle: str, slug: str, post: PublishRequest):
    # Check if the post already exists
    cursor.execute("SELECT id FROM posts WHERE LOWER(handle) = LOWER(?) AND LOWER(slug) = LOWER(?)", (handle, slug,))
    existing = cursor.fetchone()

    if existing:
        post_id = existing[0]
    else:
        cursor.execute("""
        INSERT INTO posts (
            handle, slug, byline
        ) VALUES (?, ?, ?)
        """, (
            handle,
            slug,
            post.byline
        ))
        post_id = cursor.lastrowid
        conn.commit()

    # Check if the content has changed
    cursor.execute("""
        SELECT content FROM revisions
        WHERE post_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    """, (post_id,))
    last_revision = cursor.fetchone()
    if last_revision and last_revision[0] == post.content:
        return post_id  # Skip saving a duplicate revision

    revision = {
        "post_id": post_id,
        "content": post.content
    }
    save_revision(revision)
    return post_id

def get_post(id: int):
    cursor.execute("""
    SELECT
        p.id, p.handle, p.slug, p.created_at, p.updated_at, p.byline,
        r.id, r.content, r.created_at
    FROM posts p
    JOIN revisions r ON r.post_id = p.id
    WHERE p.id = ?
    AND r.created_at = (
        SELECT MAX(created_at)
        FROM revisions
        WHERE post_id = p.id
    )
    """, (id,))
    row = cursor.fetchone()
    if row:
        return {
            "id": row[0],
            "handle": row[1],
            "slug": row[2],
            "created_at": row[3],
            "updated_at": row[4],
            "byline": row[5],
            "revision": {
                "id": row[6],
                "content": row[7],
                "created_at": row[8]
            },
        }
    
    return None

def save_revision(revision):
    cursor.execute("""
        INSERT INTO revisions (
            post_id, content
        ) VALUES (?, ?)
    """, (
        revision["post_id"],
        revision["content"]
    ))
    conn.commit()

def get_post_by_slug(handle: str, slug: str):
    cursor.execute("""
        SELECT
            p.id, p.handle, p.slug, p.created_at, p.updated_at, p.byline,
            r.id, r.content, r.created_at
        FROM posts p
        JOIN revisions r ON r.id = (
            SELECT id FROM revisions
            WHERE post_id = p.id
            ORDER BY id DESC
            LIMIT 1
        )
        WHERE LOWER(p.handle) = LOWER(?)
        AND LOWER(p.slug) = LOWER(?)
    """, (handle, slug,))
    row = cursor.fetchone()
    if row:
        return {
            "id": row[0],
            "handle": row[1],
            "slug": row[2],
            "created_at": row[3],
            "updated_at": row[4],
            "byline": row[5],
            "revision": {
                "id": row[6],
                "content": row[7],
                "created_at": row[8]
            }
        }

    return None

def verify_or_register_handle(handle, public_key, signature):
    message = handle.encode('utf-8')

    cursor.execute("SELECT public_key FROM handles WHERE LOWER(handle) = LOWER(?)", (handle,))
    existing = cursor.fetchone()

    if existing:
        stored_public_key = existing[0]
        print("Stored public key:", stored_public_key)
        if not verify_signature(message, signature, stored_public_key):
            raise HTTPException(status_code=403, detail="Invalid signature")
    else:
        if not public_key:
            raise HTTPException(status_code=400, detail="Missing public key for new handle")

        cursor.execute(
            "INSERT INTO handles (handle, public_key) VALUES (?, ?)",
            (handle.lower(), public_key)
        )
        conn.commit()