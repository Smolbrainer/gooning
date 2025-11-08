"""
FastAPI Meme Detector Backend
Main application with all API endpoints
"""
import os
from datetime import datetime
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from dotenv import load_dotenv

from app.database import get_db, init_db
from app.models import Meme
from app.schemas import (
    MemesListResponse,
    MemeDetailResponse,
    MemeResponse,
    DetectionRequest,
    DetectionResponse,
    DetectionMatch,
    VideoUrlResponse,
    HealthResponse,
    ErrorResponse
)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Meme Detector API",
    description="Backend API for Meme Detector Chrome Extension",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Chrome extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()
    print("✅ Database initialized")
    print(f"🚀 Meme Detector API running on http://localhost:{os.getenv('API_PORT', 3000)}")


@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "Meme Detector API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "memes": "/api/memes",
            "meme_detail": "/api/memes/{id}",
            "detect": "/api/detect",
            "video": "/api/video/{memeId}"
        }
    }


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0"
    )


@app.get("/api/memes", response_model=MemesListResponse)
async def get_memes(
    category: str = None,
    search: str = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all available memes

    Query Parameters:
    - category: Filter by category
    - search: Search in name or keywords
    - limit: Maximum number of results (default: 100)
    """
    try:
        query = select(Meme)

        # Apply filters
        if category:
            query = query.where(Meme.category == category)

        if search:
            search_term = f"%{search.lower()}%"
            query = query.where(
                or_(
                    Meme.name.ilike(search_term),
                    Meme.description.ilike(search_term)
                )
            )

        # Order by popularity
        query = query.order_by(Meme.popularity_score.desc()).limit(limit)

        result = await db.execute(query)
        memes = result.scalars().all()

        return MemesListResponse(
            memes=[MemeResponse(**meme.to_dict()) for meme in memes]
        )

    except Exception as e:
        print(f"Error fetching memes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch memes: {str(e)}"
        )


@app.get("/api/memes/{meme_id}", response_model=MemeDetailResponse)
async def get_meme_by_id(
    meme_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific meme by ID

    Path Parameters:
    - meme_id: The unique identifier of the meme
    """
    try:
        query = select(Meme).where(Meme.id == meme_id)
        result = await db.execute(query)
        meme = result.scalar_one_or_none()

        if not meme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meme with id '{meme_id}' not found"
            )

        return MemeDetailResponse(
            meme=MemeResponse(**meme.to_dict())
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching meme: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch meme: {str(e)}"
        )


@app.post("/api/detect", response_model=DetectionResponse)
async def detect_memes(
    request: DetectionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Detect memes in provided content

    Request Body:
    - content: Text content to analyze
    - imageUrls: Array of image URLs to analyze (optional)

    Returns matches with confidence scores
    """
    try:
        matches = []
        content_lower = request.content.lower()

        # Get all memes
        query = select(Meme)
        result = await db.execute(query)
        memes = result.scalars().all()

        # Simple keyword matching algorithm
        for meme in memes:
            if not meme.keywords:
                continue

            matched_keywords = 0
            total_keywords = len(meme.keywords)

            for keyword in meme.keywords:
                keyword_lower = keyword.lower()
                if keyword_lower in content_lower:
                    matched_keywords += 1

            # Calculate confidence based on keyword match ratio
            if matched_keywords > 0:
                confidence = min((matched_keywords / total_keywords) * 1.2, 1.0)

                matches.append(
                    DetectionMatch(
                        memeId=meme.id,
                        confidence=round(confidence, 2)
                    )
                )

        # Sort by confidence (highest first)
        matches.sort(key=lambda x: x.confidence, reverse=True)

        return DetectionResponse(matches=matches)

    except Exception as e:
        print(f"Error detecting memes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect memes: {str(e)}"
        )


@app.get("/api/video/{meme_id}", response_model=VideoUrlResponse)
async def get_video_url(
    meme_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get video URL for a specific meme

    Path Parameters:
    - meme_id: The unique identifier of the meme
    """
    try:
        query = select(Meme).where(Meme.id == meme_id)
        result = await db.execute(query)
        meme = result.scalar_one_or_none()

        if not meme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meme with id '{meme_id}' not found"
            )

        return VideoUrlResponse(
            videoUrl=meme.video_url,
            metadata={
                "name": meme.name,
                "category": meme.category,
                "duration": None  # Could be added if available
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching video URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch video URL: {str(e)}"
        )


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    print(f"Unhandled exception: {exc}")
    return {
        "error": "Internal server error",
        "detail": str(exc)
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("API_PORT", 3000))
    host = os.getenv("API_HOST", "0.0.0.0")

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
