(function(){
  var root=document.documentElement, saved=null;
  try{ saved=localStorage.getItem('pf-theme'); }catch(e){}
  if(saved) root.setAttribute('data-theme', saved);
  var b=document.getElementById('tbtn');
  if(b) b.addEventListener('click', function(){
    var cur=root.getAttribute('data-theme');
    if(!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var nx = cur==='dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nx);
    try{ localStorage.setItem('pf-theme', nx); }catch(e){}
  });
  // scroll spy (랜딩 페이지에서만 동작)
  var links=[].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if(!links.length) return;
  var map={};
  links.forEach(function(a){
    var el=document.querySelector(a.getAttribute('href'));
    if(el) map[el.id]=a;
  });
  var targets=Object.keys(map).map(function(id){ return document.getElementById(id); });
  if(!('IntersectionObserver' in window) || !targets.length) return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(a){ a.classList.remove('on'); });
        map[e.target.id].classList.add('on');
      }
    });
  }, {rootMargin:'-72px 0px -66% 0px', threshold:0});
  targets.forEach(function(t){ io.observe(t); });
})();
