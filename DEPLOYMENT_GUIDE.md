# Ephemere Deployment Guide

This guide explains how to deploy the full Ephemere stack:

- `apps/web`: Next.js frontend, recommended on Vercel.
- `apps/api`: Hono API on Cloudflare Workers.
- `apps/socket`: Cloudflare Worker with Durable Objects for chat WebSockets.
- `packages/db`: Drizzle schema and migrations for Neon PostgreSQL.
- Cloudflare R2: file storage.
- Resend: transactional email.

Use this as the production runbook. The shorter `CLOUDFLARE_QUICKSTART.md` and `DEPLOYMENT_CHECKLIST.md` are still useful, but this file covers the full repo.

## 1. Prerequisites

Install local tooling:

```bash
node --version
pnpm --version
pnpm install
```

Expected project assumptions:

- Node.js `>=20`.
- pnpm `9.x`.
- A Cloudflare account with Workers, Durable Objects, and R2 enabled.
- A Neon PostgreSQL database.
- A Vercel account for the web app.
- A Resend account and verified sending domain.
- Google and GitHub OAuth apps if social login is enabled.
- Razorpay keys if paid plans are enabled.

Authenticate Wrangler:

```bash
pnpm --filter @ephemere/api exec wrangler login
pnpm --filter @ephemere/api exec wrangler whoami
```

## 2. Deployment Architecture

Production URLs should look like this:

```text
Web app:       https://your-web-domain.com
API worker:    https://api.your-domain.com
Socket worker: wss://socket.your-domain.com
R2/CDN:        https://cdn.your-domain.com
Database:      Neon PostgreSQL
```

You can use default Cloudflare Workers URLs during the first deployment:

```text
API worker:    https://ephemere-api.<account>.workers.dev
Socket worker: https://ephemere-socket.<account>.workers.dev
```

For the browser, use `wss://` for the socket worker in production, not `ws://`.

## 3. Environment Files

Never commit real `.env` values. Use the examples as templates.

### Web: `apps/web/.env`

For local development:

```env
NEXT_PUBLIC_SERVER_API_BASE_URL=http://localhost:4001
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_CDN_URL=http://localhost:4001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
HOST=http://localhost:3000
```

For production:

```env
NEXT_PUBLIC_SERVER_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://socket.your-domain.com
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
HOST=https://your-web-domain.com
```

### API: `apps/api/.env`

Used by local `wrangler dev`. Production values must be stored as Cloudflare Worker secrets.

```env
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://..."
JWT_SECRET="long_random_secret"
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@your-domain.com
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=ephemere
CDN_URL=https://cdn.your-domain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Socket: `apps/socket/.env`

Use the same `DATABASE_URL` and `JWT_SECRET` as the API:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="same_secret_as_api"
```

### Database migrations

`packages/db/drizzle.config.ts` currently loads `DATABASE_URL` from a repo-root `.env` file. Before running Drizzle commands, create a root `.env`:

```env
DATABASE_URL="postgresql://..."
```

Alternatively, export the variable in your shell before running migration commands:

```bash
export DATABASE_URL="postgresql://..."
```

## 4. Cloudflare Resources

Create the R2 buckets:

```bash
pnpm --filter @ephemere/api exec wrangler r2 bucket create ephemere
pnpm --filter @ephemere/api exec wrangler r2 bucket create ephemere-preview
```

Create or verify worker configs:

- API config: `apps/api/wrangler.toml`
- Socket config: `apps/socket/wrangler.jsonc`

The API worker uses:

- Worker name: `ephemere-api`
- Entrypoint: `dist/index.js`
- Build command: `cd ../.. && pnpm --filter @ephemere/api build`
- R2 binding: `R2_BUCKET`

The socket worker uses:

- Worker name: `ephemere-socket`
- Entrypoint: `src/index.ts`
- Durable Object binding: `CHAT_ROOM`
- Durable Object class: `ChatRoom`

## 5. Database Deployment

Generate migrations if the schema changed:

```bash
pnpm db:generate
```

Apply migrations to Neon:

```bash
pnpm db:migrate
```

Optional: inspect the database locally:

```bash
pnpm db:studio
```

Before deploying, verify the DB package compiles:

```bash
pnpm --filter @ephemere/db check-types
```

## 6. API Worker Secrets

Set production secrets from `apps/api`:

```bash
cd apps/api

pnpm exec wrangler secret put FRONTEND_URL
pnpm exec wrangler secret put DATABASE_URL
pnpm exec wrangler secret put JWT_SECRET
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put RESEND_FROM_EMAIL
pnpm exec wrangler secret put CLOUDFLARE_R2_ACCESS_KEY_ID
pnpm exec wrangler secret put CLOUDFLARE_R2_SECRET_ACCESS_KEY
pnpm exec wrangler secret put CLOUDFLARE_R2_ENDPOINT
pnpm exec wrangler secret put CLOUDFLARE_R2_BUCKET_NAME
pnpm exec wrangler secret put CDN_URL
pnpm exec wrangler secret put GOOGLE_CLIENT_ID
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET
pnpm exec wrangler secret put GITHUB_CLIENT_ID
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm exec wrangler secret put RAZORPAY_KEY_ID
pnpm exec wrangler secret put RAZORPAY_KEY_SECRET
```

For production environment-specific secrets, add `--env production`:

```bash
pnpm exec wrangler secret put DATABASE_URL --env production
```

Use this style consistently. If you deploy with `--env production`, set secrets with `--env production`.

## 7. Socket Worker Secrets

Set production socket secrets from `apps/socket`:

```bash
cd apps/socket

pnpm exec wrangler secret put DATABASE_URL
pnpm exec wrangler secret put JWT_SECRET
```

Again, if deploying with an environment, add the same `--env` flag when setting secrets.

## 8. Local Verification

From the repo root, verify the workspace:

```bash
pnpm check-types
pnpm lint
pnpm build
```

Expected:

- `pnpm check-types` should pass.
- `pnpm build` should pass.
- `pnpm lint` may show warnings, but should not show errors.

Run services locally:

```bash
pnpm --filter @ephemere/api dev
pnpm --filter @ephemere/socket dev
pnpm --filter web dev
```

Current local ports:

```text
Web:    http://127.0.0.1:3000
API:    http://127.0.0.1:4001
Socket: ws://127.0.0.1:8080
```

Health checks:

```bash
curl http://127.0.0.1:4001/
curl http://127.0.0.1:8080/
curl http://127.0.0.1:3000/
```

Expected API response:

```json
{"status":"ok","environment":"cloudflare-workers"}
```

Expected socket health response:

```json
{"ok":true,"service":"@ephemere/socket","transport":"cloudflare-durable-object"}
```

## 9. Deploy API Worker

From the repo root:

```bash
pnpm --filter @ephemere/api build
pnpm --filter @ephemere/api deploy
```

If using the production environment in `wrangler.toml`:

```bash
cd apps/api
pnpm exec wrangler deploy --env production
```

Validate:

```bash
curl https://api.your-domain.com/
curl https://ephemere-api.<account>.workers.dev/
```

Tail logs:

```bash
cd apps/api
pnpm exec wrangler tail
```

## 10. Deploy Socket Worker

From the repo root:

```bash
pnpm --filter @ephemere/socket build
pnpm --filter @ephemere/socket deploy
```

Validate HTTP health:

```bash
curl https://socket.your-domain.com/
```

Validate WebSocket behavior with the repo script:

```bash
WS_URL="wss://socket.your-domain.com/?roomId=public" pnpm --filter @ephemere/socket exec node test-connection.mjs
```

The script may fail with `Room not found` if the `public` room does not exist. That still proves the WebSocket upgrade reached the worker. For a full test, use an existing room ID from the database.

Tail logs:

```bash
cd apps/socket
pnpm exec wrangler tail
```

## 11. Configure Custom Domains

Recommended production domains:

```text
api.your-domain.com    -> ephemere-api Worker
socket.your-domain.com -> ephemere-socket Worker
cdn.your-domain.com    -> R2 public bucket or R2 custom domain
your-domain.com        -> Vercel web app
```

Configure Cloudflare routes or custom domains in the Cloudflare dashboard:

1. Workers & Pages.
2. Select the worker.
3. Settings.
4. Triggers.
5. Add Custom Domain or Route.

After domains are active, update:

- `FRONTEND_URL` secret in the API worker.
- `NEXT_PUBLIC_SERVER_API_BASE_URL` in Vercel.
- `NEXT_PUBLIC_WS_URL` in Vercel.
- OAuth redirect URLs in Google/GitHub.
- R2 CORS and public CDN settings.

## 12. Deploy Web App on Vercel

Create a Vercel project from the repo.

Recommended settings:

```text
Framework Preset: Next.js
Root Directory: apps/web
Install Command: cd ../.. && pnpm install --frozen-lockfile
Build Command: cd ../.. && pnpm --filter web build
Output Directory: apps/web/.next
```

If Vercel runs from the repo root instead, use:

```text
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm --filter web build
Root Directory: .
```

Set Vercel environment variables:

```env
NEXT_PUBLIC_SERVER_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://socket.your-domain.com
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GITHUB_CLIENT_ID=...
HOST=https://your-web-domain.com
```

Deploy:

```bash
pnpm --filter web build
```

Then deploy from the Vercel dashboard or CLI.

## 13. OAuth Configuration

### Google

Set authorized JavaScript origins:

```text
https://your-web-domain.com
```

Set authorized redirect URIs according to the API route behavior. Common values:

```text
https://your-web-domain.com/callback
https://api.your-domain.com/api/v1/auth/google/callback
```

### GitHub

Set homepage URL:

```text
https://your-web-domain.com
```

Set callback URL according to the app flow:

```text
https://your-web-domain.com/callback
```

Verify the exact callback path in `apps/web/app/(auth)/(github)/callback/page.tsx` and API auth routes before finalizing OAuth app settings.

## 14. R2 and File Uploads

Confirm API secrets match the R2 bucket:

```env
CLOUDFLARE_R2_BUCKET_NAME=ephemere
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CDN_URL=https://cdn.your-domain.com
```

Configure bucket CORS for browser uploads/downloads. Include your web domain:

```json
[
  {
    "AllowedOrigins": ["https://your-web-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

After deployment, test file upload from the UI and verify the file appears in R2.

## 15. Resend Email

Before production:

- Verify the sending domain in Resend.
- Set SPF, DKIM, and DMARC DNS records.
- Use a verified `RESEND_FROM_EMAIL`.
- Test registration, email verification, and forgot password flows.

If emails fail:

- Check Cloudflare Worker logs.
- Check Resend dashboard logs.
- Verify `RESEND_API_KEY`.
- Verify `RESEND_FROM_EMAIL` belongs to a verified domain.

## 16. Final Production Checklist

Run before announcing the deployment:

```bash
pnpm check-types
pnpm build
```

Then verify:

- Web homepage loads.
- Login and register pages load.
- API health endpoint returns `200`.
- Socket health endpoint returns `200`.
- A user can register and verify email.
- A user can log in.
- OAuth login works, if enabled.
- A room can be created.
- A user can join a room.
- WebSocket messages arrive in real time.
- File upload works.
- Room history works.
- Paid plan flow works, if enabled.
- Cloudflare logs do not show repeated errors.
- Vercel function/build logs do not show repeated errors.

## 17. Monitoring

Cloudflare:

```bash
cd apps/api
pnpm exec wrangler tail

cd ../socket
pnpm exec wrangler tail
```

Vercel:

- Check deployment logs.
- Check runtime logs.
- Watch web vitals and error reports if enabled.

Database:

- Monitor Neon connection count.
- Monitor slow queries.
- Confirm migrations are recorded.

R2:

- Monitor object count and storage size.
- Watch failed upload requests.

## 18. Rollback

### Web rollback

Use Vercel's previous deployment rollback from the dashboard.

### API rollback

Cloudflare keeps worker versions. In the Cloudflare dashboard:

1. Workers & Pages.
2. Select `ephemere-api`.
3. Deployments.
4. Roll back to a previous version.

Or redeploy a known good commit:

```bash
git checkout <known-good-commit>
pnpm install --frozen-lockfile
pnpm --filter @ephemere/api deploy
```

### Socket rollback

Use Cloudflare deployment rollback for `ephemere-socket`, or redeploy a known good commit:

```bash
git checkout <known-good-commit>
pnpm install --frozen-lockfile
pnpm --filter @ephemere/socket deploy
```

Be careful with Durable Object migrations. Do not remove or reorder migration tags after they have been deployed.

### Database rollback

Drizzle migrations are not automatically reversible. For schema rollback:

- Restore from a Neon backup or branch.
- Apply a new forward migration that repairs the schema.
- Avoid manually editing migration history in production.

## 19. Common Failure Modes

### Worker deploy cannot find compiled API output

Run:

```bash
pnpm --filter @ephemere/api build
```

The API worker config points to `dist/index.js`.

### Web app calls localhost in production

Check Vercel environment variables:

```env
NEXT_PUBLIC_SERVER_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://socket.your-domain.com
```

Redeploy after changing `NEXT_PUBLIC_*` variables. They are baked into the client bundle.

### WebSocket connects but immediately receives an error

Likely causes:

- Missing `roomId` query parameter.
- Room does not exist.
- `JWT_SECRET` differs between API and socket workers.
- The temporary guest payload is incomplete.
- The room is closed.

### Database works locally but not in Workers

Check:

- `DATABASE_URL` is set as a Cloudflare secret.
- Neon allows the connection.
- The database URL includes SSL settings if required.
- Migrations were applied before deploying.

### File uploads fail

Check:

- R2 credentials.
- `CLOUDFLARE_R2_BUCKET_NAME`.
- `CLOUDFLARE_R2_ENDPOINT`.
- R2 bucket CORS.
- `CDN_URL` and `NEXT_PUBLIC_CDN_URL`.

### OAuth redirects fail

Check:

- Web `HOST`.
- API `FRONTEND_URL`.
- OAuth app redirect URLs.
- Production client IDs/secrets.

## 20. Suggested Deployment Order

Use this order for a clean production rollout:

1. Create Neon database.
2. Configure repo-root `DATABASE_URL`.
3. Run migrations.
4. Create R2 buckets and CDN/custom domain.
5. Configure Resend sender domain.
6. Configure OAuth apps.
7. Set API worker secrets.
8. Set socket worker secrets.
9. Deploy API worker.
10. Deploy socket worker.
11. Validate API and socket health endpoints.
12. Configure Vercel environment variables.
13. Deploy web app.
14. Run end-to-end smoke tests.

