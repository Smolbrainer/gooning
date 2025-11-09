# Meme Detector Backend API

FastAPI backend for the Meme Detector Chrome Extension, using Supabase for data storage.

## Setup Instructions

### 1. Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to find your:
   - Project URL (SUPABASE_URL)
   - Anon public key (SUPABASE_KEY)
3. Go to SQL Editor and run the contents of `supabase_schema.sql`

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-anon-key-here
```

### 4. Seed Sample Data

```bash
python seed_data.py
```

This will populate your database with 10 sample memes.

### 5. Start the API Server

```bash
# Using the start script
chmod +x start.sh
./start.sh

# Or manually
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /` - Root health check
- `GET /health` - Health status

### Memes
- `GET /api/memes` - Get all memes (optional: ?category=finance&limit=50)
- `GET /api/memes/{meme_id}` - Get single meme by ID
- `POST /api/memes` - Create new meme (admin)
- `GET /api/video/{meme_id}` - Get video URL for meme

### User Selections
- `GET /api/user-selections/{user_id}` - Get user's selected memes
- `POST /api/user-selections` - Save user's meme selections

## Testing the API

```bash
# Get all memes
curl http://localhost:8000/api/memes

# Get single meme (replace with actual UUID from your database)
curl http://localhost:8000/api/memes/{meme-uuid}

# Get video URL
curl http://localhost:8000/api/video/{meme-uuid}
```

## Development

### Project Structure

```
backend/
├── main.py              # FastAPI application and routes
├── models.py            # Pydantic models
├── database.py          # Supabase client setup
├── requirements.txt     # Python dependencies
├── seed_data.py         # Database seeding script
├── supabase_schema.sql  # Database schema
├── .env.example         # Environment variables template
├── .env                 # Your local environment (not in git)
└── README.md            # This file
```

### Adding New Memes

You can add memes via the API or directly in Supabase:

```bash
curl -X POST http://localhost:8000/api/memes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Meme",
    "description": "Description here",
    "keywords": ["keyword1", "keyword2"],
    "video_url": "https://example.com/video.mp4",
    "category": "general",
    "popularity_score": 50
  }'
```

## Troubleshooting

**Connection errors**: Make sure your Supabase credentials in `.env` are correct

**Port already in use**: Change `API_PORT` in `.env` to a different port

**Database errors**: Verify the schema was created by running `supabase_schema.sql`

## Notes for Production

- Replace placeholder video URLs with real meme videos
- Set specific CORS origins instead of wildcard
- Add authentication for admin endpoints
- Consider rate limiting
- Add proper logging and monitoring
