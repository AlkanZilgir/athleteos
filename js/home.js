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
  if(t==='settings')setTimeout(function(){loadReminderUI();loadAutoRestUI();refreshInstallUI();updateMuscleSummary();renderBiometrics();renderCalibrations();renderVDM();},60);
}

/* HOME DATA VISUALS
   The dashboard reads its state through rings and accent bars rather than
   grey text blocks. Every setter is null-safe so panels can be absent. */
/* Charts follow the theme and drop their furniture: no gridlines, no axis
   borders, mono tick labels. The data is the only thing drawn. */
function _chartAxes(opts){
  opts=opts||{};
  var tick={color:_sig('--t3'),font:{size:9.5,weight:'600',family:'JetBrains Mono, monospace'}};
  return{
    x:{grid:{display:false},border:{display:false},ticks:Object.assign({maxRotation:0,autoSkipPadding:12},tick,opts.x||{})},
    y:Object.assign({grid:{display:false},border:{display:false},ticks:Object.assign({maxTicksLimit:4},tick,opts.yTick||{})},opts.y||{})
  };
}
function _sig(n){try{return getComputedStyle(document.body).getPropertyValue(n).trim()||'#22C55E';}catch(e){return '#22C55E';}}
var RING_LG=295.31, RING_SM=138.23; // circumferences for r=47 and r=22
function setRing(id,pctVal,circ){
  var el=document.getElementById(id);if(!el)return;
  var p=Math.max(0,Math.min(100,+pctVal||0));
  el.style.strokeDashoffset=(circ*(1-p/100)).toFixed(2);
}
function setTrainChip(done){
  var el=document.getElementById('h-w');if(!el)return;
  el.className='chip'+(done?' live':'');
  el.innerHTML='<svg class="ic" aria-hidden="true"><use href="#'+(done?'i-check':'i-barbell')+'"/></svg>'+(done?'Logged':'Not logged');
}
function setHomeDate(){
  var el=document.getElementById('home-date');if(!el)return;
  el.textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
}

/* Inline icon for JS-rendered markup. Mirrors the sprite in index.html. */
function ICO(n,size){return '<svg class="ic"'+(size?' style="font-size:'+size+'"':'')+' aria-hidden="true"><use href="#i-'+n+'"/></svg>';}

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
  setTrainChip(!!woDone);
  if(sleepData){
    document.getElementById('h-s').innerHTML=parseFloat(sleepData.duration_hours).toFixed(1)+'<span class="su">h</span>';
    setSleepRing(parseFloat(sleepData.duration_hours));
  }
  refresh();
}

function refresh(){
  var t=meals.reduce(function(a,m){return{p:a.p+(m.protein||0),c:a.c+(m.carbs||0),f:a.f+(m.fat||0),k:a.k+(m.calories||0)};},{p:0,c:0,f:0,k:0});
  var pp=pct(t.p,G.protein),wp=pct(waterCups,G.water),kp=pct(t.k,G.calories);
  var _set=function(id,html){var el=document.getElementById(id);if(el)el.innerHTML=html;};
  _set('h-wa',(waterCups*0.25).toFixed(1)+'<span class="su">L</span>');
  _set('p-lbl',Math.round(t.p)+'/'+G.protein+'g');
  _set('w-lbl',waterCups+' of '+G.water+' cups');
  _set('k-lbl',Math.round(t.k)+' kcal today');
  _set('k-goal-lbl',Math.round(t.k)+' <small>/ '+G.calories+'</small>');
  _set('ring-kcal-v',Math.round(t.k));
  var pb=document.getElementById('p-bar');if(pb)pb.style.width=pp+'%';
  var kb=document.getElementById('k-bar');if(kb)kb.style.width=kp+'%';
  var wb=document.getElementById('w-bar');if(wb)wb.style.width=wp+'%';
  setRing('ring-kcal',kp,RING_LG);
  var uw=document.getElementById('util-water');if(uw)uw.style.width=Math.min(100,wp)+'%';
  var pRem=Math.max(0,G.protein-Math.round(t.p));
  var re=document.getElementById('p-rem');if(re)re.textContent=pRem>0?pRem+'g to go':'Protein hit.';
  _set('n-p',Math.round(t.p));_set('n-c',Math.round(t.c));_set('n-f',Math.round(t.f));
  // One bar split by each macro's share of the day's calories (4/4/9 kcal per g).
  var kP=t.p*4,kC=t.c*4,kF=t.f*9,kT=kP+kC+kF;
  var seg=function(id,v){var el=document.getElementById(id);if(el)el.style.flex='0 0 '+(kT?(v/kT*100):0)+'%';};
  seg('nb-p',kP);seg('nb-c',kC);seg('nb-f',kF);
  var mt=document.getElementById('nb-empty');if(mt)mt.style.display=kT?'none':'flex';
  document.getElementById('w-cnt').textContent=waterCups+'/'+G.water;
  renderMealLog();
  _paintRepeatMeal();
  if(document.getElementById('p-nutrition').classList.contains('on'))renderMacroPie();
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
        id:'cu_'+r.id,_dbId:r.id,ico:r.icon||ICO('target'),name:r.name,
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
  document.getElementById('cuach-i').value='';
  document.getElementById('cuach-metric').value='workouts';
  document.getElementById('cuach-target').value='';
  oModal('m-cuach');
}
async function saveCustomAch(){
  var name=document.getElementById('cuach-n').value.trim();
  var icon=document.getElementById('cuach-i').value.trim()||'PR';
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
  {id:'first',ico:ICO('target'),name:'First Step',desc:'Log 1 workout',check:function(c){return c.workouts>=1;}},
  {id:'wo10',ico:ICO('star'),name:'Tenth Time',desc:'10 workouts',check:function(c){return c.workouts>=10;}},
  {id:'wo50',ico:ICO('trophy'),name:'Half Century',desc:'50 workouts',check:function(c){return c.workouts>=50;}},
  {id:'wo100',ico:ICO('trophy'),name:'Century Club',desc:'100 workouts',check:function(c){return c.workouts>=100;}},
  {id:'streak3',ico:ICO('flame'),name:'Warming Up',desc:'3-day streak',check:function(c){return c.streak>=3;}},
  {id:'streak7',ico:ICO('zap'),name:'On Fire',desc:'7-day streak',check:function(c){return c.streak>=7;}},
  {id:'streak30',ico:ICO('trend'),name:'Unstoppable',desc:'30-day streak',check:function(c){return c.streak>=30;}},
  {id:'pr60',ico:ICO('layers'),name:'Solid',desc:'PR ≥ 60 kg',check:function(c){return c.maxPR>=60;}},
  {id:'pr100',ico:ICO('barbell'),name:'Triple Digits',desc:'PR ≥ 100 kg',check:function(c){return c.maxPR>=100;}},
  {id:'pr140',ico:ICO('trophy'),name:'Beast',desc:'PR ≥ 140 kg',check:function(c){return c.maxPR>=140;}},
  {id:'sleep7',ico:ICO('moon'),name:'Well-Rested',desc:'7 sleep logs',check:function(c){return c.sleepCount>=7;}},
  {id:'photo1',ico:ICO('camera'),name:'Documented',desc:'1st progress photo',check:function(c){return c.photos>=1;}},
  {id:'meal50',ico:ICO('utensils'),name:'Nutrition Aware',desc:'50 meals logged',check:function(c){return c.meals>=50;}},
  {id:'weight10',ico:ICO('scale'),name:'Tracker',desc:'10 weight logs',check:function(c){return c.weightLogs>=10;}},
  {id:'long90',ico:ICO('timer'),name:'Marathon',desc:'90+ min session',check:function(c){return c.longestMin>=90;}},
  {id:'vol1000',ico:ICO('barbell'),name:'Volume King',desc:'1000 kg in a session',check:function(c){return c.maxVol>=1000;}}
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
    var del=a.custom?'<button type="button" onclick="event.stopPropagation();deleteCustomAch(\''+a._dbId+'\')" style="position:absolute;top:4px;right:4px;background:none;border:none;color:var(--t3);font-size:13px;cursor:pointer;padding:2px 5px;line-height:1" title="Delete">'+ICO('x','13px')+'</button>':'';
    return '<div class="ach '+(got?'on':'off')+'" style="position:relative" title="'+a.desc+'">'+del+'<div class="ach-ico">'+a.ico+'</div><div class="ach-name">'+a.name+'</div><div class="ach-desc">'+a.desc+'</div></div>';
  }).join('');
  if(count)count.textContent=unlocked+'/'+all.length;
}

/* ── HOME DASHBOARD ──────────────────────── */
var heroSparkChart=null;
var COACH_TIPS=[
  {t:'Consistency over intensity',b:'Showing up regularly matters more than going all-out once in a while. Three consistent days a week will outperform six sporadic ones every time.'},
  {t:'6–12 reps, close to failure',b:'Muscle grows across a wide rep range as long as effort is high. Aim for 1–3 reps in reserve on most working sets.'},
  {t:'Aim for 10+ sets per muscle per week',b:'Total weekly volume is the strongest predictor of muscle growth. Spread it across 2–3 sessions per muscle group.'},
  {t:'Eat enough protein',b:'A common evidence-based range is 1.6–2.2 g/kg/day. Spread intake across 3–5 meals for the best results.'},
  {t:'Growth happens on the days off',b:'You do the damage in the gym and the repair in bed. Train seven days straight and you are just accumulating fatigue.'},
  {t:'Beat the number, not the feeling',b:'Overload is arithmetic. One more rep, 2.5 kg more, or one more set than last time. Pick one and take it.'},
  {t:'Log it or it did not happen',b:'A month of half-logged sessions tells you nothing. Log every set, even the throwaway ones, and the trend becomes real.'},
  {t:'Six hours costs you a set',b:'Under seven hours and your top sets drop before you notice. Sleep is the cheapest performance gain on the list.'}
];
// The card boots as a synchronisation skeleton. The first thing that resolves —
// a rotated tip or a computed insight — takes the card over and the skeleton
// goes for good; it is a loading state, not a thing to flash back to.
function _coachResolved(title,body,badge){
  var sync=document.getElementById('coach-sync');
  if(sync){sync.hidden=true;sync.setAttribute('aria-busy','false');}
  var tEl=document.getElementById('coach-title'),bEl=document.getElementById('coach-body');
  if(tEl){tEl.hidden=false;tEl.textContent=title;}
  if(bEl){bEl.hidden=false;bEl.textContent=body;}
  var b=document.getElementById('coach-badge');
  if(b&&badge)b.textContent=badge;
}
function rotateCoachTip(){
  var idx=parseInt(localStorage.getItem('coach_tip_idx')||'-1')+1;
  if(idx>=COACH_TIPS.length)idx=0;
  localStorage.setItem('coach_tip_idx',String(idx));
  var t=COACH_TIPS[idx];
  _coachResolved(t.t,t.b,'Readout');
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
    if(stale[0])insights.push({t:stale[0].name.charAt(0).toUpperCase()+stale[0].name.slice(1)+' is going stale',b:stale[0].days+' days since you trained '+stale[0].name+'. Get one short session in this week before the gap starts costing you.',w:5});
    // Insight 2: streak of PRs
    if(prs.data&&prs.data.length>=2)insights.push({t:'The bar keeps moving',b:prs.data.length+' PRs this month. Small jumps, taken often, is exactly how this is supposed to look. Keep the increments boring.',w:4});
    // Insight 3: sleep average
    if(sleep.data&&sleep.data.length>=3){var avg=sleep.data.reduce(function(a,s){return a+(+s.duration_hours||0);},0)/sleep.data.length;if(avg<6.8)insights.push({t:'Sleep is your ceiling right now',b:avg.toFixed(1)+'h across your last '+sleep.data.length+' nights. Under seven and recovery, appetite and top sets all take the hit. Lights out 30 minutes earlier this week.',w:6});}
    // Insight 4: weight trend
    if(wts.data&&wts.data.length>=4){var sorted=wts.data.slice().sort(function(a,b){return a.logged_date.localeCompare(b.logged_date);});var first=sorted[0].weight_kg,last=sorted[sorted.length-1].weight_kg;var diff=+last-+first;if(Math.abs(diff)>=0.5){var dir=diff>0?'up':'down';insights.push({t:'Weight trending '+dir,b:'You\'re '+Math.abs(diff).toFixed(1)+' kg '+dir+' over your last '+sorted.length+' weigh-ins. '+(diff<0?'Make sure protein stays high so the loss is fat, not muscle.':'Check this matches your goal — recompositioning is slow, bulking should be steady.'),w:3});}}
    // Insight 5: weekly frequency
    var thisWeekStart=new Date();thisWeekStart.setDate(thisWeekStart.getDate()-thisWeekStart.getDay());thisWeekStart.setHours(0,0,0,0);
    var thisWeekCount=(wos.data||[]).filter(function(w){return new Date(w.started_at)>=thisWeekStart;}).length;
    if(thisWeekCount===0&&new Date().getDay()>=4)insights.push({t:'Nothing logged this week',b:'It is '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]+' and the week is empty. Twenty minutes today still counts.',w:7});
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
    return{t:'Start with one set',b:"Forget the perfect first session. Open Train, pick anything, log one set. Day one is done.",w:99};
  if(ageDays<2&&!hasWorkout)
    return{t:'Day two. Fifteen minutes will do',b:'Nobody built anything on one big session. They built it on turning up when it was inconvenient.',w:99};
  if(hasWorkout&&!hasSleep)
    return{t:'Log last night',b:'Sleep next to lifting is where the coaching gets sharp. Two taps on the Sleep tab.',w:98};
  if(hasWorkout&&hasSleep&&ageDays<3)
    return{t:'Most people quit before here',b:'A workout and a night of sleep logged. Hold this rhythm four more days and the weekly trends start meaning something.',w:90};
  return null;
}
function _applyCoachInsight(ins){
  _coachResolved(ins.t,ins.b,'Insight');
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
          '<div style="font-weight:700;font-size:14px;text-transform:capitalize;display:flex;align-items:center;gap:7px">'+ICO('barbell','15px')+topMuscle+' session</div>'+
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
      sections.push('<div style="padding:10px 12px;background:var(--surface);border-radius:12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><div style="font-weight:700;font-size:14px;text-transform:capitalize;display:flex;align-items:center;gap:7px">'+ICO('run','15px')+top.activity+(cList.length>1?' + '+(cList.length-1)+' more':'')+'</div><div style="font-size:12px;color:var(--t2);font-weight:600">'+totalMin+' min</div></div><div style="font-size:12.5px;color:var(--t2);margin-top:3px">'+line+'</div></div>');
    }
    // ── Nutrition + sleep tally
    var miniBits=[];
    if(mList.length){var kcal=mList.reduce(function(a,m){return a+(+m.calories||0);},0);var prot=mList.reduce(function(a,m){return a+(+m.protein_g||0);},0);miniBits.push(ICO('utensils','13px')+mList.length+' meal'+(mList.length===1?'':'s')+' · '+Math.round(kcal)+' kcal · '+Math.round(prot)+'g protein');}
    if(sl.data&&sl.data.duration_hours)miniBits.push(ICO('moon','13px')+sl.data.duration_hours+' h sleep');
    if(miniBits.length)sections.push('<div style="font-size:12.5px;color:var(--t2);padding:6px 4px;display:flex;flex-direction:column;gap:4px">'+miniBits.map(function(x){return '<div style="display:flex;align-items:center;gap:7px">'+x+'</div>';}).join('')+'</div>');
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
  setHomeDate();
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
  var stat=document.getElementById('hero-stat'),statU=document.getElementById('hero-stat-unit');
  if(stat){
    var heavy=totalVol>=1000;
    stat.textContent=heavy?(totalVol/1000).toFixed(1):Math.round(totalVol).toLocaleString();
    if(statU)statU.textContent=heavy?'tonnes':'kg';
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
    data:{labels:labels,datasets:[{data:values,backgroundColor:values.map(function(v){return v>0?_sig('--sig-train-pure'):_sig('--sig-track');}),borderRadius:5,borderSkipped:false,barPercentage:.66,categoryPercentage:.86}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.parsed.y.toLocaleString()+' kg';}}}},scales:{x:{grid:{display:false},ticks:{color:_sig('--t3'),font:{size:9.5,weight:'700'}}},y:{display:false,beginAtZero:true}}}
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
    [['workout',wd],['meal',md],['sleep',sd]].forEach(function(pair){
      var row=document.getElementById('gs-row-'+pair[0]);if(row)row.classList.toggle('done',pair[1]);
      var box=document.getElementById('gs-check-'+pair[0]);
      if(box)box.innerHTML=pair[1]?ICO('check','13px'):'';
    });
    var done=(wd?1:0)+(md?1:0)+(sd?1:0);
    var prog=document.getElementById('gs-progress');if(prog)prog.textContent=done+'/3';
    if(done>=3){
      try{localStorage.setItem('aos_gs_dismissed_'+CU.id,'1');}catch(e){}
      card.classList.add('hidden');
      if(typeof toast==='function')toast('Setup complete');
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
  (wos.data||[]).forEach(function(w){items.push({t:new Date(w.started_at).getTime(),ico:ICO('barbell'),bg:'var(--adim)',col:'var(--sig-train)',title:'Workout · '+Math.round((w.duration_seconds||0)/60)+' min',meta:(w.exercises||[]).slice(0,2).map(function(e){return e.name;}).join(' · ')||'No exercises'});});
  (cds.data||[]).forEach(function(c){items.push({t:new Date(c.started_at).getTime(),ico:ICO('run'),bg:'var(--bdim)',col:'var(--sig-water)',title:c.activity.charAt(0).toUpperCase()+c.activity.slice(1)+' · '+c.duration_minutes+' min',meta:'Cardio session'});});
  (meals_a.data||[]).forEach(function(m){items.push({t:new Date(m.created_at).getTime(),ico:ICO('utensils'),bg:'rgba(245,158,11,.12)',col:'var(--sig-fuel)',title:m.name||'Meal',meta:Math.round(m.calories||0)+' kcal'});});
  (wt_a.data||[]).forEach(function(w){items.push({t:new Date(w.created_at).getTime(),ico:ICO('scale'),bg:'rgba(168,85,247,.10)',col:'var(--sig-sleep)',title:'Weight logged',meta:w.weight_kg+' kg'});});
  (sl_a.data||[]).forEach(function(s){items.push({t:new Date(s.created_at).getTime(),ico:ICO('moon'),bg:'rgba(168,85,247,.10)',col:'var(--sig-sleep)',title:'Sleep logged',meta:parseFloat(s.duration_hours).toFixed(1)+'h'});});
  items.sort(function(a,b){return b.t-a.t;});items=items.slice(0,6);
  if(!items.length){el.innerHTML='<div class="bp"><span class="bp-l">Nothing logged yet</span></div>';return;}
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
  document.getElementById('streak').innerHTML=ICO('flame')+n+'d';
  document.getElementById('sb-streak').innerHTML=ICO('flame')+n+' day run';
  scheduleReminders();
  updateFreezeUI();
  updateRestDayUI();
}
function updateRestDayUI(){
  var btn=document.getElementById('restday-btn');if(!btn)return;
  btn.style.display=(_streakCount>0 && !_streakDoneToday)?'block':'none';
}
async function markRestDay(){
  if(_streakDoneToday){toast('Today is already counted');return;}
  // Use a minimal daily_checkin marker (neutral mood) to preserve the streak.
  var rec={user_id:CU.id,logged_date:today(),mood:3};
  var res=await sbQueueUpsert('daily_checkins',rec,{onConflict:'user_id,logged_date'});
  if(res.queued&&!navigator.onLine)toast('Saved offline. It syncs when you reconnect.');
  else toast('Rest day logged. Streak holds.');
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
  toast('Streak frozen for today');
  await calcStreak();
}

/* ── GOALS MODAL ──────────────────────────── */
// The editors are sections on the profile page now, so "open" means bring the
// section into view. Callers elsewhere in the app keep working unchanged.
function _revealSection(id,focusSel){
  if(!document.getElementById('p-settings').classList.contains('on'))goTab('settings');
  setTimeout(function(){
    var el=document.getElementById(id);if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'start'});
    el.classList.remove('sec-flash');void el.offsetWidth;el.classList.add('sec-flash');
    if(focusSel){var f=el.querySelector(focusSel);if(f)setTimeout(function(){f.focus();},380);}
  },90);
}
function renderBiometrics(){
  if(!CU)return;
  var n=CU._name||(CU.user_metadata&&CU.user_metadata.name)||(CU.email||'').split('@')[0];
  var set=function(id,v){var e=document.getElementById(id);if(e)e.value=v;};
  set('pf-name',n||'');set('pf-age',P.age||'');set('pf-ht',P.height||'');
  _selGender=P.gender||'male';_selUnits=P.units||'metric';
  ['male','female'].forEach(function(g){var e=document.getElementById('gpill-'+g);if(e)e.classList.toggle('on',g===_selGender);});
  ['metric','imperial'].forEach(function(u){var e=document.getElementById('gpill-'+u);if(e)e.classList.toggle('on',u===_selUnits);});
  var hl=document.getElementById('ht-lbl');
  if(hl)hl.textContent=_selUnits==='metric'?'Height (cm)':'Height (in)';
  var t=document.getElementById('bio-state');
  if(t){t.textContent='Synced';t.classList.remove('warn');}
}
function openGoalsM(){renderCalibrations();_revealSection('sec-calibrations');}
function openProfileM(){_revealSection('sec-biometrics','input');}

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
  ckin=rec;cModal('m-checkin');renderCheckin();toast('Saved');
  await sbQueueUpsert('daily_checkins',rec,{onConflict:'user_id,logged_date'});
}
async function loadCheckin(){
  var{data}=await sb.from('daily_checkins').select('*').eq('user_id',CU.id).eq('logged_date',today()).maybeSingle();
  ckin=data;renderCheckin();
}
function renderCheckin(){
  var el=document.getElementById('ckin-disp'),btn=document.getElementById('ckin-btn');
  if(!el)return;
  if(!ckin){el.innerHTML='Mood, energy, soreness. Ten seconds, and your coach stops guessing how you feel.';if(btn)btn.textContent='+ Log';return;}
  var em={mood:['Rough','Off','Fine','Good','Great'],energy:['Empty','Low','OK','Charged','Wired'],soreness:['Fresh','Light','Achy','Sore','Wrecked']};
  var parts=[];
  if(ckin.mood)parts.push('Mood '+em.mood[ckin.mood-1]);
  if(ckin.energy)parts.push('Energy '+em.energy[ckin.energy-1]);
  if(ckin.soreness)parts.push('Soreness '+em.soreness[ckin.soreness-1]);
  el.innerHTML='<div style="font-family:var(--font-display);font-size:17px;letter-spacing:.4px;text-transform:uppercase;color:var(--t)">'+parts.join('  ·  ')+'</div>';
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
      }).join(''):'<div class="bp bp-sm"><span class="bp-l">No exercises</span></div>';
      html+='<div class="card" style="background:var(--card2);margin-bottom:10px"><div class="fb" style="margin-bottom:10px"><div style="font-weight:600;display:flex;align-items:center;gap:8px">'+ICO('barbell','15px')+time+'</div><span class="tag">'+dur+' min</span></div>'+exHtml+'</div>';
    });
  }
  // Cardio
  if(cds&&cds.length){
    html+='<div class="ctitle" style="margin:14px 0 8px">Cardio</div>';
    cds.forEach(function(c){
      var parts=[c.duration_minutes+' min'];
      if(c.distance_km)parts.push(c.distance_km+' km');
      if(c.calories)parts.push(c.calories+' kcal');
      if(c.avg_heart_rate)parts.push(c.avg_heart_rate+' bpm');
      html+='<div class="exi"><div class="fb"><div style="font-weight:600;display:flex;align-items:center;gap:8px">'+ICO('run','15px')+c.activity.charAt(0).toUpperCase()+c.activity.slice(1)+'</div></div><div style="font-size:12.5px;color:var(--t2);margin-top:5px">'+parts.join(' · ')+'</div></div>';
    });
  }
  // Recovery
  var rec=[];
  if(sl)rec.push(ICO('moon','14px')+'Sleep: <b>'+parseFloat(sl.duration_hours).toFixed(1)+'h</b> · '+sl.bedtime+' → '+sl.wake_time);
  if(wt&&wt.length)rec.push(ICO('scale','14px')+'Weight: <b>'+wt[0].weight_kg+' kg</b>');
  if(ck){var em={mood:['Rough','Off','Fine','Good','Great'],energy:['Empty','Low','OK','Charged','Wired'],soreness:['Fresh','Light','Achy','Sore','Wrecked']};var p=[];if(ck.mood)p.push('Mood '+em.mood[ck.mood-1]);if(ck.energy)p.push('Energy '+em.energy[ck.energy-1]);if(ck.soreness)p.push('Soreness '+em.soreness[ck.soreness-1]);if(p.length)rec.push(ICO('check','14px')+'Check-in: '+p.join(' · '));}
  if(rec.length){
    html+='<div class="ctitle" style="margin:14px 0 8px">Recovery</div><div class="card" style="background:var(--card2);font-size:13px;line-height:2">'+rec.join('<br>')+'</div>';
  }
  // Nutrition
  if((ml&&ml.length)||(wa&&wa.cups)){
    var tot=(ml||[]).reduce(function(a,m){return{p:a.p+(+m.protein_g||0),c:a.c+(+m.carbs_g||0),f:a.f+(+m.fat_g||0),k:a.k+(+m.calories||0)};},{p:0,c:0,f:0,k:0});
    html+='<div class="ctitle" style="margin:14px 0 8px">Nutrition</div><div class="card" style="background:var(--card2);font-size:13px;line-height:2">';
    if(ml&&ml.length)html+=ICO('utensils','14px')+ml.length+' meals · <b>'+Math.round(tot.p)+'g P · '+Math.round(tot.c)+'g C · '+Math.round(tot.f)+'g F · '+Math.round(tot.k)+' kcal</b>';
    if(wa&&wa.cups)html+='<br>'+ICO('droplet','14px')+wa.cups+' cups water';
    html+='</div>';
  }
  if(!html)html='<div class="bp"><span class="bp-l">Rest day</span></div>';
  document.getElementById('day-body').innerHTML=html;
}
