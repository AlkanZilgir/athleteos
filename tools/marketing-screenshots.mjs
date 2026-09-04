/* Regenerates the three marketing screenshots straight from the live app so the
   landing page shows the current UI. Writes both .png and .webp next to index.html. */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://127.0.0.1:5199/index.html';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const bootstrap = (dark) => {
  ['welcome', 'auth', 'onb', 'ob-paywall', 'onb-splash'].forEach(id => {
    const e = document.getElementById(id); if (e) { e.style.display = 'none'; e.classList.add('hidden'); }
  });
  document.querySelectorAll('[id*="consent"],[id*="cookie"],[class*="consent"]').forEach(e => e.remove());
  const app = document.getElementById('app'); if (app) app.style.display = 'flex';
  if (dark) { document.body.classList.add('dark'); document.documentElement.classList.add('dark'); }
  const av = document.getElementById('ava'); if (av) av.textContent = 'A';
  const st = document.getElementById('streak');
  if (st) st.innerHTML = '<svg class="ic"><use href="#i-flame"/></svg>11d';
};

const fillHome = () => {
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.innerHTML = v; };
  set('home-date', 'Friday, 4 September');
  set('hero-greet', 'Good afternoon, Alkan');
  set('hero-sub', 'Two sessions left this week. Legs are three days stale.');
  set('hero-stat', '12,480'); set('hero-stat-unit', 'kg');
  set('hero-sessions', '4'); set('hero-duration', '3h 12m'); set('hero-sets', '68'); set('hero-streak', '11d');
  const chip = document.getElementById('h-w');
  if (chip) { chip.className = 'chip live'; chip.innerHTML = '<svg class="ic"><use href="#i-check"/></svg>Logged'; }
  set('k-lbl', '2180 kcal today'); set('ring-kcal-v', '2180');
  set('k-goal-lbl', '2180 <small>/ 2500</small>');
  set('p-lbl', '128/170g'); set('p-rem', '42g to go');
  set('h-wa', '1.5<span class="su">L</span>'); set('w-lbl', '6 of 8 cups');
  set('h-s', '7.2<span class="su">h</span>'); set('s-sub', 'Enough to train');
  set('coach-title', 'Legs are going stale');
  set('coach-body', 'Three days since you trained legs. Get one short session in this week before the gap starts costing you.');
  const w = (id, p) => { const e = document.getElementById(id); if (e) e.style.width = p + '%'; };
  w('p-bar', 75); w('k-bar', 87);
  const r = (id, p, c) => { const e = document.getElementById(id); if (e) e.style.strokeDashoffset = (c * (1 - p / 100)).toFixed(1); };
  r('ring-kcal', 87, 295.31); r('ring-water', 75, 138.23); r('ring-sleep', 90, 138.23);
  const gs = document.getElementById('gs-card');
  if (gs) {
    gs.classList.remove('hidden');
    const st = { workout: true, meal: false, sleep: false };
    Object.entries(st).forEach(([k, v]) => {
      const row = document.getElementById('gs-row-' + k); if (row) row.classList.toggle('done', v);
      const box = document.getElementById('gs-check-' + k);
      if (box) box.innerHTML = v ? '<svg class="ic" style="font-size:13px"><use href="#i-check"/></svg>' : '';
    });
    const pg = document.getElementById('gs-progress'); if (pg) pg.textContent = '1/3';
  }
  const sp = document.getElementById('hero-spark');
  if (sp) sp.parentElement.innerHTML = '<div style="display:flex;align-items:flex-end;gap:6px;height:62px">' +
    [30, 0, 68, 45, 0, 92, 55].map(h => `<div style="flex:1;height:${Math.max(h, 4)}%;background:${h ? 'var(--sig-train-pure)' : 'var(--sig-track)'}"></div>`).join('') + '</div>';
};

const showWorkout = () => {
  document.querySelectorAll('.panel').forEach(p => { p.classList.remove('on'); p.classList.add('hidden'); });
  const p = document.getElementById('p-workout'); if (p) { p.classList.add('on'); p.classList.remove('hidden'); }
  document.querySelectorAll('.nv,.sb-item').forEach(n => n.classList.remove('on'));
  const nav = document.getElementById('n-workout'); if (nav) nav.classList.add('on');
};

const showCoach = () => {
  document.querySelectorAll('.panel').forEach(p => { p.classList.remove('on'); p.classList.add('hidden'); });
  const ai = document.getElementById('p-ai'); if (ai) ai.classList.add('on');
  document.querySelectorAll('.nv,.sb-item').forEach(n => n.classList.remove('on'));
  const nav = document.getElementById('n-ai'); if (nav) nav.classList.add('on');
  const sub = document.getElementById('ai-page-sub'); if (sub) sub.textContent = 'Pro · unlimited messages';
  const m = document.getElementById('chat-msgs');
  if (m) m.innerHTML =
    '<div class="msg a">I\'ve got your numbers in front of me. What do you want to work on?</div>' +
    '<div class="msg u">Bench has been stuck at 82.5 for three weeks. What do I do?</div>' +
    '<div class="msg a">Three weeks at the same top set is a stall, not a plateau. Your volume on chest dropped to 11 sets last week, down from 16.<br><br>Add a back-off set at 70 kg after your top triple and push it to 8 reps. If the bar still will not move in two weeks, drop to 75 for a fortnight and build back.</div>';
};

async function grab(name, { dark, prep }) {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.evaluate(bootstrap, dark);
  await page.evaluate(prep);
  await page.waitForTimeout(450);
  const png = await page.screenshot({ type: 'png' });
  writeFileSync(`${name}.png`, png);
  // Convert in-page so we do not need a native image dependency.
  const webp = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.82).split(',')[1];
  }, png.toString('base64'));
  writeFileSync(`${name}.webp`, Buffer.from(webp, 'base64'));
  console.log(name, 'png', png.length, 'webp', Buffer.from(webp, 'base64').length);
}

await grab('screen-home', { dark: true, prep: fillHome });
await grab('screen-workout', { dark: true, prep: showWorkout });
await grab('screen-ai', { dark: true, prep: showCoach });

await browser.close();
