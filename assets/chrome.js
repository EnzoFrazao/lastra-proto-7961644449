/* Menu no celular + aviso de cookies (recusar o que não é essencial é o padrão). Usado pela Home e pelas páginas do site. */
(function () {
  const btn = document.getElementById('menuBtn'), nav = document.getElementById('mnav');
  if (btn && nav) {
    btn.addEventListener('click', () => { const on = nav.hidden; nav.hidden = !on; btn.setAttribute('aria-expanded', on); document.body.style.overflow = on ? 'hidden' : ''; });
    nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.hidden = true; btn.setAttribute('aria-expanded', false); document.body.style.overflow = ''; } });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) { nav.hidden = true; btn.setAttribute('aria-expanded', false); document.body.style.overflow = ''; } });
  }
  let seen = false; try { seen = localStorage.getItem('lastro-cookies'); } catch (e) {}
  if (seen && !new URLSearchParams(location.search).get('cookies')) return;
  const el = document.createElement('div'); el.className = 'cookie wa-shift'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Aviso de cookies');
  el.innerHTML = `<p><b>Cookies.</b> Usamos só o necessário para o site funcionar. Se você aceitar, também medimos o uso de forma anônima para melhorar o conteúdo. <a href="legais.html#cookies">Saiba mais</a>.</p><div class="acts"><button class="btn btn-secondary" data-c="no">Recusar não essenciais</button><button class="btn btn-primary" data-c="yes">Aceitar</button></div>`;
  el.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; try { localStorage.setItem('lastro-cookies', b.dataset.c); } catch (x) {} el.remove(); });
  document.body.appendChild(el);
})();
