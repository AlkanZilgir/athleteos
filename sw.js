/* sw.js — Service worker-i i AthleteOS.
   Mban aplikacionin të punojë offline (cache), shfaq njoftimet e
   kohëmatësit të pushimit dhe njoftimet push, dhe riprovon ruajtjet
   që dështuan kur kthehet interneti. */
const CACHE='athleteos-v84';

const BASE=self.registration.scope;
const ASSETS=[
  BASE,
  BASE+'index.html',
  BASE+'app.css',
  BASE+'js/core.js',
  BASE+'js/auth.js',
  BASE+'js/onboarding.js',
  BASE+'js/home.js',
  BASE+'js/workout.js',
  BASE+'js/nutrition.js',
  BASE+'js/body.js',
  BASE+'js/sleep.js',
  BASE+'js/ai.js',
  BASE+'js/settings.js',
  BASE+'js/boot.js',
  BASE+'manifest.json',
  BASE+'icon-192.png',
  BASE+'icon-512.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── NJOFTIMET E KOHËMATËSIT TË PUSHIMIT ──── */
// Si funksionon njoftimi i pushimit në sfond: shfletuesi e vret service
// worker-in pas ~30 sekondash kur ekrani fiket, kështu që një setTimeout i
// thjeshtë nuk mjafton. Bëjmë tri gjëra:
//   1. Sapo nis pushimi, shfaqim një njoftim të heshtur që qëndron në shirit,
//      që diçka të jetë gjithmonë aty edhe nëse SW vritet më vonë.
//   2. Faqja e hapur dërgon çdo sekondë REST_TICK; çdo tik e zgjon SW-në dhe
//      e mban gjallë kohëmatësin e përfundimit.
//   3. Alarmi "pushimi mbaroi" vjen nga kush mbijeton: faqja (REST_DONE) ose
//      setTimeout-i i SW. Të dy kanë tag 'rest', kështu shfaqet vetëm një.
var _rTmr=null;

function _closeTag(tag){
  if(self.registration.getNotifications){
    return self.registration.getNotifications({tag:tag,includeTriggered:true}).then(function(ns){
      ns.forEach(function(n){n.close();});
    }).catch(function(){});
  }
}
function _clearScheduled(){
  if(_rTmr){clearTimeout(_rTmr);_rTmr=null;}
  _closeTag('rest');
}

// Njoftimi i heshtur i numërimit mbrapsht, i dukshëm në shirit dhe në ekranin e kyçjes.
function _showRestOngoing(endAt){
  var left=Math.max(0,Math.ceil((endAt-Date.now())/1000));
  var mm=Math.floor(left/60),ss=left%60;
  var label=left<=0?'Rest done':mm+':'+(ss<10?'0':'')+ss+' left';
  return self.registration.showNotification('Resting · '+label,{
    body:'Get ready for your next set 💪',
    icon:'icon-192.png',
    badge:'icon-192.png',
    tag:'rest',
    renotify:false,
    silent:true,
    requireInteraction:true,
    data:{ongoing:true}
  }).catch(function(){});
}

function _fireRestDone(){
  if(_rTmr){clearTimeout(_rTmr);_rTmr=null;}
  return self.registration.showNotification('Rest complete!',{
    body:'Time to hit your next set 💪',
    icon:'icon-192.png',
    badge:'icon-192.png',
    tag:'rest',
    renotify:true,
    requireInteraction:true,
    vibrate:[300,100,300,100,300],
    data:{ongoing:false}
  });
}

var _remTimers={};
function _clearReminderTag(tag){
  if(_remTimers[tag]){clearTimeout(_remTimers[tag]);delete _remTimers[tag];}
  if(self.registration.getNotifications){
    self.registration.getNotifications({tag:tag,includeTriggered:true}).then(function(ns){
      ns.forEach(function(n){n.close();});
    }).catch(function(){});
  }
}
function _scheduleOne(item){
  var delay=Math.max(0,item.at-Date.now());
  if('showTrigger' in Notification.prototype && self.TimestampTrigger){
    try{
      self.registration.showNotification(item.title,{
        body:item.body,icon:'icon-192.png',badge:'icon-192.png',
        tag:item.id,renotify:true,
        showTrigger:new TimestampTrigger(item.at)
      });
      return;
    }catch(err){}
  }
  _remTimers[item.id]=setTimeout(function(){
    self.registration.showNotification(item.title,{
      body:item.body,icon:'icon-192.png',badge:'icon-192.png',
      tag:item.id,renotify:true
    });
    delete _remTimers[item.id];
  },delay);
}

self.addEventListener('message',function(e){
  if(!e.data)return;
  if(e.data.type==='SCHEDULE_REMINDERS'){
    // Hiq njoftimet e mëparshme të kujtesave (rem-*)
    ['rem-workout','rem-protein','rem-water-9','rem-water-12','rem-water-15','rem-water-18','rem-water-21','rem-streak'].forEach(_clearReminderTag);
    (e.data.items||[]).forEach(_scheduleOne);
    return;
  }
  if(e.data.type==='REST_START'){
    _clearScheduled();
    var endAt=e.data.endAt||(Date.now()+e.data.duration*1000);
    var delay=Math.max(0,endAt-Date.now());
    e.waitUntil(_showRestOngoing(endAt));
    _rTmr=setTimeout(function(){_fireRestDone();},delay);
  }
  if(e.data.type==='REST_TICK'){
    if(e.data.endAt&&e.data.endAt>Date.now())e.waitUntil(_showRestOngoing(e.data.endAt));
  }
  if(e.data.type==='REST_DONE'){e.waitUntil(_fireRestDone());}
  if(e.data.type==='REST_CANCEL'){_clearScheduled();}
});

/* ── NJOFTIMET PUSH NGA SERVERI ───────────── */
self.addEventListener('push',function(e){
  var data={};
  try{data=e.data?e.data.json():{};}catch(err){data={body:e.data?e.data.text():''};}
  var title=data.title||'AthleteOS';
  var opts={
    body:data.body||'',
    icon:'icon-192.png',
    badge:'icon-192.png',
    tag:data.tag||'aos',
    renotify:data.renotify!==false,
    data:{url:data.url||'/'}
  };
  e.waitUntil(self.registration.showNotification(title,opts));
});

self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      for(var i=0;i<list.length;i++){if('focus' in list[i])return list[i].focus();}
      if(self.clients.openWindow)return self.clients.openWindow(BASE);
    })
  );
});

/* ── SINKRONIZIMI NË SFOND ────────────────────
   Kur një ruajtje dështon offline, aplikacioni e vendos në radhë në
   localStorage dhe regjistron një sync 'flush-queue'. Chrome në Android
   e riprovon sapo kthehet interneti, edhe me aplikacionin të mbyllur.
   Safari nuk e mbështet; atje radha zbrazet kur hapet aplikacioni. */
self.addEventListener('sync',function(e){
  if(e.tag!=='flush-queue')return;
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      // Zgjo ndonjë dritare të hapur që të ekzekutojë flushWriteQueue(). Nëse s'ka
      // asnjë, nuk mund ta riprovojmë vetë (klienti Supabase nuk është në SW);
      // radha pret vizitën tjetër.
      list.forEach(function(c){try{c.postMessage({type:'FLUSH_QUEUE'});}catch(err){}});
    })
  );
});

self.addEventListener('fetch',e=>{
  const url=e.request.url;

  if(!url.startsWith('http'))return;

  if(
    url.includes('pollinations.ai') ||
    url.includes('openfoodfacts') ||
    url.includes('fonts.g') ||
    url.includes('supabase.co') ||
    url.includes('supabase.com') ||
    url.includes('cdn.jsdelivr.net')
  ){
    return;
  }

  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).catch(()=>caches.match(BASE+'index.html'))
    );
    return;
  }

  // Cache API ruan vetëm përgjigje GET; POST/PUT/DELETE nuk ruhen kurrë.
  if(e.request.method!=='GET')return;

  // Kodi dhe stilet shërbehen nga cache-i dhe rifreskohen në sfond
  // (stale-while-revalidate); gjithçka tjetër është cache-first. Kështu një
  // ndryshim në CSS ose JS arrin te përdoruesi edhe pa ndryshuar CACHE.
  const isCode=/\.(?:css|js|html)$/.test(new URL(url).pathname);

  // Rifreskimi duhet ta anashkalojë cache-in HTTP të shfletuesit, ndryshe
  // lexon përsëri të njëjtën kopje të vjetër. 'no-cache' e riverifikon me
  // serverin dhe një përgjigje 304 nuk kushton asgjë.
  const req=isCode?new Request(e.request.url,{cache:'no-cache',credentials:'same-origin'}):e.request;

  e.respondWith((async()=>{
    const cached=await caches.match(e.request);

    const fresh=fetch(req).then(r=>{
      if(!r || r.status!==200 || r.type==='opaque')return r;

      const cl=r.clone();
      return caches.open(CACHE).then(cache=>cache.put(e.request,cl)).then(()=>r);
    });

    if(cached){
      // waitUntil është i domosdoshëm: pa të, SW mund të vritet sapo kthehet
      // përgjigjja dhe kopja e re nuk ruhet kurrë në cache.
      if(isCode)e.waitUntil(fresh.catch(()=>{}));
      return cached;
    }
    return fresh;
  })());
});
