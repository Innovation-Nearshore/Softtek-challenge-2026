-- Initialize database schema for ia_challenge
-- This script should be run manually to set up the initial schema structure

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS reto_c;

-- Set search_path to use the reto_c schema by default
SET search_path TO reto_c, public;

-- Base tables will be created by the application services
-- This file documents the schema structure and provides reference queries

-- Example: Users table structure
-- CREATE TABLE reto_c.users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   email VARCHAR(255) UNIQUE NOT NULL,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Example: Creating indexes for better query performance
-- CREATE INDEX idx_users_email ON reto_c.users(email);
-- CREATE INDEX idx_users_created_at ON reto_c.users(created_at);
