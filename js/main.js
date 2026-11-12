// Hato Las Caretas — interacciones mínimas (el resto es CSS).

const WHATSAPP = '584127704669';
const CORREO = 'lascaretas@gmail.com';

// Carrusel de habitaciones: pestañas + flechas sobre un track con scroll-snap.
document.querySelectorAll('[data-carousel]').forEach((root) => {
  const track = root.querySelector('[data-track]');
  const tabs = [...root.querySelectorAll('[data-go]')];
  const cards = [...track.children];
  const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
  const goTo = (i) => track.scrollTo({ left: i * step(), behavior: 'smooth' });

  root.querySelector('[data-prev]')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  root.querySelector('[data-next]')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  tabs.forEach((t) => t.addEventListener('click', () => goTo(Number(t.dataset.go))));

  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / step());
    tabs.forEach((t, n) => t.classList.toggle('is-active', n === Math.min(i, tabs.length - 1)));
  }, { passive: true });
});

// Formularios: validan con HTML y arman el mensaje para WhatsApp o correo.
const fecha = (v) => (v ? v.split('-').reverse().join('/') : '');

const mensajes = {
  reserva: (d) => ({
    asunto: `Solicitud de reserva — ${d.nombre}`,
    texto: [
      'Hola, quiero solicitar una reserva en el Hato Las Caretas.',
      '',
      `Nombre: ${d.nombre}`,
      `E-mail: ${d.email}`,
      `Teléfono: ${d.telefono}`,
      `Habitación: ${d.habitacion}`,
      `Cantidad de personas: ${d.personas}`,
      `Desde: ${fecha(d.desde)}`,
      `Hasta: ${fecha(d.hasta)}`,
    ].join('\n'),
  }),
  contacto: (d) => ({
    asunto: d.asunto,
    texto: `${d.mensaje}\n\n${d.nombre} — ${d.email}`,
  }),
};

document.querySelectorAll('[data-form]').forEach((form) => {
  const error = form.querySelector('.form__error');

  // Precarga la habitación si viene en la URL (?habitacion=Doble).
  const hab = new URLSearchParams(location.search).get('habitacion');
  if (hab && form.habitacion) form.habitacion.value = hab;

  // La fecha de salida no puede ser anterior a la de llegada.
  if (form.desde && form.hasta) {
    const hoy = new Date().toISOString().slice(0, 10);
    form.desde.min = hoy;
    form.hasta.min = hoy;
    form.desde.addEventListener('change', () => { form.hasta.min = form.desde.value || hoy; });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      error.textContent = 'Revisa los campos marcados: faltan datos o hay un formato incorrecto.';
      error.hidden = false;
      form.classList.add('was-validated');
      form.querySelector(':invalid')?.focus();
      return;
    }
    error.hidden = true;
    const datos = Object.fromEntries(new FormData(form));
    const { asunto, texto } = mensajes[form.dataset.form](datos);
    const via = e.submitter?.value || 'whatsapp';
    const url = via === 'email'
      ? `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`
      : `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
    window.open(url, via === 'email' ? '_self' : '_blank', 'noopener');
  });
});

// Marca el enlace de la página actual en el menú.
const slug = document.body.className.match(/page-([\w-]+)/)?.[1];
document.querySelector(`[data-nav="${slug}"]`)?.setAttribute('aria-current', 'page');

// Menú: transparente sobre la portada y con fondo al bajar.
const nav = document.querySelector('.nav');
const pintarNav = () => nav?.classList.toggle('nav--solid', window.scrollY > 40);
pintarNav();
window.addEventListener('scroll', pintarNav, { passive: true });
