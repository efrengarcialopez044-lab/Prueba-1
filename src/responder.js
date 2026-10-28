// Lógica de decisión: dado un mensaje entrante, decide qué responder (o nada).
// No depende de WhatsApp, así que se puede probar sin conexión.

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contienePalabra(texto, palabra) {
  const p = normalizar(palabra);
  if (!p) return false;
  return ` ${texto} `.includes(` ${p} `);
}

function buscarRegla(reglas, texto) {
  const normalizado = normalizar(texto);
  return (reglas || []).find((regla) =>
    (regla.palabras || []).some((palabra) => contienePalabra(normalizado, palabra))
  );
}

function aMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Devuelve { dia (0=domingo..6=sábado), minutos } en la zona horaria indicada.
function horaLocal(fecha, zonaHoraria) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    dia: dias.indexOf(valor('weekday')),
    minutos: Number(valor('hour')) * 60 + Number(valor('minute')),
  };
}

function dentroDeHorario(horario, fecha, zonaHoraria) {
  if (!horario || !horario.activo) return true;
  const { dia, minutos } = horaLocal(fecha, zonaHoraria);
  if (!horario.dias.includes(dia)) return false;
  return minutos >= aMinutos(horario.inicio) && minutos < aMinutos(horario.fin);
}

class Responder {
  constructor(config) {
    this.config = config;
    this.ultimaRespuesta = new Map(); // contacto -> timestamp ms
    this.pausados = new Map(); // contacto -> timestamp ms hasta el que el bot calla
  }

  esperaMs() {
    return (this.config.esperaEntreRespuestasMinutos || 0) * 60 * 1000;
  }

  // Llamar cuando tú respondes a mano en un chat: el bot se calla ahí un rato.
  pausar(contacto, ahora = Date.now()) {
    this.pausados.set(contacto, ahora + this.esperaMs());
  }

  enEspera(contacto, ahora) {
    const ultima = this.ultimaRespuesta.get(contacto);
    return ultima !== undefined && ahora - ultima < this.esperaMs();
  }

  // mensaje: { de, texto, esGrupo, fecha }
  // Devuelve el texto a responder o null.
  decidir(mensaje) {
    const { config } = this;
    const fecha = mensaje.fecha || new Date();
    const ahora = fecha.getTime();

    if (mensaje.esGrupo && config.ignorarGrupos) return null;
    if ((config.contactosExcluidos || []).includes(mensaje.de)) return null;
    if ((this.pausados.get(mensaje.de) || 0) > ahora) return null;

    let respuesta = null;
    let respetaEspera = true;

    if (!dentroDeHorario(config.horario, fecha, config.zonaHoraria)) {
      respuesta = config.horario.mensajeFueraDeHorario;
    } else {
      const regla = buscarRegla(config.reglas, mensaje.texto);
      if (regla) {
        // Si preguntan algo concreto, siempre contestamos.
        respuesta = regla.respuesta;
        respetaEspera = false;
      } else {
        respuesta = config.respuestaPorDefecto;
      }
    }

    if (!respuesta) return null;
    if (respetaEspera && this.enEspera(mensaje.de, ahora)) return null;

    this.ultimaRespuesta.set(mensaje.de, ahora);
    return respuesta;
  }
}

module.exports = { Responder, normalizar, buscarRegla, dentroDeHorario };
