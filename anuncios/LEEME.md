# Anuncios en vídeo: Reto de 21 días

Son dos vídeos verticales de dibujos (1080×1920, 9:16), con voz en español de España. Sirven para Reels, Stories, TikTok y anuncios de Meta.

| Vídeo | Duración | Gancho |
|---|---|---|
| `anuncio-1-tu-casa-respira.mp4` | 19 s | «¿Llegas a casa y el desorden te espera?» |
| `anuncio-2-tres-senales.mp4` | 23 s | «3 señales de que necesitas este reto» |

Los dos terminan igual: **9,99 € con el código BIENVENIDA**, que se aplica solo al pagar. El precio normal es 12 €.

## Textos para el anuncio de Meta

**Texto principal (A):**
> ¿Ordenas un sábado entero y a la semana está todo igual? 🙃
> El Reto de 21 días te da una tarea de 10 minutos para cada día: hoy un cajón, mañana la encimera… y en 3 semanas tu casa respira.
> 👉 9,99 € con el código BIENVENIDA (se aplica solo al pagar). Descarga al momento.

**Texto principal (B):**
> No necesitas un fin de semana libre para tener la casa en orden. Solo 10 minutos al día durante 21 días ✨
> Código BIENVENIDA: tu reto por 9,99 €.

**Título:** Tu casa ordenada en 21 días
**Descripción:** 10 minutos al día · Descarga inmediata
**Botón:** Comprar

## Cómo lanzarlo con poco presupuesto (para buscar la primera venta)

1. Publica antes la tienda: hay que quitar la contraseña y activar el tema y los productos.
2. En Meta Ads Manager, crea una campaña de **Ventas** con un **presupuesto de 5–7 €/día** durante 3–4 días.
3. Elige **España**, mujeres de 35 a 55 años y segmentación Advantage+ (amplia).
4. Crea **un conjunto con los 2 vídeos** para que Meta elija el que funcione mejor.
5. Enlaza directamente a la página del producto del reto.
6. Sube también los vídeos como Reels orgánicos en Instagram y TikTok, y mándalos por WhatsApp a tus contactos y grupos.

## Editar los vídeos

Las fuentes están en `_fuentes/` (HTML + SVG animado).

Para volver a generar un vídeo:

```
node grabar.js ad1.html f1 19.2
ffmpeg -framerate 30 -i f1/f%05d.jpg -i voz1.mp3 -c:v libx264 -pix_fmt yuv420p -c:a aac salida.mp4
```

La portada del vídeo se lee de `../pdf/hi-reto-1.png`.
