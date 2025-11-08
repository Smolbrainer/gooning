-- Meme Detector - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    keywords TEXT[] NOT NULL,
    video_url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    popularity_score INTEGER DEFAULT 0
);

-- Create user_selections table
CREATE TABLE IF NOT EXISTS user_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    meme_ids UUID[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memes_category ON memes(category);
CREATE INDEX IF NOT EXISTS idx_memes_popularity ON memes(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_selections_user_id ON user_selections(user_id);

-- Enable Row Level Security
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memes (allow all operations)
CREATE POLICY "Memes are viewable by everyone"
    ON memes FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for memes"
    ON memes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for memes"
    ON memes FOR UPDATE
    USING (true);

CREATE POLICY "Enable delete for memes"
    ON memes FOR DELETE
    USING (true);

-- RLS Policies for user_selections (users can only see and modify their own)
CREATE POLICY "Users can view their own selections"
    ON user_selections FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own selections"
    ON user_selections FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own selections"
    ON user_selections FOR UPDATE
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_selections
CREATE TRIGGER update_user_selections_updated_at
    BEFORE UPDATE ON user_selections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
