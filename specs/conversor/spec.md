# Spec: Conversor de monedas

Estado: borrador para aprobación (Fase 1).
Esta spec describe QUÉ debe hacer el sistema y POR QUÉ. No menciona tecnologías ni proveedores de datos; eso vive en `plan.md`.

## 1. Problema

Un estudiante que compra por internet (componentes de computadora, juegos, suscripciones) ve precios en distintas monedas (USD, EUR, BRL, GBP, MXN…). Para saber en qué tienda le conviene comprar, hoy debe abrir un buscador, escribir la conversión, copiar el número y repetirlo con cada precio.

Eso causa tres dolores:

- **Lentitud:** toma varios minutos comparar precios.
- **Errores:** se copia mal el número o se usa una tasa vieja vista días antes.
- **Malas decisiones:** se compra "a ojo" y a veces sale más caro (ejemplo real: una suscripción anual en euros que resultó más cara que la de dólares), o se abandona la compra por no hacer las cuentas.

Se necesita algo que, con un monto y dos monedas, dé el resultado con la tasa del día y deje claro de qué fecha es esa tasa, sin buscar ni calcular a mano.

## 2. Usuarios

- **Usuario principal:** el autor, estudiante que compra en línea varias veces por semana.
- **Usuarios secundarios:** otros estudiantes de la universidad que compran en línea. La mayoría no tiene perfil técnico.

Consecuencias para el diseño:

- Debe entenderse sin explicación: abrir, escribir el monto y convertir.
- Se usa en computadora (comparando varias pestañas) y en celular (consultas rápidas, fuera de casa).
- Cada consulta debe tomar menos de un minuto.
- La conexión a internet puede ser lenta o fallar; el sistema debe decirlo claramente y nunca mostrar un número incorrecto.
- Todo el contenido está en español.

## 3. Historias

- **H-1.** Como estudiante que compra en línea, quiero elegir una moneda de origen y una de destino entre todas las disponibles, para comparar precios de tiendas de distintos países.
- **H-2.** Como estudiante, quiero ingresar un monto y ver su conversión con la tasa usada y la fecha de esa tasa, para saber si estoy usando una tasa vigente.
- **H-3.** Como estudiante, quiero invertir el par de monedas con un botón, para hacer rápido la comparación contraria (por ejemplo EUR contra USD y luego USD contra EUR).
- **H-4.** Como estudiante sin conocimientos técnicos, quiero que me avisen con mensajes claros cuando el monto no es válido, cuando las monedas no sirven o cuando algo falla, para saber qué corregir o si el problema es mi conexión.
- **H-5.** Como estudiante con internet inestable, quiero que el sistema nunca muestre un resultado viejo o que no corresponda a lo que tengo en los campos, para no tomar decisiones de compra con un número equivocado.
- **H-6.** Como estudiante que usa el celular, quiero que todo se vea y se use bien en pantalla chica, para consultar un precio rápido fuera de casa.

## 4. Criterios de aceptación

Formato EARS. Cada criterio es un requisito verificable. Los criterios llevan identificador (CA-n) para trazarlos desde plan y tareas.

### 4.1 Monedas

- **CA-1.** El sistema DEBE ofrecer como moneda de origen y de destino todas las monedas disponibles, incluyendo como mínimo USD, EUR, BRL, GBP y MXN.
- **CA-2.** El sistema DEBE mostrar cada opción de moneda con su código y su nombre, con el formato "EUR – Euro".
- **CA-3.** El sistema DEBE ordenar la lista de monedas con USD, EUR, BRL, GBP y MXN primero (en ese orden) y el resto en orden alfabético por código.
- **CA-4.** CUANDO el usuario escriba en la lista de monedas, el sistema DEBE saltar a la opción cuyo código empiece con lo escrito (por ejemplo, escribir "eur" lleva a "EUR – Euro").
- **CA-5.** CUANDO la aplicación se abra y la lista de monedas esté disponible, el sistema DEBE seleccionar USD como moneda de origen y EUR como moneda de destino.

### 4.2 Ingreso y validación del monto

- **CA-6.** DONDE el usuario escriba un monto, el sistema DEBE aceptar el punto y la coma como separador decimal, con el mismo significado ("19.99" y "19,99" son el mismo monto).
- **CA-7.** CUANDO el usuario intente convertir con un monto mayor que 0, hasta 1.000.000 inclusive, y con un máximo de 2 decimales, el sistema DEBE considerar el monto válido.
- **CA-8.** SI el usuario intenta convertir con un monto que no es un número positivo (cero, negativo, texto como "abc" o formato no reconocible), ENTONCES el sistema DEBE mostrar el mensaje "Ingresa un monto válido mayor a 0." y NO DEBE convertir.
- **CA-9.** SI el usuario intenta convertir con un monto con más de 2 decimales, ENTONCES el sistema DEBE mostrar el mensaje "Usa como máximo 2 decimales." y NO DEBE convertir.
- **CA-10.** SI el usuario intenta convertir con un monto mayor que 1.000.000, ENTONCES el sistema DEBE mostrar el mensaje "El monto máximo es 1.000.000." y NO DEBE convertir.
- **CA-11.** MIENTRAS el campo del monto esté vacío y el usuario no haya intentado convertir, el sistema NO DEBE mostrar ningún mensaje de error ni resultado.
- **CA-12.** SI el usuario intenta convertir con el campo del monto vacío, ENTONCES el sistema DEBE mostrar el mensaje "Ingresa un monto válido mayor a 0." y NO DEBE convertir.
- **CA-13.** SI el usuario escribe un monto con puntos como separador de miles (por ejemplo "1.000"), ENTONCES el sistema DEBE interpretar el punto como separador decimal y aplicar las reglas de decimales (es decir, "1.000" tiene 3 decimales y se rechaza según CA-9).
- **CA-14.** SI el monto no es válido (CA-8, CA-9, CA-10 o CA-12) y además las monedas son iguales, ENTONCES el sistema DEBE mostrar solo el mensaje del monto.

### 4.3 Conversión y resultado

- **CA-15.** CUANDO el usuario presione el botón "Convertir" o presione Enter en el campo del monto, el sistema DEBE intentar la conversión con el monto y las monedas seleccionadas.
- **CA-16.** CUANDO la conversión sea exitosa, el sistema DEBE mostrar la conversión completa con el formato "100,00 USD = 92,00 EUR", con el monto convertido redondeado a 2 decimales.
- **CA-17.** CUANDO la conversión sea exitosa, el sistema DEBE mostrar la tasa directa usada con 4 decimales y con el formato "1 USD = 0,9200 EUR".
- **CA-18.** CUANDO la conversión sea exitosa, el sistema DEBE mostrar la fecha de la tasa con el formato "Tasa del 25/10/2026" (día/mes/año).
- **CA-19.** SI no existe una tasa nueva para el día de hoy (por ejemplo fin de semana o feriado), ENTONCES el sistema DEBE usar la tasa más reciente disponible y mostrar su fecha real, nunca la fecha de hoy.
- **CA-20.** El sistema DEBE mostrar todos los números del resultado con coma decimal y punto como separador de miles (por ejemplo "1.000.000,00 USD"), sin mezclar formatos, y solo con el código de moneda, sin símbolos.
- **CA-21.** CUANDO la conversión se haga con buena conexión, el sistema DEBE mostrar el resultado en menos de 3 segundos.
- **CA-22.** SI la moneda de origen y la de destino son la misma, ENTONCES el sistema DEBE mostrar el mensaje "Elige dos monedas distintas." y NO DEBE convertir.
- **CA-23.** SI el sistema no puede obtener una tasa para la combinación elegida, ENTONCES el sistema DEBE mostrar el mensaje "Esta combinación de monedas no está disponible." y NO DEBE mostrar resultado.

### 4.4 Coherencia entre campos y resultado

- **CA-24.** CUANDO el usuario cambie el monto, la moneda de origen o la moneda de destino, el sistema DEBE borrar de inmediato el resultado y cualquier mensaje de error que estuvieran en pantalla (no atenuarlos).
- **CA-25.** El sistema NO DEBE mostrar un resultado que no corresponda a los valores actuales de los campos de monto y monedas.

### 4.5 Invertir monedas

- **CA-26.** CUANDO el usuario presione el botón de invertir, el sistema DEBE intercambiar la moneda de origen con la de destino.
- **CA-27.** CUANDO el usuario presione el botón de invertir y ya haya un resultado en pantalla, el sistema DEBE convertir de nuevo automáticamente con el par invertido y reemplazar el resultado anterior por el nuevo, sin que el usuario presione "Convertir".
- **CA-28.** CUANDO el usuario presione el botón de invertir y NO haya un resultado en pantalla, el sistema DEBE solo intercambiar las monedas, sin convertir ni mostrar mensajes de error.

### 4.6 Errores de conexión y servicio

- **CA-29.** MIENTRAS una conversión esté en curso, el sistema DEBE mostrar el texto "Convirtiendo..." y DEBE mantener desactivado el botón "Convertir".
- **CA-30.** SI no hay conexión o la respuesta tarda más de 10 segundos, ENTONCES el sistema DEBE dejar de esperar y mostrar el mensaje "No hay conexión. Revisa tu internet e inténtalo de nuevo."
- **CA-31.** SI el servicio de tasas está caído o responde con error, ENTONCES el sistema DEBE mostrar el mensaje "El servicio de tasas no está disponible en este momento. Inténtalo más tarde."
- **CA-32.** SI ocurre un error de conexión o de servicio (CA-30 o CA-31), ENTONCES el sistema NO DEBE mostrar ningún resultado, incluyendo resultados de conversiones anteriores.
- **CA-33.** SI la lista de monedas no se puede cargar al abrir la aplicación, ENTONCES el sistema DEBE mostrar el mensaje de error correspondiente (CA-30 o CA-31) junto con un botón "Reintentar" y NO DEBE ofrecer una lista de monedas de respaldo.
- **CA-34.** CUANDO el usuario presione "Reintentar", el sistema DEBE intentar cargar de nuevo la lista de monedas.

### 4.7 Uso en pantalla y accesibilidad básica

- **CA-35.** El sistema DEBE mostrarse y usarse completo, sin hacer zoom y sin desplazamiento horizontal, en pantallas desde 360 px de ancho.
- **CA-36.** CUANDO el usuario use un dispositivo con teclado en pantalla, el sistema DEBE abrir un teclado numérico que permita escribir la coma y el punto decimal en el campo del monto.
- **CA-37.** CUANDO la aplicación se abra, el sistema DEBE colocar el cursor en el campo del monto.
- **CA-38.** El sistema DEBE mostrar todos los textos, etiquetas y mensajes en español, sin opción de cambiar el idioma.

## 5. Fuera de alcance

- Gráficos o tasas históricas.
- Criptomonedas.
- Monedas favoritas.
- Cuentas de usuario.
- Notificaciones.
- Historial de conversiones.
- Convertir a varias monedas a la vez.
- Cambio de idioma de la interfaz.
- Lista de monedas de respaldo cuando no se puede cargar la lista (CA-33).
- Campo de búsqueda de monedas aparte de la lista desplegable.
- Interpretar separadores de miles al escribir el monto (CA-13).

## 6. Preguntas abiertas

- **PA-1.** ¿Se puede incluir el boliviano (BOB) como moneda? Es la moneda local del autor y sería útil convertir hacia ella, pero no es indispensable. Confirmado en el plan: hoy la fuente de datos no lo ofrece, así que se sigue sin él. Si algún día aparece en las monedas disponibles, entrará sin cambiar esta spec.
- **PA-2.** ¿Cómo debe presentarse la fecha de la tasa respecto de la zona horaria del usuario? Por ahora se muestra la fecha que informa la fuente de datos (CA-19), sin ajustes.
