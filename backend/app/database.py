"""
Database configuration and session management
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from app.models import Base

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/memes.db")

# Create async engine
# Use StaticPool for SQLite to avoid threading issues
# For PostgreSQL, use default pooling
if "sqlite" in DATABASE_URL:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    # PostgreSQL configuration
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True  # Enable connection health checks
    )

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """Initialize database - create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
