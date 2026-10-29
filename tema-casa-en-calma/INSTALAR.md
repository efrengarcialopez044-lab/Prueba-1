# Casa en Calma · Reto de 21 días — Tema Shopify (Online Store 2.0)

Tema basado en Dawn con secciones propias (prefijo `cc-`), 100 % editables desde el editor de Shopify.

## Ya instalado en tu tienda
El tema **"Casa en Calma – Reto 21 días"** ya está subido a `1nukqm-b8.myshopify.com`, **sin publicar**.
Para verlo: Panel de Shopify → Tienda online → Temas → "Casa en Calma – Reto 21 días" → **Personalizar**.

## Secciones
| Archivo | Qué es |
|---|---|
| `sections/cc-hero.liquid` | Portada: titular, cuaderno 3D que gira con el ratón y el scroll, contador animado, botón de compra directa |
| `sections/cc-problema.liquid` | Problema → solución (dos tarjetas con efecto tilt) |
| `sections/cc-cinta.liquid` | Cinta animada con frases que se desliza sola |
| `sections/cc-recorrido.liquid` | Recorrido 3D: al bajar, las páginas pasan en 3D y se encienden los 21 días |
| `sections/cc-oferta.liquid` | Tarjeta de compra: elegir Reto (7 €) o Pack completo (10 €), garantía, iconos de pago y cuenta atrás opcional |
| `sections/cc-incluye.liquid` | Qué incluye: vistas previas de las páginas (opcional) |
| `sections/cc-pasos.liquid` | Cómo funciona en 3 pasos |
| `sections/cc-testimonios.liquid` | Testimonios (huecos editables: usa solo opiniones reales) |
| `sections/cc-garantia.liquid` | Garantía de devolución |
| `sections/cc-faq.liquid` | Preguntas frecuentes en acordeón |
| `sections/cc-cta.liquid` | Llamada final: precio, cuenta atrás hasta una fecha real, oferta del planner por 3 € |
| `sections/cc-barra.liquid` | Botón de compra fijo en el móvil |
| `snippets/cc-compra.liquid` | Formulario de compra directa al pago (+ casilla del producto extra) |
| `snippets/cc-confianza.liquid` | Fila de confianza + iconos de las formas de pago |
| `assets/cc-styles.css`, `assets/cc-scripts.js` | Estilos y animaciones: escena 3D por capas, titulares palabra a palabra, botones magnéticos, barra de progreso, tilt, parallax (sin librerías externas) |
| `templates/index.json`, `templates/product.reto.json` | Portada y página del producto con la landing completa |

## Instalarlo en otra tienda (manual)
1. Tienda online → Temas → ⋯ → **Editar código** de un tema Dawn (duplicado).
2. Crea cada archivo de `sections/`, `snippets/` y `assets/` con el mismo nombre y pega su contenido.
3. En `layout/theme.liquid`, antes de `</head>`, añade:
   ```liquid
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=DM+Sans:wght@400;500;600;700&display=swap">
   {{ 'cc-styles.css' | asset_url | stylesheet_tag }}
   <script src="{{ 'cc-scripts.js' | asset_url }}" defer="defer"></script>
   ```
4. Crea las plantillas `templates/index.json` y `templates/product.reto.json` (cambia los nombres de producto si son distintos).
5. En el producto del reto → Plantilla del tema → **product.reto**.
6. Personalizar → revisa textos, testimonios y la fecha de fin de la oferta → Publicar.

## Apps necesarias
| App | Para qué | Precio |
|---|---|---|
| **Shopify Digital Downloads / Digital Products** (de Shopify) | Envía el PDF automáticamente tras el pago | Gratis — **ya instalada** |
| Oferta en el propio pago (opcional) | Mostrar el planner de 3 € dentro de la página de pago o tras comprar. En el plan Basic, la página de pago no se puede modificar sin una app de "post‑purchase upsell" (p. ej. AfterSell, ReConvert) | Suelen tener plan gratis o desde ~8 $/mes |
| Reseñas (opcional) | Recoger opiniones reales para los testimonios (p. ej. Judge.me) | Plan gratis |

La oferta del planner ya funciona **sin apps**: es una casilla junto al botón de compra (en la llamada final, y en la portada si lo activas), que añade los dos productos y lleva directo al pago.

## Antes de publicar
- [ ] Conectar el PDF a cada producto (app Digital Products) y publicarlos.
- [ ] Poner la fecha real de fin de la oferta (sección "Llamada final" → "Fin de la oferta"), o dejarla vacía.
- [ ] Sustituir los testimonios por opiniones reales o eliminar la sección.
- [ ] Revisar las páginas legales (privacidad, términos, devoluciones) para que digan lo mismo que la garantía de 14 días.
