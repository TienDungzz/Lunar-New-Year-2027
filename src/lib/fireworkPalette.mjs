export const FIREWORK_PALETTE = {
  gold: '#ffd477', red: '#ff6856', white: '#fff2d6',
  pink: '#ff92d0', cyan: '#77e8ff', violet: '#c6a0ff', lime: '#c7f58a',
};
const LETTER_COLORS = ['gold','pink','cyan','red','violet','lime','white'];
export function getLetterColor(seed, index) {
  return LETTER_COLORS[(Math.abs(Math.trunc(seed))+index*3)%LETTER_COLORS.length];
}
