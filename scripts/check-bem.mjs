import { readFile } from 'node:fs/promises';

const css = await readFile('src/styles/global.css', 'utf8');
const classes = [...new Set([...css.matchAll(/\.([a-z][a-z0-9_-]*)/g)].map(m => m[1]))];
const bem = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const invalid = classes.filter(name => !bem.test(name));
if (invalid.length) throw Error(`Invalid BEM class names: ${invalid.join(', ')}`);
console.log(`${classes.length} CSS class names follow BEM syntax. This does not verify DOM relationships.`);
