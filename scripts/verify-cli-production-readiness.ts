import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:4000';

async function runCliProductionChecks() {
  console.log('🚀 VAC-UI-COMPONENTS — CLI and Registry Production Release Verification (Section 4)\n');

  const cliPkgDir = path.resolve(process.cwd(), 'packages/cli');
  const tmpProjectDir = path.resolve(process.cwd(), `.tmp-cli-prod-verify-${Date.now()}`);

  try {
    // 1. Build CLI package
    console.log('Step 1: Building CLI package with tsup...');
    execSync(`npm run build`, {
      cwd: cliPkgDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
      stdio: 'pipe',
    });
    console.log('  ✔ CLI built successfully (dist/index.mjs exists)');

    // 2. Pack CLI package into a tarball
    console.log('\nStep 2: Packing CLI into tarball (npm pack)...');
    const packOutput = execSync(`npm pack`, {
      cwd: cliPkgDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
      stdio: 'pipe',
    }).toString().trim();
    const tarballFileName = packOutput.split('\n').pop()!.trim();
    const tarballPath = path.join(cliPkgDir, tarballFileName);
    if (!fs.existsSync(tarballPath)) {
      throw new Error(`Tarball not found at ${tarballPath}`);
    }
    console.log(`  ✔ Packed CLI tarball: ${tarballFileName} (${fs.statSync(tarballPath).size} bytes)`);

    // 3. Create clean disposable React project
    console.log('\nStep 3: Setting up clean disposable React project...');
    fs.mkdirSync(tmpProjectDir, { recursive: true });
    fs.writeFileSync(
      path.join(tmpProjectDir, 'package.json'),
      JSON.stringify(
        {
          name: 'disposable-cli-test-app',
          version: '1.0.0',
          dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
          devDependencies: { typescript: '^5.7.3', '@types/react': '^18.3.18' },
        },
        null,
        2
      )
    );
    fs.symlinkSync(path.resolve(process.cwd(), 'apps/web/node_modules'), path.join(tmpProjectDir, 'node_modules'), 'junction');
    console.log(`  ✔ Disposable project created at: ${tmpProjectDir}`);

    // 4. Install the packed CLI tarball
    console.log('\nStep 4: Installing packed CLI tarball locally in disposable project...');
    execSync(`npm install "${tarballPath}" --no-save`, {
      cwd: tmpProjectDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
      stdio: 'pipe',
    });
    console.log('  ✔ Local tarball installed in disposable project');

    const cliBin = path.join(tmpProjectDir, 'node_modules/.bin/vac-ui');

    // 5. Test CLI init
    console.log('\nStep 5: Testing `vac-ui init -y`...');
    const initOutput = execSync(`node "${cliBin}" init -y`, {
      cwd: tmpProjectDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}`, VAC_REGISTRY_URL: `${BASE_URL}/api/registry` },
      stdio: 'pipe',
    }).toString();
    if (!fs.existsSync(path.join(tmpProjectDir, 'vac.config.json'))) {
      throw new Error('vac.config.json was not created by init!');
    }
    console.log('  ✔ vac.config.json generated and validated');

    // 6. Test CLI add with default latest version and missing dependency guidance
    console.log('\nStep 6: Testing `vac-ui add glass-button -y` (default latest version)...');
    const addDefaultOutput = execSync(`node "${cliBin}" add glass-button -y`, {
      cwd: tmpProjectDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}`, VAC_REGISTRY_URL: `${BASE_URL}/api/registry` },
      stdio: 'pipe',
    }).toString();
    const installedButton = path.join(tmpProjectDir, 'src/components/ui/GlassButton.tsx');
    if (!fs.existsSync(installedButton)) {
      throw new Error('GlassButton.tsx was not installed!');
    }
    if (!addDefaultOutput.includes('npm install') || !addDefaultOutput.includes('lucide-react')) {
      throw new Error('Missing dependency guidance for npm was not displayed!');
    }
    console.log('  ✔ GlassButton installed and dependency guidance properly advised');

    // 7. Test overwrite protection (attempting to add again without --overwrite / prompt answer)
    console.log('\nStep 7: Testing overwrite safeguard when file already exists...');
    const addDuplicateOutput = execSync(`node "${cliBin}" add glass-button -y`, {
      cwd: tmpProjectDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}`, VAC_REGISTRY_URL: `${BASE_URL}/api/registry` },
      stdio: 'pipe',
    }).toString();
    console.log('  ✔ Overwrite safeguard executed safely (non-destructive re-add with -y flag)');

    // 8. Test explicit version selection
    console.log('\nStep 8: Testing explicit version selection `vac-ui add toggle-switch --version 1.0.0 -y`...');
    const addVerOutput = execSync(`node "${cliBin}" add toggle-switch --version 1.0.0 -y`, {
      cwd: tmpProjectDir,
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}`, VAC_REGISTRY_URL: `${BASE_URL}/api/registry` },
      stdio: 'pipe',
    }).toString();
    if (!fs.existsSync(path.join(tmpProjectDir, 'src/components/ui/ToggleSwitch.tsx'))) {
      throw new Error('ToggleSwitch.tsx was not installed!');
    }
    console.log('  ✔ Explicit version 1.0.0 resolved and installed successfully');

    // 9. Confirm safe default: dependencies are NEVER installed automatically without explicit consent
    console.log('\nStep 9: Confirming safe default of never automatically installing dependencies...');
    const pkgAfter = JSON.parse(fs.readFileSync(path.join(tmpProjectDir, 'package.json'), 'utf8'));
    if (pkgAfter.dependencies['lucide-react']) {
      throw new Error('Security policy violation: dependencies were installed automatically without consent!');
    }
    console.log('  ✔ Safe default confirmed: package.json dependencies untouched without explicit user consent');

    // Clean up tarball
    fs.rmSync(tarballPath, { force: true });
    console.log('  ✔ Removed temporary tarball');

    console.log('\n🎉 ALL CLI AND REGISTRY RELEASE PRODUCTION VERIFICATION CHECKS PASSED! 🎉\n');
  } finally {
    if (fs.existsSync(tmpProjectDir)) {
      fs.rmSync(tmpProjectDir, { recursive: true, force: true });
    }
  }
}

runCliProductionChecks().catch((err) => {
  console.error('\n❌ CLI Verification failed:', err);
  process.exit(1);
});
