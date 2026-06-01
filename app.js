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

/* ── EXERCISE DATABASE ────────────────────── */
var EX_DB={
  'Bench Press':{an:'push_h',pri:['Chest'],sec:['Front Delts','Triceps'],desc:'The cornerstone of upper body pushing strength. Lying flat, you lower a barbell to the lower chest and drive it back up, building raw chest mass and power.',tips:['Retract and depress shoulder blades throughout the lift','Maintain a slight arch — keep your feet flat on the floor','Bar touches lower chest, not your neck']},
  'Incline Press':{an:'push_h',pri:['Upper Chest'],sec:['Front Delts','Triceps'],desc:'Shifts emphasis to the clavicular head of the chest — the upper portion that creates a full, complete chest from top to bottom.',tips:['Set bench at 30–45 degrees','Avoid excessive elbow flare','Feel the deep stretch at the bottom of each rep']},
  'Decline Press':{an:'push_h',pri:['Lower Chest'],sec:['Triceps','Front Delts'],desc:'Targets the sternal fibers of the lower chest that often go underdeveloped, creating definition along the bottom of the chest.',tips:['Secure your legs firmly before lifting','Lower bar to lower chest','Full lockout at the top']},
  'Push-up':{an:'push_h',pri:['Chest'],sec:['Triceps','Core','Front Delts'],desc:'The most accessible chest movement. Trains chest, shoulders, and triceps while building real functional pressing strength with zero equipment needed.',tips:['Brace your core like a plank throughout','Hands slightly wider than shoulders','Chest should nearly touch the floor at the bottom']},
  'Dumbbell Fly':{an:'push_h',pri:['Chest'],sec:['Front Delts'],desc:'An isolation movement that stretches the pecs fully under load — the deep stretch is what makes flies effective for building chest width.',tips:['Maintain a slight elbow bend throughout','Focus entirely on feeling the chest stretch at the bottom','Squeeze chest fibers together at the top']},
  'Cable Fly':{an:'push_h',pri:['Chest'],sec:['Front Delts'],desc:'Constant cable tension through the full range of motion makes this superior to dumbbell flies for continuous chest activation.',tips:['Cross hands slightly at the top for a stronger contraction','Keep consistent tension — no momentum','Control the return slowly']},
  'Close-Grip Bench':{an:'push_h',pri:['Triceps'],sec:['Chest','Front Delts'],desc:'A compound tricep movement that allows heavy loading. More mass-building potential than isolation tricep work alone.',tips:['Shoulder-width grip — not ultra-narrow','Keep elbows tucked close to your sides','Full range of motion is essential']},
  'Dips':{an:'push_h',pri:['Triceps','Lower Chest'],sec:['Front Delts'],desc:'A powerful compound exercise hitting triceps and chest simultaneously. Can be weighted for significant progressive overload.',tips:['Lean forward for more chest emphasis, stay upright for triceps','Lower until shoulders are below elbows','Full lockout at the top — squeeze triceps hard']},
  'Pull-up':{an:'pull_v',pri:['Lats'],sec:['Biceps','Rear Delts','Core'],desc:"The king of back exercises. Builds wide lats, strong biceps, and incredible bodyweight strength that carries over to everything.",tips:['Start from a dead hang — full stretch at the bottom','Drive your elbows down and back, not arms up','Get your chin clearly over the bar at the top']},
  'Lat Pulldown':{an:'pull_v',pri:['Lats'],sec:['Biceps','Rear Delts'],desc:'The best pull-up alternative that lets you control the load precisely for progressive overload. Critical for back width.',tips:['Lean back slightly — about 10–15 degrees','Pull the bar to your upper chest, never behind the neck','Fully stretch the lats at the top — feel the pull']},
  'Barbell Row':{an:'pull_h',pri:['Lats','Upper Back'],sec:['Biceps','Rear Delts','Core'],desc:"The premier compound back exercise for overall thickness. Nothing builds a dense, powerful back like heavy rows loaded over time.",tips:['Hinge to roughly 45 degrees — back near parallel to floor','Brace your core like a deadlift','Pull bar to your lower sternum — not your navel']},
  'Dumbbell Row':{an:'pull_h',pri:['Lats','Upper Back'],sec:['Biceps','Rear Delts'],desc:'Unilateral rowing lets each side work independently, fixing imbalances and enabling a deeper stretch than barbell rows.',tips:['Support yourself with the opposite hand on a bench','Pull your elbow past your body — feel the squeeze','Let the arm stretch fully at the bottom']},
  'Cable Row':{an:'pull_h',pri:['Lats','Mid Back'],sec:['Biceps','Rear Delts'],desc:'Constant tension seated rows that are joint-friendly and excellent for building mind-muscle connection with the back.',tips:["Don't round your lower back as you reach forward",'Sit tall and pull to your lower abdomen','Squeeze shoulder blades hard at the end of each rep']},
  'Face Pull':{an:'pull_h',pri:['Rear Delts','Upper Back'],sec:['External Rotators'],desc:'The most underrated exercise in the gym. Critical for rotator cuff health, posture, and the 3D capped shoulder look.',tips:['Pull to your forehead level — not your chin','Externally rotate at the top — thumbs pointing back','Light weight, high reps — this is shoulder health work']},
  'Deadlift':{an:'hinge',pri:['Hamstrings','Glutes','Spinal Erectors'],sec:['Quads','Core','Traps','Grip'],desc:'The most powerful full-body strength exercise. Builds muscle from the floor up — posterior chain, back, grip, and everything connecting them.',tips:['Bar stays dragging against your legs the entire way up','Take a massive breath, brace your core, then lift','Think "push the floor away" — not "pull the bar up"']},
  'Romanian Deadlift':{an:'hinge',pri:['Hamstrings','Glutes'],sec:['Lower Back','Core'],desc:'The ultimate posterior chain builder. The hamstring stretch under heavy load is what makes this one of the best exercises for leg size.',tips:['Push hips back — hinge, do not squat','Keep a soft bend in your knees throughout','Bar stays close to your legs at all times']},
  'Good Morning':{an:'hinge',pri:['Hamstrings','Spinal Erectors'],sec:['Glutes','Core'],desc:'A barbell hinge that directly loads the lower back and hamstrings through the same pattern as a deadlift, building spinal strength.',tips:['Start light — respect this exercise','Bar on upper traps, hinge forward at the hip','Feel the hamstring stretch before returning']},
  'Hip Thrust':{an:'hinge',pri:['Glutes'],sec:['Hamstrings','Core'],desc:'The single best glute isolation exercise. Peak glute activation happens at full hip extension, which hip thrusts maximize.',tips:['Drive through your heels — not your toes','Chin tucked — avoid hyperextending your lower back','Squeeze your glutes as hard as possible at the top']},
  'Squat':{an:'squat',pri:['Quads','Glutes'],sec:['Hamstrings','Core','Adductors'],desc:'The king of lower body training. Builds leg size, strength, and athletic power like nothing else. Essential for any serious program.',tips:['Push knees outward — they track over toes throughout','Hit at least parallel — hip crease below knee level','Big breath in, brace your core hard before you descend']},
  'Leg Press':{an:'squat',pri:['Quads','Glutes'],sec:['Hamstrings'],desc:'A machine squat pattern allowing heavier loads with less technical demand. An excellent complement to free weight squatting.',tips:["Don't lock knees out at the top",'Go to full depth if your lower back stays flat on the pad','Foot position changes emphasis — higher = more glutes']},
  'Bulgarian Split Squat':{an:'lunge',pri:['Quads','Glutes'],sec:['Hamstrings','Core'],desc:"The most demanding single-leg exercise you'll face. Unilateral loading exposes and corrects strength imbalances between legs.",tips:['Step far enough forward that your front knee stays behind your toes','Rear foot on the bench — instep or toes, whichever is comfortable','Keep your torso upright throughout the descent']},
  'Lunge':{an:'lunge',pri:['Quads','Glutes'],sec:['Hamstrings','Core'],desc:'A fundamental unilateral movement that builds leg strength, balance, and athletic coordination simultaneously.',tips:['Take a large enough step that your front shin stays vertical','Keep your torso tall and upright throughout','Alternate legs or work one side completely before switching']},
  'Leg Extension':{an:'extend',pri:['Quads'],sec:[],desc:'Direct quad isolation. Best used as a finishing movement after compound squatting to fully exhaust the quads with targeted work.',tips:['Control the descent — never let the weight crash down','Squeeze the quad hard with full extension at the top','Light to moderate weight — this is isolation work']},
  'Leg Curl':{an:'curl',pri:['Hamstrings'],sec:['Glutes'],desc:'Direct hamstring isolation that complements all the quad-dominant pushing movements in your program. Essential for knee health.',tips:['Keep hips pressed firmly into the pad throughout','Full range — heel travels toward your glute','Slow and controlled on the way back down']},
  'Overhead Press':{an:'push_v',pri:['Front Delts','Mid Delts'],sec:['Triceps','Upper Chest','Core'],desc:'The true test of upper body strength. Builds wide, powerful shoulders and builds a strong overhead foundation that transfers to every pressing movement.',tips:['Start with the bar at collar-bone level — the "rack position"','Tuck your chin as the bar passes your face','Lock out fully overhead — squeeze everything at the top']},
  'Arnold Press':{an:'push_v',pri:['Front Delts','Mid Delts'],sec:['Triceps','Rear Delts'],desc:"Invented by Arnold himself. The rotation through the press hits all three deltoid heads in a single fluid movement — more complete than a standard press.",tips:['Start with palms facing you at chin level','Rotate your palms outward as you press overhead','Reverse the rotation fully on the way down']},
  'Lateral Raise':{an:'curl',pri:['Mid Delts'],sec:['Front Delts','Traps'],desc:'The only exercise that directly isolates the medial deltoid — the muscle responsible for shoulder width. Cannot be adequately replaced by pressing.',tips:['Lead with your elbows, not your hands or wrists','A very slight forward lean helps target the mid delt better','Light weight, high reps — feel the burn and squeeze at the top']},
  'Front Raise':{an:'curl',pri:['Front Delts'],sec:['Mid Delts','Upper Chest'],desc:"Directly targets the anterior deltoid. Note: if you're pressing frequently, your front delts are already well developed — prioritize mid and rear instead.",tips:['Raise to eye level — no higher','Control the weight back down slowly','Alternate arms or work both together']},
  'Rear Delt Fly':{an:'pull_h',pri:['Rear Delts'],sec:['Upper Back','External Rotators'],desc:'The most neglected muscle for complete shoulder development. Rear delts create the 3D capped look and are critical for posture and shoulder health.',tips:['Hinge forward until your torso is nearly parallel to the floor','Lead with your elbows — arms slightly bent throughout','High reps and light weight — 15 to 25 per set']},
  'Barbell Curl':{an:'curl',pri:['Biceps'],sec:['Forearms','Brachialis'],desc:'The classic mass-builder for biceps. Heavy barbell curls with a supinated grip are the gold standard for building arm size.',tips:['Pin your elbows to your sides — no swinging','Full stretch at the bottom — complete range of motion','Curl through the full arc and squeeze hard at the top']},
  'Dumbbell Curl':{an:'curl',pri:['Biceps'],sec:['Forearms','Brachialis'],desc:'Greater range of motion than barbell and allows supination through the movement for peak bicep contraction at the top.',tips:['Rotate your palm upward (supinate) as you curl up','Full stretch at the bottom — complete the range','Alternate or work both arms together']},
  'Hammer Curl':{an:'curl',pri:['Brachialis','Brachioradialis'],sec:['Biceps'],desc:'Neutral grip curls that target the brachialis — the muscle under the bicep that pushes it up. Bigger brachialis means bigger-looking arms overall.',tips:['Keep thumbs pointing up throughout — neutral grip all the way','Typically heavier than regular curls due to stronger leverage','Control the descent']},
  'Tricep Pushdown':{an:'extend',pri:['Triceps'],sec:[],desc:'The most common tricep isolation movement. Constant cable tension through the full range of motion delivers a relentless pump.',tips:['Pin your elbows to your sides — they cannot move','Lock out fully at the bottom — feel the tricep squeeze','Stay upright — no leaning forward to use body weight']},
  'Skull Crusher':{an:'extend',pri:['Triceps'],sec:[],desc:'One of the best tricep mass builders. Loading the long head of the tricep in the stretched position at the bottom is what drives development.',tips:['Point your elbows toward the ceiling — do not let them flare','Lower to your forehead or behind your head for more stretch','The controlled negative is where the growth stimulus comes from']},
  'Plank':{an:'extend',pri:['Core','Transverse Abdominis'],sec:['Shoulders','Glutes'],desc:'The foundational core stability exercise. Builds the deep stabilizing muscles that protect your spine and transfer force through every lift.',tips:['Neutral spine — no sagging hips or piking your butt up','Squeeze your glutes and quads — full body tension throughout','Breathe steadily — do not hold your breath']},
  'Crunches':{an:'extend',pri:['Abs'],sec:['Hip Flexors'],desc:'The classic ab isolation movement. Most effective when performed with deliberate control and a focus on actually flexing the spine.',tips:['Do not pull your neck — hands lightly behind your head','Exhale as you crunch up, feel the abs contract','Quality reps over quantity — make every rep count']},
  'Russian Twist':{an:'curl',pri:['Obliques'],sec:['Abs','Hip Flexors'],desc:'Rotational core work that targets the obliques — the muscles that create the athletic V-taper and rotational power for every sport.',tips:['Feet off the ground increases the difficulty significantly','Rotate your shoulders — not just your arms','Move with control — no swinging or momentum']},
  'Hanging Leg Raise':{an:'pull_v',pri:['Abs','Hip Flexors'],sec:['Lats','Grip'],desc:'One of the most effective lower ab exercises. The hanging position also trains grip and lats isometrically as a bonus.',tips:["Don't swing — initiate the movement from your core",'Bend your knees if straight legs are too challenging','Exhale as you raise, inhale on the controlled descent']},
  'Ab Wheel':{an:'extend',pri:['Abs','Transverse Abdominis'],sec:['Lats','Triceps','Shoulders'],desc:'Brutally effective anti-extension core training. One of the hardest and most rewarding ab exercises for building genuine core strength.',tips:['Keep your hips level — do not let them drop or raise','Only roll out as far as you can without losing lumbar position','Start with short range and build outward over weeks']}
};

/* ── CUSTOM EXERCISES ─────────────────────── */
// Custom exercises now persist in the public.custom_exercises table (RLS-scoped).
// localStorage is kept as a hot cache so getCustomEx() is sync and offline-safe;
// loadCustomExFromServer() pulls the canonical list on boot and on writes.
function _cuexKey(){return 'customex_'+(CU&&CU.id||'anon');}
function getCustomEx(){try{return JSON.parse(localStorage.getItem(_cuexKey())||'[]');}catch(e){return [];}}
function setCustomExList(list){try{localStorage.setItem(_cuexKey(),JSON.stringify(list));}catch(e){}}
async function loadCustomExFromServer(){
  if(!sb||!CU)return;
  try{
    var{data}=await sb.from('custom_exercises').select('*').eq('user_id',CU.id).order('created_at',{ascending:false});
    if(!data)return;
    var priMap={chest:['Chest'],back:['Back'],legs:['Quads','Glutes'],shoulders:['Delts'],arms:['Biceps','Triceps'],core:['Abs'],cardio:['Cardio'],other:['Other']};
    var list=data.map(function(r){return{id:r.id,name:r.name,muscle:r.muscle||'other',pri:priMap[r.muscle]||['Other'],sec:[],desc:'Your custom exercise.',demo:r.demo_url||'',tips:r.tips||[],custom:true};});
    setCustomExList(list);
  }catch(e){console.warn('loadCustomExFromServer',e);}
}

/* ── EXERCISE INFO ────────────────────────── */
function findExInfo(name){
  if(!name)return null;
  var n=name.toLowerCase().trim();
  // Custom exercises take precedence — exact match only.
  var cust=getCustomEx();
  for(var ci=0;ci<cust.length;ci++){if((cust[ci].name||'').toLowerCase()===n)return cust[ci];}
  var keys=Object.keys(EX_DB);
  for(var i=0;i<keys.length;i++){if(keys[i].toLowerCase()===n)return EX_DB[keys[i]];}
  for(var i=0;i<keys.length;i++){if(n.indexOf(keys[i].toLowerCase())!==-1||keys[i].toLowerCase().indexOf(n)!==-1)return EX_DB[keys[i]];}
  if(n.indexOf('squat')!==-1||n.indexOf('goblet')!==-1)return EX_DB['Squat'];
  if((n.indexOf('deadlift')!==-1)&&n.indexOf('roman')===-1&&n.indexOf('rdl')===-1)return EX_DB['Deadlift'];
  if(n.indexOf('rdl')!==-1||n.indexOf('romanian')!==-1)return EX_DB['Romanian Deadlift'];
  if(n.indexOf('press')!==-1&&(n.indexOf('bench')!==-1||n.indexOf('chest')!==-1))return EX_DB['Bench Press'];
  if(n.indexOf('press')!==-1&&(n.indexOf('over')!==-1||n.indexOf('shoulder')!==-1||n.indexOf('military')!==-1||n.indexOf('ohp')!==-1))return EX_DB['Overhead Press'];
  if(n.indexOf('row')!==-1&&n.indexOf('cable')!==-1)return EX_DB['Cable Row'];
  if(n.indexOf('row')!==-1)return EX_DB['Barbell Row'];
  if(n.indexOf('pull')!==-1&&n.indexOf('up')!==-1)return EX_DB['Pull-up'];
  if(n.indexOf('curl')!==-1&&n.indexOf('hammer')!==-1)return EX_DB['Hammer Curl'];
  if(n.indexOf('curl')!==-1&&n.indexOf('leg')!==-1)return EX_DB['Leg Curl'];
  if(n.indexOf('curl')!==-1)return EX_DB['Barbell Curl'];
  if(n.indexOf('lunge')!==-1)return EX_DB['Lunge'];
  if(n.indexOf('hip')!==-1&&n.indexOf('thrust')!==-1)return EX_DB['Hip Thrust'];
  if(n.indexOf('lateral')!==-1)return EX_DB['Lateral Raise'];
  if(n.indexOf('fly')!==-1||n.indexOf('flye')!==-1)return EX_DB['Dumbbell Fly'];
  if(n.indexOf('dip')!==-1)return EX_DB['Dips'];
  if(n.indexOf('pushdown')!==-1||n.indexOf('push-down')!==-1)return EX_DB['Tricep Pushdown'];
  if(n.indexOf('plank')!==-1)return EX_DB['Plank'];
  if(n.indexOf('crunch')!==-1)return EX_DB['Crunches'];
  // Generic fallback by pattern keyword
  if(n.indexOf('press')!==-1)return{an:'push_h',pri:['Chest/Shoulders'],sec:['Triceps'],desc:'A pressing movement that builds upper body pushing strength.',tips:['Control the weight','Full range of motion','Progressive overload over time']};
  if(n.indexOf('pull')!==-1||n.indexOf('row')!==-1)return{an:'pull_h',pri:['Back'],sec:['Biceps'],desc:'A pulling movement that builds back strength and width.',tips:['Feel the muscle stretch at the start','Pull with your elbows','Control the return']};
  if(n.indexOf('leg')!==-1||n.indexOf('quad')!==-1||n.indexOf('glute')!==-1)return{an:'squat',pri:['Quads','Glutes'],sec:['Hamstrings'],desc:'A lower body movement for leg development.',tips:['Maintain proper form','Control the descent','Drive through your heels']};
  return{an:'extend',pri:['Multiple muscle groups'],sec:[],desc:'Perform this exercise with control and focus on the target muscle.',tips:['Warm up properly','Focus on feeling the muscle work','Add weight gradually over time']};
}
/* ── EXERCISE DEMO (free-exercise-db via jsdelivr) ── */
// Hand-curated mapping from our EX_DB names → free-exercise-db ids (verified).
var EX_GIF_MAP={
  'Bench Press':'Barbell_Bench_Press_-_Medium_Grip',
  'Incline Press':'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Decline Press':'Decline_Dumbbell_Bench_Press',
  'Push-up':'Pushups',
  'Dumbbell Fly':'Dumbbell_Flyes',
  'Cable Fly':'Flat_Bench_Cable_Flyes',
  'Close-Grip Bench':'Close-Grip_Barbell_Bench_Press',
  'Dips':'Dips_-_Triceps_Version',
  'Pull-up':'Pullups',
  'Lat Pulldown':'Wide-Grip_Lat_Pulldown',
  'Barbell Row':'Bent_Over_Barbell_Row',
  'Dumbbell Row':'Bent_Over_Two-Dumbbell_Row',
  'Cable Row':'Seated_Cable_Rows',
  'Face Pull':'Face_Pull',
  'Deadlift':'Barbell_Deadlift',
  'Romanian Deadlift':'Romanian_Deadlift',
  'Good Morning':'Good_Morning',
  'Hip Thrust':'Barbell_Hip_Thrust',
  'Squat':'Barbell_Squat',
  'Leg Press':'Leg_Press',
  'Bulgarian Split Squat':'Split_Squat_with_Dumbbells',
  'Lunge':'Dumbbell_Lunges',
  'Leg Extension':'Leg_Extensions',
  'Leg Curl':'Lying_Leg_Curls',
  'Overhead Press':'Standing_Military_Press',
  'Arnold Press':'Arnold_Dumbbell_Press',
  'Lateral Raise':'Side_Lateral_Raise',
  'Front Raise':'Front_Dumbbell_Raise',
  'Rear Delt Fly':'Reverse_Flyes',
  'Barbell Curl':'Barbell_Curl',
  'Dumbbell Curl':'Dumbbell_Bicep_Curl',
  'Hammer Curl':'Hammer_Curls',
  'Tricep Pushdown':'Triceps_Pushdown',
  'Skull Crusher':'EZ-Bar_Skullcrusher',
  'Plank':'Plank',
  'Crunches':'Crunches',
  'Russian Twist':'Russian_Twist',
  'Hanging Leg Raise':'Hanging_Leg_Raise',
  'Ab Wheel':'Ab_Roller'
};
var _exDb=null,_exGifTimer=null;
function _exDbNorm(s){return (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
async function _loadExDb(){
  if(_exDb)return _exDb;
  try{var cached=localStorage.getItem('athleteos_exdb_v2');if(cached){_exDb=JSON.parse(cached);return _exDb;}}catch(e){}
  try{
    var r=await fetch('https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json');
    if(!r.ok)return null;
    var full=await r.json();
    _exDb=full.filter(function(e){return e.images&&e.images.length;}).map(function(e){return{id:e.id,n:e.name,e:e.equipment||''};});
    try{localStorage.setItem('athleteos_exdb_v2',JSON.stringify(_exDb));}catch(e){}
    return _exDb;
  }catch(e){return null;}
}
function _findExGif(name){
  // 1. Curated map (canonical, accurate).
  if(EX_GIF_MAP[name])return EX_GIF_MAP[name];
  // 2. Fuzzy fallback against the catalog.
  if(!_exDb)return null;
  var n=_exDbNorm(name);
  if(!n)return null;
  var hit=_exDb.find(function(e){return _exDbNorm(e.n)===n;});
  if(hit)return hit.id;
  var cand=_exDb.filter(function(e){var en=_exDbNorm(e.n);return en.indexOf(n)!==-1||n.indexOf(en)!==-1;});
  if(!cand.length)return null;
  cand.sort(function(a,b){
    var am=/machine|cable|smith/.test(a.e),bm=/machine|cable|smith/.test(b.e);
    if(am!==bm)return am?1:-1;
    return a.n.length-b.n.length;
  });
  return cand[0].id;
}
var _exGifSpeed=500;var _exGifFrame=0;var _exGifPlaying=true;
function _stopExGif(){if(_exGifTimer){clearInterval(_exGifTimer);_exGifTimer=null;}}
function _exShowSkel(){var s=document.getElementById('exi-img-skel');if(s)s.style.display='block';var fb=document.getElementById('exi-img-fallback');if(fb)fb.style.display='none';var c=document.getElementById('exi-img-ctrls');if(c)c.style.display='none';var p=document.getElementById('exi-img-pill');if(p)p.style.display='none';}
function _exHideSkel(){var s=document.getElementById('exi-img-skel');if(s)s.style.display='none';var c=document.getElementById('exi-img-ctrls');if(c)c.style.display='flex';var p=document.getElementById('exi-img-pill');if(p)p.style.display='flex';}
function _exShowFallback(){_exHideSkel();var c=document.getElementById('exi-img-ctrls');if(c)c.style.display='none';var p=document.getElementById('exi-img-pill');if(p)p.style.display='none';var fb=document.getElementById('exi-img-fallback');if(fb)fb.style.display='flex';}
function _exPaintFrameIndicator(){var d0=document.getElementById('exi-dot-0'),d1=document.getElementById('exi-dot-1');if(d0)d0.style.opacity=_exGifFrame===0?'.95':'.30';if(d1)d1.style.opacity=_exGifFrame===1?'.95':'.30';}
function _exPaintPlayBtn(){var pi=document.getElementById('exi-play-icon');if(!pi)return;pi.innerHTML=_exGifPlaying?'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>':'<path d="M8 5v14l11-7z"/>';var t=document.getElementById('exi-img-pill-txt');if(t)t.textContent=_exGifPlaying?'PLAYING':'PAUSED';var d=document.getElementById('exi-img-pill-dot');if(d)d.style.background=_exGifPlaying?'#22C55E':'#94A3B8';}
function _exPaintSpeedBtns(){document.querySelectorAll('.exi-spd').forEach(function(b){var on=parseInt(b.dataset.s)===_exGifSpeed;b.style.background=on?'rgba(255,255,255,.18)':'none';b.style.opacity=on?'1':'.55';});}
function exDemo_togglePlay(){_exGifPlaying=!_exGifPlaying;_exPaintPlayBtn();if(_exGifPlaying)_exStartCycle();else _stopExGif();}
function exDemo_setSpeed(ms){_exGifSpeed=ms;_exPaintSpeedBtns();if(_exGifPlaying){_stopExGif();_exStartCycle();}}
function _exStartCycle(){
  _stopExGif();
  var img0=document.getElementById('exi-img-0'),img1=document.getElementById('exi-img-1');
  if(!img0||!img1)return;
  _exGifTimer=setInterval(function(){
    _exGifFrame=_exGifFrame===0?1:0;
    img0.style.opacity=_exGifFrame===0?'1':'0';
    img1.style.opacity=_exGifFrame===1?'1':'0';
    _exPaintFrameIndicator();
  },_exGifSpeed);
}
async function _loadExImg(name){
  _stopExGif();
  var img0=document.getElementById('exi-img-0'),img1=document.getElementById('exi-img-1'),
      wrap=document.getElementById('exi-img-wrap');
  if(!img0||!wrap)return;
  wrap.style.display='block';
  img0.style.opacity='0';img1.style.opacity='0';
  img0.removeAttribute('src');img1.removeAttribute('src');
  _exGifFrame=0;_exGifPlaying=true;_exPaintPlayBtn();_exPaintSpeedBtns();
  _exShowSkel();
  var id=_findExGif(name);
  if(!id){await _loadExDb();id=_findExGif(name);}
  if(!id){_exShowFallback();return;}
  var base='https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'+encodeURIComponent(id).replace(/%2F/g,'/')+'/';
  var url0=base+'0.jpg',url1=base+'1.jpg';
  var firstLoaded=false,secondLoaded=false,firstFailed=false;
  var timeout=setTimeout(function(){if(!firstLoaded&&!firstFailed){_exShowFallback();}},6500);
  img0.onload=function(){
    firstLoaded=true;clearTimeout(timeout);_exHideSkel();
    img0.style.opacity='1';_exPaintFrameIndicator();
    if(secondLoaded){_exStartCycle();}
  };
  img1.onload=function(){
    secondLoaded=true;
    if(firstLoaded){_exStartCycle();}
  };
  img0.onerror=function(){firstFailed=true;clearTimeout(timeout);_exShowFallback();};
  img1.onerror=function(){};
  img0.src=url0;img1.src=url1;
}
function openExInfo(name){
  var info=findExInfo(name);
  if(!info)return;
  if(!premCheckUse('ex_demo'))return;
  document.getElementById('exi-name').textContent=name;
  var mHtml='';
  (info.pri||[]).forEach(function(m){mHtml+='<span class="mtag p">'+m+'</span>';});
  (info.sec||[]).forEach(function(m){mHtml+='<span class="mtag s">'+m+'</span>';});
  document.getElementById('exi-muscles').innerHTML=mHtml;
  document.getElementById('exi-desc').textContent=info.desc||'';
  var tips=info.tips||[];
  document.getElementById('exi-tips').innerHTML=tips.length?'<div class="ctitle" style="margin:14px 0 8px">Key Tips</div><div class="etips">'+tips.map(function(t){return '<div class="etip"><div class="etip-dot"></div>'+t+'</div>';}).join('')+'</div>':'';
  var histEl=document.getElementById('exi-history');if(histEl)histEl.innerHTML='';
  _loadExImg(name);
  oModal('m-exi');
  _loadExHistory(name);
}
async function _loadExHistory(name){
  var el=document.getElementById('exi-history');if(!el||!CU)return;
  try{
    var{data}=await sb.from('exercises').select('name,workouts!inner(started_at,user_id),sets(weight_kg,reps)').eq('user_id',CU.id).ilike('name',name);
    var rows=(data||[]).map(function(ex){
      var maxW=0,maxR=0,setCount=(ex.sets||[]).length;
      (ex.sets||[]).forEach(function(s){if((+s.weight_kg||0)>maxW){maxW=+s.weight_kg;maxR=+s.reps||0;}});
      return{date:ex.workouts.started_at.split('T')[0],w:maxW,r:maxR,sets:setCount};
    }).filter(function(r){return r.w>0;}).sort(function(a,b){return a.date<b.date?1:-1;}).slice(0,5);
    if(!rows.length){el.innerHTML='<div class="ctitle" style="margin:14px 0 6px">History</div><p class="tm" style="font-size:13px;padding:4px 0">No sessions yet — log this exercise to track progress.</p>';return;}
    el.innerHTML='<div class="ctitle" style="margin:14px 0 6px">Recent sessions</div>'+rows.map(function(r){return '<div class="fb" style="padding:8px 0;border-bottom:1px solid var(--bdr);font-size:13px"><span class="tm">'+fdate(r.date)+' · '+r.sets+' sets</span><b style="letter-spacing:-.2px">'+fmtSet(r.w,r.r)+'</b></div>';}).join('');
  }catch(e){console.warn('_loadExHistory',e);}
}

/* ── TRAINING PLAN ────────────────────────── */
function renderPlan(){
  var sec=document.getElementById('plan-sec');
  if(!sec)return;
  if(!AI_PLAN||!AI_PLAN.days||!AI_PLAN.days.length){
    sec.innerHTML='<div class="card" style="margin-bottom:10px"><div class="fb" style="margin-bottom:10px"><div class="ctitle" style="margin:0">Your Plan</div></div><div style="text-align:center;padding:10px 0 4px"><p class="tm" style="margin-bottom:16px;line-height:1.75">Ask your AI trainer to design a personalized weekly training schedule based on your goals.</p><button type="button" class="btn-o" style="width:100%" onclick="startPlanChat()">Ask AI for a Plan</button></div></div>';
    return;
  }
  var dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var todayName=dayNames[new Date().getDay()];
  // Auto-select today if plan has today
  var todayIdx=AI_PLAN.days.findIndex(function(d){return d.day===todayName;});
  if(planDayIdx===0&&todayIdx>0)planDayIdx=todayIdx;
  var daysHtml=AI_PLAN.days.map(function(d,i){
    var isRest=d.rest||!d.exercises||!d.exercises.length;
    var isToday=d.day===todayName;
    var cls='pday'+(i===planDayIdx?' on':'')+(isRest?' rd':'');
    var short=d.day?d.day.substring(0,3):'Day';
    var label=d.name||(isRest?'Rest':'Train');
    var cnt=isRest?'Rest':(d.exercises.length+' ex');
    return '<div class="'+cls+'" onclick="selectPlanDay('+i+')" style="'+(isToday&&i!==planDayIdx?'box-shadow:0 0 0 1px var(--accent)':'')+'"><div class="pday-n">'+short+'</div><div class="pday-s">'+label+'</div><div class="pday-c">'+cnt+'</div></div>';
  }).join('');
  var sel=AI_PLAN.days[planDayIdx];
  var isRest=sel.rest||!sel.exercises||!sel.exercises.length;
  var sessHtml='';
  if(isRest){
    sessHtml='<div class="psesh" style="text-align:center;padding:20px 12px"><p class="tm">Rest day — recovery is where growth happens</p></div>';
  }else{
    var exHtml=sel.exercises.map(function(ex){
      var safeName=(ex.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return '<div class="prow"><div class="prow-n" onclick="openExInfo(\''+safeName+'\')">'+ex.name+'</div><div class="prow-m">'+(ex.sets||3)+'×'+(ex.reps||'8-12')+'</div><button class="pinfo" onclick="openExInfo(\''+safeName+'\')" title="Exercise guide"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></button></div>';
    }).join('');
    sessHtml='<div class="psesh">'+exHtml+'</div><button type="button" class="btn" style="width:100%;margin-top:10px" onclick="startPlanSession()">Start This Session</button>';
  }
  var focusStr=sel.focus?'<span class="tm" style="font-size:11px;font-weight:400"> — '+sel.focus+'</span>':'';
  sec.innerHTML='<div class="card" style="margin-bottom:10px"><div class="fb" style="margin-bottom:12px"><div class="ctitle" style="margin:0">'+(AI_PLAN.name||'Training Plan')+'</div><button type="button" class="btn-g" onclick="clearPlan()">Change</button></div><div class="plan-days">'+daysHtml+'</div><div><div style="font-size:13px;font-weight:600;color:var(--t);margin-bottom:6px">'+(sel.name||'Rest')+focusStr+'</div>'+sessHtml+'</div></div>';
}
function selectPlanDay(i){planDayIdx=i;renderPlan();}
function startPlanChat(){
  goTab('ai');
  var inp=document.getElementById('chat-in');
  inp.value='Create me a complete personalized training plan based on my goals and stats.';
  inp.focus();autoH(inp);
}
function startPlanSession(){
  var day=AI_PLAN&&AI_PLAN.days&&AI_PLAN.days[planDayIdx];
  if(!day||!day.exercises||!day.exercises.length)return;
  if(!document.getElementById('active-sess').classList.contains('hidden')){toast('Finish your current session first');return;}
  startW();
  wExs=day.exercises.map(function(ex){return{name:ex.name,muscle:'other',sets:[{weight:0,reps:0}]};});
  renderExList();
  // Prefetch last-session targets for each exercise in the loaded day, then re-render.
  Promise.all(wExs.map(function(e){return ensureLastSession(e.name);})).then(function(){renderExList();});
  toast('Session started — '+day.exercises.length+' exercises loaded');
}
function clearPlan(){AI_PLAN=null;planDayIdx=0;localStorage.removeItem('athleteos_plan_'+CU.id);renderPlan();}
function applyPlan(plan){AI_PLAN=plan;planDayIdx=0;localStorage.setItem('athleteos_plan_'+CU.id,JSON.stringify(plan));renderPlan();toast('Plan saved — check the Train tab!');}

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
  if(q.length&&!remaining.length)toast('✓ Synced '+q.length+' offline change'+(q.length===1?'':'s'));
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
  if(offline){el.textContent='● Offline · '+pending+' pending';el.style.background='#0A0A0A';el.style.display='block';}
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
    else toast('✓ Password updated');
  });
}

/* ── AUTH ─────────────────────────────────── */
function aTab(t){
  document.getElementById('tl').classList.toggle('on',t==='l');
  document.getElementById('tr2').classList.toggle('on',t==='r');
  document.getElementById('fl').classList.toggle('hidden',t!=='l');
  document.getElementById('fr').classList.toggle('hidden',t!=='r');
  document.getElementById('aerr').style.display='none';
}

async function _sbReady(){
  if(sb)return;
  await _ensureSupabase();
  if(!sb)sb=supabase.createClient(SUPA_URL,SUPA_KEY);
}
async function doLogin(){
  var u=document.getElementById('l-u').value.trim();
  var p=document.getElementById('l-p').value;
  if(!u||!p){showErr('Fill all fields');return;}
  setBtnLoad('login-btn',true);
  try{await _sbReady();}catch(e){setBtnLoad('login-btn',false);showErr('Failed to connect — check your internet and reload.');return;}
  var{error}=await sb.auth.signInWithPassword({email:u,password:p});
  setBtnLoad('login-btn',false);
  document.getElementById('resend-row').classList.add('hidden');
  if(error){
    showErr(error.message);
    if(/email|confirm/i.test(error.message))document.getElementById('resend-row').classList.remove('hidden');
    return;
  }
}

async function doReg(){
  var name=document.getElementById('r-n').value.trim();
  var email=document.getElementById('r-e').value.trim();
  var pass=document.getElementById('r-p').value;
  var wg=parseFloat(document.getElementById('r-wg').value)||85;
  var pg=parseInt(document.getElementById('r-pg').value)||170;
  if(!name){showErr('Enter your name');return;}
  if(!email||email.indexOf('@')<0){showErr('Enter a valid email');return;}
  if(pass.length<6){showErr('Password must be at least 6 characters');return;}
  setBtnLoad('reg-btn',true);
  try{await _sbReady();}catch(e){setBtnLoad('reg-btn',false);showErr('Failed to connect — check your internet and reload.');return;}
  var{data,error}=await sb.auth.signUp({email:email,password:pass,options:{data:{name:name}}});
  if(error){setBtnLoad('reg-btn',false);showErr(error.message);return;}
  if(data.user){
    await sb.from('profiles').update({name:name,protein_goal:pg,weight_goal:wg,onboarding_done:false}).eq('id',data.user.id);
    G={protein:pg,weight:wg,water:8,calories:2500};
  }
  setBtnLoad('reg-btn',false);
  if(!data.session){showErr('✓ Account created! Check your email to confirm, then sign in.');}
  track('signup');
}

async function doLogout(){
  if(!confirm('Sign out?'))return;
  await sb.auth.signOut();
}

// OAuth — requires Google provider to be enabled in Supabase Dashboard →
// Authentication → Providers. Set the redirect URL to this page's origin.
async function oauthGoogle(){
  try{await _sbReady();}catch(e){showErr('Failed to connect — check your internet.');return;}
  track('oauth_attempt',{provider:'google'});
  var{error}=await sb.auth.signInWithOAuth({
    provider:'google',
    options:{redirectTo:window.location.origin+window.location.pathname}
  });
  if(error)showErr(error.message);
}

function showAuth(){
  document.getElementById('app').style.display='none';
  var w=document.getElementById('welcome');if(w)w.classList.add('hidden');
  document.getElementById('auth').style.display='flex';
  aTab('l');
}
function welcomeContinue(tab){
  try{localStorage.setItem('aos_welcome_seen','1');}catch(e){}
  var w=document.getElementById('welcome');if(w)w.classList.add('hidden');
  var a=document.getElementById('auth');if(a)a.style.display='flex';
  aTab(tab==='r'?'r':'l');
}
function showErr(msg){var e=document.getElementById('aerr');e.textContent=msg;e.style.display='block';}
function setBtnLoad(id,on){var b=document.getElementById(id);if(!b)return;if(on){b.textContent='…';return;}b.textContent=id==='reg-btn'?'Create Account →':'Sign In →';}

/* ── BOOT ─────────────────────────────────── */
async function bootApp(){
  document.getElementById('auth').style.display='none';
  var w=document.getElementById('welcome');if(w)w.classList.add('hidden');
  document.getElementById('app').style.display='flex';
  _updateOfflineBadge();flushWriteQueue();
  if(!_voiceSupported()){var mb=document.getElementById('chat-mic-btn');if(mb)mb.style.display='none';}
  await loadGoals();
  // Fire-and-forget: keep server-side timezone fresh so push-cron fires at the
  // user's local reminder time. Cheap, runs at most once per session change.
  try{
    var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(tz&&tz!==P._timezone){sb.from('profiles').update({timezone:tz}).eq('id',CU.id).then(function(){P._timezone=tz;});}
  }catch(e){}
  // First-run? Show onboarding wizard instead of app.
  if(!P._onboardingDone){
    document.getElementById('app').style.display='none';
    showOnboarding();
    return;
  }
  var n=CU._name||CU.user_metadata?.name||CU.email.split('@')[0];
  document.getElementById('ava').textContent=n.charAt(0).toUpperCase();
  document.getElementById('sb-ava').textContent=n.charAt(0).toUpperCase();
  document.getElementById('sb-name').textContent=n;
  document.getElementById('g-sub').textContent='Protein: '+G.protein+'g · Weight: '+G.weight+'kg';
  document.getElementById('b-gw').innerHTML=G.weight+'<span class="su">kg</span>';
  showInitialSkeletons();
  // Critical path for Home: just today's row + check-in + streak. Everything
  // else (history, charts, other-tab data) is kicked off in the background
  // below so Home paints fast on cold start.
  await loadToday();
  initWGrid();renderPRs();
  AI_PLAN=JSON.parse(localStorage.getItem('athleteos_plan_'+CU.id)||'null');
  renderPlan();loadProfile();initTheme();updateProProfileUI();handlePaywallReturn();refreshInstallUI();
  await Promise.all([calcStreak(),loadCheckin()]);
  rotateCoachTip();
  // Fire-and-forget: render Home cards (each queries supabase directly).
  renderHero();renderActivityFeed();renderDailySummary();renderGettingStarted();
  loadReminderUI();
  goTab('home');
  _consumeShareHash();
  // Secondary loaders for Workout / Body / Sleep tabs. Each populates module
  // vars + re-renders its own UI on completion, so deferring is safe.
  Promise.all([
    loadWHist(),loadWtLog(),loadSleepHist(),
    loadCardio(),loadMeasure(),loadPhotos(),
    loadCalendarData(),loadTemplates(),loadCustomExFromServer(),loadCustomAch(),loadUserPrefs()
  ]).then(function(){
    initChart();renderMealSugg();renderRecipes();
    maybeShowPlanTweak();scheduleReminders();
  }).catch(function(e){console.warn('background loaders',e);});
}

/* ── GOALS ────────────────────────────────── */
async function loadGoals(){
  var{data}=await sb.from('profiles').select('*').eq('id',CU.id).maybeSingle();
  if(data){
    CU._name=data.name;
    G={protein:data.protein_goal,weight:parseFloat(data.weight_goal)||85,water:data.water_goal,calories:data.calorie_goal};
    P={
      gender:data.gender||'male',
      age:data.age||0,
      height:data.height_cm?parseFloat(data.height_cm):0,
      units:data.units||'metric'
    };
    if(data.current_weight_kg!=null)P._currentWeight=parseFloat(data.current_weight_kg);
    P._onboardingDone=!!data.onboarding_done;
    P._autoRest=data.auto_rest!==false;
    P._defaultRest=parseInt(data.default_rest_seconds)||90;
    P._isPremium=!!data.is_premium;P._premiumPlan=data.premium_plan||null;P._premiumUntil=data.premium_until||null;
    P._muscle_grow=data.muscle_grow||[];P._muscle_define=data.muscle_define||[];P._muscle_exclude=data.muscle_exclude||[];
    P._onbV2Done=!!data.onb_v2_done;P._mainGoal=data.onb_main_goal||null;P._experience=data.onb_experience||null;P._weeklyDays=data.onb_weekly_days||null;
    P._freezesUsedMonth=data.freezes_used_month||null;P._freezesUsedDates=data.freezes_used_dates||[];
    P._timezone=data.timezone||null;
    REM={
      workout:!!data.notif_workout,
      protein:!!data.notif_protein,
      water:!!data.notif_water,
      wt:data.notif_workout_time||'17:00',
      pt:data.notif_protein_time||'20:00'
    };
    try{localStorage.setItem('prof_'+CU.id,JSON.stringify(P));}catch(e){}
  }
}

/* ── NAVIGATION ───────────────────────────── */
function goTab(t){
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('on');p.classList.add('hidden');});
  document.querySelectorAll('.nv,.sb-item').forEach(function(n){n.classList.remove('on');});
  var ai=document.getElementById('p-ai');ai.classList.remove('on');
  // Reset scroll on every tab change so the new page always starts at the top.
  var content=document.querySelector('.content');if(content)content.scrollTop=0;
  if(t==='ai'){
    ai.classList.add('on');
  }else{
    var panel=document.getElementById('p-'+t);
    if(panel){panel.classList.remove('hidden');panel.classList.add('on');}
  }
  var nav=document.getElementById('n-'+t);if(nav)nav.classList.add('on');
  var sb2=document.getElementById('s-'+t);if(sb2)sb2.classList.add('on');
  if(t==='home')setTimeout(function(){renderHero();renderActivityFeed();loadRecentPRs();updateProProfileUI();maybeShowIosInstall();renderGettingStarted();},60);
  if(t==='ai')setTimeout(updateProProfileUI,60);
  if(t==='body'){setTimeout(function(){
    // initChart is normally called by the background loader chain after boot,
    // but a user can hit the Body tab before that finishes — kick it off now
    // so the weight chart paints. The promise resolves when Chart.js is ready.
    if(!wChart)initChart();else renderChart();
    renderMeasure();renderPhotos();loadVolumeChart();renderBfChart();renderWeightProjection();renderBodyMuscleMap();renderAchievements();
  },60);}
  if(t==='nutrition')setTimeout(renderMacroPie,60);
  if(t==='workout')setTimeout(function(){
    renderCalendar();renderCardio();renderHeatmap();
    showTooltip('first-newsess',{targetId:'newsess-btn',title:'Tap here to start',body:'Begin a session, pick a lift, and log your first set. We pre-fill from your last workout.'});
  },60);
  if(t==='settings')setTimeout(function(){loadReminderUI();loadAutoRestUI();refreshInstallUI();updateMuscleSummary();},60);
}

/* ── TODAY ────────────────────────────────── */
async function loadToday(){
  var td=today();
  var[{data:mealsData},{data:waterData},{data:sleepData},{data:woDone}]=await Promise.all([
    sb.from('meals').select('*').eq('user_id',CU.id).eq('logged_date',td),
    sb.from('water_logs').select('cups').eq('user_id',CU.id).eq('logged_date',td).maybeSingle(),
    sb.from('sleep_logs').select('*').eq('user_id',CU.id).eq('logged_date',td).maybeSingle(),
    sb.from('workouts').select('id').eq('user_id',CU.id).gte('started_at',td+'T00:00:00').maybeSingle()
  ]);
  meals=(mealsData||[]).map(function(m){return{id:m.id,name:m.name,protein:parseFloat(m.protein_g),carbs:parseFloat(m.carbs_g),fat:parseFloat(m.fat_g),calories:m.calories};});
  waterCups=(waterData&&waterData.cups)||0;
  document.getElementById('h-w').textContent=woDone?'✓':'–';
  if(sleepData){
    document.getElementById('h-s').innerHTML=parseFloat(sleepData.duration_hours).toFixed(1)+'<span class="su">h</span>';
    setSleepRing(parseFloat(sleepData.duration_hours));
  }
  refresh();
}

function refresh(){
  var t=meals.reduce(function(a,m){return{p:a.p+(m.protein||0),c:a.c+(m.carbs||0),f:a.f+(m.fat||0),k:a.k+(m.calories||0)};},{p:0,c:0,f:0,k:0});
  var pp=pct(t.p,G.protein),wp=pct(waterCups,G.water),kp=pct(t.k,G.calories);
  document.getElementById('h-p').innerHTML=Math.round(t.p)+'<span class="su">g</span>';
  document.getElementById('h-wa').innerHTML=(waterCups*0.25).toFixed(1)+'<span class="su">L</span>';
  document.getElementById('p-lbl').textContent=Math.round(t.p)+'/'+G.protein+'g';
  document.getElementById('w-lbl').textContent=waterCups+'/'+G.water+' cups';
  document.getElementById('k-lbl').textContent=Math.round(t.k)+' kcal';
  document.getElementById('p-bar').style.width=pp+'%';
  document.getElementById('w-bar').style.width=wp+'%';
  document.getElementById('k-bar').style.width=kp+'%';
  var pRem=Math.max(0,G.protein-Math.round(t.p));
  var re=document.getElementById('p-rem');if(re)re.textContent=pRem>0?pRem+'g left':'✅ Done!';
  document.getElementById('n-p').textContent=Math.round(t.p);
  document.getElementById('n-c').textContent=Math.round(t.c);
  document.getElementById('n-f').textContent=Math.round(t.f);
  document.getElementById('nb-p').style.width=pp+'%';
  document.getElementById('nb-c').style.width=pct(t.c,250)+'%';
  document.getElementById('nb-f').style.width=pct(t.f,80)+'%';
  document.getElementById('w-cnt').textContent=waterCups+'/'+G.water;
  renderMealLog();
  _paintRepeatMeal();
  if(document.getElementById('p-nutrition').classList.contains('on'))renderMacroPie();
}

/* ── WATER ────────────────────────────────── */
function initWGrid(){
  var g=document.getElementById('w-grid');g.innerHTML='';
  for(var i=0;i<G.water;i++){
    var d=document.createElement('div');
    d.className='wc'+(i<waterCups?' on':'');
    d.textContent='💧';
    (function(idx){d.onclick=function(){tapWater(idx);};})(i);
    g.appendChild(d);
  }
}
async function tapWater(i){waterCups=i<waterCups?i:i+1;initWGrid();refresh();await syncWater();}
async function qWater(){waterCups=Math.min(G.water,waterCups+1);initWGrid();refresh();await syncWater();toast('Water logged');}
async function syncWater(){
  await sbQueueUpsert('water_logs',{user_id:CU.id,logged_date:today(),cups:waterCups,updated_at:new Date().toISOString()},{onConflict:'user_id,logged_date'});
}

/* ── MEALS ────────────────────────────────── */
function openMealM(){oModal('m-meal');}
// ── Barcode scanner (ZXing lazy-loaded, OpenFoodFacts lookup) ──
var _bcReader=null,_bcStream=null;
function _loadZXing(){
  if(window.ZXingBrowser||window.ZXing)return Promise.resolve(window.ZXingBrowser||window.ZXing);
  return new Promise(function(resolve,reject){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js';
    s.onload=function(){resolve(window.ZXingBrowser||window.ZXing);};
    s.onerror=function(){reject(new Error('Could not load barcode scanner'));};
    document.head.appendChild(s);
  });
}
async function openBarcodeScan(){
  oModal('m-barcode');
  var status=document.getElementById('bc-status');
  status.textContent='Loading scanner…';
  var ZX;
  try{ZX=await _loadZXing();}catch(e){status.textContent='Scanner library failed to load';return;}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){status.textContent='Camera not supported in this browser';return;}
  try{
    var Reader=ZX.BrowserMultiFormatReader||(ZX.BrowserBarcodeReader);
    _bcReader=new Reader();
    var video=document.getElementById('bc-video');
    status.textContent='Point at the barcode on the package.';
    await _bcReader.decodeFromVideoDevice(undefined,video,function(result,err){
      if(result){
        var code=result.getText();
        _bcReader.reset();_bcReader=null;
        _stopBcStream();
        status.textContent='Found '+code+' — looking up product…';
        _lookupBarcode(code);
      }
    });
  }catch(e){
    console.warn('barcode start',e);
    status.textContent='Camera permission denied or unavailable';
  }
}
function _stopBcStream(){
  if(_bcStream){try{_bcStream.getTracks().forEach(function(t){t.stop();});}catch(e){}_bcStream=null;}
  var v=document.getElementById('bc-video');
  if(v&&v.srcObject){try{v.srcObject.getTracks().forEach(function(t){t.stop();});}catch(e){}v.srcObject=null;}
}
function closeBarcodeScan(){if(_bcReader){try{_bcReader.reset();}catch(e){}_bcReader=null;}_stopBcStream();cModal('m-barcode');}
async function _lookupBarcode(code){
  try{
    var r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json?fields=product_name,brands,nutriments,serving_size');
    if(!r.ok)throw new Error('OFF '+r.status);
    var j=await r.json();
    var p=j&&j.product;
    if(!p||(j.status!==1&&!p.product_name)){toast('Product not found — try entering it manually');closeBarcodeScan();return;}
    var n=p.nutriments||{};
    var nameParts=[];
    if(p.brands)nameParts.push(p.brands.split(',')[0].trim());
    if(p.product_name)nameParts.push(p.product_name);
    var serv=p.serving_size||'100 g';
    // OFF nutriments are per 100g by default unless _serving fields are present.
    var prot=Math.round((n['proteins_serving']!=null?n['proteins_serving']:n.proteins)||0);
    var carb=Math.round((n['carbohydrates_serving']!=null?n['carbohydrates_serving']:n.carbohydrates)||0);
    var fat =Math.round((n['fat_serving']!=null?n['fat_serving']:n.fat)||0);
    var kcal=Math.round((n['energy-kcal_serving']!=null?n['energy-kcal_serving']:n['energy-kcal'])||0);
    document.getElementById('mn').value=nameParts.join(' ').slice(0,80)||'Scanned item';
    document.getElementById('m-p').value=prot;
    document.getElementById('m-c').value=carb;
    document.getElementById('m-f').value=fat;
    document.getElementById('m-k').value=kcal;
    closeBarcodeScan();
    if(!document.getElementById('m-meal').classList.contains('on'))oModal('m-meal');
    toast('Per '+serv+' — adjust if needed');
  }catch(e){console.warn('OFF lookup failed',e);toast('Lookup failed — try again');closeBarcodeScan();}
}
async function saveMeal(){
  var m={name:document.getElementById('mn').value||'Meal',protein:parseFloat(document.getElementById('m-p').value)||0,carbs:parseFloat(document.getElementById('m-c').value)||0,fat:parseFloat(document.getElementById('m-f').value)||0,calories:parseFloat(document.getElementById('m-k').value)||0};
  var mealId=_genId();m.id=mealId;
  // Close modal + show toast FIRST so the UI always responds even if a downstream refresh throws.
  cModal('m-meal');
  ['mn','m-p','m-c','m-f','m-k'].forEach(function(fid){var el=document.getElementById(fid);if(el)el.value='';});
  toast('🥗 Meal logged!');
  meals.push(m);_rememberLastMeal(m);
  try{refresh();}catch(e){console.warn('saveMeal refresh failed',e);}
  await sbQueueInsert('meals',{id:mealId,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
}
function _rememberLastMeal(m){try{localStorage.setItem('lm_'+CU.id,JSON.stringify({name:m.name,protein:+m.protein||0,carbs:+m.carbs||0,fat:+m.fat||0,calories:+m.calories||0}));}catch(e){}}
function _getLastMeal(){if(meals.length>0){var x=meals[meals.length-1];var lm={name:x.name,protein:+x.protein||0,carbs:+x.carbs||0,fat:+x.fat||0,calories:+x.calories||0};_rememberLastMeal(lm);return lm;}try{var raw=localStorage.getItem('lm_'+CU.id);if(raw)return JSON.parse(raw);}catch(e){}return null;}
function _paintRepeatMeal(){var btn=document.getElementById('qa-repeat-meal'),lbl=document.getElementById('qa-repeat-meal-lbl');if(!btn||!lbl)return;var lm=_getLastMeal();if(!lm){btn.classList.add('hidden');return;}btn.classList.remove('hidden');lbl.textContent='Re-log: '+lm.name;}
async function repeatLastMeal(){
  var lm=_getLastMeal();if(!lm)return;
  var id=_genId();
  var m={id:id,name:lm.name,protein:+lm.protein||0,carbs:+lm.carbs||0,fat:+lm.fat||0,calories:+lm.calories||0};
  meals.push(m);refresh();toast('🥗 Re-logged: '+m.name);
  await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
}
function renderMealLog(){
  var el=document.getElementById('meal-log');
  if(!meals.length){el.innerHTML='<div class="empty-state"><div class="empty-ico"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="34" r="20"/><path d="M22 28c2-3 5-5 10-5s8 2 10 5"/><path d="M18 14v10M22 14v10M14 14v6c0 2 2 4 4 4M46 14v20"/><path d="M44 14c0 4 1 8 4 10v-10"/></svg></div><div class="empty-h">No meals logged today</div><div class="empty-sub">Track your macros from breakfast to dinner.</div><button type="button" class="empty-cta" onclick="openMealM()">+ Log first meal</button></div>';return;}
  el.innerHTML=meals.map(function(m,i){
    return '<div class="mc"><div class="fb"><div class="mcn">'+m.name+'</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:13px;color:var(--yel)">'+m.calories+' kcal</span><button type="button" onclick="delMeal('+(m.id?'"'+m.id+'"':i)+')" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:2px">✕</button></div></div><div class="mcm">'+m.protein+'g protein · '+m.carbs+'g carbs · '+m.fat+'g fat</div></div>';
  }).join('');
}
async function delMeal(idOrIdx){
  if(typeof idOrIdx==='string'){
    meals=meals.filter(function(m){return m.id!==idOrIdx;});
    await sb.from('meals').delete().eq('id',idOrIdx);
  }else{
    meals.splice(idOrIdx,1);
  }
  refresh();
}

var MEAL_SUGG=[{name:'Chicken Breast & Rice',protein:40,carbs:55,fat:8,calories:458},{name:'Greek Yogurt + Berries',protein:17,carbs:20,fat:4,calories:184},{name:'Eggs & Oatmeal',protein:25,carbs:45,fat:12,calories:388},{name:'Tuna Salad Wrap',protein:35,carbs:30,fat:6,calories:314},{name:'Protein Shake + Banana',protein:30,carbs:30,fat:3,calories:267},{name:'Salmon & Sweet Potato',protein:42,carbs:40,fat:14,calories:458},{name:'Cottage Cheese + Nuts',protein:22,carbs:8,fat:18,calories:278},{name:'Beef Stir-fry & Noodles',protein:38,carbs:50,fat:12,calories:464}];
var RECIPES=[
  {name:'Garlic Chicken & Jasmine Rice',protein:48,carbs:65,fat:10,calories:540,ing:['180 g chicken breast','1 cup cooked jasmine rice','1 tbsp olive oil','2 garlic cloves, minced','Pinch salt, pepper, paprika','Squeeze of lemon'],steps:['Pat the chicken dry and season with salt, pepper, and paprika.','Heat oil in a pan over medium-high. Sear chicken 4–5 min per side until cooked through.','Add garlic in the last minute; finish with lemon juice.','Slice and serve over rice.']},
  {name:'High-Protein Overnight Oats',protein:35,carbs:55,fat:9,calories:445,ing:['1/2 cup rolled oats','1 cup milk (or unsweetened almond)','1 scoop whey (~30 g protein)','1 tbsp chia seeds','1/2 banana, sliced','Cinnamon'],steps:['Stir oats, milk, whey, chia, and cinnamon in a jar.','Refrigerate overnight (≥ 6 h).','Top with banana and eat cold.']},
  {name:'Greek Yogurt Berry Parfait',protein:24,carbs:30,fat:5,calories:268,ing:['200 g 0% Greek yogurt','1/2 cup mixed berries','2 tbsp granola','1 tsp honey'],steps:['Layer yogurt, berries, and granola in a glass.','Drizzle honey on top.']},
  {name:'Egg-White Veggie Omelet',protein:32,carbs:8,fat:11,calories:266,ing:['6 egg whites + 1 whole egg','30 g feta','1/2 cup spinach','1/4 cup diced peppers','Salt, pepper'],steps:['Whisk eggs with salt and pepper.','Sauté spinach and peppers in a non-stick pan for 1–2 min.','Pour in eggs; cook on medium-low until set.','Top with feta, fold, and serve.']},
  {name:'Salmon, Sweet Potato & Broccoli',protein:38,carbs:45,fat:18,calories:510,ing:['150 g salmon fillet','1 medium sweet potato','1 cup broccoli florets','1 tbsp olive oil','Salt, pepper, lemon'],steps:['Preheat oven to 200 °C (400 °F).','Cube sweet potato and broccoli; toss with oil, salt, pepper.','Roast 25 min, adding salmon on tray for the last 12 min.','Squeeze lemon over salmon and serve.']},
  {name:'Turkey & Quinoa Power Bowl',protein:42,carbs:50,fat:14,calories:506,ing:['150 g lean ground turkey','1 cup cooked quinoa','1/2 cup black beans','1/4 avocado','Salsa, lime, cilantro'],steps:['Brown turkey in a pan with a pinch of cumin and salt.','Layer quinoa, beans, then turkey in a bowl.','Top with avocado, salsa, lime, and cilantro.']},
  {name:'Tuna Mayo Whole-Wheat Wrap',protein:32,carbs:34,fat:11,calories:340,ing:['1 can tuna in water, drained','1 tbsp Greek-yogurt mayo','1 whole-wheat wrap','Lettuce, tomato, cucumber','Black pepper'],steps:['Mix tuna with mayo and pepper.','Layer veggies and tuna on the wrap; roll tightly.','Slice in half and serve.']},
  {name:'Beef & Veggie Stir-Fry',protein:40,carbs:42,fat:14,calories:454,ing:['150 g lean beef strips','1 cup mixed stir-fry veg','1 cup cooked rice or noodles','1 tbsp soy sauce','1 tsp sesame oil','Ginger, garlic'],steps:['Heat sesame oil; quickly stir-fry beef 2 min until just browned.','Add ginger, garlic, and vegetables; toss 2–3 min.','Pour in soy sauce, serve over rice.']},
  {name:'Chickpea & Spinach Curry (Veg)',protein:22,carbs:55,fat:12,calories:418,ing:['1 can chickpeas, drained','2 cups spinach','1 cup tomato passata','1/2 onion, chopped','Garlic, ginger, curry powder','1/2 cup cooked basmati'],steps:['Sauté onion, garlic, ginger 3 min.','Add curry powder, then passata; simmer 5 min.','Add chickpeas; cook 8 min. Stir in spinach until wilted.','Serve over basmati.']},
  {name:'Banana Peanut Protein Smoothie',protein:35,carbs:48,fat:10,calories:412,ing:['1 banana','1 scoop whey or plant protein','1 tbsp peanut butter','1 cup milk','Ice, cinnamon'],steps:['Blend all ingredients until smooth.','Pour and drink immediately.']},
  {name:'Cottage Cheese & Pineapple Bowl',protein:28,carbs:22,fat:5,calories:255,ing:['1 cup low-fat cottage cheese','1/2 cup pineapple chunks','1 tbsp chopped walnuts','Mint leaves'],steps:['Spoon cottage cheese into a bowl.','Top with pineapple, walnuts, and mint.']},
  {name:'Steak Tacos (Lean)',protein:38,carbs:36,fat:14,calories:438,ing:['150 g flank steak','2 small corn tortillas','1/4 avocado','Salsa, cilantro, lime'],steps:['Season steak with salt, pepper, cumin; sear 2–3 min per side.','Rest 5 min, then slice thinly against the grain.','Warm tortillas; build tacos with steak, avocado, salsa, cilantro, lime.']}
];
var _viewingRecipe=null;
function renderRecipes(){
  var el=document.getElementById('recipe-list');if(!el)return;
  el.innerHTML=RECIPES.map(function(r,i){
    return '<div class="mc" style="cursor:pointer" onclick="openRecipe('+i+')"><div class="fb"><div class="mcn">'+r.name+'</div><span style="font-size:11px;color:var(--accent);font-weight:700">View →</span></div><div class="mcm">'+r.protein+'g P · '+r.carbs+'g C · '+r.fat+'g F · '+r.calories+' kcal</div></div>';
  }).join('');
}
function openRecipe(i){
  var r=RECIPES[i];if(!r)return;
  _viewingRecipe=r;
  document.getElementById('rc-name').textContent=r.name;
  document.getElementById('rc-macros').innerHTML='<b style="color:var(--accent)">'+r.protein+'g</b> protein · <b style="color:var(--blue)">'+r.carbs+'g</b> carbs · <b style="color:var(--yel)">'+r.fat+'g</b> fat · '+r.calories+' kcal';
  document.getElementById('rc-ing').innerHTML=r.ing.map(function(x){return '• '+x;}).join('<br>');
  document.getElementById('rc-steps').innerHTML=r.steps.map(function(x,si){return '<b style="color:var(--t)">'+(si+1)+'.</b> '+x;}).join('<br>');
  oModal('m-recipe');
}
async function logRecipeAsMeal(){
  if(!_viewingRecipe)return;
  var r=_viewingRecipe;
  var id=_genId();
  var m={id:id,name:r.name,protein:r.protein,carbs:r.carbs,fat:r.fat,calories:r.calories};
  meals.push(m);refresh();cModal('m-recipe');toast('🥗 '+r.name+' added!');
  await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
}
function renderMealSugg(){document.getElementById('meal-sugg').innerHTML=MEAL_SUGG.map(function(m,i){return '<div class="mc" style="cursor:pointer" onclick="quickAdd('+i+')"><div class="fb"><div class="mcn">'+m.name+'</div><span style="font-size:11px;color:var(--accent);font-weight:700">+ Add</span></div><div class="mcm">'+m.protein+'g protein · '+m.carbs+'g carbs · '+m.fat+'g fat · '+m.calories+' kcal</div></div>';}).join('');}
async function quickAdd(i){
  var m=Object.assign({},MEAL_SUGG[i]);
  var id=_genId();m.id=id;
  meals.push(m);refresh();toast('🥗 '+m.name+' added!');goTab('nutrition');
  await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
}

/* ── WORKOUT ──────────────────────────────── */
var wNote='';
function toggleSessNote(btn){
  var ta=document.getElementById('wn-text');if(!ta)return;
  var shown=ta.style.display!=='none';
  ta.style.display=shown?'none':'block';
  if(!shown){setTimeout(function(){ta.focus();},10);}
  if(btn)btn.textContent='📝 '+(wNote?'Edit session note':(shown?'Add session note':'Hide note'));
}
function startW(){
  if(!document.getElementById('active-sess').classList.contains('hidden'))return;
  wExs=[];wStart=Date.now();wNote='';
  var ta=document.getElementById('wn-text');if(ta){ta.value='';ta.style.display='none';}
  var tb=document.getElementById('wn-toggle');if(tb)tb.textContent='📝 Add session note';
  document.getElementById('active-sess').classList.remove('hidden');
  clearInterval(wTmr);
  wTmr=setInterval(function(){var e=Math.floor((Date.now()-wStart)/1000);document.getElementById('wtimer').textContent=Math.floor(e/60)+':'+(e%60<10?'0':'')+(e%60);},1000);
  renderExList();
}
function openExM(){wSets=[{w:'',r:''}];document.getElementById('ex-n').value='';document.getElementById('ex-m').value='chest';var hint=document.getElementById('ex-last-hint');if(hint){hint.style.display='none';hint.textContent='';}renderSets();oModal('m-ex');}
var _exNameDebounce=null;
function _onExNameInput(val){
  if(_exNameDebounce)clearTimeout(_exNameDebounce);
  var name=(val||'').trim();
  var hint=document.getElementById('ex-last-hint');
  if(!hint)return;
  if(name.length<2){hint.style.display='none';hint.textContent='';return;}
  _exNameDebounce=setTimeout(function(){_loadLastSetHint(name);},250);
}
async function _loadLastSetHint(name){
  var hint=document.getElementById('ex-last-hint');if(!hint||!CU)return;
  try{
    var{data}=await sb.from('exercises').select('workouts!inner(started_at,user_id),sets(weight_kg,reps)').eq('user_id',CU.id).ilike('name',name).order('created_at',{ascending:false}).limit(1);
    if(!data||!data.length||!data[0].sets||!data[0].sets.length){hint.style.display='none';return;}
    var sets=data[0].sets;
    var top=sets.reduce(function(a,s){var w=+s.weight_kg||0;return w>(+a.weight_kg||0)?s:a;},sets[0]);
    var w=+top.weight_kg||0,r=+top.reps||0;
    if(!r){hint.style.display='none';return;}
    var when=data[0].workouts&&data[0].workouts.started_at?' · '+fdate(data[0].workouts.started_at.split('T')[0]):'';
    hint.textContent='Last time: '+(w>0?w+' kg × '+r:r+' reps (bodyweight)')+when;
    hint.style.display='block';
  }catch(e){hint.style.display='none';}
}
function addSet(){wSets.push({w:'',r:''});renderSets();}
function fmtSet(w,r){var weight=parseFloat(w)||0;var reps=parseInt(r)||0;return weight>0?weight+'kg × '+reps:'BW × '+reps;}
function renderSets(){
  document.getElementById('sets-list').innerHTML=wSets.map(function(s,i){
    return '<div class="srow">'+
      '<div style="color:var(--t3);font-size:12px;text-align:center">'+(i+1)+'</div>'+
      '<div style="position:relative">'+
        '<input class="si" type="number" placeholder="0" value="'+s.w+'" oninput="wSets['+i+'].w=this.value" style="padding-right:30px">'+
        '<button type="button" onclick="openPlate(parseFloat(wSets['+i+'].w)||0)" aria-label="Plate calculator" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--t3);cursor:pointer;padding:6px;line-height:0">'+
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/></svg>'+
        '</button>'+
      '</div>'+
      '<input class="si" type="number" placeholder="0" value="'+s.r+'" oninput="wSets['+i+'].r=this.value">'+
      '<button type="button" onclick="wSets.splice('+i+',1);renderSets()" style="background:none;border:none;color:var(--red);font-size:16px;cursor:pointer">✕</button>'+
    '</div>';
  }).join('');
}
function saveEx(){
  var name=document.getElementById('ex-n').value.trim();
  if(!name){toast('Enter exercise name');return;}
  var valid=wSets.filter(function(s){return s.w||s.r;});
  if(!valid.length){toast('Add at least one set');return;}
  wExs.push({name:name,muscle:document.getElementById('ex-m').value,sets:valid.map(function(s){return{weight:parseFloat(s.w)||0,reps:parseInt(s.r)||0};})});
  track('exercise_logged',{muscle:document.getElementById('ex-m').value});
  _fxSetSaved();
  cModal('m-ex');renderExList();
  ensureLastSession(name).then(function(ls){if(ls)renderExList();});
  if(P._autoRest&&document.getElementById('active-sess')&&!document.getElementById('active-sess').classList.contains('hidden')){
    var s=P._defaultRest||90;
    openRest();setRest(s);
    toast('⏱ Rest started — '+s+'s');
  }
}
function renderExList(){
  var el=document.getElementById('ex-list');
  if(!wExs.length){el.innerHTML='<div class="empty-state"><div class="empty-ico"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="26" width="6" height="12" rx="2"/><rect x="52" y="26" width="6" height="12" rx="2"/><rect x="14" y="22" width="6" height="20" rx="2"/><rect x="44" y="22" width="6" height="20" rx="2"/><path d="M20 32h24"/></svg></div><div class="empty-h">No exercises yet</div><div class="empty-sub">Pick a lift and start logging sets. We’ll track every PR for you.</div><button type="button" class="empty-cta" onclick="openExM()">+ Add exercise</button></div>';return;}
  el.innerHTML=wExs.map(function(ex,idx){
    var sn=(ex.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    var noteVal=(ex.note||'').replace(/"/g,'&quot;');
    var noteShown=ex.note?'block':'none';
    var isFirst=idx===0,isLast=idx===wExs.length-1;
    var moveBtns=
      '<div style="display:flex;gap:2px;margin-left:auto">'+
        '<button type="button" aria-label="Move up" '+(isFirst?'disabled':'')+' onclick="moveEx('+idx+',-1)" style="background:none;border:none;color:'+(isFirst?'var(--t4)':'var(--t3)')+';cursor:'+(isFirst?'default':'pointer')+';padding:2px 6px;font-size:14px;line-height:1">↑</button>'+
        '<button type="button" aria-label="Move down" '+(isLast?'disabled':'')+' onclick="moveEx('+idx+',1)" style="background:none;border:none;color:'+(isLast?'var(--t4)':'var(--t3)')+';cursor:'+(isLast?'default':'pointer')+';padding:2px 6px;font-size:14px;line-height:1">↓</button>'+
        '<button type="button" aria-label="Remove" onclick="removeEx('+idx+')" style="background:none;border:none;color:var(--t3);cursor:pointer;padding:2px 6px;font-size:14px;line-height:1">✕</button>'+
      '</div>';
    var lastTargets=_lastSessSummary(ex.name);
    var target=_progressionTarget(ex.name);
    var firstSetEmpty=!ex.sets.length||(ex.sets.length===1&&!ex.sets[0].weight&&!ex.sets[0].reps);
    var lastLine=lastTargets?'<div style="font-size:11.5px;color:var(--t3);margin-top:4px;font-weight:600;letter-spacing:.2px">↻ Last: <span style="color:var(--t2);font-weight:700">'+lastTargets+'</span></div>':'';
    var targetLine=(target&&firstSetEmpty)?'<div style="font-size:11.5px;color:var(--accent-d);margin-top:4px;font-weight:700;letter-spacing:.2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span>🎯 Target: '+(target.w>0?target.w+' kg × '+target.r:target.r+' reps')+'</span><span style="font-size:10.5px;color:var(--t3);font-weight:600">'+target.label+'</span><button type="button" onclick="applyProgressionTarget('+idx+')" style="background:var(--adim);border:1px solid var(--accent);color:var(--accent-d);font-family:inherit;font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:999px;cursor:pointer;-webkit-appearance:none">Apply</button></div>':'';
    var topW=(ex.sets&&ex.sets.length)?ex.sets.reduce(function(a,s){return(parseFloat(s.weight)||0)>a?parseFloat(s.weight)||0:a;},0):0;
    return '<div class="exi">'+
      '<div class="fb"><div class="exn" onclick="openExInfo(\''+sn+'\')" style="cursor:pointer">'+ex.name+'</div><span class="tag">'+ex.muscle+'</span>'+moveBtns+'</div>'+
      lastLine+targetLine+
      '<div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+(ex.sets.length?ex.sets.map(function(s,i){return 'Set '+(i+1)+': '+fmtSet(s.weight,s.reps);}).join('  ·  '):'<span style="color:var(--t3)">No sets yet — tap +Set</span>')+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">'+
        '<button type="button" class="btn" style="padding:5px 12px;font-size:12px" onclick="openQuickSet('+idx+')">+ Set</button>'+
        '<button type="button" class="btn-g" style="padding:4px 8px;font-size:11.5px" onclick="toggleExNote('+idx+',this)">📝 '+(ex.note?'Edit note':'Add note')+'</button>'+
        '<button type="button" class="btn-g" style="padding:4px 8px;font-size:11.5px" onclick="openPlate('+topW+')" title="Plate calculator">🧮 Plates</button>'+
        '<button type="button" class="btn-g" style="padding:4px 8px;font-size:11.5px;border-color:var(--accent);color:var(--accent-d)" onclick="restForEx('+idx+')">⏱ Rest '+_fmtRestPref(getRestPref(ex.name))+'</button>'+
      '</div>'+
      '<textarea data-ex-note="'+idx+'" placeholder="How did it feel? Any form notes…" oninput="wExs['+idx+'].note=this.value" style="display:'+noteShown+';width:100%;margin-top:8px;background:var(--surface);border:1.5px solid transparent;border-radius:10px;padding:10px 12px;color:var(--t);font-family:inherit;font-size:13.5px;font-weight:500;resize:vertical;min-height:48px;outline:none">'+noteVal+'</textarea>'+
    '</div>';
  }).join('');
}
function moveEx(i,delta){
  var j=i+delta;if(j<0||j>=wExs.length)return;
  var tmp=wExs[i];wExs[i]=wExs[j];wExs[j]=tmp;
  renderExList();
}
function removeEx(i){
  if(!confirm('Remove "'+(wExs[i]&&wExs[i].name)+'" from this session?'))return;
  wExs.splice(i,1);renderExList();
}
// Apply the auto-progression target as the first set of an exercise.
function applyProgressionTarget(i){
  var ex=wExs[i];if(!ex)return;
  var t=_progressionTarget(ex.name);if(!t)return;
  ex.sets=ex.sets||[];
  if(!ex.sets.length||(ex.sets.length===1&&!ex.sets[0].weight&&!ex.sets[0].reps)){
    ex.sets=[{weight:t.w,reps:t.r}];
  }else{
    ex.sets.push({weight:t.w,reps:t.r});
  }
  renderExList();
  toast('Target set: '+(t.w>0?t.w+' kg × '+t.r:t.r+' reps'));
}

/* ── QUICK SET LOG ─────────────────────────── */
var _qsIdx=-1;
function openQuickSet(idx){
  var ex=wExs[idx];if(!ex)return;
  _qsIdx=idx;
  document.getElementById('qs-ex').textContent=ex.name;
  document.getElementById('qs-num').textContent='Set '+((ex.sets||[]).length+1);
  // Pre-fill from this session's last set, falling back to last session's matching set.
  var last=(ex.sets&&ex.sets.length)?ex.sets[ex.sets.length-1]:null;
  var ls=_lastSessByEx[(ex.name||'').toLowerCase()];
  var lastSessSet=null;
  if(!last&&ls&&ls.sets&&ls.sets.length){
    var setNum=(ex.sets||[]).length;
    lastSessSet=ls.sets[setNum]||ls.sets[ls.sets.length-1];
    if(lastSessSet)last={weight:lastSessSet.w,reps:lastSessSet.r};
  }
  document.getElementById('qs-w').value=last?(last.weight||''):'';
  document.getElementById('qs-r').value=last?(last.reps||''):'';
  var prev=document.getElementById('qs-prev');
  if(last){
    var lbl=lastSessSet?'Last time: ':'Previous: ';
    prev.textContent=lbl+fmtSet(last.weight,last.reps);
    prev.style.display='block';
  }
  else{prev.textContent='';prev.style.display='none';}
  oModal('m-quickset');
  setTimeout(function(){var w=document.getElementById('qs-w');if(w){w.focus();w.select&&w.select();}},120);
}
function saveQuickSet(){
  if(_qsIdx<0||!wExs[_qsIdx])return;
  var w=parseFloat(document.getElementById('qs-w').value)||0;
  var r=parseInt(document.getElementById('qs-r').value)||0;
  if(r<=0){toast('Enter reps');return;}
  wExs[_qsIdx].sets=wExs[_qsIdx].sets||[];
  wExs[_qsIdx].sets.push({weight:w,reps:r});
  var exName=wExs[_qsIdx].name;
  var startRest=document.getElementById('qs-rest').checked;
  cModal('m-quickset');
  renderExList();
  toast('Set logged: '+fmtSet(w,r));
  if(startRest){
    _restForExName=exName;
    var s=getRestPref(exName);
    openRest();setRest(s);
  }
}
function toggleExNote(i,btn){
  var ta=document.querySelector('textarea[data-ex-note="'+i+'"]');if(!ta)return;
  var shown=ta.style.display!=='none';
  ta.style.display=shown?'none':'block';
  if(!shown){setTimeout(function(){ta.focus();},10);}
  if(btn)btn.textContent='📝 '+((wExs[i]&&wExs[i].note)?'Edit note':(shown?'Add note':'Hide note'));
}
async function finishW(){
  if(!wExs.length){toast('Add exercises first');return;}
  clearInterval(wTmr);
  var dur=Math.floor((Date.now()-wStart)/1000/60);
  // Generate ids client-side so workouts/exercises/sets stay linked even when queued offline.
  var workoutId=_genId();
  var woPayload={id:workoutId,user_id:CU.id,started_at:new Date(wStart).toISOString(),finished_at:new Date().toISOString(),duration_seconds:dur*60};
  if(wNote&&wNote.trim())woPayload.notes=wNote.trim();
  await sbQueueInsert('workouts',woPayload);
  for(var i=0;i<wExs.length;i++){
    var ex=wExs[i];
    var exId=_genId();
    var exPayload={id:exId,workout_id:workoutId,user_id:CU.id,name:ex.name,muscle_group:ex.muscle,sort_order:i};
    if(ex.note&&ex.note.trim())exPayload.notes=ex.note.trim();
    await sbQueueInsert('exercises',exPayload);
    if(ex.sets.length){
      var setRows=ex.sets.map(function(s,si){return{id:_genId(),exercise_id:exId,user_id:CU.id,set_number:si+1,weight_kg:s.weight,reps:s.reps};});
      await sbQueueInsert('sets',setRows);
    }
  }
  var wo={id:workoutId};
  var newPRs=savePRs(wExs);
  // Snapshot summary data BEFORE we wipe wExs.
  var summary={
    dur:dur,
    kcal:estKcal(dur*60),
    sets:wExs.reduce(function(a,ex){return a+(ex.sets||[]).length;},0),
    vol:Math.round(wExs.reduce(function(a,ex){return a+(ex.sets||[]).reduce(function(b,s){return b+(parseFloat(s.weight)||0)*(parseInt(s.reps)||0);},0);},0)),
    exs:wExs.map(function(ex){return{name:ex.name,muscle:ex.muscle,sets:(ex.sets||[]).length,note:ex.note};}),
    note:wNote,
    newPRs:newPRs.slice()
  };
  document.getElementById('active-sess').classList.add('hidden');
  document.getElementById('h-w').textContent='✓';
  // Keep a global snapshot for sharing.
  _lastSummary=summary;
  wExs=[];renderExList();renderPRs();
  try{await loadWHist();}catch(e){}
  try{await calcStreak();}catch(e){}
  showWorkoutSummary(summary);
  renderDailySummary();
  if(newPRs.length){
    setTimeout(function(){celebratePRs(newPRs);},1200);
    persistPRs(wo?wo.id:null,summary.exs,newPRs);
  }
  loadRecentPRs();
  // First gentle Pro nudge after finishing a workout — only fires once ever.
  setTimeout(function(){softProNudge('first_workout','Loved the session? Try Pro free for 7 days — unlimited AI plans &amp; templates.');},2400);
}
var _lastSummary=null;
async function shareWorkout(){
  var s=_lastSummary;if(!s){toast('No workout to share');return;}
  try{
    var canvas=document.createElement('canvas');
    var W=1080,H=1350;canvas.width=W;canvas.height=H;
    var ctx=canvas.getContext('2d');
    // Background gradient
    var grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'#0E0E12');grad.addColorStop(1,'#1A2820');
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    // Subtle green halo
    var halo=ctx.createRadialGradient(W/2,260,40,W/2,260,500);
    halo.addColorStop(0,'rgba(34,197,94,.28)');halo.addColorStop(1,'rgba(34,197,94,0)');
    ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
    // Brand
    ctx.font='900 50px Inter,system-ui,sans-serif';
    ctx.textBaseline='top';
    ctx.fillStyle='#FFFFFF';ctx.fillText('Athlete',70,80);
    var aw=ctx.measureText('Athlete').width;
    ctx.fillStyle='#22C55E';ctx.fillText('OS',70+aw,80);
    // Date
    ctx.font='600 22px Inter,system-ui,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.5)';
    ctx.textAlign='right';
    ctx.fillText(new Date().toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'}),W-70,100);
    ctx.textAlign='left';
    // Main headline
    ctx.font='900 80px Inter,system-ui,sans-serif';
    ctx.fillStyle='#FFFFFF';
    ctx.fillText('Session complete',70,200);
    ctx.font='600 28px Inter,system-ui,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.6)';
    ctx.fillText(s.exs.length+' exercises · '+s.sets+' sets',70,310);
    // Stats grid 2×2
    var statBoxes=[
      {label:'DURATION',value:s.dur+' min',color:'#FFFFFF'},
      {label:'VOLUME',value:(s.vol>=1000?(s.vol/1000).toFixed(1)+'t':s.vol+'kg'),color:'#22C55E'},
      {label:'SETS',value:String(s.sets),color:'#3B82F6'},
      {label:'KCAL',value:String(s.kcal||0),color:'#F59E0B'}
    ];
    var gx=70,gy=400,gw=(W-160)/2,gh=180;
    statBoxes.forEach(function(b,i){
      var x=gx+(i%2)*(gw+20),y=gy+Math.floor(i/2)*(gh+20);
      ctx.fillStyle='rgba(255,255,255,.06)';
      _roundRect(ctx,x,y,gw,gh,20);ctx.fill();
      ctx.font='700 18px Inter,system-ui,sans-serif';
      ctx.fillStyle='rgba(255,255,255,.5)';
      ctx.fillText(b.label,x+24,y+22);
      ctx.font='900 56px Inter,system-ui,sans-serif';
      ctx.fillStyle=b.color;
      ctx.fillText(b.value,x+24,y+60);
    });
    // Exercises (up to 6)
    var ey=gy+2*(gh+20)+30;
    ctx.font='700 22px Inter,system-ui,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.5)';
    ctx.fillText('EXERCISES',70,ey);
    ey+=44;
    ctx.font='700 30px Inter,system-ui,sans-serif';
    ctx.fillStyle='#FFFFFF';
    var maxShow=Math.min(6,s.exs.length);
    for(var i=0;i<maxShow;i++){
      var ex=s.exs[i];
      ctx.fillStyle='#FFFFFF';
      ctx.fillText(ex.name,70,ey);
      ctx.font='600 22px Inter,system-ui,sans-serif';
      ctx.fillStyle='rgba(34,197,94,.85)';
      ctx.textAlign='right';
      ctx.fillText(ex.sets+' sets',W-70,ey+5);
      ctx.textAlign='left';
      ctx.font='700 30px Inter,system-ui,sans-serif';
      ey+=44;
    }
    if(s.exs.length>maxShow){
      ctx.font='600 22px Inter,system-ui,sans-serif';
      ctx.fillStyle='rgba(255,255,255,.45)';
      ctx.fillText('+ '+(s.exs.length-maxShow)+' more',70,ey);
    }
    // PRs callout
    if(s.newPRs&&s.newPRs.length){
      var py=H-220;
      ctx.fillStyle='rgba(245,158,11,.16)';
      _roundRect(ctx,70,py,W-140,90,18);ctx.fill();
      ctx.font='900 32px Inter,system-ui,sans-serif';
      ctx.fillStyle='#F59E0B';
      ctx.fillText('🏆 '+s.newPRs.length+' new PR'+(s.newPRs.length===1?'':'s')+'!',96,py+28);
    }
    // Footer
    ctx.font='600 22px Inter,system-ui,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.4)';
    ctx.textAlign='center';
    ctx.fillText('Tracked with AthleteOS',W/2,H-70);
    ctx.textAlign='left';
    // Export
    canvas.toBlob(async function(blob){
      if(!blob){toast('Could not generate image');return;}
      var file=new File([blob],'athleteos-workout.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){
        try{await navigator.share({files:[file],title:'My workout','text':'Just trained with AthleteOS 💪'});return;}catch(e){if(e&&e.name!=='AbortError')console.warn(e);}
      }
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download='athleteos-'+today()+'.png';document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
      toast('Saved to downloads 📥');
    },'image/png');
  }catch(e){console.warn('shareWorkout',e);toast('Share failed');}
}
function _roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function showWorkoutSummary(s){
  if(!s)return;
  document.getElementById('sum-dur').innerHTML=s.dur+'<span class="su">min</span>';
  document.getElementById('sum-vol').innerHTML=(s.vol>=1000?(s.vol/1000).toFixed(1)+'<span class="su">t</span>':s.vol+'<span class="su">kg</span>');
  document.getElementById('sum-sets').textContent=s.sets;
  document.getElementById('sum-kcal').innerHTML=(s.kcal||0)+'<span class="su">kcal</span>';
  var sub=s.exs.length+' exercise'+(s.exs.length===1?'':'s');
  if(s.newPRs.length)sub+=' · '+s.newPRs.length+' new PR'+(s.newPRs.length===1?'':'s');
  document.getElementById('sum-sub').textContent=sub;
  _renderSummaryVs(s);
  // PRs list
  var prW=document.getElementById('sum-prs'),prL=document.getElementById('sum-prs-list');
  if(s.newPRs.length){
    prW.style.display='block';
    prL.innerHTML=s.newPRs.map(function(n){return '<div style="padding:8px 12px;background:rgba(245,158,11,.10);border-radius:10px;margin-bottom:6px;font-weight:700;font-size:13.5px;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🏆</span>'+n+'</div>';}).join('');
  } else { prW.style.display='none'; }
  // Exercises list
  document.getElementById('sum-exs').innerHTML='<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);font-weight:700;margin-bottom:8px">Exercises</div>'+s.exs.map(function(ex){return '<div class="fb" style="padding:8px 0;border-bottom:1px solid var(--bdr);font-size:13.5px"><div><div style="font-weight:600">'+ex.name+'</div><div style="font-size:11.5px;color:var(--t3);margin-top:2px">'+ex.muscle+'</div></div><span class="tag">'+ex.sets+' set'+(ex.sets===1?'':'s')+'</span></div>';}).join('');
  // Note
  if(s.note&&s.note.trim()){
    document.getElementById('sum-note-wrap').style.display='block';
    document.getElementById('sum-note').textContent='"'+s.note.trim()+'"';
  } else { document.getElementById('sum-note-wrap').style.display='none'; }
  oModal('m-summary');
}
// Epley formula 1RM estimate
function _epley1rm(w,r){return r<=1?w:w*(1+r/30);}
// vs-last-session: query the user's previous workout (before the one just saved) and diff vol/sets/dur.
async function _renderSummaryVs(s){
  var wrap=document.getElementById('sum-vs'),rows=document.getElementById('sum-vs-rows');
  if(!wrap||!rows||!CU){if(wrap)wrap.style.display='none';return;}
  try{
    var{data}=await sb.from('workouts').select('id,duration_seconds,exercises(sets(weight_kg,reps))').eq('user_id',CU.id).order('started_at',{ascending:false}).limit(2);
    if(!data||data.length<2){wrap.style.display='none';return;}
    var prev=data[1]; // [0] is the workout we just saved
    var prevSets=0,prevVol=0;
    (prev.exercises||[]).forEach(function(ex){(ex.sets||[]).forEach(function(st){prevSets++;prevVol+=(+st.weight_kg||0)*(+st.reps||0);});});
    var prevDur=Math.round((+prev.duration_seconds||0)/60);
    function fmt(d,unit){if(d===0)return '<span style="color:var(--t2)">±0 '+unit+'</span>';var sign=d>0?'+':'';var col=d>0?'var(--accent-d)':'var(--red)';return '<span style="color:'+col+';font-weight:800">'+sign+d+' '+unit+'</span>';}
    var rowHtml=[
      ['Volume',(s.vol-prevVol),'kg'],
      ['Sets',(s.sets-prevSets),''],
      ['Duration',(s.dur-prevDur),'min']
    ].map(function(r){
      return '<div style="text-align:center"><div style="font-size:10.5px;color:var(--t3);font-weight:700;letter-spacing:.4px;text-transform:uppercase">'+r[0]+'</div><div style="font-size:14px;margin-top:2px">'+fmt(r[1],r[2])+'</div></div>';
    }).join('');
    rows.innerHTML=rowHtml;
    wrap.style.display='block';
  }catch(e){console.warn('vs-last diff',e);wrap.style.display='none';}
}
// Rough strength-training calorie burn (MET ≈ 5.0).
// kcal ≈ MET × bodyweight_kg × hours. Falls back to 75kg if no weight logged.
function estKcal(durationSeconds){
  if(!durationSeconds||durationSeconds<=0)return 0;
  var bw=(wtLog&&wtLog.length)?wtLog[wtLog.length-1].weight:75;
  return Math.round(5.0*bw*(durationSeconds/3600));
}
// Persist each new PR to personal_records. Best-effort; failures are logged.
async function persistPRs(workoutId,allExs,newPRNames){
  for(var i=0;i<allExs.length;i++){
    var ex=allExs[i];
    if(newPRNames.indexOf(ex.name)<0)continue;
    var bestSet=null,bestVal=0;
    ex.sets.forEach(function(s){
      var w=parseFloat(s.weight)||0,r=parseInt(s.reps)||0;
      var oneRm=_epley1rm(w,r);
      if(oneRm>bestVal){bestVal=oneRm;bestSet={w:w,r:r,oneRm:oneRm};}
    });
    if(!bestSet)continue;
    var prInfo=allPRs[ex.name]||{};
    var kind=prInfo.kind||'weight';
    var prevVal=kind==='1rm'?(prInfo.prevOneRm||0):kind==='reps'?(prInfo.prevReps||0):(prInfo.prevWeight||0);
    try{
      await sb.from('personal_records').insert({
        user_id:CU.id,exercise_name:ex.name,pr_type:kind,
        weight_kg:bestSet.w,reps:bestSet.r,one_rm_kg:bestSet.oneRm,
        workout_id:workoutId,prev_value:prevVal,achieved_at:new Date().toISOString()
      });
    }catch(e){console.warn('PR insert failed',e);}
  }
}
function celebratePRs(names){
  var n=names.length;
  _fxPRArpeggio();
  try{navigator.vibrate&&navigator.vibrate([60,40,60,40,120]);}catch(e){}
  var head=n===1?'New Personal Record!':n+' New Personal Records!';
  var sub=n===1?'You just topped your previous best 💪':'You smashed '+n+' lifts above your previous best';
  var KIND_LBL={weight:'Heavier',reps:'More reps','1rm':'New 1RM',new:'First entry'};
  var rows=names.slice(0,4).map(function(name){
    var p=allPRs[name]||{};
    var w=Number(p.weight||0),r=Number(p.reps||0),prev=Number(p.prevWeight||0),prevR=Number(p.prevReps||0);
    var oneRm=Number(p.oneRm||0)||_epley1rm(w,r);
    var prevOneRm=Number(p.prevOneRm||0)||_epley1rm(prev,prevR);
    var kind=p.kind||'weight';
    var deltaTxt;
    if(kind==='weight')deltaTxt=prev>0?('+'+(w-prev)+' kg'):'First entry';
    else if(kind==='reps')deltaTxt=prevR>0?('+'+(r-prevR)+' rep'+(r-prevR===1?'':'s')+' @ '+w+'kg'):'+'+r+' reps';
    else if(kind==='1rm')deltaTxt=prevOneRm>0?('+'+((oneRm-prevOneRm).toFixed(1))+' kg 1RM'):('est. 1RM '+oneRm.toFixed(1)+' kg');
    else deltaTxt='First entry';
    var oneRmTxt=(r>1&&kind!=='1rm')?(' · est. 1RM '+oneRm.toFixed(1)+' kg'):'';
    var prevTxt=prev>0?(' · prev '+prev+' kg × '+prevR):'';
    return '<div style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.20);border-radius:14px;padding:12px 14px;margin-bottom:8px;text-align:left">'
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">'
        +'<div style="flex:1;min-width:0">'
          +'<div style="font-weight:800;font-size:15px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+name+'</div>'
          +'<div style="font-size:10.5px;font-weight:800;letter-spacing:1px;opacity:.85;margin-top:3px">'+KIND_LBL[kind].toUpperCase()+' PR</div>'
        +'</div>'
        +'<div style="font-weight:900;font-size:18px;letter-spacing:-.5px;white-space:nowrap">'+w+' kg × '+r+'</div>'
      +'</div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;font-size:11.5px;opacity:.92">'
        +'<span style="text-transform:capitalize">'+(p.muscle||'')+prevTxt+'</span>'
        +'<span style="font-weight:800">'+deltaTxt+oneRmTxt+'</span>'
      +'</div>'
      +'</div>';
  }).join('');
  if(n>4)rows+='<div style="text-align:center;font-size:12.5px;opacity:.88;margin-top:2px">+ '+(n-4)+' more new PR'+(n-4===1?'':'s')+'</div>';
  var el=document.getElementById('pr-celebrate');
  if(!el){
    el=document.createElement('div');
    el.id='pr-celebrate';
    el.style.cssText='position:fixed;inset:0;z-index:950;background:rgba(10,10,15,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeUp .28s ease both;overflow-y:auto';
    document.body.appendChild(el);
  }
  el.innerHTML='<div style="background:linear-gradient(135deg,var(--accent) 0%,#A855F7 100%);color:#FFFFFF;padding:26px 22px 20px;border-radius:24px;text-align:center;width:100%;max-width:440px;box-shadow:0 24px 60px rgba(0,0,0,.4);position:relative;overflow:hidden">'
    +'<div style="font-size:56px;line-height:1;margin-bottom:8px;animation:fadeUp .5s ease both">🏆</div>'
    +'<div style="font-family:Inter,sans-serif;font-weight:900;font-size:24px;letter-spacing:-1px;margin-bottom:4px;line-height:1.15">'+head+'</div>'
    +'<div style="font-size:13.5px;line-height:1.5;opacity:.94;margin-bottom:16px">'+sub+'</div>'
    +'<div style="margin-bottom:14px">'+rows+'</div>'
    +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'
      +'<button type="button" onclick="sharePRImage(\''+(names[0]||'').replace(/\'/g,"\\\\\'")+'\')" style="all:unset;cursor:pointer;background:rgba(255,255,255,.20);color:#FFFFFF;padding:11px 18px;border-radius:999px;font-weight:700;font-size:13.5px;font-family:inherit">📲 Share</button>'
      +'<button type="button" onclick="document.getElementById(\'pr-celebrate\').remove();goTab(\'workout\');setTimeout(function(){var t=document.getElementById(\'pr-list\');if(t)t.scrollIntoView({behavior:\'smooth\',block:\'center\'});},150);" style="all:unset;cursor:pointer;background:rgba(255,255,255,.20);color:#FFFFFF;padding:11px 18px;border-radius:999px;font-weight:700;font-size:13.5px;font-family:inherit">See all PRs</button>'
      +'<button type="button" onclick="document.getElementById(\'pr-celebrate\').remove()" style="all:unset;cursor:pointer;background:#FFFFFF;color:#16A34A;padding:11px 22px;border-radius:999px;font-weight:800;font-size:13.5px;font-family:inherit">Let\'s go 💪</button>'
    +'</div>'
  +'</div>';
}
// Renders the named PR onto a 1080×1080 canvas, brands it, and opens the
// native share sheet. Falls back to a download link when Web Share isn't
// available (e.g. desktop Safari).
function sharePRRecord(name,weight,reps,prev){
  // Temporarily populate allPRs entry so sharePRImage can render from cache.
  allPRs[name]={name:name,weight:+weight||0,reps:+reps||0,prevWeight:+prev||0,oneRm:_epley1rm(+weight||0,+reps||0)};
  sharePRImage(name);
}
async function sharePRImage(name){
  var p=allPRs[name]||{};
  var w=Number(p.weight||0),r=Number(p.reps||0),prev=Number(p.prevWeight||0);
  var deltaTxt=prev>0?('+'+(w-prev)+' kg'):'New PR';
  var oneRm=Number(p.oneRm||0)||_epley1rm(w,r);
  var canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;
  var c=canvas.getContext('2d');
  // Gradient background
  var grad=c.createLinearGradient(0,0,1080,1080);
  grad.addColorStop(0,'#22C55E');grad.addColorStop(1,'#A855F7');
  c.fillStyle=grad;c.fillRect(0,0,1080,1080);
  // Subtle pattern
  c.globalAlpha=0.10;c.fillStyle='#fff';
  for(var i=0;i<14;i++){c.beginPath();c.arc(Math.random()*1080,Math.random()*1080,Math.random()*180+60,0,2*Math.PI);c.fill();}
  c.globalAlpha=1;
  // Trophy
  c.font='180px serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';
  c.fillText('🏆',540,260);
  // Headline
  c.font='900 80px Inter, sans-serif';c.fillStyle='#fff';
  c.fillText('NEW PR',540,420);
  // Exercise name
  c.font='800 70px Inter, sans-serif';c.fillStyle='rgba(255,255,255,.95)';
  var safeName=(name||'').slice(0,28);
  c.fillText(safeName,540,540);
  // Main lift figure
  c.font='900 220px Inter, sans-serif';c.fillStyle='#fff';
  c.fillText(w+' kg × '+r,540,720);
  // Delta + 1RM
  c.font='700 50px Inter, sans-serif';c.fillStyle='rgba(255,255,255,.92)';
  c.fillText(deltaTxt+(oneRm?'  ·  est. 1RM '+oneRm.toFixed(0)+' kg':''),540,830);
  // Branding
  c.font='800 44px Inter, sans-serif';c.fillStyle='rgba(255,255,255,.88)';
  c.fillText('Athlete'+'OS',540,980);
  c.font='500 26px Inter, sans-serif';c.fillStyle='rgba(255,255,255,.72)';
  c.fillText('train smart. track everything.',540,1024);
  canvas.toBlob(function(blob){
    if(!blob)return;
    var file=new File([blob],'pr-'+Date.now()+'.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:'New PR!',text:safeName+' — '+w+' kg × '+r+' on AthleteOS'})
        .catch(function(){});
    }else{
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download='pr-'+safeName.replace(/\s+/g,'-').toLowerCase()+'.png';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},5000);
      toast('PR image downloaded');
    }
  },'image/png');
}
// Pull recent PRs from DB for the Home feed.
var recentPRs=[];
async function loadRecentPRs(){
  try{
    var{data}=await sb.from('personal_records').select('*').eq('user_id',CU.id).order('achieved_at',{ascending:false}).limit(5);
    recentPRs=data||[];renderRecentPRs();
  }catch(e){console.warn('loadRecentPRs',e);}
}
function renderRecentPRs(){
  var el=document.getElementById('pr-feed');if(!el)return;
  if(!recentPRs.length){el.innerHTML='<div class="empty-state" style="padding:14px 8px"><div class="empty-ico" style="background:rgba(245,158,11,.12);color:#F59E0B"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14h24v12c0 7-5 12-12 12s-12-5-12-12V14z"/><path d="M20 18H12v4c0 4 3 7 8 8M44 18h8v4c0 4-3 7-8 8"/><path d="M32 38v8M24 52h16l-2-6H26l-2 6z"/></svg></div><div class="empty-h">No PRs yet</div><div class="empty-sub">Finish your first session to set a baseline — every win gets celebrated here.</div><button type="button" class="empty-cta" onclick="goTab(\'workout\')">Start a workout →</button></div>';return;}
  el.innerHTML=recentPRs.slice(0,5).map(function(pr){
    var d=new Date(pr.achieved_at);
    var when=fdate(d.toISOString().split('T')[0]);
    var safe=(pr.exercise_name||'').replace(/'/g,"\\'");
    var delta='';
    if(pr.prev_value&&pr.weight_kg){
      var diff=parseFloat(pr.weight_kg)-parseFloat(pr.prev_value);
      if(diff>0)delta='<span class="prd dup" style="margin-left:auto;flex-shrink:0">+'+diff.toFixed(1)+'kg</span>';
    }
    var prevVal=parseFloat(pr.prev_value||0)||0;
    return '<div class="act-row" onclick="openExChart(\''+safe+'\')" style="cursor:pointer">'+
      '<div class="act-ico" style="background:rgba(245,158,11,.16);color:#F59E0B">🏆</div>'+
      '<div class="act-body">'+
        '<div class="act-title">'+pr.exercise_name+'</div>'+
        '<div class="act-meta">'+parseFloat(pr.weight_kg||0).toFixed(1)+' kg × '+(pr.reps||0)+' reps · '+when+'</div>'+
      '</div>'+
      delta+
      '<button type="button" class="pr-share-btn" aria-label="Share PR" onclick="event.stopPropagation();sharePRRecord(\''+safe+'\','+parseFloat(pr.weight_kg||0)+','+(pr.reps||0)+','+prevVal+')">'+
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>'+
      '</button>'+
    '</div>';
  }).join('');
}
function savePRs(exs){
  var wk=weekStr(),newPRs=[];
  exs.forEach(function(ex){
    // Top set by weight (with best reps at that weight) and best estimated 1RM across the session.
    var maxW=0;ex.sets.forEach(function(s){if((+s.weight||0)>maxW)maxW=+s.weight||0;});
    var maxR=0;ex.sets.forEach(function(s){if((+s.weight||0)===maxW&&(+s.reps||0)>maxR)maxR=+s.reps||0;});
    var maxOneRm=0;ex.sets.forEach(function(s){var w=+s.weight||0,r=+s.reps||0;if(!r)return;var o=_epley1rm(w,r);if(o>maxOneRm)maxOneRm=o;});
    if(!maxW&&!maxR)return; // no logged work
    var cur=allPRs[ex.name];
    var oneRmRounded=Math.round(maxOneRm*10)/10;
    if(!cur){
      allPRs[ex.name]={name:ex.name,muscle:ex.muscle,weight:maxW,reps:maxR,oneRm:oneRmRounded,prevWeight:0,prevReps:0,prevOneRm:0,kind:'new',week:wk,date:today()};
      newPRs.push(ex.name);
      return;
    }
    // Roll the previous-week pointer once per ISO week.
    if(cur.week!==wk){
      allPRs[ex.name].prevWeight=cur.weight;
      allPRs[ex.name].prevReps=cur.reps;
      allPRs[ex.name].prevOneRm=cur.oneRm||_epley1rm(cur.weight||0,cur.reps||0);
      allPRs[ex.name].week=wk;
    }
    var kinds=[];
    if(maxW>(cur.weight||0))kinds.push('weight');
    else if(maxW===(cur.weight||0)&&maxR>(cur.reps||0))kinds.push('reps');
    if(oneRmRounded>(cur.oneRm||_epley1rm(cur.weight||0,cur.reps||0)||0))kinds.push('1rm');
    if(kinds.length){
      allPRs[ex.name].weight=Math.max(cur.weight||0,maxW);
      if(maxW>=(cur.weight||0))allPRs[ex.name].reps=maxR;
      allPRs[ex.name].oneRm=Math.max(cur.oneRm||0,oneRmRounded);
      allPRs[ex.name].muscle=ex.muscle||cur.muscle;
      allPRs[ex.name].date=today();
      allPRs[ex.name].kind=kinds[0]; // primary kind for the celebration label
      newPRs.push(ex.name);
    }
  });
  localStorage.setItem('prs_'+CU.id,JSON.stringify(allPRs));
  return newPRs;
}
function renderPRs(){allPRs=JSON.parse(localStorage.getItem('prs_'+CU.id)||'{}');showPRs();}
function filterPR(m,el){prFilter=m;document.querySelectorAll('.pill').forEach(function(p){p.classList.remove('on');});el.classList.add('on');showPRs();}
function showPRs(){
  var list=Object.values(allPRs).filter(function(p){return prFilter==='all'||p.muscle===prFilter;});
  var el=document.getElementById('pr-list');
  if(!list.length){el.innerHTML='<div class="empty-state"><div class="empty-ico" style="background:rgba(245,158,11,.12);color:#F59E0B"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14h24v12c0 7-5 12-12 12s-12-5-12-12V14z"/><path d="M20 18H12v4c0 4 3 7 8 8M44 18h8v4c0 4-3 7-8 8"/><path d="M32 38v8M24 52h16l-2-6H26l-2 6z"/></svg></div><div class="empty-h">No personal records yet</div><div class="empty-sub">Log a workout — every top set, rep PR, and estimated 1RM is tracked automatically.</div><button type="button" class="empty-cta" onclick="goTab(\'workout\')">Start a workout →</button></div>';return;}
  el.innerHTML=list.map(function(pr){var d=pr.weight-(pr.prevWeight||0);var cls=d>0?'dup':d<0?'ddn':'deq';var lbl=d>0?'+'+d+'kg':d<0?d+'kg':'–';var safe=pr.name.replace(/'/g,"\\'");return '<div class="pri" style="cursor:pointer" onclick="openExChart(\''+safe+'\')"><div><div class="prn">'+pr.name+'</div><div class="prs">'+pr.muscle+' · '+pr.reps+' reps</div></div><div style="display:flex;align-items:center;gap:9px"><div><div class="prv">'+pr.weight+'kg</div>'+(pr.prevWeight?'<div style="font-size:10.5px;color:var(--t3)">prev: '+pr.prevWeight+'kg</div>':'')+'</div><span class="prd '+cls+'">'+lbl+'</span></div></div>';}).join('');
}
// BEST: top-pick ordering for the Exercise Library muscle browse (no separate "Best Lifts" card).
var BEST={chest:['Bench Press','Incline Press','Dumbbell Fly'],back:['Deadlift','Barbell Row','Pull-up','Lat Pulldown'],legs:['Squat','Romanian Deadlift','Hip Thrust','Leg Press'],shoulders:['Overhead Press','Lateral Raise','Face Pull'],arms:['Barbell Curl','Tricep Pushdown','Hammer Curl'],core:['Plank','Ab Wheel','Hanging Leg Raise']};

/* ── HEATMAP ──────────────────────────────── */
async function renderHeatmap(){
  var grid=document.getElementById('hm-grid'),count=document.getElementById('hm-count');
  if(!grid||!CU)return;
  var WEEKS=26;
  var now=new Date();var endDay=new Date(now);endDay.setHours(23,59,59,999);
  // Find Monday of the current week
  var dow=now.getDay();var diff=dow===0?6:dow-1;
  var endMon=new Date(now);endMon.setDate(now.getDate()-diff);endMon.setHours(0,0,0,0);
  var startMon=new Date(endMon);startMon.setDate(endMon.getDate()-(WEEKS-1)*7);
  var{data}=await sb.from('workouts').select('started_at').eq('user_id',CU.id).gte('started_at',startMon.toISOString());
  var counts={};
  (data||[]).forEach(function(w){var d=w.started_at.split('T')[0];counts[d]=(counts[d]||0)+1;});
  var html='';
  for(var col=0;col<WEEKS;col++){
    var colHtml='<div class="hm-col">';
    for(var row=0;row<7;row++){
      var d=new Date(startMon);d.setDate(startMon.getDate()+col*7+row);
      var ds=d.toISOString().split('T')[0];
      var future=d.getTime()>endDay.getTime();
      var c=counts[ds]||0;
      var lv=c>=3?3:c>=2?2:c>=1?1:0;
      var cls='hm-cell'+(lv>0?' lv'+lv:'')+(future?' future':'');
      colHtml+='<div class="'+cls+'" title="'+fdate(ds)+(c?' · '+c+' workout'+(c===1?'':'s'):'')+'"></div>';
    }
    colHtml+='</div>';
    html+=colHtml;
  }
  grid.className='hm-grid';
  grid.innerHTML=html;
  if(count){var total=Object.keys(counts).length;count.textContent=total+' active day'+(total===1?'':'s');}
}

/* ── ACHIEVEMENTS ──────────────────────────── */
// Custom achievements (user-defined milestones). Loaded from public.custom_achievements
// and merged into the rendering. Each row has {id, name, icon, metric, target} — the
// metric must match a key in the `ctx` object built by renderAchievements().
var CUSTOM_ACH=[];
var ACH_METRIC_LABEL={workouts:'workouts',streak:'-day streak',maxPR:'kg PR',sleepCount:'sleep logs',photos:'photos',meals:'meals',weightLogs:'weight logs',longestMin:'min session',maxVol:'kg in a session'};
async function loadCustomAch(){
  if(!sb||!CU)return;
  try{
    var{data}=await sb.from('custom_achievements').select('*').eq('user_id',CU.id).order('created_at',{ascending:false});
    CUSTOM_ACH=(data||[]).map(function(r){
      return{
        id:'cu_'+r.id,_dbId:r.id,ico:r.icon||'🎯',name:r.name,
        desc:_descFor(r.metric,r.target),
        custom:true,metric:r.metric,target:+r.target,
        check:function(c){return (c[r.metric]||0)>=+r.target;}
      };
    });
  }catch(e){console.warn('loadCustomAch',e);}
}
function _descFor(metric,target){
  if(metric==='streak')return target+'-day streak';
  if(metric==='maxPR')return 'PR ≥ '+target+' kg';
  if(metric==='longestMin')return target+'+ min session';
  if(metric==='maxVol')return target+' kg in a session';
  return target+' '+(ACH_METRIC_LABEL[metric]||metric);
}
function openCustomAch(){
  document.getElementById('cuach-n').value='';
  document.getElementById('cuach-i').value='🏆';
  document.getElementById('cuach-metric').value='workouts';
  document.getElementById('cuach-target').value='';
  oModal('m-cuach');
}
async function saveCustomAch(){
  var name=document.getElementById('cuach-n').value.trim();
  var icon=document.getElementById('cuach-i').value.trim()||'🎯';
  var metric=document.getElementById('cuach-metric').value;
  var target=parseFloat(document.getElementById('cuach-target').value);
  if(!name){toast('Enter a name');return;}
  if(!target||target<=0){toast('Enter a target > 0');return;}
  if(!sb||!CU){toast('Sign in to save');return;}
  try{
    var{error}=await sb.from('custom_achievements').insert({user_id:CU.id,name:name,icon:icon,metric:metric,target:target});
    if(error)throw error;
    cModal('m-cuach');toast('Achievement added');
    await loadCustomAch();renderAchievements();
  }catch(e){console.warn('saveCustomAch',e);toast('Failed to save');}
}
async function deleteCustomAch(dbId){
  if(!confirm('Delete this achievement?'))return;
  if(!sb||!CU)return;
  try{
    await sb.from('custom_achievements').delete().eq('user_id',CU.id).eq('id',dbId);
    await loadCustomAch();renderAchievements();
  }catch(e){console.warn('deleteCustomAch',e);}
}
var ACHIEVEMENTS=[
  {id:'first',ico:'🎯',name:'First Step',desc:'Log 1 workout',check:function(c){return c.workouts>=1;}},
  {id:'wo10',ico:'⭐',name:'Tenth Time',desc:'10 workouts',check:function(c){return c.workouts>=10;}},
  {id:'wo50',ico:'🏆',name:'Half Century',desc:'50 workouts',check:function(c){return c.workouts>=50;}},
  {id:'wo100',ico:'💯',name:'Century Club',desc:'100 workouts',check:function(c){return c.workouts>=100;}},
  {id:'streak3',ico:'🔥',name:'Warming Up',desc:'3-day streak',check:function(c){return c.streak>=3;}},
  {id:'streak7',ico:'⚡',name:'On Fire',desc:'7-day streak',check:function(c){return c.streak>=7;}},
  {id:'streak30',ico:'🚀',name:'Unstoppable',desc:'30-day streak',check:function(c){return c.streak>=30;}},
  {id:'pr60',ico:'🪨',name:'Solid',desc:'PR ≥ 60 kg',check:function(c){return c.maxPR>=60;}},
  {id:'pr100',ico:'💪',name:'Triple Digits',desc:'PR ≥ 100 kg',check:function(c){return c.maxPR>=100;}},
  {id:'pr140',ico:'🦏',name:'Beast',desc:'PR ≥ 140 kg',check:function(c){return c.maxPR>=140;}},
  {id:'sleep7',ico:'🌙',name:'Well-Rested',desc:'7 sleep logs',check:function(c){return c.sleepCount>=7;}},
  {id:'photo1',ico:'📸',name:'Documented',desc:'1st progress photo',check:function(c){return c.photos>=1;}},
  {id:'meal50',ico:'🥗',name:'Nutrition Aware',desc:'50 meals logged',check:function(c){return c.meals>=50;}},
  {id:'weight10',ico:'⚖️',name:'Tracker',desc:'10 weight logs',check:function(c){return c.weightLogs>=10;}},
  {id:'long90',ico:'⏱️',name:'Marathon',desc:'90+ min session',check:function(c){return c.longestMin>=90;}},
  {id:'vol1000',ico:'🏋️',name:'Volume King',desc:'1000 kg in a session',check:function(c){return c.maxVol>=1000;}}
];
async function renderAchievements(){
  var grid=document.getElementById('ach-grid'),count=document.getElementById('ach-count');
  if(!grid||!CU)return;
  // Aggregate context — single round of parallel queries.
  var since=new Date();since.setDate(since.getDate()-365);
  var[wos,prs,sleeps,phs,meals,wts]=await Promise.all([
    sb.from('workouts').select('id,duration_seconds,exercises(sets(weight_kg,reps))').eq('user_id',CU.id),
    sb.from('personal_records').select('weight_kg').eq('user_id',CU.id).order('weight_kg',{ascending:false}).limit(1),
    sb.from('sleep_logs').select('id',{count:'exact',head:true}).eq('user_id',CU.id),
    sb.from('progress_photos').select('id',{count:'exact',head:true}).eq('user_id',CU.id),
    sb.from('meals').select('id',{count:'exact',head:true}).eq('user_id',CU.id),
    sb.from('weight_logs').select('id',{count:'exact',head:true}).eq('user_id',CU.id)
  ]);
  var wList=wos.data||[];
  var longestMin=0,maxVol=0;
  wList.forEach(function(w){
    var min=(w.duration_seconds||0)/60;if(min>longestMin)longestMin=min;
    var vol=0;(w.exercises||[]).forEach(function(ex){(ex.sets||[]).forEach(function(s){vol+=(+s.weight_kg||0)*(+s.reps||0);});});
    if(vol>maxVol)maxVol=vol;
  });
  var ctx={
    workouts:wList.length,
    streak:_streakCount||0,
    maxPR:(prs.data&&prs.data[0]&&+prs.data[0].weight_kg)||0,
    sleepCount:sleeps.count||0,
    photos:phs.count||0,
    meals:meals.count||0,
    weightLogs:wts.count||0,
    longestMin:Math.round(longestMin),
    maxVol:Math.round(maxVol)
  };
  var all=ACHIEVEMENTS.concat(CUSTOM_ACH);
  var unlocked=0;
  grid.innerHTML=all.map(function(a){
    var got=false;try{got=!!a.check(ctx);}catch(e){got=false;}
    if(got)unlocked++;
    var del=a.custom?'<button type="button" onclick="event.stopPropagation();deleteCustomAch(\''+a._dbId+'\')" style="position:absolute;top:4px;right:4px;background:none;border:none;color:var(--t3);font-size:13px;cursor:pointer;padding:2px 5px;line-height:1" title="Delete">✕</button>':'';
    return '<div class="ach '+(got?'on':'off')+'" style="position:relative" title="'+a.desc+'">'+del+'<div class="ach-ico">'+a.ico+'</div><div class="ach-name">'+a.name+'</div><div class="ach-desc">'+a.desc+'</div></div>';
  }).join('');
  if(count)count.textContent=unlocked+'/'+all.length;
}

/* ── MUSCLE BROWSER ────────────────────────── */
var MUSCLE_GROUPS={
  chest:{label:'Chest exercises',muscles:['Chest','Upper Chest','Lower Chest']},
  back:{label:'Back exercises',muscles:['Lats','Upper Back','Mid Back']},
  shoulders:{label:'Shoulder exercises',muscles:['Front Delts','Mid Delts','Rear Delts']},
  arms:{label:'Arm exercises',muscles:['Biceps','Triceps','Brachialis','Brachioradialis','Forearms']},
  legs:{label:'Leg exercises',muscles:['Quads','Glutes','Hamstrings','Adductors']},
  core:{label:'Core exercises',muscles:['Abs','Core','Obliques','Transverse Abdominis','Hip Flexors']}
};
function _exercisesForGroup(groupKey){
  var bestList=BEST[groupKey]||[];
  var bestRank={};bestList.forEach(function(n,i){bestRank[n]=i;});
  var g=MUSCLE_GROUPS[groupKey];if(!g)return{best:[],rest:[]};
  var muscleSet={};g.muscles.forEach(function(m){muscleSet[m]=true;});
  var best=[],rest=[];
  Object.keys(EX_DB).forEach(function(name){
    var info=EX_DB[name],pri=info.pri||[];
    var inBest=(name in bestRank);
    var matchesPri=pri.some(function(m){return muscleSet[m];});
    if(!inBest&&!matchesPri)return;
    var row={name:name,info:info};
    if(inBest){row.rank=bestRank[name];best.push(row);}
    else{rest.push(row);}
  });
  best.sort(function(a,b){return a.rank-b.rank;});
  rest.sort(function(a,b){return a.name.localeCompare(b.name);});
  return{best:best,rest:rest};
}
function _muscRowHtml(row,isBest){
  var safe=row.name.replace(/'/g,"\\'");
  var gifId=EX_GIF_MAP[row.name];
  var thumbHtml=gifId
    ? '<div class="musc-thumb"><img loading="lazy" src="https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'+gifId+'/0.jpg" onerror="this.style.display=&quot;none&quot;;this.nextElementSibling.style.display=&quot;flex&quot;" alt=""><span class="musc-thumb-fb" style="display:none">💪</span></div>'
    : '<div class="musc-thumb"><span class="musc-thumb-fb" style="display:flex">💪</span></div>';
  var pri=(row.info.pri||[]).slice(0,2).map(function(m){return '<span class="musc-tag">'+m+'</span>';}).join('');
  var sec=(row.info.sec||[]).slice(0,2).map(function(m){return '<span class="musc-tag s">'+m+'</span>';}).join('');
  var badge=isBest?'<span class="musc-best-badge">TOP</span>':'';
  return '<div class="musc-row" onclick="openExInfo(\''+safe+'\')">'+thumbHtml+
    '<div class="musc-body"><div class="musc-name">'+row.name+badge+'</div>'+
    '<div class="musc-tags">'+pri+sec+'</div></div></div>';
}
function openMuscBrowse(groupKey){
  oModal('m-musc');
  filterMusc(groupKey||'chest');
}
function filterMusc(groupKey){
  document.querySelectorAll('#musc-pills .pill').forEach(function(p){p.classList.toggle('on',p.dataset.mg===groupKey);});
  var g=MUSCLE_GROUPS[groupKey];
  document.getElementById('musc-title').textContent=g?g.label:'Exercises';
  var r=_exercisesForGroup(groupKey);
  var bestList=document.getElementById('musc-best-list'),restList=document.getElementById('musc-rest-list');
  document.getElementById('musc-best-section').style.display=r.best.length?'block':'none';
  document.getElementById('musc-rest-section').style.display=r.rest.length?'block':'none';
  bestList.innerHTML=r.best.map(function(row){return _muscRowHtml(row,true);}).join('');
  restList.innerHTML=r.rest.map(function(row){return _muscRowHtml(row,false);}).join('');
  // Scroll the modal sheet back to top when switching
  var sheet=document.querySelector('#m-musc .msheet');if(sheet)sheet.scrollTop=0;
}
function getWeekRange(offsetWeeks){
  var now=new Date();var day=now.getDay();var diff=day===0?6:day-1;
  var mon=new Date(now);mon.setDate(now.getDate()-diff-offsetWeeks*7);mon.setHours(0,0,0,0);
  var sun=new Date(mon);sun.setDate(mon.getDate()+6);sun.setHours(23,59,59,999);
  return{start:mon.toISOString().split('T')[0],end:sun.toISOString().split('T')[0],monDate:mon};
}
function weekStats(ws){
  var cnt=ws.length,sets=0,vol=0,dur=0;
  ws.forEach(function(w){
    dur+=w.duration_seconds||0;
    (w.exercises||[]).forEach(function(ex){(ex.sets||[]).forEach(function(s){sets++;vol+=(s.weight_kg||0)*(s.reps||0);});});
  });
  return{cnt:cnt,sets:sets,vol:Math.round(vol),dur:Math.round(dur/60)};
}
function renderWeekCompare(thisWs,lastWs,wr){
  var ts=weekStats(thisWs),ls=weekStats(lastWs);
  var DAYS=['M','T','W','T','F','S','S'];
  var todayAdj=(function(){var d=new Date().getDay();return d===0?6:d-1;})();
  var doneDays=new Set(thisWs.map(function(w){var d=new Date(w.started_at).getDay();return d===0?6:d-1;}));
  document.getElementById('wk-days').innerHTML=DAYS.map(function(d,i){
    var done=doneDays.has(i),tod=i===todayAdj;
    var cls='wkday-dot'+(done?' done':'')+(tod?' today':'');
    return '<div class="wkday"><div class="wkday-lbl">'+d+'</div><div class="'+cls+'">'+(done?'✓':'')+'</div></div>';
  }).join('');
  function delta(a,b){
    if(!b&&!a)return{cls:'eq',txt:'–'};
    if(!b)return{cls:'up',txt:'New'};
    var d=a-b,p=Math.round((d/b)*100);
    if(d>0)return{cls:'up',txt:'+'+p+'%'};
    if(d<0)return{cls:'dn',txt:p+'%'};
    return{cls:'eq',txt:'±0'};
  }
  function fvol(v){return v>=1000?(v/1000).toFixed(1)+'t':v+'kg';}
  var rows=[
    {k:'Sessions',tv:ts.cnt,d:delta(ts.cnt,ls.cnt)},
    {k:'Total Sets',tv:ts.sets,d:delta(ts.sets,ls.sets)},
    {k:'Volume',tv:fvol(ts.vol),d:delta(ts.vol,ls.vol)},
    {k:'Duration',tv:ts.dur+'min',d:delta(ts.dur,ls.dur)}
  ];
  document.getElementById('wk-cmp').innerHTML=rows.map(function(r){
    return '<div class="wstat-row"><span class="wstat-lbl">'+r.k+'</span><span class="wstat-val">'+r.tv+'</span><span class="wkdelta '+r.d.cls+'">'+r.d.txt+'</span></div>';
  }).join('');
}
var _wHistAll=[];
function filterWHist(q){
  var el=document.getElementById('w-hist');if(!el)return;
  var data=_wHistAll;
  var qq=(q||'').trim().toLowerCase();
  if(qq){data=data.filter(function(w){var names=(w.exercises||[]).map(function(e){return (e.name||'').toLowerCase();}).join(' ');return names.indexOf(qq)!==-1||(w.notes||'').toLowerCase().indexOf(qq)!==-1;});}
  if(!data.length){
    el.innerHTML=qq
      ?'<div class="empty-state" style="padding:18px 8px"><div class="empty-ico" style="background:var(--surface-2)">🔍</div><div class="empty-h">No matches</div><div class="empty-sub">Nothing found for "'+qq.replace(/</g,'&lt;')+'". Try another keyword.</div></div>'
      :'<div class="empty-state"><div class="empty-ico" style="background:var(--adim);color:var(--accent-d)"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="26" width="6" height="12" rx="2"/><rect x="52" y="26" width="6" height="12" rx="2"/><rect x="14" y="22" width="6" height="20" rx="2"/><rect x="44" y="22" width="6" height="20" rx="2"/><path d="M20 32h24"/></svg></div><div class="empty-h">No workouts yet</div><div class="empty-sub">Your history, volume trends, and muscle balance live here once you log a session.</div><button type="button" class="empty-cta" onclick="goTab(\'workout\');startW()">+ Start first workout</button></div>';
    return;
  }
  el.innerHTML=data.slice(0,30).map(function(w){var dur=Math.round(w.duration_seconds/60)||0;var names=(w.exercises||[]).map(function(e){return e.name;}).join(' · ');var kcal=estKcal(w.duration_seconds);var meta=dur+' min'+(kcal>0?' · ~'+kcal+' kcal':'');var noteHtml=w.notes?'<div style="font-size:12.5px;color:var(--t2);margin-top:8px;padding:8px 10px;background:var(--surface);border-radius:8px;font-style:italic;line-height:1.5">📝 '+w.notes.replace(/</g,'&lt;')+'</div>':'';return '<div class="exi"><div class="fb"><div style="font-weight:600">'+fdate(w.started_at.split('T')[0])+'</div><span class="tag">'+meta+'</span></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+(names||'No exercises logged')+'</div>'+noteHtml+'</div>';}).join('');
}
async function loadWHist(){
  var tw=getWeekRange(0),lw=getWeekRange(1);
  var{data:twd}=await sb.from('workouts').select('id,started_at,duration_seconds,exercises(name,sets(weight_kg,reps))').eq('user_id',CU.id).gte('started_at',tw.start+'T00:00:00').lte('started_at',tw.end+'T23:59:59').order('started_at',{ascending:true});
  var{data:lwd}=await sb.from('workouts').select('id,started_at,duration_seconds,exercises(name,sets(weight_kg,reps))').eq('user_id',CU.id).gte('started_at',lw.start+'T00:00:00').lte('started_at',lw.end+'T23:59:59');
  renderWeekCompare(twd||[],lwd||[],tw);
  var{data}=await sb.from('workouts').select('id,started_at,duration_seconds,notes,exercises(name)').eq('user_id',CU.id).order('started_at',{ascending:false}).limit(50);
  _wHistAll=data||[];
  filterWHist(document.getElementById('wh-search')?document.getElementById('wh-search').value:'');
}

/* ── WEIGHT ───────────────────────────────── */
function openWtM(){oModal('m-wt');}
async function saveWt(){
  var v=parseFloat(document.getElementById('wt-in').value);
  if(!v||v<30||v>300){toast('Enter a valid weight');return;}
  var entry={weight_kg:v,logged_date:today()};
  wtLog.push({weight:v,date:today(),ts:Date.now()});wtLog.sort(function(a,b){return a.ts-b.ts;});
  document.getElementById('b-cw').innerHTML=v+'<span class="su">kg</span>';
  cModal('m-wt');document.getElementById('wt-in').value='';
  renderWtLog();renderChart();renderWeightProjection();toast('⚖️ Weight logged!');
  await sbQueueUpsert('weight_logs',{user_id:CU.id,logged_date:entry.logged_date,weight_kg:v},{onConflict:'user_id,logged_date'});
  await sbQueueUpsert('profiles',{id:CU.id,current_weight_kg:v,updated_at:new Date().toISOString()},{onConflict:'id'});
}
async function loadWtLog(){
  var{data}=await sb.from('weight_logs').select('*').eq('user_id',CU.id).order('logged_date',{ascending:true});
  wtLog=(data||[]).map(function(w){return{weight:parseFloat(w.weight_kg),date:w.logged_date,ts:new Date(w.created_at).getTime()};});
  document.getElementById('b-gw').innerHTML=G.weight+'<span class="su">kg</span>';
  if(wtLog.length)document.getElementById('b-cw').innerHTML=wtLog[wtLog.length-1].weight+'<span class="su">kg</span>';
  renderWtLog();renderChart();
}
function renderWtLog(){
  var el=document.getElementById('w-log');
  var rec=wtLog.slice().reverse().slice(0,10);
  if(!rec.length){el.innerHTML='<p class="tm tc" style="padding:18px 0">No entries yet</p>';return;}
  el.innerHTML=rec.map(function(w,i){var prev=rec[i+1];var d=prev?(w.weight-prev.weight).toFixed(1):null;var col=d&&parseFloat(d)<0?'var(--accent)':d&&parseFloat(d)>0?'var(--red)':'var(--t2)';return '<div class="fb" style="padding:10px 0;border-bottom:1px solid var(--bdr)"><div><div style="font-weight:600">'+w.weight+' kg</div><div style="font-size:11.5px;color:var(--t3)">'+fdate(w.date)+'</div></div>'+(d?'<span style="color:'+col+';font-size:13px;font-weight:600">'+(parseFloat(d)>0?'+':'')+d+'kg</span>':'')+'</div>';}).join('');
}
async function initChart(){
  await _ensureChart();
  var canvas=document.getElementById('w-chart');if(!canvas)return;
  var ctx=canvas.getContext('2d');
  wChart=new Chart(ctx,{type:'line',data:{labels:[],datasets:[{label:'Weight',data:[],borderColor:'#22C55E',backgroundColor:'rgba(34,197,94,.08)',borderWidth:2.5,pointBackgroundColor:'#22C55E',pointRadius:4,tension:.4,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:11,weight:'500'}}},y:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:11,weight:'500'}}}}}});
  renderChart();
}
function renderChart(){if(!wChart)return;var d=wtLog.slice(-21);wChart.data.labels=d.map(function(w){return w.date.slice(5);});wChart.data.datasets[0].data=d.map(function(w){return w.weight;});wChart.update();}

/* ── WEEKLY VOLUME CHART ──────────────────── */
var volChart=null;
var MUSCLE_COLORS={chest:'#22C55E',back:'#3B82F6',legs:'#A855F7',shoulders:'#F59E0B',arms:'#EC4899',core:'#06B6D4',other:'#9CA3AF'};
function _weekKey(d){
  // ISO-week-ish: Monday-start week key as 'YYYY-MM-DD' (Monday)
  var x=new Date(d);var day=x.getDay();var diff=day===0?6:day-1;
  x.setDate(x.getDate()-diff);x.setHours(0,0,0,0);
  return x.toISOString().split('T')[0];
}
async function loadVolumeChart(){
  var since=new Date();since.setDate(since.getDate()-42);
  var{data}=await sb.from('workouts')
    .select('started_at,exercises(muscle_group,sets(weight_kg,reps))')
    .eq('user_id',CU.id).gte('started_at',since.toISOString());
  var weeks={};
  (data||[]).forEach(function(w){
    var wk=_weekKey(w.started_at.split('T')[0]);
    if(!weeks[wk])weeks[wk]={chest:0,back:0,legs:0,shoulders:0,arms:0,core:0,other:0};
    (w.exercises||[]).forEach(function(ex){
      var m=ex.muscle_group||'other';if(!(m in weeks[wk]))m='other';
      (ex.sets||[]).forEach(function(s){
        weeks[wk][m]+=(+s.weight_kg||0)*(+s.reps||0);
      });
    });
  });
  // Build the last 6 week buckets even when empty so the axis is continuous.
  var labels=[];var today0=new Date();today0.setHours(0,0,0,0);
  for(var i=5;i>=0;i--){var d=new Date(today0);d.setDate(d.getDate()-i*7);labels.push(_weekKey(d));}
  var muscles=['chest','back','legs','shoulders','arms','core','other'];
  var hasAny=labels.some(function(l){return weeks[l]&&muscles.some(function(m){return weeks[l][m]>0;});});
  var empty=document.getElementById('vol-empty');
  var wrap=document.getElementById('vol-card').querySelector('.chart-wrap');
  if(!hasAny){empty.style.display='block';wrap.style.display='none';if(volChart){volChart.destroy();volChart=null;}return;}
  empty.style.display='none';wrap.style.display='block';
  var datasets=muscles.map(function(m){
    return{label:m.charAt(0).toUpperCase()+m.slice(1),backgroundColor:MUSCLE_COLORS[m],borderWidth:0,
      data:labels.map(function(l){return Math.round((weeks[l]&&weeks[l][m])||0);})};
  }).filter(function(ds){return ds.data.some(function(v){return v>0;});});
  await _ensureChart();
  var ctx=document.getElementById('vol-chart').getContext('2d');
  if(volChart)volChart.destroy();
  volChart=new Chart(ctx,{
    type:'bar',
    data:{labels:labels.map(function(l){var d=new Date(l+'T12:00:00');return d.toLocaleDateString('en',{month:'short',day:'numeric'});}),datasets:datasets},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#6B7280',font:{size:10,weight:'500'},boxWidth:10,padding:8}},tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+c.parsed.y.toLocaleString()+' kg';}}}},
      scales:{x:{stacked:true,grid:{display:false},ticks:{color:'#6B7280',font:{size:10,weight:'500'}}},y:{stacked:true,grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#8896B3',font:{size:10},callback:function(v){return v>=1000?(v/1000).toFixed(1)+'t':v;}}}}}
  });
}

/* ── WEIGHT PROJECTION CHART ─────────────── */
var wprojChart=null;
async function renderWeightProjection(){
  var card=document.getElementById('wproj-card');if(!card)return;
  var cur=wtLog.length?wtLog[wtLog.length-1].weight:(P._currentWeight||null);
  var goal=G.weight||null;
  if(!cur||!goal||Math.abs(cur-goal)<0.5){card.style.display='none';if(wprojChart){wprojChart.destroy();wprojChart=null;}return;}
  card.style.display='block';
  var direction=goal>cur?1:-1;
  // Healthy weekly rate as % of body weight; best ~1%/wk, worst ~0.25%/wk.
  var bestRate=cur*0.01,worstRate=cur*0.0025;
  var weeksBest=Math.ceil(Math.abs(goal-cur)/bestRate);
  var weeksWorst=Math.ceil(Math.abs(goal-cur)/worstRate);
  var months=Math.min(12,Math.max(3,Math.ceil(weeksWorst/4)));
  var bestPath=[],worstPath=[],avgPath=[],labels=[],now=new Date();
  for(var m=0;m<=months;m++){
    var d=new Date(now);d.setMonth(d.getMonth()+m);
    labels.push(d.toLocaleDateString('en',{month:'short'}));
    var wk=m*4.345;
    var bestW=cur+direction*Math.min(Math.abs(goal-cur),bestRate*wk);
    var worstW=cur+direction*Math.min(Math.abs(goal-cur),worstRate*wk);
    bestPath.push(+bestW.toFixed(1));worstPath.push(+worstW.toFixed(1));
    avgPath.push(+((bestW+worstW)/2).toFixed(1));
  }
  var avg=(cur+goal)/2;
  document.getElementById('wproj-avg').innerHTML=avg.toFixed(1)+'<span style="font-size:14px;color:var(--t2);font-weight:500;margin-left:6px">kg</span>';
  var startLabel=labels[0],endLabel=labels[labels.length-1];
  document.getElementById('wproj-range').textContent=startLabel+' – '+endLabel+' '+now.getFullYear();
  document.getElementById('wproj-cur').textContent=cur.toFixed(1)+' kg';
  document.getElementById('wproj-goal').textContent=goal.toFixed(1)+' kg';
  function _humanDur(weeks){if(weeks<5)return weeks+' wk';var months=Math.round(weeks/4.345);return months+(months===1?' month':' months');}
  document.getElementById('wproj-best').textContent=_humanDur(weeksBest);
  document.getElementById('wproj-worst').textContent=_humanDur(weeksWorst);
  await _ensureChart();
  var ctx=document.getElementById('wproj-chart').getContext('2d');
  if(wprojChart)wprojChart.destroy();
  wprojChart=new Chart(ctx,{type:'line',
    data:{labels:labels,datasets:[
      {label:'Best',data:bestPath,borderColor:'#A855F7',backgroundColor:'rgba(168,85,247,.18)',borderWidth:2,borderDash:[5,4],pointRadius:0,fill:'+1',tension:.2},
      {label:'Worst',data:worstPath,borderColor:'#A855F7',borderWidth:2,borderDash:[5,4],pointRadius:0,fill:false,tension:.2},
      {label:'Goal',data:Array(labels.length).fill(goal),borderColor:'#9CA3AF',borderWidth:1,pointRadius:0,fill:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:10,weight:'500'}}},y:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:10,weight:'500'},callback:function(v){return v+'kg';}}}}}});
}

/* ── BODY-FAT TREND CHART ─────────────────── */
var bfChart=null;
async function renderBfChart(){
  var card=document.getElementById('bf-card');if(!card)return;
  var bfPoints=(mesLog||[]).slice().reverse()
    .filter(function(m){return m.body_fat_pct!=null;})
    .map(function(m){return{date:m.logged_date,bf:parseFloat(m.body_fat_pct)};});
  if(bfPoints.length<2){card.style.display='none';if(bfChart){bfChart.destroy();bfChart=null;}return;}
  card.style.display='block';
  document.getElementById('bf-cur').textContent=bfPoints[bfPoints.length-1].bf.toFixed(1)+'%';
  await _ensureChart();
  var ctx=document.getElementById('bf-chart').getContext('2d');
  if(bfChart)bfChart.destroy();
  bfChart=new Chart(ctx,{type:'line',
    data:{labels:bfPoints.map(function(p){return p.date.slice(5);}),
      datasets:[{label:'BF%',data:bfPoints.map(function(p){return p.bf;}),borderColor:'#A855F7',backgroundColor:'rgba(168,85,247,.08)',borderWidth:2.5,pointBackgroundColor:'#A855F7',pointRadius:4,tension:.35,fill:true}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:11,weight:'500'}}},y:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#8896B3',font:{size:11},callback:function(v){return v+'%';}}}}}});
}

/* ── REST TIMER (wall-clock, drift-free) ─── */
var _rSecs=90,_rTotal=90,_rEnd=0,_rInterval=null,_rDone=false;
function _rLeft(){return _rEnd?Math.max(0,Math.ceil((_rEnd-Date.now())/1000)):_rSecs;}
function openRestGeneric(){_restForExName=null;openRest();}
function openRest(){
  oModal('m-rest');
  var btn=document.getElementById('notif-btn');
  if(btn&&typeof Notification!=='undefined'){
    if(Notification.permission==='granted'){btn.textContent='Notifications On';btn.disabled=true;btn.style.opacity='.5';}
    else{btn.textContent='Allow Notifications';btn.disabled=false;btn.style.opacity='1';}
  }
  var mb=document.getElementById('rest-mute-btn');if(mb)mb.textContent=_rMuted()?'🔇 Sound off':'🔔 Sound on';
  if(!_rInterval){_rEnd=0;_rTotal=_rSecs;updateRestUI();}
}
var _restForExName=null;
function _restPrefKey(name){return 'restpref_'+(name||'').toLowerCase().trim();}
function _fmtRestPref(s){var m=Math.floor(s/60),sec=s%60;return sec===0?m+'m':(m>0?m+'m '+sec+'s':sec+'s');}
function getRestPref(name){var v=parseInt(localStorage.getItem(_restPrefKey(name))||'0');return v>0?v:90;}
function setRestPref(name,s){try{localStorage.setItem(_restPrefKey(name),String(s));}catch(e){}}
function restForEx(idx){
  var ex=wExs[idx];if(!ex)return;
  _restForExName=ex.name;
  var s=getRestPref(ex.name);
  openRest();setRest(s);
}
function setRest(s){
  clearInterval(_rInterval);_rInterval=null;_rDone=false;_rLastTick=-1;
  _rSecs=s;_rTotal=s;_rEnd=Date.now()+s*1000;
  if(_restForExName)setRestPref(_restForExName,s);
  document.querySelectorAll('.rest-preset').forEach(function(p){p.classList.toggle('on',+p.dataset.s===s);});
  updateRestUI();
  if(typeof Notification!=='undefined'&&Notification.permission==='default'){
    Notification.requestPermission().then(function(p){
      var b=document.getElementById('notif-btn');
      if(p==='granted'&&b){b.textContent='Notifications On';b.disabled=true;b.style.opacity='.5';}
    });
  }
  if(navigator.serviceWorker&&navigator.serviceWorker.controller){
    navigator.serviceWorker.controller.postMessage({type:'REST_START',duration:s,endAt:_rEnd});
  }
  _rInterval=setInterval(_rTick,250);
}
function _rTick(){
  updateRestUI();
  var left=_rLeft();
  // Soft tick at last 3 seconds (haptics + tiny WebAudio beep).
  if(left>0&&left<=3&&left!==_rLastTick&&!_rMuted()){
    _rLastTick=left;
    try{navigator.vibrate&&navigator.vibrate(35);}catch(e){}
    _restBeep(660,90);
  }
  if(left<=0&&!_rDone){
    _rDone=true;
    clearInterval(_rInterval);_rInterval=null;
    if(!_rMuted()){
      try{navigator.vibrate&&navigator.vibrate([300,100,300,100,300]);}catch(e){}
      _restBeep(880,180);
      setTimeout(function(){_restBeep(660,180);},220);
    }
    setTimeout(function(){if(document.getElementById('m-rest').classList.contains('on'))cModal('m-rest');},1500);
  }
}
var _rLastTick=-1;
function _rMuted(){return localStorage.getItem('rest_muted')==='1';}
function toggleRestMute(btn){
  var muted=_rMuted();
  try{localStorage.setItem('rest_muted',muted?'0':'1');}catch(e){}
  if(btn)btn.textContent=muted?'🔔 Sound on':'🔇 Sound off';
  toast(muted?'Rest sound on':'Rest sound muted');
}
// Tiny WebAudio beep — no MP3 asset needed. Cached AudioContext.
var _audCtx=null;
function _restBeep(freq,ms){
  try{
    if(!_audCtx){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;_audCtx=new AC();}
    if(_audCtx.state==='suspended')_audCtx.resume();
    var o=_audCtx.createOscillator(),g=_audCtx.createGain();
    o.type='sine';o.frequency.value=freq;
    g.gain.setValueAtTime(0,_audCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.18,_audCtx.currentTime+0.01);
    g.gain.linearRampToValueAtTime(0,_audCtx.currentTime+ms/1000);
    o.connect(g);g.connect(_audCtx.destination);
    o.start();o.stop(_audCtx.currentTime+ms/1000+0.02);
  }catch(e){}
}
// Premium feedback: short blip + light vibe whenever a set lands. Quieter than
// the rest-timer beep so it doesn't fatigue. Honours the same mute toggle.
function _fxSetSaved(){
  if(!localStorage.getItem('rest_muted'))_restBeep(440,90);
  try{navigator.vibrate&&navigator.vibrate(25);}catch(e){}
}
// PR celebration arpeggio — C5 → E5 → G5 → C6. Slightly louder, single tone train.
function _fxPRArpeggio(){
  if(localStorage.getItem('rest_muted'))return;
  var notes=[523.25,659.25,783.99,1046.50];
  notes.forEach(function(f,i){setTimeout(function(){_restBeep(f,140);},i*110);});
}
// Number ticker — animates `el.textContent` from its current numeric value to
// `to` over `ms`. Used on Home stat tiles. Honours prefers-reduced-motion.
function _tickerTo(el,to,ms,fmt){
  if(!el)return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    el.textContent=fmt?fmt(to):to;return;
  }
  var from=parseFloat((el.textContent||'').replace(/[^0-9.\-]/g,''))||0;
  if(from===to){el.textContent=fmt?fmt(to):to;return;}
  var start=performance.now(),dur=ms||550;
  function step(t){
    var p=Math.min(1,(t-start)/dur);
    var eased=1-Math.pow(1-p,3);
    var v=from+(to-from)*eased;
    el.textContent=fmt?fmt(v):Math.round(v);
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function updateRestUI(){
  var left=_rLeft();
  var m=Math.floor(left/60),s=left%60;
  document.getElementById('rest-disp').textContent=m+':'+(s<10?'0':'')+s;
  var ring=document.getElementById('rring');
  if(!ring)return;
  var pct=_rTotal>0?left/_rTotal:0;
  ring.style.strokeDashoffset=502.65*(1-pct);
  ring.style.stroke=left<=10?'var(--red)':left<=30?'var(--yel)':'var(--accent)';
}
function cancelRest(){
  clearInterval(_rInterval);_rInterval=null;_rEnd=0;_rDone=false;
  if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:'REST_CANCEL'});
  cModal('m-rest');
}
document.addEventListener('visibilitychange',function(){
  if(!document.hidden&&_rEnd&&!_rDone)_rTick();
});
function reqNotifPerm(){
  if(typeof Notification==='undefined')return;
  Notification.requestPermission().then(function(p){
    if(p==='granted'){var b=document.getElementById('notif-btn');if(b){b.textContent='Notifications On';b.disabled=true;b.style.opacity='.5';}}
  });
}

/* ── TIME PICKER ─────────────────────────── */
var _tpTarget=null;
function fmt12(val){var p=val.split(':');var h=parseInt(p[0]);var m=p[1];var ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+m+' '+ap;}
function openTimePicker(target){
  _tpTarget=target;
  var val=document.getElementById('s-'+target).value||'22:30';
  var p=val.split(':');var h=parseInt(p[0])||0;var m=parseInt(p[1])||0;
  document.getElementById('tp-title').textContent=target==='bed'?'Bedtime':'Wake Time';
  var hc=document.getElementById('tp-hrs'),mc=document.getElementById('tp-mins');
  var hi='<div class="tp-pad"></div>';for(var i=0;i<24;i++)hi+='<div class="tp-item">'+(i<10?'0':'')+i+'</div>';hi+='<div class="tp-pad"></div>';
  var mi='<div class="tp-pad"></div>';for(var j=0;j<60;j++)mi+='<div class="tp-item">'+(j<10?'0':'')+j+'</div>';mi+='<div class="tp-pad"></div>';
  hc.innerHTML=hi;mc.innerHTML=mi;
  oModal('m-timepick');
  setTimeout(function(){hc.scrollTop=h*52;mc.scrollTop=m*52;},80);
}
function confirmTime(){
  var hc=document.getElementById('tp-hrs'),mc=document.getElementById('tp-mins');
  var h=Math.max(0,Math.min(23,Math.round(hc.scrollTop/52)));
  var m=Math.max(0,Math.min(59,Math.round(mc.scrollTop/52)));
  var val=(h<10?'0':'')+h+':'+(m<10?'0':'')+m;
  document.getElementById('s-'+_tpTarget).value=val;
  var d=document.getElementById('s-'+_tpTarget+'-disp');if(d)d.textContent=fmt12(val);
  cModal('m-timepick');
}

/* ── SLEEP ────────────────────────────────── */
async function logSleep(){
  var bed=document.getElementById('s-bed').value,wk=document.getElementById('s-wk').value;
  if(!bed||!wk){toast('Enter times');return;}
  var bm=parseInt(bed.split(':')[0])*60+parseInt(bed.split(':')[1]);
  var wm=parseInt(wk.split(':')[0])*60+parseInt(wk.split(':')[1]);
  var hrs=(wm-bm)/60;if(hrs<0)hrs+=24;
  document.getElementById('h-s').innerHTML=hrs.toFixed(1)+'<span class="su">h</span>';
  setSleepRing(hrs);toast('😴 '+hrs.toFixed(1)+'h sleep logged!');
  await sbQueueUpsert('sleep_logs',{user_id:CU.id,logged_date:today(),bedtime:bed,wake_time:wk,duration_hours:hrs,quality:document.getElementById('s-q').value},{onConflict:'user_id,logged_date'});
  if(navigator.onLine)await loadSleepHist();
}
function setSleepRing(h){document.getElementById('s-disp').textContent=h.toFixed(1);document.getElementById('s-ring').style.strokeDashoffset=415*(1-Math.min(1,h/8));}
var sleepChart=null;
async function loadSleepHist(){
  var{data}=await sb.from('sleep_logs').select('*').eq('user_id',CU.id).order('logged_date',{ascending:false}).limit(30);
  var el=document.getElementById('s-hist');
  if(!data||!data.length){el.innerHTML='<div class="empty-state"><div class="empty-ico" style="background:rgba(168,85,247,.12);color:#A855F7"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M44 36c-12 0-20-8-20-20 0-2 .3-4 .8-6C16 12 10 20 10 30c0 13 11 24 24 24 8 0 15-4 19-11-3 1-6 2-9 2z"/><circle cx="48" cy="14" r="2"/><circle cx="40" cy="20" r="1.5"/></svg></div><div class="empty-h">No sleep logged yet</div><div class="empty-sub">Tap the bed icon to log how long you slept. Trends appear after 2+ nights.</div><button type="button" class="empty-cta" onclick="goTab(\'sleep\');setTimeout(function(){var f=document.getElementById(\'s-bed\');if(f)f.focus();},120)">+ Log last night</button></div>';if(sleepChart){sleepChart.destroy();sleepChart=null;}return;}
  var em={great:'😊',good:'🙂',ok:'😐',poor:'😴'};
  var chartHtml=data.length>=2?'<div class="chart-wrap" style="height:160px;margin-bottom:14px"><canvas id="s-chart"></canvas></div>':'';
  el.innerHTML=chartHtml+data.slice(0,7).map(function(s){var h=parseFloat(s.duration_hours);var col=h>=7?'var(--accent-d)':h>=5.5?'var(--yel)':'var(--red)';return '<div class="fb" style="padding:11px 0;border-bottom:1px solid var(--bdr)"><div><div style="font-weight:600;letter-spacing:-.2px">'+fdate(s.logged_date)+'</div><div style="font-size:12.5px;color:var(--t2);margin-top:2px">'+s.bedtime+' → '+s.wake_time+' '+(em[s.quality]||'🙂')+'</div></div><span style="color:'+col+';font-family:Inter,sans-serif;font-weight:800;font-size:22px;letter-spacing:-.8px">'+h.toFixed(1)+'h</span></div>';}).join('');
  if(data.length>=2){
    var asc=data.slice().reverse();
    var ctx=document.getElementById('s-chart');if(!ctx)return;
    await _ensureChart();
    if(sleepChart){sleepChart.destroy();}
    sleepChart=new Chart(ctx.getContext('2d'),{
      type:'line',
      data:{labels:asc.map(function(s){return s.logged_date.slice(5);}),
        datasets:[{label:'Hours',data:asc.map(function(s){return parseFloat(s.duration_hours);}),borderColor:'#A855F7',backgroundColor:'rgba(168,85,247,.08)',borderWidth:2.5,pointBackgroundColor:'#A855F7',pointRadius:3,tension:.35,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return ctx.parsed.y.toFixed(1)+'h';}}}},scales:{x:{grid:{display:false},ticks:{color:'#6B7280',font:{size:10},maxTicksLimit:7}},y:{suggestedMin:4,suggestedMax:10,grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:11},callback:function(v){return v+'h';}}}}}
    });
  }
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
  card.innerHTML='<button type="button" onclick="dismissIosInstall()" aria-label="Dismiss" style="position:absolute;top:10px;right:10px;background:none;border:none;color:var(--t3);font-size:18px;cursor:pointer;padding:6px 10px">✕</button>'+
    '<div style="display:flex;align-items:center;gap:14px"><div style="font-size:32px">📲</div>'+
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
  _installEv=null;refreshInstallUI();toast('Installed — open from your home screen 🎉');
});
async function doInstall(){
  if(!_installEv){toast('Use your browser menu → Add to Home Screen');return;}
  try{
    _installEv.prompt();
    var res=await _installEv.userChoice;
    if(res&&res.outcome==='accepted'){_installEv=null;refreshInstallUI();}
  }catch(e){_installEv=null;refreshInstallUI();}
}

/* ── HOME DASHBOARD ──────────────────────── */
var heroSparkChart=null;
var COACH_TIPS=[
  {t:'Consistency over intensity',b:'Showing up regularly matters more than going all-out once in a while. Three consistent days a week will outperform six sporadic ones every time.'},
  {t:'6–12 reps, close to failure',b:'Muscle grows across a wide rep range as long as effort is high. Aim for 1–3 reps in reserve on most working sets.'},
  {t:'Aim for 10+ sets per muscle per week',b:'Total weekly volume is the strongest predictor of muscle growth. Spread it across 2–3 sessions per muscle group.'},
  {t:'Eat enough protein',b:'A common evidence-based range is 1.6–2.2 g/kg/day. Spread intake across 3–5 meals for the best results.'},
  {t:'Rest is where growth happens',b:'Muscles grow during recovery, not the workout. Train every day without rest and progress slows.'},
  {t:'Beat last session, by the number',b:'Progressive overload is a number, not a feeling. Add a little more weight, one more rep, or an extra set.'},
  {t:'Track first, optimise later',b:'You can\'t improve what you don\'t measure. Log every set — even quick ones — so your trend is real.'},
  {t:'Sleep is the secret weapon',b:'7–9 hours of sleep keeps recovery, hormones, and strength gains on track. Cut sleep, cut progress.'}
];
function rotateCoachTip(){
  var idx=parseInt(localStorage.getItem('coach_tip_idx')||'-1')+1;
  if(idx>=COACH_TIPS.length)idx=0;
  localStorage.setItem('coach_tip_idx',String(idx));
  var t=COACH_TIPS[idx];
  var tEl=document.getElementById('coach-title'),bEl=document.getElementById('coach-body');
  if(tEl)tEl.textContent=t.t;
  if(bEl)bEl.textContent=t.b;
  // On every tap also try to refresh the personalized insight first thing tomorrow.
  generateCoachInsight();
}
// Proactive coach insight pulled from logged data. Cached daily so we don't refetch on every home render.
async function generateCoachInsight(){
  if(!CU)return;
  var cacheKey='coach_insight_'+CU.id+'_'+today();
  var cached=localStorage.getItem(cacheKey);
  if(cached){try{_applyCoachInsight(JSON.parse(cached));return;}catch(e){}}
  try{
    var since=new Date();since.setDate(since.getDate()-30);
    var[wos,prs,sleep,wts]=await Promise.all([
      sb.from('workouts').select('started_at,exercises(muscle_group)').eq('user_id',CU.id).gte('started_at',since.toISOString()).order('started_at',{ascending:false}),
      sb.from('personal_records').select('exercise_name,weight_kg,achieved_at,pr_type').eq('user_id',CU.id).gte('achieved_at',since.toISOString()).order('achieved_at',{ascending:false}).limit(5),
      sb.from('sleep_logs').select('logged_date,duration_hours').eq('user_id',CU.id).gte('logged_date',since.toISOString().slice(0,10)).order('logged_date',{ascending:false}).limit(7),
      sb.from('weight_logs').select('logged_date,weight_kg').eq('user_id',CU.id).order('logged_date',{ascending:false}).limit(8)
    ]);
    var insights=[];
    // First-3-days new-user nudges (highest weight — override generic tips during onboarding window).
    var fd=_firstDaysInsight(wos.data,sleep.data);
    if(fd)insights.push(fd);
    // Insight 1: neglected muscle group (no work in 7+ days)
    var byMuscle={};(wos.data||[]).forEach(function(w){var ts=new Date(w.started_at).getTime();(w.exercises||[]).forEach(function(ex){var m=ex.muscle_group;if(!m||m==='other')return;if(!byMuscle[m]||byMuscle[m]<ts)byMuscle[m]=ts;});});
    var nowT=Date.now(),MUSCLES=['chest','back','legs','shoulders','arms','core'];
    var stale=MUSCLES.filter(function(m){return byMuscle[m]&&(nowT-byMuscle[m])>7*86400000;}).map(function(m){return{name:m,days:Math.floor((nowT-byMuscle[m])/86400000)};}).sort(function(a,b){return b.days-a.days;});
    if(stale[0])insights.push({t:'Don\'t skip '+stale[0].name+' day',b:'You haven\'t trained '+stale[0].name+' in '+stale[0].days+' days. A short session this week keeps growth on track.',w:5});
    // Insight 2: streak of PRs
    if(prs.data&&prs.data.length>=2)insights.push({t:'You\'re on a roll',b:'You\'ve set '+prs.data.length+' new PRs in the last month. Keep adding small jumps — that\'s exactly how compound progress works.',w:4});
    // Insight 3: sleep average
    if(sleep.data&&sleep.data.length>=3){var avg=sleep.data.reduce(function(a,s){return a+(+s.duration_hours||0);},0)/sleep.data.length;if(avg<6.8)insights.push({t:'Sleep is your bottleneck',b:'Average over the last '+sleep.data.length+' nights: '+avg.toFixed(1)+'h. Recovery, hormones and strength all suffer below 7h. Lights-out 30 min earlier this week?',w:6});}
    // Insight 4: weight trend
    if(wts.data&&wts.data.length>=4){var sorted=wts.data.slice().sort(function(a,b){return a.logged_date.localeCompare(b.logged_date);});var first=sorted[0].weight_kg,last=sorted[sorted.length-1].weight_kg;var diff=+last-+first;if(Math.abs(diff)>=0.5){var dir=diff>0?'up':'down';insights.push({t:'Weight trending '+dir,b:'You\'re '+Math.abs(diff).toFixed(1)+' kg '+dir+' over your last '+sorted.length+' weigh-ins. '+(diff<0?'Make sure protein stays high so the loss is fat, not muscle.':'Check this matches your goal — recompositioning is slow, bulking should be steady.'),w:3});}}
    // Insight 5: weekly frequency
    var thisWeekStart=new Date();thisWeekStart.setDate(thisWeekStart.getDate()-thisWeekStart.getDay());thisWeekStart.setHours(0,0,0,0);
    var thisWeekCount=(wos.data||[]).filter(function(w){return new Date(w.started_at)>=thisWeekStart;}).length;
    if(thisWeekCount===0&&new Date().getDay()>=4)insights.push({t:'No workouts this week yet',b:'It\'s '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]+'. One short session today keeps the streak alive.',w:7});
    if(!insights.length)return;
    insights.sort(function(a,b){return b.w-a.w;});
    var pick=insights[0];
    try{localStorage.setItem(cacheKey,JSON.stringify(pick));}catch(e){}
    _applyCoachInsight(pick);
  }catch(e){console.warn('coach insight',e);}
}
function _firstDaysInsight(workouts,sleeps){
  if(!CU||!CU.created_at)return null;
  var ageDays=(Date.now()-new Date(CU.created_at).getTime())/86400000;
  if(ageDays>3)return null;
  var hasWorkout=Array.isArray(workouts)&&workouts.length>0;
  var hasSleep=Array.isArray(sleeps)&&sleeps.length>0;
  if(ageDays<1&&!hasWorkout)
    return{t:'Welcome — start with one set',b:"Don't aim for a perfect first session. Open Train, pick any exercise, log a single set. That's all day one needs.",w:99};
  if(ageDays<2&&!hasWorkout)
    return{t:'Day two — try one quick session',b:'Even a 15-minute workout locks in the habit. Strength gains live in showing up, not in the volume of any one day.',w:99};
  if(hasWorkout&&!hasSleep)
    return{t:'Log last night to unlock recovery insights',b:'Sleep + lifting data together is where the real coaching kicks in. Two taps on the Sleep tab now.',w:98};
  if(hasWorkout&&hasSleep&&ageDays<3)
    return{t:'You\'re ahead of 80% of new users',b:'Most apps see drop-off after day one. You\'ve logged a workout and tracked sleep — keep this rhythm and weekly trends start surfacing in 4 days.',w:90};
  return null;
}
function _applyCoachInsight(ins){
  var tEl=document.getElementById('coach-title'),bEl=document.getElementById('coach-body');
  if(tEl)tEl.textContent=ins.t;
  if(bEl)bEl.textContent=ins.b;
  var card=document.querySelector('.coach-card .badge');
  if(card)card.textContent='Insight';
}
// Today's recap card: pulls today's workout + cardio + meals + sleep and compares the strength session
// against the user's prior session that hit the same muscle group(s).
async function renderDailySummary(){
  var card=document.getElementById('daily-sum-card'),body=document.getElementById('daily-sum-body'),dateEl=document.getElementById('daily-sum-date');
  if(!card||!body||!CU)return;
  var td=today();
  var dayStart=new Date();dayStart.setHours(0,0,0,0);
  var dayEnd=new Date();dayEnd.setHours(23,59,59,999);
  try{
    var[wos,crd,meals,sl]=await Promise.all([
      sb.from('workouts').select('id,started_at,duration_seconds,exercises(muscle_group,sets(weight_kg,reps))').eq('user_id',CU.id).gte('started_at',dayStart.toISOString()).lte('started_at',dayEnd.toISOString()).order('started_at',{ascending:false}),
      sb.from('cardio_sessions').select('activity,duration_minutes,distance_km,calories').eq('user_id',CU.id).gte('started_at',dayStart.toISOString()).lte('started_at',dayEnd.toISOString()),
      sb.from('meals').select('calories,protein_g').eq('user_id',CU.id).eq('logged_date',td),
      sb.from('sleep_logs').select('duration_hours').eq('user_id',CU.id).eq('logged_date',td).maybeSingle()
    ]);
    var wList=wos.data||[],cList=crd.data||[],mList=meals.data||[];
    var any=wList.length>0||cList.length>0||mList.length>0||(sl.data&&sl.data.duration_hours);
    if(!any){card.style.display='none';return;}
    if(dateEl)dateEl.textContent=fdate(td);
    var sections=[];
    // ── Strength session(s)
    for(var i=0;i<wList.length;i++){
      var w=wList[i];
      var sets=0,vol=0,muscles={};
      (w.exercises||[]).forEach(function(ex){var m=ex.muscle_group||'other';muscles[m]=(muscles[m]||0)+1;(ex.sets||[]).forEach(function(s){sets++;vol+=(+s.weight_kg||0)*(+s.reps||0);});});
      var topMuscle=Object.keys(muscles).sort(function(a,b){return muscles[b]-muscles[a];})[0]||'session';
      var dur=Math.round((+w.duration_seconds||0)/60);
      var compHtml='';
      try{
        var{data:prior}=await sb.from('workouts').select('id,duration_seconds,exercises!inner(muscle_group,sets(weight_kg,reps))').eq('user_id',CU.id).eq('exercises.muscle_group',topMuscle).lt('started_at',w.started_at).order('started_at',{ascending:false}).limit(1);
        if(prior&&prior.length){
          var pSets=0,pVol=0;(prior[0].exercises||[]).forEach(function(ex){(ex.sets||[]).forEach(function(s){pSets++;pVol+=(+s.weight_kg||0)*(+s.reps||0);});});
          if(pVol>0){
            var d=vol-pVol,pct=Math.round((d/pVol)*100);
            var dir=d>0?'up':d<0?'down':'same';
            var col=d>0?'var(--accent-d)':d<0?'var(--red)':'var(--t2)';
            compHtml='<div style="font-size:12px;color:var(--t2);margin-top:4px"><b style="color:'+col+'">'+(d>=0?'+':'')+pct+'%</b> volume vs last '+topMuscle+' day';
            if(d>10)compHtml+=' — next time push rest a notch longer (90-120s) to keep that intensity.';
            else if(d<-10)compHtml+=' — recovery dip? Maybe pull weight back 5% next session.';
            else compHtml+=' — steady is good. Add 1 rep on your top set next time.';
            compHtml+='</div>';
          }
        }
      }catch(e){console.warn('comparison',e);}
      sections.push(
        '<div style="padding:10px 12px;background:var(--surface);border-radius:12px;margin-bottom:8px">'+
        '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">'+
          '<div style="font-weight:700;font-size:14px;text-transform:capitalize">🏋️ '+topMuscle+' session</div>'+
          '<div style="font-size:12px;color:var(--t2);font-weight:600">'+dur+' min · '+sets+' sets</div>'+
        '</div>'+
        '<div style="font-size:12.5px;color:var(--t2);margin-top:3px">Volume: <b style="color:var(--t)">'+(vol>=1000?(vol/1000).toFixed(1)+'t':vol+' kg')+'</b></div>'+
        compHtml+
        '</div>'
      );
    }
    // ── Cardio
    if(cList.length){
      var totalMin=cList.reduce(function(a,c){return a+(+c.duration_minutes||0);},0);
      var totalKm=cList.reduce(function(a,c){return a+(+c.distance_km||0);},0);
      var top=cList[0];
      var line='Total '+totalMin+' min'+(totalKm?' · '+(Math.round(totalKm*10)/10)+' km':'');
      sections.push('<div style="padding:10px 12px;background:var(--surface);border-radius:12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><div style="font-weight:700;font-size:14px;text-transform:capitalize">🏃 '+top.activity+(cList.length>1?' + '+(cList.length-1)+' more':'')+'</div><div style="font-size:12px;color:var(--t2);font-weight:600">'+totalMin+' min</div></div><div style="font-size:12.5px;color:var(--t2);margin-top:3px">'+line+'</div></div>');
    }
    // ── Nutrition + sleep tally
    var miniBits=[];
    if(mList.length){var kcal=mList.reduce(function(a,m){return a+(+m.calories||0);},0);var prot=mList.reduce(function(a,m){return a+(+m.protein_g||0);},0);miniBits.push('🥗 '+mList.length+' meal'+(mList.length===1?'':'s')+' · '+Math.round(kcal)+' kcal · '+Math.round(prot)+'g protein');}
    if(sl.data&&sl.data.duration_hours)miniBits.push('🌙 '+sl.data.duration_hours+' h sleep');
    if(miniBits.length)sections.push('<div style="font-size:12.5px;color:var(--t2);padding:6px 4px;display:flex;flex-direction:column;gap:4px">'+miniBits.map(function(x){return '<div>'+x+'</div>';}).join('')+'</div>');
    body.innerHTML=sections.join('');
    card.style.display='block';
  }catch(e){console.warn('daily summary',e);card.style.display='none';}
}
function _greeting(){
  var h=new Date().getHours();
  var who=(CU&&CU._name)||(CU&&CU.user_metadata&&CU.user_metadata.name)||(CU&&CU.email&&CU.email.split('@')[0])||'there';
  var g=h<5?'Still up':h<12?'Good morning':h<17?'Good afternoon':h<22?'Good evening':'Good night';
  return g+', '+who.split(' ')[0];
}
async function renderHero(){
  var g=document.getElementById('hero-greet');if(g)g.textContent=_greeting();
  // Weekly stats from the last 7 days of workouts (incl. exercises/sets for volume).
  var since=new Date();since.setDate(since.getDate()-6);since.setHours(0,0,0,0);
  var{data}=await sb.from('workouts')
    .select('id,started_at,duration_seconds,exercises(sets(weight_kg,reps))')
    .eq('user_id',CU.id).gte('started_at',since.toISOString())
    .order('started_at',{ascending:true});
  data=data||[];
  // Bucket by local day for the last 7 days
  var byDay={};for(var i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-i);d.setHours(0,0,0,0);byDay[d.toISOString().split('T')[0]]=0;}
  var totalVol=0,totalSets=0,sessions=data.length,totalSecs=0;
  data.forEach(function(w){
    var key=w.started_at.split('T')[0];var vol=0;
    totalSecs+=(+w.duration_seconds||0);
    (w.exercises||[]).forEach(function(ex){(ex.sets||[]).forEach(function(s){
      var v=(+s.weight_kg||0)*(+s.reps||0);vol+=v;totalSets++;
    });});
    if(key in byDay)byDay[key]+=vol;
    totalVol+=vol;
  });
  // Render stat
  var stat=document.getElementById('hero-stat');
  if(stat){
    var fmt=totalVol>=1000?(totalVol/1000).toFixed(1)+'t':Math.round(totalVol)+'kg';
    stat.innerHTML=(totalVol>=1000?(totalVol/1000).toFixed(1)+'<span class="hero-stat-unit">tonnes lifted this week</span>':Math.round(totalVol)+'<span class="hero-stat-unit">kg lifted this week</span>');
  }
  _tickerTo(document.getElementById('hero-sessions'),sessions,500);
  _tickerTo(document.getElementById('hero-sets'),totalSets,650);
  _tickerTo(document.getElementById('hero-streak'),(_streakCount||0),500,function(v){return Math.round(v)+'d';});
  var dur=document.getElementById('hero-duration');
  if(dur){var hh=Math.floor(totalSecs/3600),mm=Math.round((totalSecs%3600)/60);dur.textContent=hh>0?hh+'h '+mm+'m':mm+'m';}
  // Sparkline (oldest → today)
  var labels=[],values=[];
  Object.keys(byDay).sort().forEach(function(k){labels.push(k.slice(5));values.push(Math.round(byDay[k]));});
  var ctx=document.getElementById('hero-spark');if(!ctx)return;
  await _ensureChart();
  if(heroSparkChart)heroSparkChart.destroy();
  heroSparkChart=new Chart(ctx.getContext('2d'),{
    type:'bar',
    data:{labels:labels,datasets:[{data:values,backgroundColor:values.map(function(v){return v>0?'#22C55E':'#E5E7EB';}),borderRadius:6,borderSkipped:false,barPercentage:.7,categoryPercentage:.85}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.parsed.y.toLocaleString()+' kg';}}}},scales:{x:{grid:{display:false},ticks:{color:'#9CA3AF',font:{size:10,weight:'500'}}},y:{display:false,beginAtZero:true}}}
  });
}
async function renderGettingStarted(){
  if(!CU||!sb)return;
  var card=document.getElementById('gs-card');if(!card)return;
  try{if(localStorage.getItem('aos_gs_dismissed_'+CU.id)==='1'){card.classList.add('hidden');return;}}catch(e){}
  try{
    var r=await Promise.all([
      sb.from('workouts').select('id',{count:'exact',head:true}).eq('user_id',CU.id),
      sb.from('meals').select('id',{count:'exact',head:true}).eq('user_id',CU.id),
      sb.from('sleep_logs').select('id',{count:'exact',head:true}).eq('user_id',CU.id)
    ]);
    var wd=(r[0].count||0)>0,md=(r[1].count||0)>0,sd=(r[2].count||0)>0;
    document.getElementById('gs-row-workout').classList.toggle('done',wd);
    document.getElementById('gs-row-meal').classList.toggle('done',md);
    document.getElementById('gs-row-sleep').classList.toggle('done',sd);
    if(wd)document.getElementById('gs-check-workout').textContent='✓';
    if(md)document.getElementById('gs-check-meal').textContent='✓';
    if(sd)document.getElementById('gs-check-sleep').textContent='✓';
    var done=(wd?1:0)+(md?1:0)+(sd?1:0);
    var prog=document.getElementById('gs-progress');if(prog)prog.textContent=done+' of 3';
    if(done>=3){
      try{localStorage.setItem('aos_gs_dismissed_'+CU.id,'1');}catch(e){}
      card.classList.add('hidden');
      if(typeof toast==='function')toast('Setup complete 🎉');
      return;
    }
    card.classList.remove('hidden');
  }catch(e){card.classList.add('hidden');}
}
function dismissGettingStarted(){
  try{if(CU)localStorage.setItem('aos_gs_dismissed_'+CU.id,'1');}catch(e){}
  var card=document.getElementById('gs-card');if(card)card.classList.add('hidden');
}

async function renderActivityFeed(){
  var el=document.getElementById('activity-feed');if(!el)return;
  el.innerHTML='<div class="skel" style="height:44px;margin-bottom:8px"></div><div class="skel" style="height:44px;margin-bottom:8px"></div><div class="skel" style="height:44px"></div>';
  var since=new Date();since.setDate(since.getDate()-7);
  var[wos,cds,meals_a,wt_a,sl_a]=await Promise.all([
    sb.from('workouts').select('id,started_at,duration_seconds,exercises(name)').eq('user_id',CU.id).gte('started_at',since.toISOString()).order('started_at',{ascending:false}).limit(8),
    sb.from('cardio_sessions').select('id,activity,duration_minutes,started_at').eq('user_id',CU.id).gte('started_at',since.toISOString()).order('started_at',{ascending:false}).limit(8),
    sb.from('meals').select('id,name,calories,created_at').eq('user_id',CU.id).gte('created_at',since.toISOString()).order('created_at',{ascending:false}).limit(8),
    sb.from('weight_logs').select('weight_kg,logged_date,created_at').eq('user_id',CU.id).gte('logged_date',since.toISOString().split('T')[0]).order('created_at',{ascending:false}).limit(4),
    sb.from('sleep_logs').select('duration_hours,logged_date,created_at').eq('user_id',CU.id).gte('logged_date',since.toISOString().split('T')[0]).order('created_at',{ascending:false}).limit(4)
  ]);
  var items=[];
  (wos.data||[]).forEach(function(w){items.push({t:new Date(w.started_at).getTime(),ico:'🏋️',bg:'var(--adim)',col:'var(--accent-d)',title:'Workout · '+Math.round((w.duration_seconds||0)/60)+' min',meta:(w.exercises||[]).slice(0,2).map(function(e){return e.name;}).join(' · ')||'No exercises'});});
  (cds.data||[]).forEach(function(c){items.push({t:new Date(c.started_at).getTime(),ico:'🏃',bg:'var(--bdim)',col:'var(--blue)',title:c.activity.charAt(0).toUpperCase()+c.activity.slice(1)+' · '+c.duration_minutes+' min',meta:'Cardio session'});});
  (meals_a.data||[]).forEach(function(m){items.push({t:new Date(m.created_at).getTime(),ico:'🥗',bg:'rgba(245,158,11,.12)',col:'var(--yel)',title:m.name||'Meal',meta:Math.round(m.calories||0)+' kcal'});});
  (wt_a.data||[]).forEach(function(w){items.push({t:new Date(w.created_at).getTime(),ico:'⚖️',bg:'rgba(168,85,247,.10)',col:'var(--pur)',title:'Weight logged',meta:w.weight_kg+' kg'});});
  (sl_a.data||[]).forEach(function(s){items.push({t:new Date(s.created_at).getTime(),ico:'🌙',bg:'rgba(168,85,247,.10)',col:'var(--pur)',title:'Sleep logged',meta:parseFloat(s.duration_hours).toFixed(1)+'h'});});
  items.sort(function(a,b){return b.t-a.t;});items=items.slice(0,6);
  if(!items.length){el.innerHTML='<p class="tm tc" style="padding:14px 0">Log something to see your activity here.</p>';return;}
  el.innerHTML=items.map(function(it){
    return '<div class="act-row"><div class="act-ico" style="background:'+it.bg+';color:'+it.col+'">'+it.ico+'</div><div class="act-body"><div class="act-title">'+it.title+'</div><div class="act-meta">'+it.meta+'</div></div><div class="act-time">'+_relTime(it.t)+'</div></div>';
  }).join('');
}
function _relTime(ts){
  var d=Math.floor((Date.now()-ts)/1000);
  if(d<60)return 'just now';
  if(d<3600)return Math.floor(d/60)+'m ago';
  if(d<86400)return Math.floor(d/3600)+'h ago';
  return Math.floor(d/86400)+'d ago';
}

/* ── STREAK ───────────────────────────────── */
var _streakCount=0,_streakDoneToday=false;
async function calcStreak(){
  var since=new Date();since.setDate(since.getDate()-30);
  var sinceDate=since.toISOString().split('T')[0];
  var[{data:woData},{data:ckData}]=await Promise.all([
    sb.from('workouts').select('started_at').eq('user_id',CU.id).gte('started_at',since.toISOString()),
    sb.from('daily_checkins').select('logged_date').eq('user_id',CU.id).gte('logged_date',sinceDate)
  ]);
  var dates=new Set((woData||[]).map(function(w){return w.started_at.split('T')[0];}));
  // Rest days (any daily check-in) also count toward the streak.
  (ckData||[]).forEach(function(c){dates.add(c.logged_date);});
  // Streak shield: include any dates the user "froze" this month.
  var freezes=(P._freezesUsedDates||[]).map(function(d){return d.split('T')[0];});
  freezes.forEach(function(d){dates.add(d);});
  var n=0;
  for(var i=0;i<30;i++){var d=new Date();d.setDate(d.getDate()-i);var ds=d.toISOString().split('T')[0];if(dates.has(ds))n++;else if(i>0)break;}
  _streakCount=n;_streakDoneToday=dates.has(today());
  document.getElementById('streak').textContent='🔥 '+n+'d';
  document.getElementById('sb-streak').textContent='🔥 '+n+' day streak';
  scheduleReminders();
  updateFreezeUI();
  updateRestDayUI();
}
function updateRestDayUI(){
  var btn=document.getElementById('restday-btn');if(!btn)return;
  btn.style.display=(_streakCount>0 && !_streakDoneToday)?'block':'none';
}
async function markRestDay(){
  if(_streakDoneToday){toast('Today is already counted ✓');return;}
  // Use a minimal daily_checkin marker (neutral mood) to preserve the streak.
  var rec={user_id:CU.id,logged_date:today(),mood:3};
  var res=await sbQueueUpsert('daily_checkins',rec,{onConflict:'user_id,logged_date'});
  if(res.queued&&!navigator.onLine)toast('😌 Saved offline — will sync when online');
  else toast('😌 Rest day saved — streak preserved');
  await calcStreak();
  await loadCheckin();
}

/* ── STREAK SHIELD ────────────────────────── */
// One streak-freeze per calendar month. Lets the user mark "yesterday" as completed
// so a missed day doesn't reset their streak.
function _currentMonth(){return today().slice(0,7);}
function freezeRemaining(){
  var m=_currentMonth();
  if(!P._freezesUsedMonth||P._freezesUsedMonth!==m)return 1;
  return 0;
}
function updateFreezeUI(){
  var el=document.getElementById('freeze-pill');
  if(!el)return;
  var rem=freezeRemaining();
  el.style.display=rem>0&&_streakCount>0?'inline-flex':'none';
}
async function useStreakFreeze(){
  if(freezeRemaining()<1){toast('No freeze available — comes back next month');return;}
  if(_streakDoneToday){toast('No need — today is already counted');return;}
  if(!confirm('Use your streak freeze for today? You get 1 per month.'))return;
  var td=today();
  var dates=(P._freezesUsedDates||[]).slice();dates.push(td);
  var update={freezes_used_month:_currentMonth(),freezes_used_dates:dates,updated_at:new Date().toISOString()};
  var{error}=await sb.from('profiles').update(update).eq('id',CU.id);
  if(error){toast('Save failed');return;}
  P._freezesUsedMonth=update.freezes_used_month;
  P._freezesUsedDates=dates;
  toast('Streak frozen for today 🧊');
  await calcStreak();
}

/* ── MACRO CALCULATOR ─────────────────────── */
var _mcGoal='maintain';
function selMacroGoal(g){
  _mcGoal=g;
  ['cut','maintain','bulk'].forEach(function(x){var el=document.getElementById('mc-goal-'+x);if(el)el.classList.toggle('on',x===g);});
  recalcMacros();
}
function openMacroCalc(){
  var curW=(P._currentWeight!=null?P._currentWeight:(wtLog.length?wtLog[wtLog.length-1].weight:''))||G.weight||'';
  document.getElementById('mc-w').value=curW||'';
  document.getElementById('mc-h').value=P.height||'';
  document.getElementById('mc-age').value=P.age||'';
  document.getElementById('mc-gen').value=P.gender||'male';
  // Carry over the user's previously chosen goal if it exists.
  selMacroGoal(_mcGoal||'maintain');
  recalcMacros();
  oModal('m-macro');
}
function _macroTargets(){
  var w=parseFloat(document.getElementById('mc-w').value)||0;
  var h=parseFloat(document.getElementById('mc-h').value)||0;
  var a=parseInt(document.getElementById('mc-age').value)||0;
  var gen=document.getElementById('mc-gen').value;
  var act=parseFloat(document.getElementById('mc-act').value)||1.55;
  if(!w||!h||!a)return null;
  // Mifflin-St Jeor BMR
  var bmr=10*w+6.25*h-5*a+(gen==='female'?-161:5);
  var tdee=bmr*act;
  var goalMult=_mcGoal==='cut'?0.8:_mcGoal==='bulk'?1.1:1.0;
  var kcal=Math.round(tdee*goalMult/10)*10;
  // Protein: 2 g/kg (cut/maintain), 1.8 g/kg (bulk to leave room for carbs)
  var pgPerKg=_mcGoal==='bulk'?1.8:2.0;
  var p=Math.round(w*pgPerKg);
  // Fat: 25% kcal
  var f=Math.round((kcal*0.25)/9);
  var c=Math.max(0,Math.round((kcal-p*4-f*9)/4));
  return{w:w,kcal:kcal,p:p,c:c,f:f,tdee:Math.round(tdee)};
}
function recalcMacros(){
  var r=_macroTargets();
  var note=document.getElementById('mc-note');
  if(!r){
    ['mc-kcal','mc-p','mc-c','mc-f'].forEach(function(id){document.getElementById(id).textContent='–';});
    note.textContent='Enter weight, height, and age to see suggestions.';return;
  }
  document.getElementById('mc-kcal').textContent=r.kcal;
  document.getElementById('mc-p').textContent=r.p;
  document.getElementById('mc-c').textContent=r.c;
  document.getElementById('mc-f').textContent=r.f;
  var lbl=_mcGoal==='cut'?'20% below maintenance':_mcGoal==='bulk'?'10% above maintenance':'at maintenance';
  note.innerHTML='Maintenance ≈ <b>'+r.tdee+' kcal</b>. Suggesting <b>'+r.kcal+'</b> '+lbl+' with <b>'+(r.p/r.w).toFixed(1)+' g/kg protein</b>. These are estimates — adjust after 2–3 weeks based on results.';
}
function applyMacros(){
  var r=_macroTargets();
  if(!r){toast('Fill in weight, height, age');return;}
  document.getElementById('g-p').value=r.p;
  document.getElementById('g-k').value=r.kcal;
  cModal('m-macro');toast('Filled — review and Save Goals');
}

/* ── GOALS MODAL ──────────────────────────── */
function openGoalsM(){document.getElementById('g-p').value=G.protein;document.getElementById('g-w').value=G.weight;document.getElementById('g-wtr').value=G.water;document.getElementById('g-k').value=G.calories;oModal('m-goals');}
async function saveGoals(){
  G.protein=parseInt(document.getElementById('g-p').value)||G.protein;
  G.weight=parseFloat(document.getElementById('g-w').value)||G.weight;
  G.water=parseInt(document.getElementById('g-wtr').value)||G.water;
  G.calories=parseInt(document.getElementById('g-k').value)||G.calories;
  cModal('m-goals');initWGrid();refresh();
  document.getElementById('g-sub').textContent='Protein: '+G.protein+'g · Weight: '+G.weight+'kg';
  document.getElementById('b-gw').innerHTML=G.weight+'<span class="su">kg</span>';
  toast('Goals updated');
  await sb.from('profiles').update({protein_goal:G.protein,weight_goal:G.weight,water_goal:G.water,calorie_goal:G.calories}).eq('id',CU.id);
}

/* ── PROFILE ──────────────────────────────── */
function loadProfile(){
  // P is populated by loadGoals() from Supabase; localStorage is offline-only fallback.
  if(!P||(!P.gender&&!P.height&&!P.age)){
    var saved=JSON.parse(localStorage.getItem('prof_'+CU.id)||'null');
    if(saved)P=Object.assign({gender:'male',age:0,height:0,units:'metric'},saved);
  }
  updateProfileUI();
}
function updateProfileUI(){
  var n=CU._name||CU.user_metadata&&CU.user_metadata.name||CU.email.split('@')[0];
  var ava=document.getElementById('set-ava');
  if(ava)ava.textContent=(n||'?').charAt(0).toUpperCase();
  var sn=document.getElementById('set-name');if(sn)sn.textContent=n||'—';
  var se=document.getElementById('set-email');if(se)se.textContent=CU.email||'—';
  var parts=[];
  if(P.gender)parts.push(P.gender.charAt(0).toUpperCase()+P.gender.slice(1));
  if(P.age)parts.push(P.age+' yrs');
  if(P.height)parts.push(P.height+(P.units==='metric'?'cm':'in'));
  var ps=document.getElementById('prof-sub');if(ps)ps.textContent=parts.join(' · ')||'Tap to set up';
}
function openProfileM(){
  var n=CU._name||CU.user_metadata&&CU.user_metadata.name||CU.email.split('@')[0];
  document.getElementById('pf-name').value=n||'';
  document.getElementById('pf-age').value=P.age||'';
  document.getElementById('pf-ht').value=P.height||'';
  _selGender=P.gender||'male';_selUnits=P.units||'metric';
  ['male','female'].forEach(function(g){document.getElementById('gpill-'+g).classList.toggle('on',g===_selGender);});
  ['metric','imperial'].forEach(function(u){document.getElementById('gpill-'+u).classList.toggle('on',u===_selUnits);});
  document.getElementById('ht-lbl').textContent=_selUnits==='metric'?'Height (cm)':'Height (in)';
  oModal('m-profile');
}
function selGender(g){
  _selGender=g;
  ['male','female'].forEach(function(x){var el=document.getElementById('gpill-'+x);if(el)el.classList.toggle('on',x===g);});
}
function selUnits(u){
  _selUnits=u;
  ['metric','imperial'].forEach(function(x){document.getElementById('gpill-'+x).classList.toggle('on',x===u);});
  document.getElementById('ht-lbl').textContent=u==='metric'?'Height (cm)':'Height (in)';
}
async function saveProfile(){
  var name=document.getElementById('pf-name').value.trim();
  var age=parseInt(document.getElementById('pf-age').value)||0;
  var height=parseInt(document.getElementById('pf-ht').value)||0;
  if(age&&(age<10||age>110)){toast('Enter a valid age (10–110)');return;}
  if(height&&(height<50||height>280)){toast('Enter a valid height');return;}
  P={gender:_selGender,age:age,height:height,units:_selUnits};
  try{localStorage.setItem('prof_'+CU.id,JSON.stringify(P));}catch(e){}
  var update={gender:_selGender,age:age||null,height_cm:height||null,units:_selUnits,updated_at:new Date().toISOString()};
  if(name&&name!==(CU._name||CU.user_metadata&&CU.user_metadata.name)){
    CU._name=name;update.name=name;
  }
  var{error}=await sb.from('profiles').update(update).eq('id',CU.id);
  updateProfileUI();
  cModal('m-profile');
  toast(error?'⚠️ Saved locally — sync failed':'Profile saved');
}

/* ── THEME ────────────────────────────────── */
var _themeMQ=null;
function _systemPrefersDark(){return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;}
function applyTheme(mode){
  var effective=mode==='system'?(_systemPrefersDark()?'dark':'light'):mode;
  var isDark=effective==='dark';
  document.body.classList.toggle('dark',isDark);
  document.documentElement.classList.toggle('dark',isDark);
  document.body.classList.remove('light'); // legacy class no-op now
  ['dark','light','system'].forEach(function(m){var el=document.getElementById('thm-'+m);if(el)el.classList.toggle('on',m===mode);});
  var sub=document.getElementById('theme-sub');
  if(sub)sub.textContent=mode==='system'?'Following system ('+effective+')':'Currently '+effective;
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',isDark?'#0B0B0F':'#FFFFFF');
}
function setThemeMode(mode){
  localStorage.setItem('athleteos_theme',mode);
  applyTheme(mode);
  _syncPref('theme',mode);
  if(_themeMQ){_themeMQ.onchange=null;_themeMQ=null;}
  if(mode==='system'&&window.matchMedia){
    _themeMQ=window.matchMedia('(prefers-color-scheme: dark)');
    _themeMQ.onchange=function(){applyTheme('system');};
  }
}
function initTheme(){
  var saved=localStorage.getItem('athleteos_theme')||'light';
  setThemeMode(saved);
  initAccent();
}

/* ── ACCENT COLOR ─────────────────────────── */
var ACCENTS={
  green: {a:'#22C55E',d:'#16A34A',rgb:'34,197,94'},
  forge: {a:'#F97316',d:'#EA580C',rgb:'249,115,22'},
  cool:  {a:'#3B82F6',d:'#2563EB',rgb:'59,130,246'},
  purple:{a:'#A855F7',d:'#9333EA',rgb:'168,85,247'},
  pink:  {a:'#EC4899',d:'#DB2777',rgb:'236,72,153'}
};
function applyAccent(name){
  var p=ACCENTS[name]||ACCENTS.green;
  var root=document.documentElement;
  root.style.setProperty('--accent',p.a);
  root.style.setProperty('--accent-d',p.d);
  root.style.setProperty('--adim','rgba('+p.rgb+',.10)');
  document.querySelectorAll('.acc-pick').forEach(function(b){b.classList.toggle('on',b.dataset.acc===name);});
  var sub=document.getElementById('accent-sub');if(sub)sub.textContent=name.charAt(0).toUpperCase()+name.slice(1);
}
function setAccent(name){
  try{localStorage.setItem('athleteos_accent',name);}catch(e){}
  applyAccent(name);
  _syncPref('accent',name);
}
function initAccent(){
  var saved='green';
  try{saved=localStorage.getItem('athleteos_accent')||'green';}catch(e){}
  applyAccent(saved);
}

/* ── FEEDBACK / FAQ stubs ─────────────────── */
var _fbCat='bug';
function openFeedback(){
  _fbCat='bug';fb_cat('bug');
  var ta=document.getElementById('fb-msg');if(ta)ta.value='';
  oModal('m-feedback');
  setTimeout(function(){var ta2=document.getElementById('fb-msg');if(ta2)ta2.focus();},120);
}
function fb_cat(c){
  _fbCat=c;
  ['bug','idea','love','other'].forEach(function(x){var el=document.getElementById('fb-cat-'+x);if(el)el.classList.toggle('on',x===c);});
}
async function sendFeedback(){
  var msg=(document.getElementById('fb-msg').value||'').trim();
  if(msg.length<3){toast('Add a bit more detail');return;}
  var btn=document.getElementById('fb-send');btn.disabled=true;btn.textContent='Sending…';
  var rec={category:_fbCat,message:msg,app_version:APP_VERSION,user_agent:navigator.userAgent.slice(0,200)};
  if(CU){rec.user_id=CU.id;rec.email=CU.email;}
  var{error}=await sb.from('feedback').insert(rec);
  btn.disabled=false;btn.textContent='Send';
  if(error){toast('Could not send — try again');console.warn(error);return;}
  cModal('m-feedback');
  toast('Thanks — we got it 💚');
}

/* ── ACCOUNT (email / password) ───────────── */
function openChangeEmailM(){var inp=document.getElementById('chmail-new');if(inp)inp.value='';oModal('m-chmail');setTimeout(function(){if(inp)inp.focus();},120);}
function openChangePasswordM(){['chpw-new','chpw-conf'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});oModal('m-chpw');setTimeout(function(){var f=document.getElementById('chpw-new');if(f)f.focus();},120);}
async function saveChangeEmail(){
  var newEmail=(document.getElementById('chmail-new').value||'').trim();
  if(!newEmail||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)){toast('Enter a valid email');return;}
  var btn=document.getElementById('chmail-btn');btn.disabled=true;btn.textContent='Sending…';
  var{error}=await sb.auth.updateUser({email:newEmail});
  btn.disabled=false;btn.textContent='Send link';
  if(error){toast(error.message||'Could not update email');console.warn(error);return;}
  cModal('m-chmail');
  toast('Confirmation link sent — check '+newEmail);
}
async function saveChangePassword(){
  var p1=document.getElementById('chpw-new').value||'',p2=document.getElementById('chpw-conf').value||'';
  if(p1.length<8){toast('Password must be at least 8 characters');return;}
  if(p1!==p2){toast('Passwords do not match');return;}
  var btn=document.getElementById('chpw-btn');btn.disabled=true;btn.textContent='Updating…';
  var{error}=await sb.auth.updateUser({password:p1});
  btn.disabled=false;btn.textContent='Update password';
  if(error){toast(error.message||'Could not update password');console.warn(error);return;}
  cModal('m-chpw');
  toast('Password updated 🔒');
}

/* ── VOICE INPUT ──────────────────────────── */
var _vRec=null,_vTarget=null,_vBtn=null;
function _voiceSupported(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition);}
function toggleVoice(targetId,btn){
  if(!_voiceSupported()){toast('Voice input not supported in this browser');return;}
  if(_vRec&&_vTarget===targetId){stopVoice();return;}
  if(_vRec)stopVoice();
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  var rec=new SR();
  rec.continuous=true;rec.interimResults=true;rec.lang=(navigator.language||'en-US');
  var target=document.getElementById(targetId);if(!target)return;
  var baseText=target.value?target.value.replace(/\s+$/,'')+' ':'';
  var finalText='';
  rec.onresult=function(e){
    var interim='';
    for(var i=e.resultIndex;i<e.results.length;i++){
      var r=e.results[i];
      if(r.isFinal)finalText+=r[0].transcript+' ';
      else interim+=r[0].transcript;
    }
    target.value=baseText+finalText+interim;
    if(typeof autoH==='function')autoH(target);
  };
  rec.onerror=function(ev){toast('Voice: '+(ev.error||'error'));stopVoice();};
  rec.onend=function(){if(_vRec===rec)stopVoice();};
  try{rec.start();}catch(e){toast('Could not start voice');return;}
  _vRec=rec;_vTarget=targetId;_vBtn=btn;
  if(btn)btn.classList.add('on');
}
function stopVoice(){
  if(_vRec){try{_vRec.stop();}catch(e){}}
  if(_vBtn)_vBtn.classList.remove('on');
  _vRec=null;_vTarget=null;_vBtn=null;
}
// ── Voice workout logging ─────────────────
// Parses spoken phrases like:
//   "eighty by eight on bench"  → 80 kg × 8 reps for the closest exercise matching "bench"
//   "80 kilos 8 reps bench press"
//   "10 reps" (uses last active exercise, bodyweight)
//   "log 100 by 5 squat"
var _voiceLogRec=null;
var _NUM_WORDS={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100};
function _wordsToNumbers(text){
  // Replace "ninety five" → "95", "one hundred" → "100", etc.
  var t=' '+text.toLowerCase()+' ';
  t=t.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[\s-]+(one|two|three|four|five|six|seven|eight|nine)\b/g,function(_,a,b){return(_NUM_WORDS[a]+_NUM_WORDS[b]);});
  t=t.replace(/\b(one|two|three|four|five|six|seven|eight|nine)[\s-]+hundred\b/g,function(_,a){return(_NUM_WORDS[a]*100);});
  t=t.replace(/\bone\s+hundred\s+(and\s+)?(\d+)\b/g,function(_,_a,b){return(100+parseInt(b));});
  Object.keys(_NUM_WORDS).forEach(function(k){t=t.replace(new RegExp('\\b'+k+'\\b','g'),_NUM_WORDS[k]);});
  return t.trim();
}
function _parseVoiceLog(transcript){
  if(!transcript)return null;
  var t=_wordsToNumbers(transcript.toLowerCase());
  // Pattern A: <weight> by/x/times <reps> [on <name>]
  var m=t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|lbs?|pounds?)?\s*(?:by|x|×|times|for)\s*(\d+)\s*(?:reps?)?(?:\s+on\s+(.+?))?$/i);
  if(m)return{w:parseFloat(m[1]),r:parseInt(m[2]),name:(m[3]||'').trim()};
  // Pattern B: <weight> <reps> [on <name>]
  m=t.match(/^(?:log\s+|logged\s+)?(\d+(?:\.\d+)?)\s*(?:kg|kilos?|lbs?|pounds?)?\s+(\d+)\s*(?:reps?)?(?:\s+(?:on|for)?\s*(.+?))?$/i);
  if(m){var name=(m[3]||'').replace(/^reps?\s+/,'').trim();return{w:parseFloat(m[1]),r:parseInt(m[2]),name:name};}
  // Pattern C: <reps> reps only (bodyweight)
  m=t.match(/^(\d+)\s*reps?(?:\s+on\s+(.+?))?$/i);
  if(m)return{w:0,r:parseInt(m[1]),name:(m[2]||'').trim()};
  return null;
}
function _findVoiceExercise(name){
  if(!wExs.length)return -1;
  if(!name)return wExs.length-1; // default to last-added
  var lc=name.toLowerCase().replace(/\s+/g,' ').trim();
  // Exact match first, then includes match.
  for(var i=0;i<wExs.length;i++)if(wExs[i].name.toLowerCase()===lc)return i;
  for(var j=0;j<wExs.length;j++){var n=wExs[j].name.toLowerCase();if(n.indexOf(lc)>=0||lc.indexOf(n)>=0)return j;}
  // Token overlap
  var toks=lc.split(' ').filter(function(x){return x.length>2;});
  for(var k=0;k<wExs.length;k++){var nn=wExs[k].name.toLowerCase();for(var ti=0;ti<toks.length;ti++){if(nn.indexOf(toks[ti])>=0)return k;}}
  return -1;
}
function voiceLogSet(btn){
  if(!_voiceSupported()){toast('Voice not supported in this browser');return;}
  if(_voiceLogRec){try{_voiceLogRec.stop();}catch(e){}_voiceLogRec=null;return;}
  if(!wExs.length){toast('Add an exercise first');return;}
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  var rec=new SR();
  rec.continuous=false;rec.interimResults=false;rec.lang=(navigator.language||'en-US');
  var lbl=document.getElementById('voice-log-lbl');var orig=lbl?lbl.textContent:'';
  if(lbl)lbl.textContent='Listening… say "80 by 8 on bench"';
  if(btn)btn.classList.add('on');
  rec.onresult=function(e){
    var transcript=e.results&&e.results[0]&&e.results[0][0]&&e.results[0][0].transcript||'';
    var p=_parseVoiceLog(transcript);
    if(!p||!p.r){toast('Didn\'t catch that — try "80 by 8 on bench"');return;}
    var idx=_findVoiceExercise(p.name);
    if(idx<0){toast('No matching exercise — say "on <name>"');return;}
    wExs[idx].sets=wExs[idx].sets||[];
    wExs[idx].sets.push({weight:p.w||0,reps:p.r});
    renderExList();
    if(navigator.vibrate)try{navigator.vibrate(40);}catch(e){}
    toast('🎤 '+wExs[idx].name+': '+(p.w>0?p.w+' kg × '+p.r:p.r+' reps'));
  };
  rec.onerror=function(ev){toast('Voice: '+(ev.error||'error'));};
  rec.onend=function(){_voiceLogRec=null;if(btn)btn.classList.remove('on');if(lbl)lbl.textContent=orig||'Voice log a set';};
  try{rec.start();}catch(e){toast('Could not start voice');if(btn)btn.classList.remove('on');return;}
  _voiceLogRec=rec;
}

/* ── AI ───────────────────────────────────── */
// Client-side rate limit on AI requests — sliding 10-minute window, max 20
// messages. Prevents runaway loops and blunts abuse if the app is shared. Not a
// security boundary (anyone can edit localStorage), but it stops good-faith
// over-use and keeps the free Pollinations endpoint from being hammered.
var _AI_RATE_MAX=20,_AI_RATE_WIN=10*60*1000;
function _aiRateOk(){
  var now=Date.now();
  var log=[];
  try{log=JSON.parse(localStorage.getItem('ai_rate_log')||'[]');}catch(e){}
  log=log.filter(function(t){return now-t<_AI_RATE_WIN;});
  if(log.length>=_AI_RATE_MAX){
    var oldest=log[0];var resetSec=Math.ceil((_AI_RATE_WIN-(now-oldest))/1000);
    var resetMin=Math.ceil(resetSec/60);
    toast('AI limit: '+_AI_RATE_MAX+'/10min reached. Try again in '+resetMin+' min.');
    return false;
  }
  log.push(now);
  try{localStorage.setItem('ai_rate_log',JSON.stringify(log));}catch(e){}
  return true;
}
async function sendMsg(){
  if(_vRec)stopVoice();
  var inp=document.getElementById('chat-in'),msg=inp.value.trim();
  if(!msg)return;
  if(!_aiRateOk())return;
  if(!premCheckUse('ai_chat')){return;}
  updateProProfileUI(); // refresh "X messages left" subtitle
  inp.value='';inp.style.height='auto';
  addMsg('u',msg);chatH.push({role:'user',content:msg});
  var tdiv=addTyping();
  var planInstr='When the user asks you to create, build, design, or generate a training plan, routine, program, or schedule — respond with a [PLAN] block first, then a short motivating message. Use this exact JSON format inside [PLAN] and [/PLAN]:\n{"name":"Plan Name","days":[{"day":"Monday","name":"Push A","focus":"Chest & Shoulders","exercises":[{"name":"Bench Press","sets":4,"reps":"6-8","rest":"90s"},{"name":"Overhead Press","sets":3,"reps":"8-10","rest":"90s"}]},{"day":"Tuesday","name":"Rest","rest":true}]}\nRules: always include all 7 days (Monday through Sunday). Use "rest":true for rest days with no exercises array. Exercise names must be real gym exercises matching the user\'s equipment. Sets: 2-5. Reps: use ranges like "8-12". For non-plan questions, reply in 2-4 sentences.';
  var actInstr='You can also perform actions in the app on the user\'s behalf. To request an action, emit one or more [ACTION]{json}[/ACTION] blocks alongside your reply. The user will see a confirmation card and tap "Run" or "Cancel" — never assume they ran. Supported actions:\n'+
    '- addMeal {name, protein, carbs, fat, calories}\n'+
    '- logWater {cups} (total cups for today, e.g. 6)\n'+
    '- logSleep {bedtime:"HH:MM", wake_time:"HH:MM", quality:"great"|"good"|"ok"|"poor"}\n'+
    '- logWeight {kg}\n'+
    '- setBodyStats {gender?, age?, height_cm?, units?:"metric"|"imperial"}\n'+
    '- setGoals {protein?, weight?, water?, calories?}\n'+
    '- startWorkout {}\n'+
    '- addExerciseToSession {name, muscle:"chest"|"back"|"legs"|"shoulders"|"arms"|"core"|"other", sets:[{weight,reps}]}\n'+
    '- finishWorkout {}\n'+
    '- setRestTimer {seconds}\n'+
    'Example: "Logging that. [ACTION]{\"type\":\"addMeal\",\"args\":{\"name\":\"Chicken bowl\",\"protein\":40,\"carbs\":50,\"fat\":10,\"calories\":480}}[/ACTION]"\n'+
    'Only emit ACTION blocks when the user clearly asks for an action. For pure questions, just answer.';
  var safetyInstr='SAFETY RULES (non-negotiable):\n'+
    '- You are NOT a doctor, physiotherapist, dietitian, or licensed medical professional. Do not diagnose, prescribe, or claim to treat conditions.\n'+
    '- If a user describes pain, injury symptoms, dizziness, chest discomfort, bleeding, mental-health crisis, eating disorder behaviour, or anything that sounds medically serious — refuse to give specific advice and direct them to a qualified professional (GP, A&E, or local mental-health line). Phrase it as care, not refusal: "This needs a real clinician, not me — please see your GP / call 999 / call 116 123 (UK Samaritans)."\n'+
    '- For pregnancy, recovery from surgery, chronic conditions (heart, diabetes, thyroid, etc.), or anyone under 16: always recommend they check with their doctor first.\n'+
    '- Do not give exact medication, supplement-stacking, or dosing advice. General nutrition info (e.g. "protein around 1.6g/kg") is fine; specific drug regimens are not.\n'+
    '- Do not encourage extreme deficits, excessive cardio, or weight-loss rates exceeding 1% body weight per week. If the user asks for that, push back kindly.\n'+
    '- Never confirm an action you did not actually take — if you emitted an [ACTION] block, the user still has to approve it.\n';
  var sys='You are AthleteOS AI Trainer — expert personal trainer and nutritionist. Direct, motivating, data-driven.\n\n'+safetyInstr+'\nUSER STATS:\n'+buildCtx()+'\n\n'+planInstr+'\n\n'+actInstr;
  // Retry with exponential backoff + per-attempt timeout.
  // Pollinations cold-starts can take 10-15s; warm calls are <1s. We give each
  // attempt 25s to finish before aborting, and retry up to 4 times. Total worst-
  // case budget is ~110s but the typing indicator stays visible the whole time.
  var body=JSON.stringify({messages:[{role:'system',content:sys}].concat(chatH.slice(-12)),model:'openai',private:true,seed:Math.floor(Math.random()*9999)});
  var reply=null,lastErr=null;
  for(var attempt=0;attempt<4;attempt++){
    var ctrl=null,timer=null;
    try{
      ctrl=new AbortController();
      timer=setTimeout(function(){try{ctrl.abort();}catch(e){}},25000);
      var res=await fetch('https://text.pollinations.ai/',{method:'POST',headers:{'Content-Type':'application/json'},body:body,signal:ctrl.signal});
      if(!res.ok){lastErr='HTTP '+res.status;
        if(res.status>=400&&res.status<500&&res.status!==429)break; // 4xx (other than rate-limit) won't get better
      }else{
        var txt=await res.text();
        if(txt&&txt.trim()){reply=txt.trim();break;}
        lastErr='empty';
      }
    }catch(e){lastErr=(e&&e.name==='AbortError')?'timeout':((e&&e.message)||'network');}
    finally{if(timer)clearTimeout(timer);}
    if(attempt<3)await new Promise(function(r){setTimeout(r,500*Math.pow(2,attempt)+Math.random()*250);});
  }
  tdiv.remove();
  if(reply){
    addMsg('a',reply);chatH.push({role:'assistant',content:reply});
  }else{
    var help=navigator.onLine
      ? '⚠️ The AI service is having a hiccup. Try again in a moment — your stats and logs are unaffected.'
      : '⚠️ You\'re offline. The AI needs a connection — everything else still works.';
    addMsg('a',help);
    if(window.Sentry)Sentry.captureMessage('AI chat failed: '+lastErr,{level:'warning'});
  }
}
function buildCtx(){
  var t=meals.reduce(function(a,m){return{p:a.p+(m.protein||0),k:a.k+(m.calories||0)};},{p:0,k:0});
  var prs=Object.values(allPRs).slice(0,6).map(function(p){return p.name+': '+p.weight+'kg';}).join(', ');
  var n=CU._name||CU.user_metadata&&CU.user_metadata.name||CU.email.split('@')[0];
  var profStr='';
  if(P.gender)profStr+='\nGender: '+P.gender;
  if(P.age)profStr+='\nAge: '+P.age;
  if(P.height)profStr+='\nHeight: '+P.height+(P.units==='metric'?'cm':'in');
  var ckStr='';
  if(ckin){var lbl={mood:'mood',energy:'energy',soreness:'soreness'};['mood','energy','soreness'].forEach(function(k){if(ckin[k])ckStr+='\n'+lbl[k]+': '+ckin[k]+'/5';});}
  var mesStr='';
  if(mesLog.length){var m=mesLog[0];['waist_cm','chest_cm','arm_cm','thigh_cm'].forEach(function(k){if(m[k]!=null)mesStr+='\n'+k.replace('_cm','')+': '+m[k]+'cm';});}
  var prefStr='';
  try{var pr=JSON.parse(localStorage.getItem('prefs_'+CU.id)||'null');if(pr){if(pr.goal)prefStr+='\nTraining goal: '+pr.goal;if(pr.experience)prefStr+='\nExperience: '+pr.experience;if(pr.weekly)prefStr+='\nWeekly goal: '+pr.weekly+' days/wk';}}catch(e){}
  return 'Name: '+n+'\nProtein: '+Math.round(t.p)+'g / '+G.protein+'g goal\nCalories: '+Math.round(t.k)+' / '+G.calories+' kcal\nWater: '+waterCups+'/'+G.water+' cups\nWeight: '+(wtLog.length?wtLog[wtLog.length-1].weight+'kg':'not logged')+' (goal: '+G.weight+'kg)\nPRs: '+(prs||'none yet')+profStr+prefStr+ckStr+mesStr;
}
function addMsg(role,text){
  var pendingActs=null;
  if(role==='a'){
    var pm=text.match(/\[PLAN\]([\s\S]*?)\[\/PLAN\]/);
    if(pm){try{var plan=JSON.parse(pm[1].trim());applyPlan(plan);text=text.replace(/\[PLAN\][\s\S]*?\[\/PLAN\]/,'').trim();if(!text)text='Your '+plan.name+' is ready! Head to the Train tab to see your schedule.';}catch(e){}}
    var acts=[];
    text=text.replace(/\[ACTION\]([\s\S]*?)\[\/ACTION\]/g,function(_,j){
      try{var a=JSON.parse(j.trim());if(a&&a.type)acts.push(a);}catch(e){}
      return '';
    }).trim();
    if(acts.length)pendingActs=acts;
    if(!text&&pendingActs)text='Want me to run '+(pendingActs.length===1?'this':'these')+'?';
  }
  var el=document.getElementById('chat-msgs');
  var d=document.createElement('div');d.className='msg '+role+' fu';d.textContent=text||'';
  el.appendChild(d);
  if(pendingActs)addActionCard(pendingActs);
  el.scrollTop=el.scrollHeight;
  return d;
}

/* ── AI ACTIONS ──────────────────────────── */
var _actSeq=0,_actMap={};
function _actLabel(a){
  var t=a.type,x=a.args||{};
  if(t==='addMeal')return '🥗 Log meal: <b>'+(x.name||'Meal')+'</b> · '+(x.protein||0)+'p / '+(x.carbs||0)+'c / '+(x.fat||0)+'f · '+(x.calories||0)+'kcal';
  if(t==='logWater')return '💧 Set water to <b>'+(x.cups||0)+' cups</b>';
  if(t==='logSleep')return '😴 Log sleep: <b>'+(x.bedtime||'?')+' → '+(x.wake_time||'?')+'</b> ('+(x.quality||'good')+')';
  if(t==='logWeight')return '⚖️ Log weight: <b>'+(x.kg||x.weight||'?')+' kg</b>';
  if(t==='setBodyStats'){var p=[];if(x.gender)p.push(x.gender);if(x.age)p.push(x.age+'y');if(x.height_cm||x.height)p.push((x.height_cm||x.height)+'cm');if(x.units)p.push(x.units);return '👤 Update profile: <b>'+p.join(' · ')+'</b>';}
  if(t==='setGoals'){var p=[];if(x.protein)p.push(x.protein+'g protein');if(x.weight)p.push(x.weight+'kg weight');if(x.water)p.push(x.water+' cups water');if(x.calories)p.push(x.calories+' kcal');return '🎯 Update goals: <b>'+p.join(' · ')+'</b>';}
  if(t==='startWorkout')return '🏋️ Start a new workout session';
  if(t==='addExerciseToSession'){var s=(x.sets||[]).map(function(z){return (z.weight||0)+'kg×'+(z.reps||0);}).join(', ');return '➕ Add exercise: <b>'+(x.name||'?')+'</b>'+(s?' · '+s:'');}
  if(t==='finishWorkout')return '🏁 Finish current workout';
  if(t==='setRestTimer')return '⏱ Start rest timer: <b>'+(x.seconds||90)+'s</b>';
  return '⚙️ '+t;
}
function addActionCard(actions){
  var id='act'+(++_actSeq);_actMap[id]=actions;
  var rows=actions.map(function(a){return '<div class="act-row" style="padding:8px 10px;background:var(--bg2);border-radius:9px;margin-top:6px;font-size:13.5px;line-height:1.45">'+_actLabel(a)+'</div>';}).join('');
  var el=document.getElementById('chat-msgs');
  var d=document.createElement('div');d.className='msg a';d.style.maxWidth='94%';
  d.innerHTML='<div style="font-weight:600;margin-bottom:4px;font-size:13px;color:var(--accent);text-transform:uppercase;letter-spacing:.5px">AI wants to:</div>'+rows+'<div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="btn" style="flex:1;padding:10px;font-size:13.5px" onclick="runActions(\''+id+'\',this)">Run</button><button type="button" class="btn-o" style="flex:1;padding:10px;font-size:13.5px" onclick="cancelActions(\''+id+'\',this)">Cancel</button></div>';
  el.appendChild(d);el.scrollTop=el.scrollHeight;
}
async function runActions(id,btn){
  var acts=_actMap[id];if(!acts)return;
  var card=btn.parentNode.parentNode;
  card.querySelectorAll('button').forEach(function(b){b.disabled=true;b.style.opacity='.5';});
  var results=[];
  for(var i=0;i<acts.length;i++){var r=await executeAction(acts[i]);results.push(r);}
  delete _actMap[id];
  card.querySelector('div[style*="gap:8px"]').outerHTML=
    '<div style="margin-top:10px;font-size:12.5px;color:var(--t2)">'+
    results.map(function(r){return (r.ok?'✓ ':'✗ ')+r.msg;}).join('<br>')+
    '</div>';
}
function cancelActions(id,btn){
  delete _actMap[id];
  var card=btn.parentNode.parentNode;
  card.querySelector('div[style*="gap:8px"]').outerHTML='<div style="margin-top:10px;font-size:12.5px;color:var(--t3)">Cancelled</div>';
}
async function executeAction(act){
  try{
    var t=act.type,a=act.args||{};
    if(t==='addMeal'){
      var id=_genId();
      var m={id:id,name:a.name||'Meal',protein:+a.protein||0,carbs:+a.carbs||0,fat:+a.fat||0,calories:+a.calories||0};
      meals.push(m);refresh();
      await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
      return{ok:true,msg:'Added '+m.name};
    }
    if(t==='logWater'){
      waterCups=Math.max(0,Math.min(99,parseInt(a.cups)||0));
      initWGrid();refresh();await syncWater();
      return{ok:true,msg:'Water set to '+waterCups+' cups'};
    }
    if(t==='logSleep'){
      var bed=a.bedtime||'23:00',wk=a.wake_time||'07:00';
      var bm=parseInt(bed.split(':')[0])*60+parseInt(bed.split(':')[1]);
      var wm=parseInt(wk.split(':')[0])*60+parseInt(wk.split(':')[1]);
      var hrs=(wm-bm)/60;if(hrs<0)hrs+=24;
      document.getElementById('h-s').innerHTML=hrs.toFixed(1)+'<span class="su">h</span>';
      setSleepRing(hrs);
      await sbQueueUpsert('sleep_logs',{user_id:CU.id,logged_date:today(),bedtime:bed,wake_time:wk,duration_hours:hrs,quality:a.quality||'good'},{onConflict:'user_id,logged_date'});
      await loadSleepHist();
      return{ok:true,msg:'Sleep logged: '+hrs.toFixed(1)+'h'};
    }
    if(t==='logWeight'){
      var v=parseFloat(a.kg||a.weight);if(!v||v<30||v>300)return{ok:false,msg:'Invalid weight'};
      wtLog.push({weight:v,date:today(),ts:Date.now()});wtLog.sort(function(x,y){return x.ts-y.ts;});
      document.getElementById('b-cw').innerHTML=v+'<span class="su">kg</span>';
      renderWtLog();renderChart();
      await sbQueueUpsert('weight_logs',{user_id:CU.id,logged_date:today(),weight_kg:v},{onConflict:'user_id,logged_date'});
      await sbQueueUpsert('profiles',{id:CU.id,current_weight_kg:v,updated_at:new Date().toISOString()},{onConflict:'id'});
      return{ok:true,msg:'Weight logged: '+v+'kg'};
    }
    if(t==='setBodyStats'){
      var upd={updated_at:new Date().toISOString()};
      if(a.gender){P.gender=a.gender;upd.gender=a.gender;}
      if(a.age){P.age=parseInt(a.age)||P.age;upd.age=P.age;}
      if(a.height_cm||a.height){P.height=parseInt(a.height_cm||a.height)||P.height;upd.height_cm=P.height;}
      if(a.units){P.units=a.units;upd.units=a.units;}
      try{localStorage.setItem('prof_'+CU.id,JSON.stringify(P));}catch(e){}
      await sb.from('profiles').update(upd).eq('id',CU.id);
      updateProfileUI();
      return{ok:true,msg:'Profile updated'};
    }
    if(t==='setGoals'){
      if(a.protein)G.protein=parseInt(a.protein)||G.protein;
      if(a.weight)G.weight=parseFloat(a.weight)||G.weight;
      if(a.water)G.water=parseInt(a.water)||G.water;
      if(a.calories)G.calories=parseInt(a.calories)||G.calories;
      initWGrid();refresh();
      document.getElementById('g-sub').textContent='Protein: '+G.protein+'g · Weight: '+G.weight+'kg';
      document.getElementById('b-gw').innerHTML=G.weight+'<span class="su">kg</span>';
      await sb.from('profiles').update({protein_goal:G.protein,weight_goal:G.weight,water_goal:G.water,calorie_goal:G.calories,updated_at:new Date().toISOString()}).eq('id',CU.id);
      return{ok:true,msg:'Goals updated'};
    }
    if(t==='startWorkout'){
      if(document.getElementById('active-sess').classList.contains('hidden'))startW();
      goTab('workout');
      return{ok:true,msg:'Workout started'};
    }
    if(t==='addExerciseToSession'){
      if(document.getElementById('active-sess').classList.contains('hidden'))startW();
      var sets=Array.isArray(a.sets)&&a.sets.length?a.sets.map(function(s){return{weight:parseFloat(s.weight)||0,reps:parseInt(s.reps)||0};}):[{weight:0,reps:0}];
      wExs.push({name:a.name||'Exercise',muscle:a.muscle||'other',sets:sets});
      renderExList();
      return{ok:true,msg:'Added '+(a.name||'exercise')};
    }
    if(t==='finishWorkout'){
      if(document.getElementById('active-sess').classList.contains('hidden'))return{ok:false,msg:'No active workout'};
      await finishW();
      return{ok:true,msg:'Workout finished'};
    }
    if(t==='setRestTimer'){
      var s=parseInt(a.seconds||a.s)||90;
      goTab('workout');openRest();setRest(s);
      return{ok:true,msg:'Rest '+s+'s started'};
    }
    return{ok:false,msg:'Unknown action: '+t};
  }catch(err){return{ok:false,msg:'Error: '+(err.message||'failed')};}
}
function addTyping(){var el=document.getElementById('chat-msgs');var d=document.createElement('div');d.className='msg ty';d.innerHTML='<div class="dots"><span></span><span></span><span></span></div>';el.appendChild(d);el.scrollTop=el.scrollHeight;return d;}
function clearChat(){chatH=[];document.getElementById('chat-msgs').innerHTML='<div class="msg a">Hey! I\'m your AI trainer. Ask me anything about workouts, nutrition, recovery, or your goals — I have your stats.</div>';}
// One-shot helper for the quick-action chips: paste the prompt into the chat input and send.
function askAI(prompt){var ta=document.getElementById('chat-in');if(!ta)return;ta.value=prompt;if(typeof autoH==='function')autoH(ta);sendMsg();}

// ── Adaptive plan: weekly refine prompt ──
// Banner appears when: AI_PLAN exists, ≥3 workouts in last 7 days, and ≥7 days since last refine.
async function maybeShowPlanTweak(){
  var el=document.getElementById('plan-tweak-banner');if(!el||!CU)return;
  if(!AI_PLAN||!AI_PLAN.days||!AI_PLAN.days.length){el.style.display='none';return;}
  var lastRefine=parseInt(localStorage.getItem('plan_refine_at_'+CU.id)||'0');
  var dismissed=parseInt(localStorage.getItem('plan_refine_dismissed_'+CU.id)||'0');
  var ageDays=Math.min((Date.now()-lastRefine)/86400000,(Date.now()-dismissed)/86400000);
  if(lastRefine===0&&dismissed===0)ageDays=8; // first run — allowed
  if(ageDays<7){el.style.display='none';return;}
  try{
    var since=new Date();since.setDate(since.getDate()-7);
    var{data:wos,count}=await sb.from('workouts').select('id',{count:'exact'}).eq('user_id',CU.id).gte('started_at',since.toISOString());
    var n=count||(wos&&wos.length)||0;
    if(n<3){el.style.display='none';return;}
    var sub=document.getElementById('plan-tweak-sub');
    if(sub)sub.textContent=n+' sessions logged in the last 7 days — let\'s update your plan to match where you are now.';
    el.style.display='block';
  }catch(e){console.warn('plan tweak check',e);el.style.display='none';}
}
function dismissPlanTweak(){
  if(!CU)return;
  try{localStorage.setItem('plan_refine_dismissed_'+CU.id,String(Date.now()));}catch(e){}
  var el=document.getElementById('plan-tweak-banner');if(el)el.style.display='none';
  toast('We\'ll check back next week');
}
async function refinePlanWithAI(){
  if(!CU||!AI_PLAN)return;
  if(!CU)return;
  try{localStorage.setItem('plan_refine_at_'+CU.id,String(Date.now()));}catch(e){}
  var el=document.getElementById('plan-tweak-banner');if(el)el.style.display='none';
  // Gather context: last 7 days' workouts + current plan, ask AI to propose a tweaked plan.
  var since=new Date();since.setDate(since.getDate()-14);
  var{data:wos}=await sb.from('workouts').select('started_at,duration_seconds,exercises(name,muscle_group,sets(weight_kg,reps))').eq('user_id',CU.id).gte('started_at',since.toISOString()).order('started_at',{ascending:false}).limit(12);
  var sessions=(wos||[]).map(function(w){return{date:(w.started_at||'').slice(0,10),dur:Math.round((w.duration_seconds||0)/60),exs:(w.exercises||[]).map(function(ex){return{name:ex.name,muscle:ex.muscle_group,topSet:(ex.sets||[]).reduce(function(a,s){var w=+s.weight_kg||0,r=+s.reps||0;var o=(r<=1?w:w*(1+r/30));return o>a.o?{w:w,r:r,o:o}:a;},{w:0,r:0,o:0})};})};});
  var prompt='Refine my training plan based on the last 14 days of logged sessions.\n\n'+
    'CURRENT PLAN: '+JSON.stringify({name:AI_PLAN.name,days:AI_PLAN.days.map(function(d){return{day:d.day,name:d.name,exercises:(d.exercises||[]).map(function(e){return e.name;})};})})+'\n\n'+
    'RECENT SESSIONS: '+JSON.stringify(sessions.slice(0,8))+'\n\n'+
    'Adjust exercise selection and rep targets to match my current strength. Bump weights/reps where I am clearly ready; ease back where I missed sessions. '+
    'Keep the day-of-week structure unless a change is obviously better. Output the revised plan as [PLAN]{json}[/PLAN] so it auto-saves.';
  goTab('ai');
  askAI(prompt);
}

/* ── BARCODE ──────────────────────────────── */
function openBcM(){document.getElementById('bc-result').classList.add('hidden');document.getElementById('bc-manual').classList.add('hidden');oModal('m-bc');startBc();}
async function startBc(){
  try{
    bcStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    var v=document.getElementById('bc-vid');v.srcObject=bcStream;
    if('BarcodeDetector' in window){var det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});var scan=async function(){try{var c=await det.detect(v);if(c.length){await lookupCode(c[0].rawValue);return;}}catch(e){}if(bcStream)setTimeout(scan,500);};v.addEventListener('playing',function(){setTimeout(scan,600);},{once:true});}
    else{document.getElementById('bc-manual').classList.remove('hidden');}
  }catch(e){document.getElementById('bc-manual').classList.remove('hidden');}
}
async function manualBarcode(){var code=document.getElementById('bc-manual-in').value.trim();if(code.length<8){toast('Enter a valid barcode');return;}await lookupCode(code);}
async function lookupCode(code){
  toast('Looking up...');
  try{var r=await fetch('https://world.openfoodfacts.org/api/v0/product/'+code+'.json');var d=await r.json();if(d.status===1){var p=d.product,n=p.nutriments;sfood={name:p.product_name||'Unknown',protein:Math.round(n.proteins_100g||0),carbs:Math.round(n.carbohydrates_100g||0),fat:Math.round(n.fat_100g||0),calories:Math.round(n['energy-kcal_100g']||0)};document.getElementById('bc-name').textContent=sfood.name+' (per 100g)';document.getElementById('bc-macros').textContent=sfood.protein+'g protein · '+sfood.carbs+'g carbs · '+sfood.fat+'g fat · '+sfood.calories+' kcal';document.getElementById('bc-result').classList.remove('hidden');stopBc();}else toast('Product not found');}catch(e){toast('Lookup failed');}
}
async function addScanned(){
  if(!sfood)return;
  var id=_genId();
  var m=Object.assign({id:id},sfood);
  meals.push(m);refresh();closeBc();toast('Food added');
  await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:sfood.name,protein_g:sfood.protein,carbs_g:sfood.carbs,fat_g:sfood.fat,calories:sfood.calories});
}
function closeBc(){stopBc();cModal('m-bc');}
function stopBc(){if(bcStream){bcStream.getTracks().forEach(function(t){t.stop();});bcStream=null;}}

/* ── CROSS-DEVICE PREFS ───────────────────── */
// Persists theme / accent / pinned-exercises to public.user_prefs so signing
// in on a second device gives the same UI. localStorage stays as the hot cache
// — writes go to both, reads come from localStorage so first paint isn't gated
// on Supabase. _syncPref() debounces multi-second bursts (rapid color changes).
var _prefSyncTmr=null,_prefPending={};
function _syncPref(key,value){
  if(!sb||!CU)return;
  _prefPending[key]=value;
  if(_prefSyncTmr)clearTimeout(_prefSyncTmr);
  _prefSyncTmr=setTimeout(function(){
    var row=Object.assign({user_id:CU.id,updated_at:new Date().toISOString()},_prefPending);
    _prefPending={};
    sb.from('user_prefs').upsert(row,{onConflict:'user_id'}).then(function(r){
      if(r.error)console.warn('_syncPref',r.error);
    });
  },800);
}
async function loadUserPrefs(){
  if(!sb||!CU)return;
  try{
    var{data}=await sb.from('user_prefs').select('*').eq('user_id',CU.id).maybeSingle();
    if(!data)return;
    // If server has a value AND localStorage doesn't (or they differ), trust the
    // server — it's the canonical store. Apply silently without re-triggering sync.
    if(data.theme&&data.theme!==localStorage.getItem('athleteos_theme')){
      localStorage.setItem('athleteos_theme',data.theme);applyTheme(data.theme);
    }
    if(data.accent&&data.accent!==localStorage.getItem('athleteos_accent')){
      localStorage.setItem('athleteos_accent',data.accent);applyAccent(data.accent);
    }
    if(data.pinned_exercises&&data.pinned_exercises.length){
      try{localStorage.setItem(_pinKey(),JSON.stringify(data.pinned_exercises.slice(0,6)));}catch(e){}
    }
  }catch(e){console.warn('loadUserPrefs',e);}
}

/* ── ONBOARDING TOOLTIPS ──────────────────── */
// Lightweight spotlight tooltip — first-visit hint on a target button. Keyed by
// id so each tooltip fires exactly once per user/device. Dismissed on first OK
// or skip; never reappears.
function _tipSeen(key){try{return localStorage.getItem('tip_'+key)==='1';}catch(e){return true;}}
function _markTip(key){try{localStorage.setItem('tip_'+key,'1');}catch(e){}}
function showTooltip(key,opts){
  if(_tipSeen(key))return;
  var target=document.getElementById(opts.targetId);if(!target)return;
  var rect=target.getBoundingClientRect();
  if(rect.width<10||rect.height<10)return;
  var ov=document.createElement('div');ov.className='tip-overlay';
  var spot=document.createElement('div');spot.className='tip-spot';
  spot.style.left=(rect.left-6)+'px';spot.style.top=(rect.top-6)+'px';
  spot.style.width=(rect.width+12)+'px';spot.style.height=(rect.height+12)+'px';
  var card=document.createElement('div');card.className='tip-card';
  card.innerHTML='<h4>'+(opts.title||'Tip')+'</h4><p>'+(opts.body||'')+'</p>'+
    '<div class="tip-actions"><button type="button" class="tip-skip">Skip</button>'+
    '<button type="button" class="tip-ok">Got it</button></div>';
  document.body.appendChild(ov);document.body.appendChild(spot);document.body.appendChild(card);
  var cardRect=card.getBoundingClientRect();
  var below=rect.bottom+10+cardRect.height<window.innerHeight-10;
  card.style.top=(below?(rect.bottom+12):(rect.top-cardRect.height-12))+'px';
  card.style.left=Math.max(12,Math.min(window.innerWidth-cardRect.width-12,rect.left+rect.width/2-cardRect.width/2))+'px';
  function close(){[ov,spot,card].forEach(function(n){if(n.parentNode)n.parentNode.removeChild(n);});_markTip(key);}
  card.querySelector('.tip-ok').onclick=close;
  card.querySelector('.tip-skip').onclick=close;
  ov.onclick=close;
}

/* ── DATA EXPORT ──────────────────────────── */
// Pulls every user-scoped row from Supabase and downloads it as JSON. RLS does
// the per-user filtering automatically. Storage objects (progress photos) are
// referenced by path only — the user can fetch the binaries from the URL list.
async function exportMyData(){
  if(!sb||!CU){toast('Sign in first');return;}
  toast('Building your export…');
  var tables=['profiles','workouts','exercises','sets','cardio_sessions','meals','water_logs','weight_logs','sleep_logs','body_measurements','progress_photos','daily_checkins','workout_templates','personal_records','custom_exercises','custom_achievements'];
  var bundle={exported_at:new Date().toISOString(),user_id:CU.id,email:CU.email,tables:{}};
  for(var i=0;i<tables.length;i++){
    var t=tables[i];
    try{
      var col=t==='profiles'?'id':'user_id';
      var{data,error}=await sb.from(t).select('*').eq(col,CU.id);
      bundle.tables[t]=error?{error:error.message}:data;
    }catch(e){bundle.tables[t]={error:String(e)};}
  }
  // Local-only data the user might want too: prefs, AI plan, custom exercises cache.
  bundle.local={
    accent:localStorage.getItem('athleteos_accent'),
    theme:localStorage.getItem('athleteos_theme'),
    pinned:getPinnedEx(),
    ai_plan:JSON.parse(localStorage.getItem('athleteos_plan_'+CU.id)||'null'),
    coach_tip_idx:localStorage.getItem('coach_tip_idx')
  };
  var blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='athleteos-export-'+today()+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},5000);
  toast('✓ Export downloaded');
}

/* ── DELETE ACCOUNT ───────────────────────── */
function openDeleteAccount(){
  document.getElementById('del-confirm').value='';
  document.getElementById('del-msg').style.display='none';
  oModal('m-delacc');
}
async function deleteMyAccount(){
  var v=document.getElementById('del-confirm').value.trim().toUpperCase();
  var msg=document.getElementById('del-msg');
  if(v!=='DELETE'){msg.textContent='Type DELETE to confirm';msg.style.display='block';return;}
  var btn=document.getElementById('del-btn');btn.disabled=true;btn.textContent='Erasing…';
  try{
    // Best-effort: clean up storage objects first (DB cascade only handles rows)
    var{data:photos}=await sb.from('progress_photos').select('storage_path').eq('user_id',CU.id);
    if(photos&&photos.length){
      var paths=photos.map(function(p){return p.storage_path;});
      await sb.storage.from('progress-photos').remove(paths);
    }
    var{error}=await sb.rpc('delete_my_account');
    if(error)throw error;
    // Clear local caches
    try{Object.keys(localStorage).forEach(function(k){if(k.indexOf(CU.id)!==-1||k.indexOf('athleteos_')===0)localStorage.removeItem(k);});}catch(e){}
    await sb.auth.signOut();
    location.reload();
  }catch(err){
    msg.textContent='Could not delete: '+(err.message||'unknown error');msg.style.display='block';
    btn.disabled=false;btn.textContent='Erase forever';
  }
}

/* ── AUTO REST TIMER ──────────────────────── */
function loadAutoRestUI(){
  var t=document.getElementById('ar-tog'),lbl=document.getElementById('ar-time');
  if(t)t.checked=!!P._autoRest;
  if(lbl)lbl.textContent=(P._defaultRest||90)+'s';
}
async function saveAutoRest(){
  P._autoRest=document.getElementById('ar-tog').checked;
  await sb.from('profiles').update({auto_rest:P._autoRest,updated_at:new Date().toISOString()}).eq('id',CU.id);
}
function pickRestDefault(){
  var cur=P._defaultRest||90;
  inputModal({title:'Default rest',sub:'How many seconds between sets (30–300)?',type:'number',value:cur,min:30,max:300,placeholder:'90'},function(raw){
    var v=parseInt(raw);if(!v||v<30||v>300){toast('Pick 30–300');return;}
    P._defaultRest=v;loadAutoRestUI();
    sb.from('profiles').update({default_rest_seconds:v,updated_at:new Date().toISOString()}).eq('id',CU.id);
  });
}

/* ── FORGOT PASSWORD / RESEND ─────────────── */
function openForgot(){
  var em=document.getElementById('l-u').value.trim();
  document.getElementById('fp-email').value=em||'';
  var msg=document.getElementById('fp-msg');msg.style.display='none';
  oModal('m-forgot');
}
async function sendReset(){
  var em=document.getElementById('fp-email').value.trim();
  var msg=document.getElementById('fp-msg');
  if(!em||em.indexOf('@')<0){msg.textContent='Enter a valid email';msg.style.color='var(--red)';msg.style.display='block';return;}
  var btn=document.getElementById('fp-btn');btn.disabled=true;btn.textContent='…';
  var{error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:window.location.origin+window.location.pathname});
  btn.disabled=false;btn.textContent='Send Link';
  if(error){msg.textContent=error.message;msg.style.color='var(--red)';msg.style.display='block';return;}
  msg.textContent='Check your email for the reset link.';msg.style.color='var(--accent)';msg.style.display='block';
  setTimeout(function(){cModal('m-forgot');},1800);
}
async function resendConfirm(){
  var em=document.getElementById('l-u').value.trim();
  if(!em){toast('Enter your email first');return;}
  var{error}=await sb.auth.resend({type:'signup',email:em});
  toast(error?error.message:'Confirmation email sent');
}

/* ── ONBOARDING WIZARD ────────────────────── */
var OB_STEPS=17;
// Steps that exist in the DOM but are auto-skipped (kept for backward compat, friction-reducing).
// 5 = prior tracking, 11 = muscle map (now on Body Stats card), 16 = reminders (discover in Settings).
var OB_SKIP={3:1,5:1,11:1,16:1};
var OB_VISIBLE_COUNT=(function(){var n=0;for(var i=0;i<OB_STEPS;i++)if(!OB_SKIP[i])n++;return n;})();
function _obLastVisible(){for(var i=OB_STEPS-1;i>=0;i--)if(!OB_SKIP[i])return i;return 0;}
function _obVisibleIndex(i){var v=0;for(var k=0;k<=i;k++)if(!OB_SKIP[k])v++;return v;}
var _ob={step:0,gender:'male',units:'metric',motivations:[],main_goal:'muscle',experience:'beginner',prior_tracking:'none',train_style:'solo',follow_plan:'flexible',logging_style:'balanced',weekly_days:3,muscle_grow:[],muscle_define:[],muscle_exclude:[],mm_mode:'grow'};
// Steps that are optional (Skip button shown, Continue allowed without selection)
var OB_OPTIONAL_STEPS={};
function ob_gender(g){_ob.gender=g;['male','female'].forEach(function(x){var el=document.getElementById('ob-g-'+x);if(el)el.classList.toggle('on',x===g);});}
function ob_units(u){_ob.units=u;['metric','imperial'].forEach(function(x){var el=document.getElementById('ob-u-'+x);if(el)el.classList.toggle('on',x===u);});var unitLbl=u==='metric'?'kg':'lb';var cwu=document.getElementById('ob-cw-u'),gwu=document.getElementById('ob-gw-u');if(cwu)cwu.textContent=unitLbl;if(gwu)gwu.textContent=unitLbl;}
function ob_pick(key,el){
  var v=el.dataset.v;
  _ob[key]=isNaN(+v)?v:+v;
  el.parentNode.querySelectorAll('.opt-item,.opt-row').forEach(function(o){o.classList.toggle('on',o===el);});
  if(key==='units'){ob_units(v);}
}
function ob_mot_toggle(el){
  var v=el.dataset.v;var i=_ob.motivations.indexOf(v);
  if(i>=0){_ob.motivations.splice(i,1);el.classList.remove('on');}
  else{_ob.motivations.push(v);el.classList.add('on');}
}
function _setOnbEyebrow(){
  // Inject "Step X of Y" eyebrow above the active step's title to match the Welcome/Paywall visual language.
  var step=document.querySelector('#onb .onb-step.on');
  if(!step)return;
  var old=step.querySelector('.onb-eyebrow');if(old)old.remove();
  if(step.id==='os-0')return; // Welcome step uses its own hero
  var h=step.querySelector('.onb-h');
  if(!h)return;
  var visIdx=_obVisibleIndex(_ob.step);
  var eb=document.createElement('div');
  eb.className='onb-eyebrow';
  eb.innerHTML='<span class="onb-eyebrow-dot"></span>Step '+visIdx+' of '+OB_VISIBLE_COUNT;
  h.parentNode.insertBefore(eb,h);
}
function ob_goto(i){
  if(i<0||i>=OB_STEPS)return;
  // Auto-jump past skipped steps
  while(OB_SKIP[i]&&i<OB_STEPS-1)i++;
  _ob.step=i;
  for(var k=0;k<OB_STEPS;k++){var s=document.getElementById('os-'+k);if(s)s.classList.toggle('on',k===i&&!OB_SKIP[k]);}
  var fill=document.getElementById('ob-prog');if(fill)fill.style.width=Math.round((_obVisibleIndex(i)/OB_VISIBLE_COUNT)*100)+'%';
  _setOnbEyebrow();
  var back=document.getElementById('ob-back-btn');if(back)back.classList.toggle('hidden',i===0);
  var lastVis=_obLastVisible();
  var skip=document.getElementById('ob-skip-btn');if(skip)skip.classList.toggle('hidden',!OB_OPTIONAL_STEPS[i]||i===lastVis);
  var next=document.getElementById('ob-next-btn');
  if(next){
    next.textContent=i===lastVis?'Finish setup':'Continue';
    next.onclick=i===lastVis?ob_finish:ob_next;
  }
  // Sync selections / render dynamic content per step
  if(i===1)_obSyncMulti('ob-mot',_ob.motivations);
  if(i===2)_obSyncList('ob-goal-list',_ob.main_goal);
  if(i===3)ob_renderBlueprint();
  if(i===4)_obSyncList('ob-exp-list',_ob.experience);
  if(i===5)_obSyncList('ob-prior-list',_ob.prior_tracking);
  if(i===7)_obSyncList('ob-train-list',_ob.train_style);
  if(i===8)_obSyncList('ob-plan-list',_ob.follow_plan);
  if(i===9)_obSyncList('ob-log-list',_ob.logging_style);
  if(i===10)_obSyncList('ob-week-list',String(_ob.weekly_days));
  if(i===11)mm_render();
  if(i===12)_obSyncList('ob-unit-list',_ob.units);
  if(i===13||i===14)ob_units(_ob.units);
  if(i===14)setTimeout(ob_renderProjection,30);
  if(i===15)ob_applyGoalDefaults();
  // Body-wrap scroll to top
  var bw=document.querySelector('.onb-body-wrap');if(bw)bw.scrollTop=0;
}
function _obSyncList(containerId,value){var c=document.getElementById(containerId);if(!c)return;c.querySelectorAll('.opt-item,.opt-row').forEach(function(o){o.classList.toggle('on',o.dataset.v===String(value));});}
function _obSyncMulti(containerId,values){var c=document.getElementById(containerId);if(!c)return;c.querySelectorAll('.onb-multi-chip').forEach(function(o){o.classList.toggle('on',values.indexOf(o.dataset.v)>=0);});}
function ob_next(){var i=_ob.step+1;while(OB_SKIP[i]&&i<OB_STEPS)i++;if(i<OB_STEPS)ob_goto(i);}
function ob_back(){var i=_ob.step-1;while(OB_SKIP[i]&&i>0)i--;if(i>=0)ob_goto(i);}

// Dynamic Blueprint (step 3) based on chosen goal
function ob_renderBlueprint(){
  var goal=_ob.main_goal;
  var bp={
    strength:{title:'Your Strength Blueprint',sub:'Force production needs heavy weight, low fatigue, and full recovery between sets.',items:[
      {ico:'🏋️',c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'1–6 reps, big lifts',b:'Squat, bench, deadlift, overhead press. Compound first, always.'},
      {ico:'⏱',c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Rest 3–5 minutes',b:'Long rests = better lifts. Quality over density.'},
      {ico:'📈',c:'rgba(168,85,247,.12)',col:'#A855F7',t:'Add weight weekly',b:'Small jumps each session beat occasional huge ones.'},
      {ico:'🥩',c:'rgba(245,158,11,.12)',col:'#B45309',t:'Eat in surplus',b:'Strength gains demand calories and protein (1.6–2.2 g/kg).'}
    ]},
    muscle:{title:'Your Muscle Blueprint',sub:'Muscle grows across a wide rep range — volume, effort, and protein drive it.',items:[
      {ico:'#',c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'6–12 reps, close to failure',b:'Effort matters more than the exact number.'},
      {ico:'⏱',c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Rest 60–120 seconds',b:'Enough recovery to keep sets productive without dragging on.'},
      {ico:'🔁',c:'rgba(168,85,247,.12)',col:'#A855F7',t:'10+ sets per muscle / week',b:'Total weekly volume is the strongest predictor of growth.'},
      {ico:'🥩',c:'rgba(245,158,11,.12)',col:'#B45309',t:'1.6–2.2 g/kg protein',b:'Spread across 3–5 meals for steady muscle protein synthesis.'}
    ]},
    lean:{title:'Your Recomp Blueprint',sub:'Build muscle and shed fat at the same time — slow but the most sustainable path.',items:[
      {ico:'⚖️',c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'Small deficit, big protein',b:'~200 kcal under maintenance, 2 g/kg protein minimum.'},
      {ico:'💪',c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Heavy lifting stays',b:'Lifting heavy signals your body to keep the muscle you have.'},
      {ico:'🚶',c:'rgba(168,85,247,.12)',col:'#A855F7',t:'8k–10k steps daily',b:'Daily movement does more for fat loss than extra cardio sessions.'},
      {ico:'🌙',c:'rgba(245,158,11,.12)',col:'#B45309',t:'7+ hours of sleep',b:'Recovery and appetite control depend on it.'}
    ]},
    lose:{title:'Your Fat Loss Blueprint',sub:'A modest deficit, enough protein, and consistent movement beats extreme diets every time.',items:[
      {ico:'⚖️',c:'rgba(239,68,68,.12)',col:'#DC2626',t:'300–500 kcal deficit',b:'Aim for ~0.5% bodyweight lost per week.'},
      {ico:'🥩',c:'rgba(245,158,11,.12)',col:'#B45309',t:'High protein',b:'2 g/kg protects muscle and keeps you full.'},
      {ico:'💪',c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Lift 3+ days a week',b:'Keep the muscle you have so the scale loss is fat, not lean tissue.'},
      {ico:'🚶',c:'rgba(168,85,247,.12)',col:'#A855F7',t:'Move daily',b:'Walks compound. 8k–12k steps per day is the sweet spot.'}
    ]},
    general:{title:'Your Fitness Blueprint',sub:'The basics done consistently beat any complicated program.',items:[
      {ico:'💪',c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Strength 2–3x / week',b:'Squat, hinge, push, pull, carry. Hit every pattern.'},
      {ico:'🏃',c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'150 min cardio / week',b:'Mix of moderate (walks, cycling) and a sprinkle of intense.'},
      {ico:'🥗',c:'rgba(168,85,247,.12)',col:'#A855F7',t:'Eat mostly real food',b:'Protein at every meal, plants on every plate.'},
      {ico:'🌙',c:'rgba(245,158,11,.12)',col:'#B45309',t:'Sleep 7–9 hours',b:'Recovery is when everything actually changes.'}
    ]}
  };
  var data=bp[goal]||bp.muscle;
  document.getElementById('ob-bp-title').textContent=data.title;
  document.getElementById('ob-bp-sub').textContent=data.sub;
  document.getElementById('ob-bp-list').innerHTML=data.items.map(function(it){
    return '<div class="onb-info"><div class="onb-info-ico" style="background:'+it.c+';color:'+it.col+'">'+it.ico+'</div><div class="onb-info-body"><div class="onb-info-t">'+it.t+'</div><div class="onb-info-b">'+it.b+'</div></div></div>';
  }).join('');
}

// Apply sensible defaults for daily targets based on goal/profile (step 15)
function ob_applyGoalDefaults(){
  var p=document.getElementById('ob-p'),k=document.getElementById('ob-k'),w=document.getElementById('ob-wt');
  if(!p||!k||!w)return;
  if(p.value&&k.value&&w.value)return; // user already set
  var wt=parseFloat(document.getElementById('ob-cw').value)||75;
  var prot,cal;
  switch(_ob.main_goal){
    case 'strength':prot=Math.round(wt*2.0);cal=Math.round(wt*38);break;
    case 'muscle':prot=Math.round(wt*1.9);cal=Math.round(wt*36);break;
    case 'lean':prot=Math.round(wt*2.0);cal=Math.round(wt*30);break;
    case 'lose':prot=Math.round(wt*2.0);cal=Math.round(wt*26);break;
    default:prot=Math.round(wt*1.6);cal=Math.round(wt*32);
  }
  if(!p.value)p.value=prot;
  if(!k.value)k.value=cal;
  if(!w.value)w.value=8;
}

// Weight projection mini-chart (step 14)
function ob_renderProjection(){
  var cw=parseFloat(document.getElementById('ob-cw').value);
  var gw=parseFloat(document.getElementById('ob-gw').value);
  var unit=_ob.units==='metric'?'kg':'lb';
  var goalV=document.getElementById('wp-goal-v'),goalU=document.getElementById('wp-goal-u');
  var rangeEl=document.getElementById('wp-range'),bestEl=document.getElementById('wp-best'),realEl=document.getElementById('wp-real');
  if(goalU)goalU.textContent=unit;
  if(!cw||!gw||cw===gw){
    if(goalV)goalV.textContent=gw?gw:'—';
    if(rangeEl)rangeEl.textContent='Enter a goal weight to see your timeline.';
    if(bestEl)bestEl.textContent='—';if(realEl)realEl.textContent='—';
    var c=document.getElementById('wp-canvas');if(c){var ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);}
    return;
  }
  if(goalV)goalV.textContent=gw;
  var loss=cw>gw; // losing or gaining
  var diff=Math.abs(cw-gw);
  // Best case ~0.7% bodyweight per week change; realistic 0.4%
  var bestPerWk=cw*0.007,realPerWk=cw*0.004;
  var bestWks=Math.max(2,Math.ceil(diff/bestPerWk));
  var realWks=Math.max(bestWks+1,Math.ceil(diff/realPerWk));
  var bestMo=Math.max(1,Math.round(bestWks/4.33)),realMo=Math.max(2,Math.round(realWks/4.33));
  if(bestEl)bestEl.textContent=bestMo+(bestMo===1?' month':' months');
  if(realEl)realEl.textContent=realMo+(realMo===1?' month':' months');
  if(rangeEl)rangeEl.textContent=(loss?'Losing ':'Gaining ')+diff.toFixed(1)+' '+unit+' — realistic in '+realMo+' months.';
  // Draw chart
  var canvas=document.getElementById('wp-canvas');if(!canvas)return;
  var dpr=window.devicePixelRatio||1;
  var W=canvas.parentNode.clientWidth,H=canvas.parentNode.clientHeight;
  canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';
  var g=canvas.getContext('2d');g.scale(dpr,dpr);g.clearRect(0,0,W,H);
  // padding
  var pl=28,pr=12,pt=12,pb=24;
  var weeks=realWks;var n=weeks+1;
  var ys=[];
  var yMin=Math.min(cw,gw)-1,yMax=Math.max(cw,gw)+1;
  function xOf(i){return pl+(i/(n-1))*(W-pl-pr);}
  function yOf(v){return pt+(1-(v-yMin)/(yMax-yMin))*(H-pt-pb);}
  // Gridlines
  g.strokeStyle='rgba(0,0,0,.06)';g.lineWidth=1;
  for(var yy=0;yy<=3;yy++){var yp=pt+yy/3*(H-pt-pb);g.beginPath();g.moveTo(pl,yp);g.lineTo(W-pr,yp);g.stroke();}
  // Realistic line (solid)
  g.strokeStyle='#A855F7';g.lineWidth=2.2;g.beginPath();
  for(var i=0;i<n;i++){var v=cw+(gw-cw)*(i/(n-1));var px=xOf(i),py=yOf(v);if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}
  g.stroke();
  // Best case shaded triangle
  var bestN=Math.min(bestWks,weeks)+1;
  g.fillStyle='rgba(168,85,247,.16)';g.beginPath();
  g.moveTo(xOf(0),yOf(cw));
  for(var j=0;j<bestN;j++){var v2=cw+(gw-cw)*(j/(bestN-1));g.lineTo(xOf(j),yOf(v2));}
  g.lineTo(xOf(bestN-1),yOf(cw));g.closePath();g.fill();
  // Best case dashed line
  g.strokeStyle='#A855F7';g.lineWidth=1.5;g.setLineDash([3,3]);g.beginPath();
  for(var k2=0;k2<bestN;k2++){var v3=cw+(gw-cw)*(k2/(bestN-1));var px2=xOf(k2),py2=yOf(v3);if(k2===0)g.moveTo(px2,py2);else g.lineTo(px2,py2);}
  g.stroke();g.setLineDash([]);
  // Start dot
  g.fillStyle='#A855F7';g.beginPath();g.arc(xOf(0),yOf(cw),5,0,Math.PI*2);g.fill();
  // Axis labels
  g.fillStyle='rgba(0,0,0,.45)';g.font='600 10px Inter,system-ui';
  g.fillText('Now',pl,H-6);
  g.textAlign='right';g.fillText(realMo+'mo',W-pr,H-6);
  g.textAlign='left';
}

/* ── CARDIO: show-all toggle ────────────── */
function cardio_loadMore(sel){
  // Replace the "show all" pseudo-option with the full set of activities, then re-open the dropdown.
  if(sel._expanded){sel.value='run';return;}
  sel._expanded=true;
  var moreGroups=[
    {h:'Strength',items:[['strength_traditional','Traditional Strength'],['strength_functional','Functional Strength'],['powerlifting','Powerlifting'],['olympic','Olympic Weightlifting'],['crossfit','CrossFit'],['strongman','Strongman']]},
    {h:'Endurance',items:[['elliptical','Elliptical'],['stair','Stair Climber'],['walk_brisk','Brisk Walk'],['treadmill','Treadmill']]},
    {h:'Team Sports',items:[['volleyball','Volleyball'],['football','Football'],['baseball','Baseball'],['handball','Handball'],['cricket','Cricket']]},
    {h:'Racquet',items:[['pickleball','Pickleball'],['squash','Squash'],['badminton','Badminton'],['tabletennis','Table Tennis']]},
    {h:'Combat',items:[['mma','Martial Arts / MMA'],['wrestling','Wrestling'],['kickboxing','Kickboxing']]},
    {h:'Water',items:[['surf','Surfing'],['paddle','Paddle / Sailing'],['waterpolo','Water Polo']]},
    {h:'Snow',items:[['ski','Skiing'],['snowboard','Snowboarding'],['xc_ski','Cross-country Skiing']]},
    {h:'Outdoor',items:[['climbing','Climbing'],['skating','Skating'],['golf','Golf']]},
    {h:'Other',items:[['dance','Dance'],['other','Other']]}
  ];
  // Remove the placeholder optgroup and append the real ones
  var grp=document.getElementById('cd-act-more-grp');if(grp)grp.remove();
  moreGroups.forEach(function(g){
    var og=document.createElement('optgroup');og.label=g.h;
    g.items.forEach(function(it){var opt=document.createElement('option');opt.value=it[0];opt.textContent=it[1];og.appendChild(opt);});
    sel.appendChild(og);
  });
  sel.value='run';
}

/* ── PLATE CALCULATOR ─────────────────────── */
var PLATES_KG=[25,20,15,10,5,2.5,1.25,0.5];
var PLATES_LB=[45,35,25,10,5,2.5];
// Per-plate color + display width (px) — larger plates look bigger.
var PLATE_STYLE={
  25:{c:'#DC2626',w:18,h:78},   20:{c:'#1E40AF',w:16,h:72},
  15:{c:'#F59E0B',w:14,h:64},   10:{c:'#16A34A',w:12,h:56},
  5: {c:'#FFFFFF',w:10,h:46,t:'#0A0A0B',b:'#94A3B8'},
  2.5:{c:'#DC2626',w:7,h:38},   1.25:{c:'#1E40AF',w:6,h:32},
  0.5:{c:'#16A34A',w:5,h:28},
  45:{c:'#DC2626',w:18,h:78},   35:{c:'#1E40AF',w:16,h:72}
};
function openPlate(prefillKg){
  var inp=document.getElementById('pc-w');
  if(prefillKg!=null&&inp)inp.value=prefillKg;
  oModal('m-plate');
  setTimeout(pc_calc,30);
}
function _pcSplit(perSide,plates){
  var out=[];var rem=perSide;
  for(var i=0;i<plates.length;i++){
    var p=plates[i];
    while(rem>=p-1e-6){out.push(p);rem-=p;}
  }
  return{plates:out,remaining:Math.max(0,rem)};
}
function pc_calc(){
  var target=parseFloat(document.getElementById('pc-w').value);
  var unit=document.getElementById('pc-u').value;
  var bar=parseFloat(document.getElementById('pc-bar').value)||0;
  var setKind=document.getElementById('pc-set').value;
  var out=document.getElementById('pc-out');
  if(!target||target<=0){out.innerHTML='<div class="pc-empty">Enter a target weight to see plate loading.</div>';return;}
  if(target<bar){out.innerHTML='<div class="pc-empty">Target weight is less than the bar itself.</div>';return;}
  // Convert target to the unit of plates if user picked imperial plates with kg target (or vice versa).
  var plateUnit=setKind==='metric'?'kg':'lb';
  var disp=target;
  var dispBar=bar;
  if(plateUnit!==unit){
    // Convert target to plateUnit
    if(plateUnit==='lb'&&unit==='kg'){disp=target*2.20462;dispBar=bar*2.20462;}
    else if(plateUnit==='kg'&&unit==='lb'){disp=target/2.20462;dispBar=bar/2.20462;}
  }
  var plates=setKind==='metric'?PLATES_KG:PLATES_LB;
  var perSide=(disp-dispBar)/2;
  if(perSide<0){out.innerHTML='<div class="pc-empty">Target is less than the bar.</div>';return;}
  var split=_pcSplit(perSide,plates);
  if(!split.plates.length){
    out.innerHTML='<div class="pc-empty">Just the bar — '+(dispBar.toFixed(1))+' '+plateUnit+'</div>';
    return;
  }
  // Build visual: bar with plates each side
  var sideHtml=split.plates.map(function(p){
    var st=PLATE_STYLE[p]||{c:'#94A3B8',w:10,h:50};
    var border=st.b?'border:1px solid '+st.b+';':'';
    var color=st.t||'#FFFFFF';
    return '<div class="pc-plate" style="width:'+st.w+'px;height:'+st.h+'px;background:'+st.c+';color:'+color+';font-size:'+(p>=10?'10px':'9px')+';'+border+'">'+p+'</div>';
  }).join('');
  // Plates closest to the collar are heaviest; reverse for right side to mirror.
  var leftHtml='<div class="pc-side l">'+sideHtml+'</div>';
  var rightHtml='<div class="pc-side r">'+split.plates.slice().reverse().map(function(p){
    var st=PLATE_STYLE[p]||{c:'#94A3B8',w:10,h:50};
    var border=st.b?'border:1px solid '+st.b+';':'';
    var color=st.t||'#FFFFFF';
    return '<div class="pc-plate" style="width:'+st.w+'px;height:'+st.h+'px;background:'+st.c+';color:'+color+';font-size:'+(p>=10?'10px':'9px')+';'+border+'">'+p+'</div>';
  }).join('')+'</div>';
  var listed=disp-split.remaining*2;
  var rem=split.remaining;
  out.innerHTML=
    '<div class="pc-bar">'+leftHtml+'<div class="pc-bar-rod"></div><div class="pc-bar-collar"></div>'+rightHtml+'</div>'+
    '<div class="pc-meta">'+
      '<div class="pc-meta-item"><div class="pc-meta-l">Per side</div><div class="pc-meta-v">'+perSide.toFixed(1)+' '+plateUnit+'</div></div>'+
      '<div class="pc-meta-item" style="border-left:1px solid var(--bdr);border-right:1px solid var(--bdr)"><div class="pc-meta-l">Total loaded</div><div class="pc-meta-v">'+listed.toFixed(1)+' '+plateUnit+'</div></div>'+
      '<div class="pc-meta-item"><div class="pc-meta-l">Bar</div><div class="pc-meta-v">'+dispBar.toFixed(1)+' '+plateUnit+'</div></div>'+
    '</div>'+
    (rem>0.01?'<div class="pc-empty" style="padding:6px 0 0;font-size:11px">Cannot reach exact weight — '+rem.toFixed(2)+' '+plateUnit+' short per side</div>':'');
}

/* ── PAYWALL ───────────────────────────────── */
var _pwPlan='yearly';
function openPaywall(){_pwPlan='yearly';pw_pick('yearly');oModal('m-paywall');}
function pw_pick(plan){
  _pwPlan=plan;
  document.querySelectorAll('.pw-plan').forEach(function(b){
    var on=b.dataset.plan===plan;
    if(on){b.classList.add('on');b.style.borderColor='var(--accent)';b.style.background='var(--adim)';}
    else{b.classList.remove('on');b.style.borderColor='var(--bdr2)';b.style.background='var(--card)';}
  });
  var cta=document.getElementById('pw-cta');if(cta){cta.textContent=plan==='yearly'?'Start 7-day free trial':(plan==='lifetime'?'Get lifetime access':'Subscribe monthly');}
}
async function pw_checkout(){
  var cta=document.getElementById('pw-cta');
  var orig=cta?cta.textContent:'';
  if(cta){cta.disabled=true;cta.textContent='Opening checkout…';}
  try{
    var{data:{session}}=await sb.auth.getSession();
    if(!session){toast('Please sign in again');if(cta){cta.disabled=false;cta.textContent=orig;}return;}
    // Strip any trailing #paywall hash from current location so the return URL is clean.
    var base=location.href.split('#')[0];
    var r=await fetch(SUPA_URL+'/functions/v1/create-checkout-session',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':SUPA_KEY},
      body:JSON.stringify({plan:_pwPlan,returnUrl:base})
    });
    if(!r.ok){
      var body=await r.text();
      console.warn('checkout failed',r.status,body);
      toast(r.status===500?'Stripe not configured yet':'Checkout failed');
      if(cta){cta.disabled=false;cta.textContent=orig;}
      return;
    }
    var j=await r.json();
    if(j.url){location.href=j.url;}
    else{toast('Checkout failed');if(cta){cta.disabled=false;cta.textContent=orig;}}
  }catch(err){
    console.warn('checkout error',err);
    toast('Network error');
    if(cta){cta.disabled=false;cta.textContent=orig;}
  }
}
async function openCustomerPortal(){
  try{
    var{data:{session}}=await sb.auth.getSession();
    if(!session){toast('Please sign in again');return;}
    var base=location.href.split('#')[0];
    var r=await fetch(SUPA_URL+'/functions/v1/create-portal-session',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':SUPA_KEY},
      body:JSON.stringify({returnUrl:base})
    });
    if(!r.ok){toast('Could not open portal');return;}
    var j=await r.json();
    if(j.url)location.href=j.url;
  }catch(err){console.warn(err);toast('Network error');}
}
function isPremium(){return !!(P&&P._isPremium);}
// Show a one-time, gentle "Try Pro" nudge at a chosen moment. Stored per-user so it never repeats.
// Tap = open paywall. Auto-dismisses after ~7s. Free users only; no-op for Pro.
function softProNudge(key,msg){
  if(isPremium())return;
  try{
    var k='aopn_'+(CU&&CU.id?CU.id:'anon')+'_'+key;
    if(localStorage.getItem(k))return;
    localStorage.setItem(k,'1');
  }catch(e){}
  var el=document.getElementById('pro-nudge');
  if(!el){
    el=document.createElement('div');el.id='pro-nudge';
    el.style.cssText='position:fixed;left:50%;bottom:calc(var(--navH,60px) + env(safe-area-inset-bottom,0px) + 14px);transform:translateX(-50%);max-width:min(360px,calc(100vw - 28px));background:linear-gradient(135deg,#22C55E 0%,#A855F7 100%);color:#fff;border-radius:18px;padding:14px 16px;font-family:Inter,sans-serif;font-size:14px;font-weight:600;line-height:1.4;box-shadow:0 12px 32px -8px rgba(0,0,0,.35);z-index:900;display:flex;gap:10px;align-items:center;cursor:pointer;opacity:0;transition:opacity .25s,transform .25s';
    el.onclick=function(){el.remove();try{openPaywall();}catch(e){}};
    document.body.appendChild(el);
  }
  el.innerHTML='<span style="font-size:18px">✨</span><span style="flex:1">'+msg+'</span><span style="font-size:11px;opacity:.85;font-weight:800;letter-spacing:.5px">TAP</span>';
  requestAnimationFrame(function(){el.style.opacity='1';});
  clearTimeout(el._t);el._t=setTimeout(function(){if(el)el.style.opacity='0';setTimeout(function(){if(el)el.remove();},300);},7000);
}
function requirePremium(featureLabel){
  if(isPremium())return true;
  openPaywall();
  return false;
}

/* ── PREMIUM GATING — generous free tier ── */
var PREM_LIMITS={
  ai_chat:7,        // AI trainer messages per day
  ex_demo:10,       // exercise demo lookups per day
  photos:5,         // total progress photos before paywall
  templates:2       // total custom workout templates before paywall
};
function _premKey(feature){var uid=(CU&&CU.id)?CU.id:'anon';return 'aopro_'+feature+'_'+uid+'_'+today();}
function premCount(feature){try{return parseInt(localStorage.getItem(_premKey(feature))||'0',10);}catch(e){return 0;}}
function premInc(feature){try{var n=premCount(feature)+1;localStorage.setItem(_premKey(feature),String(n));return n;}catch(e){return 0;}}
function premRemaining(feature){var l=PREM_LIMITS[feature]||0;return Math.max(0,l-premCount(feature));}
// Daily-quota gate: returns true if allowed (and increments counter).
function premCheckUse(feature){
  if(isPremium())return true;
  var limit=PREM_LIMITS[feature];if(!limit)return true;
  if(premCount(feature)>=limit){openPaywall();return false;}
  premInc(feature);
  // Friendly heads-up when 2 or fewer uses remain.
  var left=premRemaining(feature);
  if(left>0&&left<=2){toast(left+' '+(feature==='ai_chat'?'AI message':'demo')+(left===1?'':'s')+' left today');}
  return true;
}
// Lifetime-count gate (caller passes current total).
function premCheckTotal(feature,currentTotal){
  if(isPremium())return true;
  var limit=PREM_LIMITS[feature];if(!limit)return true;
  if(currentTotal>=limit){openPaywall();return false;}
  return true;
}
// Hard lock: Pro-only feature, no free use.
function premCheckLock(){if(isPremium())return true;openPaywall();return false;}
// Handle return from Stripe Checkout. The success page will land on the app with
// #paywall=success&session_id=cs_test_...
async function handlePaywallReturn(){
  var h=location.hash||'';
  if(h.indexOf('paywall=success')>=0){
    history.replaceState(null,'',location.pathname+location.search);
    toast('Welcome to AthleteOS Pro ✨');
    // The webhook is the source of truth — give it a moment, then refresh the profile.
    setTimeout(async function(){
      await loadGoals();
      updateProProfileUI();
    },1500);
  }else if(h.indexOf('paywall=cancel')>=0){
    history.replaceState(null,'',location.pathname+location.search);
    toast('Checkout cancelled');
  }
}
function updateProProfileUI(){
  // Settings "Try Pro" card
  var card=document.getElementById('set-pro-card');
  var t=document.getElementById('set-pro-title'),s=document.getElementById('set-pro-sub');
  var planLabel=P._premiumPlan==='lifetime'?'Lifetime':P._premiumPlan==='yearly'?'Yearly':P._premiumPlan==='monthly'?'Monthly':'Pro';
  if(card){
    if(isPremium()){
      if(t)t.textContent='AthleteOS Pro — active';
      if(s)s.textContent=planLabel+' plan · Tap to manage';
      card.setAttribute('onclick','openCustomerPortal()');
    }else{
      if(t)t.textContent='Try AthleteOS Pro';
      if(s)s.textContent='7 days free — unlock plans, demos & analytics';
      card.setAttribute('onclick','openPaywall()');
    }
  }
  // Sidebar Pro card
  var sbPro=document.getElementById('sb-pro');
  var sbT=document.getElementById('sb-pro-t'),sbB=document.getElementById('sb-pro-b'),sbI=document.getElementById('sb-pro-ico');
  if(sbPro){
    if(isPremium()){
      sbPro.classList.add('active');
      if(sbT)sbT.textContent='Pro · active';
      if(sbB)sbB.textContent=planLabel+' · manage';
      if(sbI)sbI.textContent='✓';
      sbPro.setAttribute('onclick','openCustomerPortal()');
    }else{
      sbPro.classList.remove('active');
      if(sbT)sbT.textContent='Try AthleteOS Pro';
      if(sbB)sbB.textContent='7 days free';
      if(sbI)sbI.textContent='✨';
      sbPro.setAttribute('onclick','openPaywall()');
    }
  }
  // Topbar Pro indicator (free users only)
  var tbPro=document.getElementById('tb-pro');
  if(tbPro)tbPro.style.display=isPremium()?'none':'inline-flex';
  // PRO badges on locked features
  var mmPro=document.getElementById('body-mm-pro');
  if(mmPro)mmPro.style.display=isPremium()?'none':'inline-flex';
  // AI page header subtitle: show daily message allowance for free users
  var aiSub=document.getElementById('ai-page-sub');
  if(aiSub){
    if(isPremium()){
      aiSub.textContent='Pro · unlimited messages';
      aiSub.style.color='var(--accent-d)';
    }else{
      var left=premRemaining('ai_chat');
      aiSub.innerHTML='Free · <b>'+left+'</b> of '+PREM_LIMITS.ai_chat+' messages left today · <span class="lnk" style="font-size:12px;padding:0;font-weight:700" onclick="openPaywall()">Upgrade</span>';
      aiSub.style.color='var(--t2)';
    }
  }
}

/* ── ONBOARDING & MUSCLE-MAP HELPERS ─────── */
function replayOnboarding(){
  // Pull saved prefs back into _ob if available so the wizard reflects the user's current state.
  try{
    var pr=JSON.parse(localStorage.getItem('prefs_'+CU.id)||'null');
    if(pr){_ob.main_goal=pr.goal||_ob.main_goal;_ob.experience=pr.experience||_ob.experience;_ob.weekly_days=+pr.weekly||_ob.weekly_days;}
  }catch(e){}
  // Pull muscle prefs from the profile if loaded
  if(P._muscle_grow)_ob.muscle_grow=P._muscle_grow.slice();
  if(P._muscle_define)_ob.muscle_define=P._muscle_define.slice();
  if(P._muscle_exclude)_ob.muscle_exclude=P._muscle_exclude.slice();
  showOnboarding();
}
function openMuscleEditor(){
  if(!premCheckLock())return;
  // Load current map into _ob so mm_render reflects existing state
  if(P._muscle_grow)_ob.muscle_grow=P._muscle_grow.slice();else _ob.muscle_grow=_ob.muscle_grow||[];
  if(P._muscle_define)_ob.muscle_define=P._muscle_define.slice();else _ob.muscle_define=_ob.muscle_define||[];
  if(P._muscle_exclude)_ob.muscle_exclude=P._muscle_exclude.slice();else _ob.muscle_exclude=_ob.muscle_exclude||[];
  _ob.mm_mode='grow';
  oModal('m-muscle');
  setTimeout(mm_render,30);
}
async function saveMuscleMap(){
  P._muscle_grow=_ob.muscle_grow.slice();
  P._muscle_define=_ob.muscle_define.slice();
  P._muscle_exclude=_ob.muscle_exclude.slice();
  var{error}=await sb.from('profiles').update({muscle_grow:_ob.muscle_grow,muscle_define:_ob.muscle_define,muscle_exclude:_ob.muscle_exclude,updated_at:new Date().toISOString()}).eq('id',CU.id);
  if(error){toast('Save failed');return;}
  cModal('m-muscle');
  updateMuscleSummary();
  renderBodyMuscleMap();
  toast('Saved');
}
function updateMuscleSummary(){
  var el=document.getElementById('set-mm-sub');if(!el)return;
  var n=(P._muscle_grow||[]).length+(P._muscle_define||[]).length+(P._muscle_exclude||[]).length;
  el.textContent=n?(n+' muscle'+(n===1?'':'s')+' targeted'):'Edit your muscle map';
}
function renderBodyMuscleMap(){
  var wrap=document.getElementById('body-mm-wrap');if(!wrap)return;
  var g=P._muscle_grow||[],d=P._muscle_define||[],x=P._muscle_exclude||[];
  // Build a read-only chip view using the saved profile selections (independent of _ob state).
  wrap.innerHTML=MM_GROUPS.map(function(grp){
    return '<div class="mm-group"><div class="mm-group-h">'+grp.h+'</div><div class="mm-chips">'+
      grp.keys.map(function(k){
        var st='';
        if(g.indexOf(k)>=0)st='grow';
        else if(d.indexOf(k)>=0)st='def';
        else if(x.indexOf(k)>=0)st='exc';
        var cls='mm-chip mm-chip-readonly'+(st?' '+st:'');
        return '<span class="'+cls+'"><span class="mm-chip-dot"></span>'+MM_LABELS[k]+'</span>';
      }).join('')+
    '</div></div>';
  }).join('');
  var sum=document.getElementById('body-mm-summary');if(!sum)return;
  var total=g.length+d.length+x.length;
  if(!total){sum.textContent='Tap Edit to mark which muscles you want to grow, define, or skip.';return;}
  var parts=[];if(g.length)parts.push('<b style="color:#8B5CF6">'+g.length+' growing</b>');if(d.length)parts.push('<b style="color:#F59E0B">'+d.length+' defining</b>');if(x.length)parts.push('<b style="color:#EC4899">'+x.length+' excluded</b>');
  sum.innerHTML=parts.join(' · ');
}

/* ── MUSCLE MAP ─────────────────────────── */
// Clean grouped chip list: Upper body / Core / Lower body. Each chip has 4 states:
// off → grow (purple) → define (amber) → exclude (pink) — controlled by the mode buttons.
var MM_LABELS={chest:'Chest',front_delts:'Front Delts',rear_delts:'Rear Delts',traps:'Traps',lats:'Lats',biceps:'Biceps',triceps:'Triceps',forearms:'Forearms',abs:'Abs',obliques:'Obliques',lower_back:'Lower Back',quads:'Quads',hamstrings:'Hamstrings',glutes:'Glutes',calves:'Calves',adductors:'Adductors'};
var MM_GROUPS=[
  {h:'Upper Body',keys:['chest','front_delts','rear_delts','lats','traps','biceps','triceps','forearms']},
  {h:'Core',keys:['abs','obliques','lower_back']},
  {h:'Lower Body',keys:['quads','hamstrings','glutes','calves','adductors']}
];
function _mmStateOf(k){
  if(_ob.muscle_grow.indexOf(k)>=0)return 'grow';
  if(_ob.muscle_define.indexOf(k)>=0)return 'def';
  if(_ob.muscle_exclude.indexOf(k)>=0)return 'exc';
  return '';
}
function _mmChipsHtml(interactive){
  return MM_GROUPS.map(function(g){
    return '<div class="mm-group"><div class="mm-group-h">'+g.h+'</div><div class="mm-chips">'+
      g.keys.map(function(k){
        var st=_mmStateOf(k);
        var cls='mm-chip'+(st?' '+st:'')+(interactive?'':' mm-chip-readonly');
        var attrs=interactive?' onclick="mm_tap(\''+k+'\')"':'';
        return '<button type="button" class="'+cls+'" data-k="'+k+'"'+attrs+'><span class="mm-chip-dot"></span>'+MM_LABELS[k]+'</button>';
      }).join('')+
    '</div></div>';
  }).join('');
}
function mm_render(){
  var wrap=document.getElementById('ob-mm-wrap');if(!wrap)return;
  wrap.innerHTML=_mmChipsHtml(true);
}
function mm_setMode(m){
  _ob.mm_mode=m;
  ['grow','def','exc'].forEach(function(x){var b=document.querySelector('.mm-mode-btn[data-mode="'+x+'"]');if(b)b.classList.toggle('on',x===m);});
}
function _mm_removeFromAll(k){
  ['muscle_grow','muscle_define','muscle_exclude'].forEach(function(field){
    var i=_ob[field].indexOf(k);if(i>=0)_ob[field].splice(i,1);
  });
}
function _mm_paintChip(k){
  var chip=document.querySelector('#ob-mm-wrap .mm-chip[data-k="'+k+'"]');
  if(!chip)return;
  chip.classList.remove('grow','def','exc');
  var st=_mmStateOf(k);if(st)chip.classList.add(st);
}
function _mm_paintAll(){
  MM_GROUPS.forEach(function(g){g.keys.forEach(_mm_paintChip);});
}
function mm_tap(k){
  var mode=_ob.mm_mode;
  var fieldByMode={grow:'muscle_grow',def:'muscle_define',exc:'muscle_exclude'};
  var field=fieldByMode[mode];
  var alreadyInMode=_ob[field].indexOf(k)>=0;
  _mm_removeFromAll(k);
  if(!alreadyInMode)_ob[field].push(k);
  _mm_paintChip(k);
}
function mm_quick(kind){
  if(kind==='clear'){_ob.muscle_grow=[];_ob.muscle_define=[];_ob.muscle_exclude=[];_mm_paintAll();return;}
  var upper=['chest','front_delts','rear_delts','lats','traps','biceps','triceps','forearms'];
  var lower=['quads','hamstrings','glutes','calves','adductors'];
  var add=kind==='upper'?upper:lower;
  add.forEach(function(k){
    if(_ob.muscle_grow.indexOf(k)<0&&_ob.muscle_define.indexOf(k)<0&&_ob.muscle_exclude.indexOf(k)<0){
      _ob.muscle_grow.push(k);
    }
  });
  _mm_paintAll();
}

function showOnboarding(){
  document.getElementById('app').style.display='none';
  document.getElementById('onb').classList.add('on');
  // Reset step
  _ob.step=0;
  ob_goto(0);
  // Prefill defaults
  var ageEl=document.getElementById('ob-age');if(ageEl)ageEl.value=P.age||'';
  var htEl=document.getElementById('ob-ht');if(htEl)htEl.value=P.height||'';
  var cwEl=document.getElementById('ob-cw');if(cwEl)cwEl.value=(P._currentWeight!=null?P._currentWeight:(wtLog&&wtLog.length?wtLog[wtLog.length-1].weight:''));
  var gwEl=document.getElementById('ob-gw');if(gwEl)gwEl.value=G.weight||'';
  ob_gender(P.gender||'male');ob_units(P.units||'metric');
}

function _splashStep(text,pct){var s=document.getElementById('spl-step'),f=document.getElementById('spl-fill');if(s){s.style.opacity='0';setTimeout(function(){s.textContent=text;s.style.opacity='1';},120);}if(f)f.style.width=pct+'%';}
async function ob_finish(){
  var btn=document.getElementById('ob-next-btn');btn.disabled=true;btn.textContent='Saving…';
  // Show splash and hide wizard
  document.getElementById('onb').classList.remove('on');
  var splash=document.getElementById('onb-splash');splash.classList.add('on');
  _splashStep('Reading your answers…',12);
  var age=parseInt(document.getElementById('ob-age').value)||null;
  var ht=parseInt(document.getElementById('ob-ht').value)||null;
  var cw=parseFloat(document.getElementById('ob-cw').value)||null;
  var gw=parseFloat(document.getElementById('ob-gw').value)||G.weight||null;
  var pr=parseInt(document.getElementById('ob-p').value)||170;
  var kc=parseInt(document.getElementById('ob-k').value)||2500;
  var wt=parseInt(document.getElementById('ob-wt').value)||8;
  var rwo=document.getElementById('ob-r-wo').checked;
  var rpr=document.getElementById('ob-r-pr').checked;
  P={gender:_ob.gender,age:age||0,height:ht||0,units:_ob.units};
  G={protein:pr,weight:gw||85,water:wt,calories:kc};
  try{localStorage.setItem('prof_'+CU.id,JSON.stringify(P));}catch(e){}
  try{localStorage.setItem('prefs_'+CU.id,JSON.stringify({goal:_ob.main_goal,experience:_ob.experience,weekly:_ob.weekly_days}));}catch(e){}
  var upd={
    gender:_ob.gender,age:age,height_cm:ht,units:_ob.units,
    current_weight_kg:cw,
    protein_goal:pr,weight_goal:gw||85,water_goal:wt,calorie_goal:kc,
    notif_workout:rwo,notif_protein:rpr,
    onboarding_done:true,
    onb_v2_done:true,
    onb_motivations:_ob.motivations,
    onb_main_goal:_ob.main_goal,
    onb_experience:_ob.experience,
    onb_prior_tracking:_ob.prior_tracking,
    onb_train_style:_ob.train_style,
    onb_follow_plan:_ob.follow_plan,
    onb_logging_style:_ob.logging_style,
    onb_weekly_days:_ob.weekly_days,
    muscle_grow:_ob.muscle_grow,
    muscle_define:_ob.muscle_define,
    muscle_exclude:_ob.muscle_exclude,
    updated_at:new Date().toISOString()
  };
  _splashStep('Saving your profile…',32);
  var{error:perr}=await sb.from('profiles').update(upd).eq('id',CU.id);
  if(perr){console.warn('profile update',perr);}
  _splashStep('Tuning your nutrition targets…',55);
  if(cw){await sb.from('weight_logs').insert({user_id:CU.id,logged_date:today(),weight_kg:cw});}
  if(rwo||rpr){
    try{if(typeof Notification!=='undefined'&&Notification.permission==='default')await Notification.requestPermission();}catch(e){}
  }
  _splashStep('Mapping your target muscles…',75);
  await new Promise(function(r){setTimeout(r,500);});
  _splashStep('Wiring up your AI coach…',92);
  await loadGoals();await loadWtLog();
  updateProfileUI();initWGrid();refresh();
  var bgw=document.getElementById('b-gw');if(bgw)bgw.innerHTML=G.weight+'<span class="su">kg</span>';
  scheduleReminders();
  _splashStep('Ready!',100);
  await new Promise(function(r){setTimeout(r,420);});
  document.getElementById('onb-splash').classList.remove('on');
  // Second-to-last step: show the paywall (skipped for users who are already premium).
  if(!isPremium()){
    showOnbPaywall();
  }else{
    document.getElementById('app').style.display='flex';
    toast('Welcome aboard 💪');
  }
  btn.disabled=false;btn.textContent='Finish setup';
}

/* ── ONBOARDING PAYWALL (second-to-last sign-up step) ─ */
function showOnbPaywall(){
  document.getElementById('app').style.display='none';
  var s=document.getElementById('onb-splash');if(s)s.classList.remove('on');
  var o=document.getElementById('onb');if(o)o.classList.remove('on');
  var w=document.getElementById('welcome');if(w)w.classList.add('hidden');
  var a=document.getElementById('auth');if(a)a.style.display='none';
  var p=document.getElementById('ob-paywall');if(p)p.classList.remove('hidden');
  obp_pick('yearly');
  try{window.scrollTo(0,0);}catch(e){}
}
function obp_pick(plan){
  _pwPlan=plan;
  document.querySelectorAll('.obp-plan').forEach(function(b){
    b.classList.toggle('on',b.dataset.plan===plan);
  });
  var cta=document.getElementById('obp-cta');
  if(cta){cta.textContent=plan==='yearly'?'Start 7-day free trial':(plan==='lifetime'?'Get lifetime access':'Subscribe monthly');}
}
async function obp_start(){
  var cta=document.getElementById('obp-cta');
  var orig=cta?cta.textContent:'';
  if(cta){cta.disabled=true;cta.textContent='Opening checkout…';}
  try{
    var{data:{session}}=await sb.auth.getSession();
    if(!session){toast('Please sign in again');if(cta){cta.disabled=false;cta.textContent=orig;}return;}
    var base=location.href.split('#')[0];
    var r=await fetch(SUPA_URL+'/functions/v1/create-checkout-session',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':SUPA_KEY},
      body:JSON.stringify({plan:_pwPlan,returnUrl:base})
    });
    if(!r.ok){
      var body=await r.text();console.warn('onb checkout failed',r.status,body);
      toast(r.status===500?'Stripe not configured yet':'Checkout failed');
      if(cta){cta.disabled=false;cta.textContent=orig;}return;
    }
    var j=await r.json();
    if(j.url){location.href=j.url;}
    else{toast('Checkout failed');if(cta){cta.disabled=false;cta.textContent=orig;}}
  }catch(err){
    console.warn('onb checkout error',err);
    toast('Network error');
    if(cta){cta.disabled=false;cta.textContent=orig;}
  }
}
function obp_skip(){
  var p=document.getElementById('ob-paywall');if(p)p.classList.add('hidden');
  document.getElementById('app').style.display='flex';
  toast('Welcome aboard 💪');
}

/* ── CARDIO ───────────────────────────────── */
var cardioLog=[];
function openCardio(){oModal('m-cardio');}
async function saveCardio(){
  var act=document.getElementById('cd-act').value;
  var dur=parseInt(document.getElementById('cd-dur').value)||0;
  if(!dur){toast('Enter duration');return;}
  var dist=parseFloat(document.getElementById('cd-dist').value)||null;
  var cal=parseInt(document.getElementById('cd-cal').value)||null;
  var hr=parseInt(document.getElementById('cd-hr').value)||null;
  cModal('m-cardio');
  ['cd-dur','cd-dist','cd-cal','cd-hr'].forEach(function(id){document.getElementById(id).value='';});
  var id=_genId();
  var row={id:id,user_id:CU.id,activity:act,duration_minutes:dur,distance_km:dist,calories:cal,avg_heart_rate:hr,started_at:new Date().toISOString()};
  cardioLog.unshift(row);renderCardio();
  toast('🏃 '+dur+'min '+act+' logged');
  await sbQueueInsert('cardio_sessions',row);
  // PR detection only when online (it needs to query prior sessions).
  if(navigator.onLine)_checkCardioPRs(row).catch(function(e){console.warn('cardio PR check',e);});
}
// Detect cardio PRs by comparing this session against prior sessions of the same activity.
// Stores into personal_records with pr_type:'cardio_distance' or 'cardio_pace'. Triggers celebration toast.
async function _checkCardioPRs(session){
  if(!session||!CU)return;
  try{
    var{data:prior}=await sb.from('cardio_sessions')
      .select('id,distance_km,duration_minutes,started_at')
      .eq('user_id',CU.id).eq('activity',session.activity)
      .neq('id',session.id);
    var rows=prior||[];
    var newPRs=[];
    if(session.distance_km&&+session.distance_km>0){
      var bestDist=rows.reduce(function(m,r){var d=+r.distance_km||0;return d>m?d:m;},0);
      if(+session.distance_km>bestDist){
        newPRs.push({type:'cardio_distance',label:'Longest '+session.activity+': '+session.distance_km+' km',prev:bestDist});
      }
    }
    // Pace = minutes per km. Lower is better. Require ≥1 km to be meaningful.
    if(session.distance_km&&+session.distance_km>=1&&session.duration_minutes>0){
      var newPace=session.duration_minutes/session.distance_km;
      var bestPace=rows.reduce(function(m,r){if(!r.distance_km||+r.distance_km<1||!r.duration_minutes)return m;var p=r.duration_minutes/r.distance_km;return(m==null||p<m)?p:m;},null);
      if(bestPace==null||newPace<bestPace){
        newPRs.push({type:'cardio_pace',label:'Fastest '+session.activity+' pace: '+newPace.toFixed(2)+' min/km',prev:bestPace||0});
      }
    }
    if(!newPRs.length)return;
    // Persist to personal_records (best-effort).
    for(var i=0;i<newPRs.length;i++){
      try{
        await sb.from('personal_records').insert({
          user_id:CU.id,exercise_name:session.activity,pr_type:newPRs[i].type,
          weight_kg:session.distance_km||0,reps:session.duration_minutes||0,one_rm_kg:0,
          workout_id:null,prev_value:newPRs[i].prev||0,achieved_at:new Date().toISOString()
        });
      }catch(e){console.warn('cardio PR insert failed',e);}
    }
    toast('🏆 New cardio PR — '+newPRs[0].label);
  }catch(e){console.warn('cardio PR check failed',e);}
}
async function loadCardio(){
  var{data}=await sb.from('cardio_sessions').select('*').eq('user_id',CU.id).order('started_at',{ascending:false}).limit(15);
  cardioLog=data||[];renderCardio();
}
function renderCardio(){
  var el=document.getElementById('cd-list');if(!el)return;
  if(!cardioLog.length){el.innerHTML='<div class="empty-state" style="padding:18px 8px"><div class="empty-ico" style="background:rgba(56,189,248,.12);color:#0EA5E9"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="14" r="5"/><path d="M30 24l8-4 6 6 6 4M30 24l-6 8 8 6v12"/><path d="M38 30l-4 8 8 6M22 50l8-12"/></svg></div><div class="empty-h">No cardio logged yet</div><div class="empty-sub">Track runs, rides, swims — best pace and longest sessions become PRs automatically.</div><button type="button" class="empty-cta" onclick="openCardio()">+ Log cardio</button></div>';return;}
  var ico={run:'🏃',walk:'🚶',bike:'🚴',swim:'🏊',row:'🚣',elliptical:'🌀',stair:'🪜',hike:'🥾',climbing:'🧗',skating:'⛸️',golf:'⛳',ski:'⛷️',snowboard:'🏂',xc_ski:'🎿',soccer:'⚽',basketball:'🏀',volleyball:'🏐',football:'🏈',baseball:'⚾',handball:'🤾',cricket:'🏏',tennis:'🎾',pickleball:'🏓',squash:'🎾',badminton:'🏸',tabletennis:'🏓',boxing:'🥊',mma:'🥋',wrestling:'🤼',kickboxing:'🥋',surf:'🏄',paddle:'⛵',waterpolo:'🤽',yoga:'🧘',dance:'💃',hiit:'🔥',strength_traditional:'🏋️',strength_functional:'🤸',powerlifting:'🏋️',olympic:'🏋️',crossfit:'🏋️',strongman:'💪',other:'💨'};
  el.innerHTML=cardioLog.slice(0,8).map(function(c){
    var parts=[c.duration_minutes+' min'];
    if(c.distance_km)parts.push(c.distance_km+' km');
    if(c.calories)parts.push(c.calories+' kcal');
    return '<div class="exi"><div class="fb"><div style="font-weight:600">'+(ico[c.activity]||'💨')+' '+c.activity.charAt(0).toUpperCase()+c.activity.slice(1)+'</div><span class="tag">'+fdate(c.started_at.split('T')[0])+'</span></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+parts.join(' · ')+(c.avg_heart_rate?' · '+c.avg_heart_rate+' bpm':'')+'</div></div>';
  }).join('');
}

/* ── BODY MEASUREMENTS ────────────────────── */
var mesLog=[];
function openMeasure(){
  if(mesLog.length){var last=mesLog[0];['waist','chest','hips','neck','arm','thigh','bf'].forEach(function(k){
    var key=k==='bf'?'body_fat_pct':k+'_cm';
    var el=document.getElementById('mes-'+k);if(el&&last[key]!=null)el.value=last[key];
  });}
  oModal('m-measure');
}
async function saveMeasure(){
  var rec={user_id:CU.id,logged_date:today()};
  var keys=[['waist','waist_cm'],['chest','chest_cm'],['hips','hips_cm'],['neck','neck_cm'],['arm','arm_cm'],['thigh','thigh_cm'],['bf','body_fat_pct']];
  var any=false;
  keys.forEach(function(p){var v=parseFloat(document.getElementById('mes-'+p[0]).value);if(!isNaN(v)){rec[p[1]]=v;any=true;}});
  if(!any){toast('Enter at least one measurement');return;}
  cModal('m-measure');
  rec.id=_genId();
  mesLog.unshift(rec);renderMeasure();renderBfChart();toast('📏 Measurements saved');
  await sbQueueInsert('body_measurements',rec);
}
async function loadMeasure(){
  var{data}=await sb.from('body_measurements').select('*').eq('user_id',CU.id).order('logged_date',{ascending:false}).limit(30);
  mesLog=data||[];renderMeasure();
}
// Body measurements: clean tile grid (waist, chest, arm, hips, thigh, neck)
// with deltas vs the previous entry, plus a summary bar (body fat / last log / count).
var MES_KEYS=[
  {f:'waist_cm',l:'Waist'},
  {f:'chest_cm',l:'Chest'},
  {f:'arm_cm',  l:'Arm'},
  {f:'hips_cm', l:'Hips'},
  {f:'thigh_cm',l:'Thigh'},
  {f:'neck_cm', l:'Neck'}
];
function renderMeasure(){
  var g=document.getElementById('mes-grid'),
      e=document.getElementById('mes-empty'),
      sum=document.getElementById('mes-summary');
  if(!g)return;
  var last=(mesLog&&mesLog.length)?mesLog[0]:null;
  var prev=(mesLog&&mesLog.length>1)?mesLog[1]:null;
  var hasAny=last&&MES_KEYS.some(function(k){return last[k.f]!=null;});
  if(e)e.style.display=hasAny?'none':'block';
  if(!hasAny){g.innerHTML='';if(sum)sum.style.display='none';return;}
  g.innerHTML=MES_KEYS.map(function(k){
    var v=last[k.f];
    if(v==null)return '<div class="mes-tile"><div class="mv" style="color:var(--t3)">—</div><div class="ml">'+k.l+'</div></div>';
    var pv=prev?prev[k.f]:null;
    var delta='';
    if(pv!=null){
      var d=(parseFloat(v)-parseFloat(pv)).toFixed(1);
      if(parseFloat(d)!==0){
        var sign=parseFloat(d)>0?'+':'';
        delta='<div class="md '+(parseFloat(d)<0?'dn':'')+'">'+sign+d+' cm</div>';
      }
    }
    return '<div class="mes-tile"><div class="mv">'+parseFloat(v).toFixed(1)+'</div><div class="ml">'+k.l+' (cm)</div>'+delta+'</div>';
  }).join('');
  if(sum){
    var bf=last.body_fat_pct!=null?parseFloat(last.body_fat_pct).toFixed(1)+'%':'—';
    var lastDate=fdate(last.logged_date);
    var count=(mesLog||[]).length;
    sum.innerHTML=
      '<div class="mes-sumitem"><div class="mes-sum-l">Body Fat</div><div class="mes-sum-v" style="color:var(--accent-d)">'+bf+'</div></div>'+
      '<div class="mes-sumitem" style="border-left:1px solid var(--bdr);border-right:1px solid var(--bdr)"><div class="mes-sum-l">Last log</div><div class="mes-sum-v">'+lastDate+'</div></div>'+
      '<div class="mes-sumitem"><div class="mes-sum-l">Entries</div><div class="mes-sum-v">'+count+'</div></div>';
    sum.style.display='flex';
  }
}

/* ── PROGRESS PHOTOS ──────────────────────── */
var photoList=[],_phFile=null;
document.addEventListener('change',function(e){
  if(e.target&&e.target.id==='ph-file'&&e.target.files&&e.target.files[0]){
    _phFile=e.target.files[0];
    var pv=document.getElementById('ph-prev'),pw=document.getElementById('ph-prev-wrap');
    if(pv&&pw){pv.src=URL.createObjectURL(_phFile);pw.classList.remove('hidden');}
  }
});
async function savePhoto(){
  if(!_phFile){toast('Pick a photo first');return;}
  if(!premCheckTotal('photos',(photoList||[]).length)){return;}
  if(_phFile.size>8*1024*1024){toast('Image too large (max 8 MB)');return;}
  var btn=document.getElementById('ph-btn');btn.disabled=true;btn.textContent='…';
  var msg=document.getElementById('ph-msg');msg.style.display='none';
  var pose=document.getElementById('ph-pose').value;
  var ext=(_phFile.name.split('.').pop()||'jpg').toLowerCase();
  if(!['jpg','jpeg','png','webp'].includes(ext))ext='jpg';
  var path=CU.id+'/'+Date.now()+'-'+pose+'.'+ext;
  var{error:upErr}=await sb.storage.from('progress-photos').upload(path,_phFile,{contentType:_phFile.type});
  if(upErr){msg.textContent=upErr.message;msg.style.color='var(--red)';msg.style.display='block';btn.disabled=false;btn.textContent='Upload';return;}
  var cw=wtLog.length?wtLog[wtLog.length-1].weight:null;
  var{data:row}=await sb.from('progress_photos').insert({user_id:CU.id,storage_path:path,pose:pose,weight_kg:cw}).select().single();
  if(row)photoList.unshift(row);
  await renderPhotos();
  cModal('m-photo');_phFile=null;document.getElementById('ph-file').value='';document.getElementById('ph-prev-wrap').classList.add('hidden');
  btn.disabled=false;btn.textContent='Upload';
  toast('📸 Photo saved');
  // Nudge when approaching the free 5-photo limit.
  if((photoList||[]).length>=3)softProNudge('photos_3','You\'re close to the 5-photo free limit. Pro gets you 100.');
}
async function loadPhotos(){
  var{data}=await sb.from('progress_photos').select('*').eq('user_id',CU.id).order('taken_at',{ascending:false}).limit(24);
  photoList=data||[];await renderPhotos();
}
async function renderPhotos(){
  var g=document.getElementById('ph-grid');if(!g)return;
  var addBtn='<div class="ph-add" onclick="oModal(\'m-photo\')">+</div>';
  if(!photoList.length){g.innerHTML=addBtn;return;}
  // Get signed URLs in parallel
  var urls=await Promise.all(photoList.slice(0,11).map(function(p){
    return sb.storage.from('progress-photos').createSignedUrl(p.storage_path,3600).then(function(r){return r.data&&r.data.signedUrl;});
  }));
  var tiles=photoList.slice(0,11).map(function(p,i){
    var safe=p.id.replace(/'/g,"\\'");
    var d=p.taken_at?p.taken_at.split('T')[0]:'';
    return '<div class="ph-tile" onclick="viewPhoto(\''+safe+'\')">'+
      (urls[i]?'<img src="'+urls[i]+'" alt="">':'<div class="skel" style="width:100%;height:100%"></div>')+
      '<div class="ph-date">'+fdate(d)+'</div></div>';
  }).join('');
  g.innerHTML=tiles+addBtn;
}
var _viewingPhoto=null;
async function viewPhoto(id){
  var p=photoList.find(function(x){return x.id===id;});if(!p)return;
  _viewingPhoto=p;
  document.getElementById('pv-title').textContent=(p.pose||'photo').charAt(0).toUpperCase()+(p.pose||'').slice(1)+' · '+fdate(p.taken_at.split('T')[0]);
  var{data}=await sb.storage.from('progress-photos').createSignedUrl(p.storage_path,3600);
  document.getElementById('pv-img').src=(data&&data.signedUrl)||'';
  oModal('m-photoview');
}
async function deletePhoto(){
  if(!_viewingPhoto)return;
  if(!confirm('Delete this photo?'))return;
  await sb.storage.from('progress-photos').remove([_viewingPhoto.storage_path]);
  await sb.from('progress_photos').delete().eq('id',_viewingPhoto.id);
  photoList=photoList.filter(function(p){return p.id!==_viewingPhoto.id;});
  _viewingPhoto=null;cModal('m-photoview');await renderPhotos();toast('Deleted');
}

/* ── PHOTO COMPARE ─────────────────────────── */
function openPhotoCompare(){
  if(!_viewingPhoto){toast('Open a photo first');return;}
  if(photoList.length<2){toast('Need at least 2 photos to compare');return;}
  var sel=document.getElementById('pc-pick');
  // Populate options — exclude the current photo
  var opts=photoList.filter(function(p){return p.id!==_viewingPhoto.id;}).map(function(p){var d=p.taken_at?p.taken_at.split('T')[0]:'';return '<option value="'+p.id+'">'+fdate(d)+(p.pose?' · '+p.pose:'')+'</option>';}).join('');
  sel.innerHTML=opts;
  // Default to oldest (last in list)
  var oldest=photoList.slice().reverse().find(function(p){return p.id!==_viewingPhoto.id;});
  if(oldest)sel.value=oldest.id;
  cModal('m-photoview');
  oModal('m-photocomp');
  renderPhotoCompare();
  _setupCompareDrag();
}
async function renderPhotoCompare(){
  if(!_viewingPhoto)return;
  var sel=document.getElementById('pc-pick');
  var otherId=sel.value;
  var other=photoList.find(function(p){return p.id===otherId;});if(!other)return;
  // Order: older → left ("Before"), newer → right ("After")
  var a=_viewingPhoto,b=other;
  var aTs=new Date(a.taken_at).getTime(),bTs=new Date(b.taken_at).getTime();
  var older=aTs<bTs?a:b,newer=aTs<bTs?b:a;
  var[oldUrl,newUrl]=await Promise.all([
    sb.storage.from('progress-photos').createSignedUrl(older.storage_path,3600).then(function(r){return r.data&&r.data.signedUrl;}),
    sb.storage.from('progress-photos').createSignedUrl(newer.storage_path,3600).then(function(r){return r.data&&r.data.signedUrl;})
  ]);
  document.getElementById('pc-old').src=oldUrl||'';
  document.getElementById('pc-new').src=newUrl||'';
  document.getElementById('pc-old-lbl').textContent='Before · '+fdate(older.taken_at.split('T')[0]);
  document.getElementById('pc-new-lbl').textContent='After · '+fdate(newer.taken_at.split('T')[0]);
}
var _pcDrag=false;
function _setupCompareDrag(){
  var stage=document.getElementById('pc-stage'),handle=document.getElementById('pc-handle'),wrap=document.getElementById('pc-new-wrap');
  if(!stage||stage._wired)return;stage._wired=true;
  function setPct(pct){pct=Math.max(0,Math.min(100,pct));handle.style.left=pct+'%';wrap.style.clipPath='inset(0 0 0 '+pct+'%)';}
  function fromEv(e){var rect=stage.getBoundingClientRect();var x=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;return (x/rect.width)*100;}
  function start(e){_pcDrag=true;setPct(fromEv(e));e.preventDefault();}
  function move(e){if(!_pcDrag)return;setPct(fromEv(e));e.preventDefault();}
  function end(){_pcDrag=false;}
  stage.addEventListener('pointerdown',start);
  stage.addEventListener('pointermove',move);
  stage.addEventListener('pointerup',end);
  stage.addEventListener('pointerleave',end);
  stage.addEventListener('touchstart',start,{passive:false});
  stage.addEventListener('touchmove',move,{passive:false});
  stage.addEventListener('touchend',end);
}

/* ── DAILY CHECK-IN ───────────────────────── */
var ckin=null,_ckinSel={mood:null,energy:null,soreness:null};
function openCheckin(){
  _ckinSel={mood:ckin&&ckin.mood||null,energy:ckin&&ckin.energy||null,soreness:ckin&&ckin.soreness||null};
  ['mood','energy','soreness'].forEach(function(k){
    document.querySelectorAll('#cki-'+k+' .cki-pill').forEach(function(p){p.classList.toggle('on',+p.dataset.v===_ckinSel[k]);});
  });
  oModal('m-checkin');
}
document.addEventListener('click',function(e){
  if(e.target&&e.target.classList&&e.target.classList.contains('cki-pill')){
    var k=e.target.parentNode.dataset.key,v=+e.target.dataset.v;
    _ckinSel[k]=v;
    e.target.parentNode.querySelectorAll('.cki-pill').forEach(function(p){p.classList.toggle('on',p===e.target);});
  }
});
async function saveCheckin(){
  if(!_ckinSel.mood&&!_ckinSel.energy&&!_ckinSel.soreness){toast('Tap at least one');return;}
  var rec={user_id:CU.id,logged_date:today(),mood:_ckinSel.mood,energy:_ckinSel.energy,soreness:_ckinSel.soreness};
  ckin=rec;cModal('m-checkin');renderCheckin();toast('✓ Saved');
  await sbQueueUpsert('daily_checkins',rec,{onConflict:'user_id,logged_date'});
}
async function loadCheckin(){
  var{data}=await sb.from('daily_checkins').select('*').eq('user_id',CU.id).eq('logged_date',today()).maybeSingle();
  ckin=data;renderCheckin();
}
function renderCheckin(){
  var el=document.getElementById('ckin-disp'),btn=document.getElementById('ckin-btn');
  if(!el)return;
  if(!ckin){el.innerHTML='Take 5 seconds to log how you feel — mood, energy, soreness. It feeds into your AI advice.';if(btn)btn.textContent='+ Log';return;}
  var em={mood:['😖','😕','😐','🙂','😄'],energy:['🪫','🔅','⚡','🔥','🚀'],soreness:['😎','🙂','😬','😣','🥵']};
  var parts=[];
  if(ckin.mood)parts.push('Mood '+em.mood[ckin.mood-1]);
  if(ckin.energy)parts.push('Energy '+em.energy[ckin.energy-1]);
  if(ckin.soreness)parts.push('Soreness '+em.soreness[ckin.soreness-1]);
  el.innerHTML='<div style="font-size:15px">'+parts.join(' · ')+'</div>';
  if(btn)btn.textContent='Edit';
}

/* ── CALENDAR HEATMAP ─────────────────────── */
var _calOffset=0,_calTrainedDays={};
function calNav(d){_calOffset+=d;renderCalendar();}
async function loadCalendarData(){
  var since=new Date();since.setMonth(since.getMonth()-3);
  var[{data:w},{data:c}]=await Promise.all([
    sb.from('workouts').select('started_at').eq('user_id',CU.id).gte('started_at',since.toISOString()),
    sb.from('cardio_sessions').select('started_at').eq('user_id',CU.id).gte('started_at',since.toISOString())
  ]);
  _calTrainedDays={};
  (w||[]).concat(c||[]).forEach(function(r){var d=r.started_at.split('T')[0];_calTrainedDays[d]=(_calTrainedDays[d]||0)+1;});
  renderCalendar();
}
function renderCalendar(){
  var grid=document.getElementById('cal-grid'),dows=document.getElementById('cal-dows'),title=document.getElementById('cal-title');
  if(!grid)return;
  var now=new Date();now.setDate(1);now.setMonth(now.getMonth()+_calOffset);
  var year=now.getFullYear(),month=now.getMonth();
  title.textContent=now.toLocaleDateString('en',{month:'long',year:'numeric'});
  if(!dows.innerHTML){dows.innerHTML=['M','T','W','T','F','S','S'].map(function(d){return '<div class="cal-dow">'+d+'</div>';}).join('');}
  var firstDay=new Date(year,month,1).getDay();var off=firstDay===0?6:firstDay-1;
  var daysInMonth=new Date(year,month+1,0).getDate();
  var tod=new Date().toISOString().split('T')[0];
  var html='';
  for(var i=0;i<off;i++)html+='<div class="cal-cell empty"></div>';
  for(var d=1;d<=daysInMonth;d++){
    var ds=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var n=_calTrainedDays[ds]||0;
    var cls='cal-cell'+(n>=3?' tr-3':n===2?' tr-2':n===1?' tr-1':'')+(ds===tod?' tod':'');
    html+='<div class="'+cls+'" style="cursor:pointer" onclick="openDay(\''+ds+'\')">'+d+'</div>';
  }
  grid.innerHTML=html;
}

/* ── DAY DETAIL ───────────────────────────── */
async function openDay(ds){
  document.getElementById('day-title').textContent=new Date(ds+'T12:00:00').toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric',year:'numeric'});
  document.getElementById('day-body').innerHTML='<div class="skel" style="height:80px"></div>';
  oModal('m-day');
  var dayStart=ds+'T00:00:00',dayEnd=ds+'T23:59:59.999';
  var[{data:wos},{data:cds},{data:ck},{data:sl},{data:wt},{data:ml},{data:wa}]=await Promise.all([
    sb.from('workouts').select('id,started_at,duration_seconds,exercises(id,name,muscle_group,sort_order,sets(set_number,weight_kg,reps))').eq('user_id',CU.id).gte('started_at',dayStart).lte('started_at',dayEnd).order('started_at',{ascending:true}),
    sb.from('cardio_sessions').select('*').eq('user_id',CU.id).gte('started_at',dayStart).lte('started_at',dayEnd).order('started_at',{ascending:true}),
    sb.from('daily_checkins').select('*').eq('user_id',CU.id).eq('logged_date',ds).maybeSingle(),
    sb.from('sleep_logs').select('*').eq('user_id',CU.id).eq('logged_date',ds).maybeSingle(),
    sb.from('weight_logs').select('*').eq('user_id',CU.id).eq('logged_date',ds),
    sb.from('meals').select('name,protein_g,carbs_g,fat_g,calories').eq('user_id',CU.id).eq('logged_date',ds),
    sb.from('water_logs').select('cups').eq('user_id',CU.id).eq('logged_date',ds).maybeSingle()
  ]);
  var html='';
  // Strength workouts
  if(wos&&wos.length){
    html+='<div class="ctitle" style="margin-bottom:8px">Strength</div>';
    wos.forEach(function(w){
      var dur=Math.round((w.duration_seconds||0)/60);
      var time=new Date(w.started_at).toLocaleTimeString('en',{hour:'numeric',minute:'2-digit'});
      var exs=(w.exercises||[]).sort(function(a,b){return (a.sort_order||0)-(b.sort_order||0);});
      var exHtml=exs.length?exs.map(function(ex){
        var sets=(ex.sets||[]).sort(function(a,b){return (a.set_number||0)-(b.set_number||0);});
        var setStr=sets.length?sets.map(function(s,i){return 'Set '+(i+1)+': '+fmtSet(s.weight_kg,s.reps);}).join(' · '):'No sets';
        var safe=(ex.name||'').replace(/'/g,"\\'");
        return '<div class="exi"><div class="fb"><div class="exn" onclick="openExChart(\''+safe+'\')" style="cursor:pointer">'+ex.name+'</div><span class="tag">'+(ex.muscle_group||'other')+'</span></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+setStr+'</div></div>';
      }).join(''):'<p class="tm tc" style="padding:8px 0">No exercises logged</p>';
      html+='<div class="card" style="background:var(--card2);margin-bottom:10px"><div class="fb" style="margin-bottom:10px"><div style="font-weight:600">🏋️ '+time+'</div><span class="tag">'+dur+' min</span></div>'+exHtml+'</div>';
    });
  }
  // Cardio
  if(cds&&cds.length){
    html+='<div class="ctitle" style="margin:14px 0 8px">Cardio</div>';
    var ico={run:'🏃',walk:'🚶',bike:'🚴',swim:'🏊',row:'🚣',elliptical:'🌀',stair:'🪜',hike:'🥾',climbing:'🧗',skating:'⛸️',golf:'⛳',ski:'⛷️',snowboard:'🏂',xc_ski:'🎿',soccer:'⚽',basketball:'🏀',volleyball:'🏐',football:'🏈',baseball:'⚾',handball:'🤾',cricket:'🏏',tennis:'🎾',pickleball:'🏓',squash:'🎾',badminton:'🏸',tabletennis:'🏓',boxing:'🥊',mma:'🥋',wrestling:'🤼',kickboxing:'🥋',surf:'🏄',paddle:'⛵',waterpolo:'🤽',yoga:'🧘',dance:'💃',hiit:'🔥',strength_traditional:'🏋️',strength_functional:'🤸',powerlifting:'🏋️',olympic:'🏋️',crossfit:'🏋️',strongman:'💪',other:'💨'};
    cds.forEach(function(c){
      var parts=[c.duration_minutes+' min'];
      if(c.distance_km)parts.push(c.distance_km+' km');
      if(c.calories)parts.push(c.calories+' kcal');
      if(c.avg_heart_rate)parts.push(c.avg_heart_rate+' bpm');
      html+='<div class="exi"><div class="fb"><div style="font-weight:600">'+(ico[c.activity]||'💨')+' '+c.activity.charAt(0).toUpperCase()+c.activity.slice(1)+'</div></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+parts.join(' · ')+'</div></div>';
    });
  }
  // Recovery
  var rec=[];
  if(sl)rec.push('😴 Sleep: <b>'+parseFloat(sl.duration_hours).toFixed(1)+'h</b> · '+sl.bedtime+' → '+sl.wake_time);
  if(wt&&wt.length)rec.push('⚖️ Weight: <b>'+wt[0].weight_kg+' kg</b>');
  if(ck){var em={mood:['😖','😕','😐','🙂','😄'],energy:['🪫','🔅','⚡','🔥','🚀'],soreness:['😎','🙂','😬','😣','🥵']};var p=[];if(ck.mood)p.push('Mood '+em.mood[ck.mood-1]);if(ck.energy)p.push('Energy '+em.energy[ck.energy-1]);if(ck.soreness)p.push('Soreness '+em.soreness[ck.soreness-1]);if(p.length)rec.push('✓ Check-in: '+p.join(' · '));}
  if(rec.length){
    html+='<div class="ctitle" style="margin:14px 0 8px">Recovery</div><div class="card" style="background:var(--card2);font-size:13px;line-height:2">'+rec.join('<br>')+'</div>';
  }
  // Nutrition
  if((ml&&ml.length)||(wa&&wa.cups)){
    var tot=(ml||[]).reduce(function(a,m){return{p:a.p+(+m.protein_g||0),c:a.c+(+m.carbs_g||0),f:a.f+(+m.fat_g||0),k:a.k+(+m.calories||0)};},{p:0,c:0,f:0,k:0});
    html+='<div class="ctitle" style="margin:14px 0 8px">Nutrition</div><div class="card" style="background:var(--card2);font-size:13px;line-height:2">';
    if(ml&&ml.length)html+='🥗 '+ml.length+' meals · <b>'+Math.round(tot.p)+'g P · '+Math.round(tot.c)+'g C · '+Math.round(tot.f)+'g F · '+Math.round(tot.k)+' kcal</b>';
    if(wa&&wa.cups)html+='<br>💧 '+wa.cups+' cups water';
    html+='</div>';
  }
  if(!html)html='<p class="tm tc" style="padding:30px 0">Rest day — nothing logged.</p>';
  document.getElementById('day-body').innerHTML=html;
}

/* ── 1RM / PLATE CALC ─────────────────────── */
function open1RM(){oModal('m-1rm');calc1RM();}
function calc1RM(){
  var w=parseFloat(document.getElementById('rm-w').value)||0;
  var r=parseInt(document.getElementById('rm-r').value)||0;
  var out=document.getElementById('rm-out'),pct=document.getElementById('rm-pct');
  if(!w||!r){out.textContent='–';pct.innerHTML='';return;}
  // Epley formula
  var oneRM=Math.round(w*(1+r/30));
  out.textContent=oneRM+' kg';
  var rows=[[95,'1RM'],[90,'2-3 reps'],[85,'4-6 reps'],[80,'7-8 reps'],[75,'9-10 reps'],[70,'11-12 reps'],[65,'13-15 reps']];
  pct.innerHTML='<div style="font-weight:600;color:var(--t);margin-bottom:6px">Training percentages</div>'+
    rows.map(function(p){return '<div class="fb"><span>'+p[1]+'</span><b style="font-family:\'Barlow Condensed\',sans-serif;color:var(--t)">'+Math.round(oneRM*p[0]/100)+' kg</b></div>';}).join('');
}
/* Legacy plate calc removed — see openPlate / pc_calc above for the visual version. */

/* ── MACRO PIE ────────────────────────────── */
var macroPieChart=null;
async function renderMacroPie(){
  var canvas=document.getElementById('macro-pie');if(!canvas)return;
  var t=meals.reduce(function(a,m){return{p:a.p+(m.protein||0),c:a.c+(m.carbs||0),f:a.f+(m.fat||0)};},{p:0,c:0,f:0});
  var pK=t.p*4,cK=t.c*4,fK=t.f*9;
  var data=[pK,cK,fK];
  if(!macroPieChart){
    await _ensureChart();
    macroPieChart=new Chart(canvas.getContext('2d'),{type:'doughnut',data:{labels:['Protein','Carbs','Fat'],datasets:[{data:data,backgroundColor:['#22C55E','#3B82F6','#F59E0B'],borderColor:'rgba(0,0,0,0)',borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{color:'#6B7280',font:{size:11,weight:'500'},boxWidth:10}}}}});
  }else{
    macroPieChart.data.datasets[0].data=data;macroPieChart.update();
  }
}

/* ── EXERCISE PROGRESSION CHART ───────────── */
var excChart=null;
async function openExChart(name){
  oModal('m-exchart');
  document.getElementById('exc-name').textContent=name;
  document.getElementById('exc-meta').textContent='Loading…';
  var{data}=await sb.from('exercises').select('name,workout_id,workouts!inner(started_at,user_id),sets(weight_kg,reps)').eq('user_id',CU.id).ilike('name',name);
  var rows=(data||[]).map(function(ex){
    var maxW=0,maxR=0;(ex.sets||[]).forEach(function(s){if((+s.weight_kg||0)>maxW){maxW=+s.weight_kg;maxR=+s.reps||0;}});
    return{date:ex.workouts.started_at.split('T')[0],w:maxW,r:maxR};
  }).filter(function(r){return r.w>0;}).sort(function(a,b){return a.date<b.date?-1:1;});
  if(!rows.length){
    document.getElementById('exc-meta').textContent='No data yet — log this exercise to track progress';
    document.getElementById('exc-hist').innerHTML='';
    if(excChart){excChart.destroy();excChart=null;}
    return;
  }
  document.getElementById('exc-meta').textContent=rows.length+' sessions · best '+Math.max.apply(null,rows.map(function(r){return r.w;}))+'kg';
  await _ensureChart();
  var ctx=document.getElementById('exc-chart').getContext('2d');
  if(excChart){excChart.destroy();}
  excChart=new Chart(ctx,{type:'line',data:{labels:rows.map(function(r){return r.date.slice(5);}),datasets:[{label:'Top set',data:rows.map(function(r){return r.w;}),borderColor:'#22C55E',backgroundColor:'rgba(34,197,94,.08)',borderWidth:2.5,pointBackgroundColor:'#22C55E',pointRadius:4,tension:.35,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:11,weight:'500'}}},y:{grid:{color:'rgba(0,0,0,.06)'},ticks:{color:'#6B7280',font:{size:11,weight:'500'}}}}}});
  document.getElementById('exc-hist').innerHTML='<div class="ctitle" style="margin:14px 0 6px">Recent sessions</div>'+
    rows.slice().reverse().slice(0,10).map(function(r){return '<div class="fb" style="padding:7px 0;border-bottom:1px solid var(--bdr);font-size:13px"><span class="tm">'+fdate(r.date)+'</span><b>'+fmtSet(r.w,r.r)+'</b></div>';}).join('');
}

/* ── EXERCISE PICKER (search) ─────────────── */
function openExPicker(){
  document.getElementById('expk-q').value='';
  filterExPk();
  oModal('m-expk');
}
/* Pinned exercises — per-user list of favourite lifts, shown at the top of the
   picker for one-tap access. Stored client-side in localStorage; no Supabase
   round-trip needed because it's UX preference, not user data. Cap at 6. */
function _pinKey(){return 'pinned_ex_'+(CU&&CU.id||'anon');}
function getPinnedEx(){try{return JSON.parse(localStorage.getItem(_pinKey())||'[]');}catch(e){return [];}}
function setPinnedEx(list){
  try{localStorage.setItem(_pinKey(),JSON.stringify(list.slice(0,6)));}catch(e){}
  _syncPref('pinned_exercises',list.slice(0,6));
}
function isPinned(name){var n=(name||'').toLowerCase();return getPinnedEx().some(function(p){return p.toLowerCase()===n;});}
function togglePinEx(name){
  var list=getPinnedEx();
  var n=(name||'').toLowerCase();
  var idx=list.findIndex(function(p){return p.toLowerCase()===n;});
  if(idx>=0){list.splice(idx,1);toast('Unpinned');}
  else{
    if(list.length>=6){toast('Pinned limit (6) — unpin one first');return;}
    list.unshift(name);toast('★ Pinned');
  }
  setPinnedEx(list);filterExPk();
}
function filterExPk(){
  var q=(document.getElementById('expk-q').value||'').toLowerCase();
  var cust=getCustomEx();
  var combined=cust.map(function(c){return{name:c.name,info:c,custom:true};})
    .concat(Object.keys(EX_DB).map(function(k){return{name:k,info:EX_DB[k],custom:false};}));
  var matches=combined.filter(function(x){
    return !q||x.name.toLowerCase().indexOf(q)!==-1||(x.info.pri||[]).join(' ').toLowerCase().indexOf(q)!==-1;
  });
  var list=document.getElementById('expk-list');
  var header='<div class="expk-row" onclick="openCustomEx()" style="border-bottom:1px solid var(--bdr)"><div class="expk-n" style="color:var(--accent)">+ Create custom exercise</div><div class="expk-m">your own</div></div>';
  // Build "Pinned" section — only when there's no active search filter so it
  // doesn't crowd out matches. Pinned items are also kept in the main list so
  // searching for them still works.
  var pinnedHtml='';
  if(!q){
    var pins=getPinnedEx();
    if(pins.length){
      pinnedHtml='<div class="tm" style="font-size:11px;letter-spacing:.4px;text-transform:uppercase;color:var(--t3);padding:10px 0 4px">Pinned</div>';
      pinnedHtml+=pins.map(function(name){
        var info=findExInfo(name)||{};
        var safe=name.replace(/'/g,"\\'");
        return '<div class="expk-row" style="display:flex;align-items:center;justify-content:space-between"><div onclick="pickEx(\''+safe+'\')" style="flex:1;cursor:pointer"><div class="expk-n">★ '+name+'</div><div class="expk-m">'+((info.pri||[]).slice(0,2).join('/')||'pinned')+'</div></div><button type="button" onclick="event.stopPropagation();togglePinEx(\''+safe+'\')" style="background:none;border:none;color:var(--accent);font-size:16px;cursor:pointer;padding:4px 6px" title="Unpin">★</button></div>';
      }).join('')+'<div style="height:8px"></div>';
    }
  }
  if(!matches.length){list.innerHTML=header+pinnedHtml+'<p class="tm tc" style="padding:18px 0">No matches</p>';return;}
  list.innerHTML=header+pinnedHtml+matches.map(function(x){
    var safe=x.name.replace(/'/g,"\\'");
    var tag=x.custom?' · <span style="color:var(--accent);font-weight:600">custom</span>':'';
    var pinned=isPinned(x.name);
    var pinBtn='<button type="button" onclick="event.stopPropagation();togglePinEx(\''+safe+'\')" style="background:none;border:none;color:'+(pinned?'var(--accent)':'var(--t3)')+';font-size:16px;cursor:pointer;padding:4px 6px" title="'+(pinned?'Unpin':'Pin')+'">'+(pinned?'★':'☆')+'</button>';
    var delBtn=x.custom?'<button type="button" onclick="event.stopPropagation();deleteCustomEx(\''+safe+'\')" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;padding:4px 6px">✕</button>':'';
    return '<div class="expk-row" style="display:flex;align-items:center;justify-content:space-between"><div onclick="pickEx(\''+safe+'\')" style="flex:1;cursor:pointer"><div class="expk-n">'+x.name+'</div><div class="expk-m">'+((x.info.pri||[]).slice(0,2).join('/')||'custom')+tag+'</div></div>'+pinBtn+delBtn+'</div>';
  }).join('');
}
function openCustomEx(){
  document.getElementById('cuex-n').value='';
  document.getElementById('cuex-m').value='chest';
  document.getElementById('cuex-tips').value='';
  var d=document.getElementById('cuex-demo');if(d)d.value='';
  oModal('m-cuex');
}
async function saveCustomEx(){
  var name=document.getElementById('cuex-n').value.trim();
  if(!name){toast('Enter a name');return;}
  var muscle=document.getElementById('cuex-m').value;
  var rawTips=document.getElementById('cuex-tips').value.trim();
  var tips=rawTips?rawTips.split('\n').map(function(t){return t.trim();}).filter(Boolean):[];
  var demoEl=document.getElementById('cuex-demo');
  var demo=demoEl?(demoEl.value||'').trim():'';
  var priMap={chest:['Chest'],back:['Back'],legs:['Quads','Glutes'],shoulders:['Delts'],arms:['Biceps','Triceps'],core:['Abs'],cardio:['Cardio'],other:['Other']};
  // Optimistic local update first so the picker re-renders instantly.
  var cust=getCustomEx();
  cust=cust.filter(function(c){return (c.name||'').toLowerCase()!==name.toLowerCase();});
  cust.unshift({name:name,muscle:muscle,pri:priMap[muscle]||['Other'],sec:[],desc:'Your custom exercise.',demo:demo,tips:tips,custom:true});
  setCustomExList(cust);
  cModal('m-cuex');
  filterExPk();
  pickEx(name);
  toast('Custom exercise saved');
  // Server upsert — keys on (user_id, lower(name)). On conflict, we delete + insert
  // because lower() index can't be a target of `on conflict`.
  if(sb&&CU){
    try{
      await sb.from('custom_exercises').delete().eq('user_id',CU.id).ilike('name',name);
      await sb.from('custom_exercises').insert({user_id:CU.id,name:name,muscle:muscle,demo_url:demo||null,tips:tips});
      // Re-sync from server so the local cache picks up the row id for future deletes.
      loadCustomExFromServer();
    }catch(e){
      console.warn('saveCustomEx server',e);
      // Queue for retry when online — uses existing offline write queue.
      _wqPush({op:'insert',table:'custom_exercises',row:{user_id:CU.id,name:name,muscle:muscle,demo_url:demo||null,tips:tips}});
    }
  }
}
async function deleteCustomEx(name){
  if(!confirm('Delete "'+name+'"?'))return;
  var cust=getCustomEx().filter(function(c){return (c.name||'').toLowerCase()!==name.toLowerCase();});
  setCustomExList(cust);filterExPk();
  if(sb&&CU){
    try{await sb.from('custom_exercises').delete().eq('user_id',CU.id).ilike('name',name);}
    catch(e){console.warn('deleteCustomEx server',e);}
  }
}
function pickEx(name){
  document.getElementById('ex-n').value=name;
  var muscle='other';
  var cust=getCustomEx().find(function(c){return (c.name||'').toLowerCase()===name.toLowerCase();});
  if(cust&&cust.muscle){
    muscle=cust.muscle;
  }else{
    var info=EX_DB[name];
    if(info&&info.pri&&info.pri[0]){var p=info.pri[0].toLowerCase();
      if(p.indexOf('chest')!==-1)muscle='chest';
      else if(p.indexOf('back')!==-1||p.indexOf('lat')!==-1||p.indexOf('trap')!==-1)muscle='back';
      else if(p.indexOf('quad')!==-1||p.indexOf('ham')!==-1||p.indexOf('glute')!==-1||p.indexOf('calf')!==-1)muscle='legs';
      else if(p.indexOf('delt')!==-1||p.indexOf('shoulder')!==-1)muscle='shoulders';
      else if(p.indexOf('bicep')!==-1||p.indexOf('tricep')!==-1||p.indexOf('forearm')!==-1)muscle='arms';
      else if(p.indexOf('abs')!==-1||p.indexOf('core')!==-1||p.indexOf('oblique')!==-1)muscle='core';
    }
  }
  document.getElementById('ex-m').value=muscle;
  _loadLastSetHint(name);
  cModal('m-expk');
}

/* ── WORKOUT TEMPLATES ────────────────────── */
var templates=[];
async function loadTemplates(){
  var{data}=await sb.from('workout_templates').select('*').eq('user_id',CU.id).order('created_at',{ascending:false});
  templates=data||[];
}
function openTemplates(){
  loadTemplates().then(renderTemplates);
  oModal('m-templates');
}
function _tplSetCount(e){return Array.isArray(e.sets)?e.sets.length:(+e.sets||0);}
function renderTemplates(){
  var el=document.getElementById('tpl-list');
  if(!templates.length){el.innerHTML='<div class="empty-state"><div class="empty-ico" style="background:var(--adim);color:var(--accent-d)"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="40" height="44" rx="4"/><path d="M20 22h24M20 32h24M20 42h16"/></svg></div><div class="empty-h">No templates yet</div><div class="empty-sub">Save a workout to reuse it any time — or import one of our pre-built plans.</div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px"><button type="button" class="empty-cta" onclick="cModal(\'m-templates\');openPlanLibrary()">Browse plan library</button><button type="button" class="empty-cta ghost" onclick="cModal(\'m-templates\');goTab(\'workout\')">Build your own →</button></div></div>';return;}
  el.innerHTML=templates.map(function(t){
    var exs=t.exercises||[];
    var exNames=exs.map(function(e){return e.name;}).slice(0,4).join(' · ');
    var totalSets=exs.reduce(function(a,e){return a+_tplSetCount(e);},0);
    var safeId=t.id;
    return '<div class="exi"><div class="fb"><div style="font-weight:600">'+t.name+'</div><div style="display:flex;gap:6px"><button type="button" class="btn-g" style="font-size:11px;padding:5px 10px" onclick="loadTemplate(\''+safeId+'\')">Load</button><button type="button" class="btn-g" style="font-size:11px;padding:5px 10px" onclick="shareTemplate(\''+safeId+'\')">↗</button><button type="button" class="btn-g" style="font-size:11px;padding:5px 10px;color:var(--red)" onclick="deleteTemplate(\''+safeId+'\')">✕</button></div></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+exs.length+' ex · '+totalSets+' sets · '+exNames+'</div></div>';
  }).join('');
}
function saveTemplateOpen(){
  if(document.getElementById('active-sess').classList.contains('hidden')||!wExs.length){toast('Start a session with exercises first');return;}
  document.getElementById('tpl-n').value='';
  oModal('m-tplsave');
}
/* ── PLAN LIBRARY (pre-built templates) ───── */
// Each plan is a multi-day split. "templates" inside become individual workout_templates rows.
var PLAN_LIBRARY=[
  {id:'ppl',name:'Push / Pull / Legs',days:3,goal:'Hypertrophy · 4–6 days/wk',desc:'Classic bodybuilder split. Train each muscle 2× per week if you go 6 days.',templates:[
    {name:'PPL — Push',exercises:[
      {name:'Bench Press',muscle:'chest',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:6},{weight:0,reps:6}]},
      {name:'Overhead Press',muscle:'shoulders',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Incline Dumbbell Press',muscle:'chest',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Lateral Raise',muscle:'shoulders',sets:[{weight:0,reps:15},{weight:0,reps:15},{weight:0,reps:15}]},
      {name:'Tricep Pushdown',muscle:'arms',sets:[{weight:0,reps:12},{weight:0,reps:12},{weight:0,reps:12}]}
    ]},
    {name:'PPL — Pull',exercises:[
      {name:'Deadlift',muscle:'back',sets:[{weight:0,reps:5},{weight:0,reps:5},{weight:0,reps:3}]},
      {name:'Pull-Up',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Barbell Row',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Face Pull',muscle:'shoulders',sets:[{weight:0,reps:15},{weight:0,reps:15},{weight:0,reps:15}]},
      {name:'Barbell Curl',muscle:'arms',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]}
    ]},
    {name:'PPL — Legs',exercises:[
      {name:'Back Squat',muscle:'legs',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:6},{weight:0,reps:6}]},
      {name:'Romanian Deadlift',muscle:'legs',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Leg Press',muscle:'legs',sets:[{weight:0,reps:12},{weight:0,reps:12},{weight:0,reps:12}]},
      {name:'Standing Calf Raise',muscle:'legs',sets:[{weight:0,reps:15},{weight:0,reps:15},{weight:0,reps:15}]},
      {name:'Hanging Leg Raise',muscle:'core',sets:[{weight:0,reps:12},{weight:0,reps:12},{weight:0,reps:12}]}
    ]}
  ]},
  {id:'ul',name:'Upper / Lower',days:4,goal:'Strength + size · 4 days/wk',desc:'Two upper and two lower days per week. Great middle ground.',templates:[
    {name:'U/L — Upper A',exercises:[
      {name:'Bench Press',muscle:'chest',sets:[{weight:0,reps:5},{weight:0,reps:5},{weight:0,reps:5}]},
      {name:'Barbell Row',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Overhead Press',muscle:'shoulders',sets:[{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Pull-Up',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Tricep Pushdown',muscle:'arms',sets:[{weight:0,reps:12},{weight:0,reps:12}]}
    ]},
    {name:'U/L — Lower A',exercises:[
      {name:'Back Squat',muscle:'legs',sets:[{weight:0,reps:5},{weight:0,reps:5},{weight:0,reps:5}]},
      {name:'Romanian Deadlift',muscle:'legs',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Leg Press',muscle:'legs',sets:[{weight:0,reps:12},{weight:0,reps:12}]},
      {name:'Standing Calf Raise',muscle:'legs',sets:[{weight:0,reps:15},{weight:0,reps:15}]}
    ]},
    {name:'U/L — Upper B',exercises:[
      {name:'Overhead Press',muscle:'shoulders',sets:[{weight:0,reps:5},{weight:0,reps:5},{weight:0,reps:5}]},
      {name:'Incline Dumbbell Press',muscle:'chest',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Seated Cable Row',muscle:'back',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Lateral Raise',muscle:'shoulders',sets:[{weight:0,reps:15},{weight:0,reps:15}]},
      {name:'Barbell Curl',muscle:'arms',sets:[{weight:0,reps:10},{weight:0,reps:10}]}
    ]},
    {name:'U/L — Lower B',exercises:[
      {name:'Deadlift',muscle:'back',sets:[{weight:0,reps:5},{weight:0,reps:3},{weight:0,reps:3}]},
      {name:'Front Squat',muscle:'legs',sets:[{weight:0,reps:6},{weight:0,reps:6},{weight:0,reps:6}]},
      {name:'Bulgarian Split Squat',muscle:'legs',sets:[{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Hanging Leg Raise',muscle:'core',sets:[{weight:0,reps:12},{weight:0,reps:12}]}
    ]}
  ]},
  {id:'531',name:'5/3/1 — Wendler',days:4,goal:'Pure strength · 4 days/wk',desc:'Wave-loaded barbell strength. Slow, sustainable PR progress.',templates:[
    {name:'5/3/1 — Squat day',exercises:[
      {name:'Back Squat',muscle:'legs',sets:[{weight:0,reps:5},{weight:0,reps:3},{weight:0,reps:1}]},
      {name:'Leg Press',muscle:'legs',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Hanging Leg Raise',muscle:'core',sets:[{weight:0,reps:15},{weight:0,reps:15},{weight:0,reps:15}]}
    ]},
    {name:'5/3/1 — Bench day',exercises:[
      {name:'Bench Press',muscle:'chest',sets:[{weight:0,reps:5},{weight:0,reps:3},{weight:0,reps:1}]},
      {name:'Dumbbell Bench Press',muscle:'chest',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Barbell Row',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]}
    ]},
    {name:'5/3/1 — Deadlift day',exercises:[
      {name:'Deadlift',muscle:'back',sets:[{weight:0,reps:5},{weight:0,reps:3},{weight:0,reps:1}]},
      {name:'Romanian Deadlift',muscle:'legs',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Pull-Up',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]}
    ]},
    {name:'5/3/1 — Press day',exercises:[
      {name:'Overhead Press',muscle:'shoulders',sets:[{weight:0,reps:5},{weight:0,reps:3},{weight:0,reps:1}]},
      {name:'Incline Dumbbell Press',muscle:'chest',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]},
      {name:'Barbell Curl',muscle:'arms',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]}
    ]}
  ]},
  {id:'fullbody',name:'Full Body 3×',days:3,goal:'Time-efficient · 3 days/wk',desc:'Big compound lifts every session. Ideal if you can only train 3 days.',templates:[
    {name:'Full Body A',exercises:[
      {name:'Back Squat',muscle:'legs',sets:[{weight:0,reps:5},{weight:0,reps:5},{weight:0,reps:5}]},
      {name:'Bench Press',muscle:'chest',sets:[{weight:0,reps:5},{weight:0,reps:5},{weight:0,reps:5}]},
      {name:'Barbell Row',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]}
    ]},
    {name:'Full Body B',exercises:[
      {name:'Deadlift',muscle:'back',sets:[{weight:0,reps:5},{weight:0,reps:5}]},
      {name:'Overhead Press',muscle:'shoulders',sets:[{weight:0,reps:5},{weight:0,reps:5},{weight:0,reps:5}]},
      {name:'Pull-Up',muscle:'back',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]}
    ]},
    {name:'Full Body C',exercises:[
      {name:'Front Squat',muscle:'legs',sets:[{weight:0,reps:6},{weight:0,reps:6},{weight:0,reps:6}]},
      {name:'Incline Dumbbell Press',muscle:'chest',sets:[{weight:0,reps:8},{weight:0,reps:8},{weight:0,reps:8}]},
      {name:'Seated Cable Row',muscle:'back',sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]}
    ]}
  ]}
];
function openPlanLibrary(){
  var el=document.getElementById('planlib-list');
  el.innerHTML=PLAN_LIBRARY.map(function(p){
    return '<div style="border:1px solid var(--bdr);border-radius:16px;padding:16px;margin-bottom:12px">'+
      '<div class="fb" style="margin-bottom:6px"><div><div style="font-weight:800;font-size:16px;letter-spacing:-.2px">'+p.name+'</div><div class="tm" style="font-size:12px;margin-top:2px">'+p.goal+'</div></div><span class="badge bg">'+p.days+' days</span></div>'+
      '<div class="tm" style="font-size:13px;line-height:1.5;margin:6px 0 12px">'+p.desc+'</div>'+
      '<div class="tm" style="font-size:11.5px;margin-bottom:12px;color:var(--t3)">Includes: '+p.templates.map(function(t){return t.name.replace(/^.*— /,'');}).join(' · ')+'</div>'+
      '<button type="button" class="btn" style="padding:11px 16px" onclick="importPlan(\''+p.id+'\')">Import '+p.templates.length+' templates</button>'+
      '</div>';
  }).join('');
  oModal('m-planlib');
}
async function importPlan(planId){
  var plan=PLAN_LIBRARY.find(function(p){return p.id===planId;});
  if(!plan)return;
  // Free tier check — imports count toward the 2-template cap.
  if(!isPremium()){
    var capacity=PREM_LIMITS.templates-((templates||[]).length);
    if(capacity<plan.templates.length){toast('Free tier holds '+PREM_LIMITS.templates+' templates. Upgrade to import full plans.');openPaywall();return;}
  }
  toast('Importing '+plan.name+'…');
  for(var i=0;i<plan.templates.length;i++){
    var t=plan.templates[i];
    var{error}=await sb.from('workout_templates').insert({user_id:CU.id,name:t.name,exercises:t.exercises});
    if(error){toast('Import failed at '+t.name);return;}
  }
  await loadTemplates();
  cModal('m-planlib');
  toast('✅ Imported '+plan.templates.length+' templates');
}

async function saveTemplate(){
  var name=document.getElementById('tpl-n').value.trim();
  if(!name){toast('Enter a name');return;}
  if(!premCheckTotal('templates',(templates||[]).length)){return;}
  var exs=wExs.map(function(e){
    var sets=(e.sets||[]).map(function(s){return{weight:+s.weight||0,reps:+s.reps||0};});
    if(!sets.length)sets=[{weight:0,reps:0},{weight:0,reps:0},{weight:0,reps:0}];
    return{name:e.name,muscle:e.muscle,sets:sets};
  });
  var{error}=await sb.from('workout_templates').insert({user_id:CU.id,name:name,exercises:exs});
  if(error){toast('Save failed');return;}
  cModal('m-tplsave');toast('Template saved');await loadTemplates();
  // Nudge once after first template — they're already saving plans, so Pro is the natural upsell.
  if((templates||[]).length>=1)softProNudge('first_template','Saving plans? Pro removes the 2-template cap and adds the full plan library.');
}
async function _lastLoggedSets(name){
  // Fetch the user's most recent logged copy of this exercise (by workout start).
  try{
    var{data}=await sb.from('exercises')
      .select('id,name,muscle_group,workouts!inner(started_at,user_id),sets(set_number,weight_kg,reps)')
      .eq('user_id',CU.id).ilike('name',name)
      .order('started_at',{foreignTable:'workouts',ascending:false})
      .limit(1);
    if(!data||!data.length)return null;
    var ex=data[0];
    var sets=(ex.sets||[]).slice().sort(function(a,b){return (a.set_number||0)-(b.set_number||0);})
      .map(function(s){return{weight:+s.weight_kg||0,reps:+s.reps||0};});
    return{muscle:ex.muscle_group||null,sets:sets};
  }catch(e){return null;}
}
async function loadTemplate(id){
  var t=templates.find(function(x){return x.id===id;});if(!t)return;
  if(!document.getElementById('active-sess').classList.contains('hidden')){if(!confirm('Replace current session with this template?'))return;}
  startW();
  var raw=t.exercises||[];
  // Resolve each exercise to last-logged load when available; fall back to template snapshot.
  var resolved=await Promise.all(raw.map(async function(e){
    var last=await _lastLoggedSets(e.name);
    var sets;
    if(last&&last.sets.length){
      sets=last.sets.map(function(s){return{weight:s.weight,reps:s.reps};});
    }else if(Array.isArray(e.sets)){
      // New-format snapshot (array of {weight,reps})
      sets=e.sets.map(function(s){return{weight:+s.weight||0,reps:+s.reps||0};});
    }else{
      // Legacy snapshot — just a count
      var n=+e.sets||3;sets=[];for(var i=0;i<n;i++)sets.push({weight:0,reps:0});
    }
    if(!sets.length)sets=[{weight:0,reps:0}];
    return{name:e.name,muscle:e.muscle||(last&&last.muscle)||'other',sets:sets};
  }));
  wExs=resolved;
  renderExList();cModal('m-templates');toast('Loaded '+t.name);
}
async function deleteTemplate(id){
  if(!confirm('Delete this template?'))return;
  await sb.from('workout_templates').delete().eq('id',id);
  templates=templates.filter(function(x){return x.id!==id;});renderTemplates();
}

/* ── ROUTINE SHARING ─────────────────────── */
function _b64UrlEncode(str){
  // UTF-8 safe encoding
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function _b64UrlDecode(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
  return decodeURIComponent(escape(atob(s)));
}
async function inviteFriend(){
  var ref=(CU&&CU.id)?CU.id.slice(0,8):'';
  var url='https://athleteos.app'+(ref?'/?ref='+ref:'');
  var data={
    title:'AthleteOS',
    text:"I've been using AthleteOS to track lifts, food and sleep. Try it — it's free.",
    url:url
  };
  if(navigator.share){
    try{await navigator.share(data);if(typeof posthog!=='undefined')posthog.capture&&posthog.capture('invite_shared',{method:'native'});return;}
    catch(e){if(e&&e.name==='AbortError')return;}
  }
  try{await navigator.clipboard.writeText(url);toast('Invite link copied 🎁');if(typeof posthog!=='undefined')posthog.capture&&posthog.capture('invite_shared',{method:'clipboard'});}
  catch(e){prompt('Copy this link:',url);}
}

async function shareTemplate(id){
  var t=templates.find(function(x){return x.id===id;});if(!t)return;
  var payload={n:t.name,e:(t.exercises||[]).map(function(e){
    var sets=Array.isArray(e.sets)?e.sets.map(function(s){return[+s.weight||0,+s.reps||0];}):(+e.sets||3);
    return{n:e.name,m:e.muscle||'other',s:sets};
  })};
  var url=location.origin+location.pathname+'#share='+_b64UrlEncode(JSON.stringify(payload));
  var shareData={title:'AthleteOS routine: '+t.name,text:'Check out my '+t.name+' routine',url:url};
  if(navigator.share){
    try{await navigator.share(shareData);return;}catch(e){if(e&&e.name==='AbortError')return;}
  }
  try{await navigator.clipboard.writeText(url);toast('Link copied to clipboard');}
  catch(e){prompt('Copy this link:',url);}
}
var _pendingShare=null;
function _consumeShareHash(){
  var h=location.hash||'';
  var m=h.match(/[#&]share=([^&]+)/);
  if(!m)return;
  try{
    var data=JSON.parse(_b64UrlDecode(m[1]));
    if(!data||!data.n||!Array.isArray(data.e))throw new Error('bad');
    _pendingShare=data;
    var info=document.getElementById('imp-info');
    var sets=data.e.reduce(function(a,e){return a+(Array.isArray(e.s)?e.s.length:+e.s||0);},0);
    info.innerHTML='<b>'+data.n+'</b><div class="tm" style="font-size:12.5px;margin-top:4px">'+data.e.length+' exercises · '+sets+' sets</div><div class="tm" style="font-size:11.5px;margin-top:8px;line-height:1.6">'+data.e.map(function(e){return '• '+e.n+(Array.isArray(e.s)?' ('+e.s.length+' sets)':'');}).join('<br>')+'</div>';
    oModal('m-import');
  }catch(e){/* ignore malformed share link */}
  // Strip hash so reload doesn't re-open prompt
  history.replaceState(null,'',location.pathname+location.search);
}
async function acceptShare(){
  if(!_pendingShare)return;
  var d=_pendingShare;
  var exs=d.e.map(function(e){
    var sets;
    if(Array.isArray(e.s)){
      sets=e.s.map(function(p){return Array.isArray(p)?{weight:+p[0]||0,reps:+p[1]||0}:{weight:+p.weight||0,reps:+p.reps||0};});
    }else{
      var n=+e.s||3;sets=[];for(var i=0;i<n;i++)sets.push({weight:0,reps:0});
    }
    return{name:e.n,muscle:e.m||'other',sets:sets};
  });
  var{error}=await sb.from('workout_templates').insert({user_id:CU.id,name:d.n+' (shared)',exercises:exs});
  _pendingShare=null;cModal('m-import');
  if(error){toast('Import failed');return;}
  await loadTemplates();
  toast('Routine imported to your templates');
}
function declineShare(){_pendingShare=null;cModal('m-import');}

/* ── REMINDERS ─────────────────────────────── */
var REM={workout:true,protein:true,water:false,wt:'17:00',pt:'20:00'};
function loadReminderUI(){
  document.getElementById('rm-wo').checked=!!REM.workout;
  document.getElementById('rm-pr').checked=!!REM.protein;
  document.getElementById('rm-wt').checked=!!REM.water;
  document.getElementById('rt-wo-time').textContent=fmt12(REM.wt);
  document.getElementById('rt-pr-time').textContent=fmt12(REM.pt);
  if(typeof refreshPushToggleUI==='function')refreshPushToggleUI();
}
/* ── WEB PUSH (live, cross-device) ────────── */
var VAPID_PUBLIC_KEY='BKKcha3TRIxUDHlmOnfvUtWQZUgD1woqn-eE2C9HG1Mx_CwIazYznZFETyKya_HB3dErk0QSDC9_lyB-6-RCy_4';
function _b64UrlToU8(s){
  var pad='='.repeat((4-s.length%4)%4);
  var b64=(s+pad).replace(/-/g,'+').replace(/_/g,'/');
  var raw=atob(b64),out=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}
async function pushIsSubscribed(){
  try{
    if(!('serviceWorker' in navigator)||!('PushManager' in window))return false;
    var reg=await navigator.serviceWorker.ready;
    var sub=await reg.pushManager.getSubscription();
    return !!sub;
  }catch(e){return false;}
}
async function pushSubscribe(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)){
    toast('Push not supported on this device');return false;
  }
  try{
    var perm=await Notification.requestPermission();
    if(perm!=='granted'){toast('Notifications denied');return false;}
    var reg=await navigator.serviceWorker.ready;
    var sub=await reg.pushManager.getSubscription();
    if(!sub){
      sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:_b64UrlToU8(VAPID_PUBLIC_KEY)
      });
    }
    var raw=sub.toJSON();
    var row={
      user_id:CU.id,
      endpoint:raw.endpoint,
      p256dh:raw.keys.p256dh,
      auth:raw.keys.auth,
      user_agent:navigator.userAgent.slice(0,300),
      last_seen_at:new Date().toISOString()
    };
    await sb.from('push_subscriptions').upsert(row,{onConflict:'user_id,endpoint'});
    toast('Push notifications on');
    return true;
  }catch(e){
    console.warn('pushSubscribe',e);
    toast('Could not enable push — '+(e.message||'unknown'));
    return false;
  }
}
async function pushUnsubscribe(){
  try{
    if(!('serviceWorker' in navigator))return;
    var reg=await navigator.serviceWorker.ready;
    var sub=await reg.pushManager.getSubscription();
    if(sub){
      var endpoint=sub.endpoint;
      try{await sub.unsubscribe();}catch(e){}
      await sb.from('push_subscriptions').delete().eq('user_id',CU.id).eq('endpoint',endpoint);
    }
    toast('Push notifications off');
  }catch(e){console.warn('pushUnsubscribe',e);}
}
async function togglePush(checked){
  if(checked){
    var ok=await pushSubscribe();
    var t=document.getElementById('rm-push');if(t)t.checked=ok;
  }else{
    await pushUnsubscribe();
  }
}
async function refreshPushToggleUI(){
  var t=document.getElementById('rm-push');if(!t)return;
  t.checked=await pushIsSubscribed();
}

async function saveReminders(){
  REM.workout=document.getElementById('rm-wo').checked;
  REM.protein=document.getElementById('rm-pr').checked;
  REM.water=document.getElementById('rm-wt').checked;
  if((REM.workout||REM.protein||REM.water)&&typeof Notification!=='undefined'&&Notification.permission==='default'){
    var p=await Notification.requestPermission();
    if(p!=='granted'){toast('Notifications denied — reminders disabled');REM.workout=REM.protein=REM.water=false;loadReminderUI();}
  }
  await sb.from('profiles').update({notif_workout:REM.workout,notif_protein:REM.protein,notif_water:REM.water,notif_workout_time:REM.wt,notif_protein_time:REM.pt,updated_at:new Date().toISOString()}).eq('id',CU.id);
  scheduleReminders();toast('Saved');
}
function pickReminderTime(which){
  var cur=which==='workout'?REM.wt:REM.pt;
  inputModal({title:'Reminder time',sub:'Pick the time you want to be nudged.',type:'time',value:cur,placeholder:'18:30'},function(raw){
    var v=raw||'';if(!/^\d{1,2}:\d{2}$/.test(v)){toast('Invalid time');return;}
    var pad=v.split(':');var h=parseInt(pad[0]);var m=parseInt(pad[1]);
    if(h<0||h>23||m<0||m>59){toast('Invalid time');return;}
    v=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
    if(which==='workout')REM.wt=v;else REM.pt=v;
    loadReminderUI();saveReminders();
  });
}
function _nextOccurrence(hhmm){
  var p=hhmm.split(':'),h=+p[0],m=+p[1];
  var d=new Date();d.setHours(h,m,0,0);
  if(d.getTime()<=Date.now())d.setDate(d.getDate()+1);
  return d.getTime();
}
function scheduleReminders(){
  if(!navigator.serviceWorker||!navigator.serviceWorker.controller)return;
  var items=[];
  // Plan-aware morning notification: tells the user what today's session is from AI_PLAN.
  if(REM.workout){
    var planMsg=_planMessageForToday();
    items.push({id:'rem-workout',title:planMsg.title,body:planMsg.body,at:_nextOccurrence(REM.wt)});
  }
  if(REM.protein)items.push({id:'rem-protein',title:'Protein check 🥩',body:'Hit your daily target.',at:_nextOccurrence(REM.pt)});
  if(REM.water){
    [9,12,15,18,21].forEach(function(h){var t=h<10?'0'+h+':00':h+':00';items.push({id:'rem-water-'+h,title:'Hydration 💧',body:'Drink a glass of water.',at:_nextOccurrence(t)});});
  }
  // Streak-saving nudge: only when an active streak is at risk of breaking tonight.
  if(_streakCount>=1 && !_streakDoneToday){
    var d=new Date();d.setHours(20,0,0,0);
    if(d.getTime()>Date.now()){
      items.push({id:'rem-streak',title:'🔥 Streak in danger',body:'Your '+_streakCount+'-day streak ends in 4 hours.',at:d.getTime()});
    }
  }
  // Plan-aware tomorrow heads-up at 21:00 — only if AI_PLAN actually has tomorrow scheduled.
  var tn=_planMessageForTomorrow();
  if(tn){
    var d2=new Date();d2.setHours(21,0,0,0);
    if(d2.getTime()<=Date.now())d2.setDate(d2.getDate()+1);
    items.push({id:'rem-tomorrow',title:tn.title,body:tn.body,at:d2.getTime()});
  }
  // Weekly digest — fire Saturday 09:00 with this week's volume/PRs/sessions.
  var dig=_weeklyDigestMessage();
  if(dig){
    var dgDate=new Date();
    var daysToSat=(6-dgDate.getDay()+7)%7;
    dgDate.setDate(dgDate.getDate()+daysToSat);
    dgDate.setHours(9,0,0,0);
    if(dgDate.getTime()<=Date.now())dgDate.setDate(dgDate.getDate()+7);
    items.push({id:'rem-digest',title:dig.title,body:dig.body,at:dgDate.getTime()});
  }
  navigator.serviceWorker.controller.postMessage({type:'SCHEDULE_REMINDERS',items:items});
}
function _planMessageForTomorrow(){
  if(!AI_PLAN||!AI_PLAN.days||!AI_PLAN.days.length)return null;
  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var tn=new Date();tn.setDate(tn.getDate()+1);
  var tomorrowName=DAYS[tn.getDay()];
  var day=AI_PLAN.days.find(function(d){return(d.day||'').toLowerCase()===tomorrowName.toLowerCase();});
  if(!day||!day.exercises||!day.exercises.length)return null;
  var focus=day.exercises.slice(0,3).map(function(e){return e.name;}).join(', ');
  return{title:'Tomorrow: '+(day.name||'Workout'),body:'Eat enough today. On deck: '+focus+'.'};
}
// Aggregates last-7-day stats from local data already cached for the Home tab
// so we don't hit Supabase from the scheduler. If nothing was logged, no digest.
function _weeklyDigestMessage(){
  if(typeof _wHistAll==='undefined'||!_wHistAll)return null;
  var since=Date.now()-7*864e5;
  var weekly=(_wHistAll||[]).filter(function(w){return new Date(w.started_at||w.date).getTime()>=since;});
  if(!weekly.length)return null;
  var vol=0,sets=0;
  weekly.forEach(function(w){(w.exercises||[]).forEach(function(ex){(ex.sets||[]).forEach(function(s){sets++;vol+=(+s.weight_kg||+s.w||0)*(+s.reps||+s.r||0);});});});
  var volTxt=vol>=1000?(vol/1000).toFixed(1)+'t':Math.round(vol)+'kg';
  var prCount=(recentPRs||[]).filter(function(p){return p.at&&new Date(p.at).getTime()>=since;}).length;
  var body=weekly.length+' sessions, '+volTxt+' total volume';
  if(prCount)body+=', '+prCount+' new PR'+(prCount===1?'':'s');
  body+='. Time to '+(weekly.length>=4?'deload':'push harder')+'?';
  return{title:'📊 Your week',body:body};
}
// Returns the title/body for today's workout notification, based on AI_PLAN.
function _planMessageForToday(){
  if(!AI_PLAN||!AI_PLAN.days||!AI_PLAN.days.length)return{title:'Time to train 💪',body:'Get your session in.'};
  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var todayName=DAYS[new Date().getDay()];
  var day=AI_PLAN.days.find(function(d){return(d.day||'').toLowerCase()===todayName.toLowerCase();});
  if(!day){
    // No specific day match — pick first non-rest day after today.
    var next=AI_PLAN.days.find(function(d){return d.exercises&&d.exercises.length;});
    if(next)return{title:'Active recovery day 🌿',body:'No lifts today — focus on mobility, walking, sleep. Next up: '+next.name+'.'};
    return{title:'Time to train 💪',body:'Get your session in.'};
  }
  if(!day.exercises||!day.exercises.length)return{title:'Rest day 🌿',body:'Sleep well — recovery is when growth happens.'};
  var focus=day.exercises.slice(0,4).map(function(e){return e.name;}).join(', ');
  return{title:'🏋️ Today: '+(day.name||'Workout'),body:focus+(day.exercises.length>4?' + '+(day.exercises.length-4)+' more':'')};
}

/* ── DATA EXPORT ──────────────────────────── */
function _csvEscape(v){if(v==null)return '';v=String(v);if(/[",\n]/.test(v))return '"'+v.replace(/"/g,'""')+'"';return v;}
function _toCsv(rows){
  if(!rows.length)return '';
  var cols=Object.keys(rows[0]);
  return cols.join(',')+'\n'+rows.map(function(r){return cols.map(function(c){return _csvEscape(r[c]);}).join(',');}).join('\n');
}
function _download(name,text){
  var blob=new Blob([text],{type:'text/csv'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},1500);
}
/* ── IMPORT: Apple Health / Google Fit ─────────────────────────── */
var _impt={source:null,parsed:null};

function openImport(){
  impt_reset();
  oModal('m-impt');
}
function impt_reset(){
  _impt={source:null,parsed:null};
  document.getElementById('impt-srcs').style.display='block';
  document.getElementById('impt-work').style.display='none';
  document.getElementById('impt-status').style.display='block';
  document.getElementById('impt-preview').style.display='none';
  document.getElementById('impt-progress').style.display='none';
  document.getElementById('impt-done').style.display='none';
  document.getElementById('impt-file-apple').value='';
  document.getElementById('impt-file-google').value='';
}
function impt_pick(source){
  _impt.source=source;
  document.getElementById('impt-file-'+source).click();
}
function impt_handleFile(ev,source){
  var file=ev.target.files&&ev.target.files[0];
  if(!file)return;
  document.getElementById('impt-srcs').style.display='none';
  document.getElementById('impt-work').style.display='block';
  document.getElementById('impt-status').style.display='block';
  document.getElementById('impt-preview').style.display='none';
  document.getElementById('impt-status-msg').textContent='Parsing '+file.name+'…';
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var text=reader.result;
      var parsed=source==='apple'?_parseAppleHealth(text):_parseGoogleFit(text);
      _impt.parsed=parsed;
      _showImportPreview(parsed);
    }catch(e){
      console.error('Import parse failed',e);
      toast('Could not read that file — '+(e.message||'unknown error'));
      impt_reset();
    }
  };
  reader.onerror=function(){toast('Could not read that file');impt_reset();};
  reader.readAsText(file);
}
function _showImportPreview(p){
  document.getElementById('impt-status').style.display='none';
  document.getElementById('impt-preview').style.display='block';
  document.getElementById('impt-c-w').textContent=p.weights.length;
  document.getElementById('impt-c-c').textContent=p.cardios.length;
  document.getElementById('impt-c-s').textContent=p.sleeps.length;
  var parts=[];
  if(p.weights.length){
    var lastW=p.weights[p.weights.length-1];
    parts.push('Most recent weight: <b>'+lastW.kg+' kg</b> on '+lastW.date);
  }
  if(p.cardios.length){
    var byAct={};p.cardios.forEach(function(c){byAct[c.activity]=(byAct[c.activity]||0)+1;});
    var top=Object.keys(byAct).sort(function(a,b){return byAct[b]-byAct[a];}).slice(0,3);
    parts.push('Top activities: <b>'+top.map(function(a){return a+' ('+byAct[a]+')';}).join(', ')+'</b>');
  }
  if(p.sleeps.length){
    var avg=p.sleeps.reduce(function(s,x){return s+x.hours;},0)/p.sleeps.length;
    parts.push('Avg sleep: <b>'+avg.toFixed(1)+' h</b> across '+p.sleeps.length+' nights');
  }
  if(!parts.length)parts.push('No supported records found in this file.');
  document.getElementById('impt-sample').innerHTML=parts.join('<br>');
}

// ── Apple Health export.xml parser (regex-based for memory efficiency) ──
function _parseAppleHealth(text){
  if(text.indexOf('HealthData')<0&&text.indexOf('HKQuantityType')<0)throw new Error('This does not look like an Apple Health export.xml');
  var weights=_appleWeights(text);
  var cardios=_appleWorkouts(text);
  var sleeps=_appleSleep(text);
  return{weights:weights,cardios:cardios,sleeps:sleeps};
}
function _appleAttr(line,name){var m=line.match(new RegExp(name+'="([^"]*)"'));return m?m[1]:'';}
function _appleDateOnly(s){return(s||'').split(' ')[0];}
function _appleWeights(text){
  var out={};
  var re=/<Record\b[^>]*type="HKQuantityTypeIdentifierBodyMass"[^>]*\/?>/g,m;
  while((m=re.exec(text))){
    var line=m[0];
    var val=parseFloat(_appleAttr(line,'value'));if(!val)continue;
    var unit=_appleAttr(line,'unit').toLowerCase();
    var kg=unit==='lb'?val*0.45359237:unit==='g'?val/1000:val;
    var d=_appleDateOnly(_appleAttr(line,'startDate'));if(!d)continue;
    out[d]=Math.round(kg*10)/10;
  }
  return Object.keys(out).sort().map(function(d){return{date:d,kg:out[d]};});
}
function _appleActivityLabel(type){
  var t=(type||'').replace('HKWorkoutActivityType','');
  var map={Running:'Running',Walking:'Walking',Cycling:'Cycling',Swimming:'Swimming',Hiking:'Hiking',Yoga:'Yoga',TraditionalStrengthTraining:'Strength',FunctionalStrengthTraining:'Strength',HighIntensityIntervalTraining:'HIIT',Soccer:'Soccer',Basketball:'Basketball',Tennis:'Tennis',Rowing:'Rowing',Elliptical:'Elliptical',StairClimbing:'Stair Climbing',Pilates:'Pilates',Boxing:'Boxing',MartialArts:'Martial Arts',Dance:'Dance',CoreTraining:'Core',MixedCardio:'Cardio',Other:'Other'};
  return map[t]||t||'Other';
}
function _appleWorkouts(text){
  var out=[];
  var re=/<Workout\b[^>]*\/?>/g,m;
  while((m=re.exec(text))){
    var line=m[0];
    var type=_appleAttr(line,'workoutActivityType');
    var dur=parseFloat(_appleAttr(line,'duration'));if(!dur||dur<=0)continue;
    var durUnit=(_appleAttr(line,'durationUnit')||'min').toLowerCase();
    var minutes=durUnit==='min'?dur:durUnit==='sec'?dur/60:durUnit==='hr'?dur*60:dur;
    var dist=parseFloat(_appleAttr(line,'totalDistance'));
    var distUnit=(_appleAttr(line,'totalDistanceUnit')||'km').toLowerCase();
    var km=isNaN(dist)?null:(distUnit==='mi'?dist*1.609344:distUnit==='m'?dist/1000:dist);
    var cal=parseFloat(_appleAttr(line,'totalEnergyBurned'));
    var startStr=_appleAttr(line,'startDate');if(!startStr)continue;
    var startISO=_appleParseDate(startStr);if(!startISO)continue;
    out.push({startISO:startISO,activity:_appleActivityLabel(type),minutes:Math.round(minutes),km:km==null?null:Math.round(km*100)/100,cal:isNaN(cal)?null:Math.round(cal)});
  }
  return out;
}
function _appleParseDate(s){
  // Apple format: "2024-12-01 09:43:21 +0100"
  if(!s)return null;
  var iso=s.replace(' ','T').replace(/\s(\+|-)(\d{2})(\d{2})$/,'$1$2:$3');
  var d=new Date(iso);return isNaN(d.getTime())?null:d.toISOString();
}
function _appleSleep(text){
  var byDate={};
  var re=/<Record\b[^>]*type="HKCategoryTypeIdentifierSleepAnalysis"[^>]*\/?>/g,m;
  while((m=re.exec(text))){
    var line=m[0];
    var val=_appleAttr(line,'value')||'';
    if(!/Asleep/.test(val))continue; // ignore InBed/Awake
    var s=_appleAttr(line,'startDate'),e=_appleAttr(line,'endDate');
    if(!s||!e)continue;
    var sd=new Date(_appleParseDate(s)),ed=new Date(_appleParseDate(e));
    var hrs=(ed-sd)/3600000;if(hrs<=0||hrs>24)continue;
    var wake=ed.toISOString().split('T')[0];
    byDate[wake]=(byDate[wake]||0)+hrs;
  }
  return Object.keys(byDate).sort().map(function(d){return{date:d,hours:Math.round(byDate[d]*10)/10};});
}

// ── Google Fit / Takeout CSV parser ──
function _parseGoogleFit(text){
  var lines=text.split(/\r?\n/).filter(function(l){return l.trim();});
  if(lines.length<2)throw new Error('CSV is empty or has no rows');
  var headers=_csvSplit(lines[0]).map(function(h){return h.trim();});
  var H=function(re){return headers.findIndex(function(h){return re.test(h);});};
  var iDate=H(/^date$/i);if(iDate<0)iDate=H(/date/i);
  if(iDate<0)throw new Error('Could not find a Date column in this CSV');
  var iWeight=H(/(average )?weight\s*\(kg\)/i);
  var iCal=H(/calorie/i);
  var iDist=H(/distance/i);
  var iAct=H(/^activity$/i);if(iAct<0)iAct=H(/activity name|workout/i);
  var iDur=H(/duration|move minutes/i);
  var weights=[],cardios=[];
  for(var i=1;i<lines.length;i++){
    var cols=_csvSplit(lines[i]);
    var raw=cols[iDate];if(!raw)continue;
    var d=new Date(raw);if(isNaN(d.getTime()))continue;
    var iso=d.toISOString().split('T')[0];
    if(iWeight>=0){
      var w=parseFloat(cols[iWeight]);
      if(!isNaN(w)&&w>20&&w<300)weights.push({date:iso,kg:Math.round(w*10)/10});
    }
    if(iAct>=0&&iDur>=0){
      var act=cols[iAct]&&cols[iAct].trim();
      var durRaw=parseFloat(cols[iDur]);
      if(act&&!isNaN(durRaw)&&durRaw>0){
        var minutes=/move minutes/i.test(headers[iDur])?durRaw:durRaw>3600?Math.round(durRaw/60000):durRaw;
        var distMeters=iDist>=0?parseFloat(cols[iDist]):NaN;
        var km=isNaN(distMeters)?null:Math.round(distMeters/100)/10;
        var cal=iCal>=0?parseFloat(cols[iCal]):NaN;
        var startISO=new Date(iso+'T12:00:00Z').toISOString();
        cardios.push({startISO:startISO,activity:act,minutes:Math.round(minutes),km:km,cal:isNaN(cal)?null:Math.round(cal)});
      }
    }
  }
  // Dedupe weights by date
  var wMap={};weights.forEach(function(w){wMap[w.date]=w.kg;});
  weights=Object.keys(wMap).sort().map(function(d){return{date:d,kg:wMap[d]};});
  return{weights:weights,cardios:cardios,sleeps:[]};
}
function _csvSplit(line){
  var out=[],cur='',inQ=false;
  for(var i=0;i<line.length;i++){
    var ch=line.charAt(i);
    if(ch==='"'){if(inQ&&line.charAt(i+1)==='"'){cur+='"';i++;}else inQ=!inQ;}
    else if(ch===','&&!inQ){out.push(cur);cur='';}
    else cur+=ch;
  }
  out.push(cur);return out;
}

// ── Commit to Supabase (upsert weight+sleep, insert cardio) ──
async function impt_commit(){
  if(!_impt.parsed||!CU)return;
  document.getElementById('impt-preview').style.display='none';
  document.getElementById('impt-progress').style.display='block';
  var bar=document.getElementById('impt-prog-bar'),lbl=document.getElementById('impt-prog-lbl');
  var p=_impt.parsed;
  var total=p.weights.length+p.cardios.length+p.sleeps.length;
  var done=0;
  function tick(label){done++;bar.style.width=Math.round(done/Math.max(total,1)*100)+'%';lbl.textContent=label;}
  var inserted={w:0,c:0,s:0};
  // Weights — batch upsert in chunks of 200
  if(p.weights.length){
    lbl.textContent='Importing weights…';
    var rows=p.weights.map(function(w){return{user_id:CU.id,logged_date:w.date,weight_kg:w.kg};});
    for(var i=0;i<rows.length;i+=200){
      var batch=rows.slice(i,i+200);
      try{await sb.from('weight_logs').upsert(batch,{onConflict:'user_id,logged_date',ignoreDuplicates:true});inserted.w+=batch.length;}catch(e){console.warn('weight import batch failed',e);}
      done+=batch.length;bar.style.width=Math.round(done/Math.max(total,1)*100)+'%';
    }
  }
  // Sleep — upsert by (user_id, logged_date)
  if(p.sleeps.length){
    lbl.textContent='Importing sleep…';
    var sRows=p.sleeps.map(function(s){return{user_id:CU.id,logged_date:s.date,duration_hours:s.hours,quality:'good'};});
    for(var j=0;j<sRows.length;j+=200){
      var sb2=sRows.slice(j,j+200);
      try{await sb.from('sleep_logs').upsert(sb2,{onConflict:'user_id,logged_date',ignoreDuplicates:true});inserted.s+=sb2.length;}catch(e){console.warn('sleep import batch failed',e);}
      done+=sb2.length;bar.style.width=Math.round(done/Math.max(total,1)*100)+'%';
    }
  }
  // Cardio — there's no natural dedupe key, so we fetch existing started_at values and skip matches
  if(p.cardios.length){
    lbl.textContent='Importing cardio sessions…';
    var existing={};
    try{
      var{data}=await sb.from('cardio_sessions').select('started_at,activity,duration_minutes').eq('user_id',CU.id);
      (data||[]).forEach(function(c){existing[(c.started_at||'').slice(0,16)+'|'+c.activity+'|'+c.duration_minutes]=true;});
    }catch(e){console.warn('cardio existing fetch failed',e);}
    var cRows=p.cardios.filter(function(c){return!existing[(c.startISO||'').slice(0,16)+'|'+c.activity+'|'+c.minutes];}).map(function(c){return{user_id:CU.id,activity:c.activity,duration_minutes:c.minutes,distance_km:c.km,calories:c.cal,started_at:c.startISO};});
    for(var k=0;k<cRows.length;k+=200){
      var cb=cRows.slice(k,k+200);
      try{await sb.from('cardio_sessions').insert(cb);inserted.c+=cb.length;}catch(e){console.warn('cardio import batch failed',e);}
      done+=cb.length;bar.style.width=Math.round(done/Math.max(total,1)*100)+'%';
    }
  }
  bar.style.width='100%';
  document.getElementById('impt-progress').style.display='none';
  document.getElementById('impt-done').style.display='block';
  document.getElementById('impt-done-sub').innerHTML='Imported <b>'+inserted.w+'</b> weight, <b>'+inserted.c+'</b> cardio, <b>'+inserted.s+'</b> sleep records.<br>Duplicates by date were skipped.';
  // Refresh visible charts so the new data shows up
  try{if(typeof loadWtLog==='function')await loadWtLog();}catch(e){}
  try{if(typeof loadSleepHist==='function')await loadSleepHist();}catch(e){}
  try{if(typeof renderActivityFeed==='function')await renderActivityFeed();}catch(e){}
}

// Lazy-load JSZip from CDN. Cached on window so we only fetch once per session.
function _loadJSZip(){
  if(window.JSZip)return Promise.resolve(window.JSZip);
  return new Promise(function(resolve,reject){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    s.onload=function(){resolve(window.JSZip);};
    s.onerror=function(){reject(new Error('Could not load JSZip'));};
    document.head.appendChild(s);
  });
}
async function exportData(){
  toast('Bundling your data…');
  var JSZip;
  try{JSZip=await _loadJSZip();}catch(e){
    toast('ZIP library failed to load — falling back to CSV downloads');
    return _exportDataLegacy();
  }
  var zip=new JSZip();
  var stamp=new Date().toISOString().slice(0,10);
  var folder=zip.folder('athleteos-'+stamp);

  // 1) Tabular data → CSVs in /data
  var queries=await Promise.all([
    sb.from('workouts').select('*').eq('user_id',CU.id),
    sb.from('exercises').select('*').eq('user_id',CU.id),
    sb.from('sets').select('*').eq('user_id',CU.id),
    sb.from('meals').select('*').eq('user_id',CU.id),
    sb.from('water_logs').select('*').eq('user_id',CU.id),
    sb.from('sleep_logs').select('*').eq('user_id',CU.id),
    sb.from('weight_logs').select('*').eq('user_id',CU.id),
    sb.from('body_measurements').select('*').eq('user_id',CU.id),
    sb.from('cardio_sessions').select('*').eq('user_id',CU.id),
    sb.from('daily_checkins').select('*').eq('user_id',CU.id),
    sb.from('personal_records').select('*').eq('user_id',CU.id)
  ]);
  var names=['workouts','exercises','sets','meals','water_logs','sleep_logs','weight_logs','body_measurements','cardio_sessions','daily_checkins','personal_records'];
  var dataFolder=folder.folder('data');
  queries.forEach(function(q,i){if(q.data&&q.data.length){dataFolder.file(names[i]+'.csv',_toCsv(q.data));}});

  // 2) Settings + profile + local-cached PRs → settings.json
  try{
    var{data:profile}=await sb.from('profiles').select('*').eq('id',CU.id).maybeSingle();
    var settings={
      exported_at:new Date().toISOString(),
      app_version:typeof APP_VERSION!=='undefined'?APP_VERSION:'unknown',
      profile:profile||null,
      goals:G,
      profile_local:P,
      reminders:REM,
      local_prs:JSON.parse(localStorage.getItem('prs_'+CU.id)||'{}'),
      ai_plan:JSON.parse(localStorage.getItem('athleteos_plan_'+CU.id)||'null')
    };
    folder.file('settings.json',JSON.stringify(settings,null,2));
  }catch(e){console.warn('settings bundle failed',e);}

  // 3) Progress photos — download blobs, store in /photos with a manifest.
  try{
    var{data:photos}=await sb.from('progress_photos').select('*').eq('user_id',CU.id).order('taken_at',{ascending:false});
    if(photos&&photos.length){
      var photosFolder=folder.folder('photos');
      toast('Fetching '+photos.length+' photo'+(photos.length===1?'':'s')+'…');
      var manifest=[];
      for(var i=0;i<photos.length;i++){
        var p=photos[i];
        try{
          var{data:signed}=await sb.storage.from('progress-photos').createSignedUrl(p.storage_path,3600);
          if(!signed||!signed.signedUrl)continue;
          var resp=await fetch(signed.signedUrl);
          if(!resp.ok)continue;
          var blob=await resp.blob();
          var ext=(p.storage_path.split('.').pop()||'jpg').toLowerCase();
          var fname=(p.taken_at||'').slice(0,10).replace(/-/g,'')+'_'+(p.pose||'photo')+'_'+i+'.'+ext;
          photosFolder.file(fname,blob);
          manifest.push({file:fname,taken_at:p.taken_at,pose:p.pose,weight_kg:p.weight_kg,storage_path:p.storage_path});
        }catch(e){console.warn('photo fetch failed',p.id,e);}
      }
      photosFolder.file('manifest.json',JSON.stringify(manifest,null,2));
    }
  }catch(e){console.warn('photos bundle failed',e);}

  // 4) README so a future-you (or other apps) can make sense of the bundle.
  folder.file('README.txt',
    'AthleteOS data export\n'+
    'Generated: '+new Date().toISOString()+'\n\n'+
    'Contents:\n'+
    '  data/         CSV files for every table (workouts, sets, meals, sleep, etc.).\n'+
    '  photos/       Progress photos. manifest.json maps each file to its date/pose.\n'+
    '  settings.json Your profile, goals, reminders, local PR cache and saved plan.\n'+
    '  README.txt    This file.\n\n'+
    'Re-importing isn\'t automatic — this bundle is your own backup / portability copy.\n'
  );

  toast('Zipping…');
  var blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='athleteos-export-'+stamp+'.zip';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},2000);
  toast('Export ready — '+(Math.round(blob.size/1024))+' KB');
}
// Fallback if JSZip CDN is blocked: same as the original — drop one CSV per table.
async function _exportDataLegacy(){
  var queries=await Promise.all([
    sb.from('workouts').select('*').eq('user_id',CU.id),
    sb.from('exercises').select('*').eq('user_id',CU.id),
    sb.from('sets').select('*').eq('user_id',CU.id),
    sb.from('meals').select('*').eq('user_id',CU.id),
    sb.from('water_logs').select('*').eq('user_id',CU.id),
    sb.from('sleep_logs').select('*').eq('user_id',CU.id),
    sb.from('weight_logs').select('*').eq('user_id',CU.id),
    sb.from('body_measurements').select('*').eq('user_id',CU.id),
    sb.from('cardio_sessions').select('*').eq('user_id',CU.id),
    sb.from('daily_checkins').select('*').eq('user_id',CU.id)
  ]);
  var names=['workouts','exercises','sets','meals','water_logs','sleep_logs','weight_logs','body_measurements','cardio_sessions','daily_checkins'];
  var stamp=new Date().toISOString().slice(0,10);
  var any=false;
  queries.forEach(function(q,i){if(q.data&&q.data.length){_download('athleteos-'+names[i]+'-'+stamp+'.csv',_toCsv(q.data));any=true;}});
  toast(any?'Downloads started':'No data yet');
}

/* ── PRIVACY / TERMS ──────────────────────── */
var LEGAL_HTML={
  privacy:
'<p style="color:var(--t3);font-size:11.5px;margin-bottom:14px">Last updated: 2026-05-24 · Effective immediately</p>'+
'<p style="margin-bottom:14px">AthleteOS (\"we\", \"us\") provides a fitness tracking app and AI coaching service. This policy explains what we collect, why, and what control you have. We aim to collect the minimum needed to run the service well.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">1. Data we collect</h4>'+
'<ul style="padding-left:18px;margin-bottom:14px"><li><b>Account</b>: email, display name, password hash (via Supabase Auth).</li><li><b>Fitness data you log</b>: workouts, sets, exercises, meals, water, sleep, weight, body measurements, progress photos, daily check-ins.</li><li><b>Profile preferences</b>: goal, experience, training style, weekly target, muscle map preferences, accent &amp; theme.</li><li><b>Subscription</b>: Stripe customer ID and subscription status. Card details are handled by Stripe — we never see them.</li><li><b>Device/usage</b>: browser type, OS, screen size, error logs (for debugging only).</li></ul>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">2. How we use it</h4>'+
'<ul style="padding-left:18px;margin-bottom:14px"><li>Show your data back to you and calculate trends, streaks, PRs.</li><li>Provide AI coaching — your stats are sent as context to a third-party LLM (Pollinations) to generate replies.</li><li>Send opt-in notifications you turned on (workout reminders, protein nudges).</li><li>Process subscriptions via Stripe (managed payments).</li><li>Debug crashes and improve the app.</li></ul>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">3. Where data lives</h4>'+
'<ul style="padding-left:18px;margin-bottom:14px"><li>Stored encrypted at rest on <b>Supabase</b> (EU-West-1, Ireland).</li><li>Progress photos in a <b>private Supabase Storage bucket</b> — only your authenticated requests can read yours.</li><li>Payment data on <b>Stripe</b> (US/EU). Stripe is PCI-DSS Level 1 certified.</li><li>AI conversations are sent to <b>Pollinations.ai</b> as transient requests. We mark them <code>private:true</code> and we do not retain training rights to them.</li><li>If you accept the cookie banner, anonymous product-usage events (page views, button clicks) are sent to <b>PostHog</b> (EU region) to help us understand how the app is used. Decline the banner and no events are sent.</li></ul>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">4. Sharing</h4>'+
'<p style="margin-bottom:14px">We do not sell, rent, or share your personal data with third parties for marketing. We share data only with the processors above (Supabase, Stripe, Pollinations) strictly to deliver the service.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">5. Your rights (GDPR &amp; equivalents)</h4>'+
'<ul style="padding-left:18px;margin-bottom:14px"><li><b>Access</b>: export your full data as CSV any time from Settings → Your Data.</li><li><b>Deletion</b>: Settings → Delete Account erases your account, all logged data, photos, PRs, and cancels any active subscription.</li><li><b>Correction</b>: edit any field directly in the app, or email <a href="mailto:alkanzilgir@gmail.com">alkanzilgir@gmail.com</a>.</li><li><b>Portability</b>: the CSV export is machine-readable and re-importable.</li><li><b>Objection / withdrawal of consent</b>: opt out of any notification toggle in Settings; cancel subscription in Stripe portal.</li></ul>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">6. Retention</h4>'+
'<p style="margin-bottom:14px">We keep your data for as long as your account exists. After account deletion, all rows are removed from our active database within 7 days. Encrypted backups roll over within 30 days.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">7. Children</h4>'+
'<p style="margin-bottom:14px">AthleteOS is not intended for users under 13 (or under 16 in the EU). We do not knowingly collect data from children. If you believe a child has signed up, email us and we will delete their account.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">8. Contact &amp; changes</h4>'+
'<p>Email: <a href="mailto:alkanzilgir@gmail.com">alkanzilgir@gmail.com</a><br>Material changes to this policy will be announced in-app. Continued use after a change means you accept the updated policy.</p>',

  terms:
'<p style="color:var(--t3);font-size:11.5px;margin-bottom:14px">Last updated: 2026-05-24 · Effective immediately</p>'+
'<p style="margin-bottom:14px">By creating an account or using AthleteOS you agree to these terms. If you do not agree, do not use the service.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">1. What AthleteOS is</h4>'+
'<p style="margin-bottom:14px">A fitness logging and coaching app. We provide a tool to track your training, nutrition, recovery, and an AI assistant that gives general guidance. We do <b>not</b> provide medical advice, diagnose conditions, or prescribe exercise programs in any clinical sense.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">2. Health disclaimer</h4>'+
'<p style="margin-bottom:14px"><b>Read this carefully.</b> Strength training carries inherent risk of injury. AI suggestions are generalized and do not replace a qualified trainer, doctor, or physiotherapist. Consult a medical professional before starting any new exercise or nutrition program — especially if you are pregnant, recovering from injury, have heart conditions, or take medication that affects exercise tolerance.</p>'+
'<p style="margin-bottom:14px">You agree that you train at your own risk and that AthleteOS, its developers, and providers are not liable for any injury, illness, or loss arising from your use of the service.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">3. Your responsibilities</h4>'+
'<ul style="padding-left:18px;margin-bottom:14px"><li>Lift within your ability with proper form. Warm up. Stop if something hurts.</li><li>Provide accurate information when logging — calculations rely on it.</li><li>Keep your password secure. Don\'t share your account.</li><li>Use the service only for lawful, personal purposes.</li></ul>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">4. Subscriptions &amp; billing</h4>'+
'<ul style="padding-left:18px;margin-bottom:14px"><li>Free tier includes core logging features. Pro adds unlimited AI coaching, plans, demos, analytics, photos, and templates.</li><li>Pro is billed by Stripe. Recurring plans auto-renew until cancelled.</li><li>Yearly plan includes a 7-day free trial. You will not be charged if you cancel before day 7.</li><li>Cancel any time in Settings → Manage Subscription. Cancellation takes effect at the end of the current billing period — no refunds for partial periods.</li><li>Lifetime is a one-time purchase, non-refundable except where required by law.</li><li>Sales taxes are handled by Stripe via Managed Payments.</li></ul>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">5. AI coach limits</h4>'+
'<p style="margin-bottom:14px">The AI trainer uses an LLM and may produce inaccurate, incomplete, or unsafe suggestions. Use professional judgment. We are not liable for actions you take based on AI output.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">6. Acceptable use</h4>'+
'<ul style="padding-left:18px;margin-bottom:14px"><li>Don\'t reverse engineer, scrape, or abuse the service.</li><li>Don\'t upload illegal content or content of minors in progress photos.</li><li>Don\'t use the service to harm yourself or others.</li><li>We may suspend accounts that violate these rules.</li></ul>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">7. Intellectual property</h4>'+
'<p style="margin-bottom:14px">The app, branding, and content are owned by AthleteOS. Your logged data belongs to you; you grant us a limited license to store and process it to provide the service.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">8. Termination</h4>'+
'<p style="margin-bottom:14px">You can delete your account anytime in Settings. We may terminate accounts that violate these terms. Upon termination, your data is removed per the Privacy Policy.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">9. Limitation of liability</h4>'+
'<p style="margin-bottom:14px">To the maximum extent permitted by law, AthleteOS is provided "AS IS" without warranty. Our aggregate liability for any claim is limited to the amount you paid us in the 12 months before the claim.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">10. Governing law</h4>'+
'<p style="margin-bottom:14px">These terms are governed by the laws of the Netherlands. Disputes are resolved by Dutch courts unless local consumer law grants you stronger rights.</p>'+
'<h4 style="font-size:14px;font-weight:700;color:var(--t);margin:18px 0 8px">11. Contact</h4>'+
'<p>Email: <a href="mailto:alkanzilgir@gmail.com">alkanzilgir@gmail.com</a></p>'
};
function openLegal(which){
  document.getElementById('legal-title').textContent=which==='privacy'?'Privacy Policy':'Terms of Service';
  document.getElementById('legal-body').innerHTML=LEGAL_HTML[which];
  oModal('m-legal');
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
function cModal(id){document.getElementById(id).classList.remove('on');if(id==='m-bc')stopBc();if(id==='m-exi'&&typeof _stopExGif==='function')_stopExGif();}
function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on');},3000);}
document.querySelectorAll('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)cModal(m.id);});});

/* ── A11Y: keyboard nav + landmarks ───────────
   Many "tap targets" in this app are <div onclick> (legacy). Make them keyboard-
   focusable + Enter/Space triggers click, give them a button role, and label
   the main nav landmarks. Done at boot so dynamically-added items also work. */
function _enhanceA11y(){
  var clickable=document.querySelectorAll('.nv,.sb-item,.qa-btn,.sit,.expk-row,.acc-pick,.atab');
  clickable.forEach(function(el){
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
    if(!el.hasAttribute('role'))el.setAttribute('role','button');
  });
  // Trigger click on Enter/Space for any role="button" that isn't a real button.
  document.addEventListener('keydown',function(e){
    var t=e.target;if(!t||t.tagName==='BUTTON'||t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT')return;
    if(t.getAttribute&&t.getAttribute('role')==='button'){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click();}
    }
  });
  // Landmark labels on the two nav bars and main app.
  var sn=document.querySelector('.sb-nav');if(sn)sn.setAttribute('aria-label','Primary');
  var nb=document.querySelector('.navbar');if(nb)nb.setAttribute('aria-label','Sections');
  var app=document.getElementById('app');if(app)app.setAttribute('role','application');
  // Hide decorative SVGs from screen readers.
  document.querySelectorAll('.empty-ico svg,.sb-ico,.navbar .ico').forEach(function(s){s.setAttribute('aria-hidden','true');});
}
_enhanceA11y();

init();
