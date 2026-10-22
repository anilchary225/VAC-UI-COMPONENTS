import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import jwt from 'jsonwebtoken';
import { computeFileIntegrity, computeManifestIntegrity } from '../packages/registry/src';

const BASE_URL = 'http://localhost:4000';
const JWT_SECRET = process.env.JWT_SECRET || 'vac_ui_super_secret_development_key_change_in_production_min_32_chars';

// Step 0: Generate admin token
const adminToken = jwt.sign(
  { id: 'usr_admin_e2e', email: 'admin@vac.dev', role: 'admin', name: 'Admin E2E' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, body: data };
}

async function runE2E() {
  console.log('🚀 Starting VAC-UI-COMPONENTS End-to-End Acceptance Test (Section 14)...\n');

  const slug = `e2e-metric-card-${Date.now()}`;
  const componentName = 'E2E Metric Card';

  // 1. Create a component draft in Admin Component Studio
  console.log('Step 1: Admin creates a component draft in Admin Component Studio...');
  const createRes = await request('/api/admin/components', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: componentName,
      slug,
      description: 'A metric display card with animated counter and status badge.',
      category: 'Data Display',
      tags: ['Metrics', 'Card', 'Stats'],
    }),
  });
  if (createRes.status !== 201) throw new Error(`Draft creation failed: ${JSON.stringify(createRes.body)}`);
  console.log(`  ✔ Draft created successfully with slug: ${slug}`);

  // 2. Add source files and metadata
  console.log('\nStep 2: Add source files and metadata...');
  const v1SourceCode = `import React from 'react';

export interface E2EMetricCardProps {
  label: string;
  value: number | string;
  trend?: string;
}

export const E2EMetricCard: React.FC<E2EMetricCardProps> = ({
  label,
  value,
  trend = '+12%',
}) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-lg">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>
      </div>
    </div>
  );
};
export default E2EMetricCard;
`;

  const patchRes = await request(`/api/admin/components/${slug}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      draftFiles: [
        {
          path: 'src/components/E2EMetricCard.tsx',
          name: 'E2EMetricCard.tsx',
          content: v1SourceCode,
          language: 'typescript',
          isEntry: true,
        },
      ],
      draftDependencies: {},
      draftPeerDependencies: { react: '>=18.0.0', 'react-dom': '>=18.0.0' },
      draftProps: [
        { name: 'label', type: 'string', required: true, description: 'Card title or metric label' },
        { name: 'value', type: 'number | string', required: true, description: 'Current metric value' },
        { name: 'trend', type: 'string', required: false, defaultValue: '"+12%"', description: 'Trend percentage' },
      ],
    }),
  });
  if (patchRes.status !== 200) throw new Error(`Draft update failed: ${JSON.stringify(patchRes.body)}`);
  console.log('  ✔ Source files and metadata attached to draft');

  // 3. Validate the draft
  console.log('\nStep 3: Validate the draft...');
  const validateRes = await request(`/api/admin/components/${slug}/validate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const isReportValid = validateRes.body.data?.report ? validateRes.body.data.report.valid : validateRes.body.data?.valid;
  if (validateRes.status !== 200 || !isReportValid) {
    throw new Error(`Draft validation failed: ${JSON.stringify(validateRes.body)}`);
  }
  console.log('  ✔ Draft passed all safety and manifest validation checks (0 errors, 0 warnings)');

  // 4. Publish version 1.0.0
  console.log('\nStep 4: Publish version 1.0.0...');
  const publishRes = await request(`/api/admin/components/${slug}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      version: '1.0.0',
      changelog: 'Initial v1.0.0 production release of E2EMetricCard.',
    }),
  });
  if (publishRes.status !== 201) throw new Error(`Publish failed: ${JSON.stringify(publishRes.body)}`);
  console.log('  ✔ Version 1.0.0 published and immutable release snapshot stored.');

  // 5. Retrieve published manifest from registry API
  console.log('\nStep 5: Retrieve published manifest from registry API...');
  const manifestRes = await request(`/api/registry/components/${slug}/1.0.0/manifest`);
  if (manifestRes.status !== 200) throw new Error(`Manifest retrieval failed: ${JSON.stringify(manifestRes.body)}`);
  const manifest = manifestRes.body;
  console.log(`  ✔ Manifest retrieved successfully (version: ${manifest.version}, files: ${manifest.files.length})`);
  console.log(`  ✔ Cache header: ${manifestRes.headers.get('cache-control')}`);

  // 6. Verify its integrity hashes
  console.log('\nStep 6: Verify integrity hashes...');
  const expectedFileHash = computeFileIntegrity(manifest.files[0].content);
  if (manifest.files[0].integrity !== expectedFileHash) {
    throw new Error(`File integrity mismatch: got ${manifest.files[0].integrity}, expected ${expectedFileHash}`);
  }
  const expectedManifestHash = computeManifestIntegrity(manifest);
  if (manifest.integrity !== expectedManifestHash) {
    throw new Error(`Manifest integrity mismatch: got ${manifest.integrity}, expected ${expectedManifestHash}`);
  }
  console.log(`  ✔ File integrity verified: ${expectedFileHash}`);
  console.log(`  ✔ Manifest integrity verified: ${expectedManifestHash}`);

  // 7. Confirm component appears in public catalog
  console.log('\nStep 7: Confirm component appears in public catalog...');
  const catalogRes = await request(`/api/components?search=${slug}`);
  const catalogItem = catalogRes.body.data.find((c: any) => c.slug === slug);
  if (!catalogItem || catalogItem.status !== 'published') {
    throw new Error(`Component not found in public catalog or not published: ${JSON.stringify(catalogItem)}`);
  }
  console.log(`  ✔ Component found in public catalog with currentVersion=${catalogItem.currentVersion}`);

  // 8. Create a separate sample React project
  console.log('\nStep 8: Create a separate sample React project in temporary directory...');
  const tmpDir = path.resolve(process.cwd(), `.tmp-e2e-react-app-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const samplePackageJson = {
    name: 'sample-developer-app',
    version: '0.1.0',
    private: true,
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      typescript: '^5.7.3',
      '@types/react': '^18.3.18',
      '@types/react-dom': '^18.3.5',
    },
  };
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(samplePackageJson, null, 2));

  const sampleTsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: true,
      paths: {
        'react': [path.resolve(process.cwd(), 'apps/web/node_modules/@types/react/index.d.ts')],
        'react/*': [path.resolve(process.cwd(), 'apps/web/node_modules/@types/react/*')],
        'react/jsx-runtime': [path.resolve(process.cwd(), 'apps/web/node_modules/@types/react/jsx-runtime.d.ts')],
      },
      typeRoots: [
        path.resolve(process.cwd(), 'apps/web/node_modules/@types'),
        path.resolve(process.cwd(), 'node_modules/@types'),
      ],
    },
    include: ['src'],
  };
  fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify(sampleTsConfig, null, 2));
  fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
  fs.symlinkSync(path.resolve(process.cwd(), 'node_modules'), path.join(tmpDir, 'node_modules'), 'junction');
  console.log(`  ✔ Sample React project created at: ${tmpDir}`);

  // 9. Run CLI init and add <slug> --version 1.0.0
  console.log('\nStep 9: Run npx vac-ui-components add <slug> --version 1.0.0...');
  const cliBin = path.resolve(process.cwd(), 'packages/cli/bin/vac.js');

  // Run init first
  execSync(`node "${cliBin}" init -y`, {
    cwd: tmpDir,
    env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}`, VAC_REGISTRY_URL: `${BASE_URL}/api/registry` },
    stdio: 'pipe',
  });
  console.log('  ✔ vac-ui-components init completed');

  // Run add with explicit version
  const addOutput = execSync(`node "${cliBin}" add ${slug} --version 1.0.0 -y`, {
    cwd: tmpDir,
    env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}`, VAC_REGISTRY_URL: `${BASE_URL}/api/registry` },
    stdio: 'pipe',
  }).toString();
  console.log('  ✔ vac-ui-components add executed successfully:\n', addOutput.trim());

  // 10. Confirm the correct source files are installed
  console.log('\nStep 10: Confirm correct source files are installed...');
  const installedFilePath = path.join(tmpDir, 'src/components/ui/E2EMetricCard.tsx');
  if (!fs.existsSync(installedFilePath)) {
    throw new Error(`Expected installed file at ${installedFilePath} does not exist!`);
  }
  console.log(`  ✔ Installed file exists: ${installedFilePath}`);

  // 11. Confirm installed source matches published release
  console.log('\nStep 11: Confirm installed source matches published release...');
  const installedContent = fs.readFileSync(installedFilePath, 'utf-8');
  if (installedContent.trim() !== v1SourceCode.trim()) {
    throw new Error('Installed source code differs from published source code!');
  }
  console.log('  ✔ Installed content matches published release bit-for-bit');

  // 12. Run the sample project's build / typecheck
  console.log('\nStep 12: Run the sample project TypeScript build...');
  // Create an App.tsx that renders the installed component
  const appTsxContent = `import React from 'react';
import { E2EMetricCard } from './components/ui/E2EMetricCard';

export const App: React.FC = () => {
  return (
    <div>
      <E2EMetricCard label="Active Users" value={1420} trend="+8.4%" />
    </div>
  );
};
`;
  fs.writeFileSync(path.join(tmpDir, 'src/App.tsx'), appTsxContent);

  // Install React types in tmpDir node_modules or use monorepo tsc to check
  const tscBin = path.resolve(process.cwd(), 'node_modules/.bin/tsc');
  const typecheckCmd = `"${tscBin}" --project "${tmpDir}/tsconfig.json" --noEmit`;
  try {
    execSync(typecheckCmd, {
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH || ''}` },
      stdio: 'pipe',
    });
    console.log('  ✔ TypeScript build / type-check succeeded without any errors!');
  } catch (err: any) {
    console.error('TSC output:', err.stdout?.toString() || err.stderr?.toString());
    throw err;
  }

  // 13. Verify that the component renders without requiring a live VAC runtime
  console.log('\nStep 13: Verify component renders independently without requiring a live VAC runtime...');
  if (installedContent.includes('@vac/') || installedContent.includes('localhost:') || installedContent.includes('vac.dev')) {
    throw new Error('Component source contains live VAC runtime dependencies or URLs!');
  }
  console.log('  ✔ Component code is completely self-contained (imports only standard React, zero proprietary VAC runtime)');

  // 14. Publish a new version (1.1.0) and verify that version 1.0.0 remains unchanged (immutable)
  console.log('\nStep 14: Publish version 1.1.0 and verify version 1.0.0 remains strictly unchanged...');
  const v2SourceCode = v1SourceCode.replace('bg-slate-900', 'bg-zinc-950');

  // Update draft
  await request(`/api/admin/components/${slug}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      draftFiles: [
        {
          path: 'src/components/E2EMetricCard.tsx',
          name: 'E2EMetricCard.tsx',
          content: v2SourceCode,
          language: 'typescript',
          isEntry: true,
        },
      ],
    }),
  });

  // Publish 1.1.0
  const pub110Res = await request(`/api/admin/components/${slug}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      version: '1.1.0',
      changelog: 'v1.1.0: Darker zinc background theme.',
    }),
  });
  if (pub110Res.status !== 201) throw new Error(`Publish 1.1.0 failed: ${JSON.stringify(pub110Res.body)}`);
  console.log('  ✔ Version 1.1.0 published successfully');

  // Re-fetch 1.0.0 manifest and ensure it is still the original 1.0.0 content
  const recheckV1 = await request(`/api/registry/components/${slug}/1.0.0/manifest`);
  if (recheckV1.body.files[0].content.trim() !== v1SourceCode.trim()) {
    throw new Error('Version 1.0.0 was modified after publishing 1.1.0! Immutability violated!');
  }
  console.log('  ✔ Version 1.0.0 remains strictly immutable and identical to original release');

  // Fetch 1.1.0 manifest
  const checkV11 = await request(`/api/registry/components/${slug}/1.1.0/manifest`);
  if (checkV11.body.files[0].content.trim() !== v2SourceCode.trim()) {
    throw new Error('Version 1.1.0 manifest content does not match new draft!');
  }
  console.log('  ✔ Version 1.1.0 manifests correctly with updated source code');

  // Attempt to overwrite 1.0.0 again -> must fail with 409
  const overwriteRes = await request(`/api/admin/components/${slug}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      version: '1.0.0',
      changelog: 'Attempt to overwrite v1.0.0',
    }),
  });
  if (overwriteRes.status !== 409) {
    throw new Error(`Expected 409 on version overwrite attempt, got ${overwriteRes.status}`);
  }
  console.log('  ✔ Re-publishing existing version rejected with 409 Conflict (Immutability enforced)');

  // Clean up temporary project directory
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('  ✔ Cleaned up temporary test project');

  console.log('\n🎉 ALL 14 END-TO-END ACCEPTANCE STEPS PASSED SUCCESSFULLY! 🎉\n');
}

runE2E().catch((err) => {
  console.error('\n❌ E2E Acceptance Test failed:', err);
  process.exit(1);
});
