"""
Database models for Meme Detector
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Meme(Base):
    """Meme model representing a meme in the database"""
    __tablename__ = "memes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    keywords = Column(JSON, nullable=False)  # Array of strings stored as JSON
    template_image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=False)
    category = Column(String, nullable=True, index=True)
    popularity_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "keywords": self.keywords,
            "template_image_url": self.template_image_url,
            "video_url": self.video_url,
            "category": self.category,
            "popularity_score": self.popularity_score,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class UserSelection(Base):
    """User selections model (optional, for tracking)"""
    __tablename__ = "user_selections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    meme_ids = Column(JSON, nullable=False)  # Array of meme IDs
    settings = Column(JSON, nullable=True)  # User settings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "meme_ids": self.meme_ids,
            "settings": self.settings,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
