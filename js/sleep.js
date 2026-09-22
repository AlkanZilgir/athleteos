/* ── TIME PICKER ─────────────────────────── */
var _tpTarget=null;
function fmt12(val){var p=val.split(':');var h=parseInt(p[0]);var m=p[1];var ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+m+' '+ap;}
function openTimePicker(target){
  _tpTarget=target;
  var val=document.getElementById('s-'+target).value||'22:30';
  var p=val.split(':');var h=parseInt(p[0])||0;var m=parseInt(p[1])||0;
  document.getElementById('tp-title').textContent=target==='bed'?'Bedtime':'Wake Time';
  var hc=document.getElementById('tp-hrs'),mc=document.getElementById('tp-mins');
  var hi='<div class="tp-pad"></div>';for(var i=0;i<24;i++)hi+='<div class="tp-item">'+(i<10?'0':'')+i+'</div>';hi+='<div class="tp-pad"></div>';
  var mi='<div class="tp-pad"></div>';for(var j=0;j<60;j++)mi+='<div class="tp-item">'+(j<10?'0':'')+j+'</div>';mi+='<div class="tp-pad"></div>';
  hc.innerHTML=hi;mc.innerHTML=mi;
  oModal('m-timepick');
  setTimeout(function(){hc.scrollTop=h*52;mc.scrollTop=m*52;},80);
}
function confirmTime(){
  var hc=document.getElementById('tp-hrs'),mc=document.getElementById('tp-mins');
  var h=Math.max(0,Math.min(23,Math.round(hc.scrollTop/52)));
  var m=Math.max(0,Math.min(59,Math.round(mc.scrollTop/52)));
  var val=(h<10?'0':'')+h+':'+(m<10?'0':'')+m;
  document.getElementById('s-'+_tpTarget).value=val;
  var d=document.getElementById('s-'+_tpTarget+'-disp');if(d)d.textContent=fmt12(val);
  cModal('m-timepick');
}

/* ── SLEEP ────────────────────────────────── */
async function logSleep(){
  var bed=document.getElementById('s-bed').value,wk=document.getElementById('s-wk').value;
  if(!bed||!wk){toast('Enter times');return;}
  var bm=parseInt(bed.split(':')[0])*60+parseInt(bed.split(':')[1]);
  var wm=parseInt(wk.split(':')[0])*60+parseInt(wk.split(':')[1]);
  var hrs=(wm-bm)/60;if(hrs<0)hrs+=24;
  document.getElementById('h-s').innerHTML=hrs.toFixed(1)+'<span class="su">h</span>';
  setSleepRing(hrs);toast(hrs.toFixed(1)+'h sleep logged');
  await sbQueueUpsert('sleep_logs',{user_id:CU.id,logged_date:today(),bedtime:bed,wake_time:wk,duration_hours:hrs,quality:document.getElementById('s-q').value},{onConflict:'user_id,logged_date'});
  if(navigator.onLine)await loadSleepHist();
}
function setSleepRing(h){
  var d=document.getElementById('s-disp');if(d)d.textContent=h.toFixed(1);
  var r=document.getElementById('s-ring');if(r)r.style.strokeDashoffset=415*(1-Math.min(1,h/8));
  var us=document.getElementById('util-sleep');if(us)us.style.width=Math.min(100,(h/8)*100)+'%';
  var sub=document.getElementById('s-sub');
  if(sub)sub.textContent=h>=7.5?'Fully recovered':h>=6.5?'Enough to train':'Short night';
}
var sleepChart=null;
async function loadSleepHist(){
  var{data}=await sb.from('sleep_logs').select('*').eq('user_id',CU.id).order('logged_date',{ascending:false}).limit(30);
  var el=document.getElementById('s-hist');
  if(!data||!data.length){el.innerHTML='<div class="empty-state"><div class="empty-ico" style="background:rgba(168,85,247,.12);color:#A855F7"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M44 36c-12 0-20-8-20-20 0-2 .3-4 .8-6C16 12 10 20 10 30c0 13 11 24 24 24 8 0 15-4 19-11-3 1-6 2-9 2z"/><circle cx="48" cy="14" r="2"/><circle cx="40" cy="20" r="1.5"/></svg></div><div class="empty-h">No sleep logged yet</div><div class="empty-sub">Tap the bed icon to log how long you slept. Trends appear after 2+ nights.</div><button type="button" class="empty-cta" onclick="goTab(\'sleep\');setTimeout(function(){var f=document.getElementById(\'s-bed\');if(f)f.focus();},120)">+ Log last night</button></div>';if(sleepChart){sleepChart.destroy();sleepChart=null;}return;}
  var em={great:'Great',good:'Good',ok:'OK',poor:'Poor'};
  var chartHtml=data.length>=2?'<div class="chart-wrap" style="height:160px;margin-bottom:14px"><canvas id="s-chart"></canvas></div>':'';
  el.innerHTML=chartHtml+data.slice(0,7).map(function(s){var h=parseFloat(s.duration_hours);var col=h>=7?'var(--accent-d)':h>=5.5?'var(--yel)':'var(--red)';return '<div class="fb" style="padding:11px 0;border-bottom:1px solid var(--bdr)"><div><div style="font-weight:600;letter-spacing:-.2px">'+fdate(s.logged_date)+'</div><div style="font-size:12.5px;color:var(--t2);margin-top:2px">'+s.bedtime+' → '+s.wake_time+' '+(em[s.quality]||'Good')+'</div></div><span style="color:'+col+';font-family:Inter,sans-serif;font-weight:800;font-size:22px;letter-spacing:-.8px">'+h.toFixed(1)+'h</span></div>';}).join('');
  if(data.length>=2){
    var asc=data.slice().reverse();
    var ctx=document.getElementById('s-chart');if(!ctx)return;
    await _ensureChart();
    if(sleepChart){sleepChart.destroy();}
    sleepChart=new Chart(ctx.getContext('2d'),{
      type:'line',
      data:{labels:asc.map(function(s){return s.logged_date.slice(5);}),
        datasets:[{label:'Hours',data:asc.map(function(s){return parseFloat(s.duration_hours);}),borderColor:'#A855F7',backgroundColor:'rgba(168,85,247,.08)',borderWidth:2.5,pointBackgroundColor:'#A855F7',pointRadius:3,tension:.35,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return ctx.parsed.y.toFixed(1)+'h';}}}},scales:_chartAxes({x:{maxTicksLimit:7},y:{suggestedMin:4,suggestedMax:10},yTick:{callback:function(v){return v+'h';}}})}
    });
  }
}
