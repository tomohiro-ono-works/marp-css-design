import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '../scripts/build-marp.mjs';

test('h/v aliases and long form have identical rendering', () => {
  assert.equal(compile(':::: h\n::: card coral-light\nX\n:::\n::::'), compile(':::: horizontal\n::: card coral-light\nX\n:::\n::::'));
  assert.equal(compile(':::: v\n::: card\nX\n:::\n::::'), compile(':::: vertical\n::: card\nX\n:::\n::::'));
});
test('card and chip colors are independent', () => {
  const result = compile('::: card turquoise-light\n\n[重要]{.coral-dark} と [未着手]{.yellow-light}\n\n:::');
  assert.match(result, /class="card tone-turquoise-light"/);
  assert.match(result, /<span class="tone-chip tone-coral-dark">重要<\/span>/);
  assert.match(result, /<span class="tone-chip tone-yellow-light">未着手<\/span>/);
});
test('parent card with nested h/v/card and blank placeholder', () => {
  const doc = `:::::: card turquoise-light hover
**親**
::::: h
:::: card aqua-light
**左**
::::
:::: v
::: card coral-dark
**右上**
:::
::: blank
:::
::::
:::::
::::::`;
  const result = compile(doc);
  assert.equal((result.match(/<div/g) || []).length, 6);
  assert.equal((result.match(/<\/div>/g) || []).length, 6);
  assert.match(result, /class="blank"/);
  assert.match(result, /class="box horizontal"/);
  assert.match(result, /class="box vertical"/);
});
test('do not parse directives or code examples, including inline code', () => {
  const sample = '---\nmarp: true\n---\n```md\n::: card aqua-light\n[注意]{.coral-dark}\n```\n`[注意]{.coral-dark}`';
  assert.equal(compile(sample).trimEnd(), sample);
});
test('render HTML escapes within label; do not modify links, images or invalid syntax', () => {
  const out = compile('[A&B]{.coral-light} ![画像]{.aqua-light} [doc](test.md) [bad]{.unknown-dark}');
  assert.match(out, /A&amp;B/);
  assert.match(out, /!\[画像\]\{\.aqua-light\}/);
  assert.match(out, /\[doc\]\(test.md\)/);
  assert.match(out, /\[bad\]\{\.unknown-dark\}/);
});
test('validate container syntax', () => {
  assert.throws(() => compile(':::: card aqua-light\n::: card coral-light\n:::\n:::'), /closing fence/);
  assert.throws(() => compile('::: card\n:::: v'), /fewer colons/);
  assert.throws(() => compile('::: card nope\n:::'), /unsupported modifier/);
  assert.throws(() => compile('::: card\nBody'), /unclosed container/);
});
