# `vac-ui-components` CLI

The official developer CLI for **VAC-UI-COMPONENTS** — download, validate, and install animated, glassmorphic UI components directly into your React application without runtime locks or live service dependencies.

---

## 1. Installation & Quick Start

You can run the CLI directly via `npx` or `pnpm dlx`:

```bash
npx vac-ui-components <command> [options]
```

Or install it globally / as a dev dependency:

```bash
npm install -D vac-ui-components
# or
pnpm add -D vac-ui-components
```

---

## 2. Supported React Project Configurations

The CLI automatically inspects your project directory and adapts to your setup:

- **Frameworks**: Next.js (App Router or Pages Router), Vite React, Remix, Create React App.
- **Languages**: TypeScript (`.tsx`) and JavaScript (`.jsx`).
- **Package Managers**: `pnpm`, `npm`, `yarn`, `bun`.
- **Styling**: Tailwind CSS v3 / v4 or pure CSS modules.

---

## 3. CLI Commands

### `init`

Initializes the VAC configuration in your React project directory:

```bash
npx vac-ui-components init
```

#### Options:
- `-y, --yes`: Skip interactive prompts and accept detected defaults.
- `-d, --components-dir <dir>`: Custom destination directory for component files (default: `src/components/ui` or `components/ui`).
- `-r, --registry <url>`: Custom registry URL (default: `http://localhost:4000/api/registry` or production endpoint).

#### What it does:
1. Detects project root (`package.json`).
2. Checks for React 18+ dependency.
3. Detects TypeScript (`tsconfig.json`) or JavaScript (`jsconfig.json`).
4. Checks for Tailwind CSS (`tailwind.config.*` or PostCSS config).
5. Creates a project-local `vac.config.json`:
   ```json
   {
     "$schema": "https://vac.dev/schema/vac.config.json",
     "typescript": true,
     "tailwind": true,
     "componentsDir": "src/components/ui",
     "registryUrl": "http://localhost:4000/api/registry"
   }
   ```
6. Creates the target components directory safely.

---

### `add <component>`

Downloads and installs an immutable, versioned component release from the registry into your project:

```bash
npx vac-ui-components add <component-slug>
```

#### Installing a Specific Version:
```bash
npx vac-ui-components add animated-login-form --version 1.0.0
```

#### Options:
- `-v, --version <version>`: Specific release version to install (defaults to latest published version).
- `-y, --yes`: Skip prompts and automatically accept overwrites and confirmations.
- `--overwrite`: Force overwrite existing files.
- `-p, --path <dir>`: Custom destination directory for this installation.
- `-r, --registry <url>`: Override registry URL.
- `--install-deps`: Safely install declared missing dependencies using your project's detected package manager (`pnpm`, `npm`, `yarn`, or `bun`). Always requires explicit user consent (or `-y` flag). Never executes arbitrary commands from registry payloads.

---

## 4. Security & Safe Installation Protections

The CLI implements zero-trust registry processing:

1. **Path Traversal Prevention**: Every incoming file path is strictly resolved within the project directory. Relative paths containing `..` or leading `/` are immediately rejected before writing to disk.
2. **File Extension Whitelist**: Only allowed component source types (`.tsx`, `.ts`, `.jsx`, `.js`, `.css`, `.json`) are accepted. Arbitrary binaries or scripts are blocked.
3. **File Size Limits**: Protects against zip-bomb or storage exhaustion attacks (10MB maximum per component release).
4. **SHA-256 Integrity Verification**: Every file and manifest is verified against cryptographic integrity hashes computed at publish time. Tampered or corrupted downloads fail immediately.
5. **Zero Execution of Arbitrary Scripts**: Component manifests never execute `postinstall` hooks or arbitrary shell scripts.
6. **No Runtime Lock-In**: Installed code belongs entirely to your codebase and does not require a live VAC backend or external runtime to render.

---

## 5. Dependency & Styling Requirements

When installing a component:
- The CLI checks `package.json` for declared dependencies (e.g. `motion/react`, `lucide-react`).
- Missing dependencies are clearly listed alongside the exact install command for your active package manager (e.g., `pnpm add motion/react lucide-react`).
- Peer dependencies (such as React `18.x`) are verified for compatibility.
- If the component requires Tailwind CSS classes, ensure your `tailwind.config.js` content array includes your components directory:
  ```js
  // tailwind.config.js
  module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./src/components/ui/**/*.{js,ts,jsx,tsx}",
    ],
    // ...
  };
  ```

---

## 6. Registry Configuration & Overrides

You can configure the registry endpoint in three ways (in order of precedence):
1. Command flag: `--registry https://registry.vac.dev/api/registry`
2. Environment variable: `VAC_REGISTRY_URL=https://registry.vac.dev/api/registry`
3. Configuration file: `"registryUrl"` in `vac.config.json`

---

## 7. How Admins Publish Components

Admins create and publish components via the **Admin Component Studio** (`/admin/studio`):
1. **Draft Creation**: Admin drafts component files, props, dependencies, and metadata.
2. **Safety & Manifest Validation**: Automated checks enforce path safety, entrypoint designation, required props, and Zod manifest conformance.
3. **Immutable Snapshot**: Upon publishing, the server computes SHA-256 integrity hashes for each file and the release manifest, then persists the release snapshot to static storage.
4. **Public Registry Availability**: The release becomes immediately retrievable via public endpoints:
   - `GET /api/registry/components/:slug`
   - `GET /api/registry/components/:slug/:version/manifest`
5. **Version Immutability**: Once published, that version snapshot is strictly immutable and cannot be overwritten. Updates must increment semantic versions (e.g., `1.0.1` or `1.1.0`).

---

## 8. Verifying the Installed Component

After running `vac-ui-components add <slug>`, import the component directly:

```tsx
import { AnimatedLoginForm } from './components/ui/AnimatedLoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0B10] p-6">
      <AnimatedLoginForm
        title="Welcome to My App"
        onSubmit={async (data) => {
          console.log('User logged in:', data.email);
        }}
      />
    </main>
  );
}
```

Run your build command (e.g., `npm run build` or `pnpm build`) to verify that the component builds cleanly.
