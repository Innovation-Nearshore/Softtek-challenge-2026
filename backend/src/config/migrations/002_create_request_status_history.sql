-- Migration: 002_create_request_status_history
-- Description: Creates the reto_c.request_status_history table to track all status changes
-- Run manually: psql -U postgres -d ai_challenge -f 002_create_request_status_history.sql

CREATE TABLE IF NOT EXISTS reto_c.request_status_history (
  id            SERIAL PRIMARY KEY,
  request_id    INTEGER NOT NULL REFERENCES reto_c.requests(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status    VARCHAR(50) NOT NULL,
  comment       TEXT,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by    VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_request_status_history_request_id
  ON reto_c.request_status_history(request_id);

CREATE INDEX IF NOT EXISTS idx_request_status_history_changed_at
  ON reto_c.request_status_history(changed_at DESC);
