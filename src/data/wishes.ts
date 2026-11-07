import wishes from './wishes.json';

export default wishes;
export const WISH_COUNT = wishes.length;
export const wishIds = new Set(wishes.map(wish => wish.id));
