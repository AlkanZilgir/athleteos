/* onboarding.js — Hapat e para pas regjistrimit dhe harta e muskujve. */
/* ── MAGJISTARI I REGJISTRIMIT ────────────── */
var OB_STEPS=17;
// Shfaqen vetëm pesë ekrane: 2 qëllimi, 4 përvoja dhe ditët javore, 6 të dhënat
// bazë, 13 pesha aktuale dhe e synuar, 15 objektivat ditore. Numrat e tjerë në
// OB_SKIP janë hapa të vjetër që u hoqën; numërimi ruhet që ob_finish dhe
// profilet e vjetra të mos ndryshojnë.
var OB_SKIP={0:1,1:1,3:1,5:1,7:1,8:1,9:1,10:1,11:1,12:1,14:1,16:1};
var OB_VISIBLE_COUNT=(function(){var n=0;for(var i=0;i<OB_STEPS;i++)if(!OB_SKIP[i])n++;return n;})();
function _obFirstVisible(){for(var i=0;i<OB_STEPS;i++)if(!OB_SKIP[i])return i;return 0;}
function _obLastVisible(){for(var i=OB_STEPS-1;i>=0;i--)if(!OB_SKIP[i])return i;return 0;}
function _obVisibleIndex(i){var v=0;for(var k=0;k<=i;k++)if(!OB_SKIP[k])v++;return v;}
var _ob={step:0,gender:'male',units:'metric',motivations:[],main_goal:'muscle',experience:'beginner',prior_tracking:'none',train_style:'solo',follow_plan:'flexible',logging_style:'balanced',weekly_days:3,muscle_grow:[],muscle_define:[],muscle_exclude:[],mm_mode:'grow'};
// Hapat opsionalë (shfaqet "Kalo", lejohet "Vazhdo" pa zgjedhje)
var OB_OPTIONAL_STEPS={};
function ob_gender(g){_ob.gender=g;['male','female'].forEach(function(x){var el=document.getElementById('ob-g-'+x);if(el)el.classList.toggle('on',x===g);});}
function ob_units(u){_ob.units=u;['metric','imperial'].forEach(function(x){var el=document.getElementById('ob-u-'+x);if(el)el.classList.toggle('on',x===u);});var unitLbl=u==='metric'?'kg':'lb';var cwu=document.getElementById('ob-cw-u'),gwu=document.getElementById('ob-gw-u');if(cwu)cwu.textContent=unitLbl;if(gwu)gwu.textContent=unitLbl;}
function ob_pick(key,el){
  var v=el.dataset.v;
  _ob[key]=isNaN(+v)?v:+v;
  el.parentNode.querySelectorAll('.opt-item,.opt-row').forEach(function(o){o.classList.toggle('on',o===el);});
  if(key==='units'){ob_units(v);}
}
function _setOnbEyebrow(){
  // Vendos "Hapi X nga Y" mbi titullin e hapit aktiv.
  var step=document.querySelector('#onb .onb-step.on');
  if(!step)return;
  var old=step.querySelector('.onb-eyebrow');if(old)old.remove();
  if(step.id==='os-0')return; // Hapi i mirëseardhjes ka titullin e vet
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
  // Kapërce automatikisht hapat që nuk shfaqen
  while(OB_SKIP[i]&&i<OB_STEPS-1)i++;
  _ob.step=i;
  for(var k=0;k<OB_STEPS;k++){var s=document.getElementById('os-'+k);if(s)s.classList.toggle('on',k===i&&!OB_SKIP[k]);}
  var fill=document.getElementById('ob-prog');if(fill)fill.style.width=Math.round((_obVisibleIndex(i)/OB_VISIBLE_COUNT)*100)+'%';
  _obRenderRail(i);
  _setOnbEyebrow();
  var back=document.getElementById('ob-back-btn');if(back)back.classList.toggle('hidden',i===_obFirstVisible());
  var lastVis=_obLastVisible();
  var skip=document.getElementById('ob-skip-btn');if(skip)skip.classList.toggle('hidden',!OB_OPTIONAL_STEPS[i]||i===lastVis);
  var next=document.getElementById('ob-next-btn');
  if(next){
    next.textContent=i===lastVis?'Finish setup':'Continue';
    next.onclick=i===lastVis?ob_finish:ob_next;
  }
  // Sinkronizo zgjedhjet dhe vizato përmbajtjen dinamike të hapit
  if(i===2)_obSyncList('ob-goal-list',_ob.main_goal);
  if(i===4){_obSyncList('ob-exp-list',_ob.experience);_obSyncList('ob-week-list',String(_ob.weekly_days));}
  if(i===13){ob_units(_ob.units);setTimeout(ob_renderProjection,30);}
  if(i===15)ob_applyGoalDefaults();
  // Skrollo në krye
  var bw=document.querySelector('.onb-body-wrap');if(bw)bw.scrollTop=0;
}
// Numri i hapit dhe shiriti me segmente.
function _obRenderRail(i){
  var pos=_obVisibleIndex(i),total=OB_VISIBLE_COUNT;
  var pad=function(n){return String(n);};  // 'Hapi 2 nga 5', jo '02 // 05'
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
function ob_next(){var i=_ob.step+1;while(OB_SKIP[i]&&i<OB_STEPS)i++;if(i<OB_STEPS)ob_goto(i);}
function ob_back(){var i=_ob.step-1;while(OB_SKIP[i]&&i>0)i--;if(i>=0)ob_goto(i);}


// Vendos objektiva ditore të arsyeshme sipas qëllimit dhe profilit (hapi 15)
function ob_applyGoalDefaults(){
  var p=document.getElementById('ob-p'),k=document.getElementById('ob-k'),w=document.getElementById('ob-wt');
  if(!p||!k||!w)return;
  if(p.value&&k.value&&w.value)return; // përdoruesi e ka vendosur vetë
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

// Grafiku i vogël i parashikimit të peshës (hapi 14)
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
    // Ende s'ka parashikim për të vizatuar; mos rezervo hapësirë.
    var wpOff=document.getElementById('ob-wp');if(wpOff)wpOff.style.display='none';
    return;
  }
  var wpOn=document.getElementById('ob-wp');if(wpOn)wpOn.style.display='';
  if(goalV)goalV.textContent=gw;
  var loss=cw>gw; // humbje apo shtim
  var diff=Math.abs(cw-gw);
  // Rasti më i mirë ~0.7% e peshës në javë; realist 0.4%
  var bestPerWk=cw*0.007,realPerWk=cw*0.004;
  var bestWks=Math.max(2,Math.ceil(diff/bestPerWk));
  var realWks=Math.max(bestWks+1,Math.ceil(diff/realPerWk));
  var bestMo=Math.max(1,Math.round(bestWks/4.33)),realMo=Math.max(2,Math.round(realWks/4.33));
  if(bestEl)bestEl.textContent=bestMo+(bestMo===1?' month':' months');
  if(realEl)realEl.textContent=realMo+(realMo===1?' month':' months');
  if(rangeEl)rangeEl.textContent=(loss?'Losing ':'Gaining ')+diff.toFixed(1)+' '+unit+' — realistic in '+realMo+' months.';
  // Vizato grafikun
  var canvas=document.getElementById('wp-canvas');if(!canvas)return;
  var dpr=window.devicePixelRatio||1;
  var W=canvas.parentNode.clientWidth,H=canvas.parentNode.clientHeight;
  canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';
  var g=canvas.getContext('2d');g.scale(dpr,dpr);g.clearRect(0,0,W,H);
  // hapësira anësore
  var pl=28,pr=12,pt=12,pb=24;
  var weeks=realWks;var n=weeks+1;
  var ys=[];
  var yMin=Math.min(cw,gw)-1,yMax=Math.max(cw,gw)+1;
  function xOf(i){return pl+(i/(n-1))*(W-pl-pr);}
  function yOf(v){return pt+(1-(v-yMin)/(yMax-yMin))*(H-pt-pb);}
  // Vijat e rrjetit
  g.strokeStyle='rgba(0,0,0,.06)';g.lineWidth=1;
  for(var yy=0;yy<=3;yy++){var yp=pt+yy/3*(H-pt-pb);g.beginPath();g.moveTo(pl,yp);g.lineTo(W-pr,yp);g.stroke();}
  // Vija realiste (e plotë)
  g.strokeStyle='#A855F7';g.lineWidth=2.2;g.beginPath();
  for(var i=0;i<n;i++){var v=cw+(gw-cw)*(i/(n-1));var px=xOf(i),py=yOf(v);if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}
  g.stroke();
  // Trekëndëshi i hijezuar i rastit më të mirë
  var bestN=Math.min(bestWks,weeks)+1;
  g.fillStyle='rgba(168,85,247,.16)';g.beginPath();
  g.moveTo(xOf(0),yOf(cw));
  for(var j=0;j<bestN;j++){var v2=cw+(gw-cw)*(j/(bestN-1));g.lineTo(xOf(j),yOf(v2));}
  g.lineTo(xOf(bestN-1),yOf(cw));g.closePath();g.fill();
  // Vija e ndërprerë e rastit më të mirë
  g.strokeStyle='#A855F7';g.lineWidth=1.5;g.setLineDash([3,3]);g.beginPath();
  for(var k2=0;k2<bestN;k2++){var v3=cw+(gw-cw)*(k2/(bestN-1));var px2=xOf(k2),py2=yOf(v3);if(k2===0)g.moveTo(px2,py2);else g.lineTo(px2,py2);}
  g.stroke();g.setLineDash([]);
  // Pika e fillimit
  g.fillStyle='#A855F7';g.beginPath();g.arc(xOf(0),yOf(cw),5,0,Math.PI*2);g.fill();
  // Etiketat e boshteve
  g.fillStyle='rgba(0,0,0,.45)';g.font='600 10px Inter,system-ui';
  g.fillText('Now',pl,H-6);
  g.textAlign='right';g.fillText(realMo+'mo',W-pr,H-6);
  g.textAlign='left';
}

/* ── NDIHMËS PËR ONBOARDING DHE HARTËN E MUSKUJVE ─ */
function replayOnboarding(){
  // Merr preferencat e ruajtura në _ob që magjistari të pasqyrojë gjendjen aktuale.
  try{
    var pr=JSON.parse(localStorage.getItem('prefs_'+CU.id)||'null');
    if(pr){_ob.main_goal=pr.goal||_ob.main_goal;_ob.experience=pr.experience||_ob.experience;_ob.weekly_days=+pr.weekly||_ob.weekly_days;}
  }catch(e){}
  // Merr preferencat e muskujve nga profili nëse është ngarkuar
  if(P._muscle_grow)_ob.muscle_grow=P._muscle_grow.slice();
  if(P._muscle_define)_ob.muscle_define=P._muscle_define.slice();
  if(P._muscle_exclude)_ob.muscle_exclude=P._muscle_exclude.slice();
  showOnboarding();
}
function openMuscleEditor(){
  // Ngarko hartën aktuale në _ob që mm_render të tregojë gjendjen ekzistuese
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
  toast('Muscle focus saved');
}
function updateMuscleSummary(){
  var el=document.getElementById('set-mm-sub');if(!el)return;
  var n=(P._muscle_grow||[]).length+(P._muscle_define||[]).length+(P._muscle_exclude||[]).length;
  el.textContent=n?(n+' muscle'+(n===1?'':'s')+' targeted'):'Edit your muscle map';
}
function renderBodyMuscleMap(){
  var wrap=document.getElementById('body-mm-wrap');if(!wrap)return;
  var g=P._muscle_grow||[],d=P._muscle_define||[],x=P._muscle_exclude||[];
  // Pamje vetëm për lexim me çipa, nga zgjedhjet e ruajtura në profil.
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

/* ── HARTA E MUSKUJVE ─────────────────────── */
// Listë çipash të grupuara: Pjesa e sipërme / Bërthama / Pjesa e poshtme. Çdo çip ka
// 4 gjendje: asnjë → rrit → përcakto → përjashto, të kontrolluara nga butonat e mënyrës.
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
  // Rikthe hapin
  _ob.step=0;
  ob_goto(0);
  // Mbush vlerat e parazgjedhura
  var ageEl=document.getElementById('ob-age');if(ageEl)ageEl.value=P.age||'';
  var htEl=document.getElementById('ob-ht');if(htEl)htEl.value=P.height||'';
  var cwEl=document.getElementById('ob-cw');if(cwEl)cwEl.value=(P._currentWeight!=null?P._currentWeight:(wtLog&&wtLog.length?wtLog[wtLog.length-1].weight:''));
  var gwEl=document.getElementById('ob-gw');if(gwEl)gwEl.value=G.weight||'';
  ob_gender(P.gender||'male');ob_units(P.units||'metric');
}

function _splashStep(text,pct){var s=document.getElementById('spl-step'),f=document.getElementById('spl-fill');if(s){s.style.opacity='0';setTimeout(function(){s.textContent=text;s.style.opacity='1';},120);}if(f)f.style.width=pct+'%';}
async function ob_finish(){
  var btn=document.getElementById('ob-next-btn');btn.disabled=true;btn.textContent='Saving…';
  // Shfaq ekranin e ngarkimit dhe fshih magjistarin
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
  var rwo=false,rpr=false; // kujtesat aktivizohen më vonë te Cilësimet
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
  document.getElementById('app').style.display='flex';
  toast('You are in. Go log something.');
  btn.disabled=false;btn.textContent='Finish setup';
}
