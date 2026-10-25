export const PRIORITARIAS = ['USD', 'EUR', 'BRL', 'GBP', 'MXN'];

const nombresEs = new Intl.DisplayNames(['es'], { type: 'currency' });

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function etiquetaMoneda(codigo, nombreRespaldo) {
  let nombre;
  try {
    nombre = nombresEs.of(codigo);
  } catch {
    nombre = undefined;
  }
  if (!nombre || nombre === codigo) nombre = nombreRespaldo;
  return `${codigo} – ${capitalizar(nombre)}`;
}

export function prepararMonedas(disponibles) {
  const codigos = Object.keys(disponibles);
  const primeras = PRIORITARIAS.filter((c) => codigos.includes(c));
  const resto = codigos.filter((c) => !PRIORITARIAS.includes(c)).sort();
  return [...primeras, ...resto].map((codigo) => ({
    codigo,
    etiqueta: etiquetaMoneda(codigo, disponibles[codigo]),
  }));
}
