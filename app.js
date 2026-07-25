// ===== Golf Journal =====
// All data is saved in your browser's localStorage — no account needed.

const STORAGE_KEY = "golf-journal-rounds";

// ---- Data ----

function loadRounds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // First visit on this device: seed the demo round so there's something to explore.
    // (Deleting it saves an empty list, so it won't come back.)
    if (stored == null && typeof EXAMPLE_ROUND !== "undefined") return [EXAMPLE_ROUND];
    return JSON.parse(stored) || [];
  } catch {
    return [];
  }
}

function saveRounds() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
}

function newHole() {
  return {
    par: 4,
    yards: null,     // hole yardage from the selected tees (null for custom rounds)
    fir: false,      // fairway in regulation (hidden on par 3s)
    tee: null,       // where the tee shot finished: {x, y} on the fairway target
    approach: "",    // approach distance in yards
    club: "",        // club used for the approach
    shot: null,      // where the approach finished: {x, y} on the shot-tracker target
    gir: false,      // green in regulation
    upDown: false,   // scrambling up & down
    putts: null,
    score: null,
    notes: "",
  };
}

// template (optional): array of {par, yards} to prefill from a saved course
function newRound(course, date, numHoles, template, tee, startHole) {
  return {
    id: Date.now().toString(),
    course: course || "Unnamed course",
    date,
    tee: tee || null,
    startHole: startHole || 1, // 10 for back-nine rounds
    holes: Array.from({ length: numHoles }, (_, i) => {
      const h = newHole();
      if (template) {
        h.par = template[i].par;
        h.yards = template[i].yards;
      }
      return h;
    }),
  };
}

let rounds = loadRounds();

// view = { name: "home" } | { name: "setup" } |
//        { name: "round", roundId, tab: "hole"|"card", holeIndex }
let view = { name: "home" };

function currentRound() {
  return rounds.find((r) => r.id === view.roundId);
}

// Display number for a hole (back-nine rounds start at 10)
function holeNo(round, idx) {
  return (round.startHole || 1) + idx;
}

// ---- Stats helpers ----

function roundStats(round) {
  const played = round.holes.filter((h) => h.score != null);
  const score = played.reduce((s, h) => s + h.score, 0);
  const par = played.reduce((s, h) => s + h.par, 0);
  const firChances = played.filter((h) => h.par > 3).length;
  const fir = played.filter((h) => h.par > 3 && h.fir).length;
  const gir = played.filter((h) => h.gir).length;
  const putts = played.reduce((s, h) => s + (h.putts || 0), 0);
  const upDowns = played.filter((h) => h.upDown).length;
  return { played: played.length, score, par, toPar: score - par, fir, firChances, gir, putts, upDowns };
}

// ---- Performance benchmarks (from David's paper journal) ----
// Values by handicap level: 0, 5, 10, 15, 20, 25.
// "Make % from 0-6 ft" is on the journal page but omitted here — the app
// doesn't track putt distances (yet).

const BENCH_HCPS = [0, 5, 10, 15, 20, 25];
const BENCHMARKS = [
  { key: "fir",       label: "FIR %",       pct: true, monotonic: false, values: [50, 51, 50, 47, 45, 50] },
  { key: "gir",       label: "GIR %",       pct: true, monotonic: true,  values: [59, 41, 35, 23, 16, 9] },
  { key: "upDown",    label: "Up & Down %", pct: true, monotonic: true,  values: [54, 47, 40, 35, 32, 24] },
  { key: "threePutt", label: "3-Putt %",    pct: true, monotonic: true,  values: [3, 6, 8, 10, 13, 13] },
  { key: "par3",      label: "Avg Par 3",   pct: false, monotonic: true, values: [3.20, 3.42, 3.60, 3.83, 4.00, 4.19] },
  { key: "par4",      label: "Avg Par 4",   pct: false, monotonic: true, values: [4.20, 4.53, 4.67, 5.05, 5.31, 5.87] },
  { key: "par5",      label: "Avg Par 5",   pct: false, monotonic: true, values: [4.80, 5.36, 5.52, 5.91, 6.23, 6.98] },
];

function analyticsStats(round) {
  const played = round.holes.filter((h) => h.score != null);
  const firChances = played.filter((h) => h.par > 3);
  const firHit = firChances.filter((h) => h.fir).length;
  const girHit = played.filter((h) => h.gir).length;
  const girMissed = played.filter((h) => !h.gir);
  const udMade = girMissed.filter((h) => h.upDown).length;
  const puttsTracked = played.filter((h) => h.putts != null);
  const threes = puttsTracked.filter((h) => h.putts >= 3).length;
  const byPar = (p) => played.filter((h) => h.par === p);
  const strokes = (holes) => holes.reduce((s, h) => s + h.score, 0);
  const avg = (holes) =>
    holes.length
      ? { value: strokes(holes) / holes.length, raw: (strokes(holes) / holes.length).toFixed(2) }
      : { value: null, raw: null };
  const p3 = avg(byPar(3)), p4 = avg(byPar(4)), p5 = avg(byPar(5));
  const frac = (n, d) => (d ? `${n}/${d} (${Math.round((100 * n) / d)}%)` : null);
  return {
    fir: firChances.length ? (100 * firHit) / firChances.length : null,
    gir: played.length ? (100 * girHit) / played.length : null,
    upDown: girMissed.length ? (100 * udMade) / girMissed.length : null,
    threePutt: puttsTracked.length ? (100 * threes) / puttsTracked.length : null,
    par3: p3.value,
    par4: p4.value,
    par5: p5.value,
    raw: {
      fir: frac(firHit, firChances.length),
      gir: frac(girHit, played.length),
      upDown: frac(udMade, girMissed.length),
      threePutt: frac(threes, puttsTracked.length),
      par3: p3.raw,
      par4: p4.raw,
      par5: p5.raw,
    },
  };
}

// Interpolate where a value falls on the benchmark handicap scale.
// Returns -1 if better than the scratch benchmark, 26 if beyond the 25-hcp one.
function benchHcp(values, value) {
  const n = values.length;
  const inc = values[n - 1] > values[0]; // do values rise with handicap?
  const t = inc ? value : -value;
  const vv = inc ? values : values.map((x) => -x);
  if (t <= vv[0]) return -1;
  if (t >= vv[n - 1]) return 26;
  for (let i = 0; i < n - 1; i++) {
    if (t >= vv[i] && t <= vv[i + 1]) {
      const f = (t - vv[i]) / (vv[i + 1] - vv[i] || 1);
      return BENCH_HCPS[i] + f * (BENCH_HCPS[i + 1] - BENCH_HCPS[i]);
    }
  }
  return null;
}

function analyticsPanel(round) {
  const a = analyticsStats(round);
  if (!round.holes.some((h) => h.score != null)) return "";
  const fmt = (b, v) => (v == null ? "—" : b.pct ? `${Math.round(v)}%` : v.toFixed(2));

  const rows = BENCHMARKS.map((b) => {
    const v = a[b.key];
    let nearest = -1;
    if (v != null) {
      let best = Infinity;
      b.values.forEach((bv, i) => {
        const d = Math.abs(v - bv);
        if (d < best) { best = d; nearest = i; }
      });
    }
    return `
      <div class="metric-cell"><div class="metric-label">${b.label}</div><div class="metric-you">${fmt(b, v)}</div></div>
      ${b.values.map((bv, i) => `<div class="bench-cell ${i === nearest ? "hit" : ""}">${b.pct ? bv + "%" : bv.toFixed(2)}</div>`).join("")}`;
  }).join("");

  const ests = BENCHMARKS.filter((b) => b.monotonic && a[b.key] != null).map((b) => benchHcp(b.values, a[b.key]));
  let summary = "";
  if (ests.length >= 2) {
    ests.sort((x, y) => x - y);
    const mid = ests.length % 2 ? ests[(ests.length - 1) / 2] : (ests[ests.length / 2 - 1] + ests[ests.length / 2]) / 2;
    const txt = mid <= 0 ? "scratch or better" : mid > 25 ? "a 25+ handicap" : `about a ${Math.round(mid)} handicap`;
    summary = `<div class="bench-summary">This round profiles like <b>${txt}</b></div>`;
  }

  return `
    <div class="card-box">
      <div class="row-label">Analytics vs benchmarks</div>
      <div class="bench-grid">
        <div class="metric-cell head">Hcp →</div>
        ${BENCH_HCPS.map((h) => `<div class="bench-cell head">${h}</div>`).join("")}
        ${rows}
      </div>
      <div class="raw-title">Your counts</div>
      <div class="raw-grid">
        ${BENCHMARKS.map((b) =>
          a.raw[b.key] == null ? "" : `<div class="raw-label">${b.label}</div><div class="raw-value">${a.raw[b.key]}</div>`
        ).join("")}
      </div>
      ${summary}
      <div class="bench-note">Highlighted cell = the benchmark closest to your round.</div>
    </div>`;
}

function toParText(toPar) {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

function scoreClass(score, par) {
  if (score == null) return "empty";
  if (score < par) return "under";
  if (score > par) return "over";
  return "";
}

// Clubs offered in the approach-club dropdown
const CLUBS = ["Driver", "3W", "5W", "7W", "Hybrid", "3i", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW", "LW"];

// ---- Shot tracker (approach bullseye) ----
// SVG viewBox is 240x280 with the flag at (120, 140).
// The green is an 88px-radius circle representing 30 ft, so 1 ft ≈ 2.93px.

const SHOT = { cx: 120, cy: 140, greenR: 88, roughR: 100, bunkerR: 118 };

function shotInfo(shot) {
  if (!shot) return null;
  const d = Math.hypot(shot.x - SHOT.cx, shot.y - SHOT.cy);
  if (d <= SHOT.greenR) {
    const feet = Math.max(1, Math.round((d * 30) / SHOT.greenR));
    return { zone: "green", label: `On the green · ${feet} ft from the pin` };
  }
  if (d <= SHOT.roughR) return { zone: "rough", label: "Missed — in the rough" };
  return { zone: "bunker", label: "Missed — greenside bunker" };
}

function shotTrackerSVG(round, currentIdx) {
  const r10 = SHOT.greenR / 3;
  const r20 = (SHOT.greenR * 2) / 3;
  // One ball per hole that has a shot, numbered by hole; current hole drawn last (on top) in red
  const marker = round.holes
    .map((h, idx) => ({ shot: h.shot, idx }))
    .filter((m) => m.shot)
    .sort((a, b) => (a.idx === currentIdx) - (b.idx === currentIdx))
    .map(({ shot, idx }) => `
      <g>
        <circle cx="${shot.x}" cy="${shot.y}" r="8" fill="#ffffff"
          stroke="${idx === currentIdx ? "#d64541" : "#1f2937"}" stroke-width="${idx === currentIdx ? 2.5 : 1.5}"/>
        <text x="${shot.x}" y="${shot.y + 3}" class="ball-num">${holeNo(round, idx)}</text>
      </g>`)
    .join("");
  return `
    <svg id="shot-svg" class="shot-svg" viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg">
      <text x="120" y="14" class="dir-label">LONG</text>
      <text x="120" y="274" class="dir-label">SHORT</text>
      <circle cx="120" cy="140" r="${SHOT.bunkerR}" fill="#e7d7ab" stroke="#d6c390" stroke-width="1.5"/>
      <circle cx="120" cy="140" r="${SHOT.roughR}" fill="#41694a"/>
      <circle cx="120" cy="140" r="${SHOT.greenR}" fill="#7fae7f"/>
      <circle cx="120" cy="140" r="${SHOT.greenR}" class="ring"/>
      <circle cx="120" cy="140" r="${r20}" class="ring"/>
      <circle cx="120" cy="140" r="${r10}" class="ring"/>
      <text x="120" y="${140 + r10 - 5}" class="ring-label">10 ft</text>
      <text x="120" y="${140 + r20 - 5}" class="ring-label">20 ft</text>
      <text x="120" y="${140 + SHOT.greenR - 5}" class="ring-label">30 ft</text>
      <text x="120" y="49" class="band-label">ROUGH</text>
      <text x="120" y="35" class="band-label bunker">BUNKER</text>
      <line x1="120" y1="140" x2="120" y2="118" stroke="#5b4a3a" stroke-width="2"/>
      <path d="M120 118 L134 123 L120 128 Z" fill="#d64541"/>
      <circle cx="120" cy="140" r="3" fill="#2f3e33"/>
      ${marker}
    </svg>`;
}

// ---- Tee shot tracker (fairway target) ----
// SVG viewBox is 240x300: an oval fairway (split into LF / CF / RF) surrounded by rough.

const TEE = { cx: 120, cy: 152, rx: 72, ry: 118 };

function teeInfo(tee) {
  if (!tee) return null;
  const nx = (tee.x - TEE.cx) / TEE.rx;
  const ny = (tee.y - TEE.cy) / TEE.ry;
  if (nx * nx + ny * ny <= 1) {
    const zone = tee.x < TEE.cx - TEE.rx / 3 ? "LF" : tee.x > TEE.cx + TEE.rx / 3 ? "RF" : "CF";
    const names = { LF: "left side", CF: "center", RF: "right side" };
    return { zone, fairway: true, label: `Fairway · ${names[zone]}` };
  }
  return { zone: "rough", fairway: false, label: `Missed — ${tee.x < TEE.cx ? "left" : "right"} rough` };
}

function teeTrackerSVG(round, currentIdx) {
  const third = TEE.rx / 3;
  const balls = round.holes
    .map((h, idx) => ({ tee: h.tee, idx }))
    .filter((m) => m.tee)
    .sort((a, b) => (a.idx === currentIdx) - (b.idx === currentIdx))
    .map(({ tee, idx }) => `
      <g>
        <circle cx="${tee.x}" cy="${tee.y}" r="8" fill="#ffffff"
          stroke="${idx === currentIdx ? "#d64541" : "#1f2937"}" stroke-width="${idx === currentIdx ? 2.5 : 1.5}"/>
        <text x="${tee.x}" y="${tee.y + 3}" class="ball-num">${holeNo(round, idx)}</text>
      </g>`)
    .join("");
  return `
    <svg id="tee-svg" class="shot-svg" viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="fw-clip"><ellipse cx="${TEE.cx}" cy="${TEE.cy}" rx="${TEE.rx}" ry="${TEE.ry}"/></clipPath>
      </defs>
      <text x="120" y="14" class="dir-label">LONG</text>
      <text x="120" y="296" class="dir-label">SHORT</text>
      <rect x="4" y="20" width="232" height="264" rx="14" fill="#41694a"/>
      <ellipse cx="${TEE.cx}" cy="${TEE.cy}" rx="${TEE.rx}" ry="${TEE.ry}" fill="#7fae7f"/>
      <g clip-path="url(#fw-clip)">
        <line x1="${TEE.cx - third}" y1="${TEE.cy - TEE.ry}" x2="${TEE.cx - third}" y2="${TEE.cy + TEE.ry}" class="ring"/>
        <line x1="${TEE.cx + third}" y1="${TEE.cy - TEE.ry}" x2="${TEE.cx + third}" y2="${TEE.cy + TEE.ry}" class="ring"/>
      </g>
      <text x="82" y="70" class="band-label">LF</text>
      <text x="120" y="70" class="band-label">CF</text>
      <text x="158" y="70" class="band-label">RF</text>
      <text x="16" y="152" class="band-label" transform="rotate(-90 16 152)">ROUGH</text>
      <text x="224" y="152" class="band-label" transform="rotate(90 224 152)">ROUGH</text>
      ${balls}
    </svg>`;
}

function formatDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ---- Rendering ----

const app = document.getElementById("app");

let lastViewKey = "";

function render() {
  const viewKey = [view.name, view.roundId, view.tab, view.holeIndex].join("|");
  const scrollY = window.scrollY;
  if (view.name === "home") renderHome();
  else if (view.name === "setup") renderSetup();
  else if (view.name === "round") renderRound();
  // Re-drawing the same screen (e.g. placing a ball) keeps your scroll position;
  // navigating to a different screen or hole starts at the top.
  window.scrollTo(0, viewKey === lastViewKey ? scrollY : 0);
  lastViewKey = viewKey;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// -- Home: list of rounds --

function renderHome() {
  const cards = rounds
    .map((r) => {
      const st = roundStats(r);
      const scoreText = st.played > 0 ? `${st.score} <span style="font-size:0.75rem">(${toParText(st.toPar)})</span>` : "—";
      return `
        <div class="round-card" data-round="${r.id}">
          <div class="info">
            <div class="course">${esc(r.course)}</div>
            <div class="meta">${formatDate(r.date)}${r.tee ? ` · ${esc(r.tee)} tees` : ""} · ${st.played}/${r.holes.length} holes</div>
          </div>
          <div class="score-pill">${scoreText}</div>
          <button class="delete-btn" data-delete="${r.id}" aria-label="Delete round">✕</button>
        </div>`;
    })
    .join("");

  app.innerHTML = `
    <div class="header"><h1>⛳ Golf Journal</h1></div>
    <div class="content">
      <button class="big-btn" id="new-round">+ New Round</button>
      <div class="section-label">Rounds</div>
      ${cards || `<div class="empty-note">No rounds yet.<br>Tap <b>New Round</b> to start your first scorecard.</div>`}
      <div class="backup-row">
        <button class="backup-btn" id="export-btn">⬇ Export backup</button>
        <button class="backup-btn" id="import-btn">⬆ Import backup</button>
        <input type="file" id="import-file" accept=".json,application/json" hidden />
      </div>
      <div class="backup-note">Rounds live on this device only — export now and then to keep a copy safe.</div>
    </div>`;

  document.getElementById("new-round").onclick = () => {
    view = { name: "setup" };
    render();
  };

  app.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const r = rounds.find((x) => x.id === btn.dataset.delete);
      if (confirm(`Delete round at ${r.course}? This can't be undone.`)) {
        rounds = rounds.filter((x) => x.id !== btn.dataset.delete);
        saveRounds();
        render();
      }
    };
  });

  app.querySelectorAll(".round-card").forEach((card) => {
    card.onclick = () => {
      view = { name: "round", roundId: card.dataset.round, tab: "hole", holeIndex: 0 };
      render();
    };
  });

  // Backup: download all rounds as a JSON file / restore from one
  document.getElementById("export-btn").onclick = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(rounds, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `golf-journal-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  document.getElementById("import-btn").onclick = () => document.getElementById("import-file").click();
  document.getElementById("import-file").onchange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let imported;
      try {
        imported = JSON.parse(reader.result);
        if (!Array.isArray(imported) || imported.some((r) => !r.id || !Array.isArray(r.holes))) throw new Error();
      } catch {
        alert("That file doesn't look like a Golf Journal backup.");
        return;
      }
      const plural = imported.length === 1 ? "round" : "rounds";
      if (!confirm(`Import ${imported.length} ${plural} from this backup? Existing rounds with the same ID will be replaced.`)) return;
      const byId = new Map(rounds.map((r) => [r.id, r]));
      imported.forEach((r) => byId.set(r.id, r));
      rounds = [...byId.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
      saveRounds();
      render();
    };
    reader.readAsText(file);
  };
}

// -- Setup: start a new round --

// Preselect the tees you used last on this course, falling back to its defaultTee
function defaultTeeIdx(course) {
  if (!course) return 0;
  const lastTees = JSON.parse(localStorage.getItem("golf-journal-last-tees") || "{}");
  const wanted = lastTees[course.name] ?? course.defaultTee;
  const idx = course.tees.findIndex((t) => t.name === wanted);
  return idx >= 0 ? idx : 0;
}

function rememberTee(courseName, teeName) {
  const lastTees = JSON.parse(localStorage.getItem("golf-journal-last-tees") || "{}");
  lastTees[courseName] = teeName;
  localStorage.setItem("golf-journal-last-tees", JSON.stringify(lastTees));
}

function renderSetup() {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Selections live on the view so they survive re-renders of this page
  const s = view.setup ?? (view.setup = {
    courseIdx: COURSES.length ? 0 : -1, // -1 = custom round
    teeIdx: COURSES.length ? defaultTeeIdx(COURSES[0]) : 0,
    holesChoice: "18",
    name: "",
    date: todayIso,
  });
  const course = s.courseIdx >= 0 ? COURSES[s.courseIdx] : null;

  const teeButtons = course
    ? course.tees.map((t, ti) => {
        const total = t.yardages.reduce((a, b) => a + b, 0);
        return `<button data-tee="${ti}" class="${ti === s.teeIdx ? "active" : ""}">${esc(t.name)}<span class="tee-yds">${total.toLocaleString()} yds${t.rating ? ` · ${esc(t.rating)}` : ""}</span></button>`;
      }).join("")
    : "";

  const holesButtons = course
    ? [["18", "18 holes"], ["front9", "Front 9"], ["back9", "Back 9"]]
    : [["9", "9 holes"], ["18", "18 holes"]];

  app.innerHTML = `
    <div class="header">
      <button class="icon-btn" id="back">‹ Back</button>
      <h1>New Round</h1>
    </div>
    <div class="content">
      <div class="field">
        <label for="course-select">Course</label>
        <select id="course-select">
          ${COURSES.map((c, ci) => `<option value="${ci}" ${s.courseIdx === ci ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
          <option value="-1" ${s.courseIdx === -1 ? "selected" : ""}>Custom / other course</option>
        </select>
      </div>
      ${course ? `
      <div class="field">
        <label>Tees</label>
        <div class="segment" id="tee-seg">${teeButtons}</div>
      </div>` : `
      <div class="field">
        <label for="course">Course name</label>
        <input type="text" id="course" value="${esc(s.name)}" placeholder="e.g. Presidio Golf Course" autocomplete="off" />
      </div>`}
      <div class="field">
        <label>Holes</label>
        <div class="segment" id="holes-seg">
          ${holesButtons.map(([v, label]) => `<button data-holes="${v}" class="${s.holesChoice === v ? "active" : ""}">${label}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label for="date">Date</label>
        <input type="date" id="date" value="${s.date}" />
      </div>
      <button class="big-btn" id="start">Start Round</button>
    </div>`;

  document.getElementById("back").onclick = () => { view = { name: "home" }; render(); };

  document.getElementById("course-select").onchange = (e) => {
    s.courseIdx = Number(e.target.value);
    s.teeIdx = s.courseIdx >= 0 ? defaultTeeIdx(COURSES[s.courseIdx]) : 0;
    s.holesChoice = "18";
    renderSetup();
  };
  if (course) {
    document.querySelectorAll("#tee-seg button").forEach((b) => {
      b.onclick = () => { s.teeIdx = Number(b.dataset.tee); renderSetup(); };
    });
  } else {
    document.getElementById("course").oninput = (e) => { s.name = e.target.value; };
  }
  document.querySelectorAll("#holes-seg button").forEach((b) => {
    b.onclick = () => { s.holesChoice = b.dataset.holes; renderSetup(); };
  });
  document.getElementById("date").oninput = (e) => { s.date = e.target.value || todayIso; };

  document.getElementById("start").onclick = () => {
    let round;
    if (course) {
      const tee = course.tees[s.teeIdx];
      const [from, to] = s.holesChoice === "front9" ? [0, 9] : s.holesChoice === "back9" ? [9, 18] : [0, 18];
      const template = course.pars.slice(from, to).map((par, k) => ({ par, yards: tee.yardages[from + k] }));
      round = newRound(course.name, s.date, template.length, template, tee.name, from + 1);
      rememberTee(course.name, tee.name);
    } else {
      round = newRound(s.name.trim(), s.date, s.holesChoice === "9" ? 9 : 18);
    }
    rounds.unshift(round);
    saveRounds();
    view = { name: "round", roundId: round.id, tab: "hole", holeIndex: 0 };
    render();
  };
}

// -- Round: hole editor + scorecard tabs --

function renderRound() {
  const round = currentRound();
  if (!round) { view = { name: "home" }; render(); return; }

  const st = roundStats(round);
  const toPar = st.played > 0 ? toParText(st.toPar) : "E";

  app.innerHTML = `
    <div class="header">
      <button class="icon-btn" id="back">‹ Rounds</button>
      <h1>${esc(round.course)} <span class="sub">${formatDate(round.date)} · ${toPar}</span></h1>
    </div>
    <div class="content">
      <div class="view-toggle">
        <button id="tab-hole" class="${view.tab === "hole" ? "active" : ""}">Hole Entry</button>
        <button id="tab-card" class="${view.tab === "card" ? "active" : ""}">Scorecard</button>
      </div>
      <div id="tab-content"></div>
    </div>`;

  document.getElementById("back").onclick = () => { view = { name: "home" }; render(); };
  document.getElementById("tab-hole").onclick = () => { view.tab = "hole"; render(); };
  document.getElementById("tab-card").onclick = () => { view.tab = "card"; render(); };

  if (view.tab === "hole") renderHoleTab(round);
  else renderCardTab(round);
}

// -- Hole entry --

function renderHoleTab(round) {
  const i = view.holeIndex;
  const hole = round.holes[i];
  const isPar3 = hole.par === 3;

  const scoreCls = scoreClass(hole.score, hole.par);
  const puttsCls = hole.putts == null ? "empty" : "";

  document.getElementById("tab-content").innerHTML = `
    <div class="hole-nav">
      <button class="nav-btn" id="prev-hole" ${i === 0 ? "disabled" : ""}>‹</button>
      <div class="hole-title">
        <div class="num">Hole ${holeNo(round, i)}</div>
        <div class="progress">${i + 1} of ${round.holes.length}${hole.yards ? ` · ${hole.yards} yds` : ""}</div>
      </div>
      <button class="nav-btn" id="next-hole" ${i === round.holes.length - 1 ? "disabled" : ""}>›</button>
    </div>

    <div class="card-box">
      <div class="row-label">Par</div>
      <div class="par-row">
        ${[3, 4, 5].map((p) => `<button data-par="${p}" class="${hole.par === p ? "active" : ""}">${p}</button>`).join("")}
      </div>
    </div>

    <div class="card-box">
      <div class="row-label">Off the tee &amp; around the green</div>
      <div class="chip-row">
        <button class="chip ${hole.fir ? "on" : ""}" id="chip-fir" ${isPar3 ? "disabled" : ""}>${isPar3 ? "FIR — n/a" : "Fairway"}</button>
        <button class="chip ${hole.gir ? "on" : ""}" id="chip-gir">GIR</button>
        <button class="chip ${hole.upDown ? "on" : ""}" id="chip-updown">Up &amp; Down</button>
      </div>
    </div>

    <div class="card-box">
      <div class="row-label">Approach distance</div>
      <div class="approach-row">
        <input type="number" inputmode="numeric" id="approach" placeholder="—" value="${esc(hole.approach)}" />
        <span class="unit">yds</span>
      </div>
      <select id="club" class="club-select">
        <option value="">Club used — optional</option>
        ${CLUBS.map((c) => `<option value="${c}" ${hole.club === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>
    </div>

    <div class="card-box">
      <div class="stepper-row">
        <div class="stepper">
          <div class="row-label">Putts</div>
          <div class="controls">
            <button id="putts-minus">−</button>
            <div class="value ${puttsCls}" id="putts-value">${hole.putts ?? "—"}</div>
            <button id="putts-plus">+</button>
          </div>
        </div>
        <div class="stepper">
          <div class="row-label">Score</div>
          <div class="controls">
            <button id="score-minus">−</button>
            <div class="value ${scoreCls}" id="score-value">${hole.score ?? "—"}</div>
            <button id="score-plus">+</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-box">
      <div class="row-label">Notes</div>
      <textarea class="notes" id="notes" placeholder="Anything notable? e.g. pushed drive right, great bunker save…">${esc(hole.notes)}</textarea>
    </div>

    <div class="card-box">
      <div class="row-label">Tee shot tracker</div>
      ${teeTrackerSVG(round, i)}
      <div class="shot-footer">
        <div class="shot-result ${teeInfo(hole.tee)?.fairway ? "on" : ""}">${teeInfo(hole.tee)?.label ?? `Tap where your tee shot on hole ${holeNo(round, i)} finished`}</div>
        ${hole.tee ? '<button class="clear-shot" id="clear-tee">Clear</button>' : ""}
      </div>
    </div>

    <div class="card-box">
      <div class="row-label">Approach shot tracker</div>
      ${shotTrackerSVG(round, i)}
      <div class="shot-footer">
        <div class="shot-result ${shotInfo(hole.shot)?.zone === "green" ? "on" : ""}">${shotInfo(hole.shot)?.label ?? `Tap where your approach on hole ${holeNo(round, i)} finished`}</div>
        ${hole.shot ? '<button class="clear-shot" id="clear-shot">Clear</button>' : ""}
      </div>
    </div>`;

  const save = () => saveRounds();

  document.getElementById("prev-hole").onclick = () => { view.holeIndex--; render(); };
  document.getElementById("next-hole").onclick = () => { view.holeIndex++; render(); };

  document.querySelectorAll("[data-par]").forEach((b) => {
    b.onclick = () => {
      hole.par = Number(b.dataset.par);
      if (hole.par === 3) hole.fir = false; // no fairway to hit on a par 3
      save(); render();
    };
  });

  document.getElementById("chip-fir").onclick = () => { hole.fir = !hole.fir; save(); render(); };
  document.getElementById("chip-gir").onclick = () => { hole.gir = !hole.gir; save(); render(); };
  document.getElementById("chip-updown").onclick = () => { hole.upDown = !hole.upDown; save(); render(); };

  // Steppers: first tap on + starts from a sensible value
  document.getElementById("putts-plus").onclick = () => {
    hole.putts = hole.putts == null ? 2 : hole.putts + 1;
    save(); render();
  };
  document.getElementById("putts-minus").onclick = () => {
    if (hole.putts != null) hole.putts = Math.max(0, hole.putts - 1);
    save(); render();
  };
  document.getElementById("score-plus").onclick = () => {
    hole.score = hole.score == null ? hole.par : hole.score + 1;
    save(); render();
  };
  document.getElementById("score-minus").onclick = () => {
    if (hole.score == null) hole.score = hole.par;
    else hole.score = Math.max(1, hole.score - 1);
    save(); render();
  };

  // Tee shot tracker: tap the fairway target to drop this hole's numbered ball.
  // Landing in any fairway section auto-checks FIR (except on par 3s, where FIR doesn't apply).
  const teeSvg = document.getElementById("tee-svg");
  teeSvg.onclick = (e) => {
    const b = teeSvg.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * 240;
    const y = ((e.clientY - b.top) / b.height) * 300;
    hole.tee = {
      x: Math.round(Math.min(228, Math.max(12, x))),  // keep the ball inside the rough box
      y: Math.round(Math.min(276, Math.max(28, y))),
    };
    if (hole.par > 3) hole.fir = teeInfo(hole.tee).fairway;
    save(); render();
  };
  if (hole.tee) {
    document.getElementById("clear-tee").onclick = () => {
      hole.tee = null;
      save(); render();
    };
  }

  // Shot tracker: tap the target to drop a marker where the approach finished.
  // Landing on the green auto-checks GIR; missing unchecks it (you can still toggle it by hand).
  const shotSvg = document.getElementById("shot-svg");
  shotSvg.onclick = (e) => {
    const rect = shotSvg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 240;
    const y = ((e.clientY - rect.top) / rect.height) * 280;
    const dx = x - SHOT.cx;
    const dy = y - SHOT.cy;
    const d = Math.hypot(dx, dy) || 1;
    if (d > SHOT.bunkerR + 12) return; // tapped outside the target
    let fx = x, fy = y;
    if (d > SHOT.bunkerR) {
      // near-miss taps snap into the middle of the bunker band
      const f = (SHOT.bunkerR - 9) / d;
      fx = SHOT.cx + dx * f;
      fy = SHOT.cy + dy * f;
    }
    hole.shot = { x: Math.round(fx), y: Math.round(fy) };
    hole.gir = shotInfo(hole.shot).zone === "green";
    save(); render();
  };
  if (hole.shot) {
    document.getElementById("clear-shot").onclick = () => {
      hole.shot = null;
      save(); render();
    };
  }

  // Text inputs save as you type without re-rendering (so you don't lose focus)
  document.getElementById("approach").oninput = (e) => { hole.approach = e.target.value; save(); };
  document.getElementById("club").onchange = (e) => { hole.club = e.target.value; save(); };
  document.getElementById("notes").oninput = (e) => { hole.notes = e.target.value; save(); };
}

// -- Scorecard table --

function renderCardTab(round) {
  const st = roundStats(round);
  const is18 = round.holes.length === 18;

  const holeRow = (h, idx) => {
    const cls = scoreClass(h.score, h.par);
    return `
      <tr class="hole-row" data-hole="${idx}">
        <td><b>${holeNo(round, idx)}</b>${h.notes ? ' <span class="note-dot">📝</span>' : ""}</td>
        <td>${h.par}</td>
        <td class="score-cell ${cls}">${h.score ?? '<span class="dash">—</span>'}</td>
        <td>${h.putts ?? '<span class="dash">—</span>'}</td>
        <td>${h.par === 3 ? '<span class="dash">·</span>' : h.fir ? '<span class="check">✓</span>' : '<span class="dash">—</span>'}</td>
        <td>${h.gir ? '<span class="check">✓</span>' : '<span class="dash">—</span>'}</td>
        <td>${h.upDown ? '<span class="check">✓</span>' : '<span class="dash">—</span>'}</td>
      </tr>`;
  };

  const subtotal = (holes, label) => {
    const played = holes.filter((h) => h.score != null);
    const score = played.reduce((s, h) => s + h.score, 0);
    const par = holes.reduce((s, h) => s + h.par, 0);
    const putts = played.reduce((s, h) => s + (h.putts || 0), 0);
    return `
      <tr class="subtotal">
        <td>${label}</td>
        <td>${par}</td>
        <td>${played.length ? score : "—"}</td>
        <td>${played.length ? putts : "—"}</td>
        <td colspan="3"></td>
      </tr>`;
  };

  let rows;
  if (is18) {
    rows =
      round.holes.slice(0, 9).map(holeRow).join("") +
      subtotal(round.holes.slice(0, 9), "OUT") +
      round.holes.slice(9).map((h, j) => holeRow(h, j + 9)).join("") +
      subtotal(round.holes.slice(9), "IN") +
      subtotal(round.holes, "TOT");
  } else {
    rows = round.holes.map(holeRow).join("") + subtotal(round.holes, "TOT");
  }

  document.getElementById("tab-content").innerHTML = `
    <div class="summary-chips">
      <div class="sum-chip"><div class="v">${st.played ? toParText(st.toPar) : "—"}</div><div class="k">To Par</div></div>
      <div class="sum-chip"><div class="v">${st.firChances ? `${st.fir}/${st.firChances}` : "—"}</div><div class="k">FIR</div></div>
      <div class="sum-chip"><div class="v">${st.played ? `${st.gir}/${st.played}` : "—"}</div><div class="k">GIR</div></div>
      <div class="sum-chip"><div class="v">${st.played ? st.putts : "—"}</div><div class="k">Putts</div></div>
      <div class="sum-chip"><div class="v">${st.played ? st.upDowns : "—"}</div><div class="k">Up&amp;Dn</div></div>
    </div>
    <table class="scorecard">
      <thead>
        <tr><th>Hole</th><th>Par</th><th>Score</th><th>Putts</th><th>FIR</th><th>GIR</th><th>U&amp;D</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${analyticsPanel(round)}`;

  // Tap any hole row to jump to editing that hole
  document.querySelectorAll(".hole-row").forEach((tr) => {
    tr.onclick = () => {
      view.tab = "hole";
      view.holeIndex = Number(tr.dataset.hole);
      render();
    };
  });
}

render();
