/* Core Cheatsheet App */
const pageType = document.documentElement.dataset.page || 'home';
const PAGE_KEY = `cheats_${pageType}`;

/* Preloaded data per page */
const PRESET = { /* ... keep all your existing PRESET data here exactly as before ... */ };

/* Utils */
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '_' + Math.random().toString(16).slice(2));
}
function getStore() {
  try { return JSON.parse(localStorage.getItem(PAGE_KEY) || '[]') } catch { return [] }
}
function setStore(items) {
  localStorage.setItem(PAGE_KEY, JSON.stringify(items))
}
function byId(id) { return document.getElementById(id) }

/* Code block generator with fixed buttons */
function codeBlock(code, lang) {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-wrapper';

  const buttons = document.createElement('div');
  buttons.className = 'code-buttons';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn';
  copyBtn.textContent = 'Copy';
  copyBtn.onclick = async () => {
    await navigator.clipboard.writeText(code);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 1200);
  };

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn danger';
  removeBtn.textContent = 'Remove';
  removeBtn.onclick = () => {
    const current = getStore().filter(x => x.c !== code);
    setStore(current);
    render(current);
  };

  buttons.appendChild(copyBtn);
  buttons.appendChild(removeBtn);
  wrapper.appendChild(buttons);

  const pre = document.createElement('pre');
  pre.className = `language-${lang || 'markup'}`;
  pre.style.overflowX = 'auto';            // keep horizontal scroll if needed
  pre.style.whiteSpace = 'pre-wrap';       // allow wrapping instead of fixed width
  pre.style.wordBreak = 'break-word';      // break long words/URLs if needed

  const codeEl = document.createElement('code');
  codeEl.className = `language-${lang || 'markup'}`;
  codeEl.textContent = code;

  pre.appendChild(codeEl);
  wrapper.appendChild(pre);

  return wrapper;
}

/* Render list */
function render(items) {
  const list = byId('list');
  list.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('div');
    li.className = 'item';
    li.dataset.id = item.id;

    const meta = document.createElement('div');
    meta.className = 'meta';
    const h3 = document.createElement('h3');
    h3.textContent = item.t;
    const p = document.createElement('p');
    p.textContent = item.d;

    meta.appendChild(h3);
    meta.appendChild(p);
    meta.appendChild(codeBlock(item.c, item.lang));

    li.appendChild(meta);
    list.appendChild(li);
  });

  if (window.Prism && Prism.highlightAll) {
    Prism.highlightAll();
    // ✅ Ensure wrap styles are re-applied after Prism changes DOM
    document.querySelectorAll('pre[class*="language-"]').forEach(pre => {
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.wordBreak = 'break-word';
      pre.style.overflowX = 'auto';
    });
    document.querySelectorAll('code[class*="language-"]').forEach(code => {
      code.style.whiteSpace = 'pre-wrap';
      code.style.wordBreak = 'break-word';
    });
  }
}

/* Initialize page */
function boot() {
  if (pageType === 'home') return;

  let stored = getStore();
  if (stored.length === 0) {
    const base = (PRESET[pageType] || []).map(x => ({
      ...x,
      id: uid(),
      lang: pageType === 'js' ? 'javascript' : (pageType === 'css' ? 'css' : 'markup')
    }));
    setStore(base);
    stored = base;
  }
  render(stored);

  const form = byId('entry-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const topic = byId('topic').value.trim();
    const desc = byId('desc').value.trim();
    const code = byId('code').value;
    if (!topic || !code) { alert('Please add a topic and code'); return; }
    const lang = pageType === 'js' ? 'javascript' : (pageType === 'css' ? 'css' : 'markup');
    const item = { id: uid(), t: topic, d: desc || '', c: code, lang };
    const items = [item, ...getStore()];
    setStore(items);
    form.reset();
    render(items);
  });

  byId('print').addEventListener('click', () => window.print());
  byId('clear-all').addEventListener('click', () => {
    if (confirm('Remove all saved entries for this page?')) {
      setStore([]); 
      render([]);
    }
  });
}

document.addEventListener('DOMContentLoaded', boot);
