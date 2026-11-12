// Build del sitio:
//  1. Arma cada página de src/pages/ dentro de src/layout.html.
//  2. Copia CSS, JS e imágenes locales a dist/.
//  3. Descarga las fotos originales desde hatolascaretas.com y las optimiza a WebP.
//
// Uso:  npm run build
//       FOTOS_OFFLINE=1 npm run build   → genera fotos de relleno (sin internet)

import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const ORIGEN = 'https://hatolascaretas.com/wp-content/uploads';
const DIST = 'dist';
const OFFLINE = process.env.FOTOS_OFFLINE === '1';

const h = (n) => `2018/06/hato_las_caretas-${n}.jpg`;
const ave = (n) => `2018/06/aves_hato_las_caretas-${n}.jpg`;

// nombre de salida → [ruta en el sitio del hato, ancho máximo]
const FOTOS = {
  'portada-casa':        ['2018/06/hao-1.jpg', 1920],
  'casa':                ['2018/06/casa.jpg', 1920],
  'estero':              ['2018/07/hatolascaretas-1114.jpg', 1920],
  'interior':            ['2018/07/hatolascaretas-10.jpg', 1000],
  'ganado':              ['2018/07/hatolascaretas-1699.jpg', 1000],
  'hab-doble':           [h(3), 1100],
  'hab-cuadruple':       [h(2), 1100],
  'hab-multiple':        [h(1), 1100],
  'piscina':             [h(9), 1100],
  'ordeno':              [h(24), 1000],
  'ordeno-corral':       [h(4), 1000],
  'faena-caballo':       [h(22), 1000],
  'alimentando-caballo': [h(25), 1000],
  'cabalgata-rio':       ['2014/08/157d3a_9e0cbe5f95c629ffff58b038c9a297b1.jpg', 1000],
  'caballos':            ['2014/08/SAM_0557.jpg', 1000],
  'vacas':               ['2014/08/vacas.jpg', 1000],
  'paseo-bongo':         ['2014/08/IMG_2740-1.jpg', 800],
  'toninas':             ['2014/08/toninas.jpg', 800],
  'baba':                ['2018/06/baba.png', 800],
  'garzas':              ['2014/08/foto1.jpg', 1200],
  'aves-1':              [ave(48), 1000],
  'aves-2':              [ave(47), 1000],
  'aves-3':              [ave(46), 1000],
  'aves-4':              [ave(45), 1000],
  'aves-5':              [ave(44), 1000],
  'aves-6':              [ave(43), 1000],
  'carne-en-vara':       [h(23), 1920],
  'plato-1':             [h(33), 1000],
  'plato-2':             [h(31), 1100],
  'plato-3':             [h(32), 1000],
  'plato-4':             [h(26), 1000],
  'plato-5':             [h(21), 1000],
  'plato-6':             [h(10), 1000],
  'pabellon':            ['2015/08/Yv_Pabellon_Criollo_2.jpg', 1000],
  'casabe-1':            [h(20), 800],
  'casabe-2':            [h(19), 800],
  'casabe-3':            [h(18), 800],
  'casabe-4':            [h(17), 800],
  'casabe-5':            [h(16), 800],
  'casabe-6':            [h(15), 800],
  'casabe-7':            [h(13), 800],
  'casabe-8':            [h(12), 800],
  'prensa-1':            [h(8), 900],
  'prensa-3':            [ave(26), 900],
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

const relleno = (ancho) =>
  sharp({ create: { width: ancho, height: Math.round(ancho * 0.75), channels: 3, background: '#9c8b74' } }).png().toBuffer();

async function paginas() {
  const layout = await readFile('src/layout.html', 'utf8');
  const archivos = (await readdir('src/pages')).filter((f) => f.endsWith('.html'));
  for (const archivo of archivos) {
    const fuente = await readFile(`src/pages/${archivo}`, 'utf8');
    const meta = (clave) => fuente.match(new RegExp(`<!--\\s*${clave}:\\s*([\\s\\S]*?)\\s*-->`))?.[1] ?? '';
    const slug = archivo.replace('.html', '');
    const contenido = fuente.replace(/<!--\s*(title|description):[\s\S]*?-->\s*/g, '');
    const html = layout
      .replaceAll('{{title}}', meta('title'))
      .replaceAll('{{description}}', meta('description'))
      .replaceAll('{{slug}}', slug)
      .replace('{{content}}', contenido.trimEnd());
    await writeFile(`${DIST}/${archivo}`, html);
  }
  return archivos.length;
}

async function fotos() {
  await mkdir(`${DIST}/img/fotos`, { recursive: true });
  await Promise.all(
    Object.entries(FOTOS).map(async ([nombre, [ruta, ancho]]) => {
      const original = OFFLINE ? await relleno(ancho) : await descargar(ruta);
      const img = sharp(original).rotate();
      await img.clone().resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: ancho > 1200 ? 70 : 78 }).toFile(`${DIST}/img/fotos/${nombre}.webp`);
      if (nombre === 'portada-casa') {
        await img.clone().resize(1200, 630, { fit: 'cover' })
          .jpeg({ quality: 76, mozjpeg: true }).toFile(`${DIST}/img/og.jpg`);
      }
    })
  );
  return Object.keys(FOTOS).length;
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  for (const f of ['favicon.png', 'css', 'js', 'img']) {
    await cp(f, `${DIST}/${f}`, { recursive: true });
  }
  const n = await paginas();
  const m = await fotos();
  console.log(`Listo: ${n} páginas y ${m} fotos${OFFLINE ? ' (de relleno)' : ''} en ${DIST}/`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
