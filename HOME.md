# paparazzo

[![npm version](https://badge.fury.io/js/%40reuters-graphics%2Fpaparazzo.svg)](https://badge.fury.io/js/%40reuters-graphics%2Fpaparazzo)

Paparazzo is a CLI tool for taking screenshots of page elements.

It was first developed to help with the onerous task of making share cards for news applications at Reuters.

**Glossary:** A _paparazzo_ is a member of the _paparazzi_. Someone who's had their photo snapped by such a one is said to have been _papped_.

## Features

- 🎭 Screenshots and page rendering with Playwright
- 🖼️ PNG and JPEG formats
- 🔗 Crawl linked pages to papp

## Quickstart

### Install

```bash
npm i -D @reuters-graphics/paparazzo
```

### CLI

```console
Usage
  $ paparazzo [url] [options]

Options
  -s, --selector    CSS selector of element on the page to screenshot  (default body)
  -f, --format      Output image format, either "jpeg" or "png"  (default jpeg)
  -o, --outDir      Directory to output image, relative to cwd  (default paparazzo)
  -q, --quality     Image quality (jpeg format only)  (default 90)
  -c, --crawl       Crawl links for other pages  (default false)
  -a, --await       CSS selecor of element to await before taking screenshot
  -t, --timeout     Milliseconds to wait for the page to settle before taking screenshot
  -v, --version     Displays current version
  -h, --help        Displays this message
```

```console
paparazzo https://mysite.com/page/ -s ".sharecard" -o "sharecards/" --crawl
```

### Module

```javascript
import Paparazzo from '@reuters-graphics/paparazzo';

const paparazzo = new Paparazzo();

await paparazzo.shoot('https://mysite.com/page/', '.sharecard', {
  crawl: true,
  outDir: './sharecards/',
});
```

## Setting up pages for paparazzo

### Crawlable pages

You can create a network of pages to papp, especially useful for programmatically generating them in your newsapp.

Add links to other pages on your main page and specify the `crawl` option to follow those links.

```html
<!-- mysite.com/ -->
<div class="paparazzo">
  <!-- ... element to screenshot ... -->
</div>

<!-- Links to other pages -->
<a href="./second-page-to-papp/">Second</a>
<a href="./third-page-to-papp/">Third</a>
```

```html
<!-- mysite.com/second-page-to-papp/ -->
<div class="paparazzo">
  <!-- ... element to screenshot ... -->
</div>
```

Paparazzo will create output names for your images using the unique bits of the URL, but you can specify your own using special meta tags in each page.

### Meta tags

You can add meta tags to each page to tell paparazzo how to papp your page.

#### `paparazzo:name`

Custom output name (without the file extension, which will be automatically appended based on image format).

```html
<!-- Will generate my-image-name.png/jpeg in your output directory -->
<meta name="paparazzo:name" content="my-image-name" />
<!-- my-folder/my-image-name.png/jpeg in your output directory -->
<meta name="paparazzo:name" content="my-folder/my-image-name" />
```

#### `paparazzo:selector`

Custom CSS selector for the element to papp in your page.

```html
<meta name="paparazzo:selector" content="#my-image-id" />
<!-- ... or ... -->
<meta name="paparazzo:selector" content=".my-image-class" />
```
