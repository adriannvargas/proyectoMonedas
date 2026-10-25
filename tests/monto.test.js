import test from 'node:test';
import assert from 'node:assert/strict';
import { validarMonto, MENSAJES_MONTO } from '../src/monto.js';

test('CA-6: acepta punto y coma con el mismo significado', () => {
  assert.deepEqual(validarMonto('19.99'), { ok: true, valor: 19.99 });
  assert.deepEqual(validarMonto('19,99'), { ok: true, valor: 19.99 });
});

test('CA-7: acepta enteros, el límite máximo y espacios alrededor', () => {
  assert.deepEqual(validarMonto('1000000'), { ok: true, valor: 1000000 });
  assert.deepEqual(validarMonto('1000000,00'), { ok: true, valor: 1000000 });
  assert.deepEqual(validarMonto('0,01'), { ok: true, valor: 0.01 });
  assert.deepEqual(validarMonto('  50 '), { ok: true, valor: 50 });
});

test('CA-8: rechaza cero, negativos y texto', () => {
  for (const t of ['0', '0,00', '-5', 'abc', '12abc', '1,000.50', '1.2.3', '--1', '+5']) {
    assert.deepEqual(validarMonto(t), { ok: false, mensaje: MENSAJES_MONTO.invalido }, t);
  }
  assert.equal(MENSAJES_MONTO.invalido, 'Ingresa un monto válido mayor a 0.');
});

test('CA-9: rechaza más de 2 decimales', () => {
  assert.deepEqual(validarMonto('1,234'), { ok: false, mensaje: 'Usa como máximo 2 decimales.' });
  assert.deepEqual(validarMonto('5.999'), { ok: false, mensaje: MENSAJES_MONTO.decimales });
});

test('CA-10: rechaza montos mayores a 1.000.000', () => {
  assert.deepEqual(validarMonto('1000001'), { ok: false, mensaje: 'El monto máximo es 1.000.000.' });
  assert.deepEqual(validarMonto('1000000,01'), { ok: false, mensaje: MENSAJES_MONTO.maximo });
});

test('CA-12: campo vacío es inválido al intentar convertir', () => {
  assert.deepEqual(validarMonto(''), { ok: false, mensaje: MENSAJES_MONTO.invalido });
  assert.deepEqual(validarMonto('   '), { ok: false, mensaje: MENSAJES_MONTO.invalido });
});

test('CA-13: el punto es decimal, nunca separador de miles', () => {
  assert.deepEqual(validarMonto('1.000'), { ok: false, mensaje: MENSAJES_MONTO.decimales });
  assert.deepEqual(validarMonto('1.5'), { ok: true, valor: 1.5 });
});
