const BASE = 'https://api.frankfurter.dev/v1';
const TIEMPO_MAXIMO = 10000;

export class ErrorConexion extends Error {}
export class ErrorServicio extends Error {}
export class ErrorPar extends Error {}

export function crearApi({ fetch: fetchFn = globalThis.fetch, base = BASE, tiempoMaximo = TIEMPO_MAXIMO } = {}) {
  async function pedir(ruta, { estadosPar = [] } = {}) {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), tiempoMaximo);
    try {
      let respuesta;
      try {
        respuesta = await fetchFn(`${base}${ruta}`, { signal: control.signal });
      } catch {
        throw new ErrorConexion('Sin conexión o tiempo agotado');
      }
      if (estadosPar.includes(respuesta.status)) throw new ErrorPar('Par no disponible');
      if (!respuesta.ok) throw new ErrorServicio(`Respuesta ${respuesta.status}`);
      try {
        return await respuesta.json();
      } catch {
        if (control.signal.aborted) throw new ErrorConexion('Tiempo agotado');
        throw new ErrorServicio('Respuesta no válida');
      }
    } finally {
      clearTimeout(temporizador);
    }
  }

  return {
    tiempoMaximo,

    async obtenerMonedas() {
      const datos = await pedir('/currencies');
      if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        throw new ErrorServicio('Lista de monedas no válida');
      }
      return datos;
    },

    async obtenerTasa(origen, destino) {
      const datos = await pedir(`/latest?base=${origen}&symbols=${destino}`, { estadosPar: [404, 422] });
      const tasa = datos?.rates?.[destino];
      if (typeof datos?.date !== 'string' || typeof tasa !== 'number' || !(tasa > 0)) {
        throw new ErrorServicio('Tasa no válida');
      }
      return { tasa, fecha: datos.date };
    },
  };
}
