# Verificación: Conversor de monedas

Resultado de T-8 (prueba en navegador) y de la Fase 5 (criterio por criterio). Fecha: 25/10/2026.

## Cómo se verificó

- **Tests automáticos:** 42 tests con `node --test`, sin red (respuestas simuladas).
- **Navegador real:** Chromium automatizado con Playwright, sobre la app servida desde la raíz del repositorio, en 1280 px y en 360 px, con internet real, servicio simulado caído, red cortada y petición sin respuesta.
- **Prueba manual del autor:** uso en celular, incluido el teclado numérico (CA-36).

## Resultado por criterio

| Criterios | Qué se comprobó | Estado |
|---|---|---|
| CA-1 a CA-5 | 30 monedas, etiquetas "EUR – Euro", USD/EUR/BRL/GBP/MXN primero, escribir "gbp" salta a GBP, valores por defecto USD→EUR | Cumple |
| CA-6 a CA-14 | Punto y coma, límites 0 y 1.000.000, máximo 2 decimales, vacío sin error al abrir, mensajes exactos | Cumple |
| CA-15 a CA-18, CA-20 | Botón y Enter; `100,00 USD = 89,34 EUR`, `1 USD = 0,8934 EUR`, "Tasa del 23/10/2026" | Cumple |
| CA-19 | Un domingo se muestra la tasa del viernes con su fecha real | Cumple |
| CA-21 | Alrededor de 220 ms con buena conexión (límite: 3 s) | Cumple |
| CA-22, CA-23 | Monedas iguales y par sin tasa: mensaje y sin resultado | Cumple |
| CA-24, CA-25 | Cambiar monto o monedas borra resultado y mensajes; respuestas viejas se descartan | Cumple |
| CA-26 a CA-28 | Invertir con resultado convierte solo; sin resultado solo intercambia | Cumple |
| CA-29 | "Convirtiendo..." y botón desactivado mientras espera | Cumple |
| CA-30 a CA-32 | Sin conexión, servicio caído (503) y tiempo agotado a los 10,0 s: mensaje correcto y sin resultado | Cumple (tras T-10) |
| CA-33, CA-34 | Lista sin cargar: aviso, "Reintentar" y botón Convertir desactivado; al reintentar cargan las 30 monedas | Cumple |
| CA-35 | 360 px sin scroll horizontal, letra de 16 px (sin zoom) | Cumple |
| CA-36 | Teclado numérico en celular | Cumple (probado por el autor) |
| CA-37, CA-38, CA-39 | Cursor en el monto, todo en español, abre directo en el conversor | Cumple |

## Hallazgos

- **Raíz del repositorio (T-9):** el proyecto estaba dentro de una carpeta anidada y al servir la carpeta externa aparecía un listado. Se agregó CA-39 y se subió todo a la raíz.
- **Caché del navegador (T-10):** el servicio permite guardar respuestas 24 horas, y sin red se mostraba una tasa guardada en vez del aviso (contra CA-30 y CA-32). Las peticiones ahora revalidan siempre.
- **CA-4 corregido (T-7):** la lista nativa salta por código, no por nombre; se corrigió primero la spec.
