import test from 'node:test';
import assert from 'node:assert/strict';
import { crearApi, ErrorConexion, ErrorServicio, ErrorPar } from '../src/api.js';

function respuesta(estado, cuerpo) {
  return {
    ok: estado >= 200 && estado < 300,
    status: estado,
    json: async () => {
      if (cuerpo instanceof Error) throw cuerpo;
      return cuerpo;
    },
  };
}

function apiCon(fetchFalso, tiempoMaximo = 50) {
  return crearApi({ fetch: fetchFalso, tiempoMaximo });
}

test('obtenerMonedas devuelve el objeto código → nombre', async () => {
  const urls = [];
  const api = apiCon(async (url) => {
    urls.push(url);
    return respuesta(200, { USD: 'United States Dollar', EUR: 'Euro' });
  });
  assert.deepEqual(await api.obtenerMonedas(), { USD: 'United States Dollar', EUR: 'Euro' });
  assert.equal(urls[0], 'https://api.frankfurter.dev/v1/currencies');
});

test('obtenerTasa devuelve tasa y la fecha real de la respuesta (CA-19)', async () => {
  const urls = [];
  const api = apiCon(async (url) => {
    urls.push(url);
    return respuesta(200, { amount: 1, base: 'USD', date: '2026-10-23', rates: { EUR: 0.89342 } });
  });
  assert.deepEqual(await api.obtenerTasa('USD', 'EUR'), { tasa: 0.89342, fecha: '2026-10-23' });
  assert.equal(urls[0], 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR');
});

test('CA-30: fetch que rechaza → ErrorConexion', async () => {
  const api = apiCon(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(api.obtenerTasa('USD', 'EUR'), ErrorConexion);
  await assert.rejects(api.obtenerMonedas(), ErrorConexion);
});

test('CA-30: sin respuesta dentro del tiempo máximo → ErrorConexion', async () => {
  const colgado = (url, { signal }) => new Promise((_, rechazar) => {
    signal.addEventListener('abort', () => rechazar(new DOMException('Abortado', 'AbortError')));
  });
  const api = apiCon(colgado, 20);
  const inicio = Date.now();
  await assert.rejects(api.obtenerTasa('USD', 'EUR'), ErrorConexion);
  assert.ok(Date.now() - inicio < 1000);
});

test('tiempo máximo por defecto es de 10 segundos (CA-30)', () => {
  assert.equal(crearApi({ fetch: async () => {} }).tiempoMaximo, 10000);
});

test('CA-31: 500, 503 y respuestas no esperadas → ErrorServicio', async () => {
  for (const estado of [500, 503, 429]) {
    const api = apiCon(async () => respuesta(estado, { message: 'x' }));
    await assert.rejects(api.obtenerTasa('USD', 'EUR'), ErrorServicio, String(estado));
    await assert.rejects(api.obtenerMonedas(), ErrorServicio, String(estado));
  }
});

test('CA-31: JSON inválido o sin los campos esperados → ErrorServicio', async () => {
  const rotas = [
    respuesta(200, new SyntaxError('Unexpected token <')),
    respuesta(200, {}),
    respuesta(200, { date: '2026-10-23', rates: {} }),
    respuesta(200, { date: '2026-10-23', rates: { EUR: 'abc' } }),
    respuesta(200, { rates: { EUR: 0.9 } }),
  ];
  for (const r of rotas) {
    await assert.rejects(apiCon(async () => r).obtenerTasa('USD', 'EUR'), ErrorServicio);
  }
  await assert.rejects(apiCon(async () => respuesta(200, null)).obtenerMonedas(), ErrorServicio);
  await assert.rejects(apiCon(async () => respuesta(200, [])).obtenerMonedas(), ErrorServicio);
});

test('CA-23: 404 o 422 al pedir un par → ErrorPar', async () => {
  for (const estado of [404, 422]) {
    const api = apiCon(async () => respuesta(estado, { message: 'not found' }));
    await assert.rejects(api.obtenerTasa('USD', 'ZZZ'), ErrorPar, String(estado));
  }
});

test('404 en la lista de monedas se trata como falla del servicio', async () => {
  const api = apiCon(async () => respuesta(404, { message: 'not found' }));
  await assert.rejects(api.obtenerMonedas(), ErrorServicio);
});
