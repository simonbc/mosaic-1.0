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

class HandleRegistrationRequest(BaseModel):
    handle: str
    public_key: str
    signature: str

class HandleVerificationRequest(BaseModel):
    signature: str