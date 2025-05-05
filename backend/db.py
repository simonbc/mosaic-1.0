from fastapi import HTTPException
import sqlite3
from schema import PublishRequest

from utils.crypto import verify_signature

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature

conn = sqlite3.connect("published.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS handles (
    handle TEXT PRIMARY KEY,
    public_key TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT,
    slug TEXT,
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    byline TEXT,
    license TEXT
)
""")

cursor.execute("""
CREATE UNIQUE INDEX IF NOT EXISTS idx_handle_slug ON pages(handle, slug)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

def save_page(page: PublishRequest):
    # Check if the page already exists
    cursor.execute("SELECT id FROM pages WHERE LOWER(slug) = LOWER(?)", (page.slug,))
    existing = cursor.fetchone()

    if existing:
        page_id = existing[0]
    else:
        cursor.execute("""
        INSERT INTO pages (
            handle, slug, title, byline, license
        ) VALUES (?, ?, ?, ?, ?)
        """, (
            page.handle,
            page.slug,
            page.title,
            page.byline,
            page.license
        ))
        page_id = cursor.lastrowid
        conn.commit()

    # Check if the content has changed
    cursor.execute("""
    SELECT content FROM revisions
    WHERE page_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    """, (page_id,))
    last_revision = cursor.fetchone()
    if last_revision and last_revision[0] == page.content:
        return  # Skip saving a duplicate revision

    revision = {
        "page_id": page_id,
        "content": page.content
    }
    save_revision(revision)

def get_page(handle: str, slug: str):
    cursor.execute("""
    SELECT
        p.handle, p.slug, p.title, p.created_at, p.updated_at, p.byline, p.license,
        r.id, r.content, r.created_at
    FROM pages p
    JOIN revisions r ON r.page_id = p.id
    WHERE LOWER(p.handle) = LOWER(?)
    AND LOWER(p.slug) = LOWER(?)
    AND r.created_at = (
        SELECT MAX(created_at)
        FROM revisions
        WHERE page_id = p.id
    )
    """, (handle, slug,))
    row = cursor.fetchone()
    if row:
        return {
            "handle": row[0],
            "slug": row[1],
            "title": row[2],
            "created_at": row[3],
            "updated_at": row[4],
            "byline": row[5],
            "license": row[6],
            "revision": {
                "id": row[7],
                "content": row[8],
                "created_at": row[9]
            }
        }
    return None

def save_revision(revision):
    cursor.execute("""
    INSERT INTO revisions (
        page_id, content
    ) VALUES (?, ?)
    """, (
        revision["page_id"],
        revision["content"]
    ))
    conn.commit()


def get_revisions_by_page_id(page_id: str):
    cursor.execute("""
    SELECT id, content, created_at
    FROM revisions
    WHERE page_id = ?
    ORDER BY created_at DESC
    """, (page_id,))
    rows = cursor.fetchall()
    return [{
        "id": row[0],
        "content": row[1],
        "created_at": row[2]
    } for row in rows]


def verify_or_register_handle(payload):
    message = payload.handle.encode('utf-8')

    cursor.execute("SELECT public_key FROM handles WHERE LOWER(handle) = LOWER(?)", (payload.handle,))
    existing = cursor.fetchone()

    if existing:
        stored_public_key = existing[0]
        if not verify_signature(message, payload.signature, stored_public_key):
            raise HTTPException(status_code=403, detail="Invalid signature")
    else:
        if not payload.public_key:
            raise HTTPException(status_code=400, detail="Missing public key for new handle")

        cursor.execute(
            "INSERT INTO handles (handle, public_key) VALUES (?, ?)",
            (payload.handle.lower(), payload.public_key)
        )
        conn.commit()