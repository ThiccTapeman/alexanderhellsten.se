This is a Next.js project.

## Description

This github project works as a personal portfolio for me.

Visit at: alexanderhellsten.se

## Portfolio database and admin

`/admin` manages projects, education, experience, independent/nonprofit work, and
technologies. Each group has its own PostgreSQL table. Public pages read from
the database on each request, so saved changes do not require rebuilding the site.
The PDF download in `public/` is still a static file; the browser's résumé PDF and
print views read the database.

### First-time setup (Netlify + PostgreSQL)

1. Provision a PostgreSQL database (Netlify Database or another managed PostgreSQL
   provider). Use its pooled connection URL for the deployed app. This repository
   does not create a paid database or deploy automatically.
2. Copy `.env.example` to `.env.local`. Set `DATABASE_URL` to the database URL and
   `APP_ORIGIN` to `http://localhost:3000` for development. Do not commit secrets.
   `NETLIFY_DB_URL` is also supported if Netlify supplies it. Hosted connections
   require TLS with certificate verification; a private CA can be supplied through
   `DATABASE_CA` as a PEM string.
3. Run `npm install`. The app automatically creates missing tables on its first
   database request and applies pending migrations. The original 35 entries are
   imported once into newly created content tables; existing tables and admin
   edits are preserved. Initialization is transactional, locked across server
   instances, and retries after a failed connection. `npm run db:migrate` remains
   available for manual initialization. Migrations are tracked by checksum. Do not edit an
   already-applied migration—add a new numbered SQL migration instead.
4. Run `npm run admin:password -- your-username` in an interactive terminal.
   Enter a unique password of 9–128 characters at the hidden prompts. This creates
   missing tables first, then creates the account or resets its password and revokes its sessions. There is no default
   password, public registration, or web-based bootstrap endpoint.
5. Set `DATABASE_URL` (or the Netlify-provided `NETLIFY_DB_URL`) and
   `APP_ORIGIN=https://alexanderhellsten.se` in **Netlify's environment settings**,
   with access for server functions. Keep database credentials server-side; never
   use a `NEXT_PUBLIC_` prefix. Use Node.js 22.13+ or 24 for builds and development.
6. Run `npm test` and `npm run build`, then deploy normally. Open `/admin` over
   HTTPS and sign in. Pending migrations run automatically before database queries.

Use an isolated database for local development and deploy previews. Do not point
untrusted preview code at the production database. `APP_ORIGIN` is one exact
trusted origin, not a wildcard. Public database-backed pages need a configured,
database at runtime; there is deliberately no JSON fallback. Tables are initialized
once per server process; a restart or a manual migration also repairs missing tables.

When all expected tables and migration records exist, startup performs only a
read-only schema check. It does not execute DDL or read SQL files. Missing tables
or pending migrations still trigger automatic setup. Full migration checksum
validation runs during setup or `npm run db:migrate`. Add new SQL migrations to
`src/lib/database-schema.mjs`; the tests enforce that the manifest stays current.

Automatic initialization of an incomplete database requires an account with CREATE permission on
the application's schema and ownership/permissions to apply its migrations and
read/write its tables and sequences. Use a dedicated database/schema for this app;
it does not need superuser or role-management permissions. Keep managed database
backups enabled; deletion in the editor is permanent.

Production builds use `next build --webpack` to avoid the hashed external-package
references emitted by Turbopack that caused the deployed `pg-…` module-load error.
Local development still uses Turbopack. PostgreSQL (`pg`) and the native image
processor (`sharp`) are explicitly kept as server-only external packages.

### Authentication and crawler protection

- Passwords are salted and hashed with scrypt (N=131072, r=8, p=1).
- Login creates a fresh 256-bit opaque session token; only its SHA-256 hash is
  stored. Production cookies use `__Host-`, Secure, HttpOnly, SameSite=Strict, and
  Path=/ with no Domain. Sessions expire after 30 idle minutes or eight hours.
- Every admin data request and mutation validates the session server-side. The
  browser UI and proxy are not the authorization boundary. Logout revokes the
  database session, and CLI password resets revoke all of that user's sessions.
- Mutations require the configured exact Origin, a custom request header, JSON,
  and same-origin Fetch Metadata where supplied. Request bodies are bounded;
  field types, URL schemes, collection names and lengths are validated. SQL values
  are parameterized; update/delete versions prevent silently overwriting edits.
- Shared PostgreSQL counters allow three sign-in attempts per minute and ten per
  15 minutes across the site. Each account also has a five-attempt / 15-minute
  budget that resets on successful login. Checks run before password hashing,
  work across server instances, and return HTTP 429 with the remaining Retry-After
  seconds. Account identifiers are hashed in the counters, and blocked requests
  do not extend the original cooldown. Admin writes allow 120 requests per minute.
  Changing cookies, user agents or forwarded IP headers cannot bypass the limits.
  The global login budget can also be exhausted by an attacker: use Netlify's edge
  rate limits/WAF for additional traffic and denial-of-service protection. Resetting
  an account through the CLI also clears its account throttle and global login limits.
- `/admin` and `/api/` are excluded in robots.txt; admin responses also carry
  noindex/nofollow headers, private/no-store cache headers, and a nonce-based CSP
  with frame embedding disabled. The sitemap contains only public pages.

Bots that ignore robots.txt can reach the login form, but cannot read admin data
or change content without a valid session. No user-agent filter can reliably
identify all bots, and robots.txt is not an access-control mechanism. Content
published on the public portfolio remains public and crawlable.

Project images can be uploaded from the admin editor, with immediate previews and
thumbnails in the project list. JPEG, PNG, and WebP files up to 4 MB / 20 megapixels
are supported. Images are decoded, oriented, resized to at most 2560 pixels per
side and re-encoded as WebP with metadata removed; SVG and animated files are not
accepted. Uploads require an admin session and same-origin CSRF checks and are
limited to ten per minute per admin. The `media_images` table is created by the
automatic migrations. Restart a running dev server after installing this update.

Image bytes are stored in PostgreSQL, not the Netlify function's temporary disk,
so they survive deployments. `/uploads/<random-id>.webp` serves the saved images
with an explicit image content type and cache headers. These URLs are public:
upload only images intended for the portfolio. Save the project after uploading
to publish its new image. Removing an image from a project clears its reference;
it does not delete the stored image, since other projects may share it. Unused
uploads remain in database storage and backups. Existing `/projectImages/filename`
paths and HTTPS image URLs remain supported.

Technology badge colors use a fixed palette so
Tailwind includes all supported styles. Project technology labels are free text;
renaming a technology does not automatically rename labels on existing projects.
Display order applies to résumé sections and technologies; the public project list
retains its existing date/name sorting and filters.

### Verification

`npm test` runs migrations, CRUD, conflict, input-validation, password, session,
expiry, revocation, shared-rate-limit, CSRF and request-size tests using an isolated
embedded PostgreSQL instance. Tests do not connect to your production database.

After `npm run build`, `npm run test:http` starts a disposable database and a local
production server on ports 15439 and 3107. It checks unauthenticated crawler
requests, login/CSRF/cookie headers, CRUD for every collection, public page updates,
logout, robots.txt and sitemap.xml, then shuts both servers down. No production
credentials or data are used.
