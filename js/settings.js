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
  var t=document.getElementById('bio-state');
  if(t){t.textContent=error?'Local only':'Synced';t.classList.toggle('warn',!!error);}
  renderCalibrations();
  toast(error?'Biometrics saved locally. Sync failed.':'Biometrics committed');
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
  if(meta)meta.setAttribute('content',isDark?'#0A0A0C':'#FFFFFF');
  // Volt resolves differently per theme, so the accent has to follow the flip.
  if(typeof applyAccent==='function'){
    var acc='volt';try{acc=localStorage.getItem('athleteos_accent')||'volt';}catch(e){}
    applyAccent(acc);
  }
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
  var saved=localStorage.getItem('athleteos_theme')||'dark';
  setThemeMode(saved);
  initAccent();
}

/* ── ACCENT COLOR ─────────────────────────── */
var ACCENTS={
  // ink = what sits ON the accent. lt/ltd = the light-theme stand-in, needed
  // because volt at 94% lightness is unreadable on white at any weight.
  volt:  {a:'#CCFF00',d:'#B4E600',rgb:'204,255,0',   ink:'#0A0A0C',lt:'#4D6A00',ltd:'#3D5400'},
  green: {a:'#22C55E',d:'#16A34A',rgb:'34,197,94',   ink:'#FFFFFF'},
  forge: {a:'#FF6B35',d:'#EA580C',rgb:'255,107,53',  ink:'#0A0A0C'},
  cool:  {a:'#22D3EE',d:'#06B6D4',rgb:'34,211,238',  ink:'#0A0A0C'},
  purple:{a:'#A855F7',d:'#9333EA',rgb:'168,85,247',  ink:'#FFFFFF'},
  pink:  {a:'#EC4899',d:'#DB2777',rgb:'236,72,153',  ink:'#FFFFFF'}
};
function applyAccent(name){
  var p=ACCENTS[name]||ACCENTS.volt;
  var root=document.documentElement;
  var dark=document.body.classList.contains('dark');
  // On the light ground a near-white accent has nowhere to go: swap to the
  // declared stand-in and put white back on top of it.
  var fill=(!dark&&p.lt)?p.lt:p.a;
  var fillD=(!dark&&p.ltd)?p.ltd:p.d;
  var ink=(!dark&&p.lt)?'#FFFFFF':(p.ink||'#FFFFFF');
  root.style.setProperty('--accent',fill);
  root.style.setProperty('--accent-d',fillD);
  root.style.setProperty('--accent-ink',ink);
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
  var saved='volt';
  try{saved=localStorage.getItem('athleteos_accent')||'volt';}catch(e){}
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
  toast('Got it. Thanks.');
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
  toast('Password updated');
}

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
  toast('Export downloaded');
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

/* ── PAYWALL ───────────────────────────────── */
var _pwPlan='yearly';
function openPaywall(){_pwPlan='yearly';pw_pick('yearly');oModal('m-paywall');}
// The selected tier expands; the other two collapse to rows. State lives in
// classes now, not inline styles, so the stylesheet owns the look.
var PW_TERMS={
  monthly :{cta:'Subscribe monthly',   today:'\u20ac4.99', then:'\u20ac4.99 / mo'},
  yearly  :{cta:'Start 7-day free trial',today:'\u20ac0.00', then:'\u20ac15.99 / yr'},
  lifetime:{cta:'Get lifetime access', today:'\u20ac49.99',then:'Nothing. Ever.'}
};
function pw_pick(plan){
  _pwPlan=plan;
  document.querySelectorAll('.pw-plan').forEach(function(b){
    var on=b.dataset.plan===plan;
    b.classList.toggle('on',on);
    b.setAttribute('aria-checked',on?'true':'false');
    b.removeAttribute('style');
  });
  var t=PW_TERMS[plan]||PW_TERMS.yearly;
  var cta=document.getElementById('pw-cta');if(cta)cta.textContent=t.cta;
  var a=document.getElementById('pw-r-today');if(a)a.textContent=t.today;
  var c=document.getElementById('pw-r-then');if(c)c.textContent=t.then;
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
  el.innerHTML='<span style="font-size:17px;display:flex">'+ICO('star')+'</span><span style="flex:1">'+msg+'</span><span style="font-size:11px;opacity:.85;font-weight:800;letter-spacing:.5px">TAP</span>';
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
  ai_chat:7,        // Coach messages per day
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
    toast('Pro is live. Everything is open.');
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
      if(sbI)sbI.innerHTML=ICO('check');
      sbPro.setAttribute('onclick','openCustomerPortal()');
    }else{
      sbPro.classList.remove('active');
      if(sbT)sbT.textContent='Try AthleteOS Pro';
      if(sbB)sbB.textContent='7 days free';
      if(sbI)sbI.innerHTML=ICO('star');
      sbPro.setAttribute('onclick','openPaywall()');
    }
  }
  // Topbar Pro indicator (free users only)
  var tbPro=document.getElementById('tb-pro');
  if(tbPro)tbPro.style.display=isPremium()?'none':'inline-flex';
  // PRO badges on locked features
  var mmPro=document.getElementById('body-mm-pro');
  if(mmPro)mmPro.style.display=isPremium()?'none':'inline-flex';
  // Engine status line. Keeps the live dot — it is the only thing on the panel
  // that says the engine is running rather than idle.
  var aiSub=document.getElementById('ai-page-sub');
  if(aiSub){
    if(isPremium()){
      aiSub.innerHTML='<i class="eng-dot"></i>Pro · unlimited commands';
    }else{
      var left=premRemaining('ai_chat');
      aiSub.innerHTML='<i class="eng-dot"></i>'+left+' of '+PREM_LIMITS.ai_chat+' commands left today · '+
        '<span class="lnk" onclick="openPaywall()">Upgrade</span>';
    }
  }
}

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
    try{track('push_subscribed',{ua:navigator.userAgent.slice(0,60)});}catch(e){}
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
    try{track('push_unsubscribed',{});}catch(e){}
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
  if(REM.protein)items.push({id:'rem-protein',title:'Protein check',body:'Where are you against target?',at:_nextOccurrence(REM.pt)});
  if(REM.water){
    [9,12,15,18,21].forEach(function(h){var t=h<10?'0'+h+':00':h+':00';items.push({id:'rem-water-'+h,title:'Water',body:'Get a glass in.',at:_nextOccurrence(t)});});
  }
  // Streak-saving nudge: only when an active streak is at risk of breaking tonight.
  if(_streakCount>=1 && !_streakDoneToday){
    var d=new Date();d.setHours(20,0,0,0);
    if(d.getTime()>Date.now()){
      items.push({id:'rem-streak',title:'Streak on the line',body:'Your '+_streakCount+'-day streak ends in 4 hours.',at:d.getTime()});
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
  return{title:'Your week',body:body};
}
// Returns the title/body for today's workout notification, based on AI_PLAN.
function _planMessageForToday(){
  if(!AI_PLAN||!AI_PLAN.days||!AI_PLAN.days.length)return{title:'Session due',body:'Twenty minutes still counts.'};
  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var todayName=DAYS[new Date().getDay()];
  var day=AI_PLAN.days.find(function(d){return(d.day||'').toLowerCase()===todayName.toLowerCase();});
  if(!day){
    // No specific day match — pick first non-rest day after today.
    var next=AI_PLAN.days.find(function(d){return d.exercises&&d.exercises.length;});
    if(next)return{title:'Active recovery',body:'No lifts today. Walk, stretch, sleep. Next up: '+next.name+'.'};
    return{title:'Session due',body:'Twenty minutes still counts.'};
  }
  if(!day.exercises||!day.exercises.length)return{title:'Rest day',body:'Sleep is the session today.'};
  var focus=day.exercises.slice(0,4).map(function(e){return e.name;}).join(', ');
  return{title:'Today: '+(day.name||'Workout'),body:focus+(day.exercises.length>4?' + '+(day.exercises.length-4)+' more':'')};
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
