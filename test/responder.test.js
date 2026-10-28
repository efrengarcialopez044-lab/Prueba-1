const test = require('node:test');
const assert = require('node:assert');
const { Responder, normalizar } = require('../src/responder');

const base = {
  ignorarGrupos: true,
  esperaEntreRespuestasMinutos: 60,
  zonaHoraria: 'UTC',
  horario: {
    activo: true,
    dias: [1, 2, 3, 4, 5],
    inicio: '09:00',
    fin: '18:00',
    mensajeFueraDeHorario: 'FUERA',
  },
  reglas: [
    { palabras: ['precio', 'cuánto cuesta'], respuesta: 'PRECIO' },
    { palabras: ['hola'], respuesta: 'HOLA' },
  ],
  respuestaPorDefecto: 'DEFECTO',
  contactosExcluidos: ['excluido@c.us'],
};

// Miércoles 28/10/2026 a las 10:00 UTC
const enHorario = new Date('2026-10-28T10:00:00Z');
const masTarde = (min) => new Date(enHorario.getTime() + min * 60 * 1000);

test('normaliza acentos, mayúsculas y signos', () => {
  assert.strictEqual(normalizar('¿Cuánto CUESTA?'), 'cuanto cuesta');
});

test('responde según palabra clave', () => {
  const r = new Responder(base);
  assert.strictEqual(r.decidir({ de: 'a', texto: '¿Cuanto cuesta?', fecha: enHorario }), 'PRECIO');
  assert.strictEqual(r.decidir({ de: 'b', texto: 'Hola!!', fecha: enHorario }), 'HOLA');
});

test('no confunde palabras parciales', () => {
  const r = new Responder(base);
  assert.strictEqual(r.decidir({ de: 'a', texto: 'holanda', fecha: enHorario }), 'DEFECTO');
});

test('respuesta por defecto solo una vez por periodo de espera', () => {
  const r = new Responder(base);
  assert.strictEqual(r.decidir({ de: 'a', texto: 'algo', fecha: enHorario }), 'DEFECTO');
  assert.strictEqual(r.decidir({ de: 'a', texto: 'otra cosa', fecha: masTarde(5) }), null);
  assert.strictEqual(r.decidir({ de: 'a', texto: 'otra cosa', fecha: masTarde(61) }), 'DEFECTO');
});

test('palabras clave se responden aunque esté en espera', () => {
  const r = new Responder(base);
  r.decidir({ de: 'a', texto: 'algo', fecha: enHorario });
  assert.strictEqual(r.decidir({ de: 'a', texto: 'precio', fecha: masTarde(1) }), 'PRECIO');
});

test('fuera de horario envía mensaje de fuera de horario', () => {
  const r = new Responder(base);
  const noche = new Date('2026-10-28T22:00:00Z');
  const sabado = new Date('2026-10-31T10:00:00Z');
  assert.strictEqual(r.decidir({ de: 'a', texto: 'precio', fecha: noche }), 'FUERA');
  assert.strictEqual(r.decidir({ de: 'b', texto: 'hola', fecha: sabado }), 'FUERA');
});

test('ignora grupos y contactos excluidos', () => {
  const r = new Responder(base);
  assert.strictEqual(r.decidir({ de: 'g', texto: 'hola', esGrupo: true, fecha: enHorario }), null);
  assert.strictEqual(r.decidir({ de: 'excluido@c.us', texto: 'hola', fecha: enHorario }), null);
});

test('se calla en un chat donde respondiste a mano', () => {
  const r = new Responder(base);
  r.pausar('a', enHorario.getTime());
  assert.strictEqual(r.decidir({ de: 'a', texto: 'hola', fecha: masTarde(10) }), null);
  assert.strictEqual(r.decidir({ de: 'a', texto: 'hola', fecha: masTarde(61) }), 'HOLA');
});
