import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';

export const compareImages = (img1Path: string, img2Path: string) => {
  return new Promise((resolve, reject) => {
    const img1 = fs
      .createReadStream(img1Path)
      .pipe(new PNG())
      .on('parsed', doneReading);
    const img2 = fs
      .createReadStream(img2Path)
      .pipe(new PNG())
      .on('parsed', doneReading);
    let filesRead = 0;

    function doneReading() {
      if (++filesRead < 2) return;

      const { width, height } = img1;
      if (width !== img2.width || height !== img2.height) {
        return reject(new Error('Image dimensions do not match.'));
      }

      const diff = new PNG({ width, height });
      const numDiffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 }
      );
      if (numDiffPixels > 0) {
        diff
          .pack()
          .pipe(
            fs.createWriteStream(path.join(path.dirname(img1Path), 'diff.png'))
          );
      }
      resolve(numDiffPixels);
    }
  });
};
