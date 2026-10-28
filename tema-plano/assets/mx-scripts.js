/* Plano — interacciones (prefijo mx-) */
(function () {
  function aparecer(raiz) {
    var els = (raiz || document).querySelectorAll('.mx-aparece:not(.is-in), .mx-escala:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function galeria(raiz) {
    (raiz || document).querySelectorAll('[data-mx-galeria]').forEach(function (g) {
      var principal = g.querySelector('[data-mx-principal]');
      g.querySelectorAll('[data-mx-mini]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!principal) return;
          principal.style.opacity = 0;
          setTimeout(function () {
            principal.src = b.getAttribute('data-mx-mini');
            principal.removeAttribute('srcset');
            principal.alt = b.getAttribute('data-mx-alt') || '';
            principal.style.opacity = 1;
          }, 180);
          g.querySelectorAll('[data-mx-mini]').forEach(function (x) { x.classList.remove('is-on'); });
          b.classList.add('is-on');
        });
      });
    });
  }

  function carrusel(raiz) {
    (raiz || document).querySelectorAll('[data-mx-carrusel]').forEach(function (c) {
      var pista = c.querySelector('[data-mx-pista]');
      c.querySelectorAll('[data-mx-mover]').forEach(function (b) {
        b.addEventListener('click', function () {
          var item = pista.querySelector('.mx-carrusel__item');
          var paso = item ? item.offsetWidth + 20 : 400;
          pista.scrollBy({ left: paso * Number(b.getAttribute('data-mx-mover')), behavior: 'smooth' });
        });
      });
    });
  }

  function variantes(raiz) {
    (raiz || document).querySelectorAll('[data-mx-producto]').forEach(function (p) {
      var datos = p.querySelector('[data-mx-variantes]');
      if (!datos) return;
      var lista = JSON.parse(datos.textContent);
      var selects = p.querySelectorAll('[data-mx-opcion]');
      var formato = p.getAttribute('data-mx-moneda') || '{{amount}} €';
      function dinero(c) {
        var v = (c / 100).toFixed(2);
        return formato.replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, v.replace('.', ',')).replace(/\{\{\s*amount\s*\}\}/, v).replace(/\{\{[^}]*\}\}/, v.replace('.', ','));
      }
      function actualizar() {
        var elegidas = Array.prototype.map.call(selects, function (s) { return s.value; });
        var v = lista.find(function (x) { return x.options.every(function (o, i) { return o === elegidas[i]; }); });
        if (!v) return;
        p.querySelector('input[name="id"]').value = v.id;
        var precio = p.querySelector('[data-mx-precio]');
        if (precio) precio.textContent = dinero(v.price);
        var tachado = p.querySelector('[data-mx-tachado]');
        if (tachado) { tachado.hidden = !(v.compare_at_price > v.price); tachado.textContent = dinero(v.compare_at_price); }
        var b = p.querySelector('[data-mx-comprar]');
        if (b) { b.disabled = !v.available; b.textContent = v.available ? b.getAttribute('data-mx-normal') : b.getAttribute('data-mx-agotado'); }
      }
      selects.forEach(function (s) { s.addEventListener('change', actualizar); });
    });
  }

  function barra() {
    var b = document.querySelector('[data-mx-barra]');
    var ancla = document.querySelector('[data-mx-ancla-compra]');
    if (!b || !ancla || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) {
      b.classList.toggle('is-visible', !en[0].isIntersecting && en[0].boundingClientRect.top < 0);
    }).observe(ancla);
  }

  function iniciar(raiz) { aparecer(raiz); galeria(raiz); carrusel(raiz); variantes(raiz); }
  document.addEventListener('DOMContentLoaded', function () { iniciar(); barra(); });
  document.addEventListener('shopify:section:load', function (e) { iniciar(e.target); });
})();
