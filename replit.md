# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Project: رينو باك / RenoPack — منصة باكدجات صيانة رينو في الإسكندرية

### Product Overview
Full-stack Arabic RTL marketplace between Renault spare parts suppliers and installation workshops in Alexandria, Egypt (Uber-style).
- Brand: navy `#1A2356` + gold `#C8974A` + sky `#4AABCA` + lav `#7B72B8` + sage `#3DA882`
- Mascot: "باكو" diamond-robot character (`src/assets/bako-new.png`, `bako-logo.png`)
- Fonts: Almarai (brand) + Cairo (Arabic) loaded via HTML `<link>` in index.html
- CSS brand vars: `--rp-*` prefix in `index.css` (--rp-navy, --rp-gold, --rp-sky, etc.)
- CSS animations: `rp-*` prefix (rp-float, rp-blob1, rp-glow-blink, rp-fade-up, etc.)

### Homepage (AlexandriaBlend Design — applied to artifacts/renault-parts)
- Cinematic hero: Bako mascot + speech bubble + floating stat cards + grid perspective
- Parts showcase: magazine layout (2-col) with original/Turkish price comparison
- Ready packages: 3-column 3D cards from real API (`useListPackages()`)
- Puzzle builder: interactive part selector with gift tier progress bars
- AI compare: 3 parts (oil/brakes/filter), original vs Turkish, with local BakoChat
- Workshops grid: 4 Alexandria workshops
- Dark navy theme (`#0D1220` bg) for home page; existing light theme for other pages

### Auth
JWT-based auth using `bcryptjs` + `jsonwebtoken`. Token stored in localStorage by frontend.
- `artifacts/api-server/src/lib/auth.ts` — hashPassword, comparePassword, signToken, verifyToken, requireAuth middleware

### Database Schema (lib/db/src/schema/)
- `users.ts` — id, name, phone, email, passwordHash, carModel, carYear, address, area, role
- `packages.ts` — id, name, slug, description, kmService, basePrice, sellPrice, warrantyMonths
- `parts.ts` — id, name, oemCode, type, priceOriginal, priceTurkish, priceChinese + packagePartsTable (junction)
- `workshops.ts` — id, name, area, address, phone, lat, lng, rating, partnershipStatus
- `orders.ts` — id, userId, packageId, workshopId, status, paymentMethod, paymentStatus, total, deliveryAddress, carModel, carYear
- `reviews.ts` — id, orderId, userId, workshopId, rating, comment
- `chatSessions.ts` — id, sessionKey, userId, messages (jsonb)

### API Routes (artifacts/api-server/src/routes/)
- `auth.ts` — POST /auth/register, POST /auth/login, POST /auth/logout, GET /auth/me
- `users.ts` — PATCH /users/:id
- `packages.ts` — GET /packages, GET /packages/:slug
- `workshops.ts` — GET /workshops?area=
- `orders.ts` — GET /orders, POST /orders, GET /orders/:id
- `reviews.ts` — POST /reviews
- `chat.ts` — POST /chat (AI assistant, uses DEEPSEEK_API_KEY or OPENAI_API_KEY, fallback rule-based)

### Frontend (artifacts/renault-parts/)
React + Vite, full RTL Arabic, Cairo font, navy/gold brand.
Pages: Home, /packages, /packages/:slug, /login, /register, /my-orders, /orders/:id, /checkout

### Seeding
`pnpm --filter @workspace/scripts run seed` — seeds packages, parts, package-parts links, workshops

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
