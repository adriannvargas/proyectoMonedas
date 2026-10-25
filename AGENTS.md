# AGENTS.md — Constitución del proyecto proyectoMonedas

Conversor de monedas desarrollado con Spec-Driven Development (SDD) estricto, en modo spec-anchored: la spec vive en el repo y se corrige cada vez que algo cambia.

## Reglas

1. **La spec es la fuente de verdad.** `specs/conversor/spec.md` manda sobre el plan, las tareas y el código.
2. **No se escribe código sin una tarea aprobada.** Toda tarea sale de `specs/conversor/tasks.md` y debe estar aprobada por el usuario.
3. **Un commit por tarea**, con el formato `T-n: descripción` (en español). Ejemplo: `T-3: Agregar validación de monto`.
4. **Tests en verde antes de pasar a la siguiente tarea.** Si hay un test fallando, no se avanza.
5. **Si algo no cumple los criterios de aceptación, se corrige primero la SPEC** y después el código. Nunca se arregla solo el código.
6. **Los tests no dependen de la red.** Usan respuestas simuladas (mocks/stubs).

## Flujo por fases

Al terminar cada fase se informa qué se creó y se espera la palabra **"aprobado"** del usuario antes de avanzar. En la Fase 4, tras cada commit se muestra el resultado y se espera **"sigue"**.

| Fase | Entregable |
|------|------------|
| 0 | `AGENTS.md` (este archivo) |
| 1 | `specs/conversor/spec.md` — QUÉ y POR QUÉ (sin frameworks, librerías ni API) |
| 2 | `specs/conversor/plan.md` — CÓMO (stack, estructura, uso de la API, errores, tests) |
| 3 | `specs/conversor/tasks.md` — tareas T-n con criterio de la spec y responsable |
| 4 | Implementación, una tarea por vez |
| 5 | Verificación criterio por criterio (tabla criterio / estado) |

## Convenciones

- Documentos y mensajes de commit en español.
- La spec no menciona tecnología; la API de datos (Frankfurter) se describe solo en el plan.
- Criterios de aceptación de la spec en formato EARS (DEBE / CUANDO / MIENTRAS / DONDE / SI… ENTONCES).
- No se hace `git push` hasta que el usuario lo pida.
