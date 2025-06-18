import os
from pathlib import Path
from datetime import datetime
from markdown import markdown

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse, Response
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import post, handle
from api.deps import get_db
from services import post_service


app = FastAPI()

# Redirect www.mosaic.pub to mosaic.pub
from fastapi.responses import RedirectResponse
from urllib.parse import urlparse, urlunparse

@app.middleware("http")
async def redirect_www(request: Request, call_next):
    host = request.headers.get("host", "")
    if host.startswith("www."):
        url = request.url
        netloc = host.replace("www.", "", 1)
        redirected_url = url._url.replace(host, netloc, 1)
        return RedirectResponse(url=redirected_url, status_code=308)
    return await call_next(request)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")

SPA_BASE = os.getenv("SPA_BASE", "")
IS_DEV = os.getenv("IS_DEV") == "1"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(post.router, prefix="/api")
app.include_router(handle.router, prefix="/api")

# Templates
templates = Jinja2Templates(directory="templates")
templates.env.filters['datetimeformat'] = lambda value: (
    value.strftime("%-I:%M %p · %d %B %Y") if isinstance(value, datetime)
    else datetime.fromisoformat(value).strftime("%d %B %Y · %H:%M")
    if isinstance(value, str) and value else value
)
templates.env.filters['markdown'] = markdown

# Serve static files
app.mount("/static", StaticFiles(directory="../frontend/dist/static"), name="static")

# Vite client proxy
@app.get("/@vite/client", response_class=HTMLResponse)
async def serve_vite_client():
    if IS_DEV:
        import httpx
        vite_url = "http://localhost:5173/@vite/client"
        async with httpx.AsyncClient() as client:
            try:
                print(f"🔁 Proxying to Vite client: {vite_url}")
                r = await client.get(vite_url)
                return Response(
                    content=r.content,
                    status_code=r.status_code,
                    headers=dict(r.headers),
                )
            except httpx.RequestError:
                raise HTTPException(status_code=502, detail="Vite dev server not running")
    else:
        raise HTTPException(status_code=404, detail="Not found")

# SSR post route
@app.get("/@{handle}/{slug}", response_class=HTMLResponse)
async def serve_post(request: Request, handle: str, slug: str):
    db = next(get_db())
    post = post_service.get_post_by_slug(db, handle, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return templates.TemplateResponse("post.html", {
        "request": request,
        "post": post,
        "spa_base": SPA_BASE,
    })

# SPA fallback route
@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_spa(full_path: str, request: Request):
    if IS_DEV:
        import httpx
        vite_url = f"http://localhost:5173/{full_path}"
        async with httpx.AsyncClient() as client:
            try:
                print(f"🔁 Proxying to Vite: {vite_url}")
                r = await client.get(vite_url)
                return Response(
                    content=r.content,
                    status_code=r.status_code,
                    headers=dict(r.headers),
                )
            except httpx.RequestError:
                raise HTTPException(status_code=502, detail="Vite dev server not running")
    else:
        return FileResponse("../frontend/dist/index.html")