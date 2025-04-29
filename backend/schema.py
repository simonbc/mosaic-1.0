from pydantic import BaseModel
from typing import Optional

class PublishRequest(BaseModel):
    title: str
    slug: str
    content: str
    created_at: int
    updated_at: int
    byline: Optional[str] = None
    license: Optional[str] = None