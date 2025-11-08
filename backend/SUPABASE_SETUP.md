# 🗄️ Supabase PostgreSQL Setup Guide

Your Meme Detector backend is now configured to use **Supabase PostgreSQL** instead of SQLite!

## ✅ What's Changed

- ✅ Updated `requirements.txt` with PostgreSQL drivers (`asyncpg`, `psycopg2-binary`)
- ✅ Configured `.env` with your Supabase connection string
- ✅ Updated `database.py` with PostgreSQL connection pooling
- ✅ Created setup scripts for easy initialization

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

**macOS/Linux:**
```bash
cd backend
./setup_supabase.sh
```

**Windows:**
```bash
cd backend
setup_supabase.bat
```

This will:
1. Create virtual environment
2. Install all dependencies including PostgreSQL drivers
3. Initialize database tables
4. Seed with 20 popular memes

### Option 2: Manual Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Initialize database and seed data
python seed_data.py seed

# Start server
python -m app.main
```

## 🔗 Connection Details

Your Supabase connection is configured in `.env`:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:goonhacks2025@db.zlotbgolmmuggqpmckyx.supabase.co:5432/postgres
```

**Connection Components:**
- **Host**: `db.zlotbgolmmuggqpmckyx.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `goonhacks2025`
- **Driver**: `asyncpg` (async PostgreSQL driver)

## 📊 Database Schema

The following tables will be created in your Supabase database:

### `memes` Table
```sql
CREATE TABLE memes (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    keywords JSON NOT NULL,
    template_image_url VARCHAR,
    video_url VARCHAR NOT NULL,
    category VARCHAR,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### `user_selections` Table (Optional)
```sql
CREATE TABLE user_selections (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    meme_ids JSON NOT NULL,
    settings JSON,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🌱 Seeding Data

The seed script will populate your database with 20 popular memes:

```bash
python seed_data.py seed
```

To view all memes in the database:
```bash
python seed_data.py list
```

## 🔍 Verifying Connection

### 1. Check in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Table Editor**
4. You should see `memes` table with 20 rows

### 2. Test API Endpoint

After starting the server:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/memes
```

### 3. Check Logs

Start the server and watch for:
```
✅ Database initialized
🚀 Meme Detector API running on http://localhost:3000
```

## 🎯 Advantages of Supabase/PostgreSQL

### vs SQLite:
- ✅ **Remote Access**: Database accessible from anywhere
- ✅ **Concurrent Connections**: Multiple users simultaneously
- ✅ **Better Performance**: Optimized for production workloads
- ✅ **Automatic Backups**: Built-in by Supabase
- ✅ **Scalability**: Handles more data and traffic
- ✅ **Real-time Features**: Supabase provides real-time subscriptions
- ✅ **Built-in Auth**: Can integrate Supabase authentication

## 🔧 Configuration

### Connection Pooling

PostgreSQL connections are pooled for efficiency (configured in `database.py`):

```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,          # Maintain 5 connections
    max_overflow=10,      # Allow up to 10 overflow connections
    pool_pre_ping=True    # Check connection health
)
```

### Environment Variables

Edit `.env` to configure:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=3000

# Database (already configured)
DATABASE_URL=postgresql+asyncpg://...

# CORS
CORS_ORIGINS=["http://localhost:3000", "chrome-extension://*"]
```

## 🐛 Troubleshooting

### Connection Error: "password authentication failed"

Check that your password is correct in `.env`:
```bash
DATABASE_URL=postgresql+asyncpg://postgres:goonhacks2025@...
```

### Connection Error: "could not connect to server"

1. Check Supabase project status (might be paused)
2. Verify host name is correct
3. Check firewall/network settings
4. Ensure port 5432 is not blocked

### Module Not Found: asyncpg

Install PostgreSQL dependencies:
```bash
pip install asyncpg psycopg2-binary
```

### Tables Not Created

Manually create tables:
```bash
python -c "import asyncio; from app.database import init_db; asyncio.run(init_db())"
```

### Seed Data Failed

Check database connection first:
```bash
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('DATABASE_URL'))"
```

## 📈 Monitoring in Supabase

### View Database Activity

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Logs**
3. Monitor queries and connections

### Check Table Data

1. Go to **Table Editor**
2. Select `memes` table
3. View all records

### SQL Editor

Run custom queries in **SQL Editor**:

```sql
-- Count memes by category
SELECT category, COUNT(*)
FROM memes
GROUP BY category;

-- Top 5 popular memes
SELECT name, popularity_score
FROM memes
ORDER BY popularity_score DESC
LIMIT 5;

-- Search for specific keywords
SELECT name, keywords
FROM memes
WHERE keywords::text LIKE '%drake%';
```

## 🔐 Security Best Practices

### 1. Never Commit .env File

The `.env` file contains your database password. Add to `.gitignore`:
```bash
.env
```

### 2. Use Environment Variables

For production deployment, use environment variables instead of `.env` file.

### 3. Rotate Passwords

Regularly update your database password in Supabase dashboard.

### 4. Enable Row-Level Security

In Supabase, enable RLS for production:
```sql
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
```

## 🚀 Production Deployment

### Deploy to Heroku/Railway/Render

1. Set environment variable:
   ```bash
   DATABASE_URL=postgresql+asyncpg://postgres:goonhacks2025@db.zlotbgolmmuggqpmckyx.supabase.co:5432/postgres
   ```

2. Deploy your backend

3. No database file needed - uses Supabase!

### Deploy to Vercel/Netlify (Serverless)

Supabase works perfectly with serverless functions:

```python
from app.database import get_db, init_db

# Initialize tables on cold start
await init_db()
```

## 📊 Performance Tips

### 1. Add Indexes

For better query performance:

```sql
CREATE INDEX idx_memes_category ON memes(category);
CREATE INDEX idx_memes_popularity ON memes(popularity_score DESC);
```

### 2. Connection Pooling

Already configured with optimal settings for Supabase.

### 3. Query Optimization

Use `.filter()` and `.limit()` in SQLAlchemy queries.

## 🆘 Getting Help

### Supabase Support

- **Dashboard**: https://supabase.com/dashboard
- **Docs**: https://supabase.com/docs
- **Status**: https://status.supabase.com

### Backend Issues

- Check logs: `python -m app.main` (watch console output)
- Test connection: `curl http://localhost:3000/api/health`
- Verify `.env` configuration

## ✅ Verification Checklist

- [ ] Dependencies installed (`asyncpg`, `psycopg2-binary`)
- [ ] `.env` file configured with Supabase URL
- [ ] Database tables created (`memes` table exists)
- [ ] Seed data loaded (20 memes in database)
- [ ] API server starts without errors
- [ ] Health check returns success: `GET /api/health`
- [ ] Memes endpoint works: `GET /api/memes`

## 🎉 You're All Set!

Your Meme Detector backend is now running on **Supabase PostgreSQL**!

Start the server:
```bash
./start.sh      # macOS/Linux
start.bat       # Windows
```

Visit: http://localhost:3000/docs

---

**Next Steps:**
1. Start the backend
2. Load Chrome extension
3. Start detecting memes! 🎭
