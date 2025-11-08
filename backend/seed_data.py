"""
Database seed script
Populates the database with sample meme data
"""
import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal, init_db
from app.models import Meme


# Sample meme data with popular memes
SAMPLE_MEMES = [
    {
        "id": "drake-hotline-bling",
        "name": "Drake Hotline Bling",
        "description": "Drake rejecting something in the first panel and approving something in the second panel",
        "keywords": ["drake", "hotline bling", "no yes", "reject approve", "choice"],
        "video_url": "https://i.imgur.com/jgWFMkL.mp4",
        "category": "reaction",
        "popularity_score": 95
    },
    {
        "id": "distracted-boyfriend",
        "name": "Distracted Boyfriend",
        "description": "Man looking at another woman while his girlfriend looks on disapprovingly",
        "keywords": ["distracted boyfriend", "looking at other girl", "jealous girlfriend", "cheating"],
        "video_url": "https://i.imgur.com/8Q5WGqB.mp4",
        "category": "reaction",
        "popularity_score": 92
    },
    {
        "id": "expanding-brain",
        "name": "Expanding Brain",
        "description": "Shows increasingly enlightened stages of thinking",
        "keywords": ["expanding brain", "galaxy brain", "enlightened", "smart", "intelligence"],
        "video_url": "https://i.imgur.com/YVy7xCj.mp4",
        "category": "comparison",
        "popularity_score": 88
    },
    {
        "id": "change-my-mind",
        "name": "Change My Mind",
        "description": "Steven Crowder sitting at a table with a sign",
        "keywords": ["change my mind", "crowder", "debate", "convince me", "opinion"],
        "video_url": "https://i.imgur.com/5LQK8zP.mp4",
        "category": "opinion",
        "popularity_score": 85
    },
    {
        "id": "woman-yelling-at-cat",
        "name": "Woman Yelling at Cat",
        "description": "Woman yelling at a confused cat sitting at a table",
        "keywords": ["woman yelling at cat", "confused cat", "angry woman", "smudge", "table"],
        "video_url": "https://i.imgur.com/8KS3XT6.mp4",
        "category": "reaction",
        "popularity_score": 90
    },
    {
        "id": "this-is-fine",
        "name": "This Is Fine",
        "description": "Dog sitting in burning room saying this is fine",
        "keywords": ["this is fine", "burning", "fire", "dog", "denial", "everything is fine"],
        "video_url": "https://i.imgur.com/XqJOJSt.mp4",
        "category": "reaction",
        "popularity_score": 87
    },
    {
        "id": "spiderman-pointing",
        "name": "Spider-Man Pointing",
        "description": "Two Spider-Men pointing at each other",
        "keywords": ["spiderman pointing", "same", "identical", "copy", "duplicate"],
        "video_url": "https://i.imgur.com/6gK3oWb.mp4",
        "category": "comparison",
        "popularity_score": 83
    },
    {
        "id": "success-kid",
        "name": "Success Kid",
        "description": "Baby with clenched fist looking determined and successful",
        "keywords": ["success kid", "victory", "win", "achievement", "baby"],
        "video_url": "https://i.imgur.com/2pf8rVN.mp4",
        "category": "reaction",
        "popularity_score": 80
    },
    {
        "id": "stonks",
        "name": "Stonks",
        "description": "Meme man in front of rising stocks graph",
        "keywords": ["stonks", "stocks", "investment", "money", "profit", "loss"],
        "video_url": "https://i.imgur.com/vMqFdYk.mp4",
        "category": "finance",
        "popularity_score": 86
    },
    {
        "id": "is-this-a-pigeon",
        "name": "Is This a Pigeon?",
        "description": "Anime character pointing at butterfly asking if it's a pigeon",
        "keywords": ["is this a pigeon", "butterfly", "confused", "misidentify", "anime"],
        "video_url": "https://i.imgur.com/3hN5qMy.mp4",
        "category": "reaction",
        "popularity_score": 82
    },
    {
        "id": "roll-safe",
        "name": "Roll Safe",
        "description": "Man tapping head with smart thinking expression",
        "keywords": ["roll safe", "thinking", "smart", "genius", "big brain", "tap head"],
        "video_url": "https://i.imgur.com/QGLLvqh.mp4",
        "category": "reaction",
        "popularity_score": 81
    },
    {
        "id": "surprised-pikachu",
        "name": "Surprised Pikachu",
        "description": "Pikachu with shocked expression",
        "keywords": ["surprised pikachu", "shocked", "unexpected", "surprise", "pokemon"],
        "video_url": "https://i.imgur.com/vMNzQTw.mp4",
        "category": "reaction",
        "popularity_score": 89
    },
    {
        "id": "mocking-spongebob",
        "name": "Mocking SpongeBob",
        "description": "SpongeBob with alternating caps text to mock someone",
        "keywords": ["mocking spongebob", "alternating caps", "sarcasm", "mock", "spongebob"],
        "video_url": "https://i.imgur.com/D3HgqN7.mp4",
        "category": "reaction",
        "popularity_score": 84
    },
    {
        "id": "coffin-dance",
        "name": "Coffin Dance",
        "description": "Ghanaian pallbearers dancing with a coffin",
        "keywords": ["coffin dance", "astronomia", "funeral", "dancing pallbearers", "meme"],
        "video_url": "https://i.imgur.com/8GUJP5S.mp4",
        "category": "trending",
        "popularity_score": 93
    },
    {
        "id": "trade-offer",
        "name": "Trade Offer",
        "description": "Guy presenting a trade offer with hands",
        "keywords": ["trade offer", "i receive you receive", "exchange", "deal", "negotiation"],
        "video_url": "https://i.imgur.com/P0hRLvw.mp4",
        "category": "trending",
        "popularity_score": 78
    },
    {
        "id": "doge",
        "name": "Doge",
        "description": "Shiba Inu dog with comic sans text",
        "keywords": ["doge", "shiba inu", "such wow", "very", "much", "so"],
        "video_url": "https://i.imgur.com/xCNW4GN.mp4",
        "category": "classic",
        "popularity_score": 91
    },
    {
        "id": "pepe-frog",
        "name": "Pepe the Frog",
        "description": "Green frog character with various emotions",
        "keywords": ["pepe", "frog", "sad", "feels bad man", "rare pepe"],
        "video_url": "https://i.imgur.com/7KzYQhC.mp4",
        "category": "classic",
        "popularity_score": 88
    },
    {
        "id": "wojak",
        "name": "Wojak",
        "description": "Simple line drawing character expressing emotions",
        "keywords": ["wojak", "feels guy", "doomer", "bloomer", "emotion"],
        "video_url": "https://i.imgur.com/nGh8BVp.mp4",
        "category": "reaction",
        "popularity_score": 79
    },
    {
        "id": "rickroll",
        "name": "Rickroll",
        "description": "Rick Astley's Never Gonna Give You Up",
        "keywords": ["rickroll", "never gonna give you up", "rick astley", "prank"],
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "category": "classic",
        "popularity_score": 94
    },
    {
        "id": "hide-the-pain-harold",
        "name": "Hide the Pain Harold",
        "description": "Elderly man with forced smile hiding pain",
        "keywords": ["hide the pain harold", "harold", "forced smile", "uncomfortable", "awkward"],
        "video_url": "https://i.imgur.com/xJH9KzL.mp4",
        "category": "reaction",
        "popularity_score": 77
    }
]


async def seed_database():
    """Seed the database with sample meme data"""
    print("🌱 Starting database seed...")

    # Initialize database
    await init_db()
    print("✅ Database tables created")

    async with AsyncSessionLocal() as session:
        try:
            # Check if data already exists
            result = await session.execute(select(Meme))
            existing_memes = result.scalars().all()

            if existing_memes:
                print(f"⚠️  Database already contains {len(existing_memes)} memes")
                response = input("Do you want to clear and reseed? (yes/no): ")
                if response.lower() != 'yes':
                    print("❌ Seeding cancelled")
                    return

                # Delete existing memes
                for meme in existing_memes:
                    await session.delete(meme)
                await session.commit()
                print("🗑️  Existing data cleared")

            # Insert sample memes
            for meme_data in SAMPLE_MEMES:
                meme = Meme(**meme_data)
                session.add(meme)

            await session.commit()
            print(f"✅ Successfully seeded {len(SAMPLE_MEMES)} memes")

            # Display summary
            print("\n📊 Seed Summary:")
            result = await session.execute(select(Meme))
            all_memes = result.scalars().all()

            categories = {}
            for meme in all_memes:
                category = meme.category or "uncategorized"
                categories[category] = categories.get(category, 0) + 1

            for category, count in sorted(categories.items()):
                print(f"  - {category}: {count} memes")

            print(f"\n🎉 Total memes in database: {len(all_memes)}")

        except Exception as e:
            print(f"❌ Error seeding database: {e}")
            await session.rollback()
            raise


async def list_memes():
    """List all memes in the database"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Meme).order_by(Meme.popularity_score.desc()))
        memes = result.scalars().all()

        if not memes:
            print("No memes found in database")
            return

        print(f"\n📋 All Memes ({len(memes)} total):\n")
        for i, meme in enumerate(memes, 1):
            print(f"{i}. {meme.name} (ID: {meme.id})")
            print(f"   Category: {meme.category} | Popularity: {meme.popularity_score}")
            print(f"   Keywords: {', '.join(meme.keywords[:3])}...")
            print()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Meme database management")
    parser.add_argument(
        "command",
        choices=["seed", "list"],
        help="Command to execute (seed: populate database, list: show all memes)"
    )

    args = parser.parse_args()

    if args.command == "seed":
        asyncio.run(seed_database())
    elif args.command == "list":
        asyncio.run(list_memes())
