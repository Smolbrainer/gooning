# Meme Detector Backend API

FastAPI backend for the Meme Detector Chrome Extension.

## Features

- **RESTful API** with full CRUD operations for memes
- **Async/await** support with SQLAlchemy async
- **PostgreSQL database** via Supabase (production-ready!)
- **Automatic meme detection** based on keyword matching
- **CORS enabled** for Chrome extension compatibility
- **Sample data seeding** with 20 popular memes

> 🗄️ **Now using Supabase PostgreSQL!** See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for details.

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API health status

### Get All Memes
```
GET /api/memes
Query Parameters:
  - category: Filter by category
  - search: Search in name or keywords
  - limit: Maximum results (default: 100)
```
Returns list of all available memes

### Get Meme by ID
```
GET /api/memes/{id}
```
Returns specific meme details

### Detect Memes
```
POST /api/detect
Body: {
  "content": "text to analyze",
  "imageUrls": ["url1", "url2"]
}
```
Returns detected memes with confidence scores

### Get Video URL
```
GET /api/video/{memeId}
```
Returns video URL and metadata for a meme

## Installation

### Prerequisites
- Python 3.8 or higher
- pip

### Quick Setup (Supabase PostgreSQL)

**Automated (Recommended):**
```bash
cd backend
./setup_supabase.sh    # macOS/Linux
setup_supabase.bat     # Windows
```

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed Supabase configuration.

### Manual Setup Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended)**
   ```bash
   python -m venv venv

   # Activate on macOS/Linux:
   source venv/bin/activate

   # Activate on Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # .env is already configured with Supabase
   # Or copy from example:
   cp .env.example .env
   ```

5. **Initialize and seed the database**
   ```bash
   python seed_data.py seed
   ```

6. **Run the server**
   ```bash
   python -m app.main
   ```

   Or with uvicorn directly:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
   ```

The API will be available at `http://localhost:3000`

## Database Management

### Seed Database
Populate database with sample meme data:
```bash
python seed_data.py seed
```

### List All Memes
View all memes in the database:
```bash
python seed_data.py list
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Package initializer
│   ├── main.py              # FastAPI application and routes
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic validation schemas
│   └── database.py          # Database configuration
├── data/
│   └── memes.db             # SQLite database (created on first run)
├── seed_data.py             # Database seeding script
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── .env.example             # Example environment variables
└── README.md                # This file
```

## Configuration

Edit `.env` file to configure:

- `API_HOST`: Host to bind to (default: 0.0.0.0)
- `API_PORT`: Port to run on (default: 3000)
- `DATABASE_URL`: Database connection string (default: SQLite)

## Development

### Hot Reload
The server runs with `--reload` flag by default, so changes to code will automatically restart the server.

### Testing Endpoints

Visit `http://localhost:3000/docs` for interactive API documentation (Swagger UI)

Visit `http://localhost:3000/redoc` for alternative API documentation (ReDoc)

### Test with curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get all memes
curl http://localhost:3000/api/memes

# Get specific meme
curl http://localhost:3000/api/memes/drake-hotline-bling

# Detect memes
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"content": "This is fine everything is burning"}'
```

## Adding New Memes

### Method 1: Edit seed_data.py
Add new meme entries to the `SAMPLE_MEMES` list and re-run:
```bash
python seed_data.py seed
```

### Method 2: Direct Database Insert
```python
from app.models import Meme
from app.database import AsyncSessionLocal

async def add_meme():
    async with AsyncSessionLocal() as session:
        new_meme = Meme(
            id="unique-id",
            name="Meme Name",
            description="Description",
            keywords=["keyword1", "keyword2"],
            video_url="https://example.com/video.mp4",
            category="category",
            popularity_score=50
        )
        session.add(new_meme)
        await session.commit()
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change `API_PORT` in `.env` or kill the process:
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Issues
Delete the database file and reseed:
```bash
rm data/memes.db
python seed_data.py seed
```

### CORS Issues
The API allows all origins by default. If you need stricter CORS:
Edit `app/main.py` and modify the `allow_origins` list:
```python
allow_origins=["http://localhost:3000", "chrome-extension://your-extension-id"]
```

## Production Deployment

For production use:

1. **Use PostgreSQL** instead of SQLite
   ```bash
   # Install PostgreSQL driver
   pip install asyncpg

   # Update .env
   DATABASE_URL=postgresql+asyncpg://user:pass@localhost/dbname
   ```

2. **Disable auto-reload**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 3000
   ```

3. **Use a production ASGI server**
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

4. **Set up reverse proxy** (Nginx, Caddy, etc.)

5. **Enable HTTPS** with SSL certificate

## License

MIT License - See main project LICENSE file
