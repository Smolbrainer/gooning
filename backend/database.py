from supabase import create_client, Client
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class SupabaseDatabase:
    """Supabase database client wrapper"""

    def __init__(self):
        self.url: str = os.getenv("SUPABASE_URL", "")
        self.key: str = os.getenv("SUPABASE_KEY", "")
        self.client: Optional[Client] = None

        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

    def connect(self) -> Client:
        """Create and return Supabase client"""
        if not self.client:
            self.client = create_client(self.url, self.key)
        return self.client

    def get_client(self) -> Client:
        """Get existing client or create new one"""
        if not self.client:
            return self.connect()
        return self.client

# Global database instance
db = SupabaseDatabase()

def get_db() -> Client:
    """Dependency for FastAPI routes"""
    return db.get_client()
