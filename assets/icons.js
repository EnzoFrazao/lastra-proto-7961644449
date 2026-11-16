/* Ícones (sprite) e atalho: <i data-i="nome"></i> vira <svg class="i"> com o ícone. Compartilhado por site, portal, painel interno e pesquisa. */
(function () {
  const P = {
    home: '<path d="M4 11l8-7 8 7v9H4z"/>', flag: '<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>', todo: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12l3 3 5-6"/>',
    chart: '<path d="M5 20V10M12 20V4M19 20v-7"/>', file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.700M12 17h.01"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', lock: '<path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 7a2.5 2.5 0 1 1 0 5M17 14c2.5.3 4 2 4 5"/>',
    building: '<path d="M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3"/>', card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>', download: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>', send: '<path d="M4 12l16-8-6 16-3-7z"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>', pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>', qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h3v3M20 14v.01M14 20h.01M17 20h3v-3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', warn: '<path d="M12 4l9 16H3zM12 10v4M12 17h.01"/>', dots: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>',
    clip: '<path d="M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7"/>', sig: '<path d="M4 18c3-6 5-10 7-10s-1 8 1 8 3-4 4-4 1 2 4 2"/>', book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10"/>',
    out: '<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>', pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>', group: '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.5 6 5.5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>', pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>', tree: '<path d="M12 3v6M5 21v-5h14v5M7 16v-4h10v4M12 9H6v3M12 9h6v3"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', refresh: '<path d="M20 12a8 8 0 1 1-2.500-5.800M20 4v5h-5"/>', ship: '<path d="M3 15h18l-3 5H6zM6 15V9h8v6M10 9V5h4"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>', hash: '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12h.01"/>'
  };
  let s = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">';
  for (const k in P) s += `<symbol id="i-${k}" viewBox="0 0 24 24">${P[k]}</symbol>`;
  s += '<symbol id="i-theme" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></symbol>';
  s += '<symbol id="i-wa" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.200 14.800l-.4-.2-2.600.7.7-2.500-.3-.4A8 8 0 0 1 12 4zm-3 3.500c-.3 0-.7.100-1 .5-.4.5-1 1.400-1 2.600s.9 2.600 1 2.800c.2.2 2 3.200 5 4.300 2.500 1 3 .8 3.500.7.6-.1 1.800-.8 2-1.500.3-.7.3-1.300.2-1.500l-.5-.3-1.800-.9c-.3-.1-.5-.2-.7.1l-.8 1c-.2.2-.3.2-.6.1-.3-.2-1.200-.5-2.300-1.400-.8-.8-1.400-1.700-1.600-2-.2-.3 0-.4.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.5-.6-.5z"/></symbol>';
  s += '</svg>';
  document.body.insertAdjacentHTML('afterbegin', s);
  window.ic = (n, c) => `<svg class="i ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  window.expandIcons = (root) => (root || document).querySelectorAll('[data-i]').forEach(e => { e.outerHTML = ic(e.dataset.i, e.className); });
  expandIcons();
})();
