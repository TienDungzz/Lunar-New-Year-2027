import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export function findLongFunctions(source, file, limit = 60) {
  const ast = ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  const findings = [];
  function visit(node) {
    if (ts.isFunctionLike(node) && node.body) {
      const start = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1;
      const end = ast.getLineAndCharacterOfPosition(node.getEnd()).line+1;
      const name = node.name?.getText(ast) ?? (ts.isVariableDeclaration(node.parent) ? node.parent.name.getText(ast) : '<callback>');
      if (end-start+1 > limit) findings.push({ file, name, line: start, lines: end-start+1 });
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  return findings;
}

async function sourceFiles(folder) {
  const entries = await readdir(folder,{ withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => {
    const file = path.join(folder,entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(?:[cm]?js|tsx?)$/.test(file) ? [file] : [];
  }));
  return groups.flat().sort();
}

async function main() {
  const config = JSON.parse(await readFile('project-standards.json','utf8'));
  const limit = config.code.maxFunctionLines;
  const files = (await Promise.all(['src','scripts','tests'].map(sourceFiles))).flat();
  const findings = (await Promise.all(files.map(async file => findLongFunctions(await readFile(file,'utf8'),file.replaceAll('\\','/'),limit)))).flat();
  if (process.argv.includes('--json')) console.log(JSON.stringify({ limit, files: files.length, findings },null,2));
  else {
    console.log(`Function audit: ${files.length} files, inclusive limit ${limit} lines; ${findings.length} findings.`);
    for (const finding of findings) console.log(`${finding.file}:${finding.line} ${finding.name}: ${finding.lines} lines`);
    if (findings.length) console.log('Not compliant with the function-length target; audit only. Use --strict to fail on findings.');
  }
  if (process.argv.includes('--strict') && findings.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
