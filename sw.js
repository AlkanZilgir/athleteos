const CACHE='athleteos-v41';

const BASE=self.registration.scope;
const ASSETS=[
  BASE,
  BASE+'index.html',
  BASE+'app.css',
  BASE+'app.js',
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

/* ── REST TIMER NOTIFICATIONS ─────────────── */
var _rTmr=null;

function _clearScheduled(){
  if(_rTmr){clearTimeout(_rTmr);_rTmr=null;}
  if(self.registration.getNotifications){
    self.registration.getNotifications({tag:'rest',includeTriggered:true}).then(function(ns){
      ns.forEach(function(n){n.close();});
    }).catch(function(){});
  }
}

function _fireRestDone(){
  return self.registration.showNotification('Rest complete!',{
    body:'Time to hit your next set 💪',
    icon:'icon-192.png',
    badge:'icon-192.png',
    tag:'rest',
    renotify:true,
    requireInteraction:true,
    vibrate:[300,100,300,100,300]
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
    // Clear any prior rem-* notifications
    ['rem-workout','rem-protein','rem-water-9','rem-water-12','rem-water-15','rem-water-18','rem-water-21','rem-streak'].forEach(_clearReminderTag);
    (e.data.items||[]).forEach(_scheduleOne);
    return;
  }
  if(e.data.type==='REST_START'){
    _clearScheduled();
    var endAt=e.data.endAt||(Date.now()+e.data.duration*1000);
    var delay=Math.max(0,endAt-Date.now());
    // Prefer Notification Triggers API (fires even if SW is asleep, Chrome Android).
    if('showTrigger' in Notification.prototype && self.TimestampTrigger){
      try{
        self.registration.showNotification('Rest complete!',{
          body:'Time to hit your next set 💪',
          icon:'icon-192.png',
          badge:'icon-192.png',
          tag:'rest',
          renotify:true,
          requireInteraction:true,
          vibrate:[300,100,300,100,300],
          showTrigger:new TimestampTrigger(endAt)
        });
      }catch(err){
        _rTmr=setTimeout(function(){_fireRestDone();_rTmr=null;},delay);
      }
    }else{
      _rTmr=setTimeout(function(){_fireRestDone();_rTmr=null;},delay);
    }
  }
  if(e.data.type==='REST_CANCEL'){_clearScheduled();}
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

/* ── BACKGROUND SYNC ──────────────────────────
   When a write fails offline, app.js queues it in localStorage and registers a
   'flush-queue' sync. Chrome Android replays it once the device is back online,
   even if the PWA is closed. Safari ignores this — falls back to in-app flush. */
self.addEventListener('sync',function(e){
  if(e.tag!=='flush-queue')return;
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      // Wake any open window so its flushWriteQueue() runs. If none is open we
      // can't replay (we don't ship the Supabase client into the SW); the queue
      // simply waits for the next visit.
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

  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;

      return fetch(e.request).then(r=>{
        if(!r || r.status!==200 || r.type==='opaque')return r;

        const cl=r.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,cl));
        return r;
      });
    })
  );
});
