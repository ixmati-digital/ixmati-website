# Ixmati Web Vision - Arquitectura del MVP

## Responsabilidades

- `index.html`: estructura semántica de la experiencia, SEO, escenas y puntos de montaje.
- `styles.css`: punto de entrada CSS con imports.
- `styles.min.css`: bundle CSS minificado usado por `index.html` y `preview.html`.
- `css/base.css`: base, formularios, estructura inicial y estilos compartidos.
- `css/premium-theme.css`: tema oscuro, tokens premium, fondo vivo y microinteracciones base.
- `css/experience-flow.css`: escenas, wizard inmersivo, hero, intro y preview flotante.
- `css/finale.css`: generación, revelación, simulación protagonista, diagnóstico y CTA final.
- `js/app.js`: orquestación del flujo, validación de escenas y conexión entre módulos.
- `js/webvision-wizard.js`: definición central del recorrido, opciones, tipografías y mensajes.
- `js/webvision-intro.js`: intro cinematográfica y estado de sesión.
- `js/webvision-transitions.js`: transición entre escenas.
- `js/webvision-motion.js`: timelines GSAP reutilizables.
- `js/webvision-background.js`: reacción del fondo al cursor con `requestAnimationFrame`.
- `js/webvision-audio.js`: modo inmersivo opcional con Web Audio.
- `js/webvision-preview.js`: render de vista previa y cambio de dispositivos.
- `js/simulation.js`: componentes HTML reutilizables de la simulación.
- `js/business-rules.js`, `js/recommendation-engine.js`, `js/pricing-engine.js`: reglas deterministas y cálculo comercial.
- `js/storage.js`: localStorage, captura progresiva y envío al endpoint.
- `js/analytics.js`: abstracción de eventos.

## Reglas de mantenimiento

- No colocar precios en componentes visuales.
- No cambiar precios desde IA ni desde UI.
- No exponer secretos en navegador.
- Las animaciones nuevas deben pasar por `webvision-motion.js` o `webvision-background.js`.
- Los cambios de flujo deben actualizar `SCREENS` y `STEP_LABELS` en `webvision-wizard.js`.
- Toda interacción comercial debe disparar un evento vía `trackEvent`.

## Eventos principales

- `webvision_started`
- `scene_completed`
- `business_info_completed`
- `branding_completed`
- `requirements_completed`
- `style_changed`
- `color_changed`
- `logo_uploaded`
- `logo_upload_rejected`
- `generation_started`
- `simulation_generated`
- `result_viewed`
- `preview_device_changed`
- `recommendation_viewed`
- `feature_added`
- `feature_removed`
- `consultation_requested`
- `purchase_intent`
- `diagnosis_requested`
- `webvision_abandoned`

## Criterios de prueba

- Completar el flujo en móvil sin scroll horizontal.
- Subir un logo válido y confirmar que se conserva al regresar.
- Rechazar archivos no permitidos o mayores a 2 MB.
- Cambiar estilo, colores y objetivos; la vista previa debe actualizarse.
- Completar generación y pasar por revelación, diagnóstico y conversión.
- Agregar y quitar funciones; el precio debe recalcularse.
- Activar y desactivar modo inmersivo; nunca debe sonar sin interacción.
- Probar con `prefers-reduced-motion` activo.
- Confirmar que `/webvision/preview.html` abre una demo navegable con marca de agua.
