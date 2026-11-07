import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
const docs = (await readdir('docs')).filter(f => f.endsWith('.md'));
const readme = await readFile('README.md', 'utf8');
const errors = [];
for (const name of docs) if (!readme.includes(`](docs/${name})`)) errors.push(`README missing ${name}`);
for (const name of ['README.md', ...docs.map(n => `docs/${n}`)]) {
  const text = await readFile(name, 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|#)/.test(match[1])) continue;
    try { await access(path.resolve(path.dirname(name), match[1].split('#')[0])); } catch { errors.push(`${name}: ${match[1]}`); }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log(`Documentation links valid; README indexes ${docs.length} files.`);
