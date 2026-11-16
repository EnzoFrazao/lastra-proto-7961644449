/* Home (S01) — comportamento do protótipo: cena M0 guiada por rolagem, ondas, régua de calado,
   alternador de tema "maré", contadores, linha do tempo e mini-diagnóstico. Sem dependências. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  /* ---------- ondas (divisores M2) ---------- */
  function wavePath(w, y, amp, period, h) {
    let d = `M0 ${y}`; const n = Math.ceil(w / period);
    for (let i = 0; i < n; i++) d += ` q${period / 4} ${-amp} ${period / 2} 0 t${period / 2} 0`;
    return d + ` L${n * period} ${h} L0 ${h}Z`;
  }
  $$('[data-wave]').forEach(sec => {
    const wrap = document.createElement('div'); wrap.className = 'wave'; wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `<svg viewBox="0 0 3840 60" preserveAspectRatio="none"><path class="w-back" d="${wavePath(3840 + 240, 26, 14, 240, 60)}"/><path class="w-front" d="${wavePath(3840 + 160, 34, 12, 160, 60)}"/></svg>`;
    sec.prepend(wrap);
  });

  /* ---------- cena do navio ---------- */
  const ship = $('#ship'), cubesG = $('#cubes'), chipsG = $('#chips'), keel = $('#keel');
  const seaB = $('#seaBack .sea-wave'), seaF = $('#seaFront .sea-wave');
  seaB.setAttribute('d', wavePath(780, 390, 6, 80, 560));
  seaF.setAttribute('d', wavePath(780, 400, 5, 70, 560));

  const A = 30, k = A * 0.866, f = n => n.toFixed(1);
  const stacks = [[130, 1], [184, 2], [238, 1], [292, 2], [346, 3], [400, 1]];
  const cubes = []; const tops = {};
  for (let j = 0; j < 3; j++) {
    stacks.forEach(([cx, h]) => {
      if (j >= h) return;
      const y = 298 - j * A;
      const g = mk('g', { class: 'cube' }, cubesG);
      mk('path', { d: `M${f(cx - k)} ${f(y - A / 2)}L${f(cx)} ${f(y)}L${f(cx)} ${f(y - A)}L${f(cx - k)} ${f(y - 1.5 * A)}Z`, fill: 'var(--fg-2)' }, g);
      mk('path', { d: `M${f(cx)} ${f(y)}L${f(cx + k)} ${f(y - A / 2)}L${f(cx + k)} ${f(y - 1.5 * A)}L${f(cx)} ${f(y - A)}Z`, fill: 'var(--water-deep)' }, g);
      mk('path', { d: `M${f(cx)} ${f(y - A)}L${f(cx - k)} ${f(y - 1.5 * A)}L${f(cx)} ${f(y - 2 * A)}L${f(cx + k)} ${f(y - 1.5 * A)}Z`, fill: 'var(--water)' }, g);
      cubes.push(g);
      tops[cx] = Math.min(tops[cx] ?? 999, y - 2 * A);
    });
  }
  // rótulos de carga
  const chipData = [['Metas impossíveis', 390, 346, 40], ['Assédio', 270, 292, 104], ['Jornada sem fim', 160, 184, 170]];
  const chips = chipData.map(([txt, cx, lx, y0]) => {
    const g = mk('g', { class: 'chip-g' }, chipsG);
    const w = Math.round(txt.length * 7.4 + 26);
    mk('rect', { x: cx - w / 2, y: y0, width: w, height: 30, rx: 4, fill: 'var(--bg-card)', stroke: 'var(--line)' }, g);
    const t = mk('text', { x: cx, y: y0 + 19.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, 'font-family': 'Montserrat, system-ui, sans-serif', fill: 'var(--fg)' }, g); t.textContent = txt;
    mk('rect', { x: lx - .75, y: y0 + 30, width: 1.5, height: tops[lx] - (y0 + 30) - 2, fill: 'var(--fg-2)' }, g);
    return g;
  });
  // lastro (3 peças do cubo-logo, quilha)
  const L = window.LASTRO_LOGO;
  const keelPieces = [[L.p1, -270, 40], [L.p2, 130, 160], [L.p3, 280, 30]].map(([d, ox, oy]) => {
    const outer = mk('g', {}, keel);
    const inner = mk('g', { transform: 'translate(241.800 402.400) scale(.6)' }, outer);
    mk('path', { d, fill: 'var(--fg)' }, inner);
    return { outer, ox, oy };
  });

  /* ---------- estados do hero ---------- */
  const track = $('#hero'), stages = $$('.stage'), gauge = $('#gauge'), gaugeTxt = $('#gaugeTxt');
  const pauseBtn = $('#pauseBtn'), dots = $$('#dots button');
  // A cena roda em loop sozinha (LOOP segundos); a rolagem da página continua normal.
  const LOOP = 22, STAGE_AT = { a: .27, b: .6, c: .88 };
  let curStage = '', t0 = performance.now(), P = reduce ? 1 : 0, clock = 0, last = performance.now(), paused = false, heroVisible = true;
  new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; }, { threshold: .1 }).observe(track);
  function setPaused(v) { paused = v; pauseBtn.setAttribute('aria-pressed', String(v)); pauseBtn.setAttribute('aria-label', v ? 'Retomar animação' : 'Pausar animação'); pauseBtn.classList.toggle('is-paused', v); }
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  dots.forEach(b => b.addEventListener('click', () => { clock = STAGE_AT[b.dataset.go] * LOOP; P = clock / LOOP; }));
  if (reduce) { pauseBtn.hidden = true; $('#dots').hidden = true; }
  const GAUGE = { a: ['ok', 'Linha de carga visível'], b: ['bad', 'Linha de carga submersa'], c: ['ok', 'Linha de carga restaurada'] };

  function setStage(id) {
    if (id === curStage) return; curStage = id;
    stages.forEach(s => s.classList.toggle('on', s.dataset.stage === id));
    dots.forEach(d => { const on = d.dataset.go === id; d.classList.toggle('on', on); on ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'); });
    gauge.dataset.state = GAUGE[id][0]; gaugeTxt.textContent = GAUGE[id][1];
  }

  function frame(now) {
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!reduce && !paused && heroVisible) {
      clock = (clock + dt) % LOOP;
      P = clock / LOOP;
    }
    const p = P, time = (now - t0) / 1000;
    const r = easeBack(seg(p, .78, .92));            // lastro assenta e o navio se endireita
    const damage = 30 * easeIO(seg(p, .45, .6)) + 40 * easeIO(seg(p, .6, .7));
    const load = 14 * seg(p, .02, .2);
    const sink = load * (1 - .5 * r) + damage * (1 - clamp(r, 0, 1.04));
    const tilt = (4 * seg(p, .45, .6) + 5 * seg(p, .6, .7)) * (1 - clamp(r, 0, 1.04));
    const rockAmp = reduce ? 0 : 1 + tilt * .35;
    const rock = Math.sin(time * 1.25) * rockAmp, bob = reduce ? 0 : Math.sin(time * 1.25 + 1) * 3;
    ship.setAttribute('transform', `translate(0 ${f(sink + bob)}) rotate(${f(tilt + rock)} 300 340)`);
    // cubos caem um a um
    cubes.forEach((c, i) => {
      // a carga entra aos poucos: primeira fileira logo no começo do ciclo, as demais em seguida
      const q = i < 6 ? seg(p, .012 + i * .01, .05 + i * .01) : seg(p, .1 + (i - 6) * .03, .14 + (i - 6) * .03);
      const y = (1 - easeBack(q)) * -220;
      const slide = 12 * seg(p, .6, .7) * (1 - clamp(r, 0, 1));
      c.setAttribute('transform', `translate(${f(slide)} ${f(y)})`);
      c.style.opacity = q > 0 ? 1 : 0;
    });
    const chipVis = seg(p, .2, .25) * (1 - seg(p, .45, .5));
    ship.style.opacity = reduce ? 1 : Math.min(seg(p, 0, .012), 1 - seg(p, .97, 1)); // o navio segue viagem e o ciclo recomeça
    chips.forEach(c => { c.style.opacity = chipVis; });
    // lastro entra
    keelPieces.forEach((kp, i) => {
      const q = easeOut(seg(p, .70 + i * .03, .78 + i * .03));
      kp.outer.setAttribute('transform', `translate(${f(kp.ox * (1 - q))} ${f(kp.oy * (1 - q))})`);
      kp.outer.style.opacity = clamp(q * 3, 0, 1);
    });
    setStage(p < .42 ? 'a' : p < .72 ? 'b' : 'c');
    requestAnimationFrame(frame);
  }
  if (reduce) $('.hero-stick').style.cssText = 'height:auto;min-height:0;padding:110px 0 100px';
  requestAnimationFrame(frame);

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

  /* ---------- régua de calado (M13) ---------- */
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

  /* ---------- mini-diagnóstico (S07/S08, exemplo do fluxo) ---------- */
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
    dStep.textContent = 'Resultado — exemplo do fluxo'; dBack.hidden = true; dHint.hidden = true;
    if (ans[0] === 'Não') {
      dQ.textContent = 'Sem empregado CLT, a NR-1 não se aplica diretamente.';
      dOpts.innerHTML = `<div class="diag-result"><p>Quando a empresa contratar, a regra passa a valer. Se há trabalho sem registro, vale conversar.</p><p class="caption muted">Fonte: NR-1 (MTE) · conferir redação 🔎</p><div class="cta-row"><button class="btn btn-secondary btn-sm" type="button" id="dRe">Refazer</button></div></div>`;
    } else {
      const comercio = ans[2] && ans[2].startsWith('Comércio'), pesado = ans[2] && ans[2].startsWith('Alimentação');
      const via = comercio ? 'AEP / DIR (grau de risco estimado 1–2)' : pesado ? 'PGR completo (grau de risco estimado 3–4)' : 'a Lastro estima o grau de risco pela atividade';
      dQ.textContent = 'A NR-1 vale para a sua empresa desde 26/05/2026.';
      dOpts.innerHTML = `<div class="diag-result"><span class="chip ok">Caminho provável: ${via}</span><p>O STF suspendeu as multas por enquanto; a obrigação continua. Atualizado em 15/11/2026.</p><p class="caption muted">Grau de risco estimado — confirmado no enquadramento. Regras reais vêm do motor versionado. 🔎</p><div class="cta-row"><a class="btn btn-primary btn-sm" href="#contato">Falar com a Lastro <svg class="arrow"><use href="#i-arrow"/></svg></a><button class="btn btn-secondary btn-sm" type="button" id="dRe">Refazer</button></div></div>`;
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

  /* ---------- alternador de tema "maré" (M3) ---------- */
  const root = document.documentElement;
  function applyTheme(t) { root.setAttribute('data-theme', t); try { localStorage.setItem('lastro-tema', t); } catch (e) {} }
  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (reduce) { applyTheme(next); return; }
    const tide = document.createElement('div'); tide.className = 'tide'; tide.style.background = next === 'dark' ? '#013D31' : '#FFFFFF';
    document.body.appendChild(tide); tide.classList.add('rise');
    tide.addEventListener('animationend', () => { applyTheme(next); tide.classList.remove('rise'); tide.classList.add('fall'); tide.addEventListener('animationend', () => tide.remove(), { once: true }); }, { once: true });
  });
})();
