# Ixmati Web Vision

Ruta: `/webvision/`

MVP funcional para diagnosticar necesidades digitales, generar una simulación HTML y recomendar una solución con precio estimado ajustable.

## Instalación

No requiere build. Es una app estática integrada al sitio actual.

Abrir localmente:

```bash
python3 -m http.server 8080
```

Luego visitar `http://localhost:8080/webvision/`.

## Variables de entorno

Ver `.env.example` en la raíz del proyecto.

- `OPENAI_API_KEY`: opcional para redactar diagnóstico con IA desde `api/webvision/generate.php`.
- `WEBVISION_AI_MODEL`: opcional. Si no existe, el endpoint usa el fallback determinista.
- `SUPABASE_URL` y `SUPABASE_ANON_KEY`: preparados para fase de integración.

## Flujo de usuario

1. Bienvenida.
2. Información del negocio.
3. Identidad visual.
4. Objetivos.
5. Funciones con preguntas condicionales.
6. Generación breve.
7. Simulación HTML navegable con vista escritorio/celular.
8. Diagnóstico, precio y funciones ajustables.
9. Asesoría, intención de compra o diagnóstico por correo.

## Eventos

- `webvision_started`
- `business_info_completed`
- `branding_completed`
- `requirements_completed`
- `simulation_generated`
- `recommendation_viewed`
- `feature_added`
- `feature_removed`
- `consultation_requested`
- `purchase_intent`
- `diagnosis_requested`
- `webvision_abandoned`

## Supabase

El SQL está en `docs/supabase-schema.sql`. El MVP guarda progreso en `localStorage` y el endpoint PHP registra eventos JSONL como respaldo temporal.

## Criterios de prueba

- Completar el flujo desde móvil.
- Probar giro `Tienda`, `Restaurante` y `Profesionista o servicio`.
- Confirmar que cambia la recomendación por objetivos y funciones.
- Agregar/quitar funciones en diagnóstico y verificar que cambia el precio.
- Subir un logotipo menor a 2 MB y verificar que aparezca en la simulación.
- Cambiar colores y confirmar que la maqueta los usa.
- Usar vista escritorio/celular.
- Probar asesoría, compra y diagnóstico.
- Revisar consola del navegador sin errores.

## Fase 2

- Conectar Supabase real desde endpoint seguro.
- Enviar correos transaccionales.
- Integrar calendario real.
- Conectar checkout o carrito existente.
- Añadir CRM/panel comercial.
- Enriquecer copy con IA y pruebas A/B.
