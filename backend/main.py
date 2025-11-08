from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from typing import List
from uuid import UUID
import os
from dotenv import load_dotenv

from database import get_db
from models import (
    Meme, MemeCreate, UserSelection, UserSelectionUpdate,
    VideoResponse, HealthResponse
)

load_dotenv()

app = FastAPI(
    title="Meme Detector API",
    description="Backend API for Meme Detector Chrome Extension",
    version="1.0.0"
)

# CORS configuration for Chrome extension
origins = os.getenv("CORS_ORIGINS", "chrome-extension://*,http://localhost:*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check"""
    return HealthResponse(status="ok", message="Meme Detector API is running")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="healthy", message="API is operational")

@app.get("/api/memes", response_model=List[Meme])
async def get_memes(
    category: str = None,
    limit: int = 100,
    db: Client = Depends(get_db)
):
    """
    Fetch all memes or filter by category

    Args:
        category: Optional category filter
        limit: Maximum number of memes to return (default: 100)
        db: Supabase client

    Returns:
        List of memes
    """
    try:
        query = db.table("memes").select("*")

        if category:
            query = query.eq("category", category)

        query = query.order("popularity_score", desc=True).limit(limit)

        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch memes: {str(e)}")

@app.get("/api/memes/{meme_id}", response_model=Meme)
async def get_meme(meme_id: UUID, db: Client = Depends(get_db)):
    """
    Fetch a single meme by ID

    Args:
        meme_id: UUID of the meme
        db: Supabase client

    Returns:
        Single meme object
    """
    try:
        response = db.table("memes").select("*").eq("id", str(meme_id)).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Meme not found")

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch meme: {str(e)}")

@app.get("/api/video/{meme_id}", response_model=VideoResponse)
async def get_video(meme_id: UUID, db: Client = Depends(get_db)):
    """
    Fetch video URL for a specific meme

    Args:
        meme_id: UUID of the meme
        db: Supabase client

    Returns:
        Video URL and metadata
    """
    try:
        response = db.table("memes").select("id, name, video_url").eq("id", str(meme_id)).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Meme not found")

        meme = response.data[0]
        return VideoResponse(
            video_url=meme["video_url"],
            meme_id=meme["id"],
            meme_name=meme["name"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch video: {str(e)}")

@app.post("/api/memes", response_model=Meme, status_code=201)
async def create_meme(meme: MemeCreate, db: Client = Depends(get_db)):
    """
    Create a new meme (admin endpoint)

    Args:
        meme: Meme creation data
        db: Supabase client

    Returns:
        Created meme object
    """
    try:
        response = db.table("memes").insert(meme.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create meme: {str(e)}")

@app.get("/api/user-selections/{user_id}", response_model=UserSelection)
async def get_user_selections(user_id: str, db: Client = Depends(get_db)):
    """
    Get user's meme selections

    Args:
        user_id: User identifier (browser fingerprint)
        db: Supabase client

    Returns:
        User selection object
    """
    try:
        response = db.table("user_selections").select("*").eq("user_id", user_id).execute()

        if not response.data:
            # Return empty selection if user hasn't saved any yet
            return {
                "id": "00000000-0000-0000-0000-000000000000",
                "user_id": user_id,
                "meme_ids": [],
                "settings": {},
                "updated_at": "2024-01-01T00:00:00Z"
            }

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user selections: {str(e)}")

@app.post("/api/user-selections", response_model=UserSelection)
async def update_user_selections(
    selection: UserSelectionUpdate,
    db: Client = Depends(get_db)
):
    """
    Create or update user's meme selections

    Args:
        selection: User selection data
        db: Supabase client

    Returns:
        Updated user selection object
    """
    try:
        # Check if user selection exists
        existing = db.table("user_selections").select("*").eq("user_id", selection.user_id).execute()

        data = {
            "user_id": selection.user_id,
            "meme_ids": [str(mid) for mid in selection.meme_ids],
            "settings": selection.settings
        }

        if existing.data:
            # Update existing
            response = db.table("user_selections").update(data).eq("user_id", selection.user_id).execute()
        else:
            # Insert new
            response = db.table("user_selections").insert(data).execute()

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user selections: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(app, host=host, port=port)
