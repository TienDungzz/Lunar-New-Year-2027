import test from 'node:test';
import assert from 'node:assert/strict';
import { findLongFunctions } from '../scripts/audit-functions.mjs';

test('function audit includes blank lines, comments and both boundary lines', () => {
  const source = 'function handler() {\n\n// comment\nreturn 1;\n}';
  assert.deepEqual(findLongFunctions(source,'fixture.ts',5),[]);
  assert.deepEqual(findLongFunctions(source,'fixture.ts',4),[{ file: 'fixture.ts', name: 'handler', line: 1, lines: 5 }]);
});
test('function audit handles TSX, typed arrows, methods and nested callbacks', () => {
  const source = 'const Panel = (): JSX.Element => {\nreturn <button onClick={() => {\nvoid 0;\n}}>Hi</button>;\n};\nclass Service {\nrun(): void {\nvoid 0;\n}\n}';
  const findings = findLongFunctions(source,'fixture.tsx',2);
  assert.ok(findings.some(f => f.name === 'Panel' && f.lines === 5));
  assert.ok(findings.some(f => f.name === 'run' && f.lines === 3));
});
test('function audit ignores declarations without implementations and brace-like strings', () => {
  assert.deepEqual(findLongFunctions('declare function noop(): void;\nconst text = "function a() {";','fixture.ts',1),[]);
});
