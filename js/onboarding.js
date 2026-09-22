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
  _obRenderRail(i);
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
// Sequence index + tick rail. Reads as an instrument, not a loading bar.
function _obRenderRail(i){
  var pos=_obVisibleIndex(i),total=OB_VISIBLE_COUNT;
  var pad=function(n){return (n<10?'0':'')+n;};
  var n=document.getElementById('ob-idx-n');if(n)n.textContent=pad(pos);
  var t=document.getElementById('ob-idx-t');if(t)t.textContent=pad(total);
  var ticks=document.getElementById('ob-ticks');if(!ticks)return;
  if(ticks.children.length!==total){
    var h='';for(var k=0;k<total;k++)h+='<span class="onb-tick"></span>';
    ticks.innerHTML=h;
  }
  Array.prototype.forEach.call(ticks.children,function(el,k){
    el.className='onb-tick'+(k<pos-1?' done':k===pos-1?' now':'');
  });
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
      {ico:ICO('barbell'),c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'1–6 reps, big lifts',b:'Squat, bench, deadlift, overhead press. Compound first, always.'},
      {ico:ICO('timer'),c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Rest 3–5 minutes',b:'Long rests = better lifts. Quality over density.'},
      {ico:ICO('trend'),c:'rgba(168,85,247,.12)',col:'#A855F7',t:'Add weight weekly',b:'Small jumps each session beat occasional huge ones.'},
      {ico:ICO('utensils'),c:'rgba(245,158,11,.12)',col:'#B45309',t:'Eat in surplus',b:'Strength gains demand calories and protein (1.6–2.2 g/kg).'}
    ]},
    muscle:{title:'Your Muscle Blueprint',sub:'Muscle grows across a wide rep range — volume, effort, and protein drive it.',items:[
      {ico:ICO('layers'),c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'6–12 reps, close to failure',b:'Effort matters more than the exact number.'},
      {ico:ICO('timer'),c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Rest 60–120 seconds',b:'Enough recovery to keep sets productive without dragging on.'},
      {ico:ICO('repeat'),c:'rgba(168,85,247,.12)',col:'#A855F7',t:'10+ sets per muscle / week',b:'Total weekly volume is the strongest predictor of growth.'},
      {ico:ICO('utensils'),c:'rgba(245,158,11,.12)',col:'#B45309',t:'1.6–2.2 g/kg protein',b:'Spread across 3–5 meals for steady muscle protein synthesis.'}
    ]},
    lean:{title:'Your Recomp Blueprint',sub:'Build muscle and shed fat at the same time — slow but the most sustainable path.',items:[
      {ico:ICO('scale'),c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'Small deficit, big protein',b:'~200 kcal under maintenance, 2 g/kg protein minimum.'},
      {ico:ICO('barbell'),c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Heavy lifting stays',b:'Lifting heavy signals your body to keep the muscle you have.'},
      {ico:ICO('run'),c:'rgba(168,85,247,.12)',col:'#A855F7',t:'8k–10k steps daily',b:'Daily movement does more for fat loss than extra cardio sessions.'},
      {ico:ICO('moon'),c:'rgba(245,158,11,.12)',col:'#B45309',t:'7+ hours of sleep',b:'Recovery and appetite control depend on it.'}
    ]},
    lose:{title:'Your Fat Loss Blueprint',sub:'A modest deficit, enough protein, and consistent movement beats extreme diets every time.',items:[
      {ico:ICO('scale'),c:'rgba(239,68,68,.12)',col:'#DC2626',t:'300–500 kcal deficit',b:'Aim for ~0.5% bodyweight lost per week.'},
      {ico:ICO('utensils'),c:'rgba(245,158,11,.12)',col:'#B45309',t:'High protein',b:'2 g/kg protects muscle and keeps you full.'},
      {ico:ICO('barbell'),c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Lift 3+ days a week',b:'Keep the muscle you have so the scale loss is fat, not lean tissue.'},
      {ico:ICO('run'),c:'rgba(168,85,247,.12)',col:'#A855F7',t:'Move daily',b:'Walks compound. 8k–12k steps per day is the sweet spot.'}
    ]},
    general:{title:'Your Fitness Blueprint',sub:'The basics done consistently beat any complicated program.',items:[
      {ico:ICO('barbell'),c:'rgba(34,197,94,.12)',col:'#16A34A',t:'Strength 2–3x / week',b:'Squat, hinge, push, pull, carry. Hit every pattern.'},
      {ico:ICO('run'),c:'rgba(59,130,246,.12)',col:'#3B82F6',t:'150 min cardio / week',b:'Mix of moderate (walks, cycling) and a sprinkle of intense.'},
      {ico:ICO('utensils'),c:'rgba(168,85,247,.12)',col:'#A855F7',t:'Eat mostly real food',b:'Protein at every meal, plants on every plate.'},
      {ico:ICO('moon'),c:'rgba(245,158,11,.12)',col:'#B45309',t:'Sleep 7–9 hours',b:'Recovery is when everything actually changes.'}
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
  renderVDM();
  toast('Allocation committed');
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
  if(!total){sum.textContent='Tap Edit to mark what to build, what to cut, and what to leave alone.';return;}
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
  _splashStep('Briefing your coach…',92);
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
    toast('You are in. Go log something.');
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
  toast('You are in. Go log something.');
}
