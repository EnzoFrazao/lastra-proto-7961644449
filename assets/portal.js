/* Casca compartilhada do portal do cliente e do painel interno.
   <body data-shell="portal|interno" data-page="id" data-crumb="Texto" [data-nav="id-do-menu"]>
   Injeta menu lateral, topo (sino, menu do usuário, botão do menu no celular) e comportamentos: abas, gaveta, toast, segmentos. */
(function () {
  const B = document.body, shell = B.dataset.shell || 'portal', page = B.dataset.nav || B.dataset.page, crumb = B.dataset.crumb || '';
  const I = ic;

  /* ---------- menus (o menu do portal é a proposta de 7 itens — decisão 18; mudar aqui muda em todas as telas) ---------- */
  const PORTAL = [[null, [
    ['home', 'Visão geral', 'home', 'portal-dashboard.html'],
    ['programa', 'Meu programa', 'flag', 'portal-programa.html'],
    ['pendencias', 'Pendências', 'todo', 'portal-pendencias.html', '3'],
    ['resultados', 'Pesquisa e resultados', 'chart', 'portal-resultados.html'],
    ['plano', 'Plano de ação', 'list', 'portal-plano.html'],
    ['documentos', 'Documentos e dossiê', 'file', 'portal-documentos.html', '1', 'soft'],
    ['mensagens', 'Mensagens', 'chat', 'portal-mensagens.html', '1']
  ]]];
  const INTERNO = [
    ['Carteira', [
      ['carteira', 'Visão geral', 'home', 'interno-carteira.html'],
      ['clientes', 'Clientes', 'building', 'interno-clientes.html'],
      ['leads', 'Leads', 'target', 'interno-leads.html', '4']]],
    ['Operação', [
      ['ciclo', 'Ciclos', 'refresh', 'interno-ciclo.html'],
      ['pesquisa', 'Pesquisas e análise', 'chart', 'interno-pesquisa.html'],
      ['inventario', 'Inventário e plano', 'list', 'interno-inventario.html'],
      ['revisao', 'Revisão e assinatura', 'sig', 'interno-revisao.html', '5'],
      ['documentos', 'Documentos', 'file', 'interno-documentos.html'],
      ['mensagens', 'Mensagens', 'chat', 'interno-mensagens.html', '7', 'soft']]],
    ['Gestão', [
      ['parceiros', 'Parceiros', 'users', 'interno-parceiros.html'],
      ['usuarios', 'Usuários e permissões', 'lock', 'interno-usuarios.html'],
      ['cobranca', 'Cobrança e contratos', 'card', 'interno-cobranca.html'],
      ['auditoria', 'Auditoria', 'shield', 'interno-auditoria.html'],
      ['config', 'Modelos e regras', 'gear', 'interno-config.html']]]
  ];
  const C = shell === 'interno' ? {
    groups: INTERNO, home: 'interno-carteira.html', prefix: 'Painel interno', chip: 'Dados de exemplo — clientes fictícios',
    user: ['AR', 'Ana Ribeiro', 'Operação · Lastro'], search: 'Buscar cliente, documento ou CNPJ',
    notes: [['Inventário aguardando revisão do RT', 'Padaria Sol Nascente · hoje, 09:12'], ['Novo lead pelo diagnóstico', 'Mercadinho Bom Preço · ontem, 17:03'], ['Prazo de entrega vence em 3 dias', 'Clínica Vida Plena · 18/11', 1]],
    menu: [['users', 'Meu perfil', 'interno-usuarios.html'], ['help', 'Ajuda interna', '#'], ['out', 'Sair', 'interno-login.html']]
  } : {
    groups: PORTAL, home: 'portal-dashboard.html', prefix: 'Portal', chip: 'Dados de exemplo — empresa fictícia',
    user: ['MC', 'Marina Costa', 'Padaria Sol Nascente'], search: 'Buscar documento ou etapa',
    notes: [['Inventário enviado para revisão', 'Hoje, 09:12'], ['Nova pendência: divulgar a pesquisa', 'Ontem, 16:40'], ['Pesquisa atingiu 62% de adesão', '13/11', 1]],
    menu: [['building', 'Minha empresa e usuários', 'portal-empresa.html'], ['lock', 'Conta e privacidade', 'portal-conta.html'], ['bell', 'Notificações e preferências', 'portal-notificacoes.html'], ['help', 'Ajuda', 'portal-ajuda.html'], ['out', 'Sair', 'portal-login.html']]
  };
  B.classList.add(shell);

  const nav = C.groups.map(([label, items]) => (label ? `<p class="nav-label">${label}</p>` : '') +
    `<div class="nav-g">${items.map(([id, t, icon, href, b, k]) => `<a href="${href}" ${id === page ? 'class="on" aria-current="page"' : ''}>${I(icon)}${t}${b ? `<span class="badge ${k || ''}">${b}</span>` : ''}</a>`).join('')}</div>`).join('');
  const side = `<aside class="side" id="side" aria-label="Navegação">
    <a class="brand logo" data-logo="horizontal" style="height:32px" href="${C.home}" aria-label="Lastro — início"></a>
    ${shell === 'interno' ? '<span class="env">Painel interno</span>' : ''}
    <nav class="nav">${nav}</nav>
    <div class="side-bottom">
      <a class="side-help" href="${shell === 'interno' ? '#' : 'portal-ajuda.html'}">${I('help')}Ajuda</a>
      <div class="usermenu" id="usermenu" role="menu">${C.menu.map(([ic2, t, h]) => `<a role="menuitem" href="${h}">${I(ic2)}${t}</a>`).join('')}</div>
      <button class="user" id="userbtn" type="button" aria-haspopup="menu" aria-expanded="false"><span class="avatar">${C.user[0]}</span><div><b>${C.user[1]}</b><span>${C.user[2]}</span></div>${I('dots', 's')}</button>
    </div></aside>`;
  const top = `<header class="top">
    <div class="inline"><button class="iconbtn menubtn" id="menubtn" type="button" aria-label="Abrir menu" aria-controls="side" aria-expanded="false">${I('menu')}</button><p class="crumb">${C.prefix} · <b>${crumb}</b></p></div>
    <div class="top-r">
      <label class="search">${I('search', 's')}<span>${C.search}</span></label>
      <button class="iconbtn" id="bell" type="button" aria-label="Notificações — ${C.notes.filter(n => !n[2]).length} novas" aria-expanded="false">${I('bell')}<i></i></button>
      <span class="avatar" aria-hidden="true">${C.user[0]}</span>
      <div class="pop" id="pop" role="region" aria-label="Notificações"><h3>Notificações</h3>
        ${C.notes.map(([t, s, r]) => `<a href="${shell === 'interno' ? '#' : 'portal-notificacoes.html'}" class="${r ? 'read' : ''}"><i></i><div>${t}<span>${s}</span></div></a>`).join('')}
        <a class="all" href="${shell === 'interno' ? '#' : 'portal-notificacoes.html'}">Ver todas e preferências</a></div>
    </div></header>`;
  const app = document.querySelector('.app');
  app.insertAdjacentHTML('afterbegin', side);
  const main = app.querySelector('.app-main');
  main.insertAdjacentHTML('afterbegin', top);
  const m = main.querySelector('main');
  if (m && !B.hasAttribute('data-nochip')) m.insertAdjacentHTML('afterbegin', `<span class="chip warn sample">${C.chip}</span>`);
  if (m) m.insertAdjacentHTML('beforeend', `<p class="foot">${shell === 'interno' ? 'Painel interno — protótipo visual com dados fictícios. Nada aqui é publicável.' : 'Insumo técnico — não é laudo. Documentos assinados por quem responde tecnicamente. Dados desta tela são exemplos de protótipo.'}</p>`);
  document.body.insertAdjacentHTML('beforeend', '<div class="scrim" id="scrim"></div><div class="toast" id="toast" role="status" aria-live="polite"></div>');

  /* ---------- notificações, menu do usuário, menu no celular ---------- */
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const bell = $('#bell'), pop = $('#pop'), ub = $('#userbtn'), um = $('#usermenu'), mb = $('#menubtn'), sd = $('#side'), sc = $('#scrim');
  const closeMenus = () => { pop.classList.remove('on'); bell.setAttribute('aria-expanded', false); um.classList.remove('on'); ub.setAttribute('aria-expanded', false); };
  bell.addEventListener('click', e => { e.stopPropagation(); const on = !pop.classList.contains('on'); closeMenus(); pop.classList.toggle('on', on); bell.setAttribute('aria-expanded', on); });
  ub.addEventListener('click', e => { e.stopPropagation(); const on = !um.classList.contains('on'); closeMenus(); um.classList.toggle('on', on); ub.setAttribute('aria-expanded', on); });
  mb.addEventListener('click', e => { e.stopPropagation(); const on = !sd.classList.contains('open'); sd.classList.toggle('open', on); sc.classList.toggle('on', on); mb.setAttribute('aria-expanded', on); });
  document.addEventListener('click', e => { if (!pop.contains(e.target)) closeMenus(); });

  /* ---------- gaveta / modal / toast ---------- */
  function closeAll() { $$('.drawer.on, .modal.on').forEach(d => d.classList.remove('on')); sd.classList.remove('open'); sc.classList.remove('on'); mb.setAttribute('aria-expanded', false); closeMenus(); }
  let tt; window.toast = msg => { const t = $('#toast'); t.innerHTML = I('check') + msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); };
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); closeAll(); const d = document.getElementById(o.dataset.open); if (d) { d.classList.add('on'); sc.classList.add('on'); } return; }
    if (e.target.closest('[data-close]') || e.target === sc) { closeAll(); }
    const t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); if (t.dataset.close !== undefined) closeAll(); toast(t.dataset.toast); }
    const ck = e.target.closest('.ck[role=checkbox]'); if (ck) ck.setAttribute('aria-checked', ck.getAttribute('aria-checked') !== 'true');
    const pr = e.target.closest('.pillrow button'); if (pr) { $$('button', pr.parentElement).forEach(b => b.setAttribute('aria-pressed', b === pr)); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  /* ---------- abas ARIA ---------- */
  $$('[data-tabs]').forEach(w => {
    const tabs = $$('[role=tab]', w), panels = $$('[role=tabpanel]', w);
    function go(i, focus) {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => p.hidden = k !== i);
      if (focus) tabs[i].focus();
      try { history.replaceState(null, '', '#' + tabs[i].dataset.tab); } catch (e) {}
    }
    tabs.forEach((t, i) => { t.addEventListener('click', () => go(i)); t.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go((i + 1) % tabs.length, true); if (e.key === 'ArrowLeft') go((i - 1 + tabs.length) % tabs.length, true); }); });
    const start = tabs.findIndex(t => '#' + t.dataset.tab === location.hash); go(start >= 0 ? start : 0);
  });
  /* ---------- segmentos: <div class="seg" data-seg="grupo"><button data-v="a">…</button></div> + <div data-seg-panel="grupo:a"> ---------- */
  $$('[data-seg]').forEach(s => {
    const g = s.dataset.seg, btns = $$('button', s);
    const show = v => { btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v)); $$(`[data-seg-panel^="${g}:"]`).forEach(p => p.hidden = p.dataset.segPanel !== `${g}:${v}`); };
    btns.forEach(b => b.addEventListener('click', () => show(b.dataset.v)));
    const init = btns.find(b => b.getAttribute('aria-pressed') === 'true') || btns[0]; show(init.dataset.v);
  });
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => { try { navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy); } catch (e) {} toast('Copiado'); }));
  expandIcons();
})();
