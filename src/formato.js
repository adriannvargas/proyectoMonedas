export function formatearNumero(valor, decimales) {
  const [entero, fraccion] = valor.toFixed(decimales).split('.');
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return fraccion ? `${miles},${fraccion}` : miles;
}

export function formatearMonto(valor, codigo) {
  return `${formatearNumero(valor, 2)} ${codigo}`;
}

export function formatearConversion(monto, origen, convertido, destino) {
  return `${formatearMonto(monto, origen)} = ${formatearMonto(convertido, destino)}`;
}

export function formatearTasa(origen, tasa, destino) {
  return `1 ${origen} = ${formatearNumero(tasa, 4)} ${destino}`;
}

export function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split('-');
  return `Tasa del ${dia}/${mes}/${anio}`;
}
