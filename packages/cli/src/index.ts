import { Command } from 'commander';

export const program = new Command();

program
  .name('vac-ui')
  .description('VAC-UI-COMPONENTS Developer CLI')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize VAC component library configuration in a React project')
  .action(() => {
    console.log('VAC UI initialized.');
  });

program
  .command('add <component>')
  .description('Add a component to your project')
  .action((component: string) => {
    console.log(`Adding component: ${component}`);
  });
