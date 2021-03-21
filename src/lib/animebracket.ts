import request from 'request-promise-native';
import { ICharacter } from '../interfaces/character';

export async function getBracketCharacters(
  bracketPerma: string
): Promise<Array<ICharacter>> {
  return request({
    url: `https://animebracket.com/api/characters/${bracketPerma}`,
    json: true
  });
}

export function verifyPerma(perma: string): Boolean {
  return /^[\w-_]+$/.test(perma);
}
