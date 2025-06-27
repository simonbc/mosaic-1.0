import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import post, handle
from api.deps import get_db
from services import handle_service, post_service
from migrations import run_migrations
from templates import render_template

app = FastAPI()

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

# Run Alembic migrations only in production
if os.getenv("FLY_ENV") == "production":
    try:
        run_migrations()
    except Exception as e:
        print(f"Alembic migration failed: {e}")
        raise e

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

# Serve static files
app.mount("/static", StaticFiles(directory="../frontend/dist/static"), name="static")

# SSR post route
@app.get("/@{handle}/{slug}", response_class=HTMLResponse)
async def serve_post(request: Request, handle: str, slug: str):
    db = next(get_db())
    post = post_service.get_post_by_slug(db, handle, slug)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return render_template("post.html", request, {
        "post": post
    })

# SSR handle route

@app.get("/@{handle}", response_class=HTMLResponse)
@app.get("/@{handle}/", response_class=HTMLResponse)
async def serve_handle(request: Request, handle: str):
    db = next(get_db())
    handle = handle_service.get_handle(db, handle)
    posts = post_service.get_posts_by_handle(db, handle.handle)

    if not handle:
        raise HTTPException(status_code=404, detail="Handle not found")
    
    return render_template("handle.html", request, {
        "handle": handle,
        "posts": posts
    })

@app.get("/", response_class=HTMLResponse)
async def serve_home(request: Request):
    return render_template("home.html", request)

# SPA fallback route
@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_spa(full_path: str, request: Request):
    return FileResponse("../frontend/dist/index.html")