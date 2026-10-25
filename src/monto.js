export const MAXIMO = 1000000;

export const MENSAJES_MONTO = {
  invalido: 'Ingresa un monto válido mayor a 0.',
  decimales: 'Usa como máximo 2 decimales.',
  maximo: 'El monto máximo es 1.000.000.',
};

const FORMATO = /^\d+(?:[.,]\d+)?$/;

export function validarMonto(texto) {
  const limpio = String(texto ?? '').trim();
  if (!FORMATO.test(limpio)) return { ok: false, mensaje: MENSAJES_MONTO.invalido };

  const [, decimales = ''] = limpio.split(/[.,]/);
  if (decimales.length > 2) return { ok: false, mensaje: MENSAJES_MONTO.decimales };

  const valor = Number(limpio.replace(',', '.'));
  if (valor <= 0) return { ok: false, mensaje: MENSAJES_MONTO.invalido };
  if (valor > MAXIMO) return { ok: false, mensaje: MENSAJES_MONTO.maximo };

  return { ok: true, valor };
}
