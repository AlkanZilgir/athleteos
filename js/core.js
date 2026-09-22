const APP_VERSION='v1.0.1';

/* ── ERROR TRACKING (Sentry) ──────────────────
   The Sentry Loader Script is in index.html <head>. It lazily injects the SDK
   on first error and exposes window.Sentry as a queueing proxy until then —
   meaning Sentry.captureException() / Sentry.setUser() calls below work even
   before the SDK has finished downloading. Org/release/environment are set in
   the Sentry dashboard (Loader Script Settings) and via onLoad below. */
if(window.Sentry&&Sentry.onLoad){
  Sentry.onLoad(function(){
    try{
      Sentry.init({
        release:'athleteos@'+APP_VERSION,
        environment:location.hostname==='localhost'?'dev':'prod',
        ignoreErrors:['ResizeObserver loop','Non-Error promise rejection captured','top.GLOBALS','InvalidStateError']
      });
    }catch(e){console.warn('Sentry init',e);}
  });
}
// Defer Sentry.setUser until the real SDK has actually loaded — the loader
// stub exposes window.Sentry but only `captureException` and a few others. If
// CU isn't set yet, this no-ops cleanly.
function _sentrySetUser(id){
  if(!id||!window.Sentry)return;
  var apply=function(){try{if(typeof Sentry.setUser==='function')Sentry.setUser({id:id});}catch(e){}};
  if(Sentry.onLoad)Sentry.onLoad(apply);else apply();
}
// PostHog identify — moves anonymous events under the signed-in user. Guarded
// because the snippet stub exists synchronously but `.identify` is only real
// after the array.js bundle loads; the stub queues calls until then.
function _phIdentify(id){
  try{if(id&&window.posthog&&typeof window.posthog.identify==='function')window.posthog.identify(id);}catch(e){}
}
function _phReset(){
  try{if(window.posthog&&typeof window.posthog.reset==='function')window.posthog.reset();}catch(e){}
}
window.addEventListener('error',function(ev){
  if(window.Sentry)Sentry.captureException(ev.error||ev.message);
});
window.addEventListener('unhandledrejection',function(ev){
  if(window.Sentry)Sentry.captureException(ev.reason);
});

/* ── ANALYTICS (PostHog — free tier, no card) ──
   To activate: sign up at posthog.com, create a project, copy the Project API
   Key (starts with "phc_") into POSTHOG_KEY. If left empty, no analytics are
   sent. Use track('event_name', {prop:'val'}) for custom funnel events.
   Gated on cookie consent in EU regions — see _maybeShowConsent() below.
   `person_profiles:'identified_only'` keeps anonymous users out of person counts
   so the free 1M-events/mo budget lasts. */
var POSTHOG_KEY='phc_qSwMLSDtYz4HWuN8F9FQfJXNTNNyd9tKzuANUQPVY9iJ';
var POSTHOG_HOST='https://eu.i.posthog.com'; // use 'https://us.i.posthog.com' if your PostHog project is in the US region
function _initPostHog(){
  if(!POSTHOG_KEY)return;
  if(localStorage.getItem('consent_analytics')==='no')return;
  if(window.posthog&&window.posthog.__loaded)return;
  // PostHog official snippet, inlined and minified by hand.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  window.posthog.init(POSTHOG_KEY,{api_host:POSTHOG_HOST,person_profiles:'identified_only',capture_pageview:true,disable_session_recording:true});
}
// Consent banner — shows on first visit in EU-ish timezones. PostHog uses
// cookies by default; consent is required under GDPR before any tracking fires.
// After choice it stays in localStorage and never re-asks.
function _maybeShowConsent(){
  if(localStorage.getItem('consent_analytics'))return _initPostHog();
  var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}
  var isEU=/Europe\//.test(tz);
  if(!isEU){localStorage.setItem('consent_analytics','yes');_initPostHog();return;}
  var b=document.createElement('div');b.id='consent-banner';
  b.style.cssText='position:fixed;bottom:14px;left:14px;right:14px;max-width:560px;margin:0 auto;background:#0A0A0A;color:#fff;border-radius:18px;padding:16px 18px;z-index:1200;box-shadow:0 20px 60px rgba(0,0,0,.4);font-family:Inter,sans-serif;font-size:13.5px;line-height:1.55;display:flex;flex-wrap:wrap;align-items:center;gap:12px;animation:fadeUp .3s ease both';
  b.innerHTML='<div style="flex:1;min-width:220px">We use privacy-respecting product analytics (PostHog) to understand how the app is used — anonymous unless you sign in. <a href="#privacy" onclick="document.getElementById(\'consent-banner\').remove();openLegal(\'privacy\')" style="color:#22C55E;text-decoration:underline">Learn more</a></div>'+
    '<div style="display:flex;gap:8px"><button type="button" onclick="_setConsent(\'no\')" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.3);padding:8px 16px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit">Decline</button>'+
    '<button type="button" onclick="_setConsent(\'yes\')" style="background:#22C55E;color:#fff;border:none;padding:8px 18px;border-radius:999px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit">Accept</button></div>';
  document.body.appendChild(b);
}
function _setConsent(v){
  try{localStorage.setItem('consent_analytics',v);}catch(e){}
  var b=document.getElementById('consent-banner');if(b)b.remove();
  if(v==='yes')_initPostHog();
}
_maybeShowConsent();
function track(event,props){
  try{if(window.posthog&&window.posthog.capture)window.posthog.capture(event,props||{});}catch(e){}
}

const SUPA_URL='https://apnxpcehjapfhcybciqd.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbnhwY2VoamFwZmhjeWJjaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTAzMzAsImV4cCI6MjA5NDYyNjMzMH0.jx61F_MGGINbEZgMJLZNeza0mS1spO4zUr7r5ZvnfGI';

/* ── LAZY SCRIPT LOADERS ─────────────────────
   Chart.js (~250KB) and supabase-js (~120KB) are no longer in <head>.
   They are dynamically injected the first time something needs them so the
   initial HTML paint isn't blocked on parsing/executing them. */
function _loadScript(src){
  return new Promise(function(resolve,reject){
    var s=document.createElement('script');s.src=src;s.async=true;
    s.onload=function(){resolve();};
    s.onerror=function(){reject(new Error('Failed to load '+src));};
    document.head.appendChild(s);
  });
}
var _chartJsPromise=null;
function _ensureChart(){
  if(typeof Chart!=='undefined')return Promise.resolve();
  if(!_chartJsPromise)_chartJsPromise=_loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');
  return _chartJsPromise;
}
var _supaJsPromise=null;
function _ensureSupabase(){
  if(typeof supabase!=='undefined')return Promise.resolve();
  if(!_supaJsPromise)_supaJsPromise=_loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
  return _supaJsPromise;
}

var sb=null;

var CU=null,G={protein:170,weight:85,water:8,calories:2500};
var meals=[],waterCups=0;
var wExs=[],wSets=[],wStart=null,wTmr=null;
// Cache of the most-recent session for each exercise name. Populated on demand;
// drives the "Last: 80kg × 8 / 80 × 6 …" line on the active session card.
var _lastSessByEx={};
async function ensureLastSession(name){
  if(!name||!CU)return null;
  var key=name.toLowerCase();
  if(_lastSessByEx[key]!==undefined)return _lastSessByEx[key];
  _lastSessByEx[key]=null; // mark as in-flight so concurrent calls don't refetch
  try{
    var{data}=await sb.from('exercises')
      .select('name,created_at,workouts!inner(started_at,user_id),sets(weight_kg,reps,set_number)')
      .eq('user_id',CU.id).ilike('name',name)
      .order('created_at',{ascending:false}).limit(1);
    if(data&&data.length&&data[0].sets&&data[0].sets.length){
      var sets=data[0].sets.slice().sort(function(a,b){return(a.set_number||0)-(b.set_number||0);})
        .map(function(s){return{w:+s.weight_kg||0,r:+s.reps||0};});
      _lastSessByEx[key]={sets:sets,when:data[0].workouts&&data[0].workouts.started_at||null};
    }
  }catch(e){console.warn('ensureLastSession',name,e);}
  return _lastSessByEx[key];
}
function _lastSessSummary(name){
  var ls=_lastSessByEx[(name||'').toLowerCase()];
  if(!ls||!ls.sets||!ls.sets.length)return null;
  return ls.sets.slice(0,4).map(function(s){return s.w>0?(s.w+'×'+s.r):(s.r+' reps');}).join(' / ');
}
// Auto-progression target suggestion. Heuristic:
//   - If last session's top set hit its reps in full (≥6), bump weight by +2.5kg (compound) / +1kg (isolation guess by weight<25)
//   - If reps were low (<6), keep weight same and aim for +1 rep on the top set
//   - Skip for bodyweight (w=0): aim for +1 rep on the top set
// Returns null if not enough data.
function _progressionTarget(name){
  var ls=_lastSessByEx[(name||'').toLowerCase()];
  if(!ls||!ls.sets||!ls.sets.length)return null;
  var top=ls.sets.reduce(function(a,s){return s.w>a.w||(s.w===a.w&&s.r>a.r)?s:a;},ls.sets[0]);
  if(!top.r)return null;
  var nextW=top.w,nextR=top.r;
  var label='Same weight, +1 rep';
  if(top.w>0&&top.r>=6){
    nextW=top.w<25?top.w+1:top.w+2.5;
    nextR=top.r;
    label='Bump '+(top.w<25?'+1':'+2.5')+' kg, hold reps';
  }else if(top.w>0){
    nextR=top.r+1;
    label='Hold '+top.w+' kg, +1 rep';
  }else{
    nextR=top.r+1;
    label='+1 rep (bodyweight)';
  }
  return{w:nextW,r:nextR,label:label,from:{w:top.w,r:top.r}};
}
var allPRs={},prFilter='all';
var wtLog=[],wChart=null;
var chatH=[],sfood=null,bcStream=null;
var AI_PLAN=null,planDayIdx=0;
var P={gender:'male',age:0,height:0,units:'metric'};
var _selGender='male',_selUnits='metric';

/* ── INIT ─────────────────────────────────── */
/* ── OFFLINE-FIRST WRITE QUEUE ─────────────
   Writes that miss the network (offline, fetch error, Supabase down) get pushed
   to localStorage and replayed when we're back online. Designed for fire-and-forget
   inserts — does NOT cover writes whose return value the UI needs immediately
   (sign-up, photo uploads, workouts whose .id is referenced by subsequent inserts).
   Use sbQueueInsert(table, row) instead of sb.from(table).insert(row) for those. */
function _wqKey(){return 'wq_'+((CU&&CU.id)||'anon');}
function _wqRead(){try{return JSON.parse(localStorage.getItem(_wqKey())||'[]');}catch(e){return [];}}
function _wqWrite(q){try{localStorage.setItem(_wqKey(),JSON.stringify(q.slice(-500)));}catch(e){console.warn('wq write failed',e);}}
function _wqPush(item){
  var q=_wqRead();
  q.push(Object.assign({id:Date.now()+'-'+Math.random().toString(36).slice(2,7),at:new Date().toISOString()},item));
  _wqWrite(q);_updateOfflineBadge();
  // Ask the SW to replay this when connectivity returns — Chrome Android only;
  // other browsers will retry on next app open via the online listener.
  if('serviceWorker' in navigator && navigator.serviceWorker.ready){
    navigator.serviceWorker.ready.then(function(reg){
      if(reg.sync)return reg.sync.register('flush-queue').catch(function(){});
    }).catch(function(){});
  }
}
function _wqPending(){return _wqRead().length;}
// Client-side UUID so multi-table inserts (workouts → exercises → sets) can be queued
// without needing the round-trip to learn the server-assigned id.
function _genId(){
  try{if(crypto&&crypto.randomUUID)return crypto.randomUUID();}catch(e){}
  // Fallback: RFC4122-ish v4 from Math.random (not cryptographically perfect, fine for offline ids)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;var v=c==='x'?r:(r&0x3|0x8);return v.toString(16);});
}
async function sbQueueInsert(table,row){
  if(!navigator.onLine){_wqPush({op:'insert',table:table,row:row});return{queued:true};}
  try{
    var{error}=await sb.from(table).insert(row);
    if(error){_wqPush({op:'insert',table:table,row:row});return{queued:true,error:error};}
    return{queued:false};
  }catch(e){_wqPush({op:'insert',table:table,row:row});return{queued:true};}
}
async function sbQueueUpsert(table,row,opts){
  if(!navigator.onLine){_wqPush({op:'upsert',table:table,row:row,opts:opts||null});return{queued:true};}
  try{
    var q=sb.from(table).upsert(row,opts||undefined);
    var{error}=await q;
    if(error){_wqPush({op:'upsert',table:table,row:row,opts:opts||null});return{queued:true,error:error};}
    return{queued:false};
  }catch(e){_wqPush({op:'upsert',table:table,row:row,opts:opts||null});return{queued:true};}
}
async function flushWriteQueue(){
  if(!navigator.onLine||!CU)return;
  var q=_wqRead();if(!q.length)return;
  var remaining=[];
  for(var i=0;i<q.length;i++){
    var it=q[i];
    try{
      if(it.op==='insert'){
        var{error}=await sb.from(it.table).insert(it.row);
        if(error)remaining.push(it);
      }else if(it.op==='upsert'){
        var{error:e2}=await sb.from(it.table).upsert(it.row,it.opts||undefined);
        if(e2)remaining.push(it);
      }
    }catch(e){remaining.push(it);}
  }
  _wqWrite(remaining);_updateOfflineBadge();
  if(q.length&&!remaining.length)toast('Synced '+q.length+' offline change'+(q.length===1?'':'s'));
}
function _updateOfflineBadge(){
  var el=document.getElementById('offline-badge');
  if(!el){
    el=document.createElement('div');el.id='offline-badge';
    el.style.cssText='position:fixed;bottom:calc(var(--navH) + 18px);left:50%;transform:translateX(-50%);background:var(--ink,#0A0A0A);color:#fff;padding:8px 14px;border-radius:999px;font-size:12.5px;font-weight:700;font-family:Inter,sans-serif;z-index:800;box-shadow:0 4px 18px rgba(0,0,0,.3);display:none;pointer-events:none;letter-spacing:-.1px';
    document.body.appendChild(el);
  }
  var pending=_wqPending();
  var offline=!navigator.onLine;
  if(offline){el.textContent='OFFLINE · '+pending+' pending';el.style.background='#0A0A0A';el.style.display='block';}
  else if(pending>0){el.textContent='⟳ Syncing '+pending+' change'+(pending===1?'':'s');el.style.background='var(--accent-d)';el.style.display='block';}
  else{el.style.display='none';}
}
window.addEventListener('online',function(){_updateOfflineBadge();flushWriteQueue();});
window.addEventListener('offline',_updateOfflineBadge);
// Service worker can ask us to flush when Background Sync wakes it. Listen
// once at boot; idempotent if SW isn't ready yet.
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',function(e){
    if(e.data&&e.data.type==='FLUSH_QUEUE')flushWriteQueue();
  });
}

async function init(){
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(function(){});
  var av=document.getElementById('app-version');if(av)av.textContent=APP_VERSION;
  // Supabase JS is no longer loaded synchronously in <head>; fetch it now and
  // create the client. Without this, any sb.* call below crashes.
  try{await _ensureSupabase();sb=supabase.createClient(SUPA_URL,SUPA_KEY);}
  catch(e){console.error('Supabase failed to load',e);showAuth();return;}
  var session=null;
  try{var r=await sb.auth.getSession();session=r&&r.data&&r.data.session;}catch(e){console.warn('session check failed',e);}
  if(session){CU=session.user;try{_sentrySetUser(CU.id);_phIdentify(CU.id);await bootApp();}catch(e){console.warn('boot failed',e);_updateOfflineBadge();}}
  else{showAuth();}
  sb.auth.onAuthStateChange(function(event,sess){
    if(event==='SIGNED_IN'&&!CU){CU=sess.user;_sentrySetUser(CU.id);_phIdentify(CU.id);bootApp();}
    if(event==='SIGNED_OUT'){CU=null;_phReset();showAuth();}
    // Supabase fires this when the user lands back via a password-reset email link.
    // Prompt for a new password immediately so they don't stay in this special session.
    if(event==='PASSWORD_RECOVERY'){promptNewPassword();}
  });
}
function promptNewPassword(){
  // Reuse the in-app change-password modal so we don't rely on the browser's prompt()
  // (which on iOS is ugly and on PWA standalone often shows the URL bar).
  if(typeof openChangePasswordM==='function'){
    try{openChangePasswordM();return;}catch(e){console.warn('open chpw failed',e);}
  }
  // Fallback: only if the modal isn't loaded yet (edge case during boot).
  var p=window.prompt('Set your new password (min 8 characters):');
  if(!p||p.length<8)return;
  sb.auth.updateUser({password:p}).then(function(r){
    if(r.error)toast('Could not update password: '+r.error.message);
    else toast('Password updated');
  });
}

/* ── PWA INSTALL ──────────────────────────── */
var _installEv=null;
// Shows a one-time card on Home explaining "Share → Add to Home Screen" to iOS
// Safari users who aren't already running the PWA standalone. Dismissed for
// good once shown — never bug them again.
function maybeShowIosInstall(){
  if(localStorage.getItem('ios_install_seen'))return;
  if(_isStandalone())return;
  var ua=navigator.userAgent||'';
  var isIOS=/iPhone|iPad|iPod/.test(ua)&&!window.MSStream;
  var isSafari=/Safari/.test(ua)&&!/CriOS|FxiOS|EdgiOS/.test(ua);
  if(!isIOS||!isSafari)return;
  // Inject card at top of Home if not already there.
  if(document.getElementById('ios-install-card'))return;
  var home=document.getElementById('p-home');if(!home)return;
  var card=document.createElement('div');card.id='ios-install-card';
  card.className='card';
  card.style.cssText='border:1.5px solid var(--accent);background:var(--adim);position:relative;margin-bottom:14px';
  card.innerHTML='<button type="button" onclick="dismissIosInstall()" aria-label="Dismiss" style="position:absolute;top:10px;right:10px;background:none;border:none;color:var(--t3);font-size:18px;cursor:pointer;padding:6px 10px">'+ICO('x','15px')+'</button>'+
    '<div style="display:flex;align-items:center;gap:14px"><div style="font-size:30px;color:var(--sig-train)">'+ICO('phone')+'</div>'+
    '<div style="flex:1;min-width:0"><div style="font-weight:800;font-size:15px;letter-spacing:-.3px">Install AthleteOS</div>'+
    '<div class="tm" style="font-size:12.5px;margin-top:3px;line-height:1.45">Tap <b>Share</b> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M12 2v14M5 9l7-7 7 7M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/></svg> in Safari, then <b>Add to Home Screen</b>. Runs offline, gets push notifications.</div></div></div>';
  home.insertBefore(card,home.firstChild);
}
function dismissIosInstall(){
  try{localStorage.setItem('ios_install_seen','1');}catch(e){}
  var c=document.getElementById('ios-install-card');if(c)c.remove();
}
function _isStandalone(){
  // iOS Safari uses navigator.standalone; everything else uses display-mode standalone or fullscreen.
  try{
    if(window.navigator.standalone===true)return true;
    if(window.matchMedia){
      if(window.matchMedia('(display-mode: standalone)').matches)return true;
      if(window.matchMedia('(display-mode: fullscreen)').matches)return true;
      if(window.matchMedia('(display-mode: minimal-ui)').matches)return true;
    }
    // PWA launched from home screen often gets ?source=pwa or utm_source=homescreen — defensive only.
    if(/source=(pwa|homescreen)/i.test(location.search))return true;
  }catch(e){}
  return false;
}
function refreshInstallUI(){
  var card=document.getElementById('install-card');
  if(!card)return;
  // Hide on actual phones (no QR scanner needed on the same device) and when PWA is installed.
  // Show on tablet (>= 640px) and desktop where the QR is genuinely useful.
  var isTabletOrUp=window.matchMedia&&window.matchMedia('(min-width: 640px)').matches;
  if(_isStandalone()||!isTabletOrUp){card.style.display='none';return;}
  card.style.display='';
  // Generate / update the QR for the current public URL.
  var img=document.getElementById('install-qr');
  if(img){
    var base=(location.origin&&location.origin!=='null')?location.origin:'https://athleteos.app';
    var url=base+(location.pathname||'/');
    var src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data='+encodeURIComponent(url);
    if(img.dataset.src!==src){img.dataset.src=src;img.src=src;}
  }
  // The optional "install web app" button only shows when the browser fires beforeinstallprompt.
  var btn=document.getElementById('install-btn');
  if(btn){btn.classList.toggle('hidden',!_installEv);}
}
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();_installEv=e;refreshInstallUI();
});
window.addEventListener('appinstalled',function(){
  _installEv=null;refreshInstallUI();toast('Installed. Open it from your home screen.');
});
async function doInstall(){
  if(!_installEv){toast('Use your browser menu, then Add to Home Screen');return;}
  try{
    _installEv.prompt();
    var res=await _installEv.userChoice;
    if(res&&res.outcome==='accepted'){_installEv=null;refreshInstallUI();}
  }catch(e){_installEv=null;refreshInstallUI();}
}

/* ── UTILS ────────────────────────────────── */
function skelRows(n,h){var s='';for(var i=0;i<n;i++)s+='<div class="skel" style="height:'+(h||44)+'px;margin:8px 0"></div>';return s;}
function showInitialSkeletons(){
  var threeTiles='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px"><div class="skel" style="height:78px"></div><div class="skel" style="height:78px"></div><div class="skel" style="height:78px"></div></div>';
  var twoTiles='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="skel" style="height:62px"></div><div class="skel" style="height:62px"></div></div>';
  var map={
    'pr-list':skelRows(3,52),
    'pr-feed':skelRows(3,52),
    'w-hist':skelRows(3,52),
    'cd-list':skelRows(2,52),
    'meal-log':skelRows(3,52),
    'w-log':skelRows(3,42),
    'mes-grid':threeTiles,
    's-hist':skelRows(3,46),
    'wk-cmp':skelRows(4,28),
    'tpl-list':skelRows(2,52),
    'act-list':skelRows(3,48),
    'ph-grid':twoTiles
  };
  Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)el.innerHTML=map[id];});
  // Calendar grid placeholder
  var cg=document.getElementById('cal-grid');if(cg&&!cg.innerHTML)cg.innerHTML=skelRows(6,32);
  // Hide the static empty messages until data arrives
  var me=document.getElementById('mes-empty');if(me)me.style.display='none';
  var ve=document.getElementById('vol-empty');if(ve)ve.style.display='none';
}
function today(){return new Date().toISOString().split('T')[0];}
function weekStr(){var n=new Date();return n.getFullYear()+'-W'+Math.ceil(n.getDate()/7)+'-'+n.getMonth();}
function fdate(s){if(!s)return'–';var d=new Date(s+'T12:00:00');return d.toLocaleDateString('en',{month:'short',day:'numeric'});}
function pct(v,max){return Math.min(100,Math.round((v/max)*100));}
function autoH(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
// In-app prompt() replacement — opens m-input modal with a title/sub/value and resolves the callback on OK.
var _inputCb=null;
function inputModal(opts,cb){
  opts=opts||{};_inputCb=cb||null;
  document.getElementById('inp-title').textContent=opts.title||'Enter value';
  document.getElementById('inp-sub').textContent=opts.sub||'';
  var v=document.getElementById('inp-val');
  v.type=opts.type||'text';v.value=opts.value==null?'':String(opts.value);v.placeholder=opts.placeholder||'';
  if(opts.min!=null)v.min=opts.min;else v.removeAttribute('min');
  if(opts.max!=null)v.max=opts.max;else v.removeAttribute('max');
  oModal('m-input');setTimeout(function(){v.focus();v.select&&v.select();},120);
}
function _inputOk(){var v=document.getElementById('inp-val').value;var cb=_inputCb;_inputCb=null;cModal('m-input');if(cb)cb(v);}
function oModal(id){document.getElementById(id).classList.add('on');}
function cModal(id){var _m=document.getElementById(id);if(!_m)return;_m.classList.remove('on');if(id==='m-bc')stopBc();if(id==='m-exi'&&typeof _stopExGif==='function')_stopExGif();}
function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on');},3000);}
document.querySelectorAll('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)cModal(m.id);});});
