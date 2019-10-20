import * as express from 'express';
import jimp = require('jimp');
import * as path from 'path';
const request = require('request-promise-native');

import { Dictionary, Point } from '../interfaces/common';
import { ICharacter } from '../interfaces/character';

const BANNER_WIDTH: number = 2000;
const BANNER_HEIGHT: number = 500;
const TILE_WIDTH: number = 100;
const TILE_HEIGHT: number = 100;
const BLUR_AMOUNT: number = 3;

/**
 * Returns an array of seeds used to determine image placement
 *
 * @param width Width of banner
 * @param height Height of banner
 */
export function generateTileMap(width: number, height: number): Dictionary<Point> {
  const tileCount: number = width * height;
  const order: Array<number> = [];
  for (let i: number = 0; i < tileCount; i++) {
    if (i % 2 === 0) {
      order.push(i + 1);
    } else {
      order.unshift(i + 1);
    }
  }

  const retVal: Dictionary<Point> = {};
  let dir: number = 1;
  let y: number = 0;
  let x: number = 0;
  order.forEach(seed => {
    retVal[seed] = { x, y};
    x += dir;
    if (x >= width || x < 0) {
      dir = -dir;
      x = x < 0 ? 0 : width - 1;
      y++;
    }
  });

  return retVal;
}

export async function generateBanner(characters: Array<ICharacter>): Promise<jimp> {
  const image: jimp = await jimp.create(BANNER_WIDTH, BANNER_HEIGHT);

  const chars: Dictionary<ICharacter> = {};
  const eliminated: Array<ICharacter> = [];
  characters.forEach((char: ICharacter) => {
    if (char.seed > 0) {
      chars[char.seed] = char;
    } else {
      eliminated.push(char);
    }
  });

  const pointMap: Dictionary<Point> = generateTileMap(BANNER_WIDTH / TILE_WIDTH, BANNER_HEIGHT / TILE_HEIGHT);

  // Async the loading and drawing of the character images
  await Promise.all(Object.keys(pointMap).map(async (seed: string) => {
    const char: ICharacter = chars[seed] || eliminated.shift();
    const point = pointMap[seed];

    if (char) {
      const charImg: jimp = await jimp.read(char.image);

      charImg.resize(TILE_WIDTH, TILE_HEIGHT);
      image.blit(charImg, point.x * TILE_WIDTH, point.y * TILE_HEIGHT);
    }
  }));

  const overlay: jimp = await jimp.read(path.resolve(process.cwd(), 'static', 'gradient-overlay.png'));
  image.blur(BLUR_AMOUNT);
  return image.blit(overlay, 0, 0);;
}

export function bannerHandler(req: express.Request, res: express.Response) {
  const perma = req.params.perma.split('.').shift();

  request({
    url: `https://animebracket.com/api/characters/${perma}`,
    json: true
  }).then(async (data: Array<ICharacter>) => {
    const image = await generateBanner(data);
    const jpeg = await image.getBufferAsync('image/jpeg');
    res.contentType('image/jpeg').send(jpeg);
  });
};