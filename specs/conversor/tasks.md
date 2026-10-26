# Tareas: Conversor de monedas

Estado: aprobado por el usuario (Fase 3). Una tarea a la vez, un commit por tarea (`T-n: descripción`), tests en verde antes de seguir.

| ID | Descripción | Criterios que cubre | Responsable |
|----|-------------|---------------------|-------------|
| T-1 | Documentos y base del proyecto: `AGENTS.md`, spec, plan, tasks, `package.json` (script `test`), `.gitignore` | (base; ninguno) | Claude |
| T-2 | `src/monto.js`: leer y validar el monto (punto o coma, > 0, ≤ 1.000.000, máx. 2 decimales, vacío) con sus mensajes. Tests. | CA-6, CA-7, CA-8, CA-9, CA-10, CA-12, CA-13 | Claude |
| T-3 | `src/formato.js`: formatear monto convertido (`100,00 USD`), tasa a 4 decimales, miles con punto, fecha `Tasa del dd/mm/aaaa`. Tests. | CA-16, CA-17, CA-18, CA-20 | Claude |
| T-4 | `src/monedas.js`: nombres en español, texto `EUR – Euro`, orden (USD, EUR, BRL, GBP, MXN primero y resto alfabético). Tests. | CA-1, CA-2, CA-3 | Claude |
| T-5 | `src/api.js`: lista de monedas y tasa más reciente, con tiempo máximo de 10 s y errores tipados (conexión, servicio, par). Tests con `fetch` simulado. | CA-19, CA-23, CA-30, CA-31 | Claude |
| T-6 | `src/conversor.js`: lógica de estado (valores por defecto USD/EUR, convertir, monedas iguales, prioridad de mensajes, borrar al cambiar, invertir con y sin resultado, "Convirtiendo...", errores sin resultado, reintentar, descartar respuestas viejas). Tests con API simulada. | CA-5, CA-14, CA-15, CA-22, CA-24, CA-25, CA-26, CA-27, CA-28, CA-29, CA-32, CA-33, CA-34 | Claude |
| T-7 | Pantalla: `index.html`, `styles.css`, `src/app.js` conectando el DOM (lista con escritura, Enter, teclado numérico, foco inicial, español, diseño desde 360 px). | CA-4, CA-35, CA-36, CA-37, CA-38 | Claude |
| T-8 | Prueba manual en navegador, en computadora y en celular, con internet real y con la red cortada: tiempo < 3 s y diseño a 360 px. | CA-21, CA-35, CA-36, CA-37 | Usuario |
| T-9 | Corregir la raíz del repositorio: el proyecto estaba dentro de una carpeta `proyectoMonedas/` anidada y al servir la carpeta externa aparecía un listado en vez del conversor. Se sube todo a la raíz y se documenta cómo ejecutar. | CA-39 | Claude |
| T-10 | Evitar que el navegador reutilice tasas guardadas en su caché: sin red debe verse "No hay conexión", nunca un resultado. Hallado al automatizar T-8 con Playwright. | CA-30, CA-32 | Claude |
| T-11 | Agregar `README.md` con qué hace, cómo ejecutar y probar, datos y estructura. | (documentación; ninguno) | Claude |
