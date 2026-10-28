# Respuestas automáticas para WhatsApp

Bot que contesta automáticamente los mensajes que recibes en tu WhatsApp.
Se conecta como "dispositivo vinculado" (igual que WhatsApp Web) usando
[whatsapp-web.js](https://wwebjs.dev/).

## Qué hace

- **Responde por palabras clave**: si te escriben "precio", "horario", "ubicación"…, manda la respuesta que tú definas.
- **Respuesta por defecto** para cualquier otro mensaje, pero **solo una vez cada X minutos** por contacto (para no ser pesado).
- **Horario de atención**: fuera de horario manda un mensaje de "ahora no estoy disponible".
- **Se calla si respondes tú**: cuando escribes a mano en un chat, el bot deja de contestar en ese chat durante un rato.
- **Ignora grupos** y los estados, y puedes excluir contactos concretos.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior.
- Un ordenador o servidor que se quede encendido mientras quieras que el bot funcione.

## Puesta en marcha

```bash
npm install
npm start
```

1. Aparecerá un código QR en la terminal.
2. En tu teléfono: **WhatsApp > Ajustes > Dispositivos vinculados > Vincular un dispositivo** y escanea el QR.
3. Listo: verás `✅ Bot conectado` y empezará a responder.

La sesión se guarda en la carpeta `.wwebjs_auth/`, así que no hará falta escanear el QR cada vez.
**No compartas esa carpeta**: da acceso a tu WhatsApp.

## Personalizar las respuestas

Edita `config.json` y reinicia el bot (`Ctrl+C` y `npm start`):

| Campo | Para qué sirve |
|---|---|
| `reglas` | Lista de `{ "palabras": [...], "respuesta": "..." }`. Da igual que escriban con mayúsculas o sin acentos. Se usa la primera regla que coincida. |
| `respuestaPorDefecto` | Lo que se contesta si no coincide ninguna regla. Déjalo en `""` para no contestar nada. |
| `esperaEntreRespuestasMinutos` | Minutos antes de volver a mandar la respuesta por defecto o la de fuera de horario a la misma persona. También es lo que dura la pausa cuando respondes tú a mano. |
| `horario` | Días (`0`=domingo … `6`=sábado), hora de inicio y fin, y el mensaje para fuera de horario. Pon `"activo": false` para responder siempre igual a cualquier hora. |
| `zonaHoraria` | Tu zona horaria, p. ej. `Europe/Madrid`, `America/Mexico_City`, `America/Bogota`. |
| `ignorarGrupos` | `true` para no contestar en grupos. |
| `contactosExcluidos` | Números a los que nunca se les responde, con el formato `5215512345678@c.us` (código de país + número, sin `+`). |

## Pruebas

```bash
npm test
```

## Aviso importante

whatsapp-web.js **no es una herramienta oficial de WhatsApp**. Usarla con moderación
(responder a quien te escribe, como hace este bot) suele ir bien, pero WhatsApp podría
bloquear números que envíen mensajes masivos o no solicitados. Si lo vas a usar para
un negocio con mucho volumen, lo recomendable es la
[API oficial de WhatsApp Business (Cloud API)](https://developers.facebook.com/docs/whatsapp/cloud-api).
