/* Sweeps every visible text node on Home in both themes and reports any pair
   that misses WCAG AA. Run against a local server: npm run dev, then
   npm run contrast. */
import { chromium } from 'playwright';
const OUT = process.argv[2] || '.';
const b = await chromium.launch();

function lum(rgb){const c=rgb.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function ratio(a,b){const l1=lum(a),l2=lum(b);return ((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05));}

for (const theme of ['dark','light']) {
  const ctx = await b.newContext({ viewport:{width:430,height:1400}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  await p.addInitScript(t => { try { localStorage.setItem('athleteos_theme', t); } catch(e){} }, theme);
  await p.goto('http://127.0.0.1:5173/index.html', { waitUntil:'networkidle' });
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    ['welcome','auth','onb','ob-paywall','onb-splash'].forEach(id=>{const e=document.getElementById(id);if(e){e.style.display='none';e.classList.add('hidden');}});
    document.querySelectorAll('[id*="consent"],[id*="cookie"],[class*="consent"]').forEach(e=>e.remove());
    const a=document.getElementById('app'); if(a) a.style.display='flex';
    const s=(id,v)=>{const e=document.getElementById(id); if(e) e.innerHTML=v;};
    s('hero-greet','Good afternoon, Alkan'); s('hero-stat','12,480'); s('hero-stat-unit','kg');
    s('home-date','Friday, 4 September'); s('hero-sessions','4'); s('hero-duration','3h 12m');
    s('hero-sets','68'); s('hero-streak','11d'); s('k-lbl','2180 kcal today'); s('ring-kcal-v','2180');
    s('k-goal-lbl','2180 <small>/ 2500</small>'); s('p-lbl','128/170g'); s('p-rem','42g to go');
    s('h-wa','1.5<span class="su">L</span>'); s('w-lbl','6 of 8 cups');
    s('h-s','7.2<span class="su">h</span>'); s('s-sub','Enough to train');
    s('coach-title','Legs are going stale'); s('coach-body','Three days since you trained legs. Get one short session in this week.');
    const c=document.getElementById('h-w'); if(c){c.className='chip live';c.innerHTML='<svg class="ic"><use href="#i-check"/></svg>Logged';}
    const gs=document.getElementById('gs-card'); if(gs) gs.classList.remove('hidden');
    const sp=document.getElementById('hero-spark'); if(sp) sp.parentElement.innerHTML='<div style="height:62px"></div>';
  });
  await p.waitForTimeout(400);
  await p.screenshot({ path:`${OUT}/audit-${theme}.png`, fullPage:true });

  // Contrast sweep over visible text
  const bad = await p.evaluate(() => {
    const parse = c => { const m = c.match(/\d+(\.\d+)?/g); return m ? m.slice(0,3).map(Number) : null; };
    const bgOf = el => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; const m = c.match(/[\d.]+/g); if (m && (m.length < 4 || +m[3] > 0.5)) return c; n = n.parentElement; } return getComputedStyle(document.body).backgroundColor; };
    const out = [];
    document.querySelectorAll('#app *').forEach(el => {
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
      const txt = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (!txt || txt.length < 2) return;
      const st = getComputedStyle(el);
      out.push({ t: txt.slice(0,42), fg: st.color, bg: bgOf(el), size: parseFloat(st.fontSize), w: st.fontWeight, sel: el.className && typeof el.className === 'string' ? el.className.slice(0,34) : el.tagName });
    });
    return out;
  });
  const fails = [];
  for (const s of bad) {
    const fg = s.fg.match(/[\d.]+/g)?.slice(0,3).map(Number);
    const bg = s.bg.match(/[\d.]+/g)?.slice(0,3).map(Number);
    if (!fg || !bg) continue;
    const r = ratio(fg, bg);
    const large = s.size >= 24 || (s.size >= 18.66 && +s.w >= 700);
    const need = large ? 3 : 4.5;
    if (r < need) fails.push(`${r.toFixed(2)} (need ${need}) ${s.size}px ${s.sel} :: "${s.t}"`);
  }
  console.log(`\n=== ${theme.toUpperCase()} — ${fails.length} contrast failures ===`);
  [...new Set(fails)].slice(0,18).forEach(f => console.log('  ' + f));
  await ctx.close();
}
await b.close();
