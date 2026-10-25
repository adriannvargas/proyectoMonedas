import { crearApi } from './api.js';
import { crearConversor } from './conversor.js';

const $ = (id) => document.getElementById(id);
const monto = $('monto');
const origen = $('origen');
const destino = $('destino');
const invertir = $('invertir');
const convertir = $('convertir');
const reintentar = $('reintentar');

let listaLlena = false;

function llenarLista(select, monedas) {
  select.replaceChildren(
    ...monedas.map(({ codigo, etiqueta }) => {
      const opcion = document.createElement('option');
      opcion.value = codigo;
      opcion.textContent = etiqueta;
      return opcion;
    }),
  );
}

function mostrar(e) {
  if (e.cargado && !listaLlena) {
    llenarLista(origen, e.monedas);
    llenarLista(destino, e.monedas);
    listaLlena = true;
  } else if (!e.cargado) {
    listaLlena = false;
    for (const select of [origen, destino]) {
      const opcion = document.createElement('option');
      opcion.textContent = e.cargando ? 'Cargando...' : 'No disponible';
      select.replaceChildren(opcion);
    }
  }
  if (e.cargado) {
    origen.value = e.origen;
    destino.value = e.destino;
  }

  origen.disabled = destino.disabled = !e.cargado;
  invertir.disabled = !e.cargado;
  convertir.disabled = !e.cargado || e.convirtiendo;
  convertir.textContent = e.convirtiendo ? 'Convirtiendo...' : 'Convertir';

  $('estado').textContent = e.convirtiendo ? 'Convirtiendo...' : '';
  $('mensaje').textContent = e.mensaje ?? '';
  reintentar.hidden = !e.puedeReintentar;

  const resultado = $('resultado');
  resultado.hidden = !e.resultado;
  if (e.resultado) {
    $('conversion').textContent = e.resultado.conversion;
    $('tasa').textContent = e.resultado.tasa;
    $('fecha').textContent = e.resultado.fecha;
  }
}

const conversor = crearConversor({ api: crearApi(), alCambiar: mostrar });

monto.addEventListener('input', () => conversor.cambiarMonto(monto.value));
origen.addEventListener('change', () => conversor.cambiarOrigen(origen.value));
destino.addEventListener('change', () => conversor.cambiarDestino(destino.value));
invertir.addEventListener('click', () => conversor.invertir());
reintentar.addEventListener('click', () => conversor.iniciar());
$('formulario').addEventListener('submit', (evento) => {
  evento.preventDefault();
  conversor.convertir();
});

monto.focus();
conversor.iniciar();
