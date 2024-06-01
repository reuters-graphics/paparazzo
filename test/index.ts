import 'dotenv/config';

import { Paparazzo } from './../dist/index.js';
import { compareImages } from './utils/images.js';
import expect from 'expect.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { globSync } from 'glob';
import liveServer from 'live-server';
import path from 'path';
import portfinder from 'portfinder';
import { rimrafSync } from 'rimraf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GEN_SNAPSHOTS = !!process.env.GEN_SNAPSHOT;

const SNAPSHOTS_DIR = GEN_SNAPSHOTS ? 'test/_snapshots' : 'test/_temp';
const SNAPSHOTS_PATH = path.join(__dirname, '..', SNAPSHOTS_DIR);

const paparazzo = new Paparazzo();

let port: number;

describe('test Paparazzo', function () {
  this.timeout(20000);

  before(async function () {
    port = await portfinder.getPortPromise({ port: 3000 });
    liveServer.start({
      port,
      open: false,
      root: path.join(__dirname, 'site'),
    });
    // Wait a sec for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    rimrafSync(SNAPSHOTS_PATH);
    if (!fs.existsSync(SNAPSHOTS_PATH))
      fs.mkdirSync(SNAPSHOTS_PATH, { recursive: true });
  });

  after(function () {
    liveServer.shutdown();
    if (!GEN_SNAPSHOTS) rimrafSync(SNAPSHOTS_PATH);
  });

  it('Should snap', async function () {
    const URL = `http://127.0.0.1:${port}`;
    await paparazzo.shoot(URL, '.paparazzo', {
      format: 'png',
      outDir: SNAPSHOTS_DIR,
      crawl: true,
    });
    if (GEN_SNAPSHOTS) return;
    const snapshotsDir = path.resolve(__dirname, '_snapshots');
    const tempDir = path.resolve(__dirname, '_temp');
    const imageFiles = globSync('**/*.png', { cwd: snapshotsDir });

    for (const relativePath of imageFiles) {
      if (relativePath.endsWith('awaited.png')) continue;
      const snapshotPath = path.join(snapshotsDir, relativePath);
      const tempPath = path.join(tempDir, relativePath);

      if (!fs.existsSync(tempPath)) {
        throw new Error(`Missing comparison image for ${relativePath}`);
      }

      const numDiffPixels = await compareImages(snapshotPath, tempPath);
      expect(numDiffPixels).to.be.lessThan(100);
    }
  });

  it('Should wait to snap', async function () {
    const URL = `http://127.0.0.1:${port}/await/`;
    await paparazzo.shoot(URL, '.paparazzo', {
      format: 'png',
      outDir: SNAPSHOTS_DIR,
      awaitElement: '.awaited',
    });
    if (GEN_SNAPSHOTS) return;
    const snapshotsDir = path.resolve(__dirname, '_snapshots');
    const tempDir = path.resolve(__dirname, '_temp');
    const imageFiles = globSync('**/awaited.png', { cwd: snapshotsDir });

    for (const relativePath of imageFiles) {
      const snapshotPath = path.join(snapshotsDir, relativePath);
      const tempPath = path.join(tempDir, relativePath);

      if (!fs.existsSync(tempPath)) {
        throw new Error(`Missing comparison image for ${relativePath}`);
      }

      const numDiffPixels = await compareImages(snapshotPath, tempPath);
      expect(numDiffPixels).to.be.lessThan(100);
    }
  });
});
