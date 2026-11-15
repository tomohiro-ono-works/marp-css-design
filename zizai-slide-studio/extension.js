'use strict';
/* Zizai Slide Studio extension host — built-in VS Code/Node APIs only. */
const vscode = require('vscode');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { resolveEngine, executeEngine } = require('./runtime/engine_bridge');

const panels = new Map();

function settingsFor(document) {
  const config = vscode.workspace.getConfiguration('zizaiSlides', document?.uri);
  const workspace = document ? vscode.workspace.getWorkspaceFolder(document.uri) : undefined;
  const folder = workspace?.uri.fsPath || (document && document.uri.scheme === 'file' ? path.dirname(document.uri.fsPath) : process.cwd());
  return { config, folder };
}
function engineFor(document) {
  const { config, folder } = settingsFor(document);
  return resolveEngine(config.get('enginePath', ''), folder);
}
async function execPython(document, payload) {
  const engine = engineFor(document);
  const { config, folder } = settingsFor(document);
  return executeEngine(engine, config.get('pythonPath', ''), folder, payload);
}

function configuredSlideCss(document) {
  const setting = vscode.workspace.getConfiguration('zizaiSlides', document?.uri).get('slideCssPath', '').trim();
  if (!setting) {
    // Each Markdown slide may carry a neighboring stylesheet.
    // Example: report.slide.md + report.slide.css.
    if (document?.uri.scheme === 'file' && /\.md$/i.test(document.uri.fsPath)) {
      const nearby = document.uri.fsPath.replace(/\.md$/i, '.css');
      if (fs.existsSync(nearby) && fs.statSync(nearby).isFile()) return nearby;
    }
    return null;
  }
  const workspace = document ? vscode.workspace.getWorkspaceFolder(document.uri) : null;
  const base = workspace ? workspace.uri.fsPath : (document ? path.dirname(document.uri.fsPath) : process.cwd());
  const full = path.isAbsolute(setting) ? setting : path.resolve(base, setting);
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) throw new Error(`スライド用CSSが見つかりません: ${full}`);
  return full;
}
async function parseDocument(document) {
  const result = await execPython(document, { action: 'parse', text: document.getText(), stylePath: configuredSlideCss(document) });
  return result.deck;
}

function validLocalImage(src, baseDir) {
  if (!src || /[\x00-\x1f]/.test(src) || /^(?:[a-z][a-z\d+.-]*:|\/|\\)/i.test(src)) return null;
  const target = path.resolve(baseDir, src);
  const relative = path.relative(baseDir, target);
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) return null;
  if (!/\.(png|jpe?g|gif|webp)$/i.test(relative)) return null;
  return target;
}
function applyImages(deck, sourceDir, mapper) {
  return {
    ...deck, slides: deck.slides.map(slide => ({
      ...slide,
      layout: {
        ...slide.layout,
        images: (slide.layout?.images || []).map(item => {
          const local = validLocalImage(item.path, sourceDir);
          return { ...item, src: local && fs.existsSync(local) ? mapper(local) : '' };
        })
      }
    }))
  };
}
function buildPreviewHtml(webview, context, document, engine) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const slideCss = webview.asWebviewUri(vscode.Uri.file(engine.slideCss));
  const uiCss = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'ui.css'));
  const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.js'));
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
<link rel="stylesheet" href="${slideCss}"><link rel="stylesheet" href="${uiCss}">
<title>Zizai Slide Studio</title></head><body>
<div id="app"><div class="toolbar">
  <div id="file-name" class="brand">Zizai Slides</div>
  <button id="prev" title="前のスライド">◀</button><span id="position">0 / 0</span><button id="next" title="次のスライド">▶</button>
  <button id="zoom-out" title="縮小">−</button><button id="zoom-reset" title="倍率を戻す"><span id="zoom-label">100%</span></button><button id="zoom-in" title="拡大">＋</button>
  <button id="reload" title="再読込">更新</button>
  <button id="export-html">HTML</button><button id="export-pdf">PDF</button>
  <button id="export-pptx-image">PPTX（画像）</button><button id="export-pptx-editable" class="primary">PPTX（編集）</button>
</div><div class="body"><aside class="sidebar"><div class="sidebar-title">SLIDES</div><nav id="slides"></nav></aside>
<main class="main"><div id="stage"><div id="slide-host"></div><div id="empty">スライドを解析しています…</div></div></main></div>
<div id="status">Pythonエンジンへ接続中</div></div>
<script nonce="${nonce}" src="${script}"></script></body></html>`;
}
async function exportPPTX(document, mode) {
  if (!document) return;
  try {
    const label = mode === 'image' ? '画像' : '編集';
    const target = await vscode.window.showSaveDialog({
      title: `PowerPoint（${label}）を保存`,
      defaultUri: vscode.Uri.file(document.uri.fsPath.replace(/\.[^.]+$/, '') + `.${mode}.pptx`),
      filters: { PowerPoint: ['pptx'] }
    });
    if (!target) return;
    await execPython(document, {
      action: 'convert', mode, text: document.getText(), stylePath: configuredSlideCss(document),
      sourceDir: path.dirname(document.uri.fsPath), output: target.fsPath
    });
    vscode.window.showInformationMessage(`PowerPoint（${label}）を保存しました: ${target.fsPath}`);
  } catch (error) {
    vscode.window.showErrorMessage(`PowerPoint出力エラー: ${error.message}`);
  }
}
async function exportDeck(document, asPDF = false) {
  if (!document) return;
  try {
    const mode = asPDF ? 'pdf' : 'html';
    const target = await vscode.window.showSaveDialog({
      title: asPDF ? 'スライドをPDFで保存' : 'スライドをHTMLで保存',
      defaultUri: vscode.Uri.file(document.uri.fsPath.replace(/\.[^.]+$/, '') + `.${mode}`),
      filters: asPDF ? { PDF: ['pdf'] } : { HTML: ['html'] }
    });
    if (!target) return;
    await execPython(document, {
      action: 'convert', mode, text: document.getText(), stylePath: configuredSlideCss(document),
      sourceDir: path.dirname(document.uri.fsPath), output: target.fsPath
    });
    vscode.window.showInformationMessage(`${mode.toUpperCase()}を保存しました: ${target.fsPath}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Zizai Slides: ${error.message}`);
  }
}

function activate(context) {
  const output = vscode.window.createOutputChannel('Zizai Slides');
  context.subscriptions.push(output);
  function activeMarkdown() {
    const current = vscode.window.activeTextEditor?.document;
    if (current && (current.languageId === 'markdown' || /\.md$/i.test(current.fileName))) return current;
    vscode.window.showWarningMessage('Markdownファイル (.md) を開いてください。');
    return null;
  }
  async function showPreview(doc) {
    if (!doc) return;
    const key = doc.uri.toString();
    if (panels.has(key)) {
      panels.get(key).panel.reveal(vscode.ViewColumn.Beside);
      return panels.get(key);
    }
    let engine;
    try { engine = engineFor(doc); } catch (error) {
      const chosen = await vscode.window.showErrorMessage(error.message, 'エンジンを設定');
      if (chosen) await vscode.commands.executeCommand('zizaiSlides.configureEngine');
      return;
    }
    const panel = vscode.window.createWebviewPanel('zizaiSlides.preview', `Slides: ${path.basename(doc.fileName)}`,
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true, retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media'), vscode.Uri.file(path.dirname(doc.uri.fsPath)), vscode.Uri.file(path.dirname(engine.slideCss))] });
    const state = { panel, document: doc, timer: null, sequence: 0 };
    panels.set(key, state);
    panel.webview.html = buildPreviewHtml(panel.webview, context, doc, engine);
    async function update() {
      const sequence = ++state.sequence;
      try {
        const deck = await parseDocument(state.document);
        if (sequence !== state.sequence) return;
        const dir = path.dirname(state.document.uri.fsPath);
        const mapped = applyImages(deck, dir, pathValue => panel.webview.asWebviewUri(vscode.Uri.file(pathValue)).toString());
        await panel.webview.postMessage({ type: 'deck', deck: mapped, name: path.basename(state.document.fileName) });
      } catch (err) {
        if (sequence !== state.sequence) return;
        output.appendLine(`[${new Date().toISOString()}] ${err.stack || err.message}`);
        await panel.webview.postMessage({ type: 'error', message: err.message });
      }
    }
    state.update = update;
    panel.webview.onDidReceiveMessage(async (message) => {
      if (message?.command === 'ready') { update(); }
      else if (message?.command === 'refresh') update();
      else if (message?.command === 'exportHTML') exportDeck(doc, false);
      else if (message?.command === 'exportPDF') exportDeck(doc, true);
      else if (message?.command === 'exportPPTXImage') exportPPTX(doc, 'image');
      else if (message?.command === 'exportPPTXEditable') exportPPTX(doc, 'editable');
      else if (message?.command === 'openLink' && /^https?:\/\//i.test(message.href)) {
        await vscode.env.openExternal(vscode.Uri.parse(message.href));
      }
    });
    panel.onDidDispose(() => {
      clearTimeout(state.timer);
      panels.delete(key);
    });
    return state;
  }
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(saved => {
    if (!/\.css$/i.test(saved.fileName)) return;
    for (const state of panels.values()) {
      try {
        const css = configuredSlideCss(state.document);
        if (css && path.resolve(saved.fileName) === path.resolve(css)) state.update();
      } catch (error) { output.appendLine(`CSS更新エラー: ${error.message}`); }
    }
  }));
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('zizaiSlides.enginePath')) {
      // Existing panels have a fixed webview resource root and stylesheet URI.
      // Close them so reopening uses the newly selected external engine.
      for (const state of [...panels.values()]) state.panel.dispose();
    } else if (event.affectsConfiguration('zizaiSlides.pythonPath') ||
               event.affectsConfiguration('zizaiSlides.slideCssPath')) {
      for (const state of panels.values()) state.update();
    }
  }));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(evt => {
    const state = panels.get(evt.document.uri.toString());
    if (state) { clearTimeout(state.timer); state.timer = setTimeout(() => state.update(), 220); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.configureEngine', async () => {
    const paths = await vscode.window.showOpenDialog({
      title: 'Pythonエンジンの解凍先フォルダーを選択',
      canSelectFiles: false, canSelectFolders: true, canSelectMany: false,
      openLabel: 'エンジンを選択'
    });
    if (!paths?.length) return;
    const { config, folder } = settingsFor(vscode.window.activeTextEditor?.document);
    try {
      const engine = resolveEngine(paths[0].fsPath, folder);
      const target = vscode.workspace.workspaceFolders?.length
        ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
      await config.update('enginePath', engine.root, target);
      const result = await execPython(vscode.window.activeTextEditor?.document, {action: 'ping'});
      vscode.window.showInformationMessage(`Zizai Pythonエンジン v${result.version} に接続しました。`);
    } catch (error) {
      vscode.window.showErrorMessage(`エンジン設定エラー: ${error.message}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.configurePython', async () => {
    const selected = await vscode.window.showOpenDialog({
      title: '使用するPython実行ファイルを選択（仮想環境にも対応）',
      canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
      openLabel: 'Pythonを選択'
    });
    if (!selected?.length) return;
    const { config } = settingsFor(vscode.window.activeTextEditor?.document);
    const target = vscode.workspace.workspaceFolders?.length
      ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
    await config.update('pythonPath', selected[0].fsPath, target);
    try {
      const result = await execPython(vscode.window.activeTextEditor?.document, {action:'ping'});
      vscode.window.showInformationMessage(`Python実行環境を設定しました: ${result.python}`);
    } catch (error) {
      vscode.window.showWarningMessage(`Pythonを設定しましたが、接続確認は未完了です: ${error.message}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.checkEngine', async () => {
    try {
      const result = await execPython(vscode.window.activeTextEditor?.document, {action: 'ping'});
      vscode.window.showInformationMessage(`エンジン v${result.version} / Python: ${result.python}`);
    } catch (error) {
      vscode.window.showErrorMessage(`エンジン接続エラー: ${error.message}`);
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.openPreview', () => showPreview(activeMarkdown())));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.exportHTML', () => exportDeck(activeMarkdown(), false)));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.exportPDF', () => exportDeck(activeMarkdown(), true)));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.exportPPTXImage', () => exportPPTX(activeMarkdown(), 'image')));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.exportPPTXEditable', () => exportPPTX(activeMarkdown(), 'editable')));
  context.subscriptions.push(vscode.commands.registerCommand('zizaiSlides.newDeck', async () => {
    const template = fs.readFileSync(path.join(__dirname, 'samples', 'starter.slide.md'), 'utf8');
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri;
    const uri = await vscode.window.showSaveDialog({ title: '新しいスライドを保存', defaultUri: folder && vscode.Uri.joinPath(folder, 'slides.md'), filters: { Markdown: ['md'] } });
    if (!uri) return;
    await vscode.workspace.fs.writeFile(uri, Buffer.from(template, 'utf8'));
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
    showPreview(doc);
  }));
}
function deactivate() { for (const { panel } of panels.values()) panel.dispose(); panels.clear(); }
module.exports = { activate, deactivate };
