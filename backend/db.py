import sqlite3
from schema import PublishRequest

conn = sqlite3.connect("published.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS pages (
    slug TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    byline TEXT,
    license TEXT
)
""")
conn.commit()

def save_page(page: PublishRequest):
    cursor.execute("""
    INSERT OR REPLACE INTO pages (
        slug, title, content, created_at, updated_at, byline, license
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        page.slug,
        page.title,
        page.content,
        page.created_at,
        page.updated_at,
        page.byline,
        page.license
    ))
    conn.commit()


def get_page_by_slug(slug: str):
    cursor.execute("""
    SELECT slug, title, content, created_at, updated_at, byline, license
    FROM pages
    WHERE LOWER(slug) = LOWER(?)
    """, (slug,))
    row = cursor.fetchone()
    if row:
        return {
            "slug": row[0],
            "title": row[1],
            "content": row[2],
            "created_at": row[3],
            "updated_at": row[4],
            "byline": row[5],
            "license": row[6]
        }
    return None