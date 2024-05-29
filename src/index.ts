import { type Browser, chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { getDefaultOutNames } from 'utils/uniqify';

type Opts = {
  format: 'png' | 'jpeg';
  outDir?: string;
  quality?: number;
  crawl?: boolean;
};

const DEFAULT_OPTS: Opts = {
  format: 'jpeg',
};

function isNotNull<T>(value: T | null): value is T {
  return value !== null && value !== undefined;
}

export class Paparazzo {
  browser?: Browser;

  private async getMetaContent(page: Page, metaName: string) {
    const metaTag = page.locator(`meta[name="${metaName}"]`);
    const content = await metaTag.getAttribute('content');
    return content;
  }

  private async getLinks(url: string) {
    if (!this.browser) throw new Error("Can't call this method directly");
    const page = await this.browser.newPage();
    await page.goto(url);

    const aTags = await page.locator('a');
    const links = await aTags.evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href'))
    );

    const absoluteLinks = links
      .filter(isNotNull)
      .map((link) => new URL(link, url).href);
    return absoluteLinks;
  }

  private async getShot(
    url: string,
    selector: string,
    outName: string,
    opts: Opts
  ) {
    if (!this.browser) throw new Error("Can't call this method directly");

    const { format, quality, outDir } = opts;

    const page = await this.browser.newPage();
    await page.goto(url);

    const metaOutname = await this.getMetaContent(page, 'paparazzo:outname');
    const metaSelector = await this.getMetaContent(page, 'paparazzo:selector');

    await page.waitForSelector(metaSelector || selector);
    const element = await page.locator(metaSelector || selector);

    if (!element) {
      console.warn(
        `Unable to find element with selector "${metaSelector || selector}" on page: ${url}`
      );
      return;
    }

    const elementScreenshotBuffer = await element.screenshot({
      type: format,
      quality: quality || 90,
    });

    const imgFileName = metaOutname || outName + `.${format}`;
    const imgPath = path.join(
      process.cwd(),
      outDir || 'paparazzo',
      imgFileName
    );
    fs.writeFileSync(imgPath, elementScreenshotBuffer);
  }

  async shoot(
    url: string,
    selector: string = 'body',
    opts: Opts = DEFAULT_OPTS
  ) {
    this.browser = await chromium.launch({ headless: true });
    const { crawl, format } = opts;

    if (!['jpeg', 'png'].includes(format))
      throw new Error('Invalid image format');

    let urls: string[] = [url];

    if (crawl) {
      const crawledUrls = await this.getLinks(url);
      urls = [...urls, ...crawledUrls];
    }

    const outNames = getDefaultOutNames(urls);

    for (const url of urls) {
      const i = urls.indexOf(url);
      const outName = outNames[i];
      await this.getShot(url, selector, outName, opts);
    }

    this.browser.close();
  }
}
