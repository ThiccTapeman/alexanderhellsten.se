CREATE TABLE projects (
  id serial PRIMARY KEY,
  "projectName" text NOT NULL,
  "projectDescription" text NOT NULL,
  "projectImage" text NOT NULL DEFAULT '',
  "projectDate" text NOT NULL,
  "projectTechnologies" text[] NOT NULL DEFAULT '{}',
  "projectType" text NOT NULL,
  "projectGithub" text NOT NULL DEFAULT '',
  "projectHomepage" text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE education (
  id serial PRIMARY KEY, title text NOT NULL, school text NOT NULL,
  subject text NOT NULL DEFAULT '', date text NOT NULL, description text NOT NULL,
  recent boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE experiences (
  id serial PRIMARY KEY, title text NOT NULL, company text NOT NULL,
  date text NOT NULL, description text NOT NULL, current boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE nonprofit (
  id serial PRIMARY KEY, title text NOT NULL, company text NOT NULL,
  date text NOT NULL, description text NOT NULL, current boolean NOT NULL DEFAULT false,
  "projectLink" text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE technologies (
  id serial PRIMARY KEY, title text NOT NULL, main boolean NOT NULL DEFAULT false,
  color text NOT NULL, text text NOT NULL, level integer CHECK (level BETWEEN 0 AND 100),
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admin_users (
  id serial PRIMARY KEY, username text NOT NULL UNIQUE,
  password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admin_sessions (
  token_hash text PRIMARY KEY,
  user_id integer NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX admin_sessions_expiry ON admin_sessions(expires_at);
CREATE TABLE admin_rate_limits (
  key text PRIMARY KEY, attempts integer NOT NULL, reset_at timestamptz NOT NULL
);
