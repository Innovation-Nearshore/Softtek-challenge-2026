-- Migration: 001_create_requests_table
-- Creates the requests table in reto_c schema

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS reto_c;

-- Create requests table
CREATE TABLE IF NOT EXISTS reto_c.requests (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(100)  NOT NULL,
  urgency     VARCHAR(10)   NOT NULL CHECK (urgency IN ('Alta', 'Media', 'Baja')),
  description TEXT          NOT NULL,
  requester   VARCHAR(150)  NOT NULL,
  area        VARCHAR(100)  NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'Recibida'
                            CHECK (status IN ('Recibida', 'En revisión', 'Resuelta')),
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION reto_c.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to requests table
DROP TRIGGER IF EXISTS trg_requests_updated_at ON reto_c.requests;
CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON reto_c.requests
  FOR EACH ROW EXECUTE FUNCTION reto_c.set_updated_at();

-- Indexes for common filter queries
CREATE INDEX IF NOT EXISTS idx_requests_type     ON reto_c.requests (type);
CREATE INDEX IF NOT EXISTS idx_requests_urgency  ON reto_c.requests (urgency);
CREATE INDEX IF NOT EXISTS idx_requests_status   ON reto_c.requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created  ON reto_c.requests (created_at DESC);
