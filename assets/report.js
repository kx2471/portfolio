(function(){
  /* ---- 스크롤 위치 복원 ---- */
  (function(){
    var p=location.pathname, isIndex = p.endsWith('/') || /(^|\/)index\.html?$/.test(p);
    if(!isIndex) return;
    try{
      var y=sessionStorage.getItem('pf2-scroll');
      if(y!==null){
        sessionStorage.removeItem('pf2-scroll');
        var el=root, prev=el.style.scrollBehavior;
        el.style.scrollBehavior='auto';
        window.scrollTo(0, parseInt(y,10)||0);
        setTimeout(function(){ el.style.scrollBehavior=prev||''; }, 80);
      }
    }catch(e){}
    document.addEventListener('click', function(e){
      var a=e.target.closest && e.target.closest('a[href]');
      if(!a) return;
      var h=a.getAttribute('href')||'';
      if(!h || h.charAt(0)==='#' || /^(https?:|mailto:|tel:)/.test(h)) return;
      try{ sessionStorage.setItem('pf2-scroll', String(window.scrollY||0)); }catch(e){}
    });
  })();

  /* ---- 검증 라인 순차 등장 ---- */
  var checks=[].slice.call(document.querySelectorAll('.check'));
  if(checks.length && 'IntersectionObserver' in window &&
     !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        var group=[].slice.call(e.target.parentNode.children);
        var i=group.indexOf(e.target);
        setTimeout(function(){ e.target.classList.add('in'); }, Math.min(i,8)*70);
        io.unobserve(e.target);
      });
    }, {rootMargin:'0px 0px -12% 0px', threshold:.15});
    checks.forEach(function(c){ io.observe(c); });
  } else {
    checks.forEach(function(c){ c.classList.add('in'); });
  }

  /* ---- scroll spy ---- */
  var links=[].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if(!links.length) return;
  var map={};
  links.forEach(function(a){
    var el=document.querySelector(a.getAttribute('href'));
    if(el) map[el.id]=a;
  });
  var t=Object.keys(map).map(function(id){ return document.getElementById(id); });
  if(!('IntersectionObserver' in window) || !t.length) return;
  var io2=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(a){ a.classList.remove('on'); });
        map[e.target.id].classList.add('on');
      }
    });
  }, {rootMargin:'-70px 0px -66% 0px', threshold:0});
  t.forEach(function(x){ io2.observe(x); });
})();

/* ==========================================================
   Task Modal — 케이스 카드를 태스크 창으로 열기
   ========================================================== */
(function(){
  var cases = [].slice.call(document.querySelectorAll('a.case[href$=".html"]'));
  if(!cases.length || !window.fetch || !window.DOMParser) return;   // 미지원 → 일반 링크로 동작

  var cache = {}, lastFocus = null, back = null, open = false;

  function build(){
    back = document.createElement('div');
    back.className = 'tm-back';
    back.setAttribute('role','dialog');
    back.setAttribute('aria-modal','true');
    back.innerHTML =
      '<div class="tm" role="document">' +
        '<div class="tm-tabs">' +
          '<div class="tm-seg" role="tablist">' +
            '<button type="button" class="on" data-tab="task" role="tab" aria-selected="true">' +
              '<span class="ic">📋</span><span class="tx">' +
              '<span class="tt">개요</span><span class="sb">문제 · 한 일 · 결과</span></span></button>' +
            '<button type="button" data-tab="detail" role="tab" aria-selected="false">' +
              '<span class="ic">🔍</span><span class="tx">' +
              '<span class="tt">상세 기록</span><span class="sb">설계 판단 · 운영 화면</span></span>' +
              '<span class="ct">0</span></button>' +
          '</div>' +
          '<button type="button" class="tm-x" aria-label="닫기">✕</button>' +
        '</div>' +
        '<div class="tm-body"></div>' +
        '<div class="tm-foot">' +
          '<span class="meta"></span>' +
          '<button type="button" class="tm-btn tm-close">닫기</button>' +
          '<a class="tm-btn pri tm-full" href="#">전체 페이지로 열기 →</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(back);

    back.addEventListener('click', function(e){
      if(e.target === back) close();
      if(e.target.closest('.tm-x, .tm-close')) close();
      var tab = e.target.closest('[data-tab]');
      if(tab) switchTab(tab.dataset.tab);
    });
    document.addEventListener('keydown', function(e){
      if(!open) return;
      if(e.key === 'Escape'){ close(); return; }
      if(e.key === 'ArrowRight'){ cycleTab(1); e.preventDefault(); return; }
      if(e.key === 'ArrowLeft'){ cycleTab(-1); e.preventDefault(); return; }
      if(e.key === 'Tab') trap(e);
    });
  }

  function trap(e){
    var f = back.querySelectorAll('button, a[href], summary, [tabindex]:not([tabindex="-1"])');
    if(!f.length) return;
    var first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
  }

  function switchTab(name){
    [].slice.call(back.querySelectorAll('.tm-seg .pulse')).forEach(function(b){ b.classList.remove('pulse'); });
    [].slice.call(back.querySelectorAll('[data-tab]')).forEach(function(b){
      var on = b.dataset.tab === name;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var body = back.querySelector('.tm-body');
    body.removeAttribute('data-anim');
    [].slice.call(body.querySelectorAll('[data-pane]')).forEach(function(p){
      p.style.display = (p.dataset.pane === name) ? '' : 'none';
    });
    void body.offsetWidth;                 // 리플로우 → 애니메이션 재생
    body.setAttribute('data-anim','1');
    body.scrollTop = 0;
  }

  function cycleTab(dir){
    var tabs = [].slice.call(back.querySelectorAll('[data-tab]'));
    var i = tabs.findIndex(function(t){ return t.classList.contains('on'); });
    if(i < 0) return;
    switchTab(tabs[(i + dir + tabs.length) % tabs.length].dataset.tab);
  }

  function esc(s){ return (s||'').replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function render(data, card){
    var body = back.querySelector('.tm-body');
    var id = card.querySelector('.case-id') ? card.querySelector('.case-id').textContent.trim() : '';
    var state = card.querySelector('.chip-st') ? card.querySelector('.chip-st').textContent.trim() : '';
    var metrics = [].slice.call(card.querySelectorAll('.metrics div')).map(function(d){
      var b = d.querySelector('b');
      return b ? '<span class="f"><b>' + esc(b.textContent.trim()) + '</b> ' +
                 esc(d.textContent.replace(b.textContent,'').trim()) + '</span>' : '';
    }).join('');

    back.querySelector('.tm-full').href = data.href;
    back.querySelector('.tm-foot .meta').textContent = id + ' · ' + data.sections + ' sections';
    var ct = back.querySelector('.tm-seg .ct');
    if(ct) ct.textContent = data.sections;

    body.innerHTML =
      '<div data-pane="task">' +
        '<div class="tm-crumb"><span class="pill">PORTFOLIO</span><span class="sep">/</span>' +
          '<span class="pill">CASES</span><span class="sep">/</span><span>' + esc(id) + '</span></div>' +
        '<h2 class="tm-title">' + esc(data.title) + '</h2>' +
        '<div class="tm-chips">' +
          (state ? '<span class="f state">' + esc(state) + '</span>' : '') +
          '<span class="f">Assignee <b>김상옥</b></span>' +
          '<span class="f">Type <b>Case Study</b></span>' +
          metrics +
        '</div>' +
        (data.psr || '') +
        '<div class="tm-prog"><div class="lb"><span>Progress</span><span>100%</span></div>' +
          '<div class="track"><div class="fill"></div></div></div>' +
        '<div class="tm-lede">' + (data.lede || '') + '</div>' +
        '<button type="button" class="tm-next" data-tab="detail">' +
          '<span class="l"><b>상세 기록 ' + data.sections + '개</b>' +
          '<em>설계 판단 · 실제 운영 화면 · 트러블슈팅</em></span>' +
          '<span class="a">→</span></button>' +
      '</div>' +
      '<div data-pane="detail" style="display:none">' + (data.detail || '') + '</div>';

    switchTab('task');
    var dt = back.querySelector('[data-tab="detail"]');
    if(dt && data.sections > 0){
      dt.classList.remove('pulse');
      void dt.offsetWidth;
      dt.classList.add('pulse');
    }
    requestAnimationFrame(function(){
      var f = body.querySelector('.tm-prog .fill');
      if(f) f.style.width = '100%';
    });
  }

  function load(href){
    if(cache[href]) return Promise.resolve(cache[href]);
    return fetch(href).then(function(r){ return r.text(); }).then(function(html){
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var h1 = doc.querySelector('.phead h1');
      var lede = doc.querySelector('.phead .lede');
      var psr = doc.querySelector('.psr');
      var wrap = doc.querySelectorAll('.wrap');
      var detail = '';
      // 본문(details 블록들)이 들어있는 마지막 .wrap
      for(var i = wrap.length - 1; i >= 0; i--){
        if(wrap[i].querySelector('details')){ detail = wrap[i].innerHTML; break; }
      }
      // 이미지 지연 로딩 유지
      var d = {
        title: h1 ? h1.textContent.trim() : '',
        lede: lede ? '<p style="font-size:14.6px;color:var(--ink2)">' + lede.innerHTML + '</p>' : '',
        psr: psr ? '<div class="tm-psr">' + psr.innerHTML + '</div>' : '',
        detail: detail,
        sections: (detail.match(/<details/g) || []).length,
        href: href
      };
      cache[href] = d;
      return d;
    });
  }

  function show(card){
    if(!back) build();
    lastFocus = document.activeElement;
    open = true;
    document.body.classList.add('tm-open');
    back.classList.add('on');
    var body = back.querySelector('.tm-body');
    body.innerHTML = '<div class="tm-load"><span>불러오는 중…</span></div>';
    back.querySelector('.tm-x').focus();

    load(card.getAttribute('href')).then(function(d){
      if(!open) return;
      try{
        render(d, card);
      }catch(err){
        // 렌더 실패는 네트워크 실패와 구분 — 모달만 닫고 페이지로 넘기지 않음
        console.error('[modal] render failed', err);
        body.innerHTML = '<div class="tm-load">내용을 표시할 수 없습니다. ' +
          '<a href="' + card.getAttribute('href') + '">전체 페이지로 열기 →</a></div>';
      }
    }).catch(function(err){
      // fetch 자체가 실패한 경우에만 이동 (file:// 등)
      console.warn('[modal] fetch failed → 페이지 이동', err);
      if(open){ close(); location.href = card.getAttribute('href'); }
    });
  }

  function close(){
    if(!open) return;
    open = false;
    back.classList.remove('on');
    document.body.classList.remove('tm-open');
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onClick(e){
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;  // 새 탭 열기는 그대로
    e.preventDefault();
    show(this);
  }
  cases.forEach(function(a){
    if(a.dataset.tmBound) return;
    a.dataset.tmBound = '1';
    a.addEventListener('click', onClick);
  });

  /* 뒤로가기(bfcache) 복원 시 모달이 열린 채 남아 있으면 정리 */
  window.addEventListener('pageshow', function(){
    if(open) close();
    document.body.classList.remove('tm-open');
    if(back) back.classList.remove('on');
  });
})();

/* ==========================================================
   Lightbox — 사진·영상을 누르면 확대, 다시 누르면 닫힘
   모달 안에 나중에 들어온 사진에도 동작하도록 문서 전체에서 위임 처리
   ========================================================== */
(function(){
  var lb = null, last = null;

  function build(){
    lb = document.createElement('div');
    lb.className = 'zoom';
    lb.setAttribute('role','dialog');
    lb.setAttribute('aria-modal','true');
    lb.setAttribute('aria-label','확대 보기');
    lb.innerHTML = '<button type="button" class="x" aria-label="닫기">✕</button>' +
                   '<div class="media"></div><div class="cap"></div>' +
                   '<div class="hint">← 옆으로 밀어서 보기 →</div>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function(e){
      // 영상 컨트롤바를 누른 경우는 닫지 않음
      if(e.target.tagName === 'VIDEO' && e.offsetY > e.target.clientHeight - 48) return;
      close();
    });
  }

  function open(el){
    if(!lb) build();
    last = document.activeElement;
    var media = lb.querySelector('.media'), fig = el.closest('figure');
    var cap = fig && fig.querySelector('figcaption');
    media.innerHTML = '';
    var node;
    if(el.tagName === 'VIDEO'){
      node = document.createElement('video');
      node.src = el.currentSrc || el.src;
      node.muted = true; node.loop = true; node.autoplay = true;
      node.playsInline = true; node.controls = true;
      try{ node.currentTime = el.currentTime || 0; }catch(e){}
      if(el.poster) node.poster = el.poster;
    } else {
      node = document.createElement('img');
      node.src = el.currentSrc || el.src;
      node.alt = el.alt || '';
    }
    media.appendChild(node);
    lb.querySelector('.cap').textContent = cap ? cap.textContent.trim() : '';
    // 휴대폰에서 가로로 긴 사진은 옆으로 밀어서 보게
    var w = el.naturalWidth || el.videoWidth || 0, h = el.naturalHeight || el.videoHeight || 1;
    lb.classList.toggle('wide', node.tagName === 'IMG' && w / h > 1.25 && window.innerWidth <= 640);
    lb.classList.add('on');
    lb.scrollTop = 0; lb.scrollLeft = 0;
    document.body.classList.add('zoom-open');
    lb.querySelector('.x').focus();
  }

  function close(){
    if(!lb || !lb.classList.contains('on')) return;
    lb.classList.remove('on');
    var v = lb.querySelector('video'); if(v) v.pause();
    lb.querySelector('.media').innerHTML = '';
    document.body.classList.remove('zoom-open');   // 태스크 모달의 스크롤 잠금(tm-open)은 따로 유지됨
    if(last && last.focus) last.focus();
  }

  document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;
    var el = t.closest('.shot img, .demo video');
    if(!el || (lb && lb.contains(el))) return;
    e.preventDefault(); e.stopPropagation();
    open(el);
  });

  // ESC는 확대 보기를 먼저 닫고, 뒤의 태스크 모달까지 닫히지 않게 막음
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && lb && lb.classList.contains('on')){
      e.stopImmediatePropagation(); e.preventDefault(); close();
    }
  }, true);
})();
