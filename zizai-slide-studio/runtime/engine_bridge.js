'use strict';
/** Node built-ins only. Engine is external to the VSIX. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

function expandPath(input, workspaceRoot) {
  if (typeof input !== 'string' || !input.trim()) return '';
  let out = input.trim().replace(/\$\{workspaceFolder\}/g, workspaceRoot || '');
  if (out.startsWith('~' + path.sep) || out === '~') out = path.join(os.homedir(), out.slice(1));
  return out;
}
function resolveLocal(input, workspaceRoot) {
  const expanded = expandPath(input, workspaceRoot);
  if (!expanded) return '';
  return path.isAbsolute(expanded) ? path.resolve(expanded) : path.resolve(workspaceRoot || process.cwd(), expanded);
}
function resolveEngine(enginePath, workspaceRoot) {
  if (!enginePath || !enginePath.trim()) {
    throw new Error('Pythonエンジンが未設定です。「Zizai Slides: Pythonエンジンのフォルダーを設定」を実行してください。');
  }
  let root = resolveLocal(enginePath, workspaceRoot);
  if (path.basename(root) === 'zizai_slides' && fs.existsSync(path.join(root, 'worker.py'))) {
    root = path.dirname(root);
  }
  const worker = path.join(root, 'zizai_slides', 'worker.py');
  const slideCss = path.join(root, 'zizai_slides', 'assets', 'slide.css');
  for (const location of [worker, slideCss, path.join(root, 'zizai_slides', '__init__.py')]) {
    if (!fs.existsSync(location) || !fs.statSync(location).isFile()) {
      throw new Error(`エンジンのファイルがありません: ${location}\nPythonエンジンの解凍先を選択してください。`);
    }
  }
  return { root, worker, slideCss };
}
function pythonCandidates(configured, workspaceRoot, platform = process.platform) {
  if (typeof configured === 'string' && configured.trim()) {
    const executable = expandPath(configured, workspaceRoot);
    // A literal command name is allowed; paths are resolved relative to the workspace.
    const command = /^[a-z\d_.-]+$/i.test(executable) ? executable : resolveLocal(configured, workspaceRoot);
    return [{ command, args: [] }];
  }
  const options = [];
  if (workspaceRoot) {
    const local = platform === 'win32'
      ? path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe')
      : path.join(workspaceRoot, '.venv', 'bin', 'python');
    if (fs.existsSync(local)) options.push({ command: local, args: [] });
  }
  return options.concat(platform === 'win32'
    ? [{ command: 'py', args: ['-3'] }, { command: 'python', args: [] }, { command: 'python3', args: [] }]
    : [{ command: 'python3', args: [] }, { command: 'python', args: [] }]);
}

function runOnce(candidate, engine, payload, spawnFn = spawn) {
  return new Promise((resolve, reject) => {
    const child = spawnFn(candidate.command, [...candidate.args, '-I', '-S', engine.worker], {
      cwd: engine.root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], shell: false,
    });
    const chunks = [], stderr = [];
    let size = 0, ended = false;
    const done = (err, result) => {
      if (ended) return;
      ended = true;
      clearTimeout(timeout);
      if (err) reject(err); else resolve(result);
    };
    const timeout = setTimeout(() => { child.kill(); done(new Error('Pythonの実行がタイムアウトしました。')); }, 90000);
    child.on('error', err => done(err));
    child.stdout.on('data', chunk => {
      size += chunk.length;
      if (size > 20_000_000) {
        child.kill(); done(new Error('Pythonエンジンの出力が20MBを超えました。'));
      } else chunks.push(chunk);
    });
    child.stderr.on('data', chunk => stderr.push(chunk));
    child.on('close', code => {
      if (ended) return;
      const stdout = Buffer.concat(chunks).toString('utf8');
      try {
        const response = JSON.parse(stdout);
        if (!response.ok) return done(new Error(response.error || 'Pythonの処理に失敗しました。'));
        done(null, response);
      } catch (e) {
        done(new Error(`Pythonプロトコルエラー (code=${code}): ${Buffer.concat(stderr).toString('utf8').slice(0, 700) || stdout.slice(0, 700)}`));
      }
    });
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify(payload), 'utf8');
  });
}
async function executeEngine(engine, pythonPath, workspaceRoot, payload, spawnFn = spawn) {
  const missing = [];
  for (const candidate of pythonCandidates(pythonPath, workspaceRoot)) {
    try {
      return await runOnce(candidate, engine, payload, spawnFn);
    } catch (err) {
      if (err.code === 'ENOENT') { missing.push(candidate.command); continue; }
      throw err;
    }
  }
  throw new Error(`Pythonを起動できません（${missing.join(', ')}）。設定 zizaiSlides.pythonPath を確認してください。`);
}
module.exports = { resolveEngine, pythonCandidates, executeEngine, expandPath, resolveLocal };
