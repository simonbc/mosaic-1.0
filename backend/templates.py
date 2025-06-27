import json
from pathlib import Path
from datetime import datetime
from markdown import markdown

from fastapi import Request
from fastapi.templating import Jinja2Templates

from utils.markdown import excerpt_md

templates = Jinja2Templates(directory="templates")
templates.env.filters['datetimeformat'] = lambda value: (
    value.strftime("%-I:%M %p · %d %B %Y") if isinstance(value, datetime)
    else datetime.fromisoformat(value).strftime("%d %B %Y · %H:%M")
    if isinstance(value, str) and value else value
)
templates.env.filters['markdown'] = markdown
templates.env.filters["excerpt_md"] = excerpt_md

def get_vite_assets():
    manifest_path = Path("../frontend/dist/.vite/manifest.json")
    manifest = json.loads(manifest_path.read_text())
    entry = manifest["index.html"]
    return {
        "js_file": entry["file"],
        "css_file": entry.get("css", [None])[0]
    }

def render_template(template_name: str, request: Request, context: dict = {}):
    assets = get_vite_assets()
    ctx = {**context, "request": request, "js_file": assets["js_file"]}
    if assets.get("css_file"):
        ctx["css_file"] = assets["css_file"]
    return templates.TemplateResponse(template_name, ctx)
