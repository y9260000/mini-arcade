// Low-poly 3D thumbnail models shared by the hub (live hover) and tools/thumbs.html (static PNG render).
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .65, flatShading: true, ...o });
const glow = c => new THREE.MeshBasicMaterial({ color: c });
let G;   // current model group
function put(geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, p = G) { const o = new THREE.Mesh(geo, typeof m === 'number' ? mat(m) : m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; }
const box = (w, h, d, m, x, y, z, rx, ry, rz, p) => put(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz, p);
const cyl = (rt, rb, h, m, x, y, z, rx, ry, rz, p, seg = 12) => put(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, rx, ry, rz, p);
const sph = (r, m, x, y, z, p, ws = 12, hs = 9) => put(new THREE.SphereGeometry(r, ws, hs), m, x, y, z, 0, 0, 0, p);
const cone = (r, h, m, x, y, z, rx, ry, rz, p, seg = 10) => put(new THREE.ConeGeometry(r, h, seg), m, x, y, z, rx, ry, rz, p);
const tor = (r, t, m, x, y, z, rx, ry, rz, p, arc = Math.PI * 2) => put(new THREE.TorusGeometry(r, t, 8, 24, arc), m, x, y, z, rx, ry, rz, p);
const grp = (x = 0, y = 0, z = 0, p = G) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
// blocky little person (like the game characters)
function person(x, y, z, { body = 0x4dabf7, skin = 0xffd2a8, hair = 0x2b2b2b, s = 1, p = G } = {}) {
  const g = grp(x, y, z, p); g.scale.setScalar(s);
  box(.5, .6, .36, body, 0, .55, 0, 0, 0, 0, g); box(.18, .4, .2, 0x343a40, -.12, .12, 0, 0, 0, 0, g); box(.18, .4, .2, 0x343a40, .12, .12, 0, 0, 0, 0, g);
  box(.44, .44, .42, skin, 0, 1.08, 0, 0, 0, 0, g); box(.46, .14, .44, hair, 0, 1.33, -.02, 0, 0, 0, g);
  box(.06, .07, .02, 0x222222, -.1, 1.1, .215, 0, 0, 0, g); box(.06, .07, .02, 0x222222, .1, 1.1, .215, 0, 0, 0, g);
  return g;
}

function soccerBall(r) {   // white sphere with 12 black pentagon patches (at the icosahedron vertices)
  const g = new THREE.IcosahedronGeometry(r, 3).toNonIndexed(), pos = g.attributes.position, col = [];
  const P = (1 + Math.sqrt(5)) / 2, V = [[0, 1, P], [0, -1, P], [0, 1, -P], [0, -1, -P], [1, P, 0], [-1, P, 0], [1, -P, 0], [-1, -P, 0], [P, 0, 1], [-P, 0, 1], [P, 0, -1], [-P, 0, -1]].map(v => new THREE.Vector3(...v).normalize());
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    const m = a.add(b).add(c).normalize(), dark = V.some(v => v.dot(m) > .93);
    const k = dark ? .13 : 1; for (let j = 0; j < 3; j++) col.push(k, k, k);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5, flatShading: true }));
}
export const M = {
  softserve() {
    cone(.55, 1.5, 0xd9a05b, 0, -.55, 0, Math.PI, 0, 0);
    for (let i = 0; i < 3; i++) tor(.5 - i * .13, .2 - i * .03, i % 2 ? 0xffc9de : 0xfff4e6, 0, .32 + i * .3, 0, Math.PI / 2, 0, 0);
    cone(.16, .35, 0xfff4e6, 0, 1.25, 0); const ch = sph(.1, 0xe03131, .25, 1.05, .3);
    return t => { G.rotation.y = t * 1.6; ch.position.y = 1.05 + Math.abs(Math.sin(t * 5)) * .12; };
  },
  skydive() {
    const dome = put(new THREE.SphereGeometry(1.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ vertexColors: false, color: 0xff6b6b, flatShading: true, side: THREE.DoubleSide }), 0, .9, 0); dome.scale.y = .55;
    for (let i = 0; i < 10; i += 2) { const s = put(new THREE.SphereGeometry(1.21, 10, 6, i / 10 * Math.PI * 2, Math.PI / 5, 0, Math.PI / 2), mat(0xffffff, { side: THREE.DoubleSide }), 0, .9, 0); s.scale.y = .55; }
    for (const a of [-1, 1]) box(.02, 1.3, .02, 0x495057, a * .55, .2, 0, 0, 0, a * .35);
    const pp = person(0, -1.05, 0, { body: 0xfab005, s: .75 });
    return t => { G.rotation.z = Math.sin(t * 2.2) * .14; G.position.y = Math.sin(t * 1.4) * .12; pp.rotation.y = Math.sin(t * 3) * .5; };
  },
  stock() {
    const H = [.6, 1, .8, 1.5, 2.1], C = [0x40c057, 0xfa5252, 0x40c057, 0x40c057, 0x40c057];
    const bars = H.map((h, i) => box(.32, h, .32, C[i], -1 + i * .5, -1 + h / 2, 0));
    const arrow = grp(.35, .75, .3); box(1.9, .14, .14, 0xffd43b, 0, 0, 0, 0, 0, .55, arrow); cone(.22, .4, 0xffd43b, .82, .52, 0, 0, 0, -1.02, arrow);
    return t => { bars.forEach((b, i) => { const s = .55 + .45 * Math.abs(Math.sin(t * 2.6 + i * .7)); b.scale.y = s; b.position.y = -1 + H[i] * s / 2; }); arrow.position.set(.35 + Math.sin(t * 3) * .08, .75 + Math.sin(t * 3) * .1, .3); };
  },
  moktak() {
    const body = sph(.9, 0xb5702c, 0, -.1, 0, G, 14, 10); body.scale.set(1.15, .85, 1);
    box(1.2, .08, .3, 0x5c3a12, 0, -.05, .82);
    const st = grp(.75, .9, .3); st.rotation.z = -.7; cyl(.06, .06, 1.4, 0x8a5a2b, 0, 0, 0, 0, 0, 0, st); sph(.16, 0x8a5a2b, 0, .75, 0, st);
    const notes = []; for (let i = 0; i < 3; i++) { const n = grp(-.9 + i * .35, 1 + i * .2, 0); sph(.1, 0x845ef7, 0, 0, 0, n); box(.03, .35, .03, 0x845ef7, .09, .17, 0, 0, 0, 0, n); notes.push(n); }
    return t => { const k = (t * 1.6) % 1; st.rotation.z = -.7 + (k < .25 ? Math.sin(k / .25 * Math.PI) * .7 : 0); body.scale.set(1.15 + (k < .2 ? .05 : 0), .85, 1);
      notes.forEach((n, i) => { const u = (t * .7 + i / 3) % 1; n.position.set(-.9 + i * .35 + Math.sin(u * 6) * .08, .7 + u * 1, 0); n.scale.setScalar(Math.sin(u * Math.PI)); }); };
  },
  door() {
    box(1.5, 2.3, .2, 0x8a5a2b, 0, 0, -.1); box(1.25, 2.1, .1, 0x2b2438, 0, -.05, 0);
    const d = grp(-.62, 0, .05); d.rotation.y = -.75; box(1.2, 2.05, .1, 0xe8a87c, .6, -.05, 0, 0, 0, 0, d); sph(.08, 0xffd43b, 1.05, -.05, .08, d);
    box(.8, .35, .05, 0xffffff, .6, .55, .06, 0, 0, 0, d);
    return t => { d.rotation.y = -.75 + Math.sin(t * 2.6) * .7; };
  },
  elevator() {
    box(1.9, 2.2, .3, 0xadb5bd, 0, 0, -.1); box(1.56, 1.8, .05, glow(0xfff0c2), 0, -.1, .02); person(0, -1, .02, { body: 0x845ef7, s: .9 }); const dl = box(.78, 1.8, .1, 0xdee2e6, -.39, -.1, .12), dr = box(.78, 1.8, .1, 0xdee2e6, .39, -.1, .12); box(1.9, .2, .32, 0xadb5bd, 0, 1, .02); box(.17, 2.2, .32, 0xadb5bd, -.87, 0, .02); box(.17, 2.2, .32, 0xadb5bd, .87, 0, .02);
    const p = grp(1.2, .1, .1); box(.4, .9, .1, 0x495057, 0, 0, 0, 0, 0, 0, p);
    sph(.12, glow(0xffd43b), 0, .2, .07, p); sph(.12, glow(0xff6b6b), 0, -.2, .07, p);
    box(.8, .22, .05, 0x212529, 0, 1.2, .1);
    return t => { const o = Math.max(0, Math.sin(t * 2)) * .3; dl.position.x = -.39 - o; dr.position.x = .39 + o; dl.scale.x = dr.scale.x = 1 - o * .9; dl.position.x += o * .35; dr.position.x -= o * .35; };
  },
  halo() {
    person(0, -1.1, 0, { body: 0xffffff, hair: 0xfab005, s: 1.2 });
    const ring = tor(.42, .09, glow(0xffe066), 0, 1.15, 0, Math.PI / 2 - .7, 0, 0);
    const wings = [-1, 1].map(s => { const w = sph(.5, 0xffffff, s * .6, .05, -.3); w.scale.set(.5, .9, .2); w.rotation.z = s * .4; return w; });
    return t => { ring.position.y = 1.15 + Math.sin(t * 3) * .08; ring.rotation.z = t * 2; wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * (.4 + Math.sin(t * 9) * .35)); G.position.y = Math.sin(t * 2) * .1; };
  },
  cine() {   // 전문가 통역기: expert, speech bubble with jargon, floating domain props
    const p = person(-.5, -1.1, 0, { body: 0x1c1c22, hair: 0x3a2a20, s: 1.05 }); p.rotation.y = .4;
    const cap = cyl(.27, .25, .1, 0x8b1e2d, 0, 1.43, 0, 0, 0, .18, p);
    const b = grp(.55, .55, 0); box(1.1, .7, .14, 0xffffff, 0, 0, 0, 0, 0, 0, b); cone(.14, .3, 0xffffff, -.38, -.44, 0, 0, 0, .5, b, 4);
    box(.5, .1, .02, 0x7048e8, -.15, .12, .08, 0, 0, 0, b); box(.7, .08, .02, 0xadb5bd, 0, -.08, .08, 0, 0, 0, b);
    const items = [];
    const glass = grp(.95, -.45, .3); cyl(.1, .04, .18, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .55 }), 0, .2, 0, 0, 0, 0, glass); cyl(.08, .06, .07, 0x7a0f1f, 0, .16, 0, 0, 0, 0, glass); cyl(.012, .012, .16, 0xdee2e6, 0, .03, 0, 0, 0, 0, glass); items.push(glass);
    const chart = grp(.3, -.7, .4); [.12, .22, .16, .3].forEach((h, i) => box(.07, h, .07, i === 2 ? 0xfa5252 : 0x40c057, -.12 + i * .09, h / 2, 0, 0, 0, 0, chart)); items.push(chart);
    const cup = grp(1.2, .05, .2); cyl(.09, .07, .13, 0xffffff, 0, 0, 0, 0, 0, 0, cup); cyl(.07, .07, .01, 0xb5702c, 0, .066, 0, 0, 0, 0, cup); items.push(cup);
    return t => { items.forEach((it, i) => { it.position.y += Math.sin(t * 2.4 + i * 2) * .004; it.rotation.y = Math.sin(t * 1.5 + i) * .5; }); b.scale.setScalar(1 + Math.sin(t * 4) * .04); p.rotation.y = .4 + Math.sin(t * 2) * .15; };
  },

  cat() {
    const c = grp(0, -.4, 0);
    const b = sph(.75, 0xffa94d, 0, 0, 0, c); b.scale.set(1, .8, .9);
    box(.7, .62, .6, 0xffa94d, 0, .85, .2, 0, 0, 0, c);
    for (const s of [-1, 1]) { cone(.15, .3, 0xffa94d, s * .22, 1.25, .2, 0, 0, 0, c, 4); box(.1, .1, .02, 0x222222, s * .15, .9, .51, 0, 0, 0, c); }
    box(.08, .06, .02, 0xff8787, 0, .8, .51, 0, 0, 0, c);
    const tail = cyl(.08, .08, .9, 0xffa94d, -.7, .3, -.2, 0, 0, .8, c);
    box(1.6, .2, .9, 0xe8a87c, 0, -.85, 0); const cup = cyl(.18, .14, .3, 0xd0ebff, .55, -.6, .1, 0, 0, 0, G);
    return t => { tail.rotation.z = .8 + Math.sin(t * 6) * .4; c.rotation.z = Math.sin(t * 1.5) * .06; const k = (t * .5) % 1; cup.position.x = .55 + Math.max(0, k - .6) * 4; cup.rotation.z = -Math.max(0, k - .6) * 6; };
  },
  soccer() {
    const bg = grp(.2, -.1, 0); const ball = soccerBall(.75); ball.castShadow = true; bg.add(ball);
    const net = grp(-.7, .2, -.8); box(2, .08, .08, 0xffffff, 0, 1, 0, 0, 0, 0, net); box(.08, 1.6, .08, 0xffffff, -1, .2, 0, 0, 0, 0, net); box(.08, 1.6, .08, 0xffffff, 1, .2, 0, 0, 0, 0, net);
    const stars = []; for (let s = 0; s < 3; s++) stars.push(cone(.06, .3, 0xffd43b, -.6 + s * .3, .9 + s * .1, .3, 0, 0, 0, G, 4));
    return t => { bg.rotation.z = -t * 3; bg.position.y = -.1 + Math.abs(Math.sin(t * 3)) * .35; stars.forEach((s, i) => s.scale.setScalar(.6 + Math.abs(Math.sin(t * 5 + i)) * .8)); };
  },
  inventory() {
    box(1.7, 1.1, .7, 0x8a5a2b, 0, -.5, 0); box(1.75, .25, .75, 0x5c3a12, 0, .1, 0); box(.3, .4, .05, 0xffd43b, 0, -.2, .38);
    const sw = grp(-.35, .9, 0); sw.rotation.z = .5; box(.16, 1.3, .06, 0xdee2e6, 0, .4, 0, 0, 0, 0, sw); box(.5, .1, .12, 0xfab005, 0, -.25, 0, 0, 0, 0, sw); box(.1, .35, .1, 0x5c3a12, 0, -.48, 0, 0, 0, 0, sw);
    const pot = grp(.5, .55, .1); sph(.28, 0xe03131, 0, 0, 0, pot); cyl(.08, .1, .2, 0xadb5bd, 0, .3, 0, 0, 0, 0, pot);
    const gem = put(new THREE.OctahedronGeometry(.22, 0), glow(0x3bc9db), .05, .45, .3);
    return t => { gem.rotation.y = t * 3; gem.position.y = .45 + Math.sin(t * 3) * .1; sw.rotation.z = .5 + Math.sin(t * 2.5) * .2; pot.position.y = .55 + Math.abs(Math.sin(t * 4)) * .12; };
  },
  dialect() {
    person(-.55, -1.1, 0, { body: 0x845ef7, hair: 0xdee2e6, s: 1 });
    const b = grp(.55, .6, 0); box(1.1, .7, .2, 0xffffff, 0, 0, 0, 0, 0, 0, b); cone(.15, .3, 0xffffff, -.35, -.45, 0, 0, 0, .5, b, 4);
    const dots = [0, 1, 2].map(i => sph(.08, 0x845ef7, -.3 + i * .3, 0, .12, b));
    const mic = grp(.6, -.5, .3); mic.rotation.z = -.4; cyl(.06, .05, .6, 0x343a40, 0, 0, 0, 0, 0, 0, mic); sph(.17, 0x868e96, 0, .38, 0, mic);
    return t => { dots.forEach((d, i) => d.position.y = Math.max(0, Math.sin(t * 7 - i * .8)) * .12); b.scale.setScalar(1 + Math.sin(t * 3) * .04); mic.rotation.z = -.4 + Math.sin(t * 2) * .15; };
  },
  popcorn() {
    const bk = cyl(.75, .55, 1.4, 0xffffff, 0, -.4, 0, 0, 0, 0, G, 10);
    for (let i = 0; i < 5; i++) box(.18, 1.42, .02, 0xe03131, Math.cos(i * 1.26) * .64, -.4, Math.sin(i * 1.26) * .64, 0, -i * 1.26 + Math.PI / 2, 0);
    const pops = []; for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28, r = Math.random() * .6, y = .38 + Math.random() * .35; pops.push([sph(.15 + Math.random() * .06, i % 3 ? 0xfff3bf : 0xd9a05b, Math.cos(a) * r, y, Math.sin(a) * r, G, 5, 4), y, Math.random() * 6]); }
    const h = grp(.85, .75, .2); h.rotation.z = .7; box(.32, .4, .25, 0xffd2a8, 0, 0, 0, 0, 0, 0, h); box(.1, .3, .1, 0xffd2a8, -.08, .3, 0, 0, 0, 0, h);
    return t => { pops.forEach(([m, y, ph]) => { const k = (t * 1.3 + ph) % 3; m.position.y = y + (k < .5 ? Math.sin(k * 2 * Math.PI) * .35 : 0); }); h.position.set(.85 - Math.max(0, Math.sin(t * 1.8)) * .35, .75, .2); };
  },
  shop() {
    const bag = grp(); box(1.4, 1.3, .6, 0xff8fb1, 0, -.4, 0, 0, 0, 0, bag); tor(.35, .07, 0xd6336c, 0, .35, 0, 0, 0, 0, bag, Math.PI);
    const pp = person(.95, -1.1, .3, { body: 0x2f9e44, hair: 0x6b4f3a, s: .75 });
    const bub = grp(.95, .65, .3); box(.6, .4, .1, 0xffffff, 0, 0, 0, 0, 0, 0, bub); const bd = [-.15, 0, .15].map(x => sph(.06, 0x2f9e44, x, 0, .07, bub));
    return t => { bag.position.y = Math.abs(Math.sin(t * 2.5)) * .1; pp.position.x = .95 + Math.sin(t * 2) * .12; bd.forEach((d, i) => d.position.y = Math.max(0, Math.sin(t * 7 - i)) * .08); };
  },
  sake() {
    const pts = [[0, 0], [.42, 0], [.5, .12], [.52, .5], [.42, .85], [.2, 1.1], [.12, 1.3], [.13, 1.55], [.19, 1.62], [0, 1.62]].map(([r, y]) => new THREE.Vector2(r, y));
    const bottle = put(new THREE.LatheGeometry(pts, 14), mat(0xf8f0e3), -.5, -1, 0, 0, 0, .12);
    const lab = put(new THREE.CylinderGeometry(.53, .53, .38, 14, 1, true, -.9, 1.8), mat(0x364fc7, { side: THREE.DoubleSide }), -.5 + .05, -.6, 0, 0, 0, .12);
    tor(.15, .03, 0xe03131, -.5 + .14, .25, 0, Math.PI / 2, 0, .12);
    const masu = grp(.6, -.78, .2); box(.85, .45, .85, 0xe0b97a, 0, 0, 0, 0, 0, 0, masu); box(.72, .05, .72, 0xd0ebff, 0, .2, 0, 0, 0, 0, masu);
    const drops = [0, 1, 2, 3].map(i => sph(.05, 0xa5d8ff, 0, 0, .2));
    return t => { bottle.rotation.z = lab.rotation.z = .12 - Math.max(0, Math.sin(t * 1.5)) * .45; drops.forEach((d, i) => { const u = (t * 1.5 + i / 4) % 1; d.position.set(-.2 + u * .75, .2 - u * u * .8, .2); d.visible = Math.sin(t * 1.5) > .2; }); };
  },
  radio() {
    const e = sph(.55, 0x339af0, -.75, -.4, 0, G, 12, 8); sph(.25, 0x51cf66, -.85, -.25, .38, G, 6, 4).scale.z = .4;
    const m = sph(.35, 0xdee2e6, .85, .65, 0, G, 10, 7);
    const sat = grp(.1, .1, .2); sat.rotation.z = .4; box(.3, .3, .3, 0xadb5bd, 0, 0, 0, 0, 0, 0, sat); box(.9, .08, .3, 0x364fc7, 0, 0, 0, 0, 0, 0, sat);
    const dish = put(new THREE.SphereGeometry(.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 3), mat(0xffffff, { side: THREE.DoubleSide }), 0, .25, 0, 0, 0, 0, sat);
    for (const [a, b] of [[[-.6, -.2], [.05, .05]], [[.15, .2], [.7, .55]]]) { const dx = b[0] - a[0], dy = b[1] - a[1]; box(Math.hypot(dx, dy), .05, .05, glow(0xffe066), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, .2, 0, 0, Math.atan2(dy, dx)); }
    const tw = []; for (let i = 0; i < 12; i++) tw.push(sph(.03, glow(0xffffff), (Math.random() - .5) * 3, (Math.random() - .5) * 2, -.8, G, 4, 3));
    return t => { sat.rotation.z = .4 + Math.sin(t * 2) * .25; e.rotation.y = t; m.rotation.y = -t * .7; tw.forEach((s, i) => s.scale.setScalar(.5 + Math.abs(Math.sin(t * 3 + i)))); };
  },
  tower() {
    const C = [0xffd8a8, 0xa5d8ff, 0xd0bfff, 0xffc9c9, 0xb2f2bb];
    C.forEach((c, i) => { const f = box(1.1 - i * .04, .38, .9, c, (i % 2 ? .08 : -.05), -1 + i * .4, 0); for (let k = 0; k < 3; k++) box(.18, .16, .02, 0x4dabf7, -.3 + k * .3, -1 + i * .4, .46); });
    const cr = grp(0, 1.3, 0); box(2, .08, .08, 0xfab005, .4, 0, 0, 0, 0, 0, cr);
    const sw = grp(1.1, 0, 0, cr); box(.04, .5, .04, 0x495057, 0, -.25, 0, 0, 0, 0, sw); box(.6, .3, .7, 0xffd8a8, 0, -.65, 0, 0, 0, 0, sw);
    return t => { sw.rotation.z = Math.sin(t * 2.4) * .35; sw.position.x = .2 + Math.sin(t * 1.2) * .9; };
  },
  inspect() {
    const h = grp(-.2, -.6, 0); box(1.3, .9, 1, 0xfff4e6, 0, 0, 0, 0, 0, 0, h); const roof = cone(1, .6, 0xe03131, 0, .75, 0, 0, Math.PI / 4, 0, h, 4); roof.scale.set(1, 1, .8);
    box(.3, .45, .02, 0x8a5a2b, 0, -.22, .51, 0, 0, 0, h); box(.25, .22, .02, 0x74c0fc, .4, .1, .51, 0, 0, 0, h);
    const mold = sph(.12, 0x5c940d, -.4, .15, .52, h, 6, 4); mold.scale.z = .2;
    const lens = grp(.6, .25, .6); lens.rotation.z = -.6; tor(.4, .08, 0x343a40, 0, 0, 0, 0, 0, 0, lens); const gl = put(new THREE.CircleGeometry(.38, 18), new THREE.MeshStandardMaterial({ color: 0xd0ebff, transparent: true, opacity: .55 }), 0, 0, 0, 0, 0, 0, lens);
    box(.14, .7, .14, 0x8a5a2b, 0, -.75, 0, 0, 0, 0, lens);
    return t => { lens.position.set(-.2 + Math.cos(t * 1.6) * .6, .05 + Math.sin(t * 1.6) * .35, .6); mold.scale.setScalar(1 + Math.max(0, Math.sin(t * 6)) * .5); mold.scale.z = .2; };
  },
  bus() {
    const b = grp(0, -.3, 0); box(2.4, 1.1, 1, 0x339af0, 0, 0, 0, 0, 0, 0, b); box(2.42, .15, 1.02, 0xffffff, 0, -.25, 0, 0, 0, 0, b);
    for (let i = 0; i < 4; i++) box(.42, .38, .02, 0xd0ebff, -.8 + i * .55, .22, .51, 0, 0, 0, b);
    const wh = [-.75, .75].map(x => cyl(.24, .24, 1.06, 0x212529, x, -.55, 0, Math.PI / 2, 0, 0, b, 8));
    sph(.1, glow(0xffe066), 1.2, -.15, .4, b);
    const ln = [0, 1, 2].map(i => box(.4, .05, .05, 0xadb5bd, -1.6 - i * .15, -.1 + i * .2, 0));
    return t => { b.position.y = -.3 + Math.abs(Math.sin(t * 8)) * .05; b.rotation.z = Math.sin(t * 1.7) * .05; wh.forEach(w => w.rotation.y = -t * 8);
      ln.forEach((l, i) => { const u = (t * 2 + i / 3) % 1; l.position.x = -1.4 - u * .8; l.scale.x = 1 - u; }); };
  },
  court() {
    const tw = grp(0, -.6, 0); box(1.9, .5, 1, 0x343a40, 0, 0, 0, 0, 0, 0, tw);
    const keys = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) keys.push(cyl(.09, .09, .06, 0xf8f9fa, -.65 + c * .26 + r * .06, .27, -.25 + r * .22, 0, 0, 0, tw));
    box(1.4, .9, .05, 0xfffef8, 0, .55, -.35, -.25, 0, 0, tw);
    for (let i = 0; i < 3; i++) box(.9 - i * .2, .05, .02, 0x868e96, -.1, .75 - i * .18, -.3, -.25, 0, 0, tw);
    const gv = grp(.9, .7, .3); gv.rotation.z = -.6; cyl(.16, .16, .45, 0x8a5a2b, 0, 0, 0, 0, 0, Math.PI / 2, gv); box(.08, .6, .08, 0x8a5a2b, 0, -.35, 0, 0, 0, 0, gv);
    return t => { keys.forEach((k, i) => k.position.y = .27 - (Math.sin(t * 14 + i * 1.7) > .7 ? .05 : 0)); const k = (t * 1.1) % 1; gv.rotation.z = -.6 + (k < .2 ? Math.sin(k / .2 * Math.PI) * .9 : 0); };
  },
  fight() {
    const a = person(-.6, -1.1, 0, { body: 0x4dabf7, s: 1.05 }); a.rotation.y = .9;
    const b = person(.65, -1.1, 0, { body: 0xf8f9fa, hair: 0xadb5bd, s: 1.05 }); b.rotation.y = -.9;
    const ball = sph(.28, glow(0x66d9e8), 0, .45, .3, G, 10, 8); const halo = sph(.45, new THREE.MeshBasicMaterial({ color: 0x66d9e8, transparent: true, opacity: .35 }), 0, .45, .3, G, 10, 8);
    const sp = []; for (let i = 0; i < 6; i++) sp.push(put(new THREE.OctahedronGeometry(.07, 0), glow(0xffd43b), 0, 0, .4));
    return t => { const k = (t * .9) % 1, x = -.25 + k * .7; ball.position.x = halo.position.x = x; halo.scale.setScalar(1 + Math.sin(t * 20) * .15);
      a.position.y = -1.1 + Math.abs(Math.sin(t * 6)) * .05; b.position.x = .65 + (k > .8 ? (k - .8) * 1.2 : 0); b.rotation.z = k > .8 ? -(k - .8) * 2 : 0;
      sp.forEach((s, i) => { const u = (t * 2 + i / 6) % 1; s.position.set(x + Math.cos(i) * u * .5, .45 + Math.sin(i * 2) * u * .5, .4); s.scale.setScalar(1 - u); s.rotation.y = t * 5; }); };
  },
  checkout() {
    const ph = grp(0, -.1, 0); ph.rotation.z = -.15; box(1.15, 2, .14, 0x16171a, 0, 0, 0, 0, 0, 0, ph); box(1.02, 1.85, .02, 0xffffff, 0, 0, .08, 0, 0, 0, ph);
    box(.85, .22, .02, 0xf03e3e, 0, -.7, .1, 0, 0, 0, ph);
    const ad = grp(.35, .3, .35); ad.rotation.z = .12; box(.9, .7, .05, 0x7048e8, 0, 0, 0, 0, 0, 0, ad); sph(.09, 0xffffff, .38, .28, .04, ad);
    const ad2 = grp(-.35, -.05, .45); ad2.rotation.z = -.2; box(.7, .55, .05, 0xf76707, 0, 0, 0, 0, 0, 0, ad2);
    const cart = grp(.65, -.75, .55); box(.5, .3, .3, 0xffd43b, 0, 0, 0, 0, 0, 0, cart); cyl(.06, .06, .05, 0x212529, -.15, -.2, .15, Math.PI / 2, 0, 0, cart); cyl(.06, .06, .05, 0x212529, .15, -.2, .15, Math.PI / 2, 0, 0, cart);
    return t => { const k = (t * .8) % 2; ad.scale.setScalar(k < 1 ? Math.min(1, k * 4) : Math.max(0, 1 - (k - 1) * 4)); ad2.scale.setScalar(k > .5 && k < 1.5 ? Math.min(1, (k - .5) * 4) : Math.max(0, 1 - Math.abs(k - 1.5) * 4) * (k >= 1.5 ? 1 : 0)); cart.position.x = .65 + Math.sin(t * 3) * .08; cart.rotation.z = Math.sin(t * 6) * .08; };
  },
  nag() {   // 명절 잔소리: grandma with a speech bubble, nephew sweating, 송편 plate
    const g = person(-.55, -1.1, 0, { body: 0xae3ec9, hair: 0xdee2e6, s: 1.05 }); g.rotation.y = .5;
    sph(.16, 0xdee2e6, -.12, 1.42, -.1, g, 8, 6);   // hair bun
    const k = person(.75, -1.1, .2, { body: 0x4dabf7, hair: 0x2b2b2b, s: .8 }); k.rotation.y = -.6;
    const sw = sph(.07, 0x74c0fc, .2, 1.1, .2, k, 8, 6); sw.scale.y = 1.5;
    const b = grp(.05, .7, .2); box(.9, .5, .12, 0xffffff, 0, 0, 0, 0, 0, 0, b); cone(.12, .26, 0xffffff, -.3, -.32, 0, 0, 0, .5, b, 4);
    box(.12, .3, .02, 0xe03131, -.18, 0, .07, 0, 0, 0, b); box(.12, .12, .02, 0xe03131, -.18, -.2, .07, 0, 0, 0, b); box(.12, .3, .02, 0xe03131, .1, 0, .07, 0, 0, 0, b); box(.12, .12, .02, 0xe03131, .1, -.2, .07, 0, 0, 0, b);
    const env = box(.3, .2, .03, 0xe03131, .6, -.75, .7, 0, 0, .2); box(.1, .06, .035, 0xffd43b, .6, -.72, .71, 0, 0, .2);
    cyl(.28, .28, .05, 0xffffff, -.1, -1.05, .7, 0, 0, 0, G, 16); [0xffffff, 0xb2f2bb, 0xffc9de].forEach((c, i) => { const s2 = sph(.07, c, -.2 + i * .1, -1, .7, G, 8, 6); s2.scale.set(1.4, .8, .9); });
    return t => { b.scale.setScalar(1 + Math.abs(Math.sin(t * 5)) * .08); g.rotation.z = Math.sin(t * 6) * .05; k.position.y = -1.1 - Math.abs(Math.sin(t * 2)) * .05; sw.position.y = 1.1 - (t * .6 % .5); };
  },
  dice() {   // random-play die: rounded white cube with pips
    const d = grp(); d.rotation.set(.55, .75, .1);
    const g = new THREE.BoxGeometry(1.6, 1.6, 1.6, 10, 10, 10), p = g.attributes.position, v = new THREE.Vector3(), cl = new THREE.Vector3(), A = .56, RR = .24;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); cl.set(Math.max(-A, Math.min(A, v.x)), Math.max(-A, Math.min(A, v.y)), Math.max(-A, Math.min(A, v.z))); v.sub(cl).normalize().multiplyScalar(RR).add(cl); p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals();
    d.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .35 })));
    const pip = (x, y, z, c = 0x212529) => { const m = sph(.15, c, x, y, z, d, 12, 8); m.scale.set(Math.abs(x) > .7 ? .3 : 1, Math.abs(y) > .7 ? .3 : 1, Math.abs(z) > .7 ? .3 : 1); };
    pip(0, 0, .79, 0xf03e3e);                                                       // front: 1
    pip(.79, .36, .36); pip(.79, 0, 0); pip(.79, -.36, -.36);                      // right: 3
    for (const [a, b] of [[-.34, -.34], [-.34, .34], [.34, -.34], [.34, .34]]) pip(a, .79, b);   // top: 4
    G.userData.noShadow = true;
    return t => { d.rotation.set(.55 + (t - 1) * 2.2, .75 + (t - 1) * 3, .1); };
  },
  favicon() {   // console gamepad in brand blue
    const pad = grp(); pad.rotation.x = .55;
    const shape = new THREE.Shape(); const W = 1.25, H = .62;
    shape.moveTo(-W + .35, H); shape.lineTo(W - .35, H); shape.quadraticCurveTo(W + .15, H, W + .2, .1); shape.quadraticCurveTo(W + .3, -.75, W - .05, -.9);
    shape.quadraticCurveTo(W - .35, -1.02, W - .55, -.55); shape.lineTo(-W + .55, -.55); shape.quadraticCurveTo(-W + .35, -1.02, -W + .05, -.9);
    shape.quadraticCurveTo(-W - .3, -.75, -W - .2, .1); shape.quadraticCurveTo(-W - .15, H, -W + .35, H);
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .42, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 4, curveSegments: 18 }), new THREE.MeshStandardMaterial({ color: 0x2d6ff0, roughness: .4 }));
    body.position.z = -.21; pad.add(body);
    const top = .36;
    // d-pad
    const dp = grp(-.72, .02, top, pad); box(.46, .15, .08, 0x1e2532, 0, 0, 0, 0, 0, 0, dp); box(.15, .46, .08, 0x1e2532, 0, 0, 0, 0, 0, 0, dp);
    // face buttons
    [[.72, .22, 0xffd43b], [.94, 0, 0xff5252], [.5, 0, 0x51cf66], [.72, -.22, 0x74c0fc]].forEach(([x, y, c]) => { const b = cyl(.1, .1, .1, c, x, y, top, Math.PI / 2, 0, 0, pad, 16); });
    // sticks
    for (const x of [-.32, .32]) { cyl(.13, .15, .08, 0x1e2532, x, -.38, top, Math.PI / 2, 0, 0, pad, 16); cyl(.11, .11, .04, 0x343a40, x, -.38, top + .06, Math.PI / 2, 0, 0, pad, 16); }
    // start/select
    box(.14, .05, .04, 0xe9ecef, -.13, .25, top, 0, 0, 0, pad); box(.14, .05, .04, 0xe9ecef, .13, .25, top, 0, 0, 0, pad);
    G.userData.noShadow = true; G.userData.front = true;
    return t => { pad.rotation.set(.55 + Math.sin(t * 2) * .08, Math.sin(t * 1.4) * .15, Math.sin(t * 1.7) * .06); };
  },


};


// Build a ready-to-render stage for a model. Same framing as the static PNGs.
export function stage(id, w, h) {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b8d0, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd4ff, .8); rim.position.set(-4, 2, -3); scene.add(rim);
  G = new THREE.Group(); scene.add(G); const anim = M[id]();
  const model = G, bb = new THREE.Box3().setFromObject(G), size = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
  const pivot = new THREE.Group(); scene.remove(G); pivot.add(G); G.position.sub(c);
  const outer = new THREE.Group(); outer.add(pivot); scene.add(outer); outer.rotation.set(G.userData.front ? .08 : .32, G.userData.front ? -.15 : -.45, 0);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x0b1a3a, transparent: true, opacity: .16 }));
  sh.visible = !G.userData.noShadow; sh.rotation.x = -Math.PI / 2; sh.scale.set(size.x * .55, size.z * .55 + .2, 1); sh.position.y = -size.y / 2 - .02; outer.add(sh);
  const aspect = w / h, cam = new THREE.PerspectiveCamera(30, aspect, .1, 100);
  const r = Math.max(size.x, size.y, size.z) * .62, dist = r / Math.tan(THREE.MathUtils.degToRad(15)) * (aspect < 1.2 ? 1.2 : 1.12);
  cam.position.set(0, -size.y * .06, dist); cam.lookAt(0, -size.y * .06, 0);
  const base = c.clone();
  // tick(t): model's own animation + a gentle turntable sway
  const tick = t => {
    model.position.set(0, 0, 0); model.rotation.set(0, 0, 0);
    if (anim) anim(t);
    model.position.sub(base);
    outer.rotation.y = (G.userData.front ? -.15 : -.45) + Math.sin(t * 1.3) * .32;
  };
  return { scene, camera: cam, tick };
}
export { THREE };
