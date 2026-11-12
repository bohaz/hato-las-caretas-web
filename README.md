# Hato Las Caretas — propuesta web

Propuesta de sitio para [Hato Las Caretas](https://www.instagram.com/hatolascaretas/) (Camaguán, Guárico, Venezuela), preparada por [Tu Plan Digital](https://tuplandigital.cl).

## Stack
- HTML + CSS estático.
- Build mínimo en Node (`scripts/build.mjs`): copia el sitio a `dist/` y descarga las fotos originales desde hatolascaretas.com, optimizadas a WebP con sharp.
- Interacciones solo con CSS (menú móvil, pestañas de experiencias, galería con scroll-snap).
- Imágenes en WebP con carga diferida.

## Estructura
```
index.html        Página única
css/styles.css    Estilos y paleta (variables en :root)
img/              Logo y fotos tomadas de Instagram
scripts/build.mjs Build y descarga de fotos originales
favicon.png
```

## Desarrollo local
```bash
npm install
npm run preview   # build + servidor en http://localhost:8080
```

Para cambiar o sumar fotos, edita el objeto `FOTOS` en `scripts/build.mjs`.

## Pendiente antes de producción
- Pedir al hato originales en alta resolución de las fotos que hoy salen de Instagram (`img/*.webp`) y alojar todas las fotos en el repo, sin depender de su web actual.
- Validar textos, testimonios, servicios y datos de contacto con el hato.
