"""
Pydantic schemas for request/response validation
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MemeBase(BaseModel):
    """Base meme schema"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    keywords: List[str] = Field(..., min_items=1)
    template_image_url: Optional[str] = None
    video_url: str = Field(..., min_length=1)
    category: Optional[str] = None
    popularity_score: int = Field(default=0, ge=0)


class MemeCreate(MemeBase):
    """Schema for creating a new meme"""
    id: str = Field(..., min_length=1, max_length=100)


class MemeResponse(MemeBase):
    """Schema for meme response"""
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MemesListResponse(BaseModel):
    """Schema for list of memes response"""
    memes: List[MemeResponse]


class MemeDetailResponse(BaseModel):
    """Schema for single meme response"""
    meme: MemeResponse


class DetectionRequest(BaseModel):
    """Schema for detection request"""
    content: str = Field(default="", max_length=50000)
    imageUrls: List[str] = Field(default_factory=list, max_items=50)


class DetectionMatch(BaseModel):
    """Schema for a detection match"""
    memeId: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class DetectionResponse(BaseModel):
    """Schema for detection response"""
    matches: List[DetectionMatch]


class VideoUrlResponse(BaseModel):
    """Schema for video URL response"""
    videoUrl: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    """Schema for health check response"""
    status: str
    timestamp: datetime
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    """Schema for error response"""
    error: str
    detail: Optional[str] = None
