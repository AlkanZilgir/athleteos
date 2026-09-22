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

/* ── WORKOUT ──────────────────────────────── */
var wNote='';
function toggleSessNote(btn){
  var ta=document.getElementById('wn-text');if(!ta)return;
  var shown=ta.style.display!=='none';
  ta.style.display=shown?'none':'block';
  if(!shown){setTimeout(function(){ta.focus();},10);}
  if(btn)btn.textContent=ICO('notebook','13px')+(wNote?'Edit session note':(shown?'Add session note':'Hide note'));
}
function startW(){
  if(!document.getElementById('active-sess').classList.contains('hidden'))return;
  wExs=[];wStart=Date.now();wNote='';
  var ta=document.getElementById('wn-text');if(ta){ta.value='';ta.style.display='none';}
  var tb=document.getElementById('wn-toggle');if(tb)tb.innerHTML=ICO('notebook','13px')+'Add session note';
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
      '<button type="button" onclick="wSets.splice('+i+',1);renderSets()" style="background:none;border:none;color:var(--red);font-size:16px;cursor:pointer">'+ICO('x','14px')+'</button>'+
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
    toast('Rest started — '+s+'s');
  }
}
/* ── SESSION MUSCLE MAP ────────────────────── */
// Highlights the muscle groups hit by the exercises in the active session.
// Front + back stylised figures; app muscle groups map onto these regions:
//   chest→ch, back→ba, shoulders→sh, arms→ar, legs→le, core→co.
function renderBodyMap(){
  var el=document.getElementById('sess-bodymap');if(!el)return;
  var worked={};(wExs||[]).forEach(function(e){var m=(e.muscle||'').toLowerCase();if(m&&m!=='cardio')worked[m]=true;});
  var groups=Object.keys(worked);
  if(!groups.length){el.style.display='none';el.innerHTML='';return;}
  el.style.display='block';
  function grpFor(short){return{ch:'chest',ba:'back',sh:'shoulders',ar:'arms',le:'legs',co:'core'}[short];}
  function on(short){return worked[grpFor(short)]?' on':'';}
  var front='<svg viewBox="0 0 100 220" class="bm-fig" aria-label="Front muscles">'+
    '<circle class="sil" cx="50" cy="16" r="11"/><rect class="sil" x="45" y="25" width="10" height="8" rx="3"/>'+
    '<ellipse class="m sh'+on('sh')+'" cx="27" cy="45" rx="11" ry="9"/><ellipse class="m sh'+on('sh')+'" cx="73" cy="45" rx="11" ry="9"/>'+
    '<path class="m ch'+on('ch')+'" d="M38 43 Q49 39 49 39 L49 65 Q48 67 40 66 Q34 60 35 50 Z"/>'+
    '<path class="m ch'+on('ch')+'" d="M62 43 Q51 39 51 39 L51 65 Q52 67 60 66 Q66 60 65 50 Z"/>'+
    '<ellipse class="m ar'+on('ar')+'" cx="21" cy="64" rx="7" ry="13"/><ellipse class="m ar'+on('ar')+'" cx="79" cy="64" rx="7" ry="13"/>'+
    '<ellipse class="m ar'+on('ar')+'" cx="17" cy="92" rx="6" ry="13"/><ellipse class="m ar'+on('ar')+'" cx="83" cy="92" rx="6" ry="13"/>'+
    '<rect class="m co'+on('co')+'" x="41" y="69" width="18" height="33" rx="6"/>'+
    '<rect class="m le'+on('le')+'" x="36" y="108" width="12" height="46" rx="6"/><rect class="m le'+on('le')+'" x="52" y="108" width="12" height="46" rx="6"/>'+
    '<rect class="m le'+on('le')+'" x="37" y="158" width="10" height="40" rx="5"/><rect class="m le'+on('le')+'" x="53" y="158" width="10" height="40" rx="5"/>'+
  '</svg>';
  var back='<svg viewBox="0 0 100 220" class="bm-fig" aria-label="Back muscles">'+
    '<circle class="sil" cx="50" cy="16" r="11"/><rect class="sil" x="45" y="25" width="10" height="8" rx="3"/>'+
    '<ellipse class="m sh'+on('sh')+'" cx="27" cy="45" rx="11" ry="9"/><ellipse class="m sh'+on('sh')+'" cx="73" cy="45" rx="11" ry="9"/>'+
    '<path class="m ba'+on('ba')+'" d="M39 40 Q50 36 61 40 L63 72 Q50 80 37 72 Z"/>'+
    '<ellipse class="m ar'+on('ar')+'" cx="21" cy="64" rx="7" ry="13"/><ellipse class="m ar'+on('ar')+'" cx="79" cy="64" rx="7" ry="13"/>'+
    '<ellipse class="m ar'+on('ar')+'" cx="17" cy="92" rx="6" ry="13"/><ellipse class="m ar'+on('ar')+'" cx="83" cy="92" rx="6" ry="13"/>'+
    '<rect class="m le'+on('le')+'" x="37" y="100" width="12" height="16" rx="6"/><rect class="m le'+on('le')+'" x="51" y="100" width="12" height="16" rx="6"/>'+
    '<rect class="m le'+on('le')+'" x="36" y="118" width="12" height="40" rx="6"/><rect class="m le'+on('le')+'" x="52" y="118" width="12" height="40" rx="6"/>'+
    '<ellipse class="m le'+on('le')+'" cx="42" cy="178" rx="6" ry="16"/><ellipse class="m le'+on('le')+'" cx="58" cy="178" rx="6" ry="16"/>'+
  '</svg>';
  var legend=groups.map(function(g){return '<span class="bm-chip">'+g+'</span>';}).join('');
  el.innerHTML='<div class="ctitle" style="margin:0 0 10px">Muscles worked</div>'+
    '<div class="bm-wrap"><div class="bm-col">'+front+'<div class="bm-side">Front</div></div>'+
    '<div class="bm-col">'+back+'<div class="bm-side">Back</div></div></div>'+
    '<div class="bm-legend">'+legend+'</div>';
}
function renderExList(){
  renderBodyMap();
  var el=document.getElementById('ex-list');
  if(!wExs.length){el.innerHTML='<div class="empty-state"><div class="empty-ico"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="26" width="6" height="12" rx="2"/><rect x="52" y="26" width="6" height="12" rx="2"/><rect x="14" y="22" width="6" height="20" rx="2"/><rect x="44" y="22" width="6" height="20" rx="2"/><path d="M20 32h24"/></svg></div><div class="empty-h">No exercises yet</div><div class="empty-sub">Pick a lift and start logging sets. We’ll track every PR for you.</div><button type="button" class="empty-cta" onclick="openExM()">+ Add exercise</button></div>';return;}
  el.innerHTML=wExs.map(function(ex,idx){
    var sn=(ex.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    var noteVal=(ex.note||'').replace(/"/g,'&quot;');
    var noteShown=ex.note?'block':'none';
    var isFirst=idx===0,isLast=idx===wExs.length-1;
    var moveBtns=
      '<div style="display:flex;gap:2px;margin-left:auto">'+
        '<button type="button" aria-label="Move up" '+(isFirst?'disabled':'')+' onclick="moveEx('+idx+',-1)" style="background:none;border:none;color:'+(isFirst?'var(--t4)':'var(--t3)')+';cursor:'+(isFirst?'default':'pointer')+';padding:2px 6px;font-size:12px;line-height:1;display:grid;place-items:center;transform:rotate(-90deg)">'+ICO('chevron-right','14px')+'</button>'+
        '<button type="button" aria-label="Move down" '+(isLast?'disabled':'')+' onclick="moveEx('+idx+',1)" style="background:none;border:none;color:'+(isLast?'var(--t4)':'var(--t3)')+';cursor:'+(isLast?'default':'pointer')+';padding:2px 6px;font-size:12px;line-height:1;display:grid;place-items:center;transform:rotate(90deg)">'+ICO('chevron-right','14px')+'</button>'+
        '<button type="button" aria-label="Remove" onclick="removeEx('+idx+')" style="background:none;border:none;color:var(--t3);cursor:pointer;padding:2px 6px;font-size:14px;line-height:1">'+ICO('x','14px')+'</button>'+
      '</div>';
    var lastTargets=_lastSessSummary(ex.name);
    var target=_progressionTarget(ex.name);
    var firstSetEmpty=!ex.sets.length||(ex.sets.length===1&&!ex.sets[0].weight&&!ex.sets[0].reps);
    var lastLine=lastTargets?'<div style="font-size:11.5px;color:var(--t3);margin-top:4px;font-weight:600;letter-spacing:.2px;display:flex;align-items:center;gap:5px">'+ICO('repeat','12px')+'Last: <span style="color:var(--t2);font-weight:700">'+lastTargets+'</span></div>':'';
    var targetLine=(target&&firstSetEmpty)?'<div style="font-size:11.5px;color:var(--accent-d);margin-top:4px;font-weight:700;letter-spacing:.2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="display:flex;align-items:center;gap:6px">'+ICO('target','13px')+'Target: '+(target.w>0?target.w+' kg × '+target.r:target.r+' reps')+'</span><span style="font-size:10.5px;color:var(--t3);font-weight:600">'+target.label+'</span><button type="button" onclick="applyProgressionTarget('+idx+')" style="background:var(--adim);border:1px solid var(--accent);color:var(--accent-d);font-family:inherit;font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:999px;cursor:pointer;-webkit-appearance:none">Apply</button></div>':'';
    var topW=(ex.sets&&ex.sets.length)?ex.sets.reduce(function(a,s){return(parseFloat(s.weight)||0)>a?parseFloat(s.weight)||0:a;},0):0;
    var setGrid;
    if(ex.sets&&ex.sets.length){
      setGrid='<div class="setgrid"><div class="setrow sethead"><div>#</div><div>Weight</div><div>Reps</div><div>RIR</div><div></div></div>'+
        ex.sets.map(function(s,si){
          var done=!!s.done;
          var rv=(s.rir===0||s.rir)?s.rir:'';
          var sug=_setSuggest(ex,si);
          return '<div class="setrow'+(done?' done':'')+'">'+
            '<div class="setn">'+(si+1)+'</div>'+
            _stepper(idx,si,'weight',s.weight,sug.weight,_wStep(),'Weight')+
            _stepper(idx,si,'reps',s.reps,sug.reps,1,'Reps')+
            '<div class="setrir"><span class="rir-dot" style="background:'+rirColor(rv)+'"></span><input type="number" inputmode="numeric" step="1" min="0" max="10" class="setin rir-in" value="'+rv+'" placeholder="–" aria-label="Reps in reserve" oninput="setField('+idx+','+si+',\'rir\',this.value)"></div>'+
            '<button type="button" class="setdone'+(done?' on':'')+'" aria-label="Complete set '+(si+1)+'" aria-pressed="'+done+'" onclick="toggleSetDone('+idx+','+si+',this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>'+
            '<button type="button" class="setdel" aria-label="Remove set '+(si+1)+'" onclick="removeSet('+idx+','+si+')">'+ICO('x','13px')+'</button>'+
          '</div>';
        }).join('')+'</div>';
    }else{
      setGrid='<div style="font-size:12px;color:var(--t4);margin-top:8px;letter-spacing:.12em;text-transform:uppercase;font-family:var(--font-display)">No sets</div>';
    }
    return '<div class="exi">'+
      '<div class="fb"><div class="exn" onclick="openExInfo(\''+sn+'\')" style="cursor:pointer">'+ex.name+'</div><span class="tag">'+ex.muscle+'</span>'+moveBtns+'</div>'+
      lastLine+targetLine+
      setGrid+
      '<div data-ex-demo="'+idx+'" class="exdemo" style="display:none"></div>'+
      '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">'+
        '<button type="button" class="btn-o" style="padding:7px 14px;font-size:12px" onclick="addInlineSet('+idx+')">+ Set</button>'+
        '<button type="button" class="btn-g" style="padding:4px 8px;font-size:11.5px" onclick="toggleExDemo('+idx+',\''+sn+'\',this)">'+ICO('film','12px')+'Demo</button>'+
        '<button type="button" class="btn-g" style="padding:4px 8px;font-size:11.5px" onclick="toggleExNote('+idx+',this)">'+ICO('notebook','12px')+(ex.note?'Edit note':'Add note')+'</button>'+
        '<button type="button" class="btn-g" style="padding:4px 8px;font-size:11.5px" onclick="openPlate('+topW+')" title="Plate calculator">'+ICO('calculator','13px')+'Plates</button>'+
        '<button type="button" class="btn-g" style="padding:4px 8px;font-size:11.5px;border-color:var(--accent);color:var(--accent-d)" onclick="restForEx('+idx+')">'+ICO('timer','13px')+'Rest '+_fmtRestPref(getRestPref(ex.name))+'</button>'+
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

/* ── INLINE SET GRID ───────────────────────── */
// Colour for the RIR effort dot: low RIR (near failure) = red, high = green.
function rirColor(v){
  if(v===''||v==null)return 'var(--t4)';
  var n=parseInt(v);if(isNaN(n))return 'var(--t4)';
  if(n<=1)return '#EF4444';
  if(n<=3)return '#F59E0B';
  return '#22C55E';
}
// Write an edited cell straight back to the in-memory session model.
/* ── RAPID-FIRE SET LOGGING ────────────────
   Three rules: never open a keyboard you did not have to, never make the
   user retype what they just lifted, and keep the running totals honest. */

// 2.5 kg is the smallest plate pair most gyms have; 5 lb is its imperial twin.
function _wStep(){return (P&&P.units==='imperial')?5:2.5;}
function _wUnit(){return (P&&P.units==='imperial')?'lb':'kg';}

// What this set most likely is: the set above it, else the matching set from
// the last time this lift was trained. Shown as a ghost, not a value, so an
// untouched row never silently logs numbers the user did not choose.
function _setSuggest(ex,si){
  for(var k=si-1;k>=0;k--){
    var p=ex.sets[k];
    if(p&&(p.weight!==''&&p.weight!=null)||(p&&p.reps!==''&&p.reps!=null))
      return{weight:p.weight,reps:p.reps};
  }
  var ls=_lastSessByEx[(ex.name||'').toLowerCase()];
  if(ls&&ls.sets&&ls.sets.length){var m=ls.sets[Math.min(si,ls.sets.length-1)];if(m)return{weight:m.w||'',reps:m.r||''};}
  var t=_progressionTarget(ex.name);
  if(t)return{weight:t.w,reps:t.r};
  return{weight:'',reps:''};
}

function _stepper(idx,si,field,val,sug,step,label){
  var has=(val!==''&&val!=null);
  var ph=(sug!==''&&sug!=null)?sug:'0';
  var mode=field==='weight'?'decimal':'numeric';
  return '<div class="step'+(has?'':' ghost')+'">'+
    '<button type="button" class="step-b" tabindex="-1" aria-label="Decrease '+label.toLowerCase()+'" onclick="stepSet('+idx+','+si+',\''+field+'\',-'+step+')">&minus;</button>'+
    '<input type="number" inputmode="'+mode+'" step="'+step+'" min="0" class="setin" value="'+(has?val:'')+'" placeholder="'+ph+'" aria-label="'+label+'" oninput="setField('+idx+','+si+',\''+field+'\',this.value)">'+
    '<button type="button" class="step-b" tabindex="-1" aria-label="Increase '+label.toLowerCase()+'" onclick="stepSet('+idx+','+si+',\''+field+'\','+step+')">+</button>'+
  '</div>';
}

// Tapping a stepper on an empty cell commits the ghost first, then moves it.
function stepSet(idx,si,field,delta){
  var ex=wExs[idx];if(!ex||!ex.sets||!ex.sets[si])return;
  var s=ex.sets[si],cur=s[field];
  if(cur===''||cur==null){
    var sug=_setSuggest(ex,si)[field];
    cur=(sug===''||sug==null)?0:parseFloat(sug)||0;
  }else{cur=parseFloat(cur)||0;}
  var next=cur+delta;
  if(next<0)next=0;
  if(field==='reps')next=Math.round(next);
  else next=Math.round(next*100)/100;
  s[field]=next;
  var cell=document.querySelectorAll('#ex-list .exi')[idx];
  if(cell){
    var row=cell.querySelectorAll('.setrow:not(.sethead)')[si];
    if(row){
      var box=row.querySelectorAll('.step')[field==='weight'?0:1];
      if(box){box.classList.remove('ghost');var inp=box.querySelector('.setin');if(inp)inp.value=next;}
    }
  }
  if(navigator.vibrate)try{navigator.vibrate(8);}catch(e){}
  updateSessionHUD();
}

// Live HUD — volume of completed sets only, so the number means something.
function updateSessionHUD(){
  var vol=0,sets=0;
  wExs.forEach(function(ex){(ex.sets||[]).forEach(function(s){
    if(!s.done)return;
    sets++;vol+=(parseFloat(s.weight)||0)*(parseInt(s.reps)||0);
  });});
  var heavy=vol>=1000;
  var v=document.getElementById('hud-vol');
  if(v)v.textContent=heavy?(vol/1000).toFixed(1):Math.round(vol).toLocaleString();
  var u=document.getElementById('hud-vol-u');
  if(u)u.textContent=heavy?(P&&P.units==='imperial'?'k lb':'t'):_wUnit();
  var n=document.getElementById('hud-sets');if(n)n.textContent=sets;
}

function setField(idx,si,field,val){
  var ex=wExs[idx];if(!ex||!ex.sets||!ex.sets[si])return;
  if(field==='weight'){ex.sets[si].weight=val===''?'':(parseFloat(val)||0);}
  else if(field==='reps'){ex.sets[si].reps=val===''?'':(parseInt(val)||0);}
  if(field==='weight'||field==='reps'){
    var cell=document.querySelectorAll('#ex-list .exi')[idx];
    var r0=cell&&cell.querySelectorAll('.setrow:not(.sethead)')[si];
    var bx=r0&&r0.querySelectorAll('.step')[field==='weight'?0:1];
    if(bx)bx.classList.toggle('ghost',val==='');
    updateSessionHUD();
  }
  else if(field==='rir'){
    ex.sets[si].rir=val===''?null:Math.max(0,Math.min(10,parseInt(val)||0));
    // Recolour the effort dot live without a full re-render (keeps focus in the input).
    var row=document.querySelectorAll('#ex-list .exi')[idx];
    if(row){var dots=row.querySelectorAll('.rir-dot');if(dots[si])dots[si].style.background=rirColor(ex.sets[si].rir==null?'':ex.sets[si].rir);}
  }
}
// Tick a set complete — fires haptics and (if auto-rest is on) starts the rest timer.
function toggleSetDone(idx,si,btn){
  var ex=wExs[idx];if(!ex||!ex.sets||!ex.sets[si])return;
  var s=ex.sets[si];
  var nowDone=!s.done;
  if(nowDone){
    // Ticking a row you never typed in means "I did what it says" — commit the
    // ghost rather than saving an empty set.
    var sug=_setSuggest(ex,si);
    if(s.weight===''||s.weight==null)s.weight=(sug.weight===''||sug.weight==null)?0:parseFloat(sug.weight)||0;
    if(s.reps===''||s.reps==null)s.reps=(sug.reps===''||sug.reps==null)?0:parseInt(sug.reps)||0;
  }
  s.done=nowDone;
  if(btn){btn.classList.toggle('on',nowDone);btn.setAttribute('aria-pressed',nowDone);}
  var row=btn&&btn.closest('.setrow');
  if(row){
    row.classList.toggle('done',nowDone);
    row.querySelectorAll('.step').forEach(function(box,i){
      var inp=box.querySelector('.setin');
      if(!inp)return;
      var v=i===0?s.weight:s.reps;
      if(nowDone){inp.value=(v===''||v==null)?'':v;box.classList.remove('ghost');}
    });
  }
  updateSessionHUD();
  if(nowDone){
    if(navigator.vibrate)try{navigator.vibrate(35);}catch(e){}
    if(P._autoRest)restForEx(idx);
  }
}
// Add a blank set row, pre-filling weight/reps from this session's last set,
// falling back to the matching set from the previous session.
function addInlineSet(idx){
  var ex=wExs[idx];if(!ex)return;
  ex.sets=ex.sets||[];
  // The row arrives empty; _setSuggest paints the ghost. No keyboard opens.
  ex.sets.push({weight:'',reps:'',rir:null,done:false});
  renderExList();
  updateSessionHUD();
}
function removeSet(idx,si){
  var ex=wExs[idx];if(!ex||!ex.sets)return;
  ex.sets.splice(si,1);
  renderExList();updateSessionHUD();
}

/* ── INLINE QUICK-ADD ──────────────────────
   Search, tap, the card lands at the end of the list. No modal, and the
   page never jumps: we scroll the new card into view instead. */
var _qaSel=-1;
function _qaCatalog(){
  var cust=getCustomEx().map(function(c){return{name:c.name,info:c};});
  return cust.concat(Object.keys(EX_DB).map(function(k){return{name:k,info:EX_DB[k]};}));
}
function qaFilter(){
  var box=document.getElementById('qa-results'),inp=document.getElementById('qa-q');
  if(!box||!inp)return;
  var q=(inp.value||'').trim().toLowerCase();
  var clr=document.getElementById('qa-clear');if(clr)clr.hidden=!q;
  if(!q){box.hidden=true;box.innerHTML='';_qaSel=-1;return;}
  var hits=_qaCatalog().filter(function(x){
    return x.name.toLowerCase().indexOf(q)!==-1||((x.info&&x.info.pri)||[]).join(' ').toLowerCase().indexOf(q)!==-1;
  }).slice(0,6);
  _qaSel=hits.length?0:-1;
  if(!hits.length){
    box.innerHTML='<button type="button" class="qa-row qa-new" onclick="qaAdd('+_q(q)+',true)">'+
      '<span class="qa-n">Add &ldquo;'+_esc(inp.value.trim())+'&rdquo;</span><span class="qa-m">new lift</span></button>';
  }else{
    box.innerHTML=hits.map(function(x,i){
      var m=((x.info&&x.info.pri)||[]).slice(0,2).join(' · ')||'';
      return '<button type="button" class="qa-row'+(i===0?' on':'')+'" role="option" onclick="qaAdd('+_q(x.name)+')">'+
        '<span class="qa-n">'+_esc(x.name)+'</span><span class="qa-m">'+_esc(m)+'</span></button>';
    }).join('');
  }
  box.hidden=false;
}
function _esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function _q(t){return "'"+String(t).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'";}
function qaKey(e){
  var box=document.getElementById('qa-results');
  if(!box||box.hidden)return;
  var rows=box.querySelectorAll('.qa-row');
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    _qaSel=Math.max(0,Math.min(rows.length-1,_qaSel+(e.key==='ArrowDown'?1:-1)));
    rows.forEach(function(r,i){r.classList.toggle('on',i===_qaSel);});
  }else if(e.key==='Enter'){
    e.preventDefault();
    var pick=rows[_qaSel<0?0:_qaSel];if(pick)pick.click();
  }else if(e.key==='Escape'){qaClose();}
}
function qaClose(){
  var inp=document.getElementById('qa-q');if(inp)inp.value='';
  var box=document.getElementById('qa-results');if(box){box.hidden=true;box.innerHTML='';}
  var clr=document.getElementById('qa-clear');if(clr)clr.hidden=true;
  _qaSel=-1;
}
function qaAdd(name,isNew){
  if(!name)return;
  if(isNew)saveCustomExNamed(name);
  var info=EX_DB[name]||(getCustomEx().filter(function(c){return c.name===name;})[0]);
  wExs.push({name:name,muscle:_muscleOf(name,info),sets:[{weight:'',reps:'',rir:null,done:false}],note:''});
  qaClose();
  renderExList();updateSessionHUD();
  var cards=document.querySelectorAll('#ex-list .exi');
  var card=cards[cards.length-1];
  if(card&&card.scrollIntoView)card.scrollIntoView({block:'nearest',behavior:'smooth'});
  if(navigator.vibrate)try{navigator.vibrate(12);}catch(e){}
}
// Map a catalogue entry to one of the app's seven muscle buckets.
function _muscleOf(name,info){
  var pri=((info&&info.pri)||[]).join(' ').toLowerCase();
  var n=(name||'').toLowerCase();
  var hay=pri+' '+n;
  if(/chest|pec/.test(hay))return 'chest';
  if(/lat|back|trap|rhomboid|erector/.test(hay))return 'back';
  if(/quad|glute|hamstring|calf|leg|squat|lunge/.test(hay))return 'legs';
  if(/delt|shoulder|press/.test(hay))return 'shoulders';
  if(/bicep|tricep|forearm|curl/.test(hay))return 'arms';
  if(/ab|core|oblique|plank/.test(hay))return 'core';
  return 'other';
}
function saveCustomExNamed(name){
  try{
    var list=getCustomEx();
    if(!list.some(function(c){return c.name.toLowerCase()===name.toLowerCase();})){
      list.push({name:name,pri:[],sec:[],desc:'',tips:[]});
      setCustomExList(list);
    }
  }catch(e){}
}

/* ── INLINE EXERCISE DEMO ──────────────────── */
var _inlineDemoTimers={};
function _stopInlineDemo(el){if(el&&el._demoTimer){clearInterval(el._demoTimer);el._demoTimer=null;}}
function toggleExDemo(idx,name,btn){
  var el=document.querySelector('.exi [data-ex-demo="'+idx+'"]')||document.querySelectorAll('[data-ex-demo="'+idx+'"]')[0];
  if(!el)return;
  if(el.style.display!=='none'){el.style.display='none';_stopInlineDemo(el);el.innerHTML='';if(btn)btn.classList.remove('on');return;}
  if(btn)btn.classList.add('on');
  el.style.display='block';
  el.innerHTML='<div class="exdemo-skel"></div>';
  _mountInlineDemo(el,name);
}
async function _mountInlineDemo(el,name){
  var id=_findExGif(name);
  if(!id){await _loadExDb();id=_findExGif(name);}
  if(!id){el.innerHTML='<div class="exdemo-fb">Demo not available</div>';return;}
  var base='https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'+encodeURIComponent(id).replace(/%2F/g,'/')+'/';
  el.innerHTML='<div class="exdemo-stage"><img class="exdemo-img" data-f="0" alt="'+name+' demo"><img class="exdemo-img" data-f="1" alt="" style="opacity:0"></div>';
  var img0=el.querySelector('[data-f="0"]'),img1=el.querySelector('[data-f="1"]');
  var l0=false,l1=false,frame=0;
  function startCycle(){_stopInlineDemo(el);el._demoTimer=setInterval(function(){frame=frame?0:1;img0.style.opacity=frame?'0':'1';img1.style.opacity=frame?'1':'0';},520);}
  img0.onload=function(){l0=true;if(l1)startCycle();};
  img1.onload=function(){l1=true;if(l0)startCycle();};
  img0.onerror=function(){el.innerHTML='<div class="exdemo-fb">Demo not available</div>';};
  img0.src=base+'0.jpg';img1.src=base+'1.jpg';
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
  if(btn)btn.textContent=ICO('notebook','13px')+((wExs[i]&&wExs[i].note)?'Edit note':(shown?'Add note':'Hide note'));
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
      var setRows=ex.sets.map(function(s,si){return{id:_genId(),exercise_id:exId,user_id:CU.id,set_number:si+1,weight_kg:s.weight,reps:s.reps,rir:(s.rir===0||s.rir)?s.rir:null};});
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
  setTrainChip(true);
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
      ctx.fillText(s.newPRs.length+' NEW PR'+(s.newPRs.length===1?'':'s')+'!',96,py+28);
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
        try{await navigator.share({files:[file],title:'My workout','text':'Session logged in AthleteOS'});return;}catch(e){if(e&&e.name!=='AbortError')console.warn(e);}
      }
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download='athleteos-'+today()+'.png';document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
      toast('Saved to downloads');
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
/* Report card, not a congratulations screen. Volume leads, deltas say
   whether the session actually moved anything, PRs get their own badges. */
function showWorkoutSummary(s){
  if(!s)return;
  var set=function(id,html){var el=document.getElementById(id);if(el)el.innerHTML=html;};
  var heavy=s.vol>=1000;
  set('sum-date',new Date().toLocaleDateString(undefined,{weekday:'short',day:'2-digit',month:'short'}).toUpperCase());
  set('sum-dur',s.dur+'<small>min</small>');
  set('sum-vol',(heavy?(s.vol/1000).toFixed(1):s.vol.toLocaleString())+'<small>'+(heavy?'t':_wUnit())+'</small>');
  set('sum-sets',s.sets);
  set('sum-kcal',(s.kcal||0)+'<small>kcal</small>');
  _renderSummaryVs(s);

  var prW=document.getElementById('sum-prs'),prL=document.getElementById('sum-prs-list');
  if(prW&&prL){
    if(s.newPRs.length){
      prW.style.display='block';
      prL.innerHTML=s.newPRs.map(function(n){
        return '<div class="rc-pr"><span class="rc-pr-tag">PR</span><span class="rc-pr-t">'+_esc(n)+'</span></div>';
      }).join('');
    }else{prW.style.display='none';}
  }

  set('sum-exs',s.exs.map(function(ex,i){
    var n=(i+1)<10?'0'+(i+1):String(i+1);
    return '<div class="rc-row"><span class="rc-n">'+n+'</span>'+
      '<span class="rc-name">'+_esc(ex.name)+'</span>'+
      '<span class="rc-muscle">'+_esc(ex.muscle)+'</span>'+
      '<span class="rc-sets">'+ex.sets+'&times;</span></div>';
  }).join(''));

  var nw=document.getElementById('sum-note-wrap');
  if(nw){
    if(s.note&&s.note.trim()){nw.style.display='block';set('sum-note',_esc(s.note.trim()));}
    else{nw.style.display='none';}
  }
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
    // A percentage says more than a raw delta, and the volume line gets the
    // spike treatment when the jump is worth calling out.
    var mk=function(label,now,then,unit,spike){
      var d=now-then;
      var pctD=then>0?Math.round((d/then)*100):(now>0?100:0);
      var dir=d>0?'up':d<0?'down':'flat';
      var mark=d>0?'&#9650;':d<0?'&#9660;':'&#8213;';
      var big=spike&&pctD>=15;
      return '<div class="rc-delta'+(big?' spike':'')+'">'+
        '<span class="rc-d-l">'+label+'</span>'+
        '<span class="rc-d-now">'+(unit==='kg'?Math.round(now).toLocaleString():now)+(unit?'<small>'+unit+'</small>':'')+'</span>'+
        '<span class="rc-d-v '+dir+'">'+mark+' '+(d>0?'+':'')+pctD+'%</span>'+
      '</div>';
    };
    rows.innerHTML=
      mk('Volume',s.vol,prevVol,_wUnit(),true)+
      mk('Sets',s.sets,prevSets,'',false)+
      mk('Time',s.dur,prevDur,'min',false);
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
  var sub=n===1?'That is a number you have never hit before.':n+' lifts above anything you had done before.';
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
    +'<div style="font-size:52px;line-height:1;margin-bottom:8px;animation:fadeUp .5s ease both;display:flex;justify-content:center">'+ICO('trophy')+'</div>'
    +'<div style="font-family:Inter,sans-serif;font-weight:900;font-size:24px;letter-spacing:-1px;margin-bottom:4px;line-height:1.15">'+head+'</div>'
    +'<div style="font-size:13.5px;line-height:1.5;opacity:.94;margin-bottom:16px">'+sub+'</div>'
    +'<div style="margin-bottom:14px">'+rows+'</div>'
    +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'
      +'<button type="button" onclick="sharePRImage(\''+(names[0]||'').replace(/\'/g,"\\\\\'")+'\')" style="all:unset;cursor:pointer;background:rgba(255,255,255,.20);color:#FFFFFF;padding:11px 18px;border-radius:999px;font-weight:700;font-size:13.5px;font-family:inherit;display:inline-flex;align-items:center;gap:7px">'+ICO('share','14px')+'Share</button>'
      +'<button type="button" onclick="document.getElementById(\'pr-celebrate\').remove();goTab(\'workout\');setTimeout(function(){var t=document.getElementById(\'pr-list\');if(t)t.scrollIntoView({behavior:\'smooth\',block:\'center\'});},150);" style="all:unset;cursor:pointer;background:rgba(255,255,255,.20);color:#FFFFFF;padding:11px 18px;border-radius:999px;font-weight:700;font-size:13.5px;font-family:inherit">See all PRs</button>'
      +'<button type="button" onclick="document.getElementById(\'pr-celebrate\').remove()" style="all:unset;cursor:pointer;background:#FFFFFF;color:#16A34A;padding:11px 22px;border-radius:999px;font-weight:800;font-size:13.5px;font-family:inherit">Back to it</button>'
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
  c.fillText('PR',540,260);
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
  if(!recentPRs.length){el.innerHTML='<div class="empty-state" style="padding:14px 8px"><div class="empty-ico" style="background:rgba(245,158,11,.12);color:#F59E0B"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14h24v12c0 7-5 12-12 12s-12-5-12-12V14z"/><path d="M20 18H12v4c0 4 3 7 8 8M44 18h8v4c0 4-3 7-8 8"/><path d="M32 38v8M24 52h16l-2-6H26l-2 6z"/></svg></div><div class="empty-h">No PRs yet</div><div class="empty-sub">Finish your first session to set a baseline — every win gets celebrated here.</div><button type="button" class="empty-cta" onclick="goTab(\'workout\')">Start a workout</button></div>';return;}
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
      '<div class="act-ico" style="background:rgba(245,158,11,.16);color:#F59E0B">'+ICO('trophy')+'</div>'+
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
  if(!list.length){el.innerHTML='<div class="empty-state"><div class="empty-ico" style="background:rgba(245,158,11,.12);color:#F59E0B"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14h24v12c0 7-5 12-12 12s-12-5-12-12V14z"/><path d="M20 18H12v4c0 4 3 7 8 8M44 18h8v4c0 4-3 7-8 8"/><path d="M32 38v8M24 52h16l-2-6H26l-2 6z"/></svg></div><div class="empty-h">No personal records yet</div><div class="empty-sub">Log a workout — every top set, rep PR, and estimated 1RM is tracked automatically.</div><button type="button" class="empty-cta" onclick="goTab(\'workout\')">Start a workout</button></div>';return;}
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
    ? '<div class="musc-thumb"><img loading="lazy" src="https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'+gifId+'/0.jpg" onerror="this.style.display=&quot;none&quot;;this.nextElementSibling.style.display=&quot;flex&quot;" alt=""><span class="musc-thumb-fb" style="display:none;font-size:22px;color:var(--t3)">'+ICO('barbell')+'</span></div>'
    : '<div class="musc-thumb"><span class="musc-thumb-fb" style="display:flex;font-size:22px;color:var(--t3)">'+ICO('barbell')+'</span></div>';
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
    return '<div class="wkday"><div class="wkday-lbl">'+d+'</div><div class="'+cls+'">'+(done?ICO('check','13px'):'')+'</div></div>';
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
      ?'<div class="empty-state" style="padding:18px 8px"><div class="empty-ico" style="background:var(--surface-2);font-size:22px;color:var(--t3)">'+ICO('search')+'</div><div class="empty-h">No matches</div><div class="empty-sub">Nothing found for "'+qq.replace(/</g,'&lt;')+'". Try another keyword.</div></div>'
      :'<div class="empty-state"><div class="empty-ico" style="background:var(--adim);color:var(--accent-d)"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="26" width="6" height="12" rx="2"/><rect x="52" y="26" width="6" height="12" rx="2"/><rect x="14" y="22" width="6" height="20" rx="2"/><rect x="44" y="22" width="6" height="20" rx="2"/><path d="M20 32h24"/></svg></div><div class="empty-h">No workouts yet</div><div class="empty-sub">Your history, volume trends, and muscle balance live here once you log a session.</div><button type="button" class="empty-cta" onclick="goTab(\'workout\');startW()">+ Start first workout</button></div>';
    return;
  }
  el.innerHTML=data.slice(0,30).map(function(w){var dur=Math.round(w.duration_seconds/60)||0;var names=(w.exercises||[]).map(function(e){return e.name;}).join(' · ');var kcal=estKcal(w.duration_seconds);var meta=dur+' min'+(kcal>0?' · ~'+kcal+' kcal':'');var noteHtml=w.notes?'<div style="font-size:12.5px;color:var(--t2);margin-top:8px;padding:8px 10px;background:var(--surface);border-radius:8px;font-style:italic;line-height:1.5;display:flex;align-items:flex-start;gap:7px">'+ICO('notebook','14px')+w.notes.replace(/</g,'&lt;')+'</div>':'';return '<div class="exi"><div class="fb"><div style="font-weight:600">'+fdate(w.started_at.split('T')[0])+'</div><span class="tag">'+meta+'</span></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+(names||'No exercises logged')+'</div>'+noteHtml+'</div>';}).join('');
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

/* ── REST TIMER (wall-clock, drift-free) ─── */
var _rSecs=90,_rTotal=90,_rEnd=0,_rInterval=null,_rDone=false,_rLastNotifSec=-1;
function _rLeft(){return _rEnd?Math.max(0,Math.ceil((_rEnd-Date.now())/1000)):_rSecs;}
// Post to the active SW. Prefer .controller, fall back to the ready registration's
// active worker (controller can be null right after first registration).
function _swPost(msg){
  try{
    if(navigator.serviceWorker&&navigator.serviceWorker.controller){navigator.serviceWorker.controller.postMessage(msg);return;}
    if(navigator.serviceWorker&&navigator.serviceWorker.ready){navigator.serviceWorker.ready.then(function(reg){if(reg&&reg.active)reg.active.postMessage(msg);}).catch(function(){});}
  }catch(e){}
}
// Durable server-side backstop. The page/SW timers both die when the OS reaps
// the app with the screen off, so we also park a row in scheduled_pushes that
// rest-push-cron delivers (~60s granularity) if nothing else fired. On normal
// completion (and cancel) we delete the row, so it only ever reaches users
// whose device was actually asleep. All best-effort — never blocks the timer.
async function _schedRestPush(endAt){
  try{
    if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
    if(typeof sb==='undefined'||!sb||typeof CU==='undefined'||!CU||!CU.id)return;
    if(!(await pushIsSubscribed()))return;
    // One pending rest push per user — clear any stale one before parking this.
    await sb.from('scheduled_pushes').delete().eq('user_id',CU.id).eq('tag','rest');
    await sb.from('scheduled_pushes').insert({
      user_id:CU.id,
      fire_at:new Date(endAt).toISOString(),
      title:'Rest complete!',
      body:'Rest is up. Next set.',
      tag:'rest',
      url:'/'
    });
  }catch(e){}
}
async function _cancelRestPush(){
  try{
    if(typeof sb==='undefined'||!sb||typeof CU==='undefined'||!CU||!CU.id)return;
    await sb.from('scheduled_pushes').delete().eq('user_id',CU.id).eq('tag','rest');
  }catch(e){}
}
function openRestGeneric(){_restForExName=null;openRest();}
function openRest(){
  oModal('m-rest');
  var btn=document.getElementById('notif-btn');
  if(btn&&typeof Notification!=='undefined'){
    if(Notification.permission==='granted'){btn.textContent='Notifications On';btn.disabled=true;btn.style.opacity='.5';}
    else{btn.textContent='Allow Notifications';btn.disabled=false;btn.style.opacity='1';}
  }
  var mb=document.getElementById('rest-mute-btn');if(mb)mb.innerHTML=(_rMuted()?ICO('bell','13px')+'Sound off':ICO('bell','13px')+'Sound on');
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
  clearInterval(_rInterval);_rInterval=null;_rDone=false;_rLastTick=-1;_rLastNotifSec=-1;
  _rSecs=s;_rTotal=s;_rEnd=Date.now()+s*1000;
  if(_restForExName)setRestPref(_restForExName,s);
  document.querySelectorAll('.rest-preset').forEach(function(p){p.classList.toggle('on',+p.dataset.s===s);});
  updateRestUI();
  // Request permission, then kick off the SW countdown notification once granted.
  if(typeof Notification!=='undefined'&&Notification.permission==='default'){
    Notification.requestPermission().then(function(p){
      var b=document.getElementById('notif-btn');
      if(p==='granted'){if(b){b.textContent='Notifications On';b.disabled=true;b.style.opacity='.5';}_swPost({type:'REST_START',duration:s,endAt:_rEnd});_schedRestPush(_rEnd);}
    });
  }else if(typeof Notification!=='undefined'&&Notification.permission==='granted'){
    _swPost({type:'REST_START',duration:s,endAt:_rEnd});
    _schedRestPush(_rEnd);
  }
  _rInterval=setInterval(_rTick,250);
}
function _rTick(){
  updateRestUI();
  var left=_rLeft();
  // Refresh the live countdown notification once per whole second. This also
  // wakes the SW, keeping its completion timer alive while the page is running.
  if(left>0&&left!==_rLastNotifSec&&_rEnd&&!_rDone&&typeof Notification!=='undefined'&&Notification.permission==='granted'){
    _rLastNotifSec=left;
    _swPost({type:'REST_TICK',endAt:_rEnd});
  }
  // Soft tick at last 3 seconds (haptics + tiny WebAudio beep).
  if(left>0&&left<=3&&left!==_rLastTick&&!_rMuted()){
    _rLastTick=left;
    try{navigator.vibrate&&navigator.vibrate(35);}catch(e){}
    _restBeep(660,90);
  }
  if(left<=0&&!_rDone){
    _rDone=true;
    clearInterval(_rInterval);_rInterval=null;
    // Replace the ongoing notification with the loud "complete" alert, and drop
    // the server backstop row — the page is alive, so the cron must not re-fire.
    if(typeof Notification!=='undefined'&&Notification.permission==='granted')_swPost({type:'REST_DONE'});
    _cancelRestPush();
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
  if(btn)btn.innerHTML=ICO('bell','13px')+(muted?'Sound on':'Sound off');
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
  clearInterval(_rInterval);_rInterval=null;_rEnd=0;_rDone=false;_rLastNotifSec=-1;
  _swPost({type:'REST_CANCEL'});
  _cancelRestPush();
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
  toast(dur+' min '+act+' logged');
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
    toast('New cardio PR: '+newPRs[0].label);
  }catch(e){console.warn('cardio PR check failed',e);}
}
async function loadCardio(){
  var{data}=await sb.from('cardio_sessions').select('*').eq('user_id',CU.id).order('started_at',{ascending:false}).limit(15);
  cardioLog=data||[];renderCardio();
}
function renderCardio(){
  var el=document.getElementById('cd-list');if(!el)return;
  if(!cardioLog.length){el.innerHTML='<div class="empty-state" style="padding:18px 8px"><div class="empty-ico" style="background:rgba(56,189,248,.12);color:#0EA5E9"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="14" r="5"/><path d="M30 24l8-4 6 6 6 4M30 24l-6 8 8 6v12"/><path d="M38 30l-4 8 8 6M22 50l8-12"/></svg></div><div class="empty-h">No cardio logged yet</div><div class="empty-sub">Track runs, rides, swims — best pace and longest sessions become PRs automatically.</div><button type="button" class="empty-cta" onclick="openCardio()">+ Log cardio</button></div>';return;}
  el.innerHTML=cardioLog.slice(0,8).map(function(c){
    var parts=[c.duration_minutes+' min'];
    if(c.distance_km)parts.push(c.distance_km+' km');
    if(c.calories)parts.push(c.calories+' kcal');
    return '<div class="exi"><div class="fb"><div style="font-weight:600;display:flex;align-items:center;gap:8px">'+ICO('run','15px')+c.activity.charAt(0).toUpperCase()+c.activity.slice(1)+'</div><span class="tag">'+fdate(c.started_at.split('T')[0])+'</span></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+parts.join(' · ')+(c.avg_heart_rate?' · '+c.avg_heart_rate+' bpm':'')+'</div></div>';
  }).join('');
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
  excChart=new Chart(ctx,{type:'line',data:{labels:rows.map(function(r){return r.date.slice(5);}),datasets:[{label:'Top set',data:rows.map(function(r){return r.w;}),borderColor:_sig('--accent'),backgroundColor:'rgba(204,255,0,.07)',borderWidth:2,pointBackgroundColor:_sig('--accent'),pointBorderWidth:0,pointRadius:2.5,tension:.3,fill:true}]},options:{responsive:true,maintainAspectRatio:false,layout:{padding:0},plugins:{legend:{display:false}},scales:_chartAxes()}});
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
    list.unshift(name);toast('Pinned');
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
        return '<div class="expk-row" style="display:flex;align-items:center;justify-content:space-between"><div onclick="pickEx(\''+safe+'\')" style="flex:1;cursor:pointer"><div class="expk-n" style="display:flex;align-items:center;gap:6px">'+ICO('star','13px')+name+'</div><div class="expk-m">'+((info.pri||[]).slice(0,2).join('/')||'pinned')+'</div></div><button type="button" onclick="event.stopPropagation();togglePinEx(\''+safe+'\')" style="background:none;border:none;color:var(--accent);font-size:16px;cursor:pointer;padding:4px 6px" title="Unpin">'+ICO('star','15px')+'</button></div>';
      }).join('')+'<div style="height:8px"></div>';
    }
  }
  if(!matches.length){list.innerHTML=header+pinnedHtml+'<div class="bp bp-sm"><span class="bp-l">No matches</span></div>';return;}
  list.innerHTML=header+pinnedHtml+matches.map(function(x){
    var safe=x.name.replace(/'/g,"\\'");
    var tag=x.custom?' · <span style="color:var(--accent);font-weight:600">custom</span>':'';
    var pinned=isPinned(x.name);
    var pinBtn='<button type="button" onclick="event.stopPropagation();togglePinEx(\''+safe+'\')" style="background:none;border:none;color:'+(pinned?'var(--sig-train)':'var(--t3)')+';font-size:16px;cursor:pointer;padding:4px 6px" title="'+(pinned?'Unpin':'Pin')+'">'+(pinned?ICO('star','14px'):ICO('star','14px'))+'</button>';
    var delBtn=x.custom?'<button type="button" onclick="event.stopPropagation();deleteCustomEx(\''+safe+'\')" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;padding:4px 6px">'+ICO('x','14px')+'</button>':'';
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
  if(!templates.length){el.innerHTML='<div class="empty-state"><div class="empty-ico" style="background:var(--adim);color:var(--accent-d)"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="40" height="44" rx="4"/><path d="M20 22h24M20 32h24M20 42h16"/></svg></div><div class="empty-h">No templates yet</div><div class="empty-sub">Save a workout to reuse it any time — or import one of our pre-built plans.</div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px"><button type="button" class="empty-cta" onclick="cModal(\'m-templates\');openPlanLibrary()">Browse plan library</button><button type="button" class="empty-cta ghost" onclick="cModal(\'m-templates\');goTab(\'workout\')">Build your own</button></div></div>';return;}
  el.innerHTML=templates.map(function(t){
    var exs=t.exercises||[];
    var exNames=exs.map(function(e){return e.name;}).slice(0,4).join(' · ');
    var totalSets=exs.reduce(function(a,e){return a+_tplSetCount(e);},0);
    var safeId=t.id;
    return '<div class="exi"><div class="fb"><div style="font-weight:600">'+t.name+'</div><div style="display:flex;gap:6px"><button type="button" class="btn-g" style="font-size:11px;padding:5px 10px" onclick="loadTemplate(\''+safeId+'\')">Load</button><button type="button" class="btn-g" style="font-size:11px;padding:5px 10px" onclick="shareTemplate(\''+safeId+'\')">'+ICO('share','13px')+'</button><button type="button" class="btn-g" style="font-size:11px;padding:5px 10px;color:var(--red)" onclick="deleteTemplate(\''+safeId+'\')">'+ICO('x','14px')+'</button></div></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+exs.length+' ex · '+totalSets+' sets · '+exNames+'</div></div>';
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
  toast('Imported '+plan.templates.length+' templates');
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
  try{await navigator.clipboard.writeText(url);toast('Invite link copied');if(typeof posthog!=='undefined')posthog.capture&&posthog.capture('invite_shared',{method:'clipboard'});}
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
