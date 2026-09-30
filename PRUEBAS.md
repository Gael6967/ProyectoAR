# Verificación del prototipo

Verificado en este entorno el 29 de septiembre de 2026. Se probó el proyecto local y su versión pública HTTPS; no es una certificación de todos los teléfonos.

## Pruebas superadas

- Comprobación de sintaxis de `app.js`, `qr.js` y `tools/serve.mjs` con Node.js.
- Inicio sin activar la cámara antes de pulsar el botón.
- Recorrido de ensayo en 390 × 844, 320 × 568 y 844 × 390 píxeles: selección de componentes, zona de riesgo, cinco pasos, retroceso, registro, finalización y regreso al inicio.
- Comprobación de ausencia de desbordamiento horizontal en las pantallas iniciales de esos tamaños.
- Revisión visual de inicio en escritorio, inicio móvil, inspección, finalización y marcador imprimible.
- Generación de QR para una URL HTTPS de prueba; rechazo de HTTP/localhost. Se genera como SVG con margen de cuatro módulos. Esta URL de prueba no se entrega como una publicación real.
- Permiso de cámara denegado/sin dispositivo: aparece la ayuda y se puede regresar al inicio.
- **Tracking real con ARToolkit:** navegador Edge/Chromium en una sesión de prueba, con entrada de webcam sintética que contiene el marcador Hiro. El reconocimiento no se reemplazó por eventos artificiales.
- Carga del archivo `motor-m01.glb` durante el seguimiento: geometría con profundidad en tres ejes, diez colores de materiales y vista SVG de respaldo oculta cuando el 3D carga bien.
- El mismo GLB carga en la portada y en el ensayo sin cámara sin activar la cámara; cada vista tiene su propia escena y se conservan los cinco pasos.
- Solo el motor del ensayo gira automáticamente o por arrastre. Se compararon las posiciones de los tres botones, el indicador de riesgo y el panel de seguridad antes y después del giro: permanecen fijos. La vista del ensayo tiene un único lienzo de renderizado; las capturas confirman que cambia el ángulo del motor. El giro se detiene al iniciar los pasos y vuelve al regresar a la inspección.
- Se eliminó la tarjeta flotante que podía cubrir el motor sobre Hiro y se sustituyó la placa rectangular de la base por dos rieles abiertos.
- Captura visual en viewport móvil de 390 × 844 píxeles: carcasa azul, rodamiento naranja, conexión amarilla y eje metálico distinguibles sobre el marcador.
- Detección inicial, selección del hotspot de rodamiento, activación de geometría de riesgo, pérdida del marcador, ocultamiento de elementos anclados y recuperación posterior.
- Procedimiento completo en modo AR, registro con `mode: marker-ar` y detención de las pistas de cámara al completar.
- Sin excepciones JavaScript ni solicitudes HTTP fallidas durante el recorrido AR comprobado. Las bibliotecas emiten algunos avisos internos no bloqueantes.
- Publicación correcta mediante GitHub Pages en `https://gael6967.github.io/ProyectoAR/`, desde la rama `main` y carpeta raíz, con HTTPS.
- Comprobación de los 23 archivos públicos iniciales (sin los dos archivos ocultos de configuración): sus huellas SHA-256 coinciden con las copias locales.
- Repetición satisfactoria del recorrido AR desde la URL pública con cámara sintética, incluyendo pérdida y recuperación del marcador y cierre de la cámara.
- Tras agregar el motor 3D, los **28 archivos públicos** coincidieron byte a byte con el proyecto local mediante SHA-256. El recorrido AR completo volvió a superar la prueba desde GitHub Pages y el GLB cargó con volumen y diez colores; sin errores JavaScript ni HTTP.
- Lectura independiente del PNG QR con jsQR: codifica exactamente `https://gael6967.github.io/ProyectoAR/`.

## Verificación pendiente en el lugar de presentación

- Escanear el QR definitivo con un teléfono real.
- Verificar permisos, cámara trasera, legibilidad y seguimiento con el teléfono elegido (Chrome/Android o Safari/iPhone).
- Probar la impresión real, iluminación y distancia a la hoja. La prueba de webcam sintética no mide enfoque, exposición, movimiento ni calidad de impresión.
- Hacer un ensayo de aproximadamente 100 segundos en la red de la presentación.

No se ha validado físicamente un iPhone ni un teléfono Android en este entorno. El modo de ensayo no debe presentarse como seguimiento por cámara.

## Actualización de señalización (30/09/2026)
- Líneas y puntos conectados a coordenadas del GLB en ambos modos; no capturan los gestos de arrastre.
- Panel de inspección con texto de 16 px y acciones de al menos 58 px de altura; probado en 390×844, 320×568 y 844×390.
- Escala AR aumentada de 0.62 a 0.78 (aproximadamente 26 %).
- Repetición del recorrido completo del ensayo, estabilidad de los controles durante el giro y reconocimiento real mediante webcam sintética.

## Giro manual AR (30/09/2026)
- Prueba con reconocimiento real de Hiro desde webcam sintética: arrastre horizontal modifica la rotación local del modelo y las referencias, con panel fijo.
- Restablecer devuelve el ángulo local a cero; el ángulo elegido se conserva al perder y recuperar Hiro.
- Controles de giro ocultos sin seguimiento y durante el procedimiento; los hotspots, riesgo y finalización continúan funcionando.
- Regresión del ensayo rotativo y recorridos en tres tamaños superada. Pendiente comprobar el gesto táctil en el teléfono físico de la presentación.
