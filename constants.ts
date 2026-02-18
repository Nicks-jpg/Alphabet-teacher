
import { Letter } from './types';

export interface ExtendedLetter extends Letter {
  pronunciation: string;
}

export const UKRAINIAN_ALPHABET: ExtendedLetter[] = [
  { char: 'А', isDifficult: false, pronunciation: 'А' },
  { char: 'Б', isDifficult: true, pronunciation: 'Бе' },
  { char: 'В', isDifficult: true, pronunciation: 'Ве' },
  { char: 'Г', isDifficult: false, pronunciation: 'Ге' },
  { char: 'Ґ', isDifficult: false, pronunciation: 'Ґе' },
  { char: 'Д', isDifficult: false, pronunciation: 'Де' },
  { char: 'Е', isDifficult: false, pronunciation: 'Е' },
  { char: 'Є', isDifficult: false, pronunciation: 'Є' },
  { char: 'Ж', isDifficult: false, pronunciation: 'Же' },
  { char: 'З', isDifficult: false, pronunciation: 'Зе' },
  { char: 'И', isDifficult: false, pronunciation: 'И' },
  { char: 'І', isDifficult: false, pronunciation: 'І' },
  { char: 'Ї', isDifficult: false, pronunciation: 'Ї' },
  { char: 'Й', isDifficult: true, pronunciation: 'Й' },
  { char: 'К', isDifficult: false, pronunciation: 'Ка' },
  { char: 'Л', isDifficult: false, pronunciation: 'Ел' },
  { char: 'М', isDifficult: true, pronunciation: 'Ем' },
  { char: 'Н', isDifficult: true, pronunciation: 'Ен' },
  { char: 'О', isDifficult: false, pronunciation: 'О' },
  { char: 'П', isDifficult: false, pronunciation: 'Пе' },
  { char: 'Р', isDifficult: false, pronunciation: 'Ер' },
  { char: 'С', isDifficult: false, pronunciation: 'Ес' },
  { char: 'Т', isDifficult: false, pronunciation: 'Те' },
  { char: 'У', isDifficult: false, pronunciation: 'У' },
  { char: 'Ф', isDifficult: false, pronunciation: 'Еф' },
  { char: 'Х', isDifficult: false, pronunciation: 'Ха' },
  { char: 'Ц', isDifficult: true, pronunciation: 'Це' },
  { char: 'Ч', isDifficult: true, pronunciation: 'Че' },
  { char: 'Ш', isDifficult: true, pronunciation: 'Ша' },
  { char: 'Щ', isDifficult: false, pronunciation: 'Ща' },
  { char: 'Ь', isDifficult: false, pronunciation: 'М’який знак' },
  { char: 'Ю', isDifficult: false, pronunciation: 'Ю' },
  { char: 'Я', isDifficult: false, pronunciation: 'Я' },
];

export const DIFFICULT_PAIRS = [
  ['Б', 'В'],
  ['Ч', 'Ц'],
  ['Н', 'М'],
  ['Ш', 'Щ'],
  ['Й', 'И']
];
