import { name, version } from '../package.json';

import { Paparazzo } from '@reuters-graphics/paparazzo';
import sade from 'sade';
import updateNotifier from 'update-notifier';

updateNotifier({ pkg: { name, version } }).notify();

sade('paparazzo [url]', true)
  .version(version)
  .describe('Take screenshots of page elements')
  .option(
    '-s, --selector',
    'CSS selector of element on the page to screenshot',
    'body'
  )
  .option('-f, --format', 'Output image format, either "jpeg" or "png"', 'jpeg')
  .option(
    '-o, --outDir',
    'Directory to output image, relative to cwd',
    'paparazzo'
  )
  .option('-q, --quality', 'Image quality (jpeg format only)', 90)
  .option('-c, --crawl', 'Crawl links for other pages', false)
  .option(
    '-a, --await',
    'CSS selecor of element to await before taking screenshot'
  )
  .option(
    '-t, --timeout',
    'Milliseconds to wait for the page to settle before taking screenshot'
  )
  .action(async (url: string, opts: Record<string, string>) => {
    const {
      selector,
      format,
      quality,
      crawl,
      outDir,
      await: awaitEl,
      timeout,
    } = opts;

    const paparazzo = new Paparazzo();

    const OPTS = {
      format: format as 'jpeg' | 'png',
      outDir: outDir as string,
      quality: parseInt(quality) || 90,
      crawl: !!crawl,
      awaitElement: awaitEl,
      timeout: timeout ? parseInt(timeout) : undefined,
    };

    await paparazzo.shoot(url, selector, OPTS);
  })
  .parse(process.argv);
