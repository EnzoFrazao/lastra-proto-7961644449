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


  /* cabeçalho compacto ao rolar (Figma: 146 px no topo) */
  (function () { const hd = document.querySelector('.site-header'); if (!hd) return; const f = () => hd.classList.toggle('compact', scrollY > 24); addEventListener('scroll', f, { passive: true }); f(); })();
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
    { e: 'Pergunta 1 · Vínculo', q: 'A empresa tem pelo menos um empregado com carteira assinada (CLT)?', src: 'Fonte: NR-1, item 1.5 · MTE',
      o: [['Sim, tenho empregados CLT', 'Pelo menos uma pessoa registrada'], ['Não, sou MEI sem empregados', 'Só o titular trabalha na empresa'], ['Não sei responder', 'A gente ajuda a descobrir no resultado']] },
    { e: 'Pergunta 2 · Porte', q: 'Quantos empregados a empresa tem?', src: 'Fonte: NR-1 (MTE) · conferir redação', o: [['Até 9'], ['10 a 19'], ['20 a 49'], ['50 ou mais']] },
    { e: 'Pergunta 3 · Atividade', q: 'Qual é a atividade principal?', src: 'Fonte: NR-4 e NR-1 (MTE) · conferir redação', o: [['Comércio ou serviços de escritório'], ['Alimentação, construção ou indústria'], ['Não sei']] },
    { e: 'Pergunta 4 · Regime', q: 'A empresa é optante pelo Simples Nacional?', src: 'Fonte: NR-1 (MTE) · conferir redação', o: [['Sim'], ['Não'], ['Não sei']] }
  ];
  const ans = []; let step = 0, sel = -1;
  const dQ = $('#dQ'), dOpts = $('#dOpts'), dStep = $('#dStep'), dBack = $('#dBack'), dNext = $('#dNext'), dNum = $('#dNum'), dSrc = $('#dSrc'), bars = $$('.diag-progress i'), diag = $('#diag');
  const radio = '<img src="assets/figma/q-radio-on.svg" alt="">';
  function paintSel() {
    $$('.qo', dOpts).forEach((b, i) => { b.classList.toggle('sel', i === sel); b.setAttribute('aria-pressed', i === sel); $('.qr', b).innerHTML = i === sel ? radio : ''; });
    dNext.setAttribute('aria-disabled', sel < 0);
  }
  function renderQ() {
    const cur = Q[step]; sel = ans[step] == null ? -1 : ans[step];
    diag.classList.remove('is-res');
    bars.forEach((b, i) => b.classList.toggle('on', i <= step));
    dNum.textContent = '0' + (step + 1); dStep.textContent = cur.e; dQ.textContent = cur.q; dSrc.textContent = cur.src; dBack.hidden = step === 0;
    dOpts.innerHTML = '';
    cur.o.forEach((o, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'qo';
      b.innerHTML = `<span class="qk">${'ABCD'[i]}</span><span class="qt"><b>${o[0]}</b>${o[1] ? `<span>${o[1]}</span>` : ''}</span><span class="qr"></span>`;
      b.onclick = () => { sel = i; ans[step] = i; paintSel(); };
      dOpts.appendChild(b);
    });
    paintSel();
  }
  function next() {
    if (sel < 0) { dNext.classList.remove('nudge'); void dNext.offsetWidth; dNext.classList.add('nudge'); return; }
    step++; if (ans[0] === 1 || step >= Q.length) result(); else renderQ();
  }
  function result() {
    bars.forEach(b => b.classList.add('on')); diag.classList.add('is-res');
    dStep.textContent = 'Enquadramento estimado · exemplo do fluxo'; dNum.textContent = '04'; dSrc.textContent = 'Fonte: NR-1 (MTE) · conferir redação';
    if (ans[0] === 1) {
      dQ.textContent = 'Sem empregado CLT, a NR-1 não se aplica diretamente.';
      dOpts.innerHTML = `<div class="qz-res"><p>Quando a empresa contratar, a regra passa a valer. Se há trabalho sem registro, vale conversar.</p><div class="qz-rbtns"><button class="qz-btn ghost" type="button" id="dRe">Refazer</button></div></div>`;
    } else {
      const comercio = ans[2] === 0, pesado = ans[2] === 1;
      const via = comercio ? 'AEP / DIR (grau de risco estimado 1–2)' : pesado ? 'PGR completo (grau de risco estimado 3–4)' : 'a Lastra estima o grau de risco pela atividade';
      dQ.textContent = 'A NR-1 vale para a sua empresa desde 26/05/2026.';
      dOpts.innerHTML = `<div class="qz-res"><span class="qz-tag">Caminho provável: ${via}</span><p>O STF suspendeu as multas por enquanto; a obrigação continua. Atualizado em 15/11/2026.</p><p class="cap">Enquadramento estimado: o responsável técnico confirma. Regras reais vêm do motor versionado.</p><div class="qz-rbtns"><a class="qz-btn" href="contato.html">Falar com a Lastra</a><button class="qz-btn ghost" type="button" id="dRe">Refazer</button></div></div>`;
    }
    $('#dRe').onclick = () => { step = 0; ans.length = 0; renderQ(); };
  }
  dNext.onclick = next;
  dBack.onclick = () => { step = Math.max(0, step - 1); renderQ(); };
  renderQ();
  /* atalho do formulário ao lado: já responde "vínculo" e "porte" e leva ao cartão */
  const faixa = $('#faixa'), faixaGo = $('#faixaGo');
  if (faixa && faixaGo) faixaGo.onclick = () => {
    if (faixa.value !== '') { ans.length = 0; ans[0] = 0; ans[1] = +faixa.value; step = 2; renderQ(); }
    diag.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  };

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
