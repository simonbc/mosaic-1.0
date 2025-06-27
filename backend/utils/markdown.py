import re

def excerpt_md(content: str, limit: int = 200) -> str:
    """
    Truncate Markdown content to a safe preview length.
    Attempts to cut on paragraph or sentence boundary, but falls back
    to cutting at word boundary within limit.
    """
    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
    excerpt = ""
    total = 0

    for para in paragraphs:
        if total + len(para) <= limit:
            excerpt += para + "\n\n"
            total += len(para)
        else:
            remaining = limit - total
            cut = para[:remaining].rsplit(" ", 1)[0] + "..."
            excerpt += cut
            break

    if not excerpt:
        # fallback: just truncate raw content
        excerpt = content[:limit].rsplit(" ", 1)[0] + "..."

    return excerpt.strip()