# VAC-UI-COMPONENTS

> A modern, minimal, and high-performance React component library platform where developers discover, preview, customize, and install production-ready UI components via CLI or source copy.

---

## 1. Architecture & Repository Structure

VAC-UI-COMPONENTS is architected as an industrial-grade pnpm monorepo maintaining a strict boundary between the web application, backend API server, shared schemas, registry manifests, and developer CLI tooling:

```
vac-ui-components/
├── apps/
│   └── web/                   # React + Vite + TypeScript + Tailwind CSS application shell
│       ├── src/
│       │   ├── app/           # App root & context providers (Theme, Auth)
│       │   ├── components/    # Reusable shell (Sidebar, Topbar, CommandPalette, InspectorModal)
│       │   ├── features/      # Feature modules (Auth, Theme, Catalog, Admin Studio)
│       │   ├── layouts/       # Reusable responsive AppLayout
│       │   ├── pages/         # Overview, Catalog, Favorites, Collections, Settings, Admin
│       │   ├── routes/        # Declarative React Router v6 routing
│       │   └── styles/        # Global design tokens and tailwind utilities
│       ├── tailwind.config.ts # Token palette (editorial Dark-first & Light themes)
│       └── vite.config.ts
├── backend/
│   └── src/
│       ├── config/            # Strict Zod environment parser and resilient MongoDB connection
│       ├── middleware/        # Rate limiting, security headers, Zod validators, JWT auth & RBAC
│       ├── models/            # Mongoose models (User, Component, ComponentVersion, Category, AuditLog)
│       ├── modules/
│       │   ├── admin/         # Admin Studio overview, CRUD, validation pipeline, publishing, deprecation
│       │   ├── auth/          # Registration, login, profile, and protected admin bootstrap
│       │   ├── categories/    # Catalog taxonomy
│       │   ├── components/    # Catalog listing, slug lookup, and official seed dataset
│       │   ├── favorites/     # User component bookmarks
│       │   ├── collections/   # User custom component groupings
│       │   ├── health/        # Real-time health status with database connectivity metrics
│       │   └── registry/      # Public versioned release retrieval and diff comparison APIs
│       ├── app.ts             # Express app factory with CORS, rate limiting, and security headers
│       └── server.ts          # Graceful HTTP server startup & teardown
├── packages/
│   ├── cli/                   # Node.js + TypeScript + Commander CLI for `vac-ui` commands
│   └── registry/              # Immutable versioned release storage & manifest contracts
├── shared/
│   └── src/
│       ├── schemas/           # Universal Zod schemas (Auth, Component, Category, Manifest, API)
│       └── index.ts           # Dual-format ESM/CJS build with full TypeScript declarations
├── scripts/
│   ├── run-e2e-acceptance.ts                # 14-step end-to-end acceptance verification script
│   ├── run-production-smoke-test.ts         # Complete 9-step production journey smoke test
│   ├── verify-cli-production-readiness.ts   # Local tarball install, init, add, and integrity checks
│   └── verify-nine-official-components.ts   # TypeScript checks and Vite production build test
├── .env.example               # Explicit environment variable documentation
└── pnpm-workspace.yaml        # Monorepo workspace configuration
```

---

## 2. Supported Production Deployment Architecture

The platform is designed for cloud-native production deployment across standard container, PaaS, or Kubernetes environments:

```
                                  ┌────────────────────────────────┐
                                  │   CDN / Reverse Proxy (HTTPS)  │
                                  │   (Cloudflare / NGINX / Cloud) │
                                  └───────────────┬────────────────┘
                                                  │
                         ┌────────────────────────┴────────────────────────┐
                         │                                                 │
                         ▼                                                 ▼
            ┌───────────────────────────┐                    ┌───────────────────────────┐
            │       Frontend SPA        │                    │      Backend API &        │
            │    (Vercel / S3 / Cloud)  │                    │     Registry Server       │
            │   Vite Static Production  │                    │   Node.js 20+ / Docker    │
            │          Assets           │                    └─────────────┬─────────────┘
            └───────────────────────────┘                                  │
                                                                           │
                                              ┌────────────────────────────┴───────────────────────────┐
                                              │                                                        │
                                              ▼                                                        ▼
                                 ┌─────────────────────────┐                             ┌───────────────────────────┐
                                 │     Database Cluster    │                             │  Persistent Release Store │
                                 │      MongoDB Atlas      │                             │   Shared Volume / PVC /   │
                                 │  Replica Set (3 Nodes)  │                             │      NFS / S3 Adapter     │
                                 └─────────────────────────┘                             └───────────────────────────┘
```

1. **Frontend (`apps/web`)**:
   - Compiles to static static assets (`dist/`) via `pnpm --filter @vac/web build`.
   - Hosted on CDN edge networks (Cloudflare Pages, Vercel, Netlify, AWS CloudFront + S3).
   - In production, set `VITE_API_URL=https://api.yourdomain.com/api`.

2. **Backend API & Registry Server (`backend`)**:
   - Containerized Node.js 20+ service running Express.
   - Deployable to AWS ECS, Google Cloud Run, Railway, Render, or Kubernetes.
   - Built-in rate limiting (30 requests/15m for auth, 1500 requests/15m for API) and security headers.
   - Configurable CORS origin checking against `FRONTEND_URL`.

3. **Database Cluster (MongoDB)**:
   - MongoDB 6.0+ replica set (e.g., MongoDB Atlas).
   - Enforces unique index constraints for components, users, favorites, and version immutability (`{ componentSlug: 1, version: 1 }`).

4. **Registry Storage Persistence**:
   - Storage adapter: `LocalRegistryStore` writes immutable JSON manifests to `REGISTRY_STORAGE_DIR`.
   - In containerized deployments (Docker/Kubernetes), mount a PersistentVolumeClaim (PVC) or AWS EFS at `/var/lib/vac-ui/registry`.
   - Dual-persistence safeguard: Every release is also recorded in MongoDB (`ComponentVersionModel`), ensuring automatic recovery and caching if container filesystems are replaced.

---

## 3. Environment Configuration (`.env`)

| Variable | Type | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `4000` | Port for Express API server |
| `NODE_ENV` | String | `production` | Environment mode (`development`, `test`, `production`) |
| `FRONTEND_URL` | String | `https://vac.dev` | Allowed CORS origin for web client |
| `MONGODB_URI` | String | `mongodb+srv://...` | MongoDB replica set connection URI |
| `JWT_SECRET` | String | `min 32 chars random` | Secret for signing auth tokens (enforced >= 32 chars in prod) |
| `JWT_EXPIRES_IN` | String | `7d` | Token expiration duration |
| `ADMIN_BOOTSTRAP_SECRET` | String | `custom secure token` | One-time token used to bootstrap the primary administrator |
| `REGISTRY_STORAGE_DIR` | String | `/var/lib/vac/storage` | Persistent storage path for release manifests |
| `VITE_API_URL` | String | `https://api.vac.dev/api` | Client-side API base URL |

---

## 4. Build, Test, Deploy, and Rollback Procedures

### A. Quality Verification
```bash
# Run all workspace tests (94 passing tests)
pnpm -r test

# Run End-to-End acceptance pipeline (14 steps)
./backend/node_modules/.bin/tsx scripts/run-e2e-acceptance.ts

# Run production user journey smoke test (9 steps)
./backend/node_modules/.bin/tsx scripts/run-production-smoke-test.ts

# Verify all 9 official components install and compile in Vite production bundle
./backend/node_modules/.bin/tsx scripts/verify-nine-official-components.ts

# Verify CLI tarball packaging and installation
./backend/node_modules/.bin/tsx scripts/verify-cli-production-readiness.ts
```

### B. Production Build
```bash
pnpm build
```

### C. Deployment
1. **Database**: Ensure MongoDB replica set is reachable and indexes are synchronized.
2. **Backend**: Deploy Docker container with `NODE_ENV=production`, `PORT=4000`, `MONGODB_URI`, and `REGISTRY_STORAGE_DIR` mounted to persistent storage.
3. **Frontend**: Deploy `apps/web/dist` to CDN or static host.
4. **Bootstrap Admin**: Run `POST /api/auth/bootstrap-admin` with `ADMIN_BOOTSTRAP_SECRET` to initialize the root admin user.

### D. Rollback
1. **Frontend**: Revert CDN deployment to the prior Git commit or build bundle.
2. **Backend**: Re-deploy the previous container image tag.
3. **Registry**: Because releases are strictly immutable and never overwritten, existing published component versions remain 100% backward-compatible. If an erroneous release was published, deprecate it via `POST /api/admin/components/:id/versions/:ver/deprecate`.

---

## 5. Development Phases Completed
- [x] **Phase 1**: Monorepo foundations, shared schemas, responsive shell, dark/light themes, resilient API server.
- [x] **Phase 2**: User application enhancements, favorites, collections, recently viewed history, compact catalog cards.
- [x] **Phase 3**: Admin Dashboard, Component Studio, live Monaco editor, draft validation pipeline, version publishing.
- [x] **Phase 4**: Immutable Versioned Registry, public retrieval APIs, cryptographic integrity hashes, zero-trust CLI tool (`init` & `add`), and end-to-end acceptance verification.
- [x] **Phase 5**: Component version history and comparison (line diffs, metadata diffs), admin release deprecation with audit logs, and CLI package manager detection with safe dependencies.
- [x] **Phase 6**: Production launch readiness audit, security hardening, rate limiting, zero critical/high CVEs, clean React/Vite builds for all 9 components, and production smoke tests.
