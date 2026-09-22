/* ── TRAINING PLAN ────────────────────────── */
function renderPlan(){
  var sec=document.getElementById('plan-sec');
  if(!sec)return;
  if(!AI_PLAN||!AI_PLAN.days||!AI_PLAN.days.length){
    sec.innerHTML='<div class="card" style="margin-bottom:10px"><div class="fb" style="margin-bottom:10px"><div class="ctitle" style="margin:0">Your Plan</div></div><div style="text-align:center;padding:10px 0 4px"><p class="tm" style="margin-bottom:16px;line-height:1.75">Tell your coach your goal and the days you can train. You get a week back, built to your numbers.</p><button type="button" class="btn-o" style="width:100%" onclick="startPlanChat()">Build my week</button></div></div>';
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
  // meta.rationale is generated per block; showing it is the difference
  // between a schedule and a programming decision the athlete can read.
  var why=AI_PLAN.rationale?'<p class="plan-why">'+_esc(AI_PLAN.rationale)+'</p>':'';
  sec.innerHTML='<div class="card" style="margin-bottom:10px"><div class="fb" style="margin-bottom:12px"><div class="ctitle" style="margin:0">'+(AI_PLAN.name||'Training Plan')+'</div><button type="button" class="btn-g" onclick="clearPlan()">Change</button></div>'+why+'<div class="plan-days">'+daysHtml+'</div><div><div style="font-size:13px;font-weight:600;color:var(--t);margin-bottom:6px">'+(sel.name||'Rest')+focusStr+'</div>'+sessHtml+'</div></div>';
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
/* ── PLAN PAYLOAD ────────────────────────────
   The engine emits {action, meta:{block_name, rationale}, days:[{day_number,
   focus, exercises}]}. The renderer wants {name, days:[{day, name, focus,
   exercises, rest}]} and plans persisted by earlier builds are already in that
   older shape, so everything funnels through one normaliser rather than
   teaching the renderer two vocabularies. */
var _PLAN_DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// [PLAN]…[/PLAN] is the contract, but a dropped delimiter should not cost the
// user their block: fall back to the first balanced object carrying "days".
function _parsePlanPayload(text){
  var m=text.match(/\[PLAN\]([\s\S]*?)\[\/PLAN\]/);
  if(m){
    try{return{plan:JSON.parse(m[1].trim()),raw:m[0]};}catch(e){}
  }
  var i=text.indexOf('{');
  while(i!==-1){
    var depth=0,inStr=false,esc=false;
    for(var j=i;j<text.length;j++){
      var c=text[j];
      if(esc){esc=false;continue;}
      if(c==='\\'){esc=true;continue;}
      if(c==='"'){inStr=!inStr;continue;}
      if(inStr)continue;
      if(c==='{')depth++;
      else if(c==='}'){
        depth--;
        if(depth===0){
          var slice=text.slice(i,j+1);
          try{
            var o=JSON.parse(slice);
            if(o&&Array.isArray(o.days)&&o.days.length)return{plan:o,raw:slice};
          }catch(e){}
          break;
        }
      }
    }
    i=text.indexOf('{',i+1);
  }
  return null;
}

function _normalizePlan(raw){
  if(!raw||!Array.isArray(raw.days)||!raw.days.length)return null;
  var meta=raw.meta||{};
  var days=raw.days.map(function(d,i){
    // day_number is 1-7 Monday-first; fall back to position, then to any
    // weekday name an older payload already carried.
    var n=parseInt(d.day_number,10);
    var name=(!isNaN(n)&&n>=1&&n<=7)?_PLAN_DAYS[n-1]:(d.day||_PLAN_DAYS[i%7]);
    var ex=Array.isArray(d.exercises)?d.exercises:[];
    var isRest=d.rest===true||ex.length===0;
    var label=d.focus||d.name||(isRest?'Rest':'Train');
    return{day:name,name:label,focus:d.focus||d.name||'',exercises:ex,rest:isRest};
  });
  return{
    name:meta.block_name||raw.name||'Training block',
    rationale:meta.rationale||raw.rationale||'',
    action:raw.action||'CREATE_TEMPLATE',
    days:days
  };
}

function applyPlan(plan){AI_PLAN=plan;planDayIdx=0;localStorage.setItem('athleteos_plan_'+CU.id,JSON.stringify(plan));renderPlan();toast('Plan saved — check the Train tab!');}

/* ── ENGINE CALIBRATIONS ─────────────────────
   Four targets, each as a meter against today's actual. The input carries the
   id the rest of the app already writes to (applyMacros fills g-p and g-k), so
   moving the field out of the sheet changed where it lives, not what owns it. */
function _calPct(a,b){if(!b)return 0;return Math.max(0,Math.min(100,(a/b)*100));}
function renderCalibrations(){
  var box=document.getElementById('cal-rows');if(!box)return;
  var kcal=0,prot=0;
  (meals||[]).forEach(function(m){kcal+=(+m.calories||0);prot+=(+m.protein||0);});
  var wNow=(wtLog&&wtLog.length)?+wtLog[wtLog.length-1].weight:0;
  var rows=[
    {id:'g-p',  l:'Protein',  u:'g/day',   v:G.protein,  now:Math.round(prot), hue:'var(--sig-train)', step:'5'},
    {id:'g-k',  l:'Calories', u:'kcal/day',v:G.calories, now:Math.round(kcal), hue:'var(--sig-fuel)',  step:'50'},
    {id:'g-wtr',l:'Water',    u:'cups/day',v:G.water,    now:waterCups||0,     hue:'var(--sig-water)', step:'1'},
    {id:'g-w',  l:'Bodyweight',u:'kg target',v:G.weight, now:wNow,             hue:'var(--sig-sleep)', step:'0.5'}
  ];
  box.innerHTML=rows.map(function(r){
    // Bodyweight is a target to converge on, not a quantity to accumulate, so
    // it reports proximity rather than a fill.
    var isW=r.id==='g-w';
    var pct=isW?(r.now?Math.max(0,100-Math.min(100,Math.abs(r.now-r.v)/Math.max(r.v,1)*100*4)):0):_calPct(r.now,r.v);
    var actual=isW?(r.now?r.now+' kg now':'no weight logged'):(r.now+' today');
    return '<div class="cal-row">'+
      '<div class="cal-head"><span class="cal-l">'+r.l+'</span>'+
        '<span class="cal-now">'+_esc(actual)+'</span></div>'+
      '<div class="cal-set">'+
        '<input type="number" id="'+r.id+'" step="'+r.step+'" value="'+r.v+'" oninput="_calDirty()" aria-label="'+r.l+' target">'+
        '<span class="cal-u">'+r.u+'</span></div>'+
      '<div class="meter"><div class="meter-fill" style="width:'+pct.toFixed(0)+'%;--meter-hue:'+r.hue+'"></div></div>'+
    '</div>';
  }).join('');
}
function _calDirty(){var t=document.getElementById('bio-state');if(t){}}
function _bioDirty(){
  var t=document.getElementById('bio-state');
  if(t){t.textContent='Uncommitted';t.classList.add('warn');}
}

/* ── VOLUME DISTRIBUTION MATRIX ──────────────
   The muscle map read as an allocation table. grow/def/exc are the stored
   states; Build / Maintenance / Cut is what they mean to the athlete. */
var VDM_STATE={grow:{k:'build',l:'Build'},def:{k:'maintain',l:'Maintenance'},exc:{k:'cut',l:'Cut'}};
function renderVDM(){
  var box=document.getElementById('vdm-list');if(!box)return;
  var html=MM_GROUPS.map(function(g){
    var rows=g.keys.map(function(k){
      var st=_mmStateOf(k);
      var m=VDM_STATE[st];
      var cls='vdm-row'+(m?' '+m.k:'');
      var tag=m?m.l:'Unassigned';
      return '<div class="'+cls+'"><span class="vdm-n">'+_esc(MM_LABELS[k]||k)+'</span>'+
        '<span class="vdm-s">'+tag+'</span></div>';
    }).join('');
    return '<div class="vdm-g"><div class="vdm-gh">'+_esc(g.h)+'</div>'+rows+'</div>';
  }).join('');
  box.innerHTML=html;
}
async function saveGoals(){
  var _v=function(id){var e=document.getElementById(id);return e?e.value:'';};
  G.protein=parseInt(_v('g-p'))||G.protein;
  G.weight=parseFloat(_v('g-w'))||G.weight;
  G.water=parseInt(_v('g-wtr'))||G.water;
  G.calories=parseInt(_v('g-k'))||G.calories;
  initWGrid();refresh();
  var bgw=document.getElementById('b-gw');
  if(bgw)bgw.innerHTML=G.weight+'<span class="su">kg</span>';
  renderCalibrations();
  toast('Calibrations committed');
  await sb.from('profiles').update({protein_goal:G.protein,weight_goal:G.weight,water_goal:G.water,calorie_goal:G.calories}).eq('id',CU.id);
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
    toast(wExs[idx].name+': '+(p.w>0?p.w+' kg × '+p.r:p.r+' reps'));
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
  // Two outputs, one request. The markdown grid is what the athlete reads;
  // the [PLAN] payload is what the Train tab consumes and is stripped from
  // the card before render. Dropping either one breaks half the feature.
  var planInstr=
    'ROUTINE GENERATION (non-negotiable)\n'+
    'A request to create, build, generate, modify or adjust a routine, program, block or split '+
    'is an execution call. Bypass conversational text entirely. Never write "here is your plan" '+
    'or offer to adjust it afterwards.\n\n'+

    'Line 1 is the configuration acknowledgment, in this exact blueprint:\n'+
    'SYSTEM DATA CONFIGURATION: Calibrating [X]-Day [Split Type] Block against equipment '+
    'allocation and 1RM history.\n\n'+

    'Then the session grid as a markdown table, one row per training day. Required columns:\n'+
    '| Day | Focus | Primary Lift | Sets x Reps | Target RPE | Rest | Tempo |\n'+
    'Tempo in four-digit eccentric-pause-concentric-pause notation, e.g. 3010. Rest in seconds. '+
    'Target RPE as a number or a range.\n\n'+

    'Then a second markdown table headed Volume Progression, one row per week of the block:\n'+
    '| Week | Load | Weekly Sets | Notes |\n'+
    'Load as a percentage of the top set or an absolute figure. Progression must respect the '+
    '2-4 percent per week linear band unless the athlete data justifies otherwise, and must '+
    'schedule a deload when accumulated volume warrants it.\n\n'+

    'Then, last, the machine payload wrapped in [PLAN] and [/PLAN]. It is stripped before '+
    'display; the athlete never sees it, so it never substitutes for the grids above:\n'+
    '{"action":"CREATE_TEMPLATE",'+
    '"meta":{"block_name":"4-Day Hypertrophy Split",'+
    '"rationale":"Volume allocation balanced against progressive fatigue scaling across a 4-day availability window."},'+
    '"days":[{"day_number":1,"focus":"Upper Push",'+
    '"exercises":[{"name":"Bench Press","sets":4,"reps":"6-8","rest":"120s"}]},'+
    '{"day_number":2,"focus":"Rest","rest":true}]}\n'+
    'Payload rules: action CREATE_TEMPLATE for a new block, UPDATE_TEMPLATE for an adjustment. '+
    'day_number 1-7 Monday-first, all seven present, no gaps or duplicates. Rest days carry '+
    '"rest":true and no exercises array. Sets 2-5. Reps as a range. Real movements only, matched '+
    'to the equipment on file.\n\n'+

    'A meal plan follows the same law: the configuration line, a markdown table '+
    '(| Meal | Protein | Carbs | Fat | kcal |) with the daily total as the last row, then one '+
    '[ACTION]addMeal[/ACTION] block per meal so each lands in the log through the approval card. '+
    'Never paste a menu as prose.';

  var safetyInstr='SAFETY RULES (non-negotiable):\n'+
    '- You are NOT a doctor, physiotherapist, dietitian, or licensed medical professional. Do not diagnose, prescribe, or claim to treat conditions.\n'+
    '- If a user describes pain, injury symptoms, dizziness, chest discomfort, bleeding, mental-health crisis, eating disorder behaviour, or anything that sounds medically serious — refuse to give specific advice and direct them to a qualified professional (GP, A&E, or local mental-health line). Phrase it as care, not refusal: "This needs a real clinician, not me — please see your GP / call 999 / call 116 123 (UK Samaritans)."\n'+
    '- For pregnancy, recovery from surgery, chronic conditions (heart, diabetes, thyroid, etc.), or anyone under 16: always recommend they check with their doctor first.\n'+
    '- Do not give exact medication, supplement-stacking, or dosing advice. General nutrition info (e.g. "protein around 1.6g/kg") is fine; specific drug regimens are not.\n'+
    '- Do not encourage extreme deficits, excessive cardio, or weight-loss rates exceeding 1% body weight per week. If the user asks for that, push back kindly.\n'+
    '- Never confirm an action you did not actually take — if you emitted an [ACTION] block, the user still has to approve it.\n';
  // ── ENGINE PERSONA ───────────────────────────────────────────────
  // A backend data-processing layer, not a correspondent. Every rule here
  // exists to strip a specific assistant tell; the arithmetic rule is the
  // load-bearing one — an unquantified recommendation is an opinion.
  var persona=
    'You are the data-processing engine of AthleteOS. You are not a chatbot, assistant, or '+
    'companion. You output as a clinical sports scientist and performance engineer: zero '+
    'emotion, zero filler, quantified throughout.\n\n'+

    'REGISTER\n'+
    '- No welcome, no transition phrases, no closing offers of further help, no emoji.\n'+
    '- Strict working vocabulary: progressive overload, volume allocation, RPE, top set, '+
    'back-off set, tempo, deload, mesocycle, macro distribution, tonnage, estimated 1RM, '+
    'recovery load, energy balance.\n'+
    '- State positions as findings. If the programming has a defect, name the defect and the '+
    'correction.\n\n'+

    'ARITHMETIC IS MANDATORY\n'+
    '- Every recommendation is grounded in a calculation, a measured value, or a named formula. '+
    'Show the arithmetic inline.\n'+
    '- Use the standard instruments: Mifflin-St Jeor for BMR, activity multipliers for TDEE, '+
    'Epley or Brzycki for estimated 1RM, 2-4 percent load progression per week for linear '+
    'overload, 10-20 working sets per muscle per week as the hypertrophy volume band, '+
    '1.6-2.2 g/kg bodyweight for protein.\n'+
    '- Never state a figure you were not given and cannot derive. An unknown is reported as '+
    'unknown, with the one input required to resolve it.\n\n'+

    'OUTPUT SHAPE\n'+
    '- Under three sentences of prose. Ever.\n'+
    '- Values go in a scannable layout, not in sentences. A markdown table for anything with '+
    'two or more columns; a bulleted diagnostic log for findings.\n'+
    '- Lead with the finding. First clause carries the conclusion.\n'+
    '- Never restate the question.\n\n'+

    'BANNED OPENERS\n'+
    '- "Sure", "Absolutely", "Of course", "Great question", "Happy to help", "Let me", "Here is".\n'+
    '- Any warm-up praise. Earned praise is one clause, mid-report, never first.\n\n'+

    'DATA HANDLING\n'+
    '- Their numbers are in front of you. Never say "according to your data" or "your logs show". '+
    'State the figure: "82.5 x 5 Tuesday, third session at that load, e1RM 92.8 by Epley".\n'+
    '- Never identify as an AI, a model, or a language model, and never apologise for being one.\n'+
    '- No moralising about food, bodyweight, or missed sessions. Objective is not hostile.\n';

  var sys=persona+'\n'+safetyInstr+'\nWHAT YOU KNOW ABOUT THEM:\n'+buildCtx()+'\n\n'+planInstr+'\n\n'+actInstr;
  // Retry with exponential backoff + per-attempt timeout. The engine runs
  // behind a Supabase edge function so the API key never reaches the browser;
  // adaptive thinking means a considered answer can take 10-20s, so each
  // attempt gets 45s and a cold function start is not mistaken for a failure.
  var reply=null,lastErr=null,lastStatus=0;
  var session=null;
  try{var sres=await sb.auth.getSession();session=sres&&sres.data&&sres.data.session;}catch(e){}
  if(!session){
    tdiv.remove();
    addMsg('a','Session expired. Sign in again and re-issue the command.');
    return;
  }
  var payload=JSON.stringify({system:sys,messages:chatH.slice(-12)});
  for(var attempt=0;attempt<3;attempt++){
    var ctrl=null,timer=null;
    try{
      ctrl=new AbortController();
      timer=setTimeout(function(){try{ctrl.abort();}catch(e){}},45000);
      var res=await fetch(SUPA_URL+'/functions/v1/coach',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':SUPA_KEY},
        body:payload,signal:ctrl.signal});
      lastStatus=res.status;
      var j=null;try{j=await res.json();}catch(e){}
      if(res.ok&&j&&j.text){reply=j.text.trim();break;}
      lastErr=(j&&j.error)||('HTTP '+res.status);
      // 4xx other than rate-limit will not improve on a retry.
      if(res.status>=400&&res.status<500&&res.status!==429)break;
    }catch(e){lastErr=(e&&e.name==='AbortError')?'timeout':((e&&e.message)||'network');}
    finally{if(timer)clearTimeout(timer);}
    if(attempt<2)await new Promise(function(r){setTimeout(r,700*Math.pow(2,attempt)+Math.random()*300);});
  }
  tdiv.remove();
  if(reply){
    addMsg('a',reply);chatH.push({role:'assistant',content:reply});
  }else{
    // Each failure has a different answer, so each gets its own line rather
    // than one "unreachable" that sends people to check their connection.
    var help;
    if(!navigator.onLine){
      help='Offline. The engine needs a connection; logging still works locally.';
    }else if(lastErr==='engine_not_configured'){
      help='Engine offline: no model key is configured on the server. Set GEMINI_API_KEY in the Supabase function secrets — the function reads it per request, so no redeploy is needed.';
    }else if(lastErr==='engine_key_rejected'){
      help='Engine offline: the configured model key was rejected. Check GEMINI_API_KEY in the Supabase function secrets.';
    }else if(lastErr==='refused'){
      help='That request was declined by the model safety layer. Rephrase it, or ask a clinician if it concerns pain, injury or medication.';
    }else if(lastStatus===429||lastErr==='rate_limited'){
      help='Rate limited. Wait a moment and re-issue the command.';
    }else if(lastStatus===401||lastStatus===403){
      help='Session rejected. Sign out and back in, then re-issue the command.';
    }else if(lastErr==='payload_too_large'){
      help='This conversation is too long to send. Reset the session and re-issue the command.';
    }else{
      help='No output returned. Re-issue the command; your logs are untouched.';
    }
    addMsg('a',help);
    if(window.Sentry)Sentry.captureMessage('Coach engine failed: '+lastErr,{level:'warning'});
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
    var parsed=_parsePlanPayload(text);
    if(parsed){
      var plan=_normalizePlan(parsed.plan);
      if(plan){
        applyPlan(plan);
        text=text.split(parsed.raw).join('').trim();
        // The confirmation sentence is the model's job. If it omitted one,
        // state the result rather than leaving an empty card.
        if(!text){
          var td=plan.days.filter(function(d){return !d.rest;}).length;
          text=plan.name+' compiled. '+td+' training day'+(td===1?'':'s')+'. Open Train to run it.';
        }
      }
    }
    var acts=[];
    text=text.replace(/\[ACTION\]([\s\S]*?)\[\/ACTION\]/g,function(_,j){
      try{var a=JSON.parse(j.trim());if(a&&a.type)acts.push(a);}catch(e){}
      return '';
    }).trim();
    if(acts.length)pendingActs=acts;
    if(!text&&pendingActs)text='Want me to run '+(pendingActs.length===1?'this':'these')+'?';
  }
  var el=document.getElementById('chat-msgs');
  var d=document.createElement('div');
  if(role==='a'){
    // Engine output is a data card, not a speech bubble: a labelled header
    // rule, then the body. The body keeps pre-wrap so aligned value lines
    // from the model survive.
    d.className='eng-out fu';
    var h=document.createElement('div');h.className='eng-out-h';
    h.innerHTML='<svg class="eng-out-ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-activity"/></svg>Output'+
      '<span class="eng-out-ts">'+_engStamp()+'</span>';
    var bd=document.createElement('div');bd.className='eng-out-b';
    _renderEngineBody(bd,text||'');
    d.appendChild(h);d.appendChild(bd);
  }else{
    d.className='eng-cmd fu';
    d.innerHTML='<span class="eng-cmd-k" aria-hidden="true">\u25b8</span>';
    var t=document.createElement('span');t.className='eng-cmd-t';t.textContent=text||'';
    d.appendChild(t);
  }
  el.appendChild(d);
  if(pendingActs)addActionCard(pendingActs);
  el.scrollTop=el.scrollHeight;
  return d;
}

/* ── AI ACTIONS ──────────────────────────── */
var _actSeq=0,_actMap={};
function _actLabel(a){
  var t=a.type,x=a.args||{};
  if(t==='addMeal')return ICO('utensils','14px')+'Log meal: <b>'+(x.name||'Meal')+'</b> · '+(x.protein||0)+'p / '+(x.carbs||0)+'c / '+(x.fat||0)+'f · '+(x.calories||0)+'kcal';
  if(t==='logWater')return ICO('droplet','14px')+'Set water to <b>'+(x.cups||0)+' cups</b>';
  if(t==='logSleep')return ICO('moon','14px')+'Log sleep: <b>'+(x.bedtime||'?')+' → '+(x.wake_time||'?')+'</b> ('+(x.quality||'good')+')';
  if(t==='logWeight')return ICO('scale','14px')+'Log weight: <b>'+(x.kg||x.weight||'?')+' kg</b>';
  if(t==='setBodyStats'){var p=[];if(x.gender)p.push(x.gender);if(x.age)p.push(x.age+'y');if(x.height_cm||x.height)p.push((x.height_cm||x.height)+'cm');if(x.units)p.push(x.units);return ICO('user','14px')+'Update profile: <b>'+p.join(' · ')+'</b>';}
  if(t==='setGoals'){var p=[];if(x.protein)p.push(x.protein+'g protein');if(x.weight)p.push(x.weight+'kg weight');if(x.water)p.push(x.water+' cups water');if(x.calories)p.push(x.calories+' kcal');return ICO('target','14px')+'Update goals: <b>'+p.join(' · ')+'</b>';}
  if(t==='startWorkout')return ICO('barbell','14px')+'Start a new workout session';
  if(t==='addExerciseToSession'){var s=(x.sets||[]).map(function(z){return (z.weight||0)+'kg×'+(z.reps||0);}).join(', ');return ICO('plus','14px')+'Add exercise: <b>'+(x.name||'?')+'</b>'+(s?' · '+s:'');}
  if(t==='finishWorkout')return ICO('check','14px')+'Finish current workout';
  if(t==='setRestTimer')return ICO('timer','14px')+'Start rest timer: <b>'+(x.seconds||90)+'s</b>';
  return ICO('target','14px')+t;
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
    results.map(function(r){return (r.ok?ICO('check','13px'):ICO('x','13px'))+r.msg;}).join('<br>')+
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
      renderCalibrations();
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
/* ── ENGINE OUTPUT RENDERER ──────────────────
   The engine is instructed to answer in markdown grids, so the card has to
   render them. Anything not a table or a bullet run stays plain text with its
   line breaks intact — the aligned value columns depend on that. Every cell
   goes through _esc: this is model output being written into innerHTML. */
function _isGridRow(l){return /^\s*\|.*\|\s*$/.test(l);}
function _isGridRule(l){return /^\s*\|[\s:|-]*\|\s*$/.test(l)&&l.indexOf('-')>=0;}
function _gridCells(l){
  var t=l.trim().replace(/^\|/,'').replace(/\|$/,'');
  return t.split('|').map(function(c){return c.trim();});
}
// Markdown emphasis is the one inline form worth keeping: the engine uses it
// to mark the operative figure in a cell. Everything else stays literal.
function _engInline(t){
  return _esc(t)
    .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>')
    .replace(/`([^`]+)`/g,'<code>$1</code>');
}
function _renderEngineBody(el,text){
  var lines=String(text||'').split(/\r?\n/);
  var out='',buf=[];
  function flushText(){
    while(buf.length&&!buf[0].trim())buf.shift();
    while(buf.length&&!buf[buf.length-1].trim())buf.pop();
    if(buf.length)out+='<div class="eng-txt">'+_engInline(buf.join('\n'))+'</div>';
    buf=[];
  }
  for(var i=0;i<lines.length;i++){
    // A grid needs a header row and a rule under it; anything less is prose
    // that happens to contain a pipe.
    if(_isGridRow(lines[i])&&i+1<lines.length&&_isGridRule(lines[i+1])){
      flushText();
      var head=_gridCells(lines[i]);
      var rows=[];
      i+=2;
      while(i<lines.length&&_isGridRow(lines[i])&&!_isGridRule(lines[i])){rows.push(_gridCells(lines[i]));i++;}
      i--;
      out+='<div class="eng-grid-wrap"><table class="eng-grid"><thead><tr>'+
        head.map(function(h){return '<th>'+_engInline(h)+'</th>';}).join('')+
        '</tr></thead><tbody>'+
        rows.map(function(r){
          return '<tr>'+head.map(function(_,c){return '<td>'+_engInline(r[c]||'')+'</td>';}).join('')+'</tr>';
        }).join('')+
      '</tbody></table></div>';
      continue;
    }
    // Bulleted diagnostic log.
    if(/^\s*[-*\u2022]\s+\S/.test(lines[i])){
      flushText();
      var items=[];
      while(i<lines.length&&/^\s*[-*\u2022]\s+\S/.test(lines[i])){
        items.push(lines[i].replace(/^\s*[-*\u2022]\s+/,''));i++;
      }
      i--;
      out+='<ul class="eng-log">'+items.map(function(t){return '<li>'+_engInline(t)+'</li>';}).join('')+'</ul>';
      continue;
    }
    buf.push(lines[i]);
  }
  flushText();
  el.innerHTML=out||'<div class="eng-txt">'+_esc(text||'')+'</div>';
}
function _engStamp(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function addTyping(){var el=document.getElementById('chat-msgs');var d=document.createElement('div');d.className='eng-out eng-ty';d.innerHTML='<div class="eng-out-h"><svg class="eng-out-ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-activity"/></svg>Computing<span class="eng-out-ts">'+_engStamp()+'</span></div><div class="eng-out-b"><div class="dots"><span></span><span></span><span></span></div></div>';el.appendChild(d);el.scrollTop=el.scrollHeight;return d;}
function clearChat(){chatH=[];document.getElementById('chat-msgs').innerHTML='<div class="eng-out"><div class="eng-out-h"><svg class="eng-out-ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-activity"/></svg>Engine ready</div><div class="eng-out-b">Session history, macro log and bodyweight series are loaded. Issue a command.</div></div>';}
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
