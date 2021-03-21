import express from 'express';
import { getBracketCharacters, verifyPerma } from '../lib/animebracket';
import jimp from 'jimp';
import { loadResizedImage, saveImageJpeg, ImageType } from '../lib/image';

const IMAGES_ACROSS = 3;
const IMAGES_DOWN = 3;
const TILE_WIDTH: number = 100;
const TILE_HEIGHT: number = 100;

export async function cardHandler(req: express.Request, res: express.Response) {
  const perma = req.params.perma.split('.').shift();

  if (!verifyPerma(perma)) {
    console.log('invalid perma', perma);
    res.status(400).send();
    return;
  }

  const characters = await getBracketCharacters(perma);
  if (!Array.isArray(characters)) {
    res.status(404).send();
    return;
  }

  characters.sort((a, b) => {
    let retVal = 1;
    // character's been eliminated; sort them to the back
    if (!a.seed) {
      retVal = 1;
    } else if (a.seed < b.seed || !b.seed) {
      retVal = -1;
    }
    return retVal;
  });

  const cardImage: jimp = await jimp.create(
    IMAGES_ACROSS * TILE_WIDTH,
    IMAGES_DOWN * TILE_HEIGHT
  );

  await Promise.all(
    Array.apply(null, Array(IMAGES_ACROSS * IMAGES_DOWN)).map(
      async (item: any, index: number) => {
        const x = index % IMAGES_ACROSS;
        const y = Math.floor(index / IMAGES_ACROSS);
        const character = characters[index];
        const image = await loadResizedImage(character.image, TILE_WIDTH, TILE_HEIGHT);
        cardImage.blit(image, x * TILE_WIDTH, y * TILE_HEIGHT);
      }
    )
  );

  const jpeg = await saveImageJpeg(perma, ImageType.Card, cardImage);
  res.contentType('image/jpeg').send(jpeg);
};
