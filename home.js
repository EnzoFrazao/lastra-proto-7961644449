/* Home (S01) — comportamento do protótipo: hero com motion, trilho de camadas, alternador de tema (véu horizontal),
   contadores e mini-enquadramento. Sem dependências. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIn = t => t * t * t;
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f = n => n.toFixed(1);

  /* ---------- hero novo: título em palavras (máscara) com marca-texto em "de repente."; cartão 3D inclina de leve com o mouse ---------- */
  const hero = $('#hero'), h1 = $('#h1'), hcard = $('#hcard');
  const words = h1.textContent.trim().split(/\s+/), nw = words.length;
  const wh = words.map((w, i) => `<span class="hw" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`);
  h1.setAttribute('aria-label', h1.textContent.trim());
  h1.innerHTML = wh.slice(0, nw - 2).join(' ') + ' <span class="h-mark">' + wh.slice(nw - 2).join(' ') + '</span>';
  if (!reduce) {
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; hcard.style.setProperty('--px', (x * 12).toFixed(2) + 'deg'); hcard.style.setProperty('--py', (-y * 8).toFixed(2) + 'deg'); });
    hero.addEventListener('pointerleave', () => { hcard.style.setProperty('--px', '0deg'); hcard.style.setProperty('--py', '0deg'); });
  }

  /* ---------- reveal + contadores ---------- */
  function countUp(el) {
    const txt = el.textContent.trim(), dec = txt.includes(',') ? txt.split(',')[1].length : 0;
    const target = parseFloat(txt.replace(/\./g, '').replace(',', '.')); if (isNaN(target)) return;
    const fmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce) return;
    const start = performance.now(), dur = 1200;
    (function step(n) { const q = easeOut(clamp((n - start) / dur)); el.textContent = fmt(target * q); if (q < 1) requestAnimationFrame(step); else el.textContent = fmt(target); })(start);
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    $$('[data-count]', e.target).forEach(countUp);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

  /* ---------- trilho de camadas (M13) ---------- */
  const ruler = $('#ruler'), rulerZone = $('#rulerZone'), rulerFill = $('#rulerFill');
  const zoned = $$('[data-zone]');
  function updateRuler() {
    const mid = innerHeight * .5; let cur = zoned[0];
    zoned.forEach(s => { if (s.getBoundingClientRect().top <= mid) cur = s; });
    if (rulerZone.textContent !== cur.dataset.zone) rulerZone.textContent = cur.dataset.zone;
    ruler.classList.toggle('on-dark', cur.classList.contains('on-deep'));
    const max = document.documentElement.scrollHeight - innerHeight;
    rulerFill.style.height = (max > 0 ? clamp(scrollY / max) : 0) * 120 + 'px';
  }
  addEventListener('scroll', updateRuler, { passive: true }); updateRuler();

  /* ---------- mini-enquadramento (S07/S08, exemplo do fluxo) ---------- */
  const Q = [
    { q: 'A empresa tem pelo menos um empregado com carteira assinada (CLT)?', o: ['Sim', 'Não'] },
    { q: 'Quantos empregados a empresa tem?', o: ['Até 9', '10 a 19', '20 a 49', '50 ou mais'] },
    { q: 'Qual é a atividade principal?', o: ['Comércio ou serviços de escritório', 'Alimentação, construção ou indústria', 'Não sei'] },
    { q: 'A empresa é optante pelo Simples Nacional?', o: ['Sim', 'Não', 'Não sei'] }
  ];
  const ans = []; let step = 0;
  const dQ = $('#dQ'), dOpts = $('#dOpts'), dStep = $('#dStep'), dBack = $('#dBack'), dHint = $('#dHint'), bars = $$('.diag-progress i'), diag = $('#diag');
  function renderQ() {
    const cur = Q[step];
    bars.forEach((b, i) => b.classList.toggle('on', i <= step));
    dStep.textContent = `Pergunta ${step + 1} de 4`; dQ.textContent = cur.q; dBack.hidden = step === 0;
    dOpts.innerHTML = ''; dHint.hidden = false;
    cur.o.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = o; b.onclick = () => { ans[step] = o; step++; if (ans[0] === 'Não' || step >= Q.length) result(); else renderQ(); }; dOpts.appendChild(b); });
  }
  function result() {
    bars.forEach(b => b.classList.add('on'));
    dStep.textContent = 'Enquadramento estimado — exemplo do fluxo'; dBack.hidden = true; dHint.hidden = true;
    if (ans[0] === 'Não') {
      dQ.textContent = 'Sem empregado CLT, a NR-1 não se aplica diretamente.';
      dOpts.innerHTML = `<div class="diag-result"><p>Quando a empresa contratar, a regra passa a valer. Se há trabalho sem registro, vale conversar.</p><p class="caption muted">Fonte: NR-1 (MTE) · conferir redação 🔎</p><div class="cta-row"><button class="btn btn-secondary btn-sm" type="button" id="dRe">Refazer</button></div></div>`;
    } else {
      const comercio = ans[2] && ans[2].startsWith('Comércio'), pesado = ans[2] && ans[2].startsWith('Alimentação');
      const via = comercio ? 'AEP / DIR (grau de risco estimado 1–2)' : pesado ? 'PGR completo (grau de risco estimado 3–4)' : 'a Lastra estima o grau de risco pela atividade';
      dQ.textContent = 'A NR-1 vale para a sua empresa desde 26/05/2026.';
      dOpts.innerHTML = `<div class="diag-result"><span class="chip ok">Caminho provável: ${via}</span><p>O STF suspendeu as multas por enquanto; a obrigação continua. Atualizado em 15/11/2026.</p><p class="caption muted">Enquadramento estimado — o responsável técnico confirma. Regras reais vêm do motor versionado. 🔎</p><div class="cta-row"><a class="btn btn-primary btn-sm" href="contato.html">Falar com a Lastra <svg class="arrow"><use href="#i-arrow"/></svg></a><button class="btn btn-secondary btn-sm" type="button" id="dRe">Refazer</button></div></div>`;
    }
    $('#dRe').onclick = () => { step = 0; ans.length = 0; renderQ(); };
  }
  dBack.onclick = () => { step = Math.max(0, step - 1); renderQ(); };
  renderQ();

  /* ---------- gancho de revisão: ?ir=#secao (rola até lá ao abrir; ?tema=dark força o tema) ---------- */
  const qs = new URLSearchParams(location.search);
  if (qs.get('tema')) root0().setAttribute('data-theme', qs.get('tema'));
  function root0() { return document.documentElement; }
  setTimeout(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    if (qs.get('ir')) { const el = $(qs.get('ir')); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }
  }, 400);

  /* ---------- alternador de tema (M3): véu que desce; a cor vem do token --bg-page do tema de destino ---------- */
  const root = document.documentElement;
  function applyTheme(t) { root.setAttribute('data-theme', t); try { localStorage.setItem('lastra-tema', t); } catch (e) {} }
  function pageBg(theme) { const p = document.createElement('div'); p.setAttribute('data-theme', theme); p.style.cssText = 'position:absolute;visibility:hidden;background:var(--bg-page)'; document.body.appendChild(p); const c = getComputedStyle(p).backgroundColor; p.remove(); return c; }
  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (reduce) { applyTheme(next); return; }
    const veil = document.createElement('div'); veil.className = 'veil'; veil.style.background = pageBg(next);
    document.body.appendChild(veil); veil.classList.add('drop');
    veil.addEventListener('animationend', () => { applyTheme(next); veil.classList.remove('drop'); veil.classList.add('lift'); veil.addEventListener('animationend', () => veil.remove(), { once: true }); }, { once: true });
  });
})();
