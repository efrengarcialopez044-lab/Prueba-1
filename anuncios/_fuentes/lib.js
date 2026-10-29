// Utilidades de dibujo compartidas por los anuncios (SVG en un lienzo 1080x1920)
const C = {
  crema: '#FBF5F1', crema2: '#F5E9E3', papel: '#FFFBF9', rosa: '#F2DCD5', rosa2: '#EBC9BF',
  malva: '#8C5A66', malvaO: '#6E4250', terra: '#C8654F', terraT: '#A44D3B', tinta: '#3B2A30',
  sage: '#9DAE92', sageC: '#E9EDE3', piel: '#F2C6AE', pelo: '#5A3732', caja: '#D9A77F'
};
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = p => 1 - Math.pow(1 - p, 3);
const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const back = p => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const lerp = (a, b, p) => a + (b - a) * p;

// Brazos: [codo, mano] relativos al personaje (lado izquierdo; el derecho se refleja)
const POSES = {
  abajo: [[-178, -430], [-172, -312]],
  cadera: [[-235, -455], [-150, -372]],
  arriba: [[-235, -690], [-205, -830]],
  barbilla: [[-120, -450], [-42, -640]],
  frente: [[-205, -650], [-62, -828]],
  pulgar: [[-235, -560], [-262, -705]],
  senala: [[-262, -560], [-385, -610]],
  abierto: [[-250, -520], [-330, -600]]
};

function brazo(lado, pose, sh) {
  const [e, h] = POSES[pose] || POSES.abajo;
  const m = lado === 'i' ? 1 : -1;
  const sx = -140 * m, sy = -560;
  const ex = e[0] * m, ey = e[1], hx = h[0] * m, hy = h[1];
  let s = `<path d="M${sx},${sy} Q${ex},${ey} ${hx},${hy}" stroke="${C.malva}" stroke-width="62" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="${hx}" cy="${hy + (sh || 0)}" r="34" fill="${C.piel}"/>`;
  if (pose === 'pulgar') s += `<rect x="${hx - 12}" y="${hy - 78}" width="24" height="52" rx="12" fill="${C.piel}"/>`;
  return s;
}

function cara(m, blink) {
  const T = C.tinta;
  let s = '';
  s += `<circle cx="-78" cy="38" r="21" fill="#E8968A" opacity=".45"/><circle cx="78" cy="38" r="21" fill="#E8968A" opacity=".45"/>`;
  if (m === 'feliz') {
    s += `<path d="M-68,0 Q-46,-26 -24,0 M24,0 Q46,-26 68,0" stroke="${T}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  } else if (m === 'panico') {
    s += `<circle cx="-46" cy="-4" r="24" fill="#fff" stroke="${T}" stroke-width="5"/><circle cx="46" cy="-4" r="24" fill="#fff" stroke="${T}" stroke-width="5"/>`;
    s += `<circle cx="-46" cy="-2" r="9" fill="${T}"/><circle cx="46" cy="-2" r="9" fill="${T}"/>`;
  } else {
    const ry = 17 * blink;
    s += `<ellipse cx="-46" cy="-3" rx="13" ry="${ry}" fill="${T}"/><ellipse cx="46" cy="-3" rx="13" ry="${ry}" fill="${T}"/>`;
    if (blink > .5) s += `<circle cx="-41" cy="-9" r="4" fill="#fff"/><circle cx="51" cy="-9" r="4" fill="#fff"/>`;
  }
  const cej = {
    cansada: 'M-74,-36 L-24,-50 M24,-50 L74,-36',
    duda: 'M-72,-42 L-24,-42 M22,-52 Q48,-82 76,-56',
    panico: 'M-78,-52 Q-48,-80 -20,-56 M20,-56 Q48,-80 78,-52',
    feliz: 'M-74,-46 Q-48,-62 -22,-48 M22,-48 Q48,-62 74,-46',
    normal: 'M-74,-44 Q-48,-58 -22,-46 M22,-46 Q48,-58 74,-44'
  }[m] || '';
  s += `<path d="${cej}" stroke="${C.pelo}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  const boca = {
    feliz: `<path d="M-44,40 Q0,96 44,40 Z" fill="${C.terraT}"/><path d="M-30,44 Q0,56 30,44" stroke="#fff" stroke-width="7" fill="none"/>`,
    normal: `<path d="M-30,48 Q0,72 30,48" stroke="${C.terraT}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    cansada: `<path d="M-30,64 Q0,44 30,64" stroke="${C.terraT}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    duda: `<path d="M-32,58 Q-16,46 0,58 Q16,70 32,56" stroke="${C.terraT}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    panico: `<ellipse cx="0" cy="62" rx="24" ry="32" fill="#6B2E2E"/>`
  }[m];
  return s + boca;
}

// Personaje: mujer con moño y chaqueta malva. Origen en los pies.
function mujer(o) {
  const { x = 540, y = 1760, s = 1, m = 'normal', li = 'abajo', ld = 'abajo', blink = 1, rot = 0, sudor = false, dy = 0 } = o;
  let g = `<g transform="translate(${x},${y + dy}) rotate(${rot}) scale(${s})">`;
  g += `<ellipse cx="0" cy="0" rx="190" ry="26" fill="${C.tinta}" opacity=".10"/>`;
  g += `<rect x="-72" y="-305" width="56" height="292" rx="28" fill="${C.tinta}"/><rect x="16" y="-305" width="56" height="292" rx="28" fill="${C.tinta}"/>`;
  g += `<ellipse cx="-50" cy="-12" rx="50" ry="22" fill="${C.terra}"/><ellipse cx="50" cy="-12" rx="50" ry="22" fill="${C.terra}"/>`;
  g += brazo('i', li) + brazo('d', ld);
  g += `<path d="M-152,-300 Q-165,-560 -100,-605 L100,-605 Q165,-560 152,-300 Z" fill="${C.malva}"/>`;
  g += `<path d="M-46,-604 L46,-604 L30,-318 L-30,-318 Z" fill="${C.papel}"/>`;
  g += `<rect x="-28" y="-655" width="56" height="62" fill="${C.piel}"/>`;
  // los brazos levantados se dibujan encima del cuerpo
  if (['barbilla', 'frente', 'arriba', 'pulgar', 'senala', 'abierto'].includes(li)) g += brazo('i', li);
  if (['barbilla', 'frente', 'arriba', 'pulgar', 'senala', 'abierto'].includes(ld)) g += brazo('d', ld);
  g += `<g transform="translate(0,-745)">`;
  g += `<circle cx="0" cy="-170" r="62" fill="${C.pelo}"/>`;
  g += `<circle cx="0" cy="0" r="128" fill="${C.piel}"/>`;
  g += `<ellipse cx="-128" cy="10" rx="20" ry="28" fill="${C.piel}"/><ellipse cx="128" cy="10" rx="20" ry="28" fill="${C.piel}"/>`;
  g += `<path d="M-136,8 Q-142,-146 0,-150 Q142,-146 136,8 Q120,-78 40,-98 Q-30,-60 -136,8 Z" fill="${C.pelo}"/>`;
  g += cara(m, blink);
  if (sudor) g += `<path d="M120,-110 Q100,-70 120,-58 Q140,-70 120,-110 Z" fill="#9CC8E0"/>`;
  g += `</g></g>`;
  return g;
}

function destello(x, y, r, fill) {
  const k = r * .28;
  return `<path d="M${x},${y - r} Q${x + k},${y - k} ${x + r},${y} Q${x + k},${y + k} ${x},${y + r} Q${x - k},${y + k} ${x - r},${y} Q${x - k},${y - k} ${x},${y - r} Z" fill="${fill || C.terra}"/>`;
}

// Objetos del desorden
function objeto(tipo, x, y, r, sc = 1) {
  let s = `<g transform="translate(${x},${y}) rotate(${r}) scale(${sc})">`;
  switch (tipo) {
    case 'caja': s += `<rect x="-90" y="-80" width="180" height="140" rx="8" fill="${C.caja}"/><rect x="-90" y="-80" width="180" height="30" fill="#C99269"/><rect x="-14" y="-80" width="28" height="60" fill="#F1D9BD"/>`; break;
    case 'ropa': s += `<path d="M-110,30 Q-120,-40 -40,-50 Q0,-80 50,-50 Q120,-40 110,30 Z" fill="${C.sage}"/><path d="M-70,0 Q0,-30 70,0" stroke="#86987C" stroke-width="10" fill="none"/>`; break;
    case 'ropa2': s += `<path d="M-100,30 Q-90,-50 0,-40 Q90,-60 100,30 Z" fill="${C.rosa2}"/><path d="M-60,-10 L60,-20" stroke="#D9AEA3" stroke-width="10"/>`; break;
    case 'libros': s += `<rect x="-80" y="-20" width="160" height="34" rx="4" fill="${C.malva}"/><rect x="-70" y="-52" width="140" height="32" rx="4" fill="${C.terra}"/><rect x="-60" y="-82" width="120" height="30" rx="4" fill="${C.sage}"/>`; break;
    case 'taza': s += `<rect x="-34" y="-50" width="68" height="70" rx="12" fill="${C.papel}" stroke="${C.malva}" stroke-width="6"/><path d="M34,-34 Q64,-30 58,0 Q54,10 34,6" stroke="${C.malva}" stroke-width="8" fill="none"/>`; break;
    case 'zapato': s += `<path d="M-70,20 L-70,-30 Q-40,-40 -20,-20 Q30,-10 70,0 L70,20 Z" fill="${C.terraT}"/>`; break;
    case 'cesta': s += `<path d="M-120,-60 L120,-60 L100,60 L-100,60 Z" fill="#C9A27C"/><path d="M-110,-20 L110,-20 M-105,20 L105,20" stroke="#B48A63" stroke-width="8"/>`; break;
    case 'planta': s += `<path d="M-40,0 L40,0 L30,60 L-30,60 Z" fill="${C.terra}"/><path d="M0,0 Q-60,-70 -20,-120 Q0,-60 0,0 Q20,-90 60,-110 Q40,-40 0,0" fill="${C.sage}"/>`; break;
  }
  return s + '</g>';
}

function salon(o = {}) {
  const { estanteria = true, ventana = true, suelo = C.rosa } = o;
  let s = `<rect width="1080" height="1920" fill="${C.crema}"/>`;
  s += `<rect y="1420" width="1080" height="500" fill="${suelo}"/><rect y="1410" width="1080" height="16" fill="${C.rosa2}"/>`;
  if (ventana) s += `<rect x="90" y="560" width="300" height="380" rx="20" fill="#E4EEF2" stroke="${C.papel}" stroke-width="18"/><path d="M240,560 V940 M90,750 H390" stroke="${C.papel}" stroke-width="14"/><path d="M70,560 Q130,700 110,960 L70,960 Z M410,560 Q350,700 370,960 L410,960 Z" fill="${C.rosa2}"/>`;
  if (estanteria) s += `<rect x="640" y="900" width="380" height="22" rx="8" fill="#C9A27C"/><rect x="640" y="1150" width="380" height="22" rx="8" fill="#C9A27C"/>`;
  return s;
}

// Rejilla del reto de 21 días
function calendario(x, y, w, hechos, t) {
  const cw = w / 7, ch = cw * .92;
  let s = `<g transform="translate(${x},${y})">`;
  s += `<rect x="-30" y="-110" width="${w + 60}" height="${ch * 3 + 160}" rx="36" fill="${C.papel}" stroke="${C.rosa2}" stroke-width="4"/>`;
  s += `<text x="${w / 2}" y="-44" text-anchor="middle" font-family="DM Sans" font-weight="600" font-size="34" letter-spacing="6" fill="${C.malva}">TU RETO · 21 DÍAS</text>`;
  for (let i = 0; i < 21; i++) {
    const cx = (i % 7) * cw, cy = Math.floor(i / 7) * ch;
    const p = clamp(hechos - i);
    const k = back(p);
    s += `<rect x="${cx + 8}" y="${cy + 8}" width="${cw - 16}" height="${ch - 16}" rx="18" fill="${p > 0 ? C.sageC : C.crema2}"/>`;
    s += `<text x="${cx + cw / 2}" y="${cy + ch / 2 + 12}" text-anchor="middle" font-family="DM Sans" font-weight="600" font-size="32" fill="${C.tinta}" opacity="${1 - p * .75}">${i + 1}</text>`;
    if (p > 0) s += `<g transform="translate(${cx + cw / 2},${cy + ch / 2}) scale(${k})"><circle r="${cw * .3}" fill="${C.sage}"/><path d="M-18,0 L-5,13 L20,-14" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  return s + '</g>';
}

function reloj(x, y, r, p) {
  const a = p * Math.PI * 2, x2 = x + r * Math.sin(a), y2 = y - r * Math.cos(a);
  let s = `<circle cx="${x}" cy="${y}" r="${r + 22}" fill="${C.papel}" stroke="${C.rosa2}" stroke-width="4"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.crema2}" stroke-width="22"/>`;
  if (p > 0) s += `<path d="M${x},${y - r} A${r},${r} 0 ${p > .5 ? 1 : 0} 1 ${x2},${y2}" fill="none" stroke="${C.terra}" stroke-width="22" stroke-linecap="round"/>`;
  s += `<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Fraunces" font-size="${r * .62}" fill="${C.tinta}">10</text>`;
  s += `<text x="${x}" y="${y + r * .5}" text-anchor="middle" font-family="DM Sans" font-weight="600" font-size="${r * .22}" fill="${C.malva}">MIN</text>`;
  return s;
}
