-- Migration: Create onet_cache table with cache_key
CREATE TABLE IF NOT EXISTS onet_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL, -- e.g. "riasec:RIA" or "career:11-1011.00"
    data_json JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE onet_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read (since it's a cache)
CREATE POLICY "Allow public read access to onet_cache"
ON onet_cache FOR SELECT
USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated upsert to onet_cache"
ON onet_cache FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update to onet_cache"
ON onet_cache FOR UPDATE
USING (auth.role() = 'authenticated');
