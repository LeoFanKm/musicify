-- ============================================================================
-- Musicify TMA Database Schema (D1 SQLite)
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_id INTEGER NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  tier TEXT NOT NULL DEFAULT 'free', -- 'free' or 'pro'
  created_at TEXT NOT NULL,
  last_active_at TEXT NOT NULL
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_tier ON users(tier);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  spec TEXT NOT NULL, -- JSON: SongSpec
  theme TEXT,
  structure TEXT, -- JSON: SongStructure
  lyrics TEXT,
  full_lyrics TEXT,
  chords TEXT,
  melody_hint TEXT,
  abc_notation TEXT,
  suno_prompt TEXT,
  tunee_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'completed', 'exported'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);

-- Generations table (track AI generations for analytics)
CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  type TEXT NOT NULL, -- 'lyrics', 'chords', 'analysis'
  model TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at);
