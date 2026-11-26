/* Home (S01) — comportamento do protótipo: cena M0 em loop (papel cede, três camadas assentam, a carga repousa),
   trilho de camadas, alternador de tema (véu horizontal), contadores, linha do tempo e mini-enquadramento. Sem dependências. */
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

  /* ---------- cena: papel cede, três lajes assentam, a carga repousa ---------- */
  const paper = $('#paper'), load = $('#load'), seal = $('#seal'), all = $('#sceneAll');
  const slabs = [$('#slab1'), $('#slab2'), $('#slab3')];
  const SLIDE = [-640, 640, -640];                 // de que lado cada laje entra
  const Y_START = -140, Y_ON_PAPER = 328, Y_SUNK = 338, Y_AIR = 190, Y_REST = 222;   // topo da carga (px do viewBox)

  /* ---------- estados do hero ---------- */
  const track = $('#camadas'), stages = $$('.stage'), status = $('#status'), statusTxt = $('#statusTxt');
  const pauseBtn = $('#pauseBtn'), dots = $$('#dots button');
  // A cena roda em loop sozinha (LOOP segundos); a rolagem da página continua normal.
  const LOOP = 22, STAGE_AT = { a: .27, b: .6, c: .88 };
  let curStage = '', P = reduce ? 1 : 0, clock = 0, last = performance.now(), paused = false, heroVisible = true;
  new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; }, { threshold: .1 }).observe(track);
  function setPaused(v) { paused = v; pauseBtn.setAttribute('aria-pressed', String(v)); pauseBtn.setAttribute('aria-label', v ? 'Retomar animação' : 'Pausar animação'); pauseBtn.classList.toggle('is-paused', v); }
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  dots.forEach(b => b.addEventListener('click', () => { clock = STAGE_AT[b.dataset.go] * LOOP; P = clock / LOOP; }));
  if (reduce) { pauseBtn.hidden = true; $('#dots').hidden = true; }
  const STATUS = { a: ['bad', 'Só papel por baixo'], b: ['ok', 'Assentando a base'], c: ['ok', 'Base assentada'] };

  function setStage(id) {
    if (id === curStage) return; curStage = id;
    stages.forEach(s => s.classList.toggle('on', s.dataset.stage === id));
    dots.forEach(d => { const on = d.dataset.go === id; d.classList.toggle('on', on); on ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'); });
    status.dataset.state = STATUS[id][0]; statusTxt.textContent = STATUS[id][1];
  }

  function frame(now) {
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!reduce && !paused && heroVisible) { clock = (clock + dt) % LOOP; P = clock / LOOP; }
    const p = P;
    // a: a carga cai sobre o papel, que cede
    const fall = easeIn(seg(p, .05, .2));
    const sink = easeIO(seg(p, .2, .34));
    // b: a carga sobe, as lajes entram uma a uma; depois a carga desce e repousa
    const lift = easeIO(seg(p, .44, .52));
    const settle = easeOut(seg(p, .7, .78));
    let y;
    if (p < .44) y = Y_START + fall * (Y_ON_PAPER - Y_START) + sink * (Y_SUNK - Y_ON_PAPER);
    else if (p < .7) y = Y_SUNK + (Y_AIR - Y_SUNK) * lift;
    else y = Y_AIR + (Y_REST - Y_AIR) * settle;
    load.setAttribute('transform', `translate(0 ${f(y)})`);
    paper.style.transform = `scaleY(${f(1 - .8 * sink)})`;
    paper.style.opacity = 1 - seg(p, .52, .58);
    slabs.forEach((sl, i) => {
      const q = easeOut(seg(p, .5 + i * .07, .58 + i * .07));
      sl.setAttribute('transform', `translate(${f(SLIDE[i] * (1 - q))} 0)`);
      sl.style.opacity = q > 0 ? 1 : 0;
    });
    seal.style.opacity = seg(p, .8, .86);
    all.style.opacity = reduce ? 1 : Math.min(seg(p, 0, .02), 1 - seg(p, .96, 1));   // recomeça o ciclo sem corte brusco
    setStage(p < .42 ? 'a' : p < .72 ? 'b' : 'c');
    requestAnimationFrame(frame);
  }
  if (reduce) $('#camadas .hero-stick').style.cssText = 'height:auto;min-height:0;padding:110px 0 100px';
  requestAnimationFrame(frame);

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

  /* ---------- linha do tempo (M6) ---------- */
  const tl = $('#timeline'), tlFill = $('#tlFill'), lis = $$('#timeline li'), tlCube = $('.tl-cube');
  function updateTimeline() {
    const r = tl.getBoundingClientRect();
    const t = clamp((innerHeight * .72 - r.top) / (r.height * .85));
    const vertical = getComputedStyle(tl.querySelector('ol')).gridTemplateColumns.split(' ').length === 1;
    tlFill.style.width = vertical ? '100%' : (t * 100) + '%'; tlFill.style.height = vertical ? (t * 100) + '%' : '100%';
    lis.forEach((li, i) => li.classList.toggle('on', t >= (i / 5) * .92 + .03));
    tlCube.classList.toggle('p1', t >= .25); tlCube.classList.toggle('p2', t >= .6); tlCube.classList.toggle('p3', t >= .95);
  }
  addEventListener('scroll', updateTimeline, { passive: true }); addEventListener('resize', updateTimeline); updateTimeline();

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
      dOpts.innerHTML = `<div class="diag-result"><span class="chip ok">Caminho provável: ${via}</span><p>O STF suspendeu as multas por enquanto; a obrigação continua. Atualizado em 15/11/2026.</p><p class="caption muted">Enquadramento estimado — o responsável técnico confirma. Regras reais vêm do motor versionado. 🔎</p><div class="cta-row"><a class="btn btn-primary btn-sm" href="#contato">Falar com a Lastra <svg class="arrow"><use href="#i-arrow"/></svg></a><button class="btn btn-secondary btn-sm" type="button" id="dRe">Refazer</button></div></div>`;
    }
    $('#dRe').onclick = () => { step = 0; ans.length = 0; renderQ(); };
  }
  dBack.onclick = () => { step = Math.max(0, step - 1); renderQ(); };
  renderQ();

  /* ---------- gancho de revisão: ?ir=#secao ou ?p=0.67 (rola até lá ao abrir; ?tema=dark força o tema) ---------- */
  const qs = new URLSearchParams(location.search);
  if (qs.get('tema')) root0().setAttribute('data-theme', qs.get('tema'));
  function root0() { return document.documentElement; }
  setTimeout(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    if (qs.get('p')) { clock = parseFloat(qs.get('p')) * LOOP; P = clock / LOOP; setPaused(true); }   // ?p=0.67 congela a cena nesse ponto do ciclo
    else if (qs.get('ir')) { const el = $(qs.get('ir')); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }
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
