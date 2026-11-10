// Shared bits for the mini arcade: game list, UI kit (title / HUD / result), camera shake, rotation ("연속 플레이") mode.
// UI follows hyper-casual conventions: minimal HUD (one big number), short how-to, one big pulsing CTA in the thumb zone,
// result sheet with a huge score and a single primary button.
(function () {
  const GAMES = [
    { id: 'softserve', file: 'softserve.html', name: '소프트콘 쌓기', emoji: '🍦', unit: '층', bestKey: 'softserve-best',
      desc: '콘을 들고 떨어지는 아이스크림 받기. 휙 움직이면 탑이 날아가요' },
    { id: 'skydive', file: 'skydive.html', name: '스카이다이빙 착지', emoji: '🪂', unit: '점', bestKey: 'skydive-best',
      desc: '새·UFO·로켓을 피해 낙하산 펴고 과녁 중앙에 착지' },
    { id: 'stock', file: 'stock.html', name: '고점 매도 챌린지', emoji: '📈', unit: '%', bestKey: 'stock-best',
      desc: '3D 캔들 차트! 팔고 나면 빨리감기로 진짜 고점 공개' },
    { id: 'moktak', file: 'moktak.html', name: '목탁 합주', emoji: '🪘', unit: '%', bestKey: 'moktak-best',
      desc: '스님들과 박자 맞춰 똑똑! 엇박이면 째려봄 주의' },
    { id: 'door', file: 'door.html', name: '밀당 도어', emoji: '🚪', unit: '개', bestKey: 'door-best',
      desc: '당기세요? 미세요? 문 보고 0.5초 안에 판단! 출근 시간이 줄어든다' },
    { id: 'elevator', file: 'elevator.html', name: '닫힘 버튼', emoji: '🛗', unit: '명', bestKey: 'elevator-best',
      desc: '부장님이 폰 볼 때만 닫힘 버튼 꾹. 눈 마주치면 끝장' },
    { id: 'halo', file: 'halo.html', name: '천사 만들기', emoji: '😇', unit: '명', bestKey: 'halo-best',
      desc: '고리 던지기! 머리 위에 헤일로를 씌우면 천사가 되어 승천' },
    { id: 'cine', file: 'cine.html', name: '씨네필 통역기', emoji: '🎬', unit: '개', bestKey: 'cine-best',
      desc: '옆자리 영화 고인물의 어려운 말, 쉬운 말로 빨리 번역하기' },
    { id: 'cat', file: 'cat.html', name: '냥 떨구기', emoji: '🐱', unit: '점', bestKey: 'cat-best',
      desc: '집사가 등 돌렸을 때 책상 위 물건 툭툭. 노트북은 대박 점수' },
    { id: 'soccer', file: 'soccer.html', name: '슛 말고!', emoji: '⚽', unit: '점', bestKey: 'soccer-best',
      desc: '캐스터가 "슛!!" 할 때 차면 키퍼가 막아요. 가끔 마법사·호우맨 같은 스타가 등장' },
    { id: 'inventory', file: 'inventory.html', name: '전리품 가방', emoji: '⚔️', unit: '점', bestKey: 'inventory-fit-best',
      desc: '주어진 전리품을 전부 넣으면 딱! 60초 안에 돌리고 맞춰 가방 정리' },
    { id: 'dialect', file: 'dialect.html', name: '사투리 통역사', emoji: '🗣️', unit: '개', bestKey: 'dialect-best',
      desc: '전국 길거리 인터뷰! 사투리를 낱말 카드로 표준어 번역' },
    { id: 'popcorn', file: 'popcorn.html', name: '카라멜 몰래 먹기', emoji: '🍿', unit: '점', bestKey: 'popcorn-best',
      desc: '여친이 영화 볼 때 카라멜 팝콘만 쏙쏙. 쳐다보면 일반 팝콘인 척' },
  ];

  const q = new URLSearchParams(location.search);
  const run = q.has('run')
    ? { i: +q.get('run') || 0, scores: (q.get('s') || '').split(',').filter(s => s !== '').map(Number) }
    : null;

  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;700;900&display=swap';
  document.head.appendChild(font);
  const style = document.createElement('style');
  style.textContent = `
    :root{--ink:#2b2438;--ink-soft:#6a6278;--accent:#ff5d8f;--accent-dark:#d63d6f}
    html,body{font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo",sans-serif}
    /* ---- HUD ---- */
    .hud{position:fixed;top:max(14px,env(safe-area-inset-top));left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;z-index:3}
    .hud-score{font-family:"Jua",sans-serif;font-size:76px;line-height:1;color:#fff;
      text-shadow:0 4px 0 rgba(43,36,56,.35),0 0 24px rgba(43,36,56,.25)}
    .hud-score small{font-size:28px;margin-left:4px}
    .hud-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:0 16px}
    .pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.92);color:var(--ink);border-radius:999px;
      padding:7px 14px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(30,20,50,.15)}
    .pill.dark{background:rgba(43,36,56,.88);color:#fff}
    /* ---- full screens ---- */
    .screen{position:fixed;inset:0;z-index:5;pointer-events:none;display:flex;flex-direction:column;align-items:center;
      padding:max(9vh,56px) 16px 0;box-sizing:border-box;background:linear-gradient(rgba(25,15,40,.0) 40%,rgba(25,15,40,.28))}
    .t-emoji{font-size:64px;line-height:1;filter:drop-shadow(0 6px 10px rgba(0,0,0,.2))}
    .t-title{font-family:"Jua",sans-serif;font-size:clamp(40px,10vw,60px);line-height:1.1;color:#fff;text-align:center;margin:8px 0 20px;
      text-shadow:0 4px 0 var(--accent-dark),0 10px 28px rgba(0,0,0,.25)}
    .t-how{margin:0;padding:14px 18px;background:rgba(255,255,255,.94);border-radius:20px;max-width:340px;width:100%;box-sizing:border-box;
      box-shadow:0 10px 30px rgba(30,20,50,.18)}
    .t-how li{list-style:none;display:flex;gap:12px;align-items:flex-start;margin:7px 0;font-size:15px;line-height:1.45;color:var(--ink)}
    .t-how li span:first-child{font-size:20px;line-height:1.1;flex:none;width:24px;text-align:center}
    .t-cta{position:fixed;left:50%;bottom:max(15vh,90px);transform:translateX(-50%);white-space:nowrap;
      font-family:"Jua",sans-serif;font-size:26px;color:#fff;background:var(--accent);padding:16px 42px;border-radius:999px;
      box-shadow:0 6px 0 var(--accent-dark),0 14px 30px rgba(0,0,0,.2);animation:ctaPulse 1.1s ease-in-out infinite}
    @keyframes ctaPulse{50%{transform:translateX(-50%) scale(1.07)}}
    .r-sheet{margin-top:auto;margin-bottom:max(10vh,64px);width:100%;max-width:380px;box-sizing:border-box;background:#fff;color:var(--ink);
      border-radius:28px;padding:24px 22px 20px;text-align:center;box-shadow:0 20px 50px rgba(30,20,50,.3);animation:sheetIn .35s cubic-bezier(.2,1.4,.4,1)}
    @keyframes sheetIn{from{transform:translateY(40px);opacity:0}}
    .r-emoji{font-size:40px;line-height:1}
    .r-label{font-size:14px;font-weight:700;color:var(--ink-soft);margin-top:6px}
    .r-score{font-family:"Jua",sans-serif;font-size:84px;line-height:1;margin:4px 0}
    .r-score small{font-size:30px;margin-left:2px}
    .r-score.up{color:#e03131} .r-score.down{color:#1971c2}
    .r-msg{font-size:15px;color:var(--ink);margin:4px 0 2px;line-height:1.45}
    .r-best{display:inline-block;margin-top:8px;background:#fff3bf;color:#8a6200;border-radius:999px;padding:5px 12px;font-weight:700;font-size:14px}
    .r-best.new{background:var(--accent);color:#fff}
    .rows{margin:14px 0 0;text-align:left;background:#f8f5fa;border-radius:16px;padding:4px 14px}
    .row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #ece6f1;font-size:15px;color:var(--ink)}
    .row:last-child{border:0}
    .row b{font-variant-numeric:tabular-nums}
    .r-btn{display:block;width:100%;margin-top:18px;border:0;cursor:pointer;background:var(--accent);color:#fff;font-family:"Jua",sans-serif;
      font-size:24px;padding:15px 0;border-radius:18px;box-shadow:0 5px 0 var(--accent-dark);pointer-events:auto}
    .r-btn:active{transform:translateY(3px);box-shadow:0 2px 0 var(--accent-dark)}
    /* ---- toast ---- */
    .toast{position:fixed;left:50%;top:30%;transform:translateX(-50%);pointer-events:none;opacity:0;z-index:6;
      background:var(--ink);color:#fff;border-radius:999px;padding:11px 22px;font-family:"Jua",sans-serif;font-size:24px;white-space:nowrap;
      box-shadow:0 8px 24px rgba(0,0,0,.25)}
    .toast.show{animation:toast 1.3s ease-out}
    @keyframes toast{0%{opacity:0;transform:translate(-50%,10px) scale(.8)}15%{opacity:1;transform:translate(-50%,0) scale(1.05)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-14px)}}
    body:has(.screen:not([style*="none"])) :is(.hud,.hud-ctl,#meter,#hint,#aim,#chat){visibility:hidden}
    /* ---- countdown ---- */
    .count{position:fixed;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;pointer-events:none;z-index:7;opacity:0;
      font-family:"Jua",sans-serif;font-size:min(42vw,200px);line-height:1;color:#fff;
      text-shadow:0 8px 0 var(--accent-dark),0 16px 40px rgba(0,0,0,.3)}
    .count.final{font-size:min(20vw,120px);color:#ffe066;text-shadow:0 7px 0 #e8590c,0 16px 40px rgba(0,0,0,.3)}
    .count.show{animation:countPop .8s ease-out forwards}
    .count.final.show{animation:countPop 1.1s ease-out forwards}
    @keyframes countPop{0%{opacity:0;transform:translateY(-50%) scale(2)}18%{opacity:1;transform:translateY(-50%) scale(.95)}30%{transform:translateY(-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-50%) scale(.9)}}
    /* ---- nav ---- */
    .arcade-btn{position:fixed;z-index:10;font:700 14px "Noto Sans KR",system-ui,sans-serif;border:0;border-radius:999px;padding:9px 14px;
      background:rgba(255,255,255,.92);color:var(--ink);text-decoration:none;box-shadow:0 4px 14px rgba(30,20,50,.18);cursor:pointer}
    .arcade-home{left:16px;bottom:max(16px,env(safe-area-inset-bottom))}
    .arcade-badge{right:16px;bottom:max(16px,env(safe-area-inset-bottom));background:rgba(43,36,56,.85);color:#fff;pointer-events:none}`;
  document.head.appendChild(style);

  const stop = e => e.stopPropagation();
  addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.hub !== undefined) return;
    const home = document.createElement('a');
    home.href = 'index.html'; home.textContent = '← 목록'; home.className = 'arcade-btn arcade-home';
    home.addEventListener('pointerdown', stop);
    document.body.appendChild(home);
    if (run) {
      const b = document.createElement('div');
      b.className = 'arcade-btn arcade-badge';
      b.textContent = `연속 플레이 ${run.i + 1} / ${GAMES.length}`;
      document.body.appendChild(b);
    }
  });

  // ---------- juicy SFX kit (all synthesized: envelopes + filtered noise + compressor + small room) ----------
  let actx, out, room, windNode;
  function A() {
    try {
      if (!actx) {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        const comp = actx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
        out = actx.createGain(); out.gain.value = .85; out.connect(comp).connect(actx.destination);
        const ir = actx.createBuffer(2, actx.sampleRate * .7, actx.sampleRate);
        for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); }
        const cv = actx.createConvolver(); cv.buffer = ir; room = actx.createGain(); room.gain.value = .18; room.connect(cv).connect(out);
      }
      if (actx.state === 'suspended') actx.resume();
    } catch {}
    return actx;
  }
  // iOS: let Web Audio play even with the silent switch on, and unlock on touchend/click (pointerdown alone doesn't count)
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
  let unlocked = false;
  function unlock() {
    if (!A()) return;
    if (!unlocked) { try { const b = actx.createBuffer(1, 1, 22050), s = actx.createBufferSource(); s.buffer = b; s.connect(actx.destination); s.start(0); unlocked = true; } catch {} }
    if (actx.state === 'suspended') actx.resume();
  }
  for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) addEventListener(ev, unlock, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && actx && actx.state !== 'running') actx.resume(); });
  const send = (node, wet = 1) => { node.connect(out); if (wet) { const w = actx.createGain(); w.gain.value = wet; node.connect(w).connect(room); } };
  function tone(type, f0, f1, dur, vol, { when = 0, attack = .004, wet = 1, vib = 0 } = {}) {
    if (!A()) return; const t = actx.currentTime + when;
    const o = actx.createOscillator(), g = actx.createGain(); o.type = type;
    o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    if (vib) { const l = actx.createOscillator(), lg = actx.createGain(); l.frequency.value = 6; lg.gain.value = vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + .05); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); send(g, wet); o.start(t); o.stop(t + dur + .05);
  }
  let noiseBuf;
  function noise(dur, vol, { type = 'bandpass', f0 = 1000, f1 = f0, q = 1, when = 0, attack = .003, wet = 1 } = {}) {
    if (!A()) return; const t = actx.currentTime + when;
    if (!noiseBuf) { noiseBuf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(f).connect(g); send(g, wet); s.start(t, Math.random()); s.stop(t + dur + .05);
  }
  const semi = n => Math.pow(2, n / 12);
  const sfx = {
    tap() { tone('sine', 1300, 900, .06, .25, { wet: .3 }); },
    tick() { tone('sine', 880, 860, .12, .35); noise(.02, .2, { f0: 4000, type: 'highpass' }); },
    go() { [0, 4, 7, 12].forEach((n, i) => tone('triangle', 523 * semi(n), 523 * semi(n), .5, .16, { when: i * .045 })); noise(.35, .2, { f0: 600, f1: 3000, q: .8 }); },
    // squishy cream plop; pitch rises with the tower
    pop(p = 1) { tone('sine', 560 * p, 170 * p, .16, .55, { wet: .4 }); tone('triangle', 1000 * p, 620 * p, .05, .14); noise(.05, .3, { type: 'lowpass', f0: 1800, f1: 500 }); },
    perfect(n = 0) { const b = 660 * semi(Math.min(n, 14)); [1, 1.26, 1.5, 2].forEach((r, i) => tone('triangle', b * r, b * r, .22, .17, { when: i * .045 })); tone('sine', b * 4, b * 4, .35, .05, { when: .18 }); },
    miss() { tone('triangle', 330, 120, .3, .3); noise(.12, .25, { type: 'lowpass', f0: 900 }); },
    splat() { tone('sine', 200, 60, .2, .5); noise(.25, .45, { type: 'lowpass', f0: 2500, f1: 300 }); },
    crash() { tone('sine', 140, 38, .6, .8, { wet: .6 }); noise(.7, .6, { type: 'lowpass', f0: 4000, f1: 150 }); noise(.15, .4, { f0: 2500, q: .5 }); },
    whoosh(up = false) { noise(.55, .35, { f0: up ? 300 : 2200, f1: up ? 2600 : 250, q: 1.6 }); },
    boing() { tone('sine', 140, 520, .35, .5, { vib: 25 }); tone('triangle', 280, 900, .25, .12); },
    coin() { tone('square', 988, 988, .07, .09, { wet: .4 }); tone('square', 1319, 1319, .28, .09, { when: .07, wet: .4 }); },
    kaching() { tone('sine', 90, 60, .09, .5, { wet: .2 }); noise(.08, .3, { type: 'highpass', f0: 3000, when: .02 }); tone('triangle', 1568, 1568, .5, .14, { when: .05 }); tone('triangle', 2093, 2093, .6, .12, { when: .1 }); noise(.4, .08, { type: 'highpass', f0: 7000, when: .1 }); },
    ding() { tone('sine', 1175, 1175, 1.6, .28); tone('sine', 2350, 2350, .9, .05); tone('sine', 932, 932, 1.8, .2, { when: .32 }); },
    hmm() { tone('triangle', 190, 240, .16, .22, { vib: 14, wet: .3 }); tone('triangle', 240, 300, .2, .2, { when: .17, vib: 14, wet: .3 }); },
    shout() { tone('sawtooth', 300, 230, .32, .1, { vib: 35, wet: .5 }); tone('square', 600, 470, .3, .04, { vib: 35, wet: .5 }); noise(.3, .18, { f0: 1300, q: 3, wet: .5 }); },
    crowd(level = 1) { noise(1.6, .28 * level, { type: 'bandpass', f0: 700, f1: 500, q: .5, attack: .15 }); noise(1.2, .12 * level, { type: 'highpass', f0: 3000, attack: .1 }); },
    kick() { tone('sine', 160, 50, .12, .7, { wet: .2 }); noise(.05, .4, { type: 'lowpass', f0: 2000 }); },
    thud() { tone('sine', 120, 45, .22, .7, { wet: .3 }); noise(.08, .35, { type: 'lowpass', f0: 500 }); },
    flap() { [0, .07, .14].forEach((w, i) => noise(.12, .45 - i * .1, { f0: 350 + i * 200, f1: 900, q: .7, when: w })); tone('sine', 90, 50, .3, .5, { when: .05 }); },
    splash() { noise(.6, .5, { type: 'lowpass', f0: 3000, f1: 300 }); for (let i = 0; i < 6; i++) tone('sine', 400 + Math.random() * 300, 900 + Math.random() * 600, .08, .12, { when: .1 + i * .06 }); },
    squawk() { tone('sawtooth', 1100, 700, .18, .12, { vib: 80 }); tone('sawtooth', 900, 600, .2, .1, { when: .12, vib: 80 }); },
    fanfare() { [0, 4, 7, 12].forEach((n, i) => tone('triangle', 523 * semi(n), 523 * semi(n), .3, .16, { when: i * .1 })); [0, 4, 7].forEach(n => tone('sawtooth', 523 * semi(n + 12), 523 * semi(n + 12), .9, .05, { when: .42 })); },
    fail() { [[392, 370], [370, 349], [349, 330], [330, 300]].forEach(([a, b], i) => tone('sawtooth', a / 2, b / 2, i < 3 ? .38 : .9, .13, { when: i * .4, vib: i === 3 ? 6 : 0, wet: .4 })); },
    // continuous rushing wind for freefall (level 0..1)
    wind(level) {
      if (!A()) return;
      if (!windNode) {
        if (!noiseBuf) noise(.01, 0);
        const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
        s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.Q.value = .6; g.gain.value = 0;
        s.connect(f).connect(g).connect(out); s.start(); windNode = { f, g };
      }
      windNode.g.gain.setTargetAtTime(level * .28, actx.currentTime, .15);
      windNode.f.frequency.setTargetAtTime(250 + level * 1100, actx.currentTime, .2);
    },
  };

  // ---------- 2D confetti overlay (works on top of any game) ----------
  let cfx, cctx, parts = [], cRaf = 0;
  function confetti({ x = innerWidth / 2, y = innerHeight / 2, count = 80, colors = ['#ff6b6b', '#ffd43b', '#51cf66', '#4dabf7', '#cc5de8'], emoji = null, power = 1, spread = Math.PI * 2, angle = -Math.PI / 2 } = {}) {
    if (!cfx) {
      cfx = document.createElement('canvas'); cfx.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:8';
      document.body.appendChild(cfx); cctx = cfx.getContext('2d');
    }
    const dpr = Math.min(devicePixelRatio, 2); cfx.width = innerWidth * dpr; cfx.height = innerHeight * dpr;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - .5) * spread, v = (6 + Math.random() * 10) * power;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
        c: colors[i % colors.length], e: emoji && Math.random() < .35 ? emoji[(Math.random() * emoji.length) | 0] : null, life: 1 });
    }
    if (!cRaf) cRaf = requestAnimationFrame(stepConfetti);
  }
  function stepConfetti() {
    const dpr = cfx.width / innerWidth; cctx.setTransform(dpr, 0, 0, dpr, 0, 0); cctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
    for (const p of parts) {
      p.vy += .35; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .006;
      cctx.save(); cctx.globalAlpha = Math.min(1, p.life * 3); cctx.translate(p.x, p.y); cctx.rotate(p.r);
      if (p.e) { cctx.font = '22px sans-serif'; cctx.fillText(p.e, -11, 8); }
      else { cctx.fillStyle = p.c; cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); }
      cctx.restore();
    }
    cRaf = parts.length ? requestAnimationFrame(stepConfetti) : 0;
    if (!parts.length) cctx.clearRect(0, 0, innerWidth, innerHeight);
  }

  let toastEl, shakeAmt = 0;
  window.Arcade = {
    GAMES, run, sfx, confetti,
    inRun: () => !!run,
    toast(text, color) {
      if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
      toastEl.textContent = text; toastEl.style.background = color || '';
      toastEl.classList.remove('show'); void toastEl.offsetWidth; toastEl.classList.add('show');
    },
    // ---- screen builders ----
    titleScreen({ emoji, title, how, cta = '탭해서 시작' }) {
      return `<div class="t-emoji">${emoji}</div><div class="t-title">${title}</div>
        <ul class="t-how">${how.map(([i, t]) => `<li><span>${i}</span><span>${t}</span></li>`).join('')}</ul>
        <div class="t-cta">${cta}</div>`;
    },
    resultScreen({ emoji, label, score, unit = '', tone = '', msg = '', rows = [], isBest = false, best, bestUnit = unit, cta = '다시 하기' }) {
      return `<div class="r-sheet">
        <div class="r-emoji">${emoji}</div>
        <div class="r-label">${label}</div>
        <div class="r-score ${tone}">${score}<small>${unit}</small></div>
        ${msg ? `<div class="r-msg">${msg}</div>` : ''}
        <div class="r-best ${isBest ? 'new' : ''}">${isBest ? '🎉 새 최고 기록!' : `🏆 최고 ${best}${bestUnit}`}</div>
        ${rows.length ? `<div class="rows">${rows.map(([a, b]) => `<div class="row"><span>${a}</span><b>${b}</b></div>`).join('')}</div>` : ''}
        ${run ? '' : `<div class="r-btn">${cta}</div>`}
      </div>`;
    },
    // ---- camera shake (call shake() on impact, applyShake() each frame after positioning the camera) ----
    shake(amount) {
      shakeAmt = Math.max(shakeAmt, amount);
      this.vibrate(Math.min(200, amount * 120));
    },
    vibrate(ms) {
      try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(Array.isArray(ms) ? ms : Math.max(1, Math.round(ms))); } catch {}
    },
    applyShake(camera, dt) {
      if (shakeAmt < .002) return;
      camera.position.x += (Math.random() - .5) * shakeAmt;
      camera.position.y += (Math.random() - .5) * shakeAmt;
      camera.position.z += (Math.random() - .5) * shakeAmt;
      shakeAmt *= Math.exp(-dt * 7);
    },
    // ---- big center countdown: 3, 2, 1, <final> ----
    countdown({ from = 3, final = 'GO!', onTick, onDone }) {
      let el = document.querySelector('.count');
      if (!el) { el = document.createElement('div'); el.className = 'count'; document.body.appendChild(el); }
      const show = (txt, big) => { el.textContent = txt; el.classList.toggle('final', !!big); el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); };
      let n = from;
      const step = () => {
        if (n > 0) { show(String(n)); onTick && onTick(n); n--; setTimeout(step, 800); }
        else { show(final, true); onTick && onTick(0); onDone && onDone(); setTimeout(() => el.classList.remove('show'), 1200); }
      };
      step();
    },
    // ---- rotation mode ----
    gameOver(score) {
      if (!run) return;
      const scores = [...run.scores, score];
      const next = run.i + 1;
      const url = next < GAMES.length
        ? `${GAMES[next].file}?run=${next}&s=${scores.join(',')}`
        : `index.html?done=${scores.join(',')}`;
      const btn = document.createElement('button');
      btn.className = 'r-btn';
      btn.textContent = next < GAMES.length ? `다음: ${GAMES[next].emoji} ${GAMES[next].name} ▶` : '결과 보기 🏆';
      btn.style.fontSize = '20px';
      btn.addEventListener('pointerdown', stop);
      btn.addEventListener('click', () => { location.href = url; });
      setTimeout(() => {
        const sheet = document.querySelector('.r-sheet');
        if (sheet) sheet.appendChild(btn);
        else { btn.style.cssText += ';position:fixed;left:16px;right:16px;bottom:80px;width:auto;z-index:10'; document.body.appendChild(btn); }
      }, 600);
    },
  };
})();
