import { type Browser, chromium, type Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { getUniqueSlugs } from 'utils/uniqify';
import ora from 'ora';

/**
 * Paparazzo options
 */
export type Options = {
  /**
   * Image format
   */
  format: 'png' | 'jpeg';
  /**
   * Directory relative to current working directory to output images.
   */
  outDir?: string;
  /**
   * If format is "jpeg", the quality of the image, 0 - 100.
   */
  quality?: number;
  /**
   * Crawl links on the page at `url` and look for more pappable shots.
   */
  crawl?: boolean;
};

const DEFAULT_OPTS: Options = {
  format: 'jpeg',
};

function isNotNull<T>(value: T | null): value is T {
  return value !== null && value !== undefined;
}

export class Paparazzo {
  private browser?: Browser;
  private page?: Page;

  private async getMetaContent(page: Page, metaName: string) {
    const metaTag = await page.locator(`meta[name="${metaName}"]`);
    if ((await metaTag.count()) === 0) return null;
    const content = await metaTag.getAttribute('content');
    return content;
  }

  private async getLinks(url: string) {
    if (!this.page) throw new Error("Can't call this method directly");
    await this.page.goto(url);

    const aTags = await this.page.locator('a');
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
    opts: Options
  ) {
    if (!this.page) throw new Error("Can't call this method directly");

    const { format, quality, outDir } = opts;

    await this.page.goto(url);

    const metaOutname = await this.getMetaContent(this.page, 'paparazzo:name');
    const metaSelector = await this.getMetaContent(
      this.page,
      'paparazzo:selector'
    );

    const element = this.page.locator(metaSelector || selector);
    await element.waitFor({ state: 'visible', timeout: 500 });

    const boundingBox = await element.boundingBox();

    if (!element || !boundingBox) {
      console.warn(
        `Unable to find element with selector "${metaSelector || selector}" on page: ${url}`
      );
      return;
    }

    const elementScreenshotBuffer = await this.page.screenshot({
      type: format,
      quality: format === 'jpeg' ? quality || 90 : undefined,
      clip: boundingBox,
      scale: 'css',
    });

    const imgFileName = (metaOutname || outName) + `.${format}`;
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
    opts: Options = DEFAULT_OPTS
  ) {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    const { crawl, format } = opts;

    if (!['jpeg', 'png'].includes(format))
      throw new Error('Invalid image format');

    let urls: string[] = [url];

    if (crawl) {
      const crawledUrls = await this.getLinks(url);
      urls = [...urls, ...crawledUrls];
    }

    const outNames = getUniqueSlugs(urls);

    console.log(`📸 Shooting ${urls.length} sites`);

    const spinner = ora({
      text: `Starting up...`,
      spinner: 'line',
    }).start();

    for (const url of urls) {
      spinner.text = url;
      const i = urls.indexOf(url);
      const outName = outNames[i];
      await this.getShot(url, selector, outName, opts);
    }
    spinner.text = 'Finished';
    spinner.succeed();

    this.browser.close();
  }
}
