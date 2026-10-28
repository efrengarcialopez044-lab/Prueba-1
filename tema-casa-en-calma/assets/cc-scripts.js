/* Casa en Calma — interacciones (prefijo cc-) */
(function () {
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function aparecer(raiz) {
    var els = (raiz || document).querySelectorAll('.cc-aparece:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  // Contador animado (0 → n) cuando entra en pantalla
  function contadores(raiz) {
    (raiz || document).querySelectorAll('[data-cc-contar]').forEach(function (el) {
      var fin = parseInt(el.getAttribute('data-cc-contar'), 10) || 0;
      if (reducir || !('IntersectionObserver' in window)) { el.textContent = fin; return; }
      el.textContent = '0';
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        var t0 = null;
        function paso(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1400);
          el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
      io.observe(el);
    });
  }

  // Cuaderno 3D: sigue al ratón y gira un poco con el scroll
  function cuaderno(raiz) {
    if (reducir) return;
    (raiz || document).querySelectorAll('[data-cc-escena]').forEach(function (zona) {
      var libro = zona.querySelector('[data-cc-cuaderno]');
      if (!libro) return;
      var fuerza = parseFloat(zona.getAttribute('data-cc-fuerza')) || 1;
      var base = { rx: 8, ry: -22 };
      function poner(rx, ry) { libro.style.setProperty('--cc-rx', rx + 'deg'); libro.style.setProperty('--cc-ry', ry + 'deg'); }
      zona.addEventListener('mousemove', function (e) {
        var r = zona.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        libro.classList.add('is-sigue');
        poner(base.rx - y * 18 * fuerza, base.ry + x * 34 * fuerza);
      });
      zona.addEventListener('mouseleave', function () { libro.classList.remove('is-sigue'); poner(base.rx, base.ry); });
      var tic = false;
      window.addEventListener('scroll', function () {
        if (tic) return; tic = true;
        requestAnimationFrame(function () {
          tic = false;
          var r = zona.getBoundingClientRect();
          var p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
          if (!libro.classList.contains('is-sigue')) poner(base.rx + p * 6 * fuerza, base.ry + p * 16 * fuerza);
        });
      }, { passive: true });
    });
  }

  // Efecto tilt en tarjetas
  function tilt(raiz) {
    if (reducir || !matchMedia('(hover: hover)').matches) return;
    (raiz || document).querySelectorAll('[data-cc-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilt');
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 9) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.classList.remove('is-tilt'); el.style.transform = ''; });
    });
  }

  // Parallax ligero
  function parallax() {
    var els = document.querySelectorAll('[data-cc-parallax]');
    if (reducir || !els.length) return;
    var tic = false;
    function mover() {
      els.forEach(function (el) {
        var v = parseFloat(el.getAttribute('data-cc-parallax')) || 0.1;
        var r = el.parentElement.getBoundingClientRect();
        el.style.translate = '0 ' + ((r.top + r.height / 2 - innerHeight / 2) * -v).toFixed(1) + 'px';
      });
      tic = false;
    }
    window.addEventListener('scroll', function () { if (!tic) { tic = true; requestAnimationFrame(mover); } }, { passive: true });
    mover();
  }

  // Cuenta atrás hasta una fecha real (se oculta al terminar)
  function cuentas(raiz) {
    (raiz || document).querySelectorAll('[data-cc-hasta]').forEach(function (el) {
      var fin = new Date(el.getAttribute('data-cc-hasta')).getTime();
      if (isNaN(fin)) { el.hidden = true; return; }
      var dos = function (n) { return String(n).padStart(2, '0'); };
      function tic() {
        var r = fin - Date.now();
        if (r <= 0) {
          el.hidden = true;
          var aviso = el.parentElement.querySelector('[data-cc-fin-oferta]');
          if (aviso) aviso.hidden = false;
          clearInterval(t);
          return;
        }
        el.querySelector('[data-d]').textContent = dos(Math.floor(r / 864e5));
        el.querySelector('[data-h]').textContent = dos(Math.floor(r / 36e5) % 24);
        el.querySelector('[data-m]').textContent = dos(Math.floor(r / 6e4) % 60);
        el.querySelector('[data-s]').textContent = dos(Math.floor(r / 1e3) % 60);
      }
      var t = setInterval(tic, 1000); tic();
    });
  }

  // Compra directa: vacía el carrito, añade el reto (y el extra si se marca) y va al pago
  function compra(raiz) {
    (raiz || document).querySelectorAll('form[data-cc-compra]').forEach(function (f) {
      if (f.dataset.ccListo) return;
      f.dataset.ccListo = '1';
      f.addEventListener('submit', function (e) {
        if (!window.fetch) return;
        e.preventDefault();
        var boton = f.querySelector('[type="submit"]');
        if (boton) boton.classList.add('is-cargando');
        var items = [{ id: Number(f.querySelector('input[name="id"]').value), quantity: 1 }];
        var extra = f.querySelector('[data-cc-extra]');
        if (extra && extra.checked) items.push({ id: Number(extra.value), quantity: 1 });
        var raizUrl = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
        fetch(raizUrl + 'cart/clear.js', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
          .then(function () {
            return fetch(raizUrl + 'cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items }) });
          })
          .then(function (r) { if (!r.ok) throw new Error('add'); window.location.href = raizUrl + 'checkout'; })
          .catch(function () { if (boton) boton.classList.remove('is-cargando'); f.submit(); });
      });
    });
    // Sincroniza las casillas de "añadir extra" de todos los formularios
    document.querySelectorAll('[data-cc-extra]').forEach(function (c) {
      c.addEventListener('change', function () {
        document.querySelectorAll('[data-cc-extra]').forEach(function (o) { o.checked = c.checked; });
      });
    });
  }

  function barra() {
    var b = document.querySelector('[data-cc-barra]');
    var ancla = document.querySelector('[data-cc-ancla-compra]');
    if (!b) return;
    if (!ancla || !('IntersectionObserver' in window)) { b.classList.add('is-visible'); return; }
    new IntersectionObserver(function (en) {
      b.classList.toggle('is-visible', !en[0].isIntersecting && en[0].boundingClientRect.top < 0);
    }).observe(ancla);
  }

  function iniciar(raiz) { aparecer(raiz); contadores(raiz); cuaderno(raiz); tilt(raiz); cuentas(raiz); compra(raiz); }
  document.addEventListener('DOMContentLoaded', function () { iniciar(); parallax(); barra(); });
  document.addEventListener('shopify:section:load', function (e) { iniciar(e.target); });
})();
