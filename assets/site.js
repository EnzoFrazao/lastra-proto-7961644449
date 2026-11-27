/* Casca das páginas internas do site: cabeçalho, rodapé, WhatsApp, "emergir" ao rolar, alternador de tema (véu horizontal).
   <body data-page="nr1"> ; main com id="conteudo". Os links do menu são centralizados aqui. */
(function () {
  const page = document.body.dataset.page || '';
  /* Menu enxuto (4 links). NR-1, FAQ e artigos ficam sob Conteúdos; Planos sob Serviços (o item ativo é o "pai"). */
  const NAV = [['inicio', 'Início', 'home.html'], ['servicos', 'Serviços', 'servicos.html'], ['conteudos', 'Conteúdos', 'conteudos.html'], ['sobre', 'Sobre', 'sobre.html']];
  const PARENT = { nr1: 'conteudos', faq: 'conteudos', artigo: 'conteudos', planos: 'servicos' };
  const cur = PARENT[page] || page;
  const link = ([id, t, h]) => `<a href="${h}" ${id === cur ? 'aria-current="page"' : ''}>${t}</a>`;
  const header = `<a class="skip sr-only" href="#conteudo">Ir para o conteúdo</a>
  <header class="site-header" id="topo"><div class="wrap hdr">
    <a href="home.html" class="logo" data-logo="horizontal" aria-label="Lastra — início" style="height:34px"></a>
    <nav class="nav" aria-label="Principal">${NAV.map(link).join('')}</nav>
    <div class="hdr-actions">
      <a class="area" href="portal-login.html" title="Leva ao portal (endereço em aberto: /cliente ou app.)">${ic('lock')}<span>Área do cliente</span></a>
      <a class="btn btn-light btn-sm cta-hdr" href="enquadramento.html">Enquadramento grátis ${ic('arrow', 'arrow')}</a>
      <button class="theme-toggle" type="button" id="themeToggle" aria-label="Alternar tema claro e escuro">${ic('theme')}</button>
      <button class="menu-btn" type="button" id="menuBtn" aria-label="Abrir menu" aria-expanded="false" aria-controls="mnav">${ic('menu')}</button>
    </div></div></header>
  <div class="mnav" id="mnav" hidden>${NAV.map(([id, t, h]) => `<a href="${h}">${t}${ic('arrow')}</a>`).join('')}<a href="faq.html">Dúvidas frequentes${ic('arrow')}</a><a href="contato.html">Contato${ic('arrow')}</a><a href="portal-login.html">Área do cliente${ic('lock')}</a><a class="btn btn-primary" href="enquadramento.html">Enquadramento grátis</a></div>`;
  const footer = `<footer class="ft">
  <div class="ft-main">
    <div class="ft-cta"><h2 class="ft-h">Uma empresa firme começa com uma conversa.</h2><a class="btn btn-light" href="contato.html">Contato</a></div>
    <nav class="ft-cols" aria-label="Rodapé">
      <div><h4>Navegação</h4><ul><li><a href="home.html">Início</a></li><li><a href="servicos.html">Serviços</a></li><li><a href="conteudos.html">Conteúdos</a></li><li><a href="sobre.html">Sobre</a></li></ul></div>
      <div><h4>Comece</h4><ul><li><a href="enquadramento.html">Enquadramento</a></li><li><a href="portal-login.html">Área do cliente</a></li><li><a href="planos.html">Planos</a></li><li><a href="faq.html">Dúvidas</a></li></ul></div>
      <div><h4>Contato</h4><ul><li><a href="contato.html">contato@lastra.example</a></li></ul><div class="ft-soc"><a href="contato.html" aria-label="Facebook"><img src="assets/figma/s1.svg" alt=""></a><a href="contato.html" aria-label="Instagram"><img src="assets/figma/s2.svg" alt=""></a><a href="contato.html" aria-label="X"><img src="assets/figma/s3.svg" alt=""></a><a href="contato.html" aria-label="LinkedIn"><img src="assets/figma/s4.svg" alt=""></a></div></div>
    </nav>
  </div>
  <div class="ft-bar on-deep">
    <div class="ft-bar-in"><p>© 2026 Lastra · São Luís, MA. Insumo técnico, não emitimos laudo.</p><nav aria-label="Legal"><a href="legais.html#limites">Aviso de limites</a><a href="legais.html#termos">Termos</a><a href="legais.html#privacidade">Privacidade e LGPD</a></nav></div>
    <p class="disc">Protótipo visual: dados de exemplo e números marcados com * ainda serão verificados. Não publicar.</p>
  </div>
</footer>
  <a class="wa" href="contato.html" aria-label="Falar pelo WhatsApp">${ic('wa')}</a>`;
  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);
  document.querySelectorAll('.wa svg').forEach(s => { s.setAttribute('width', 26); s.setAttribute('height', 26); s.style.width = '26px'; s.style.height = '26px'; });


  /* cabeçalho compacto ao rolar (Figma: 146 px no topo) */
  (function () { const hd = document.querySelector('.site-header'); if (!hd) return; const f = () => hd.classList.toggle('compact', scrollY > 24); addEventListener('scroll', f, { passive: true }); f(); })();
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* divisores de estrato: CSS puro em [data-strata]::before (home.css); nada a injetar */

  /* emergir */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

  /* sumário lateral destaca a seção atual */
  const toc = $$('.toc a[href^="#"]');
  if (toc.length) { const secs = toc.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const upd = () => { let cur = secs[0]; secs.forEach(s => { if (s.getBoundingClientRect().top < 140) cur = s; }); toc.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id)); };
    addEventListener('scroll', upd, { passive: true }); upd(); }

  /* troca de tema: véu que desce (cor lida do token --bg-page do tema de destino) */
  const root = document.documentElement;
  function applyTheme(t) { root.setAttribute('data-theme', t); try { localStorage.setItem('lastra-tema', t); } catch (e) {} }
  function pageBg(theme) { const p = document.createElement('div'); p.setAttribute('data-theme', theme); p.style.cssText = 'position:absolute;visibility:hidden;background:var(--bg-page)'; document.body.appendChild(p); const c = getComputedStyle(p).backgroundColor; p.remove(); return c; }
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (reduce) { applyTheme(next); return; }
    const veil = document.createElement('div'); veil.className = 'veil'; veil.style.background = pageBg(next);
    document.body.appendChild(veil); veil.classList.add('drop');
    veil.addEventListener('animationend', () => { applyTheme(next); veil.classList.remove('drop'); veil.classList.add('lift'); veil.addEventListener('animationend', () => veil.remove(), { once: true }); }, { once: true });
  });
  const q = new URLSearchParams(location.search).get('tema'); if (q) root.setAttribute('data-theme', q);
})();
