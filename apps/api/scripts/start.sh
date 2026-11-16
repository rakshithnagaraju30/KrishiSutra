#!/bin/sh
# Production start (Render): apply migrations, then start the server at once and seed in the background.
# Render fails a deploy if no port opens within a few minutes, and seeding a remote database (Neon)
# can take longer than that. The seed is idempotent; while it runs, crops may briefly be missing.
set -e
npx prisma migrate deploy
( npx prisma db seed && echo "Seed finished." || echo "SEED FAILED - see the error above. The server keeps running." ) &
exec node dist/src/server.js
