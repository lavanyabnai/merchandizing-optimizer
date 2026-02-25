-- Initialize database with required extensions
-- This script runs automatically when PostgreSQL container starts

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search optimization
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create schema for assortment optimizer
CREATE SCHEMA IF NOT EXISTS assortment;

-- Grant permissions
GRANT ALL ON SCHEMA assortment TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully for Assortment Optimizer';
END $$;
