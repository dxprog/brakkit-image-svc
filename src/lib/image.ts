import jimp from 'jimp';
import { writeFile } from 'fs';
import path from 'path';

import { verifyPerma } from './animebracket';

export enum ImageType {
  Banner = 'banner',
  Card = 'card'
}

export async function loadResizedImage(
  imageUrl: string,
  width: number,
  height: number
): Promise<jimp> {
  const image = await jimp.read(imageUrl);
  image.resize(width, height);
  return image;
}

export async function saveImageJpeg(
  perma: string,
  imageType: ImageType,
  image: jimp
): Promise<Buffer> {
  // perma should have already been verified, but need to secure
  // the actual point of entry from my future self
  if (!verifyPerma(perma)) {
    throw new Error(`[saveImageJpeg] Invalid perma "${perma}"`);
  }

  const jpegBuffer = await image.getBufferAsync('image/jpeg');
  return new Promise((resolve, reject) => {
    writeFile(
      path.resolve(process.cwd(), 'cache', imageType, `${perma}.jpg`),
      jpegBuffer,
      err => {
        if (err) {
          reject(err);
        } else {
          resolve(jpegBuffer);
        }
      }
    );
  });
}
