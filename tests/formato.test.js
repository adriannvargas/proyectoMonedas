import test from 'node:test';
import assert from 'node:assert/strict';
import { formatearNumero, formatearConversion, formatearTasa, formatearFecha } from '../src/formato.js';

test('CA-20: coma decimal y punto como separador de miles', () => {
  assert.equal(formatearNumero(1000000, 2), '1.000.000,00');
  assert.equal(formatearNumero(92, 2), '92,00');
  assert.equal(formatearNumero(1234.5, 2), '1.234,50');
  assert.equal(formatearNumero(999.999, 2), '1.000,00');
  assert.equal(formatearNumero(0.5, 4), '0,5000');
});

test('CA-16: conversión completa con códigos y 2 decimales', () => {
  assert.equal(formatearConversion(100, 'USD', 92, 'EUR'), '100,00 USD = 92,00 EUR');
  assert.equal(formatearConversion(1000000, 'USD', 892345.678, 'EUR'), '1.000.000,00 USD = 892.345,68 EUR');
  assert.equal(formatearConversion(19.99, 'EUR', 22.4, 'USD'), '19,99 EUR = 22,40 USD');
});

test('CA-17: tasa directa con 4 decimales', () => {
  assert.equal(formatearTasa('USD', 0.92, 'EUR'), '1 USD = 0,9200 EUR');
  assert.equal(formatearTasa('USD', 0.89342, 'EUR'), '1 USD = 0,8934 EUR');
  assert.equal(formatearTasa('EUR', 1234.56789, 'IDR'), '1 EUR = 1.234,5679 IDR');
});

test('CA-18: fecha de la tasa día/mes/año, sin depender de la zona horaria', () => {
  assert.equal(formatearFecha('2026-10-25'), 'Tasa del 25/10/2026');
  assert.equal(formatearFecha('2026-01-02'), 'Tasa del 02/01/2026');
});
