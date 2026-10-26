# proyectoMonedas

Conversor de monedas pensado para comparar precios de tiendas en línea. Eliges una moneda de origen y una de destino, escribes un monto y ves el resultado con la tasa usada y su fecha.

Proyecto universitario desarrollado con Spec-Driven Development (SDD): la spec manda y vive en el repositorio.

## Qué hace

- Convierte entre todas las monedas disponibles (USD, EUR, BRL, GBP y MXN aparecen primero).
- Muestra el resultado así: `100,00 USD = 92,00 EUR`, la tasa (`1 USD = 0,9200 EUR`) y su fecha (`Tasa del 25/10/2026`).
- Acepta punto o coma decimal, entre 0 y 1.000.000 y hasta 2 decimales.
- Botón para invertir el par de monedas; si ya hay un resultado, vuelve a convertir solo.
- Mensajes claros ante montos inválidos, sin conexión o servicio caído; nunca muestra un número viejo.
- Funciona en computadora y en celular (desde 360 px de ancho). Todo en español.

## Cómo ejecutarlo

Requiere [Node.js](https://nodejs.org) (probado con la versión 24).

```
npx serve .       # desde la raíz del repositorio; abre la dirección que muestre
npm test          # tests, sin necesidad de internet
```

La app necesita internet para obtener las tasas. Para usarla sin instalar nada más también sirve `python -m http.server 8000` y abrir `http://localhost:8000`.

## Datos

Las tasas vienen de la API pública [Frankfurter](https://frankfurter.dev) (sin clave). Hoy no ofrece el boliviano (BOB); si algún día lo agrega, aparecerá solo en la lista.

## Estructura

```
index.html, styles.css     pantalla
src/                       monto, formato, monedas, api, conversor, app
tests/                     tests con respuestas simuladas (sin red)
specs/conversor/           spec.md (qué), plan.md (cómo), tasks.md (tareas)
AGENTS.md                  reglas del proyecto
```

## Cómo se trabaja

Las reglas están en [AGENTS.md](AGENTS.md): la spec es la fuente de verdad, no se escribe código sin una tarea aprobada, un commit por tarea con el formato `T-n: descripción`, tests en verde antes de avanzar y, si algo no cumple, se corrige primero la spec.
