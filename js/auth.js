/* auth.js — Hyrja, regjistrimi, dalja dhe nisja e aplikacionit pas hyrjes. */
/* ── HYRJA / REGJISTRIMI ──────────────────── */
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

// Hyrja me Google: kërkon që ofruesi Google të jetë aktiv në Supabase
// (Authentication → Providers) dhe URL-ja e kthimit të jetë kjo faqe.
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

/* ── NISJA PAS HYRJES ─────────────────────── */
async function bootApp(){
  document.getElementById('auth').style.display='none';
  var w=document.getElementById('welcome');if(w)w.classList.add('hidden');
  document.getElementById('app').style.display='flex';
  _updateOfflineBadge();flushWriteQueue();
  if(!_voiceSupported()){var mb=document.getElementById('chat-mic-btn');if(mb)mb.style.display='none';}
  await loadGoals();
  // Përditëso zonën kohore në server që kujtesat push të vijnë në orën lokale.
  try{
    var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(tz&&tz!==P._timezone){sb.from('profiles').update({timezone:tz}).eq('id',CU.id).then(function(){P._timezone=tz;});}
  }catch(e){}
  // Hera e parë? Shfaq onboarding-un në vend të aplikacionit.
  if(!P._onboardingDone){
    document.getElementById('app').style.display='none';
    showOnboarding();
    return;
  }
  var n=CU._name||CU.user_metadata?.name||CU.email.split('@')[0];
  var av=document.getElementById('ava');if(av){av.textContent=n.charAt(0).toUpperCase();av.classList.add('on');}
  document.getElementById('sb-ava').textContent=n.charAt(0).toUpperCase();
  document.getElementById('sb-name').textContent=n;
  renderCalibrations();
  document.getElementById('b-gw').innerHTML=G.weight+'<span class="su">kg</span>';
  showInitialSkeletons();
  // Vetëm të dhënat e sotme, kontrolli ditor dhe seria ngarkohen para se të
  // shfaqet faqja kryesore. Gjithçka tjetër (historiku, grafikët, skedat e tjera)
  // ngarkohet në sfond, që faqja të hapet shpejt.
  await loadToday();
  initWGrid();renderPRs();
  AI_PLAN=JSON.parse(localStorage.getItem('athleteos_plan_'+CU.id)||'null');
  renderPlan();loadProfile();initTheme();refreshInstallUI();
  await Promise.all([calcStreak(),loadCheckin()]);
  rotateCoachTip();
  // Vizato kartat e faqes kryesore (secila bën pyetjen e vet në Supabase).
  renderHero();renderActivityFeed();renderDailySummary();renderGettingStarted();
  loadReminderUI();
  goTab('home');
  _consumeShareHash();
  // Ngarkuesit dytësorë për skedat Stërvitja / Trupi / Gjumi. Secili vizaton
  // pamjen e vet kur mbaron, prandaj mund të vonohen pa problem.
  Promise.all([
    loadWHist(),loadWtLog(),loadSleepHist(),
    loadCardio(),loadMeasure(),loadPhotos(),
    loadCalendarData(),loadTemplates(),loadCustomExFromServer(),loadCustomAch(),loadUserPrefs()
  ]).then(function(){
    initChart();renderMealSugg();renderRecipes();
    maybeShowPlanTweak();scheduleReminders();
  }).catch(function(e){console.warn('background loaders',e);});
}

/* ── HARROVA FJALËKALIMIN / RIDËRGO EMAILIN ─ */
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
