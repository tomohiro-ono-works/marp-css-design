#!/usr/bin/env node
/**
 * Compile the human-friendly Marp source notation into ordinary Markdown/HTML.
 * The result can be previewed by the official Marp for VS Code extension.
 * No third-party runtime packages are needed for this conversion.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const COLORS = new Set([
  'turquoise-dark', 'turquoise-light', 'aqua-dark', 'aqua-light',
  'gray-dark', 'gray-light', 'coral-dark', 'coral-light',
  'mono-dark', 'mono-light', 'yellow-dark', 'yellow-light',
]);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SLIDES = [
  ['02-slide-patterns.source.md', '02-slide-patterns.md'],
  ['03-object-patterns.source.md', '03-object-patterns.md'],
];

function htmlEscape(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function renderLabels(text) {
  // Skip inline code, escaped brackets, image syntax, and ordinary links.
  // The only accepted inline extension is [short text]{.color-shade}.
  let output = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '`') {
      let n = 1;
      while (text[i + n] === '`') n++;
      const delimiter = '`'.repeat(n);
      const end = text.indexOf(delimiter, i + n);
      if (end !== -1) {
        output += text.slice(i, end + n);
        i = end + n;
        continue;
      }
    }
    if (text[i] === '[' && (i === 0 || !['\\', '!'].includes(text[i - 1]))) {
      const closing = text.indexOf(']', i + 1);
      if (closing !== -1 && text.slice(closing + 1, closing + 3) === '{.') {
        const end = text.indexOf('}', closing + 3);
        if (end !== -1) {
          const tone = text.slice(closing + 3, end);
          const label = text.slice(i + 1, closing);
          if (COLORS.has(tone) && label && !label.includes('[')) {
            output += `<span class="tone-chip tone-${tone}">${htmlEscape(label)}</span>`;
            i = end + 1;
            continue;
          }
        }
      }
    }
    output += text[i++];
  }
  return output;
}

function parseContainer(fence, words, lineNo) {
  const [type, ...mods] = words.trim().split(/\s+/);
  let classes;
  switch (type) {
    case 'h': case 'horizontal': classes = ['box', 'horizontal']; break;
    case 'v': case 'vertical': classes = ['box', 'vertical']; break;
    case 'card': classes = ['card']; break;
    case 'paper': classes = ['box', 'vertical', 'paper']; break;
    case 'blank': classes = ['blank']; break;
    case 'hero': classes = ['box', 'horizontal', 'hero']; break;
    case 'hero-media': classes = ['box', 'vertical', 'hero-media']; break;
    case 'hero-copy': classes = ['box', 'vertical', 'hero-copy']; break;
    default: throw Error(`Line ${lineNo}: unknown container '${type}'.`);
  }
  const validLayout = new Set(['hover', 'medium', 'tall', 'center', 'equal', 'flow']);
  let colorCount = 0;
  for (const mod of mods) {
    if (COLORS.has(mod)) {
      if (type !== 'card') throw Error(`Line ${lineNo}: a color can only decorate a card.`);
      colorCount++;
      classes.push(`tone-${mod}`);
    } else if (validLayout.has(mod)) {
      if (mod === 'hover' && type === 'blank') throw Error(`Line ${lineNo}: blank cards cannot have shadows.`);
      classes.push(mod);
    } else {
      throw Error(`Line ${lineNo}: unsupported modifier '${mod}'.`);
    }
  }
  if (colorCount > 1) throw Error(`Line ${lineNo}: card has multiple colors.`);
  return `<div class="${classes.join(' ')}">`;
}

export function compile(source, filename = '<input>') {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  const output = [];
  const stack = [];
  let codeFence = null;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const code = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (code) {
      if (!codeFence) codeFence = { symbol: code[1][0], width: code[1].length };
      else if (code[1][0] === codeFence.symbol && code[1].length >= codeFence.width && !code[2].trim()) codeFence = null;
      output.push(line);
      continue;
    }
    if (codeFence) {
      output.push(line);
      continue;
    }
    const match = line.match(/^ {0,3}(:{3,})(?:[ \t]+(.*?))?[ \t]*$/);
    if (match) {
      const [, fence, words] = match;
      if (words) {
        if (stack.length && fence.length >= stack.at(-1).length) {
          throw Error(`${filename}:${index + 1}: nested container must use fewer colons than its parent.`);
        }
        const opening = parseContainer(fence, words, index + 1);
        stack.push({ length: fence.length, line: index + 1 });
        output.push('', opening, '');
      } else {
        const active = stack.pop();
        if (!active || active.length !== fence.length) {
          throw Error(`${filename}:${index + 1}: closing fence must exactly match its opening fence.`);
        }
        output.push('', '</div>', '');
      }
    } else {
      output.push(renderLabels(line));
    }
  }
  if (stack.length) throw Error(`${filename}:${stack.at(-1).line}: unclosed container.`);
  // Collapse spurious blank lines generated around HTML block delimiters.
  return output.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

export async function build() {
  for (const [input, output] of SLIDES) {
    const content = await readFile(join(ROOT, input), 'utf8');
    const built = compile(content, input);
    const path = join(ROOT, output);
    const current = await readFile(path, 'utf8').catch(() => null);
    if (current !== built) {
      await writeFile(path, built, 'utf8');
      console.log(`Updated ${output}`);
    } else {
      console.log(`Unchanged ${output}`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await build();
    if (process.argv.includes('--watch')) {
      console.log('Watching *.source.md (Ctrl+C to stop)...');
      let pending = Promise.resolve();
      for (const [source] of SLIDES) {
        watch(join(ROOT, source), () => {
          pending = pending.then(build).catch(err => console.error(err.message));
        });
      }
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}
