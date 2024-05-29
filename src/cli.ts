import { name, version } from '../package.json';

import { Paparazzo } from '@reuters-graphics/paparazzo';
import sade from 'sade';
import updateNotifier from 'update-notifier';

updateNotifier({ pkg: { name, version } }).notify();

const prog = sade('paparazzo');

prog.version(version);

prog
  .command('greet <name>')
  .option('-h, --happy', 'Happy to see them?')
  .action((name, opts) => {
    const paparazzo = new Paparazzo();
    paparazzo.greet(name, opts.happy);
  });

prog.parse(process.argv);
