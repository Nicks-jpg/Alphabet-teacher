
import { Letter } from './types';

export interface ExtendedLetter extends Letter {
  pronunciation: string;
  word: string;
  image: string;
}

export const UKRAINIAN_ALPHABET: ExtendedLetter[] = [
  { char: 'А', isDifficult: false, pronunciation: 'А', word: 'Акула', image: 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png' },
  { char: 'Б', isDifficult: true, pronunciation: 'Бе', word: 'Барабан', image: 'https://cdn-icons-png.flaticon.com/512/125/125033.png' },
  { char: 'В', isDifficult: true, pronunciation: 'Ве', word: 'Ведмідь', image: 'https://cdn-icons-png.flaticon.com/512/616/616554.png' },
  { char: 'Г', isDifficult: false, pronunciation: 'Ге', word: 'Гриб', image: 'https://cdn-icons-png.flaticon.com/512/828/828308.png' },
  { char: 'Ґ', isDifficult: false, pronunciation: 'Ґе', word: 'Ґудзик', image: 'https://cdn-icons-png.flaticon.com/512/822/822102.png' },
  { char: 'Д', isDifficult: false, pronunciation: 'Де', word: 'Дім', image: 'https://cdn-icons-png.flaticon.com/512/609/609803.png' },
  { char: 'Е', isDifficult: false, pronunciation: 'Е', word: 'Екскаватор', image: 'https://cdn-icons-png.flaticon.com/512/2361/2361730.png' },
  { char: 'Є', isDifficult: false, pronunciation: 'Є', word: 'Єнот', image: 'https://cdn-icons-png.flaticon.com/512/1998/1998610.png' },
  { char: 'Ж', isDifficult: false, pronunciation: 'Же', word: 'Жаба', image: 'https://cdn-icons-png.flaticon.com/512/3069/3069176.png' },
  { char: 'З', isDifficult: false, pronunciation: 'Зе', word: 'Заєць', image: 'https://cdn-icons-png.flaticon.com/512/427/427490.png' },
  { char: 'И', isDifficult: false, pronunciation: 'И', word: 'Кит', image: 'https://cdn-icons-png.flaticon.com/512/3069/3069225.png' },
  { char: 'І', isDifficult: false, pronunciation: 'І', word: 'Індичка', image: 'https://cdn-icons-png.flaticon.com/512/1864/1864472.png' },
  { char: 'Ї', isDifficult: false, pronunciation: 'Ї', word: 'Їжак', image: 'https://cdn-icons-png.flaticon.com/512/3069/3069223.png' },
  { char: 'Й', isDifficult: true, pronunciation: 'Й', word: 'Йогурт', image: 'https://cdn-icons-png.flaticon.com/512/2916/2916053.png' },
  { char: 'К', isDifficult: false, pronunciation: 'Ка', word: 'Кіт', image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png' },
  { char: 'Л', isDifficult: false, pronunciation: 'Ел', word: 'Лев', image: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
  { char: 'М', isDifficult: true, pronunciation: 'Ем', word: 'Мавпа', image: 'https://cdn-icons-png.flaticon.com/512/616/616551.png' },
  { char: 'Н', isDifficult: true, pronunciation: 'Ен', word: 'Ножиці', image: 'https://cdn-icons-png.flaticon.com/512/1086/1086581.png' },
  { char: 'О', isDifficult: false, pronunciation: 'О', word: 'Оса', image: 'https://cdn-icons-png.flaticon.com/512/3069/3069202.png' },
  { char: 'П', isDifficult: false, pronunciation: 'Пе', word: 'Пес', image: 'https://cdn-icons-png.flaticon.com/512/616/616440.png' },
  { char: 'Р', isDifficult: false, pronunciation: 'Ер', word: 'Риба', image: 'https://cdn-icons-png.flaticon.com/512/3069/3069170.png' },
  { char: 'С', isDifficult: false, pronunciation: 'Ес', word: 'Слон', image: 'https://cdn-icons-png.flaticon.com/512/616/616489.png' },
  { char: 'Т', isDifficult: false, pronunciation: 'Те', word: 'Тигр', image: 'https://cdn-icons-png.flaticon.com/512/616/616474.png' },
  { char: 'У', isDifficult: false, pronunciation: 'У', word: 'Удав', image: 'https://cdn-icons-png.flaticon.com/512/616/616467.png' },
  { char: 'Ф', isDifficult: false, pronunciation: 'Еф', word: 'Фламінго', image: 'https://cdn-icons-png.flaticon.com/512/3069/3069197.png' },
  { char: 'Х', isDifficult: false, pronunciation: 'Ха', word: 'Хом’як', image: 'https://cdn-icons-png.flaticon.com/512/616/616558.png' },
  { char: 'Ц', isDifficult: true, pronunciation: 'Це', word: 'Цукерка', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' },
  { char: 'Ч', isDifficult: true, pronunciation: 'Че', word: 'Черепаха', image: 'https://cdn-icons-png.flaticon.com/512/616/616493.png' },
  { char: 'Ш', isDifficult: true, pronunciation: 'Ша', word: 'Шарф', image: 'https://cdn-icons-png.flaticon.com/512/3028/3028441.png' },
  { char: 'Щ', isDifficult: false, pronunciation: 'Ща', word: 'Щітка', image: 'https://cdn-icons-png.flaticon.com/512/272/272186.png' },
  { char: 'Ь', isDifficult: false, pronunciation: 'М’який знак', word: 'Кінь', image: 'https://cdn-icons-png.flaticon.com/512/616/616533.png' },
  { char: 'Ю', isDifficult: false, pronunciation: 'Ю', word: 'Юрта', image: 'https://cdn-icons-png.flaticon.com/512/3359/3359876.png' },
  { char: 'Я', isDifficult: false, pronunciation: 'Я', word: 'Яблуко', image: 'https://cdn-icons-png.flaticon.com/512/415/415682.png' },
];

export const DIFFICULT_PAIRS = [
  ['Б', 'В'],
  ['Ч', 'Ц'],
  ['Н', 'М'],
  ['Ш', 'Щ'],
  ['Й', 'И']
];
