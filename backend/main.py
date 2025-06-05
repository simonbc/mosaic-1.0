from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi import Path as FastAPIPath
from fastapi.responses import HTMLResponse, FileResponse, Response
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from markdown import markdown
import os
from dotenv import load_dotenv

from db import get_post, get_post_by_slug, save_post, verify_or_register_handle
from schema import PublishRequest

load_dotenv(dotenv_path=".env")
SPA_BASE = os.getenv("SPA_BASE", "")

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets", StaticFiles(directory="../frontend/dist"), name="assets")

def datetimeformat(value):
    if isinstance(value, datetime):
        return value.strftime("%-I:%M %p · %d %B %Y")
    elif isinstance(value, str):
        try:
            return datetime.fromisoformat(value).strftime("%-I:%M · %d %B %Y")
        except ValueError:
            return value
    return value

templates.env.filters['datetimeformat'] = datetimeformat
templates.env.filters['markdown'] = markdown

@app.get("/api/post/{id}")
async def api_get_post(id: int):
    post = get_post(id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.post("/api/post/{handle}/{slug}")
async def api_publish_post(
    payload: PublishRequest,
    handle: str = FastAPIPath(...),
    slug: str = FastAPIPath(...)
):
    verify_or_register_handle(handle, payload.public_key, payload.signature)
    post_id = save_post(handle, slug, payload)
    return {"status": "ok", "id": post_id}

@app.get("/@vite/client", response_class=HTMLResponse)
async def serve_vite_client():
    if os.getenv("IS_DEV") == "1":
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

@app.get("/@{handle}/{slug}", response_class=HTMLResponse)
async def serve_post(request: Request, handle: str, slug: str):
    post = get_post_by_slug(handle, slug)
    print(post)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return templates.TemplateResponse("post.html", {
        "request": request,
        "post": post,
        "spa_base": SPA_BASE,
    })

@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_spa(full_path: str, request: Request):
    if os.getenv("IS_DEV") == "1":
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