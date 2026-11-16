/* Casca das páginas internas do site: cabeçalho, rodapé, WhatsApp, ondas, "emergir", alternador de tema "maré".
   <body data-page="nr1"> ; main com id="conteudo". Os links do menu são centralizados aqui. */
(function () {
  const page = document.body.dataset.page || '';
  const NAV = [['nr1', 'NR-1', 'nr1.html'], ['servicos', 'Serviços', 'servicos.html'], ['como', 'Como funciona', 'como-funciona.html'], ['porque', 'Por que a Lastro', 'por-que.html'], ['conteudos', 'Conteúdos', 'conteudos.html'], ['sobre', 'Sobre', 'sobre.html']];
  const link = ([id, t, h]) => `<a href="${h}" ${id === page ? 'aria-current="page"' : ''}>${t}</a>`;
  const header = `<a class="skip sr-only" href="#conteudo">Ir para o conteúdo</a>
  <header class="site-header" id="topo"><div class="wrap hdr">
    <a href="home.html" class="logo" data-logo="horizontal" aria-label="Lastro — início" style="height:34px"></a>
    <nav class="nav" aria-label="Principal">${NAV.map(link).join('')}</nav>
    <div class="hdr-actions">
      <a class="area" href="portal-login.html" title="Leva ao portal (endereço em aberto: /cliente ou app.)">${ic('lock')}<span>Área do cliente</span></a>
      <a class="btn btn-primary btn-sm cta-hdr" href="diagnostico.html">Diagnóstico grátis ${ic('arrow', 'arrow')}</a>
      <button class="theme-toggle" type="button" id="themeToggle" aria-label="Alternar tema claro e escuro">${ic('theme')}</button>
      <button class="menu-btn" type="button" id="menuBtn" aria-label="Abrir menu" aria-expanded="false" aria-controls="mnav">${ic('menu')}</button>
    </div></div></header>
  <div class="mnav" id="mnav" hidden>${NAV.map(([id, t, h]) => `<a href="${h}">${t}${ic('arrow')}</a>`).join('')}<a href="faq.html">Dúvidas frequentes${ic('arrow')}</a><a href="contato.html">Contato${ic('arrow')}</a><a href="portal-login.html">Área do cliente${ic('lock')}</a><a class="btn btn-primary" href="diagnostico.html">Diagnóstico grátis</a></div>`;
  const footer = `<footer class="footer on-deep" style="--sec:var(--bg-deeper)"><div class="wrap">
    <div class="fgrid">
      <div><span class="logo" data-logo="horizontal" style="height:30px;color:#fff"></span><p class="small on-deep-2" style="margin-top:14px;max-width:34ch">Gestão de riscos psicossociais (NR-1) para pequenas empresas de São Luís, MA.</p><p class="small on-deep-2" style="margin-top:10px">@lastro.sst</p></div>
      <div><h4>A Lastro</h4><ul><li><a href="sobre.html">Sobre</a></li><li><a href="por-que.html">Por que a Lastro</a></li><li><a href="contadores.html">Para contadores</a></li><li><a href="contato.html">Contato</a></li></ul></div>
      <div><h4>Programa</h4><ul><li><a href="nr1.html">NR-1 explicada</a></li><li><a href="servicos.html">Serviços</a></li><li><a href="como-funciona.html">Como funciona</a></li><li><a href="planos.html">Planos e contratação</a></li><li><a href="diagnostico.html">Diagnóstico grátis</a></li></ul></div>
      <div><h4>Ajuda e legal</h4><ul><li><a href="faq.html">Dúvidas frequentes</a></li><li><a href="conteudos.html">Conteúdos</a></li><li><a href="verificar.html">Verificar documento</a></li><li><a href="legais.html#privacidade">Privacidade e LGPD</a></li><li><a href="legais.html#termos">Termos</a></li><li><a href="legais.html#cookies">Cookies</a></li><li><a href="legais.html#limites">Aviso de limites</a></li></ul></div>
    </div>
    <p class="caption on-deep-2 fbottom">A Lastro entrega insumo técnico e documentação. Não emite laudo nem promete resultado de fiscalização. Dados de exemplo e números marcados 🔎 ainda serão verificados. Protótipo visual — não publicar.</p>
  </div></footer>
  <a class="wa" href="contato.html" aria-label="Falar pelo WhatsApp">${ic('wa')}</a>`;
  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);
  document.querySelectorAll('.wa svg').forEach(s => { s.setAttribute('width', 26); s.setAttribute('height', 26); s.style.width = '26px'; s.style.height = '26px'; });

  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ondas (M2) */
  function wavePath(w, y, amp, period, h) { let d = `M0 ${y}`; const n = Math.ceil(w / period); for (let i = 0; i < n; i++) d += ` q${period / 4} ${-amp} ${period / 2} 0 t${period / 2} 0`; return d + ` L${n * period} ${h} L0 ${h}Z`; }
  $$('[data-wave]').forEach(sec => { const w = document.createElement('div'); w.className = 'wave'; w.setAttribute('aria-hidden', 'true'); w.innerHTML = `<svg viewBox="0 0 3840 60" preserveAspectRatio="none"><path class="w-back" d="${wavePath(3840 + 240, 26, 14, 240, 60)}"/><path class="w-front" d="${wavePath(3840 + 160, 34, 12, 160, 60)}"/></svg>`; sec.prepend(w); });

  /* emergir */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

  /* sumário lateral destaca a seção atual */
  const toc = $$('.toc a[href^="#"]');
  if (toc.length) { const secs = toc.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const upd = () => { let cur = secs[0]; secs.forEach(s => { if (s.getBoundingClientRect().top < 140) cur = s; }); toc.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id)); };
    addEventListener('scroll', upd, { passive: true }); upd(); }

  /* maré (M3) */
  const root = document.documentElement;
  function applyTheme(t) { root.setAttribute('data-theme', t); try { localStorage.setItem('lastro-tema', t); } catch (e) {} }
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (reduce) { applyTheme(next); return; }
    const tide = document.createElement('div'); tide.className = 'tide'; tide.style.background = next === 'dark' ? '#013D31' : '#FFFFFF';
    document.body.appendChild(tide); tide.classList.add('rise');
    tide.addEventListener('animationend', () => { applyTheme(next); tide.classList.remove('rise'); tide.classList.add('fall'); tide.addEventListener('animationend', () => tide.remove(), { once: true }); }, { once: true });
  });
  const q = new URLSearchParams(location.search).get('tema'); if (q) root.setAttribute('data-theme', q);
})();
