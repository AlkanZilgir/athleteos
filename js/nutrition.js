/* ── WATER ────────────────────────────────── */
function initWGrid(){
  var g=document.getElementById('w-grid');g.innerHTML='';
  for(var i=0;i<G.water;i++){
    var d=document.createElement('div');
    d.className='wc'+(i<waterCups?' on':'');
    d.innerHTML=ICO('droplet');
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
  toast('Meal logged');
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
  meals.push(m);refresh();toast('Re-logged: '+m.name);
  await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
}
function renderMealLog(){
  var el=document.getElementById('meal-log');
  if(!meals.length){el.innerHTML='<div class="empty-state"><div class="empty-ico"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="34" r="20"/><path d="M22 28c2-3 5-5 10-5s8 2 10 5"/><path d="M18 14v10M22 14v10M14 14v6c0 2 2 4 4 4M46 14v20"/><path d="M44 14c0 4 1 8 4 10v-10"/></svg></div><div class="empty-h">No meals logged today</div><div class="empty-sub">Track your macros from breakfast to dinner.</div><button type="button" class="empty-cta" onclick="openMealM()">+ Log first meal</button></div>';return;}
  el.innerHTML=meals.map(function(m,i){
    return '<div class="mc"><div class="fb"><div class="mcn">'+m.name+'</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:13px;color:var(--yel)">'+m.calories+' kcal</span><button type="button" onclick="delMeal('+(m.id?'"'+m.id+'"':i)+')" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:2px">'+ICO('x','14px')+'</button></div></div><div class="mcm">'+m.protein+'g protein · '+m.carbs+'g carbs · '+m.fat+'g fat</div></div>';
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
    return '<div class="mc" style="cursor:pointer" onclick="openRecipe('+i+')"><div class="fb"><div class="mcn">'+r.name+'</div><span style="font-size:11px;color:var(--accent);font-weight:700">View</span></div><div class="mcm">'+r.protein+'g P · '+r.carbs+'g C · '+r.fat+'g F · '+r.calories+' kcal</div></div>';
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
  meals.push(m);refresh();cModal('m-recipe');toast(r.name+' added');
  await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
}
function renderMealSugg(){document.getElementById('meal-sugg').innerHTML=MEAL_SUGG.map(function(m,i){return '<div class="mc" style="cursor:pointer" onclick="quickAdd('+i+')"><div class="fb"><div class="mcn">'+m.name+'</div><span style="font-size:11px;color:var(--accent);font-weight:700">+ Add</span></div><div class="mcm">'+m.protein+'g protein · '+m.carbs+'g carbs · '+m.fat+'g fat · '+m.calories+' kcal</div></div>';}).join('');}
async function quickAdd(i){
  var m=Object.assign({},MEAL_SUGG[i]);
  var id=_genId();m.id=id;
  meals.push(m);refresh();toast(m.name+' added');goTab('nutrition');
  await sbQueueInsert('meals',{id:id,user_id:CU.id,logged_date:today(),name:m.name,protein_g:m.protein,carbs_g:m.carbs,fat_g:m.fat,calories:m.calories});
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
  cModal('m-macro');_calDirty();
  toast('Derived from Mifflin-St Jeor — review and commit');
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
