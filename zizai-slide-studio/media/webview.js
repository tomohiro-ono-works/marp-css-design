(() => {
  'use strict';
  const vscode = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  const state = { slides: [], meta: {}, index: 0, zoom: 1, name: '' };
  const limit = (n, low, high) => Math.min(high, Math.max(low, n));
  function status(message, error = false) {
    $('status').textContent = message;
    $('status').className = error ? 'error' : '';
  }
  function fitScale() {
    const stage = $('stage');
    const maxWidth = Math.max(200, stage.clientWidth - 44);
    const maxHeight = Math.max(120, stage.clientHeight - 44);
    return Math.min(maxWidth / 1280, maxHeight / 720) * state.zoom;
  }
  function render() {
    const available = state.slides.length > 0;
    const item = state.slides[state.index];
    $('empty').style.display = available ? 'none' : 'block';
    $('slide-host').replaceChildren();
    $('slide-host').style.display = available ? 'block' : 'none';
    $('prev').disabled = !available || state.index === 0;
    $('next').disabled = !available || state.index >= state.slides.length - 1;
    $('position').textContent = available ? `${state.index + 1} / ${state.slides.length}` : '0 / 0';
    $('zoom-label').textContent = `${Math.round(state.zoom * 100)}%`;
    if (available) {
      const scale = fitScale();
      const host = $('slide-host');
      host.style.width = `${1280 * scale}px`;
      host.style.height = `${720 * scale}px`;
      const slide = document.createElement('section');
      slide.className = `slide ${(item.classes || []).join(' ')}`;
      slide.style.transform = `scale(${scale})`;
      const content = document.createElement('div');
      content.className = 'slide-geometry';
      const layout = item.layout || { shapes: [], texts: [], images: [] };
      for (const shape of layout.shapes || []) {
        const rect = document.createElement('div');
        rect.className = 'geometry-shape';
        Object.assign(rect.style, {
          left: `${shape.x}px`, top: `${shape.y}px`, width: `${shape.w}px`, height: `${shape.h}px`,
          backgroundColor: `#${shape.fill}`,
          borderRadius: `${shape.radius || 0}px`
        });
        if (shape.borderColor) rect.style.border = `${shape.borderWidth || 1}px solid #${shape.borderColor}`;
        if (shape.shadow) rect.style.boxShadow = '0 7px 10px -5px rgba(27,43,69,.20)';
        content.appendChild(rect);
      }
      for (const itemText of layout.texts || []) {
        const text = document.createElement('div');
        text.className = 'geometry-text';
        text.textContent = itemText.text;
        Object.assign(text.style, {
          left: `${itemText.x}px`, top: `${itemText.y}px`,
          width: `${itemText.w}px`, height: `${itemText.h}px`,
          color: `#${itemText.color}`, fontSize: `${itemText.fontSize}px`,
          fontWeight: itemText.bold ? '700' : '400',
          textAlign: itemText.center ? 'center' : 'left'
        });
        content.appendChild(text);
      }
      for (const imgItem of layout.images || []) {
        if (!imgItem.src) continue;
        const pic = document.createElement('img');
        pic.src = imgItem.src;
        pic.alt = imgItem.alt || '';
        pic.className = 'geometry-image';
        Object.assign(pic.style, { left: `${imgItem.x}px`, top: `${imgItem.y}px`,
          width: `${imgItem.w}px`, height: `${imgItem.h}px` });
        content.appendChild(pic);
      }
      slide.appendChild(content);
      host.appendChild(slide);
    }
    document.querySelectorAll('.slide-item').forEach((button, i) => {
      button.classList.toggle('active', i === state.index);
      button.setAttribute('aria-current', String(i === state.index));
    });
  }
  function indexList() {
    const parent = $('slides');
    parent.replaceChildren();
    state.slides.forEach((slide, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slide-item';
      const num = document.createElement('span');
      num.className = 'slide-index';
      num.textContent = String(i + 1).padStart(2, '0');
      const name = document.createElement('span');
      name.textContent = slide.title || `スライド ${i + 1}`;
      button.append(num, name);
      button.addEventListener('click', () => { state.index = i; render(); });
      parent.appendChild(button);
    });
  }
  function move(delta) { state.index = limit(state.index + delta, 0, Math.max(0, state.slides.length - 1)); render(); }
  $('prev').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('zoom-in').addEventListener('click', () => { state.zoom = limit(state.zoom + .1, .5, 2.5); render(); });
  $('zoom-out').addEventListener('click', () => { state.zoom = limit(state.zoom - .1, .5, 2.5); render(); });
  $('zoom-reset').addEventListener('click', () => { state.zoom = 1; render(); });
  $('export-html').addEventListener('click', () => vscode.postMessage({ command: 'exportHTML' }));
  $('export-pdf').addEventListener('click', () => vscode.postMessage({ command: 'exportPDF' }));
  $('export-pptx-image').addEventListener('click', () => vscode.postMessage({ command: 'exportPPTXImage' }));
  $('export-pptx-editable').addEventListener('click', () => vscode.postMessage({ command: 'exportPPTXEditable' }));
  $('reload').addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));
  $('stage').addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (anchor) { event.preventDefault(); vscode.postMessage({ command: 'openLink', href: anchor.getAttribute('href') }); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); move(-1); }
    if (event.key === 'Home') { state.index = 0; render(); }
    if (event.key === 'End') { state.index = Math.max(0, state.slides.length - 1); render(); }
  });
  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg?.type === 'deck') {
      state.slides = msg.deck.slides;
      state.meta = msg.deck.meta;
      state.name = msg.name;
      state.index = limit(state.index, 0, Math.max(0, state.slides.length - 1));
      $('file-name').textContent = `${state.name} — Zizai Slides`;
      indexList(); render();
      status(`${state.slides.length} スライド | Python標準ライブラリで解析済み`);
    }
    if (msg?.type === 'error') status(msg.message, true);
    if (msg?.type === 'status') status(msg.message);
  });
  new ResizeObserver(render).observe($('stage'));
  vscode.postMessage({ command: 'ready' });
})();
