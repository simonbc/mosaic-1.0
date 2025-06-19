from pydantic import BaseModel
from typing import Optional

class PublishRequest(BaseModel):
    handle: str
    slug: str
    content: str
    created_at: int
    updated_at: int
    public_key: str
    signature: str
    byline: Optional[str] = None

class HandleVerificationRequest(BaseModel):
    public_key: str
    signature: str