import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const OFFICIAL_COMPONENTS = [
  { slug: 'animated-login-form', componentName: 'AnimatedLoginForm' },
  { slug: 'glassmorphism-navbar', componentName: 'GlassmorphismNavbar' },
  { slug: 'interactive-pricing', componentName: 'InteractivePricing' },
  { slug: 'analytics-dashboard', componentName: 'AnalyticsDashboard' },
  { slug: 'notification-center', componentName: 'NotificationCenter' },
  { slug: 'file-upload', componentName: 'FileUpload' },
  { slug: 'glass-button', componentName: 'GlassButton' },
  { slug: 'toggle-switch', componentName: 'ToggleSwitch' },
  { slug: 'dark-glass-card', componentName: 'DarkGlassCard' },
];

async function verifyAllNineComponents() {
  console.log('🚀 Verifying Installation & Build of All Nine Official Components in Clean React + Vite Project...\n');

  const tmpDir = path.resolve(process.cwd(), `.tmp-verify-nine-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    // 1. Setup clean React + Vite project fixture
    const packageJson = {
      name: 'nine-components-fixture',
      version: '1.0.0',
      private: true,
      type: 'module',
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'lucide-react': '^1.0.0',
        'motion/react': '^12.0.0',
      },
      devDependencies: {
        typescript: '^5.7.3',
        vite: '^6.0.0',
        '@vitejs/plugin-react': '^4.3.4',
        '@types/react': '^18.3.18',
        '@types/react-dom': '^18.3.5',
      },
    };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: true,
      },
      include: ['src'],
    };
    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
    fs.writeFileSync(path.join(tmpDir, 'vite.config.ts'), viteConfig);

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Nine Components Fixture</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
    fs.writeFileSync(path.join(tmpDir, 'index.html'), indexHtml);

    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.symlinkSync(path.resolve(process.cwd(), 'apps/web/node_modules'), path.join(tmpDir, 'node_modules'), 'junction');

    const cliBin = path.resolve(process.cwd(), 'packages/cli/bin/vac.js');

    // 2. Initialize project with CLI
    console.log('Step 1: Initializing VAC configuration...');
    execSync(`node "${cliBin}" init -y`, {
      cwd: tmpDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
      stdio: 'pipe',
    });
    console.log('  ✔ vac.config.json and components directory created');

    // 3. Install all nine components sequentially
    console.log('\nStep 2: Installing all 9 official VAC components via CLI:');
    for (const comp of OFFICIAL_COMPONENTS) {
      console.log(`  Installing "${comp.slug}"...`);
      const output = execSync(`node "${cliBin}" add ${comp.slug} -y`, {
        cwd: tmpDir,
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
        stdio: 'pipe',
      }).toString();

      const expectedFile = path.join(tmpDir, `src/components/ui/${comp.componentName}.tsx`);
      if (!fs.existsSync(expectedFile)) {
        throw new Error(`File ${expectedFile} was not created for ${comp.slug}! Output: ${output}`);
      }
      const fileContent = fs.readFileSync(expectedFile, 'utf8');
      if (fileContent.length < 50) {
        throw new Error(`File ${expectedFile} has stub or empty content!`);
      }

      // Verify no proprietary VAC runtime or server dependency
      if (fileContent.includes('@vac/') || fileContent.includes('localhost:') || fileContent.includes('vac.dev/api')) {
        throw new Error(`Component ${comp.slug} contains unexpected live VAC runtime or API imports!`);
      }

      console.log(`  ✔ Successfully installed ${comp.slug} -> ${comp.componentName}.tsx (${fileContent.length} bytes, independent)`);
    }

    // 4. Create App.tsx and main.tsx that render all 9 components
    console.log('\nStep 3: Creating fixture App.tsx rendering all 9 components...');
    const appTsx = `import React from 'react';
import { AnimatedLoginForm } from './components/ui/AnimatedLoginForm';
import { GlassmorphismNavbar } from './components/ui/GlassmorphismNavbar';
import { InteractivePricing } from './components/ui/InteractivePricing';
import { AnalyticsDashboard } from './components/ui/AnalyticsDashboard';
import { NotificationCenter } from './components/ui/NotificationCenter';
import { FileUpload } from './components/ui/FileUpload';
import { GlassButton } from './components/ui/GlassButton';
import { ToggleSwitch } from './components/ui/ToggleSwitch';
import { DarkGlassCard } from './components/ui/DarkGlassCard';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-white p-8 space-y-12">
      <GlassmorphismNavbar brandName="VAC Demo" />
      <AnimatedLoginForm title="Login" />
      <InteractivePricing />
      <AnalyticsDashboard timeRange="7d" />
      <NotificationCenter />
      <FileUpload />
      <GlassButton variant="primary">Click Me</GlassButton>
      <ToggleSwitch label="Active Toggle" />
      <DarkGlassCard title="Card Title" subtitle="Card Subtitle" />
    </div>
  );
};
export default App;
`;
    fs.writeFileSync(path.join(tmpDir, 'src/App.tsx'), appTsx);

    const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
    fs.writeFileSync(path.join(tmpDir, 'src/main.tsx'), mainTsx);
    console.log('  ✔ App.tsx and main.tsx created with all 9 components rendered');

    // 5. Run TypeScript compiler to typecheck all installed components
    console.log('\nStep 4: Compiling all components with TypeScript (tsc --noEmit)...');
    const tscBin = path.resolve(process.cwd(), 'node_modules/.bin/tsc');
    try {
      execSync(`"${tscBin}" --project "${tmpDir}/tsconfig.json" --noEmit`, {
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
        stdio: 'pipe',
      });
      console.log('  ✔ TypeScript compilation passed with 0 errors across all 9 components!');
    } catch (err: any) {
      console.error('TSC Compiler Output:\n', err.stdout?.toString() || err.stderr?.toString());
      throw err;
    }

    // 6. Run Vite production build
    console.log('\nStep 5: Executing Vite production build (vite build)...');
    const viteBin = path.resolve(process.cwd(), 'apps/web/node_modules/.bin/vite');
    try {
      const buildOutput = execSync(`"${viteBin}" build`, {
        cwd: tmpDir,
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
        stdio: 'pipe',
      }).toString();
      console.log('  ✔ Vite production build succeeded:\n', buildOutput.trim());

      const distDir = path.join(tmpDir, 'dist');
      if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
        throw new Error('Vite build did not generate expected dist/index.html output!');
      }
      console.log('  ✔ dist/index.html and production bundles verified!');
    } catch (err: any) {
      console.error('Vite Build Output:\n', err.stdout?.toString() || err.stderr?.toString());
      throw err;
    }

    console.log('\n🎉 ALL 9 OFFICIAL VAC COMPONENTS SUCCESSFULLY INSTALLED, TYPECHECKED, AND COMPILED IN VITE PRODUCTION BUILD! 🎉\n');
  } finally {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

verifyAllNineComponents().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
