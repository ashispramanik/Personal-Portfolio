const $ = s => document.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.textContent = h; return e; };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero name: letters pop in once on load
const nameEl = $('#name');
[...'Ashis Pramanik'].forEach((ch, i) => { const s = el('span', '', ch === ' ' ? '\u00a0' : ch); s.style.animationDelay = i * 55 + 'ms'; s.setAttribute('aria-hidden', 'true'); nameEl.append(s); });

// Typing role
function typeRoles(roles) {
  const out = $('#role'); if (reduce) { out.textContent = roles[0]; return; }
  let r = 0, c = 0, del = false;
  (function tick() {
    const w = roles[r]; out.textContent = w.slice(0, c);
    if (!del && c === w.length) { del = true; return setTimeout(tick, 1500); }
    if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
    c += del ? -1 : 1; setTimeout(tick, del ? 35 : 75);
  })();
}

// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .12 });
const reveal = n => { n.classList.add('rv'); io.observe(n); };

function tags(list) { const u = el('ul', 'tags'); list.forEach(t => u.append(el('li', '', t))); return u; }

// Projects with filter
let all = [];
function drawProjects(cat) {
  const g = $('#grid'); g.replaceChildren();
  all.filter(p => cat === 'All' || p.category === cat).forEach(p => {
    const c = el('article', 'card');
    c.append(el('span', 'cat', p.category), el('h3', '', p.title), el('p', '', p.summary), tags(p.tags));
    if (!reduce) { // tilt follows pointer
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.transform = `perspective(700px) rotateY(${((e.clientX - r.left) / r.width - .5) * 8}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * 8}deg)`; });
      c.addEventListener('pointerleave', () => c.style.transform = '');
    }
    g.append(c);
  });
}
async function init() {
  const [p, projects] = await Promise.all([fetch('/api/profile').then(r => r.json()), fetch('/api/projects').then(r => r.json())]);
  all = projects; $('#summary').textContent = p.summary; typeRoles(p.roles);
  const cats = ['All', ...new Set(projects.map(x => x.category))], f = $('#filters');
  cats.forEach(c => { const b = el('button', 'chip', c); b.setAttribute('aria-pressed', c === 'All'); b.onclick = () => { f.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b)); drawProjects(c); }; f.append(b); });
  drawProjects('All');
  Object.entries(p.skills).forEach(([k, v]) => { const d = el('div'); d.append(el('h3', '', k), tags(v)); $('#skillbox').append(d); });
  const tl = $('#timeline');
  p.experience.forEach(x => { const a = el('article'); a.append(el('h3', '', x.role), el('small', '', `${x.org}, ${x.period}`), el('p', '', x.text)); tl.append(a); });
  p.education.forEach(x => { const a = el('article', 'card'); a.append(el('span', 'cat', x.period), el('h3', '', x.degree), el('p', '', x.org), el('strong', 'score', x.score)); $('#edu').append(a); });
  p.certifications.forEach(t => $('#certs').append(el('li', '', t))); p.activities.forEach(t => $('#acts').append(el('li', '', t)));
  const m = $('#mail'); m.href = 'mailto:' + p.email; m.textContent = p.email; $('#phone').textContent = `${p.phone}, ${p.location}`;
  document.querySelectorAll('section:not(.hero) > *').forEach(reveal);
}
init().catch(() => $('#summary').textContent = 'Could not load content. Start the server with npm start.');

// Contact form
$('#form').addEventListener('submit', async e => {
  e.preventDefault(); const s = $('#status'), f = e.target; s.className = ''; s.textContent = 'Sending...';
  try {
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(f))) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error);
    s.className = 'ok'; s.textContent = 'Message sent. I will reply by email.'; f.reset();
  } catch (err) { s.className = 'err'; s.textContent = err.message || 'Could not send. Try again.'; }
});
$('#yr').textContent = new Date().getFullYear();

// Background: drifting network nodes (fits the security / ML theme)
(() => {
  const cv = $('#net'), x = cv.getContext('2d'); let w, h, pts = [];
  const size = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; pts = Array.from({ length: Math.min(70, w / 18 | 0) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 })); };
  size(); addEventListener('resize', size);
  const col = () => getComputedStyle(document.documentElement).getPropertyValue('--a').trim();
  (function draw() {
    x.clearRect(0, 0, w, h); x.strokeStyle = x.fillStyle = col();
    pts.forEach((p, i) => {
      if (!reduce) { p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h; }
      x.globalAlpha = .8; x.fillRect(p.x, p.y, 2, 2);
      for (let j = i + 1; j < pts.length; j++) { const d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y); if (d < 130) { x.globalAlpha = (1 - d / 130) * .35; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(pts[j].x, pts[j].y); x.stroke(); } }
    });
    if (!reduce) requestAnimationFrame(draw);
  })();
})();
