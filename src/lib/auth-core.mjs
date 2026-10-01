import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const scryptOptions = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
export const SESSION_SECONDS = 8 * 60 * 60;
export const IDLE_SECONDS = 30 * 60;
export const sessionCookie = process.env.NODE_ENV === "production" ? "__Host-portfolio-admin" : "portfolio-admin";
export const cookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS,
};
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");
export const loginAccountKey = (username) => `login-account:${hashToken(username.trim().toLowerCase())}`;

export async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 9 || password.length > 128) {
    throw new Error("Use a password between 9 and 128 characters.");
  }
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64, scryptOptions);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

const dummyHash = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;
export async function verifyPassword(password, encoded = dummyHash) {
  if (typeof password !== "string" || password.length > 128) return false;
  const [algorithm, salt, key] = encoded.split("$");
  if (algorithm !== "scrypt" || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(key)) return false;
  const actual = await scrypt(password, salt, 64, scryptOptions);
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
}

export function authStore(db) {
  return {
    async consumeRate(key, limit, seconds) {
      // An atomic, database-backed counter works across Netlify function instances.
      const { rows } = await db.query(`
        INSERT INTO admin_rate_limits (key, attempts, reset_at) VALUES ($1, 1, now() + $2 * interval '1 second')
        ON CONFLICT (key) DO UPDATE SET
          attempts = CASE WHEN admin_rate_limits.reset_at <= now() THEN 1 ELSE LEAST(admin_rate_limits.attempts + 1, $3 + 1) END,
          reset_at = CASE WHEN admin_rate_limits.reset_at <= now() THEN now() + $2 * interval '1 second' ELSE admin_rate_limits.reset_at END
        RETURNING attempts, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (reset_at - now()))))::integer AS retry_after`, [key, seconds, limit]);
      return { allowed: rows[0].attempts <= limit, retryAfter: rows[0].retry_after };
    },
    async consumeLimit(key, limit, seconds) {
      return (await this.consumeRate(key, limit, seconds)).allowed;
    },
    async login(username, password, previousToken) {
      // Global budget cannot be bypassed by rotating IPs or spoofing forwarded headers.
      for (const [key, limit, seconds] of [
        ["admin-login", 10, 15 * 60],
        ["admin-login-burst", 3, 60],
        [loginAccountKey(username), 5, 15 * 60],
      ]) {
        const rate = await this.consumeRate(key, limit, seconds);
        if (!rate.allowed) return { limited: true, retryAfter: rate.retryAfter };
      }
      const { rows } = await db.query("SELECT id, password_hash FROM admin_users WHERE username = $1", [username]);
      const user = rows[0];
      const valid = await verifyPassword(password, user?.password_hash);
      if (!user || !valid) return { invalid: true };
      if (previousToken) await this.logout(previousToken);
      await db.query("DELETE FROM admin_sessions WHERE expires_at <= now() OR last_seen_at <= now() - $1 * interval '1 second'", [IDLE_SECONDS]);
      const token = randomBytes(32).toString("base64url");
      const created = await db.query("INSERT INTO admin_sessions (token_hash, user_id, expires_at) SELECT $1, id, now() + $3 * interval '1 second' FROM admin_users WHERE id = $2 AND password_hash = $4 RETURNING token_hash", [hashToken(token), user.id, SESSION_SECONDS, user.password_hash]);
      if (!created.rows.length) return { invalid: true };
      await db.query("DELETE FROM admin_rate_limits WHERE key = $1 OR reset_at <= now()", [loginAccountKey(username)]);
      return { token };
    },
    async session(token) {
      if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
      const { rows } = await db.query(`UPDATE admin_sessions SET last_seen_at = now()
        WHERE token_hash = $1 AND expires_at > now() AND last_seen_at > now() - $2 * interval '1 second'
        RETURNING user_id`, [hashToken(token), IDLE_SECONDS]);
      return rows[0] || null;
    },
    async logout(token) {
      if (typeof token === "string") await db.query("DELETE FROM admin_sessions WHERE token_hash = $1", [hashToken(token)]);
    },
  };
}
