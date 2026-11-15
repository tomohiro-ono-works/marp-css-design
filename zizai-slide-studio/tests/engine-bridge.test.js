'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { resolveEngine, pythonCandidates, executeEngine } = require('../runtime/engine_bridge');
const ROOT = path.resolve(__dirname, '..');
const ENGINE = process.env.ZIZAI_ENGINE_ROOT || ROOT;
const PYTHON = process.env.ZIZAI_TEST_PYTHON || 'python';

test('an explicit external engine root, or its package directory, resolves', () => {
  const root = resolveEngine(ENGINE, path.dirname(ENGINE));
  assert.equal(root.root, path.resolve(ENGINE));
  assert.equal(resolveEngine(path.join(ENGINE, 'zizai_slides')).root, root.root);
  assert.ok(fs.existsSync(root.slideCss));
});
test('missing engine is reported instead of falling back to bundled engine', () => {
  assert.throws(() => resolveEngine('', ROOT), /未設定/);
  assert.throws(() => resolveEngine(path.join(ROOT, 'nonexistent-engine'), ROOT), /ファイルがありません/);
});
test('pythonPath accepts a chosen virtual environment, workspace expansion', () => {
  const expected = path.resolve(ROOT, '.venv', 'Scripts', 'python.exe');
  assert.equal(pythonCandidates('${workspaceFolder}/.venv/Scripts/python.exe', ROOT)[0].command, expected);
});
test('python auto-detection prefers workspace virtualenv when installed', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zizai-test-'));
  try {
    fs.mkdirSync(path.join(tmp, '.venv', 'bin'), { recursive: true });
    fs.writeFileSync(path.join(tmp, '.venv', 'bin', 'python'), '');
    assert.equal(pythonCandidates('', tmp, 'linux')[0].command, path.join(tmp, '.venv', 'bin', 'python'));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
test('VSIX bridge can call the isolated external Python engine and export PPTX', async () => {
  const engine = resolveEngine(ENGINE);
  const ping = await executeEngine(engine, PYTHON, ROOT, {action:'ping'});
  assert.equal(ping.ok, true);
  assert.equal(ping.version, '0.6.1');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zizai-export-'));
  try {
    const output = path.join(tmp,'export.pptx');
    const response = await executeEngine(engine, PYTHON, ROOT, {
      action: 'convert', mode: 'editable', output,
      text: '# 独立エンジン\n\n::: card coral-light\n\n**編集可能**\n\n:::',
      sourceDir:tmp, stylePath:null,
    });
    assert.equal(response.ok, true);
    assert.ok(fs.statSync(output).size > 4000);
    assert.equal(fs.readFileSync(output).subarray(0,2).toString(), 'PK');
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});
