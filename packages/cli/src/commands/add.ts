import pc from 'picocolors';
import path from 'path';
import readline from 'readline';
import { spawnSync } from 'child_process';
import { detectProject, loadVacConfig } from '../config';
import { RegistryClient } from '../registry-client';
import { installRelease } from '../installer';

export interface AddOptions {
  version?: string;
  yes?: boolean;
  overwrite?: boolean;
  path?: string;
  registry?: string;
  cwd?: string;
  installDeps?: boolean;
}

const SAFE_PKG_REGEX = /^(@[a-zA-Z0-9_.-]+\/)?[a-zA-Z0-9_.-]+(@[a-zA-Z0-9^~><=._-]+)?$/;

async function askConsent(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) {
    return false;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(['y', 'yes'].includes(answer.trim().toLowerCase()));
    });
  });
}

export async function addCommand(slug: string, options: AddOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const cleanSlug = (slug || '').toLowerCase().trim();

  if (!cleanSlug) {
    console.error(pc.red('Error: Component slug is required. Example: npx vac-ui-components add animated-login-form'));
    process.exit(1);
  }

  console.log(pc.bold(pc.cyan(`\n✦ VAC-UI-COMPONENTS — Installing "${cleanSlug}"\n`)));

  try {
    // 1. Detect project & load config
    const project = detectProject(cwd);
    const config = loadVacConfig(cwd);

    const registryUrl =
      options.registry ||
      config?.registryUrl ||
      process.env.VAC_REGISTRY_URL ||
      'http://localhost:4000/api/registry';

    const client = new RegistryClient(registryUrl);

    // 2. Resolve release manifest
    console.log(`${pc.dim('Fetching release manifest from registry...')}`);
    const manifest = await client.getReleaseManifest(cleanSlug, options.version);

    console.log(
      `${pc.green('✔')} Resolved ${pc.bold(manifest.name)} ${pc.magenta(`v${manifest.version}`)}`
    );

    if (manifest.deprecated) {
      console.log(
        pc.yellow(
          `⚠ Notice: This release is marked as deprecated: ${manifest.deprecationReason || 'See release notes.'}`
        )
      );
    }

    // 3. Install release
    const targetDir = options.path || config?.componentsDir || project.componentsDir;
    const result = await installRelease(manifest, project, {
      cwd,
      targetDir,
      overwrite: options.overwrite || options.yes,
      installDeps: options.installDeps,
    });

    if (result.skippedFiles.length > 0) {
      console.log(
        pc.yellow(
          `\n⚠ Skipped ${result.skippedFiles.length} file(s) that already exist (use --overwrite to replace):`
        )
      );
      result.skippedFiles.forEach((f) => console.log(pc.dim(`  - ${path.relative(cwd, f)}`)));
    }

    console.log(`\n${pc.green('✔')} Component source files written successfully:`);
    result.installedFiles.forEach((f) => {
      console.log(`  ${pc.green('✓')} ${pc.dim(path.relative(cwd, f))}`);
    });

    // 4. Missing dependencies report & safe installation
    if (result.missingDependencies.length > 0) {
      console.log(pc.bold(pc.yellow('\n✦ Required Dependencies:')));
      console.log('The following packages are declared by this component and should be added:');
      result.missingDependencies.forEach((dep) => console.log(`  • ${pc.cyan(dep)}`));

      const pm = project.packageManager;
      const installCmd =
        pm === 'pnpm'
          ? `pnpm add ${result.missingDependencies.join(' ')}`
          : pm === 'yarn'
          ? `yarn add ${result.missingDependencies.join(' ')}`
          : pm === 'bun'
          ? `bun add ${result.missingDependencies.join(' ')}`
          : `npm install ${result.missingDependencies.join(' ')}`;

      if (options.installDeps) {
        console.log(pc.bold(pc.cyan(`\n✦ Automatic Dependency Installation Requested`)));
        const consent =
          options.yes ||
          (await askConsent(pc.bold(`Would you like to install these packages using ${pm}? [y/N] `)));

        if (consent) {
          const safePkgs = result.missingDependencies.filter((d) => SAFE_PKG_REGEX.test(d));
          if (safePkgs.length > 0) {
            console.log(pc.dim(`Executing ${pm} install...`));
            const args = pm === 'npm' ? ['install', ...safePkgs] : ['add', ...safePkgs];
            const child = spawnSync(pm, args, { stdio: 'inherit', cwd });
            if (child.status === 0) {
              console.log(pc.green(`✔ Dependencies installed successfully.`));
            } else {
              console.warn(
                pc.yellow(
                  `⚠ Dependency installation process exited with code ${child.status}. You may install manually:`
                )
              );
              console.log(pc.bold(pc.bgBlack(pc.white(`  ${installCmd}  `))));
            }
          }
        } else {
          console.log(pc.yellow('Automatic dependency installation skipped. You can install manually:'));
          console.log(pc.bold(pc.bgBlack(pc.white(`  ${installCmd}  `))));
        }
      } else {
        console.log(`\nRun this command to install:`);
        console.log(pc.bold(pc.bgBlack(pc.white(`  ${installCmd}  `))));
      }
    }

    // 5. Usage instructions
    console.log(pc.bold(pc.green(`\n✔ Successfully installed ${manifest.name}!`)));
    console.log(`\nYou can now import and use this component in your project:`);
    console.log(
      pc.dim(
        `  import { ${manifest.name.replace(/[^a-zA-Z0-9]/g, '')} } from '${result.importPath}';\n`
      )
    );
  } catch (err: any) {
    console.error(pc.red(`\n✖ Installation failed: ${err.message}\n`));
    process.exit(1);
  }
}
