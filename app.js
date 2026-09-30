/* AR Maintenance — static, local-first academic prototype.
 * Tracking is real; equipment readings and maintenance decisions are simulated.
 */
'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const AR_MODEL_SCALE = 0.78;
  // Coordinates belong to the GLB, shared by the two renderers.
  const componentPoints = [
    {key:'motor', point:[-.23,.55,.23], offset:[-72,20]},
    {key:'bearing', point:[.42,.53,.12], offset:[72,24]},
    {key:'electrical', point:[-.13,.825,0], offset:[0,-76]}
  ];
  const parts = {
    motor: {name:'Motor Eléctrico M-01', status:'Advertencia', color:'warning-text', description:'Temperatura elevada: 82 °C. Se recomienda revisar la ventilación del motor.'},
    bearing: {name:'Rodamiento delantero', status:'Riesgo', color:'danger-text', description:'Vibración elevada detectada: 7.2 mm/s. Se recomienda inspección.'},
    electrical: {name:'Conexión eléctrica', status:'Energizado', color:'warning-text', description:'Alimentación activa (simulada). Desconectar y verificar ausencia de tensión antes de intervenir.'}
  };
  const steps = [
    ['Detener el equipo.', 'Simula la parada del motor desde su control y espera hasta que haya detenido su movimiento.'],
    ['Desconectar la alimentación eléctrica.', 'Simula el aislamiento de la alimentación. Una intervención real requiere personal autorizado, bloqueo y verificación de ausencia de tensión.'],
    ['Revisar el rodamiento delantero.', 'Localiza el punto ②. Observa el estado del rodamiento y registra indicios de desgaste, juego o lubricación deficiente.'],
    ['Comprobar vibraciones y temperatura.', 'Consulta la lectura simulada: vibración 7.2 mm/s y temperatura 82 °C. El escenario representa una anomalía.'],
    ['Registrar el resultado de la inspección.', 'Selecciona una conclusión para esta demostración. El registro se guarda únicamente en este navegador.']
  ];
  let phase = 'home', demo = false, tracked = false, detected = false;
  let step = 0, risk = false, scene = null, stream = null, session = 0;
  let cameraTimer, lostTimer, wakeLock;
  let scriptsPromise, aframePromise, homeScene, showcaseScene, showcaseReady = false;
  let showcaseYaw = -Math.PI / 10, showcaseFrame = 0, lastSpinTime = 0, lastDragAt = -Infinity, drag = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (id, visible) => { $(id).hidden = !visible; };

  function selectPart(key) {
    const part = parts[key];
    if (!part) return;
    if (demo && phase === 'inspect') lastDragAt = performance.now();
    $('part-name').textContent = part.name;
    $('part-status').textContent = part.status;
    $('part-status').className = `detail-status ${part.color}`;
    $('part-description').textContent = part.description;
    document.querySelectorAll('[data-part]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.part === key)));
    componentPoints.forEach(part => $('leader-' + part.key).classList.toggle('selected', part.key === key));
  }

  function drawLeader(key, x, y, visible = true) {
    const group = $('leader-' + key);
    group.style.display = visible ? '' : 'none';
    if (!visible) return;
    const button = $('anchor-' + key).querySelector('span').getBoundingClientRect();
    const fromX = button.left + button.width / 2;
    const fromY = button.top + button.height / 2;
    const line = group.querySelector('line');
    for (const [name,value] of Object.entries({x1:fromX,y1:fromY,x2:x,y2:y})) line.setAttribute(name,value);
    const dot = group.querySelector('circle');
    dot.setAttribute('cx',x); dot.setAttribute('cy',y);
  }

  function updateDemoLeaders() {
    const model = $('showcase-motor')?.object3D;
    const camera = showcaseScene?.camera;
    const canvas = showcaseScene?.renderer?.domElement;
    if (!showcaseReady || !model || !camera || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    model.updateWorldMatrix(true, false);
    camera.updateWorldMatrix(true, false);
    for (const {key,point} of componentPoints) {
      const vector = new AFRAME.THREE.Vector3(...point);
      model.localToWorld(vector).project(camera);
      drawLeader(key,rect.left+(vector.x+1)*rect.width/2,rect.top+(1-vector.y)*rect.height/2,vector.z>-1 && vector.z<1);
    }
  }

  function setTracking(found) {
    if (phase === 'home' || phase === 'complete' || phase === 'error') return;
    tracked = found;
    clearTimeout(lostTimer);
    if (found) {
      clearTimeout(cameraTimer);
      detected = true;
      $('tracking-status').textContent = demo ? 'Ensayo · cámara desactivada' : '● Equipo detectado';
      $('tracking-status').classList.add('tracked');
      show('tracking-guide', false);
      show('lost-notice', false);
      if (phase === 'loading' || phase === 'scan') phase = 'inspect';
      show('anchors', phase === 'inspect');
      show('inspection-panel', phase === 'inspect');
      if (demo) placeDemoAnchors();
    } else {
      show('anchors', false);
      $('tracking-status').textContent = detected ? 'Última lectura · sin seguimiento' : 'Buscando marcador…';
      $('tracking-status').classList.remove('tracked');
      lostTimer = setTimeout(() => {
        if (tracked || phase === 'home' || phase === 'complete' || phase === 'error') return;
        show('lost-notice', detected);
        show('tracking-guide', !detected && phase !== 'procedure');
      }, 400);
    }
  }

  function script(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      const timeout = setTimeout(() => reject(new Error('No se pudieron cargar los recursos AR. Comprueba la conexión y que la carpeta vendor esté publicada.')), 25000);
      el.src = src;
      el.onload = () => { clearTimeout(timeout); resolve(); };
      el.onerror = () => { clearTimeout(timeout); reject(new Error('No se pudo cargar ' + src + '. Publica la carpeta completa del proyecto.')); };
      document.head.append(el);
    });
  }

  function loadAFrame() {
    if (!aframePromise) aframePromise = script('vendor/aframe-1.6.0.min.js');
    return aframePromise;
  }

  async function loadAR() {
    if (!scriptsPromise) scriptsPromise = (async () => {
      await loadAFrame();
      await script('vendor/aframe-ar-3.4.7.js');
      // Project marker-local coordinates into the same viewport as the AR renderer.
      // Rich HTML stays readable while its anchor follows the tracked marker pose.
      AFRAME.registerComponent('maintenance-anchors', {
        init() {
          this.vector = new AFRAME.THREE.Vector3();
          this.targets = componentPoints.map(({key,point:[x,y,z],offset}) => ({key,offset,element:$('anchor-'+key),x:x*AR_MODEL_SCALE,y:y*AR_MODEL_SCALE,z:z*AR_MODEL_SCALE}));
        },
        tick() {
          // AR.js fits the video beyond the viewport in portrait mode. Give the
          // embedded scene exactly the same rectangle, or A-Frame compresses X.
          const video = document.getElementById('arjs-video');
          const holder = $('scene-container');
          if (video?.videoWidth && (holder.style.width !== video.style.width || holder.style.height !== video.style.height || holder.style.left !== video.style.marginLeft || holder.style.top !== video.style.marginTop)) {
            holder.style.width = video.style.width;
            holder.style.height = video.style.height;
            holder.style.left = video.style.marginLeft;
            holder.style.top = video.style.marginTop;
            holder.style.right = 'auto'; holder.style.bottom = 'auto';
            this.el.sceneEl.resize();
          }
          if (demo || !tracked || phase !== 'inspect' || !this.el.object3D.visible) return;
          const camera = this.el.sceneEl.camera;
          const canvas = this.el.sceneEl.renderer?.domElement;
          if (!camera || !canvas) return;
          const rect = canvas.getBoundingClientRect();
          this.el.object3D.updateMatrixWorld(true);
          for (const target of this.targets) {
            this.vector.set(target.x, target.y, target.z);
            this.el.object3D.localToWorld(this.vector);
            this.vector.project(camera);
            const visible = this.vector.z > -1 && this.vector.z < 1;
            target.element.style.visibility = visible ? 'visible' : 'hidden';
            if (!visible) { drawLeader(target.key,0,0,false); continue; }
            let x = rect.left + (this.vector.x + 1) * rect.width / 2;
            let y = rect.top + (1 - this.vector.y) * rect.height / 2;
            target.element.style.left = `${Math.max(65,Math.min(innerWidth-65,x+target.offset[0]))}px`;
            target.element.style.top = `${Math.max(155,Math.min(innerHeight-90,y+target.offset[1]))}px`;
            drawLeader(target.key,x,y);
          }
        }
      });
    })();
    return scriptsPromise;
  }

  function moveShowcase(toDemo) {
    if (!toDemo || !window.AFRAME) return;
    homeScene?.pause();
    if (!showcaseScene) mountDemoShowcase();
    showcaseScene.play();
    requestAnimationFrame(() => {
      showcaseScene.resize();
      if (toDemo) placeDemoAnchors();
    });
  }

  function spinShowcase(now) {
    if (!demo || phase !== 'inspect') { showcaseFrame = 0; return; }
    const model = $('showcase-motor')?.object3D;
    if (showcaseReady && model) {
      const delta = lastSpinTime ? Math.min(now - lastSpinTime, 50) : 0;
      if (!drag && !reduceMotion && now - lastDragAt > 5000) showcaseYaw += delta * 0.00018;
      model.rotation.y = showcaseYaw;
      updateDemoLeaders();
    }
    lastSpinTime = now;
    showcaseFrame = requestAnimationFrame(spinShowcase);
  }

  function startShowcaseSpin() {
    if (showcaseFrame) return;
    lastSpinTime = 0;
    showcaseFrame = requestAnimationFrame(spinShowcase);
  }

  function stopShowcaseSpin() {
    if (showcaseFrame) cancelAnimationFrame(showcaseFrame);
    showcaseFrame = 0;
    drag = null;
    $('showcase-demo').classList.remove('dragging');
  }

  function showcaseMarkup(prefix) {
    return `
      <a-scene id="${prefix}-scene" embedded vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false" loading-screen="enabled: false"
        renderer="alpha: true; antialias: true; precision: medium">
        <a-assets timeout="10000"><a-asset-item id="${prefix}-glb" src="assets/motor-m01.glb"></a-asset-item></a-assets>
        <a-entity id="${prefix}-motor" gltf-model="#${prefix}-glb" rotation="0 -18 0"
          scale="${prefix === 'showcase' ? '0.74 0.74 0.74' : '1 1 1'}" position="0 ${prefix === 'showcase' ? '0.10' : '0'} 0"></a-entity>
        <a-light type="ambient" intensity="1.15" color="#ffffff"></a-light>
        <a-light type="directional" intensity="0.85" color="#ffffff" position="-1 2 2"></a-light>
        <a-entity camera="fov: 50" position="0 1.15 1.65" rotation="-25 0 0"
          look-controls="enabled: false" wasd-controls="enabled: false"></a-entity>
      </a-scene>`;
  }

  function mountShowcase() {
    if (homeScene || !window.AFRAME) return;
    $('showcase-home').innerHTML = showcaseMarkup('home');
    homeScene = $('home-scene');
    $('home-motor').addEventListener('model-loaded', () => show('showcase-fallback', false));
    homeScene.addEventListener('loaded', () => {
      homeScene.renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      if (phase !== 'home') homeScene.pause();
    });
    if (demo || phase === 'complete') moveShowcase(true);
  }

  function mountDemoShowcase() {
    // Each view owns its scene: moving an initialized A-Frame scene can leave
    // a stale canvas visible while a different canvas receives the rotation.
    $('showcase-demo').innerHTML = showcaseMarkup('showcase');
    showcaseScene = $('showcase-scene');
    showcaseScene.addEventListener('pointerdown', event => {
      if (!demo || phase !== 'inspect' || !showcaseReady || event.button !== 0) return;
      drag = {id:event.pointerId, x:event.clientX, yaw:showcaseYaw};
      lastDragAt = performance.now();
      event.target.setPointerCapture?.(event.pointerId);
      $('showcase-demo').classList.add('dragging');
      event.preventDefault();
    });
    showcaseScene.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      showcaseYaw = drag.yaw + (event.clientX - drag.x) * 0.012;
      $('showcase-motor').object3D.rotation.y = showcaseYaw;
      event.preventDefault();
    });
    const finishDrag = event => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      lastDragAt = performance.now();
      $('showcase-demo').classList.remove('dragging');
    };
    showcaseScene.addEventListener('pointerup', finishDrag);
    showcaseScene.addEventListener('pointercancel', finishDrag);
    $('showcase-motor').addEventListener('model-loaded', () => {
      showcaseReady = true;
      show('demo-fallback', false);
      if (demo) placeDemoAnchors();
    });
    showcaseScene.addEventListener('loaded', () => {
      showcaseScene.renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      showcaseScene.resize();
      if (demo) placeDemoAnchors();
    });
  }

  function mountScene() {
    $('scene-container').innerHTML = `
      <a-scene embedded vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"
        renderer="alpha: true; antialias: true; precision: medium" loading-screen="enabled: false"
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; cameraParametersUrl: assets/camera_para.dat; sourceWidth: 1280; sourceHeight: 720; displayWidth: 1280; displayHeight: 720; canvasWidth: 640; canvasHeight: 480; maxDetectionRate: 30; patternRatio: 0.5">
        <a-assets timeout="10000">
          <a-asset-item id="motor-glb" src="assets/motor-m01.glb"></a-asset-item>
          <img id="motor-texture" src="assets/motor.svg" crossorigin="anonymous">
        </a-assets>
        <a-marker id="motor-marker" type="pattern" url="assets/motor-m01.patt" size="1" smooth="true" smoothCount="5" smoothTolerance="0.01" smoothThreshold="2" emitevents="true" maintenance-anchors>
          <a-entity scale="${AR_MODEL_SCALE} ${AR_MODEL_SCALE} ${AR_MODEL_SCALE}">
            <a-entity id="motor-3d" gltf-model="#motor-glb"></a-entity>
            <a-plane id="motor-fallback" visible="false" position="0 0.025 0" rotation="-90 0 0" width="1.6" height="0.93" material="shader: flat; src: #motor-texture; transparent: true; side: double; depthWrite: false"></a-plane>
            <a-entity id="risk-geometry" visible="false">
              <a-circle position="0.40 0.015 0" rotation="-90 0 0" radius="0.34" material="shader: flat; color: #ff3434; transparent: true; opacity: 0.44; side: double; depthWrite: false"></a-circle>
              <a-ring position="0.40 0.025 0" rotation="-90 0 0" radius-inner="0.34" radius-outer="0.365" material="shader: flat; color: #ff7772; side: double"></a-ring>
            </a-entity>
          </a-entity>
        </a-marker>
        <a-light type="ambient" intensity="1.15" color="#ffffff"></a-light>
        <a-light type="directional" intensity="0.85" color="#ffffff" position="-1 2 2"></a-light>
        <a-entity camera look-controls="enabled: false" wasd-controls="enabled: false"></a-entity>
      </a-scene>`;
    scene = $('scene-container').querySelector('a-scene');
    const marker = $('motor-marker');
    $('motor-3d').addEventListener('model-error', () => {
      $('motor-3d').setAttribute('visible', false);
      $('motor-fallback').setAttribute('visible', true);
      $('tracking-status').textContent = 'Vista 2D de respaldo';
    });
    marker.addEventListener('markerFound', () => setTracking(true));
    marker.addEventListener('markerLost', () => setTracking(false));
    scene.addEventListener('loaded', () => {
      scene.renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      scene.canvas?.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        fail('La sesión gráfica se interrumpió', 'Vuelve al inicio y reinicia la inspección. Cierra otras pestañas si vuelve a ocurrir.');
      });
    });
    cameraTimer = setTimeout(() => {
      if (phase === 'loading' || phase === 'scan') {
        $('guide-title').textContent = '¿Todavía no aparece la imagen?';
        $('guide-text').textContent = 'Acepta el permiso de cámara del navegador. Si ya ves video, encuadra todo el marcador Hiro con buena iluminación.';
        const video = document.getElementById('arjs-video');
        show('resume-video', Boolean(video?.paused));
      }
    }, 18000);
  }

  async function start(isDemo = false) {
    if (phase !== 'home') return;
    demo = isDemo;
    phase = 'loading';
    const currentSession = ++session;
    document.body.classList.add('in-session');
    show('home', false); show('experience', true);
    $('simulation-label').textContent = demo ? 'ENSAYO · DATOS SIMULADOS' : 'DATOS SIMULADOS';
    show('demo-background', demo);
    if (demo) {
      moveShowcase(true);
      phase = 'scan';
      setTracking(true);
      show('demo-rotate-hint', true);
      startShowcaseSpin();
      return;
    }
    homeScene?.pause();
    showcaseScene?.pause();
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      fail('La cámara necesita una conexión segura', 'Abre el sitio publicado con HTTPS, por ejemplo desde GitHub Pages. Para ensayar en este computador usa http://localhost:8080. Un archivo abierto con doble clic o una dirección HTTP de la red local no permite esta experiencia.');
      return;
    }
    try {
      await loadAR();
      if (currentSession !== session || phase !== 'loading') return;
      mountScene();
      requestWakeLock();
    } catch (error) {
      if (currentSession === session) fail('No se pudo preparar la experiencia', error.message);
    }
  }

  function cameraReady() {
    const video = document.getElementById('arjs-video');
    if (video?.srcObject) stream = video.srcObject;
    if (phase === 'home' || phase === 'complete' || phase === 'error') {
      stream?.getTracks().forEach(track => track.stop());
      return;
    }
    if (phase === 'loading') phase = 'scan';
    $('tracking-status').textContent = 'Buscando marcador…';
    $('guide-title').textContent = 'Encuadra el marcador Hiro';
    $('guide-text').textContent = 'Incluye sus cuatro bordes y el margen blanco. Mantén el teléfono estable a unos 30–60 cm.';
    if (video) {
      video.setAttribute('playsinline', '');
      video.muted = true;
      video.play().catch(() => show('resume-video', true));
    }
  }
  window.addEventListener('camera-init', cameraReady);
  window.addEventListener('arjs-video-loaded', cameraReady);
  window.addEventListener('camera-error', () => {
    if (!demo && ['loading','scan','inspect','procedure'].includes(phase)) fail('No se pudo acceder a la cámara', 'Permite la cámara para este sitio en los ajustes del navegador. Cierra otras aplicaciones que la utilicen y abre el enlace directamente en Safari (iPhone) o Chrome (Android). Después pulsa Reintentar.');
  });

  function stopCamera() {
    clearTimeout(cameraTimer); clearTimeout(lostTimer);
    const source = scene?.systems?.arjs?._arSession?.arSource;
    const video = document.getElementById('arjs-video');
    for (const media of [stream, video?.srcObject, source?.domElement?.srcObject]) media?.getTracks?.().forEach(track => track.stop());
    stream = null;
    scene?.pause();
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }
  async function requestWakeLock() {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      try { wakeLock = await navigator.wakeLock.request('screen'); } catch (_) { /* Optional, never blocks AR. */ }
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (!['loading','scan','inspect','procedure'].includes(phase) || demo) return;
    if (document.hidden) scene?.pause();
    else { scene?.play(); requestWakeLock(); }
  });
  window.addEventListener('pagehide', stopCamera);
  window.addEventListener('pageshow', event => { if (event.persisted && phase !== 'home') location.reload(); });

  function fail(title, message) {
    phase = 'error';
    stopCamera();
    show('anchors', false); show('tracking-guide', false);
    $('error-title').textContent = title;
    $('error-message').textContent = message;
    if (!$('error-dialog').open) $('error-dialog').showModal();
  }
  function exit() {
    ++session;
    phase = 'home';
    stopShowcaseSpin();
    stopCamera();
    // Full navigation tears down AR.js listeners and any pending camera request.
    // This also makes subsequent inspections start with a clean tracker.
    location.replace(new URL('./', location.href).href);
  }

  function toggleRisk() {
    risk = !risk;
    $('risk-toggle').setAttribute('aria-pressed', String(risk));
    $('risk-toggle').textContent = risk ? 'OCULTAR ZONA DE RIESGO' : 'VER ZONA DE RIESGO';
    show('risk-notice', risk);
    show('demo-risk', risk && demo);
    $('risk-geometry')?.setAttribute('visible', risk);
    if (risk) selectPart('bearing');
    if (demo) placeDemoAnchors();
  }

  function renderStep() {
    const [title, description] = steps[step];
    $('step-label').textContent = `PASO ${step + 1}`;
    $('step-count').textContent = `0${step + 1} / 05`;
    $('step-title').textContent = title;
    $('step-description').textContent = description;
    $('step-progress').setAttribute('aria-valuenow', String(step + 1));
    $('step-progress').querySelector('i').style.width = `${(step + 1) * 20}%`;
    $('step-next').textContent = step === 4 ? 'COMPLETAR INSPECCIÓN' : 'SIGUIENTE';
    show('record-field', step === 4);
    $('procedure-panel').scrollTop = 0;
    $('step-title').focus({preventScroll:true});
  }
  function startProcedure() {
    if (!detected) return;
    phase = 'procedure'; step = 0;
    stopShowcaseSpin(); show('demo-rotate-hint', false);
    show('inspection-panel', false); show('anchors', false); show('tracking-guide', false);
    show('procedure-panel', true);
    renderStep();
  }
  function complete() {
    phase = 'complete';
    stopShowcaseSpin(); show('demo-rotate-hint', false);
    stopCamera();
    show('scene-container', false);
    show('demo-background', true);
    moveShowcase(true);
    const video = document.getElementById('arjs-video');
    if (video) video.hidden = true;
    show('procedure-panel', false); show('anchors', false); show('lost-notice', false);
    show('completion', true);
    $('tracking-status').textContent = '✓ Inspección completada';
    $('tracking-status').classList.add('tracked');
    const result = $('inspection-result').value;
    $('completion-result').textContent = result;
    try {
      localStorage.setItem('ar-maintenance:last-inspection', JSON.stringify({version:1, equipment:'Motor Eléctrico M-01', result, notes:$('inspection-notes').value.trim(), completedAt:new Date().toISOString(), simulated:true, mode:demo?'rehearsal':'marker-ar', stepsCompleted:5, readings:{temperatureC:82, vibrationMmS:7.2, operatingHours:3842, lastMaintenance:'2026-09-12'}}));
      $('save-status').textContent = 'Registro guardado en este dispositivo. Datos simulados.';
    } catch (_) {
      $('save-status').textContent = 'Inspección completada. El navegador no permitió guardar el registro local.';
    }
    $('completion-title').focus({preventScroll:true});
  }

  function placeDemoAnchors() {
    if (!demo || phase !== 'inspect') return;
    // Rehearsal controls belong to the screen, independently of motor rotation.
    const box = $('showcase-demo').getBoundingClientRect();
    const points = [['anchor-motor',.17,.45],['anchor-bearing',.83,.53],['anchor-electrical',.40,.10],['demo-risk',.74,.53]];
    for (const [id, x, y] of points) {
      $(id).style.left = `${box.left+x*box.width}px`;
      $(id).style.top = `${box.top+y*box.height}px`;
      $(id).style.visibility = 'visible';
    }
    updateDemoLeaders();
  }
  window.addEventListener('resize', () => requestAnimationFrame(placeDemoAnchors));

  $('start').addEventListener('click', () => start(false));
  $('demo').addEventListener('click', () => start(true));
  $('exit').addEventListener('click', exit);
  $('finish').addEventListener('click', exit);
  $('risk-toggle').addEventListener('click', toggleRisk);
  $('procedure-start').addEventListener('click', startProcedure);
  document.querySelectorAll('[data-part]').forEach(button => button.addEventListener('click', () => selectPart(button.dataset.part)));
  $('step-next').addEventListener('click', () => { if (step < 4) { step++; renderStep(); } else complete(); });
  $('step-back').addEventListener('click', () => {
    if (step > 0) { step--; renderStep(); }
    else { phase = 'inspect'; show('procedure-panel', false); show('inspection-panel', true); show('anchors', tracked); if (demo) { show('demo-rotate-hint', true); placeDemoAnchors(); startShowcaseSpin(); } }
  });
  $('resume-video').addEventListener('click', () => { const video = document.getElementById('arjs-video'); video?.play().then(() => show('resume-video', false)).catch(() => fail('El video está pausado', 'Reinicia la inspección y acepta el permiso de cámara.')); });
  $('retry').addEventListener('click', () => { stopCamera(); location.replace(new URL('?start=1', location.href).href); });
  $('error-demo').addEventListener('click', () => { stopCamera(); location.replace(new URL('?demo=1', location.href).href); });
  $('error-home').addEventListener('click', exit);
  $('error-dialog').addEventListener('cancel', event => { event.preventDefault(); exit(); });
  $('about-open').addEventListener('click', () => $('about-dialog').showModal());
  $('about-close').addEventListener('click', () => $('about-dialog').close());
  selectPart('motor');
  loadAFrame().then(mountShowcase).catch(() => { /* The SVG remains visible as a fallback. */ });
  const params = new URLSearchParams(location.search);
  if (params.has('demo')) start(true);
  else if (params.has('start')) start(false);
})();
