from fastapi import FastAPI, HTTPException, Request, Path
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from markdown import markdown

from db import get_page, save_page, verify_or_register_handle, get_backlinks
from schema import PublishRequest
from utils.licenses import license_allows_riffing

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

@app.get("/api/page/{handle}/{slug}")
async def api_get_page(handle: str, slug: str):
    page = get_page(handle, slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@app.post("/api/page/{handle}/{slug}")
async def api_publish_page(
    payload: PublishRequest,
    handle: str = Path(...),
    slug: str = Path(...)
):
    verify_or_register_handle(handle, payload.public_key, payload.signature)
    save_page(handle, slug, payload)
    return {"status": "ok"}

@app.get("/{handle}/{slug}", response_class=HTMLResponse)
async def serve_page(request: Request, handle: str, slug: str):
    page = get_page(handle, slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    allow_riff = license_allows_riffing(page["license"])
    backlinks = get_backlinks(handle, slug)

    return templates.TemplateResponse("page.html", {
        "request": request,
        "page": page,
        "allow_riff": allow_riff,
        "backlinks": backlinks
    })