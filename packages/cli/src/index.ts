import { Command } from 'commander';
import { initCommand } from './commands/init';
import { addCommand } from './commands/add';

export const program = new Command();

program
  .name('vac-ui')
  .description('VAC-UI-COMPONENTS Developer CLI — Install animated, glassmorphic UI components into your React project')
  .version('0.1.0', '-V, --cli-version', 'output the CLI tool version');

program
  .command('init')
  .description('Initialize VAC component library configuration in a React project')
  .option('-y, --yes', 'Skip prompts and accept defaults')
  .option('-d, --components-dir <dir>', 'Custom components destination directory')
  .option('-r, --registry <url>', 'Custom registry URL')
  .action((options) => {
    return initCommand(options);
  });

program
  .command('add <component>')
  .description('Download and install a versioned component into your project')
  .option('-v, --version <version>', 'Specific release version to install (defaults to latest)')
  .option('-y, --yes', 'Skip prompts and automatically accept overwrites')
  .option('--overwrite', 'Overwrite existing component files')
  .option('-p, --path <dir>', 'Custom destination directory for component files')
  .option('-r, --registry <url>', 'Custom registry URL')
  .option('--install-deps', 'Install declared missing dependencies (requires explicit user consent)')
  .action((component: string, options) => {
    return addCommand(component, options);
  });

export function run(): void {
  program.parse(process.argv);
}
