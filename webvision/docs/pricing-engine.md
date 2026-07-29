# Motor de precios de Ixmati Web Vision

Los precios viven en `webvision/config/pricing.js`.

## Principios

- Los planes S1/S2/S3, T1/T2/T3 y R1/R2/R3 son anclas de cálculo.
- La UI no contiene precios.
- El precio final sale de base + modificadores + ajustes de estilo/urgencia.
- La recomendación muestra una solución personalizada, no un paquete rígido.

## Archivos

- `js/business-rules.js`: clasifica giro, objetivos y funciones necesarias.
- `js/recommendation-engine.js`: arma tipo de solución, beneficios, razones y funciones opcionales.
- `js/pricing-engine.js`: calcula estimado, rango comercial, complejidad y tiempo.
- `config/pricing.js`: planes base, modificadores e inclusiones por plan.

## Cómo ajustar precios

Edita solo `config/pricing.js`.

- Cambia `basePrice` para ajustar anclas.
- Cambia `modifiers.*.price` para funciones.
- Cambia `commercialRange.low/high` para rangos comerciales.
- Cambia `includedByBasePlan` para evitar cobrar dos veces una función incluida.
