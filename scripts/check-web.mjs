import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((script) => script.trim());

if (scripts.length === 0) {
  throw new Error('No inline JavaScript was found in index.html');
}

for (let i = 0; i < scripts.length; i += 1) {
  new vm.Script(scripts[i], { filename: 'index.html:inline-script-' + (i + 1) + '.js' });
}

const requiredIds = ['home', 'closet', 'studio', 'three', 'add', 'scene', 'file'];
for (const id of requiredIds) {
  if (!new RegExp('id=["\\x27]' + id + '["\\x27]').test(html)) {
    throw new Error('Required application element is missing: #' + id);
  }
}

console.log('Web checks passed: parsed ' + scripts.length + ' inline script(s) and found all required app elements.');
