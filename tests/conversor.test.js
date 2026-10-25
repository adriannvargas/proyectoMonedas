import test from 'node:test';
import assert from 'node:assert/strict';
import { crearConversor, MENSAJES } from '../src/conversor.js';
import { ErrorConexion, ErrorServicio, ErrorPar } from '../src/api.js';

const MONEDAS = {
  USD: 'United States Dollar', EUR: 'Euro', BRL: 'Brazilian Real', GBP: 'British Pound', MXN: 'Mexican Peso',
};

const TASAS = {
  USDEUR: { tasa: 0.92, fecha: '2026-10-23' },
  EURUSD: { tasa: 1.0870, fecha: '2026-10-23' },
};

function crearApiFalsa({ monedas = MONEDAS, tasas = TASAS, falla } = {}) {
  const api = {
    llamadas: [],
    async obtenerMonedas() {
      if (falla?.monedas) throw falla.monedas;
      return monedas;
    },
    obtenerTasa(origen, destino) {
      api.llamadas.push([origen, destino]);
      if (falla?.tasa) return Promise.reject(falla.tasa);
      return Promise.resolve({ ...tasas[`${origen}${destino}`] });
    },
  };
  return api;
}

async function listo(opciones) {
  const api = crearApiFalsa(opciones);
  const c = crearConversor({ api });
  await c.iniciar();
  return { c, api };
}

test('CA-5: al abrir selecciona USD de origen y EUR de destino', async () => {
  const { c } = await listo();
  const e = c.estado();
  assert.equal(e.origen, 'USD');
  assert.equal(e.destino, 'EUR');
  assert.equal(e.cargado, true);
  assert.equal(e.monedas.length, 5);
  assert.equal(e.monedas[0].etiqueta, 'USD – Dólar estadounidense');
});

test('CA-11: al abrir no hay mensajes ni resultado', async () => {
  const { c } = await listo();
  assert.equal(c.estado().mensaje, null);
  assert.equal(c.estado().resultado, null);
});

test('CA-15/16/17/18/20: convertir muestra conversión, tasa y fecha', async () => {
  const { c, api } = await listo();
  c.cambiarMonto('100');
  await c.convertir();
  assert.deepEqual(api.llamadas, [['USD', 'EUR']]);
  assert.deepEqual(c.estado().resultado, {
    conversion: '100,00 USD = 92,00 EUR',
    tasa: '1 USD = 0,9200 EUR',
    fecha: 'Tasa del 23/10/2026',
  });
  assert.equal(c.estado().mensaje, null);
});

test('CA-8/9/10/12: monto inválido muestra su mensaje y no llama a la red', async () => {
  const { c, api } = await listo();
  for (const [texto, mensaje] of [
    ['', 'Ingresa un monto válido mayor a 0.'],
    ['abc', 'Ingresa un monto válido mayor a 0.'],
    ['-3', 'Ingresa un monto válido mayor a 0.'],
    ['1,234', 'Usa como máximo 2 decimales.'],
    ['2000000', 'El monto máximo es 1.000.000.'],
  ]) {
    c.cambiarMonto(texto);
    await c.convertir();
    assert.equal(c.estado().mensaje, mensaje, texto);
    assert.equal(c.estado().resultado, null);
  }
  assert.equal(api.llamadas.length, 0);
});

test('CA-22: monedas iguales avisan y no convierten', async () => {
  const { c, api } = await listo();
  c.cambiarDestino('USD');
  c.cambiarMonto('10');
  await c.convertir();
  assert.equal(c.estado().mensaje, 'Elige dos monedas distintas.');
  assert.equal(api.llamadas.length, 0);
});

test('CA-14: monto inválido con monedas iguales muestra solo el mensaje del monto', async () => {
  const { c } = await listo();
  c.cambiarDestino('USD');
  c.cambiarMonto('abc');
  await c.convertir();
  assert.equal(c.estado().mensaje, 'Ingresa un monto válido mayor a 0.');
});

test('CA-23: par sin tasa muestra el mensaje y ningún resultado', async () => {
  const { c } = await listo({ falla: { tasa: new ErrorPar() } });
  c.cambiarMonto('10');
  await c.convertir();
  assert.equal(c.estado().mensaje, 'Esta combinación de monedas no está disponible.');
  assert.equal(c.estado().resultado, null);
});

test('CA-30/31/32: errores de conexión y servicio no dejan resultado, ni el anterior', async () => {
  for (const [error, mensaje] of [
    [new ErrorConexion(), 'No hay conexión. Revisa tu internet e inténtalo de nuevo.'],
    [new ErrorServicio(), 'El servicio de tasas no está disponible en este momento. Inténtalo más tarde.'],
  ]) {
    const { c, api } = await listo();
    c.cambiarMonto('100');
    await c.convertir();
    assert.ok(c.estado().resultado);
    api.obtenerTasa = () => Promise.reject(error);
    await c.convertir();
    assert.equal(c.estado().mensaje, mensaje);
    assert.equal(c.estado().resultado, null);
    assert.equal(c.estado().convirtiendo, false);
  }
});

test('CA-29: mientras convierte está "convirtiendo" y no inicia otra conversión', async () => {
  const { c, api } = await listo();
  let resolver;
  api.obtenerTasa = (o, d) => {
    api.llamadas.push([o, d]);
    return new Promise((r) => { resolver = r; });
  };
  c.cambiarMonto('100');
  const p = c.convertir();
  assert.equal(c.estado().convirtiendo, true);
  c.convertir();
  assert.equal(api.llamadas.length, 1);
  resolver({ tasa: 0.92, fecha: '2026-10-23' });
  await p;
  assert.equal(c.estado().convirtiendo, false);
  assert.ok(c.estado().resultado);
});

test('CA-24: cambiar monto o cualquier moneda borra resultado y mensaje', async () => {
  for (const cambiar of [
    (c) => c.cambiarMonto('200'),
    (c) => c.cambiarOrigen('GBP'),
    (c) => c.cambiarDestino('BRL'),
  ]) {
    const { c } = await listo();
    c.cambiarMonto('100');
    await c.convertir();
    assert.ok(c.estado().resultado);
    cambiar(c);
    assert.equal(c.estado().resultado, null);
    assert.equal(c.estado().mensaje, null);
  }
  const { c } = await listo();
  c.cambiarMonto('abc');
  await c.convertir();
  assert.ok(c.estado().mensaje);
  c.cambiarMonto('1');
  assert.equal(c.estado().mensaje, null);
});

test('CA-25: una respuesta que llega tras cambiar un campo se descarta', async () => {
  const { c, api } = await listo();
  let resolver;
  api.obtenerTasa = () => new Promise((r) => { resolver = r; });
  c.cambiarMonto('100');
  const p = c.convertir();
  c.cambiarMonto('200');
  assert.equal(c.estado().convirtiendo, false);
  resolver({ tasa: 0.92, fecha: '2026-10-23' });
  await p;
  assert.equal(c.estado().resultado, null);
});

test('CA-26/27: invertir con resultado intercambia y convierte solo', async () => {
  const { c, api } = await listo();
  c.cambiarMonto('100');
  await c.convertir();
  await c.invertir();
  assert.equal(c.estado().origen, 'EUR');
  assert.equal(c.estado().destino, 'USD');
  assert.deepEqual(api.llamadas, [['USD', 'EUR'], ['EUR', 'USD']]);
  assert.equal(c.estado().resultado.conversion, '100,00 EUR = 108,70 USD');
  assert.equal(c.estado().resultado.tasa, '1 EUR = 1,0870 USD');
});

test('CA-28: invertir sin resultado solo intercambia, sin red ni errores', async () => {
  const { c, api } = await listo();
  await c.invertir();
  assert.equal(c.estado().origen, 'EUR');
  assert.equal(c.estado().destino, 'USD');
  assert.equal(api.llamadas.length, 0);
  assert.equal(c.estado().mensaje, null);
  c.cambiarMonto('abc');
  await c.invertir();
  assert.equal(api.llamadas.length, 0);
  assert.equal(c.estado().mensaje, null);
});

test('CA-33/34: sin lista de monedas muestra el error y permite reintentar, sin lista de respaldo', async () => {
  const api = crearApiFalsa({ falla: { monedas: new ErrorConexion() } });
  const c = crearConversor({ api });
  await c.iniciar();
  let e = c.estado();
  assert.equal(e.cargado, false);
  assert.equal(e.monedas.length, 0);
  assert.equal(e.mensaje, MENSAJES.conexion);
  assert.equal(e.puedeReintentar, true);
  c.cambiarMonto('10');
  await c.convertir();
  assert.equal(api.llamadas.length, 0);

  api.obtenerMonedas = async () => MONEDAS;
  await c.iniciar();
  e = c.estado();
  assert.equal(e.cargado, true);
  assert.equal(e.mensaje, null);
  assert.equal(e.puedeReintentar, false);
  assert.equal(e.origen, 'USD');
});

test('CA-33: error de servicio al cargar la lista usa el mensaje de servicio', async () => {
  const c = crearConversor({ api: crearApiFalsa({ falla: { monedas: new ErrorServicio() } }) });
  await c.iniciar();
  assert.equal(c.estado().mensaje, MENSAJES.servicio);
});

test('notifica cada cambio de estado a la interfaz', async () => {
  let avisos = 0;
  const c = crearConversor({ api: crearApiFalsa(), alCambiar: () => { avisos++; } });
  await c.iniciar();
  const antes = avisos;
  c.cambiarMonto('5');
  assert.ok(avisos > antes);
});
