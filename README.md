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
│       │   ├── components/    # Reusable shell (Sidebar, Topbar, CommandPalette) & UI primitives
│       │   ├── features/      # Feature modules (Auth, Theme, Catalog)
│       │   ├── layouts/       # Reusable responsive AppLayout
│       │   ├── pages/         # Overview, Catalog, Favorites, Collections, Settings, Admin
│       │   ├── routes/        # Declarative React Router v6 routing
│       │   └── styles/        # Global design tokens and tailwind utilities
│       ├── tailwind.config.ts # Token palette (editorial Dark-first & Light themes)
│       └── vite.config.ts
├── backend/
│   └── src/
│       ├── config/            # Strict Zod environment parser and resilient MongoDB connection
│       ├── middleware/        # Centralized error handler, Zod validators, JWT auth & RBAC
│       ├── models/            # Mongoose models (User, Component, ComponentVersion, Category)
│       ├── modules/
│       │   ├── auth/          # Registration, login, profile, and protected admin bootstrap
│       │   ├── categories/    # Catalog taxonomy
│       │   ├── components/    # Catalog listing, slug lookup, and official seed dataset
│       │   └── health/        # Real-time health status with database connectivity metrics
│       ├── app.ts             # Express app factory with CORS & middleware
│       └── server.ts          # Graceful HTTP server startup & teardown
├── packages/
│   ├── cli/                   # Node.js + TypeScript + Commander CLI for `vac-ui` commands
│   └── registry/              # Immutable versioned release storage & manifest contracts
├── shared/
│   └── src/
│       ├── schemas/           # Universal Zod schemas (Auth, Component, Category, Manifest, API)
│       └── index.ts           # Dual-format ESM/CJS build with full TypeScript declarations
├── .env.example               # Explicit environment variable documentation
└── pnpm-workspace.yaml        # Monorepo workspace configuration
```

---

## 2. Design Tokens & Styling Principles

- **Editorial developer aesthetic**: Restrained, minimal, zero unnecessary fluff or neon glow.
- **Dark Theme (Primary)**:
  - Background: `#0A0B10`
  - Surface: `#11131A`
  - Elevated Surface: `#171A23`
  - Primary Accent: `#6366F1` (Indigo)
  - Secondary Accent: `#8B5CF6` (Violet)
  - Text: `#F4F5F8`
  - Secondary Text: `#9CA3AF`
  - Borders: `rgba(255, 255, 255, 0.08)`
- **Light Theme**:
  - Background: `#FFFFFF`
  - Secondary Background: `#F8F9FC`
  - Primary Text: `#171923`
  - Secondary Text: `#667085`
  - Borders: `#E7E9F0`
- **8-Point Spacing Grid**: Corner radiuses tuned for buttons (`8px`), panels (`12px`), and previews (`16px`).
- **Typography**: Inter for interface elements; JetBrains Mono for code blocks and terminal commands.

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- Node.js `v20+` or `v24+`
- pnpm `v10+` (`corepack enable && corepack use pnpm@10.28.0` or `npm install -g pnpm`)
- MongoDB (optional for basic catalog browsing; required for persistent user authentication & publishing)

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd VAC-UI-COMPONENTS
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install all workspace dependencies:
   ```bash
   pnpm install
   ```

4. Build shared schema contracts:
   ```bash
   pnpm --filter @vac/shared build
   ```

---

## 4. Running the Platform Locally

### Run Both Frontend and Backend Concurrently
```bash
pnpm dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **Health Endpoint**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

### Run Individual Workspaces
```bash
# Frontend only
pnpm dev:web

# Backend API server only
pnpm dev:backend
```

---

## 5. Testing & Quality Verification

Run all test suites across the entire monorepo:
```bash
pnpm test
```

Or target specific packages:
```bash
pnpm test:backend    # Express API endpoints & centralized error handling
pnpm test:web        # React shell, theme providers, and UI primitives
pnpm --filter @vac/shared test  # Zod schema validation rules
```

---

## 6. Monorepo Production Build

```bash
pnpm build
```
This builds `@vac/shared` (TSUP with ESM, CJS, and `.d.ts`), `@vac/backend`, `@vac/web` (Vite production bundle), `@vac/cli`, and `@vac/registry`.

---

## 7. Phase 1 Implementation Summary

- [x] Monorepo workspace configuration with pnpm.
- [x] Shared TypeScript & Zod schemas for Authentication, Components, Versions, Manifests, and API responses.
- [x] Express backend architecture with centralized error handling, Zod validation middleware, and JWT authentication.
- [x] Resilient database connection handling with graceful degradation (server boots reliably even when local MongoDB is offline).
- [x] Full application shell with 240px/64px collapsible sidebar, breadcrumb topbar, Cmd+K command palette, and dark/light theme switching.
- [x] Interactive component catalog page with search, category filtering, and CLI command copy action.
- [x] 100% passing smoke and integration tests across all packages.
