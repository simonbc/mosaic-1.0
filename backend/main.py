from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from markdown import markdown

from db import get_page, save_page, verify_or_register_handle
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
    verify_or_register_handle(payload)
    save_page(payload)
    return {"status": "ok"}

@app.get("/{handle}/{slug}", response_class=HTMLResponse)
async def serve_page(request: Request, handle: str, slug: str):
    page = get_page(handle, slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return templates.TemplateResponse("page.html", {"request": request, "page": page})