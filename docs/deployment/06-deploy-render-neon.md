# Deploy the KrishiSutra API — Render (server) + Neon (database)

Everything can be done **from a phone browser**. Total time: about 15 minutes. Both services have free plans.

| Piece | Service | Free plan notes |
|---|---|---|
| API server | [Render](https://render.com) web service, Singapore | Sleeps after ~15 min without requests; the next request wakes it (≈ 50 s). |
| Database | [Neon](https://neon.tech) PostgreSQL 16, Singapore | Pauses when idle and wakes in about a second. |

> This is a **pilot** setup. Before many real farmers use it, plan to move to Google Cloud Mumbai
> (ADR 0008) so data stays in India and the server never sleeps.

---

## Step 1 — Create the database on Neon

1. Open **https://console.neon.tech** and sign up (choose **Continue with GitHub**).
2. Create a project:
   - **Project name:** `krishisutra`
   - **Postgres version:** 16
   - **Region:** *Asia Pacific (Singapore)* — the same region as the Render server. A Neon project's
     region cannot be changed later; a far region (e.g. US East / Virginia) makes every request slow.
3. On the project dashboard, open **Connect** (or *Connection string*).
   - Turn **off** "Connection pooling" (use the *direct* connection — needed for database migrations).
   - Copy the string. It looks like
     `postgresql://neondb_owner:••••••@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
4. Keep it private — it contains the database password. Paste it **only** into Render (step 2).

## Step 2 — Create the API server on Render

1. Open **https://dashboard.render.com** and sign up with **GitHub**. Allow Render to see the
   `KrishiSutra` repository.
2. Tap **New → Blueprint**.
3. Choose the repository **rakshithnagaraju30/KrishiSutra**, branch **`claude/agriculture-platform-vision-7xftwo`**.
   Render finds `render.yaml` and shows one service: **krishisutra-api**.
4. It asks for **DATABASE_URL** → paste the Neon string from step 1.
5. Tap **Apply** (or *Deploy Blueprint*). The first build takes 3–6 minutes. Render then:
   - installs and compiles the API,
   - creates all database tables (`prisma migrate deploy`),
   - starts the server (`apps/api/scripts/start.sh`),
   - loads reference data and the published crop guides in the background (`prisma db seed`;
     the logs show `Seed finished.` — until then some crops may be missing).

## Step 3 — Check it works

Open in the phone browser (replace the name if Render gave a different one):

- `https://krishisutra-api.onrender.com/api/v1/health` → `"status":"ok"`
- `https://krishisutra-api.onrender.com/api/v1/health/database` → `"status":"ok"`
- `https://krishisutra-api.onrender.com/api/v1/crops` → the published crops

The exact address is shown at the top of the service page in Render (e.g. `https://krishisutra-api.onrender.com`
or `https://krishisutra-api-xxxx.onrender.com`).

## Step 4 — Connect the Android app

The app uses `https://krishisutra-api.onrender.com` by default. If Render gave a different address:
- open the app → **Settings → Server address**, paste the address, tap **Test connection** (it is saved and checked); or
- tell the developer, who rebuilds the APK with that address.

---

## Updating

Every push to the branch redeploys automatically (`autoDeploy: true`). Migrations and the seed run
on every start and are safe to repeat.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Deploy log: `Invalid environment configuration` | A variable is missing/invalid — the log lists which. Check **Environment** in Render. |
| Deploy log: `Cannot reach the database` | Re-copy the Neon string (direct connection, `sslmode=require`). |
| First app request is slow | The free server was asleep; it wakes in about 50 s. |
| `P1001` during migrations | Neon project paused or wrong host — open the Neon console once and retry the deploy. |
| Render log shows the old start command (`npx prisma migrate deploy && npx prisma db seed && …`) | Render → service → **Settings → Start Command** = `sh scripts/start.sh` → Save → **Manual Deploy → Deploy latest commit**. |
| `Port scan timeout reached, no open ports detected` | Same fix as above: the start script opens the port first and seeds in the background. |
| `Database did not respond within … ms` | Neon was asleep or far away; the server now retries 5 × 10 s (`DATABASE_CHECK_TIMEOUT_MS`, `DATABASE_STARTUP_ATTEMPTS`). Prefer a Singapore Neon project. |

## Security notes

- The database password lives only in Render's environment settings — never in the repository.
- Logs never contain tokens, passwords or connection strings (redaction is built in).
- Device tokens are stored hashed; a database leak does not reveal them.
