# Hato Las Caretas — propuesta web

Propuesta de sitio para [Hato Las Caretas](https://www.instagram.com/hatolascaretas/) (Camaguán, Guárico, Venezuela), preparada por [Tu Plan Digital](https://tuplandigital.cl). Diseño basado en la referencia «Driftwood Ranch» de Dribbble.

## Páginas
Inicio · El Hato · Habitaciones · Paseos · Gastronomía · Prensa · Reservar · Contacto

## Stack
- HTML + CSS estático; JavaScript mínimo (`js/main.js`) para el carrusel de habitaciones y los formularios.
- Build en Node (`scripts/build.mjs`):
  1. Arma cada página de `src/pages/` dentro de `src/layout.html` (menú y footer compartidos).
  2. Descarga las fotos originales desde hatolascaretas.com y las optimiza a WebP con sharp.
- Formularios de reserva y contacto con los mismos campos del sitio original; envían por WhatsApp o correo (sin backend).

## Estructura
```
src/layout.html      Plantilla común (promo, menú, banda, footer)
src/pages/*.html     Contenido de cada página (title y description en comentarios)
css/styles.css       Estilos y paleta (variables en :root)
js/main.js           Carrusel y formularios
img/                 Logo y fotos del museo tomadas de Instagram
scripts/build.mjs    Build, fotos (objeto FOTOS)
```

## Desarrollo local
```bash
npm install
npm run build                    # descarga fotos reales
FOTOS_OFFLINE=1 npm run build    # sin internet: fotos de relleno
```
Servir `dist/` con cualquier servidor estático. En Vercel, `cleanUrls` permite rutas sin `.html`.

## Pendiente antes de producción
- Pedir al hato originales en alta resolución y alojarlos en el repo, sin depender de su web actual.
- Definir si las reservas llegan por correo con un servicio de formularios (p. ej. Formspree).
- Validar textos, testimonios, capacidades y datos de contacto con el hato.
