/* boot.js — Aksesueshmëria: navigim me tastierë dhe etiketa për lexuesit e ekranit.
   Shumë elemente që preken janë <div onclick>. Këtu i bëjmë të fokusueshme me
   tastierë, Enter/Space i klikon, marrin rolin "button", dhe menutë marrin
   emra. Bëhet në nisje që të funksionojë edhe për elementet e shtuara më vonë. */
function _enhanceA11y(){
  var clickable=document.querySelectorAll('.nv,.sb-item,.qa-btn,.sit,.expk-row,.acc-pick,.atab');
  clickable.forEach(function(el){
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
    if(!el.hasAttribute('role'))el.setAttribute('role','button');
  });
  // Enter ose Space klikon çdo role="button" që nuk është buton i vërtetë.
  document.addEventListener('keydown',function(e){
    var t=e.target;if(!t||t.tagName==='BUTTON'||t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT')return;
    if(t.getAttribute&&t.getAttribute('role')==='button'){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click();}
    }
  });
  // Emra për dy menutë e navigimit dhe zonën kryesore.
  var sn=document.querySelector('.sb-nav');if(sn)sn.setAttribute('aria-label','Primary');
  var nb=document.querySelector('.navbar');if(nb)nb.setAttribute('aria-label','Sections');
  var app=document.getElementById('app');if(app)app.setAttribute('role','application');
  // Fshih ikonat dekorative nga lexuesit e ekranit.
  document.querySelectorAll('.empty-ico svg,.sb-ico,.navbar .ico').forEach(function(s){s.setAttribute('aria-hidden','true');});
}
_enhanceA11y();

init();
