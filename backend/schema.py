from pydantic import BaseModel
from typing import Optional

class PublishRequest(BaseModel):
    title: str
    handle: str
    slug: str
    content: str
    created_at: int
    updated_at: int
    public_key: str
    signature: str
    byline: Optional[str] = None
    license: Optional[str] = None