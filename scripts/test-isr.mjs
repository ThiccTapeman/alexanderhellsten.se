import { spawn } from "node:child_process";
import { once } from "node:events";
import { rm } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

// Build against disposable data; never use the developer's configured database.
const db = await PGlite.create();
const socket = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 15440, maxConnections: 8 });
async function run(args, env = process.env) {
  const child = spawn(process.execPath, args, { windowsHide: true, stdio: "inherit", env });
  const [code] = await once(child, "exit");
  if (code !== 0) throw new Error(`${args.join(" ")} exited with ${code}`);
}
try {
  // Discard previous database results before building the disposable fixture.
  await rm(path.resolve(".next/cache"), { recursive: true, force: true });
  await socket.start();
  await run(["node_modules/next/dist/bin/next", "build", "--webpack"], {
    ...process.env, DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:15440/postgres",
  });
} finally {
  await socket.stop();
  await db.close();
}
await run(["scripts/test-http.mjs"]);
