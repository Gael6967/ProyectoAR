# Verificación del prototipo

Verificado en este entorno el 29 de septiembre de 2026. Son pruebas del proyecto local, no una certificación de todos los teléfonos.

## Pruebas superadas

- Comprobación de sintaxis de `app.js`, `qr.js` y `tools/serve.mjs` con Node.js.
- Inicio sin activar la cámara antes de pulsar el botón.
- Recorrido de ensayo en 390 × 844, 320 × 568 y 844 × 390 píxeles: selección de componentes, zona de riesgo, cinco pasos, retroceso, registro, finalización y regreso al inicio.
- Comprobación de ausencia de desbordamiento horizontal en las pantallas iniciales de esos tamaños.
- Revisión visual de inicio en escritorio, inicio móvil, inspección, finalización y marcador imprimible.
- Generación de QR para una URL HTTPS de prueba; rechazo de HTTP/localhost. Se genera como SVG con margen de cuatro módulos. Esta URL de prueba no se entrega como una publicación real.
- Permiso de cámara denegado/sin dispositivo: aparece la ayuda y se puede regresar al inicio.
- **Tracking real con ARToolkit:** navegador Edge/Chromium en una sesión de prueba, con entrada de webcam sintética que contiene el marcador Hiro. El reconocimiento no se reemplazó por eventos artificiales.
- Detección inicial, selección del hotspot de rodamiento, activación de geometría de riesgo, pérdida del marcador, ocultamiento de elementos anclados y recuperación posterior.
- Procedimiento completo en modo AR, registro con `mode: marker-ar` y detención de las pistas de cámara al completar.
- Sin excepciones JavaScript ni solicitudes HTTP fallidas durante el recorrido AR comprobado. Las bibliotecas emiten algunos avisos internos no bloqueantes.

## Verificación pendiente en el lugar de presentación

- Publicar en una cuenta de GitHub y comprobar la URL pública y HTTPS.
- Generar el QR definitivo desde esa URL y escanearlo con un teléfono real.
- Verificar permisos, cámara trasera, legibilidad y seguimiento con el teléfono elegido (Chrome/Android o Safari/iPhone).
- Probar la impresión real, iluminación y distancia a la hoja. La prueba de webcam sintética no mide enfoque, exposición, movimiento ni calidad de impresión.
- Hacer un ensayo de aproximadamente 100 segundos en la red de la presentación.

No se ha validado físicamente un iPhone ni un teléfono Android en este entorno. El modo de ensayo no debe presentarse como seguimiento por cámara.
