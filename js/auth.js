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
  if(!data.session){showErr('Account created. Confirm your email, then sign in.');}
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
function setBtnLoad(id,on){var b=document.getElementById(id);if(!b)return;if(on){b.textContent='…';return;}b.innerHTML=(id==='reg-btn'?'Create account':'Sign in')+ICO('arrow-right','16px');}

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
  renderCalibrations();
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
