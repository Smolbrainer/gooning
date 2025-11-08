from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class Meme(BaseModel):
    """Meme model matching Supabase schema"""
    id: UUID
    name: str
    description: Optional[str] = None
    keywords: List[str]
    video_url: str
    category: str = "general"
    created_at: datetime
    popularity_score: int = 0

    class Config:
        from_attributes = True

class MemeCreate(BaseModel):
    """Model for creating a new meme"""
    name: str
    description: Optional[str] = None
    keywords: List[str]
    video_url: str
    category: str = "general"
    popularity_score: int = 0

class UserSelection(BaseModel):
    """User selection model matching Supabase schema"""
    id: UUID
    user_id: str
    meme_ids: List[UUID] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)
    updated_at: datetime

    class Config:
        from_attributes = True

class UserSelectionUpdate(BaseModel):
    """Model for updating user selections"""
    user_id: str
    meme_ids: List[UUID] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)

class VideoResponse(BaseModel):
    """Response model for video endpoint"""
    video_url: str
    meme_id: UUID
    meme_name: str

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
