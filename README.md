# Ultra Commerce

Ultra Commerce is a modular, Next.js-based ecommerce backend and admin platform.
It ships with:

- a Next.js platform app for admin UI, docs, and API routes
- a worker process for async jobs and integrations
- shared commerce modules for users, catalog, inventory, pricing, carts, orders, payments, shipping, analytics, CMS, notifications, search, settings, and audit
- a plugin runtime and module registry
- a reusable compact UI kit and global theme switch
- a Postgres-first data layer with Drizzle

## Workspace layout

- `apps/platform`: Next.js admin, docs, and API surface
- `apps/worker`: async worker process
- `packages/api-contracts`: shared schemas and OpenAPI metadata
- `packages/core`: config, plugins, events, permissions, security helpers
- `packages/db`: Drizzle schema, migrations, seeds, and database client
- `packages/modules`: commerce modules and service facade
- `packages/ui`: reusable UI components

## Local development

1. Copy `.env.example` to `.env`.
2. Provide a running Postgres instance in `DATABASE_URL`.
3. Set `APP_ENCRYPTION_KEY` for the in-app secret vault.
4. Adjust in-app defaults in `packages/core/src/app-config.ts` for currency, region, analytics IDs, email defaults, and optional provider behavior.
5. Install dependencies with `pnpm install`.
6. Run `pnpm typecheck`.
7. Start the platform with `pnpm --filter @ultra/platform dev`.
8. Start the worker with `pnpm start:worker`.

## API surfaces

- Store APIs: `/api/v1/store/*`
- Admin APIs: `/api/v1/admin/*`
- Webhooks: `/api/webhooks/payments/:provider`
- OpenAPI JSON: `/api/openapi`
- Docs UI: `/docs`
- Admin UI: `/admin`

## Security defaults

- strict CSP, frame, referrer, and content type headers in the platform proxy
- typed validation contracts and centralized permission primitives
- idempotency hashing helpers for mutation routes
- webhook signature verification scaffold
- audit module and append-only logging model in the data layer
- env-driven secrets with app-owned feature configuration

## Railway deployment

Railway config files in this repo cover the web service build and start commands. Railway currently does not define a full multi-service project and Postgres service purely from `railway.json`, so deploy Ultra Commerce on Railway with this layout:

1. Create a Railway project from this repository.
2. Add a `web` service using the root `railway.json`.
3. Add a second `worker` service from the same repository.
   Use the start command: `pnpm start:worker`
4. Add a Railway Postgres service from the Postgres template or database menu.
5. Set `DATABASE_URL` on both `web` and `worker` to `${{Postgres.DATABASE_URL}}`.
6. Set `SESSION_SECRET` and `PAYMENT_WEBHOOK_SECRET` as service secrets.
7. Use separate Railway environments for staging and production.

Suggested service variables:

- `APP_URL`
- `DATABASE_URL`
- `SESSION_SECRET`
- `APP_ENCRYPTION_KEY`
- `PAYMENT_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `META_CONVERSIONS_API_TOKEN`

## Commands

- `pnpm typecheck`: validate the full workspace
- `pnpm build:platform`: build the Next.js production app
- `pnpm db:generate`: generate Drizzle migrations
- `pnpm db:migrate`: run database migrations
- `pnpm db:seed`: run the seed bootstrap
- `pnpm start:worker`: run the worker service

## Notes

- Railway web nodes are stateless, so product media should live in object storage.
- The current worker is a foundation process and should be extended with job polling, retries, email dispatch, and analytics aggregation.
- The current platform provides an enterprise-ready skeleton and typed API foundation; the next iteration should flesh out persistent CRUD flows for each module against Postgres.
- External service secrets can now be stored in-app in the encrypted settings vault; the master key for encrypting them remains in `APP_ENCRYPTION_KEY`.
