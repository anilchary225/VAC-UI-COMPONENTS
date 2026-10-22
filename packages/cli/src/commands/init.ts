import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import { detectProject, loadVacConfig, saveVacConfig } from '../config';

export interface InitOptions {
  cwd?: string;
  yes?: boolean;
  componentsDir?: string;
  registry?: string;
}

export async function initCommand(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();

  console.log(pc.bold(pc.cyan('\n✦ VAC-UI-COMPONENTS — Project Initialization\n')));

  try {
    const project = detectProject(cwd);
    console.log(`${pc.green('✔')} React project detected at: ${pc.dim(cwd)}`);
    console.log(`  • Language: ${project.isTypeScript ? pc.bold('TypeScript') : pc.yellow('JavaScript')}`);
    console.log(`  • Tailwind CSS: ${project.hasTailwind ? pc.green('Detected') : pc.dim('Not configured')}`);
    console.log(`  • Package Manager: ${pc.cyan(project.packageManager)}`);

    const existingConfig = loadVacConfig(cwd);
    if (existingConfig && !options.yes) {
      console.log(pc.yellow('\n⚠ vac.config.json already exists in this directory.'));
    }

    const componentsDir = options.componentsDir || (project.isTypeScript ? 'src/components/ui' : 'src/components');
    const registryUrl = options.registry || process.env.VAC_REGISTRY_URL || 'http://localhost:4000/api/registry';

    const config = {
      $schema: 'https://vac.dev/schema/vac.config.json',
      typescript: project.isTypeScript,
      tailwind: project.hasTailwind,
      componentsDir,
      registryUrl,
    };

    saveVacConfig(cwd, config);
    console.log(`\n${pc.green('✔')} Created ${pc.bold('vac.config.json')}:`);
    console.log(pc.dim(JSON.stringify(config, null, 2)));

    // Create components directory if it doesn't exist
    const fullComponentsDir = path.join(cwd, componentsDir);
    if (!fs.existsSync(fullComponentsDir)) {
      fs.mkdirSync(fullComponentsDir, { recursive: true });
      console.log(`${pc.green('✔')} Created component directory: ${pc.dim(componentsDir)}`);
    }

    console.log(pc.bold(pc.green('\nInitialization complete! Ready to add components.')));
    console.log(`Try adding your first component:`);
    console.log(pc.cyan(`  npx vac-ui-components add animated-login-form\n`));
  } catch (err: any) {
    console.error(pc.red(`\n✖ Initialization failed: ${err.message}\n`));
    process.exit(1);
  }
}
