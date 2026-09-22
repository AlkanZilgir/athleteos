/* ── A11Y: keyboard nav + landmarks ───────────
   Many "tap targets" in this app are <div onclick> (legacy). Make them keyboard-
   focusable + Enter/Space triggers click, give them a button role, and label
   the main nav landmarks. Done at boot so dynamically-added items also work. */
function _enhanceA11y(){
  var clickable=document.querySelectorAll('.nv,.sb-item,.qa-btn,.sit,.expk-row,.acc-pick,.atab');
  clickable.forEach(function(el){
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
    if(!el.hasAttribute('role'))el.setAttribute('role','button');
  });
  // Trigger click on Enter/Space for any role="button" that isn't a real button.
  document.addEventListener('keydown',function(e){
    var t=e.target;if(!t||t.tagName==='BUTTON'||t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT')return;
    if(t.getAttribute&&t.getAttribute('role')==='button'){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click();}
    }
  });
  // Landmark labels on the two nav bars and main app.
  var sn=document.querySelector('.sb-nav');if(sn)sn.setAttribute('aria-label','Primary');
  var nb=document.querySelector('.navbar');if(nb)nb.setAttribute('aria-label','Sections');
  var app=document.getElementById('app');if(app)app.setAttribute('role','application');
  // Hide decorative SVGs from screen readers.
  document.querySelectorAll('.empty-ico svg,.sb-ico,.navbar .ico').forEach(function(s){s.setAttribute('aria-hidden','true');});
}
_enhanceA11y();

init();
