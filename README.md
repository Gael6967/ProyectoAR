# AR Maintenance

Asistente Inteligente de Mantenimiento Industrial. Prototipo académico para Tecnologías Disruptivas.

**HTML + CSS + JavaScript + A-Frame 1.6.0 + AR.js 3.4.7.** Sitio estático, sin backend, cuentas de usuario ni instalación en el teléfono. Las dependencias están incluidas en `vendor/`.

## Experiencia publicada

- **Abrir en el celular:** https://gael6967.github.io/ProyectoAR/
- **Imprimir el marcador:** https://gael6967.github.io/ProyectoAR/marcador.html
- **Imprimir o descargar el QR:** https://gael6967.github.io/ProyectoAR/qr.html
- **Código y actualizaciones:** https://github.com/Gael6967/ProyectoAR

También se incluyen `QR-AR-Maintenance.png` y `QR-AR-Maintenance.svg`, que abren la dirección pública anterior. Escanea el QR de acceso y, dentro de la experiencia, apunta al marcador Hiro de la hoja separada.

## Comenzar en este computador

1. Abre `INICIAR.cmd`. Requiere Node.js 18 o posterior en el computador de desarrollo.
2. Visita **http://localhost:8080** si el navegador no se abre automáticamente.
3. Pulsa **Ensayar sin cámara** para recorrer la demostración completa.
4. Abre **Ver e imprimir marcador** y prepara la hoja A4.
5. Para probar AR en el computador, pulsa **Iniciar inspección**, permite la cámara y muestra el marcador en papel u otra pantalla.

Alternativa desde una terminal abierta en esta carpeta:

```sh
node tools/serve.mjs
```

No es necesario ejecutar `npm install`. `npm start` es equivalente. `npm run check` comprueba la sintaxis del código propio. Detén el servidor con Ctrl+C. Si el puerto 8080 está ocupado, en PowerShell: `$env:PORT=8081; node tools/serve.mjs` y abre `http://localhost:8081`.

**No abras `index.html` con doble clic para usar la cámara.** Usa un servidor local o la versión publicada con HTTPS. `localhost` en el celular apunta al propio celular; no abre el servidor de tu computador. Para la demostración móvil, usa GitHub Pages.

## Publicar en GitHub Pages

Este proyecto está publicado desde la rama `main`, carpeta raíz, del repositorio `Gael6967/ProyectoAR`, con HTTPS. Para actualizarlo, reemplaza los archivos modificados en ese repositorio y espera a que **Actions → pages-build-deployment** termine correctamente. La URL y el QR se conservan mientras no cambies la cuenta o el nombre del repositorio.

Para reproducir la publicación en otra cuenta:

1. Inicia sesión en [GitHub](https://github.com/). Crea un repositorio llamado **ProyectoAR**. Para usar Pages con una cuenta gratuita, utiliza un repositorio público. El contenido del proyecto será visible públicamente.
2. Sube **el contenido** de esta carpeta al repositorio, incluyendo `assets/` y `vendor/`. `index.html` debe quedar en la raíz, no dentro de otra carpeta `ProyectoAR`. No subas solamente el ZIP.
3. En la web de GitHub puedes usar **Add file → Upload files** y arrastrar todos los archivos y carpetas. Confirma con **Commit changes**. Cada archivo del proyecto está por debajo del límite de carga web de 25 MiB.
4. Abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Selecciona la rama **main**, carpeta **/(root)**, y pulsa **Save**.
7. Espera a que termine la publicación. Copia la URL mostrada en **Settings → Pages** y comprueba que abra el inicio.
8. Usa HTTPS. Si aparece **Enforce HTTPS**, déjalo activado. No necesitas dominio propio.

El formato será:

```text
https://TU-USUARIO.github.io/ProyectoAR/
```

**Es una plantilla, no una dirección publicada.** Sustituye `TU-USUARIO` por la cuenta propietaria o copia la URL que GitHub realmente entregue. El nombre del repositorio y sus mayúsculas forman parte de la ruta.

La página es estática: no hay comando de compilación, claves ni variables secretas. `.nojekyll` evita que GitHub procese los archivos como un sitio Jekyll. Si cargas por navegador y no aparece ese archivo oculto, puedes crearlo mediante **Add file → Create new file**; el proyecto tampoco depende de recursos con nombres que empiecen por guion bajo.

Documentación oficial: [crear un sitio de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [elegir rama y carpeta de publicación](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [cargar archivos](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## Crear el QR definitivo

1. Una vez publicado, abre **QR de acceso** desde el pie de la página. También puedes abrir `https://TU-USUARIO.github.io/ProyectoAR/qr.html`.
2. Desde una dirección pública HTTPS, el generador toma automáticamente la URL de la carpeta del proyecto. Comprueba que sea la URL correcta.
3. Si estás en el servidor local, pega manualmente la URL pública en el campo y pulsa **Generar QR**.
4. Usa **Imprimir QR** o **Descargar SVG**.
5. Escanéalo con el celular y verifica la dirección antes de la presentación.

El QR se genera completamente en el navegador, sin enviar la URL a servicios de terceros. **El QR solo abre la web. El marcador Hiro reconoce el equipo.** Imprime ambas cosas en hojas separadas.

## Preparar el marcador

- Abre `marcador.html` desde el servidor y pulsa **Imprimir marcador A4**.
- Configura papel A4, escala 100 %, desactiva encabezados y pies del navegador y conserva el margen blanco.
- La imagen `assets/hiro.png` también sirve directamente. El cuadrado negro mide aproximadamente 10 cm en la hoja preparada.
- Coloca la hoja plana sobre una mesa, atril o junto a una maqueta de motor. La ilustración acompaña al marcador; **el dibujo del motor solo no se reconoce**.
- Mantén visibles las cuatro esquinas del marco negro. Empieza a 30–60 cm y ajusta distancia y ángulo hasta que se detecte.
- Evita papel brillante, sombras fuertes, reflejos y movimiento brusco. Puedes probar mostrando el marcador en otra pantalla, con brillo moderado.
- El motor 3D, los tres puntos interactivos y la zona roja se anclan al marcador. La tarjeta se mantiene dentro del área legible de la pantalla cuando se acerca al borde.

## Demostración en aproximadamente 100 segundos

| Tiempo | Acción y explicación |
| --- | --- |
| 0–15 s | Escanea el QR. «Accedemos desde el navegador, sin instalar una app». |
| 15–30 s | Inicia la inspección, autoriza la cámara y encuadra el marcador. |
| 30–45 s | Muestra la alerta: 82 °C y 7.2 mm/s. «Representamos lecturas de sensores IoT». |
| 45–60 s | Pulsa **② Rodamiento** y **Ver zona de riesgo**. Muestra el componente resaltado. |
| 60–90 s | Inicia el procedimiento. Recorre los cinco pasos con **Siguiente**, registra el resultado y completa. |
| 90–100 s | Muestra **Inspección completada** y explica que los datos son simulados. Pulsa **Finalizar**. |

Ensaya una vez en el mismo celular, navegador y red que usarás en clase. En **Ensayar sin cámara**, solo el motor 3D gira lentamente; arrástralo con el dedo o el mouse para elegir el ángulo. Los botones 1, 2 y 3 y las indicaciones de seguridad permanecen fijos en pantalla. El giro se pausa unos segundos después de manipularlo y durante el procedimiento. El modo sirve para practicar las interacciones si el dispositivo no puede usar la cámara; está rotulado como ensayo y no representa reconocimiento real.

## Funciones incluidas

- Inicio voluntario de la cámara, solicitud de permiso y mensajes para errores de acceso.
- Reconocimiento real de marcador, ocultamiento al perderlo y recuperación al volver a verlo.
- El mismo modelo 3D ligero aparece en la portada, en **Ensayar sin cámara** y sobre el marcador Hiro en AR: carcasa azul, rodamiento naranja, conexión amarilla, eje de acero y dos rieles grafito. Tres hotspots táctiles, con botones equivalentes en el panel inferior.
- Datos: Motor Eléctrico M-01, Advertencia, 82 °C, 7.2 mm/s, 3.842 h y 12/09/2026.
- Rodamiento en riesgo y zona resaltada en rojo con advertencia por equipo energizado.
- Procedimiento de cinco pasos, navegación hacia atrás y registro local del resultado.
- Pantalla de finalización y cierre de la cámara. Botón de salida disponible durante la sesión.
- Vista explicativa de la arquitectura conceptual y modo de ensayo.
- Generador QR local y hoja de marcador imprimible.

Los controles del panel quedan disponibles después de la primera detección para facilitar el procedimiento si apartas el teléfono. Al perder el marcador se ocultan los elementos anclados y se muestra **Última lectura · sin seguimiento**; no se simula una detección nueva.

## Qué es real y qué es simulado

```text
Máquina industrial → Sensores IoT → Plataforma Cloud → Análisis de datos
                                                        ↓
                                                 AR Maintenance
                                                        ↓
                                               Técnico de mantenimiento
```

En una solución industrial, los sensores enviarían telemetría a una plataforma Cloud y una API entregaría el diagnóstico a la interfaz AR. Aquí los valores y recomendaciones están definidos en el código. **No hay conexión a sensores, backend, IA ni servicios Cloud.** El reconocimiento óptico, las superposiciones y las interacciones sí son funcionales.

La cámara se procesa localmente en el navegador. No se captura ni sube video. La última inspección se guarda en `localStorage` bajo `ar-maintenance:last-inspection`, reemplazando la anterior. Incluye fecha, resultado, observación, datos y la indicación de simulación. No se sincroniza entre teléfonos. Si el almacenamiento está bloqueado, se completa el recorrido y se informa que no se guardó.

El procedimiento es demostrativo y no certifica una intervención industrial. En un entorno real debe sustituirse por el procedimiento autorizado para el equipo y ser ejecutado por personal capacitado.

## Archivos

```text
index.html                 Pantalla inicial y experiencia
styles.css                 Diseño y adaptación a celular
app.js                     Estados, tracking, hotspots y procedimiento
marcador.html              Hoja A4 imprimible
qr.html / qr.js             Generador QR e impresión
assets/motor.svg            Esquema técnico original del motor
assets/motor-m01.glb         Modelo 3D del motor, de baja carga para celulares
assets/hiro.png             Marcador Hiro imprimible
assets/motor-m01.patt       Patrón óptico correspondiente
assets/camera_para.dat      Calibración genérica ARToolkit
assets/favicon.svg         Icono del proyecto
vendor/                    Bibliotecas y licencias
tools/serve.mjs             Servidor local sin dependencias
tools/build_motor_glb.py    Generador editable del modelo 3D (Python estándar)
INICIAR.cmd                Inicio local en Windows
package.json               Comandos opcionales de Node.js
.nojekyll                  Publicación estática en GitHub Pages
PRUEBAS.md                 Verificación y límites
README.md                  Esta guía
```

El modelo `.glb` tiene cerca de 100 KB, 1.692 triángulos y diez materiales identificados por componente. Su base abierta de dos rieles deja visible el motor; la información de inspección queda en el panel inferior para no taparlo. El SVG coloreado queda como vista de respaldo si falla la carga del 3D. Para cambiar colores o geometría, edita `COLORS` o las formas en `tools/build_motor_glb.py` y ejecútalo con `python tools/build_motor_glb.py` (o `py tools/build_motor_glb.py`) desde la raíz del proyecto; después vuelve a publicar `assets/motor-m01.glb`.

## Resolver problemas

| Problema | Solución |
| --- | --- |
| No solicita cámara | Abre la dirección HTTPS en el navegador externo. Evita el navegador integrado de mensajería. Revisa el permiso del sitio. |
| Permiso denegado | Permite la cámara en los ajustes del navegador para este sitio y pulsa **Reintentar**. |
| No hay cámara disponible | Cierra otras aplicaciones que la usen. Para probar en PC sin webcam utiliza **Ensayar sin cámara**. |
| Video detenido en iPhone | Pulsa **Activar video** si aparece. Abre el enlace directamente en Safari y vuelve a iniciar. |
| No detecta el equipo | Usa Hiro, no el QR ni solo el dibujo. Mejora la iluminación y encuadra el cuadrado entero. |
| La tarjeta tapa parte del equipo | Aleja un poco el celular. El panel inferior conserva los tres botones accesibles. |
| Se pierde el marcador | Vuelve a encuadrarlo. El procedimiento en curso conserva su paso. |
| Error 404 al publicar | Confirma `index.html` en la raíz de la rama elegida y espera a que Pages termine el despliegue. |
| Se ve el inicio pero no carga AR | Revisa que `vendor/` y `assets/` estén publicadas con sus nombres exactos. |
| Cambios no aparecen | Recarga la página. Si usas GitHub Pages, espera a que termine la nueva publicación. |
| Un QR abre otra página | Regenera con la URL exacta de Pages. Verifica mayúsculas y la barra final. |

Para la presentación, usa preferentemente Chrome en Android o Safari en iPhone con WebGL y cámara disponibles. La compatibilidad física debe confirmarse con el teléfono elegido; las políticas del navegador y el hardware pueden variar.

## Otras publicaciones posibles

Si posteriormente prefieres Netlify o Vercel, publica el mismo contenido como sitio estático, sin compilación ni instalación. La carpeta publicada debe contener `index.html`, `assets/` y `vendor/`. No cambies las rutas relativas. Copia la nueva URL HTTPS al generador QR.

## Referencias técnicas

- [AR.js: documentación, requisitos y versiones compatibles](https://ar-js-org.github.io/AR.js-Docs/).
- [AR.js: eventos y controles DOM](https://ar-js-org.github.io/AR.js-Docs/ui-events/).
- [A-Frame](https://aframe.io/).
- [QR Code Generator de Kazuhiko Arase](https://github.com/kazuhikoarase/qrcode-generator).

Las licencias de terceros se conservan en `vendor/`. No hay analítica, servicios publicitarios ni solicitudes de ubicación o micrófono.

## Señalización y legibilidad (30/09/2026)
Los botones 1, 2 y 3 tienen líneas de color y puntos sobre la carcasa azul, el rodamiento naranja y la conexión amarilla. En el ensayo los botones permanecen fijos; los extremos de las líneas siguen las piezas cuando gira el modelo. En AR las referencias siguen la posición del marcador. El motor AR es un 26 % más grande que la versión anterior; aleja un poco el teléfono si queda fuera del encuadre. El panel inferior tiene textos y controles ampliados, con desplazamiento vertical en pantallas pequeñas.

## Giro manual con cámara
Con Hiro detectado, arrastra horizontalmente sobre la vista del motor para girarlo 360° sobre el marcador. Las referencias de componentes y la zona de riesgo acompañan ese giro. Usa «Restablecer giro» para recuperar la orientación inicial respecto de Hiro. El ángulo manual se conserva al perder y recuperar el marcador; el gesto se desactiva durante el procedimiento y cuando no hay seguimiento. Mantén Hiro visible mientras inspeccionas.

## Encuadre móvil y giro vertical
La interfaz mantiene el ancho real del teléfono aunque AR.js redimensione el video. El panel usa textos de 18 px y botones de acción de 16 px. Arrastra horizontalmente para girar y verticalmente para inclinar hasta 75° en cada sentido; Restablecer giro reinicia ambos ejes. La cámara solicita formato vertical en pantallas verticales y se muestra completa, sin recorte de relleno; pueden aparecer bandas según la proporción que entregue el dispositivo. Esto corrige el recorte visual, no cambia el zoom óptico del teléfono.


## Ajuste preciso y panel compacto en teléfonos
En ambos modos, cada gesto controla un solo eje: horizontal Y o vertical X, decidido por la dirección inicial. Se ignoran movimientos menores de 6 px y el eje Z permanece en cero respecto del marcador o escena. La inclinación se limita a ±75°. Tras ajustar manualmente el ensayo, el giro automático se detiene para conservar la vista elegida. El seguimiento físico de Hiro sigue cambiando la pose global en AR.
En teléfonos el panel es compacto en ambos modos: texto de 14 px, título de 17 px y acciones de al menos 48 px. Si el contenido no cabe, el panel permite desplazamiento vertical.

## Panel dentro de la franja inferior
En teléfonos verticales el panel queda en una franja de 30 % del alto disponible (entre 200 y 260 px). Los detalles se desplazan dentro y las acciones permanecen visibles. La cámara conserva el encuadre completo y se ajusta al espacio superior, sin superponerse al panel. Al activar el riesgo se desplaza el contenido hacia la advertencia.
