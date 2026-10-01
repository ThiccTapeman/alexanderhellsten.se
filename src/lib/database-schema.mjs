// Update this contract when adding a migration. A test compares it with the SQL
// directory so a new migration cannot silently be skipped by runtime startup.
export const requiredMigrations = ["001-schema.sql", "002-original-content.sql", "003-images.sql"];
export const requiredTables = [
  "schema_migrations", "projects", "education", "experiences", "nonprofit",
  "technologies", "admin_users", "admin_sessions", "admin_rate_limits", "media_images",
];

export async function schemaIsCurrent(client) {
  const { rows } = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = current_schema()");
  const existing = new Set(rows.map((row) => row.tablename));
  if (!requiredTables.every((name) => existing.has(name))) return false;
  const applied = await client.query("SELECT name FROM schema_migrations WHERE name = ANY($1::text[])", [requiredMigrations]);
  const names = new Set(applied.rows.map((row) => row.name));
  return requiredMigrations.every((name) => names.has(name));
}
