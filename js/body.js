/* ── WEIGHT ───────────────────────────────── */
function openWtM(){oModal('m-wt');}
async function saveWt(){
  var v=parseFloat(document.getElementById('wt-in').value);
  if(!v||v<30||v>300){toast('Enter a valid weight');return;}
  var entry={weight_kg:v,logged_date:today()};
  wtLog.push({weight:v,date:today(),ts:Date.now()});wtLog.sort(function(a,b){return a.ts-b.ts;});
  document.getElementById('b-cw').innerHTML=v+'<span class="su">kg</span>';
  cModal('m-wt');document.getElementById('wt-in').value='';
  renderWtLog();renderChart();renderWeightProjection();toast('Weight logged');
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
  if(!rec.length){el.innerHTML='<div class="bp"><span class="bp-l">No weigh-ins</span><button type="button" class="empty-cta" onclick="openWtM()">Log weight</button></div>';return;}
  el.innerHTML=rec.map(function(w,i){var prev=rec[i+1];var d=prev?(w.weight-prev.weight).toFixed(1):null;var col=d&&parseFloat(d)<0?'var(--accent)':d&&parseFloat(d)>0?'var(--red)':'var(--t2)';return '<div class="fb" style="padding:10px 0;border-bottom:1px solid var(--bdr)"><div><div style="font-weight:600">'+w.weight+' kg</div><div style="font-size:11.5px;color:var(--t3)">'+fdate(w.date)+'</div></div>'+(d?'<span style="color:'+col+';font-size:13px;font-weight:600">'+(parseFloat(d)>0?'+':'')+d+'kg</span>':'')+'</div>';}).join('');
}
async function initChart(){
  await _ensureChart();
  var canvas=document.getElementById('w-chart');if(!canvas)return;
  var ctx=canvas.getContext('2d');
  wChart=new Chart(ctx,{type:'line',data:{labels:[],datasets:[{label:'Weight',data:[],borderColor:_sig('--accent'),backgroundColor:'rgba(204,255,0,.07)',borderWidth:2,pointBackgroundColor:_sig('--accent'),pointBorderWidth:0,pointRadius:2.5,tension:.32,fill:true}]},options:{responsive:true,maintainAspectRatio:false,layout:{padding:0},plugins:{legend:{display:false}},scales:_chartAxes()}});
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
      scales:(function(a){a.x.stacked=true;a.y.stacked=true;a.y.ticks.callback=function(v){return v>=1000?(v/1000).toFixed(1)+'t':v;};return a;})(_chartAxes())}
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
    options:{responsive:true,maintainAspectRatio:false,layout:{padding:0},plugins:{legend:{display:false}},scales:_chartAxes({yTick:{callback:function(v){return v+'kg';}}})}});
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
    options:{responsive:true,maintainAspectRatio:false,layout:{padding:0},plugins:{legend:{display:false}},scales:_chartAxes({yTick:{callback:function(v){return v+'%';}}})}});
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
  mesLog.unshift(rec);renderMeasure();renderBfChart();toast('Measurements saved');
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
  toast('Photo saved');
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
