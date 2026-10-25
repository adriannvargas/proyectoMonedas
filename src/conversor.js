import { validarMonto } from './monto.js';
import { formatearConversion, formatearTasa, formatearFecha } from './formato.js';
import { prepararMonedas } from './monedas.js';
import { ErrorConexion, ErrorPar } from './api.js';

export const MENSAJES = {
  monedasIguales: 'Elige dos monedas distintas.',
  par: 'Esta combinación de monedas no está disponible.',
  conexion: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
  servicio: 'El servicio de tasas no está disponible en este momento. Inténtalo más tarde.',
};

function mensajeDeError(error) {
  if (error instanceof ErrorConexion) return MENSAJES.conexion;
  if (error instanceof ErrorPar) return MENSAJES.par;
  return MENSAJES.servicio;
}

export function crearConversor({ api, alCambiar = () => {} }) {
  const e = {
    monedas: [],
    cargado: false,
    cargando: false,
    monto: '',
    origen: null,
    destino: null,
    resultado: null,
    mensaje: null,
    convirtiendo: false,
    puedeReintentar: false,
  };
  let version = 0;

  const estado = () => ({ ...e, monedas: [...e.monedas] });
  const avisar = () => alCambiar(estado());

  function invalidar() {
    version++;
    e.resultado = null;
    e.mensaje = null;
    e.convirtiendo = false;
  }

  async function iniciar() {
    if (e.cargando) return;
    e.cargando = true;
    e.mensaje = null;
    e.puedeReintentar = false;
    avisar();
    try {
      const disponibles = await api.obtenerMonedas();
      e.monedas = prepararMonedas(disponibles);
      const codigos = e.monedas.map((m) => m.codigo);
      e.origen = codigos.includes('USD') ? 'USD' : codigos[0];
      e.destino = codigos.includes('EUR') ? 'EUR' : codigos.find((c) => c !== e.origen);
      e.cargado = true;
    } catch (error) {
      e.cargado = false;
      e.monedas = [];
      e.mensaje = mensajeDeError(error);
      e.puedeReintentar = true;
    } finally {
      e.cargando = false;
    }
    avisar();
  }

  function cambiarMonto(texto) {
    e.monto = texto;
    invalidar();
    avisar();
  }

  function cambiarOrigen(codigo) {
    e.origen = codigo;
    invalidar();
    avisar();
  }

  function cambiarDestino(codigo) {
    e.destino = codigo;
    invalidar();
    avisar();
  }

  async function convertir() {
    if (!e.cargado || e.convirtiendo) return;
    e.resultado = null;
    e.mensaje = null;

    const monto = validarMonto(e.monto);
    if (!monto.ok) {
      e.mensaje = monto.mensaje;
      return avisar();
    }
    if (e.origen === e.destino) {
      e.mensaje = MENSAJES.monedasIguales;
      return avisar();
    }

    const miVersion = ++version;
    const { origen, destino } = e;
    e.convirtiendo = true;
    avisar();
    try {
      const { tasa, fecha } = await api.obtenerTasa(origen, destino);
      if (miVersion !== version) return;
      e.resultado = {
        conversion: formatearConversion(monto.valor, origen, monto.valor * tasa, destino),
        tasa: formatearTasa(origen, tasa, destino),
        fecha: formatearFecha(fecha),
      };
    } catch (error) {
      if (miVersion !== version) return;
      e.mensaje = mensajeDeError(error);
    }
    e.convirtiendo = false;
    avisar();
  }

  async function invertir() {
    if (!e.cargado) return;
    const habiaResultado = e.resultado !== null;
    [e.origen, e.destino] = [e.destino, e.origen];
    invalidar();
    avisar();
    if (habiaResultado) await convertir();
  }

  return { estado, iniciar, cambiarMonto, cambiarOrigen, cambiarDestino, convertir, invertir };
}
