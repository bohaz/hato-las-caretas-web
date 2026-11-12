// Build del sitio: copia los archivos estáticos a dist/ y descarga las fotos
// originales desde hatolascaretas.com, optimizadas a WebP con sharp.
// Uso: npm run build

import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const ORIGEN = 'https://hatolascaretas.com/wp-content/uploads';
const DIST = 'dist';

// nombre de salida → [ruta en el sitio del hato, ancho máximo]
const FOTOS = {
  'portada-casa':      ['2018/06/hao-1.jpg', 2000],
  'ordeno':            ['2018/06/hato_las_caretas-24.jpg', 1400],
  'ganado':            ['2018/07/hatolascaretas-1699.jpg', 900],
  'ordeno-corral':     ['2018/06/hato_las_caretas-4.jpg', 1000],
  'cabalgata-rio':     ['2014/08/157d3a_9e0cbe5f95c629ffff58b038c9a297b1.jpg', 1000],
  'paseo-bongo':       ['2014/08/IMG_2740-1.jpg', 1000],
  'galapagos':         ['2014/08/IMG_1940.jpg', 1000],
  'baba':              ['2018/06/baba.png', 1000],
  'garzas':            ['2014/08/foto1.jpg', 1000],
  'casa':              ['2018/06/casa.jpg', 1600],
  'habitacion-doble':  ['2018/06/hato_las_caretas-3.jpg', 900],
  'habitacion-multiple': ['2018/06/hato_las_caretas-1.jpg', 900],
  'carne-en-vara':     ['2018/06/hato_las_caretas-23.jpg', 1000],
  'casabe':            ['2018/06/hato_las_caretas-14.jpg', 800],
  'estero':            ['2018/07/hatolascaretas-1114.jpg', 2000],
  'caballos':          ['2014/08/SAM_0557.jpg', 800],
  'vacas':             ['2014/08/vacas.jpg', 800],
  'caballo-familia':   ['2018/06/hato_las_caretas-22.jpg', 800],
};

async function descargar(ruta, intentos = 3) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const res = await fetch(`${ORIGEN}/${ruta}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (i === intentos) throw new Error(`No se pudo descargar ${ruta}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(`${DIST}/img/fotos`, { recursive: true });
  for (const f of ['index.html', 'favicon.png', 'css', 'img']) {
    await cp(f, `${DIST}/${f}`, { recursive: true });
  }

  const resultados = await Promise.all(
    Object.entries(FOTOS).map(async ([nombre, [ruta, ancho]]) => {
      const original = await descargar(ruta);
      const img = sharp(original).rotate();
      await img.clone().resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: 78 }).toFile(`${DIST}/img/fotos/${nombre}.webp`);
      if (nombre === 'portada-casa') {
        await img.clone().resize(1200, 630, { fit: 'cover' })
          .jpeg({ quality: 82 }).toFile(`${DIST}/img/og.jpg`);
      }
      return nombre;
    })
  );

  await writeFile(`${DIST}/img/fotos/fuente.txt`,
    `Fotos originales de ${ORIGEN} (${resultados.length} archivos).\n`);
  console.log(`Listo: ${resultados.length} fotos optimizadas en ${DIST}/img/fotos`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
