import 'dotenv/config';

import { Paparazzo } from './../dist/index.js';
import expect from 'expect.js';
import { fileURLToPath } from 'url';
import liveServer from 'live-server';
import mock from 'mock-fs';
import path from 'path';
import portfinder from 'portfinder';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GEN_SNAPSHOTS = !!process.env.GEN_SNAPSHOT;

const paparazzo = new Paparazzo();

let port: number;

describe('test Paparazzo', function () {
  this.timeout(20000);

  before(async function () {
    port = await portfinder.getPortPromise({
      port: 3000,
    });
    liveServer.start({
      port,
      open: false,
      root: path.join(__dirname, 'site'),
    });
    // Wait a sec for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));
    if (!GEN_SNAPSHOTS) mock({});
  });

  after(function () {
    liveServer.shutdown();
    if (!GEN_SNAPSHOTS) mock.restore();
  });

  it('Should snap', async function () {
    const URL = `http://127.0.0.1:${port}`;
    await paparazzo.shoot(URL, '.paparazzo', {
      format: 'jpeg',
      outDir: 'test/_snapshots',
      crawl: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 5000));
    expect(true).to.be(true);
  });
});
