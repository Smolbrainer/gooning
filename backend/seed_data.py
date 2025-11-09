"""
Seed script to populate the Supabase database with sample meme data
Run this after setting up the database schema
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY in your .env file")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sample meme data with keywords and placeholder video URLs
SAMPLE_MEMES = [
    {
        "name": "Stonks",
        "description": "The classic stonks meme featuring a businessman in front of rising stocks",
        "keywords": ["stonks", "stocks", "investing", "investment", "market", "trading", "profit"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "finance",
        "popularity_score": 95
    },
    {
        "name": "This Is Fine",
        "description": "Dog sitting in burning room saying 'this is fine'",
        "keywords": ["this is fine", "fire", "burning", "chaos", "disaster", "everything is fine", "fine dog"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "reaction",
        "popularity_score": 90
    },
    {
        "name": "Drake Hotline Bling",
        "description": "Drake disapproving and approving meme template",
        "keywords": ["drake", "hotline bling", "prefer", "no thanks", "yes please", "disapprove", "approve"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "comparison",
        "popularity_score": 88
    },
    {
        "name": "Distracted Boyfriend",
        "description": "Man looking at another woman while his girlfriend looks disapproving",
        "keywords": ["distracted boyfriend", "looking at other girl", "jealous girlfriend", "distraction", "cheating"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "comparison",
        "popularity_score": 85
    },
    {
        "name": "Surprised Pikachu",
        "description": "Pikachu with a surprised expression",
        "keywords": ["surprised pikachu", "pikachu", "shocked", "unexpected", "surprise", "pokemon"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "reaction",
        "popularity_score": 92
    },
    {
        "name": "Woman Yelling at Cat",
        "description": "Woman yelling at confused white cat at dinner table",
        "keywords": ["woman yelling at cat", "confused cat", "dinner table", "arguing", "smudge the cat"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "reaction",
        "popularity_score": 87
    },
    {
        "name": "Bernie Sanders Mittens",
        "description": "Bernie Sanders sitting with mittens at inauguration",
        "keywords": ["bernie sanders", "mittens", "inauguration", "bernie mittens", "sitting bernie"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "general",
        "popularity_score": 80
    },
    {
        "name": "Expanding Brain",
        "description": "Brain expanding through multiple levels of enlightenment",
        "keywords": ["expanding brain", "galaxy brain", "enlightened", "smart", "intelligence", "big brain"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "comparison",
        "popularity_score": 83
    },
    {
        "name": "Roll Safe",
        "description": "Man tapping head with confident expression",
        "keywords": ["roll safe", "think about it", "cant", "if you", "big brain", "smart thinking"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "reaction",
        "popularity_score": 78
    },
    {
        "name": "Press F to Pay Respects",
        "description": "Call of Duty funeral scene meme",
        "keywords": ["press f", "pay respects", "f in chat", "rip", "respects", "funeral"],
        "video_url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        "category": "gaming",
        "popularity_score": 86
    }
]

def seed_database():
    """Insert sample memes into the database"""
    print("Starting database seeding...")

    try:
        # Check if memes already exist
        existing = supabase.table("memes").select("id").limit(1).execute()

        if existing.data:
            print("Database already contains memes. Skipping seed.")
            print("To re-seed, delete all memes first.")
            return

        # Insert all sample memes
        print(f"Inserting {len(SAMPLE_MEMES)} sample memes...")
        response = supabase.table("memes").insert(SAMPLE_MEMES).execute()

        print(f"Successfully seeded {len(response.data)} memes!")
        print("\nSeeded memes:")
        for meme in response.data:
            print(f"  - {meme['name']} (ID: {meme['id']})")

    except Exception as e:
        print(f"Error seeding database: {e}")
        raise

if __name__ == "__main__":
    seed_database()
