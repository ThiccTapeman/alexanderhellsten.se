CREATE TABLE IF NOT EXISTS media_images (
  id uuid PRIMARY KEY,
  data bytea NOT NULL CHECK (octet_length(data) BETWEEN 1 AND 4194304),
  width integer NOT NULL CHECK (width BETWEEN 1 AND 2560),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 2560),
  created_by integer REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
