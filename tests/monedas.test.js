import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararMonedas, etiquetaMoneda } from '../src/monedas.js';

const disponibles = {
  MXN: 'Mexican Peso', AUD: 'Australian Dollar', GBP: 'British Pound', USD: 'United States Dollar',
  BRL: 'Brazilian Real', EUR: 'Euro', CAD: 'Canadian Dollar', JPY: 'Japanese Yen',
};

test('CA-1: ofrece todas las monedas disponibles', () => {
  const codigos = prepararMonedas(disponibles).map((m) => m.codigo);
  assert.equal(codigos.length, Object.keys(disponibles).length);
  for (const c of ['USD', 'EUR', 'BRL', 'GBP', 'MXN']) assert.ok(codigos.includes(c), c);
});

test('CA-3: USD, EUR, BRL, GBP y MXN primero, el resto alfabético por código', () => {
  const codigos = prepararMonedas(disponibles).map((m) => m.codigo);
  assert.deepEqual(codigos, ['USD', 'EUR', 'BRL', 'GBP', 'MXN', 'AUD', 'CAD', 'JPY']);
});

test('CA-3: si falta una moneda prioritaria no se inventa', () => {
  const codigos = prepararMonedas({ GBP: 'British Pound', ZAR: 'South African Rand', EUR: 'Euro' }).map((m) => m.codigo);
  assert.deepEqual(codigos, ['EUR', 'GBP', 'ZAR']);
});

test('CA-2: etiqueta con código y nombre en español "EUR – Euro"', () => {
  const euro = prepararMonedas(disponibles).find((m) => m.codigo === 'EUR');
  assert.equal(euro.etiqueta, 'EUR – Euro');
  assert.equal(etiquetaMoneda('MXN', 'Mexican Peso'), 'MXN – Peso mexicano');
});

test('CA-2: sin nombre en español usa el nombre recibido', () => {
  assert.equal(etiquetaMoneda('QQQ', 'Moneda rara'), 'QQQ – Moneda rara');
});
