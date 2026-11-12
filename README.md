# Hato Las Caretas — propuesta web

Propuesta de sitio para [Hato Las Caretas](https://www.instagram.com/hatolascaretas/) (Camaguán, Guárico, Venezuela), preparada por [Tu Plan Digital](https://tuplandigital.cl).

## Stack
- HTML + CSS estático, sin build ni dependencias.
- Interacciones solo con CSS (menú móvil, pestañas de experiencias, galería con scroll-snap).
- Imágenes en WebP con carga diferida.

## Estructura
```
index.html        Página única
css/styles.css    Estilos y paleta (variables en :root)
img/              Fotos, logo e imagen para redes (og.jpg)
favicon.png
```

## Desarrollo local
```bash
python3 -m http.server 8080
```

## Pendiente antes de producción
- Reemplazar las fotos por los originales en alta resolución (las actuales salen de la cuadrícula de Instagram).
- Validar textos, testimonios, servicios y datos de contacto con el hato.
