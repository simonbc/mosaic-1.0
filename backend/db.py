import sqlite3
from schema import PublishRequest

conn = sqlite3.connect("published.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT,
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    byline TEXT,
    license TEXT
)
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
            slug, title, byline, license
        ) VALUES (?, ?, ?, ?)
        """, (
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

def get_page_by_slug(slug: str):
    cursor.execute("""
    SELECT
        p.slug, p.title, p.created_at, p.updated_at, p.byline, p.license,
        r.id, r.content, r.created_at
    FROM pages p
    JOIN revisions r ON r.page_id = p.id
    WHERE LOWER(p.slug) = LOWER(?)
    AND r.created_at = (
        SELECT MAX(created_at)
        FROM revisions
        WHERE page_id = p.id
    )
    """, (slug,))
    row = cursor.fetchone()
    if row:
        return {
            "slug": row[0],
            "title": row[1],
            "created_at": row[2],
            "updated_at": row[3],
            "byline": row[4],
            "license": row[5],
            "revision": {
                "id": row[6],
                "content": row[7],
                "created_at": row[8]
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