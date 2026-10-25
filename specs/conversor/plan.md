# Plan: Conversor de monedas

Estado: aprobado por el usuario (Fase 2). Cubre el CÓMO de `spec.md`.

## 1. Stack (opción simple elegida)

- **HTML + CSS + JavaScript puro** (módulos ES), sin framework ni paso de compilación. Es una sola pantalla; un framework solo sumaría complejidad.
- **Tests:** ejecutor integrado de Node (`node --test`, módulo `node:test`), sin dependencias. La lógica (validación, formato, cliente de datos) vive en módulos puros que se prueban sin navegador.
- **Pruebas de la interfaz:** con un DOM simulado mínimo escrito a mano en los tests solo si hace falta; la lógica del controlador se separa de `document` para poder probarla sin DOM.
- Los módulos ES no cargan por `file://`, así que la app se sirve con un servidor estático levantado **desde la raíz del repositorio** (la carpeta que contiene `index.html`). Así la dirección raíz muestra directamente el conversor (CA-39).

### Cómo ejecutar

```
npm test                 # tests, sin red
npx serve .              # desde la raíz del repo; abrir la dirección que muestre (p. ej. http://localhost:3000)
```

Alternativa sin instalar nada: `python -m http.server 8000` desde la raíz y abrir `http://localhost:8000`.

La raíz del repositorio es la carpeta con `.git`, `index.html` y `package.json`. No debe existir una carpeta `proyectoMonedas/` anidada dentro: si el servidor se levanta un nivel más arriba, aparece un listado de carpetas en vez del conversor.

## 2. Estructura de carpetas

```
proyectoMonedas/
├── AGENTS.md
├── package.json            # scripts: "test": "node --test"
├── index.html
├── styles.css
├── src/
│   ├── monto.js            # parseo y validación del monto (CA-6..CA-14)
│   ├── formato.js          # formato de números, tasa y fecha (CA-16..CA-18, CA-20)
│   ├── monedas.js          # nombres en español y orden de la lista (CA-1..CA-3)
│   ├── api.js              # cliente de datos: lista de monedas y tasa
│   ├── conversor.js        # lógica de estado: convertir, invertir, limpiar (CA-15..CA-34)
│   └── app.js              # conexión con el DOM
├── tests/
│   ├── monto.test.js
│   ├── formato.test.js
│   ├── monedas.test.js
│   ├── api.test.js
│   └── conversor.test.js
└── specs/conversor/{spec,plan,tasks}.md
```

## 3. Uso de Frankfurter (sin clave)

Base: `https://api.frankfurter.dev/v1`

| Necesidad | Petición | Respuesta usada |
|-----------|----------|-----------------|
| Lista de monedas | `GET /currencies` | objeto `{ "USD": "United States Dollar", ... }` |
| Tasa más reciente | `GET /latest?base=USD&symbols=EUR` | `{ "amount": 1, "base": "USD", "date": "2026-10-23", "rates": { "EUR": 0.89342 } }` |

- La tasa y su fecha (`date`) se toman tal cual de la respuesta. Si no hay tasa del día (fin de semana, feriado) el servicio devuelve la más reciente con su fecha real, lo que cumple CA-19. El código nunca sustituye la fecha por la de hoy.
- El monto convertido se calcula en el cliente: `monto × tasa`, redondeado a 2 decimales.
- Los nombres vienen en inglés; se muestran en español con `Intl.DisplayNames(['es'], { type: 'currency' })`, con el nombre de la API como respaldo (CA-2).
- **PA-1 (BOB):** verificado, el servicio NO ofrece BOB hoy. Como la lista sale de `/currencies`, aparecerá sola si algún día se agrega. La spec no cambia.
- Un par sin tasa responde 404 `{"message":"not found"}` (por ejemplo moneda desconocida).

## 4. Manejo de errores

`api.js` lanza errores tipados; `conversor.js` los traduce al mensaje de la spec.

| Situación | Error | Mensaje (spec) |
|-----------|-------|----------------|
| `fetch` rechaza (sin red) o pasan 10 s (`AbortController`) | `ErrorConexion` | CA-30 |
| Respuesta 5xx, JSON inválido o sin los campos esperados | `ErrorServicio` | CA-31 |
| Respuesta 404 / 422 al pedir un par | `ErrorPar` | CA-23 |
| Monto, monedas iguales | validación local, sin llamar a la red | CA-8..CA-14, CA-22 |

Reglas de estado: cualquier error borra el resultado (CA-32); cambiar monto o monedas borra resultado y mensajes (CA-24); el botón se desactiva y se muestra "Convirtiendo..." durante la petición (CA-29). Una respuesta que llega después de que el usuario cambió un campo se descarta (CA-25).

## 5. Estrategia de tests (sin red)

- `api.js` recibe `fetch` y el tiempo máximo por parámetro (inyección), así los tests pasan un `fetch` falso que devuelve respuestas simuladas, rechaza, responde 500/404 o nunca resuelve.
- Los tests NUNCA llaman a Frankfurter. Se usan respuestas simuladas con la forma documentada arriba.
- `conversor.js` recibe un objeto `api` simulado.
- Casos de tiempo agotado: se usa un tiempo máximo corto en el test (por ejemplo 20 ms) en vez de esperar 10 s.
- Cada criterio de la spec se cubre al menos con un test, con una prueba manual en el navegador para los criterios visuales (CA-35..CA-37).

## 6. Pantalla

Una sola columna, ancho máximo ~480 px, campos a todo el ancho, `viewport` móvil, `inputmode="decimal"` en el monto (CA-36), `autofocus` en el monto (CA-37), `lang="es"`.
