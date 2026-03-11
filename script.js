const WHATSAPP_NUMBER = '595981000000';

const canvas = document.getElementById('magicCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let shooting = false;

function resizeCanvas() {
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function sparkle(x, y, count = 18, spread = 1.8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * spread + 0.4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: Math.random() * 28 + 24,
      maxLife: Math.random() * 28 + 24,
      size: Math.random() * 2.8 + 1.2,
      glow: Math.random() * 18 + 12,
      hue: Math.random() > 0.25 ? 45 : 32
    });
  }
}

function drawParticle(p) {
  const alpha = p.life / p.maxLife;
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glow);
  gradient.addColorStop(0, `hsla(${p.hue}, 100%, 92%, ${alpha})`);
  gradient.addColorStop(0.4, `hsla(${p.hue}, 100%, 70%, ${alpha * 0.8})`);
  gradient.addColorStop(1, `hsla(${p.hue}, 100%, 55%, 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.glow, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `hsla(${p.hue}, 100%, 88%, ${alpha})`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.01;
    p.vx *= 0.988;
    p.vy *= 0.988;
    p.life -= 1;
    drawParticle(p);
  }
  requestAnimationFrame(animate);
}

function castSpellPath() {
  if (shooting) return;
  shooting = true;

  const startX = 80;
  const startY = 120;
  const endX = Math.min(window.innerWidth - 120, window.innerWidth * 0.78);
  const endY = Math.min(window.innerHeight * 0.48, 360);
  const steps = 90;
  let i = 0;

  const path = setInterval(() => {
    const t = i / steps;
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t + Math.sin(t * Math.PI * 2.2) * 24;
    sparkle(x, y, 7, 1.2);
    if (i % 8 === 0) sparkle(x, y, 12, 1.8);
    i++;
    if (i > steps) {
      clearInterval(path);
      sparkle(endX, endY, 80, 3.2);
      setTimeout(() => { shooting = false; }, 1300);
    }
  }, 16);
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function setupForm() {
  const form = document.getElementById('rsvpForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = data.get('nombre')?.toString().trim() || '';
    const telefono = data.get('telefono')?.toString().trim() || '';
    const acompanantes = data.get('acompanantes')?.toString().trim() || '0';
    const asistencia = data.get('asistencia')?.toString().trim() || '';
    const mensaje = data.get('mensaje')?.toString().trim() || '';

    const text = [
      '✨ Confirmación de asistencia',
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono || 'No indicó'}`,
      `Acompañantes: ${acompanantes}`,
      `Asistencia: ${asistencia}`,
      `Mensaje: ${mensaje || 'Sin mensaje adicional'}`
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });
}

window.addEventListener('resize', resizeCanvas);
document.getElementById('wandTrigger').addEventListener('click', castSpellPath);

resizeCanvas();
animate();
setupReveal();
setupForm();

window.addEventListener('load', () => {
  setTimeout(castSpellPath, 500);
  setTimeout(() => sparkle(window.innerWidth * 0.72, 200, 60, 2.8), 2200);
});
