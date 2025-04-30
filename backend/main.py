from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from markdown import markdown

from db import get_page_by_slug, save_page
from schema import PublishRequest

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def datetimeformat(value):
    if isinstance(value, datetime):
        return value.strftime("%B %d, %Y")
    elif isinstance(value, str):
        try:
            return datetime.fromisoformat(value).strftime("%B %d, %Y")
        except ValueError:
            return value
    return value

templates.env.filters['datetimeformat'] = datetimeformat
templates.env.filters['markdown'] = markdown

@app.post("/publish")
async def publish_page(payload: PublishRequest):
    try:
        save_page(payload)
        return {"status": "ok", "slug": payload.slug}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/{slug}", response_class=HTMLResponse)
async def serve_page(request: Request, slug: str):
    page = get_page_by_slug(slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return templates.TemplateResponse("page.html", {"request": request, "page": page})