(() => {
  const scriptUrl = new URL(document.currentScript.src);
  const ROOT = new URL('../', scriptUrl);
  const page = document.body.dataset.page || 'home';
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const link = path => new URL(path, ROOT).href;

  const navItems = [
    ['Reading','reading/'],['Gaming','gaming/'],['Notes','notes/'],['Projects','projects/']
  ];
  const moreItems = [
    ['English','english/'],['Training','training/'],['Photography','photography/'],['Lab','lab/']
  ];

  function installShell() {
    const header = $('#site-header');
    if (header) {
      header.innerHTML = `
        <div class="header-inner">
          <a class="brand" href="${link('')}">PHÁT TÀI PHÁT LỘC</a>
          <nav class="nav" id="main-nav" aria-label="Primary navigation">
            ${navItems.map(([n,p])=>`<a href="${link(p)}" ${page===n.toLowerCase()?'aria-current="page"':''}>${n}</a>`).join('')}
            <a href="${link('english/')}" ${page==='english'?'aria-current="page"':''}>More</a>
          </nav>
          <div class="header-actions">
            <button class="icon-button" id="search-button" aria-label="Search">⌕</button>
            <button class="icon-button" id="theme-button" aria-label="Toggle dark mode">◐</button>
            <button class="icon-button menu-button" id="menu-button" aria-label="Toggle menu" aria-controls="main-nav" aria-expanded="false">☰</button>
          </div>
        </div>`;
      $('#menu-button')?.addEventListener('click', e => {
        const nav = $('#main-nav'); nav.classList.toggle('open');
        e.currentTarget.setAttribute('aria-expanded', String(nav.classList.contains('open')));
      });
    }
    const footer = $('#site-footer');
    if (footer) footer.innerHTML = `<div class="footer-inner"><div><strong>PHÁT TÀI PHÁT LỘC</strong><br>Built slowly, one curiosity at a time.</div><div>Last updated · 16 Sep 2026</div></div>`;
  }

  function themeInit() {
    const saved = localStorage.getItem('ptpl-theme');
    const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = saved || preferred;
    $('#theme-button')?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('ptpl-theme', next);
    });
  }

  async function data(name) {
    const r = await fetch(new URL(`data/${name}.json`, ROOT));
    if (!r.ok) throw new Error(`Could not load ${name}.json`);
    return r.json();
  }

  function installSearch() {
    const el = document.createElement('div');
    el.className = 'search-overlay';
    el.id = 'search-overlay';
    el.innerHTML = `<div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search site">
      <input class="search-box" id="search-input" type="search" placeholder="Search books, games, notes, projects…" autocomplete="off">
      <div class="search-results" id="search-results"><div class="search-empty">Start typing to search your garden.</div></div>
    </div>`;
    document.body.appendChild(el);
    let index = null;
    const open = async () => {
      el.classList.add('open'); $('#search-input').focus();
      if (!index) {
        const [books,games,notes,projects] = await Promise.all(['books','games','notes','projects'].map(data));
        index = [
          ...books.map(x=>({type:'Book',title:x.title,meta:x.author,url:'reading/'})),
          ...games.map(x=>({type:'Game',title:x.title,meta:x.platform,url:'gaming/'})),
          ...notes.map(x=>({type:'Note',title:x.title,meta:(x.tags||[]).join(' · '),url:'notes/'})),
          ...projects.map(x=>({type:'Project',title:x.title,meta:x.status,url:'projects/'}))
        ];
      }
    };
    const close = () => el.classList.remove('open');
    $('#search-button')?.addEventListener('click', open);
    el.addEventListener('click', e => { if (e.target===el) close(); });
    document.addEventListener('keydown', e => { if (e.key==='Escape') close(); if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k') { e.preventDefault(); open(); }});
    $('#search-input').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase(); const out = $('#search-results');
      if (!q) { out.innerHTML='<div class="search-empty">Start typing to search your garden.</div>'; return; }
      const hits = (index||[]).filter(x => `${x.title} ${x.meta} ${x.type}`.toLowerCase().includes(q)).slice(0,14);
      out.innerHTML = hits.length ? hits.map(x=>`<a class="search-result" href="${link(x.url)}"><strong>${esc(x.title)}</strong><small>${esc(x.type)} · ${esc(x.meta)}</small></a>`).join('') : '<div class="search-empty">Nothing found. Try another word.</div>';
    });
  }

  const card = (icon, label, title, sub='') => `<div class="card current-card"><div class="card-icon">${icon}</div><small>${esc(label)}</small><strong>${esc(title)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</div>`;

  async function renderHome() {
    const [books,games,projects,notes,training,photo] = await Promise.all(['books','games','projects','notes','training','photography'].map(data));
    const reading = books.find(x=>x.status==='Reading') || books[0];
    const playing = games.find(x=>x.status==='Playing') || games[0];
    const project = projects.find(x=>x.status==='Active') || projects[0];
    $('#page').innerHTML = `
      <section class="hero"><div class="eyebrow">Personal digital garden</div><h1>PHÁT TÀI<br>PHÁT LỘC</h1><p>Things I read, play, build and learn. A small corner of the internet that grows one curiosity at a time.</p></section>
      <section class="section"><div class="section-head"><h2>Currently</h2><p>A quiet snapshot of what has my attention right now.</p></div>
        <div class="grid current-grid">
          ${card('📚','Reading',reading.title,reading.progress)}
          ${card('🎮','Playing',playing.title,playing.progress)}
          ${card('💻','Building',project.title,project.status)}
          ${card('🇬🇧','Learning','English speaking','30 min/day')}
          ${card('🏋️','Training',training.program,'Push / Pull / Legs')}
          ${card('📷','Shooting',photo.rolls[0].film,photo.rolls[0].status)}
        </div>
      </section>
      <section class="section"><div class="section-head"><h2>Explore</h2><p>Not categories for a brand. Just shelves in a room.</p></div><div class="grid grid-4">
        ${[
          ['📚','Reading','Books, progress, characters and spoiler-safe notes','reading/'],
          ['🎮','Gaming','A personal journey through handhelds and tactical RPGs','gaming/'],
          ['🧠','Notes','Small pieces of knowledge worth keeping','notes/'],
          ['💻','Projects','Things built to learn, solve or simply explore','projects/'],
          ['🇬🇧','English','A 30-minute speaking lab','english/'],
          ['🏋️','Training','Workouts, progression and simple records','training/'],
          ['📷','Photography','Film rolls, cameras and frames','photography/'],
          ['🧪','Lab','Tiny tools and playful experiments','lab/']
        ].map(([i,t,d,u])=>`<a class="card card-link explore-card" href="${link(u)}"><div><div class="card-icon">${i}</div><h3>${t}</h3><p>${d}</p></div><span class="arrow">Open →</span></a>`).join('')}
      </div></section>
      <section class="section grid grid-2">
        <div><div class="section-head"><h2>Recent notes</h2></div>${notes.slice(0,4).map(n=>`<div class="card note-card" style="margin-bottom:10px"><div class="note-title">${esc(n.title)}</div><p>${esc(n.summary)}</p></div>`).join('')}</div>
        <div><div class="section-head"><h2>Latest activity</h2></div><div class="timeline">
          ${[['16 Sep 2026','Created phattaiphat.loc.cc'],['15 Sep 2026','Learning about DNS'],['14 Sep 2026','Playing Fire Emblem Awakening'],['12 Sep 2026','Reading Circe']].map(([d,t])=>`<div class="timeline-item"><time>${d}</time><p>${t}</p></div>`).join('')}
        </div></div>
      </section>`;
  }

  async function renderReading() {
    const books = await data('books');
    const grouped = ['Reading','Finished','Want to Read'];
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">Reading</div><h1>Books in progress</h1><p>A reading log, memory aid and spoiler-safe companion. The point is not to finish fast; it is to remember what mattered.</p></section>
      ${grouped.map(status=>`<section class="section"><div class="section-head"><h2>${status==='Reading'?'Currently Reading':status}</h2></div><div class="grid grid-3">${books.filter(b=>b.status===status).map(b=>bookCard(b)).join('') || '<div class="empty">Nothing here yet.</div>'}</div></section>`).join('')}
      <section class="section"><div class="section-head"><h2>Reading companion · Circe</h2><p>Only information up to the current reading point is shown by default.</p></div>
        <div class="detail-layout"><div class="card detail-panel"><h2>Known so far</h2>
          <ul class="list-clean"><li><strong>Circe</strong><br><span class="meta">Daughter of Helios · nymph · central character</span></li><li><strong>Helios</strong><br><span class="meta">Circe’s father · Titan of the Sun</span></li><li><strong>Oceanos</strong><br><span class="meta">Family connection recorded in reading notes</span></li></ul>
          <div class="spoiler" aria-expanded="false" style="margin-top:16px"><button class="spoiler-toggle">Reveal note beyond current progress</button><div class="spoiler-content">This placeholder demonstrates spoiler protection. Future notes can be tagged with a chapter threshold and remain hidden until your progress reaches it.</div></div>
        </div><aside class="card"><div class="eyebrow">Current progress</div><h3 style="margin-top:8px">Chapter 6</h3><div class="progress"><span style="width:30%"></span></div><p style="margin-top:12px">Characters, places and timeline entries can carry a <code>knownAfter</code> chapter number later.</p></aside></div>
      </section>`;
    $$('.spoiler-toggle').forEach(btn=>btn.addEventListener('click',()=>{ const box=btn.closest('.spoiler'); const open=box.getAttribute('aria-expanded')==='true'; box.setAttribute('aria-expanded',String(!open)); btn.textContent=open?'Reveal note beyond current progress':'Hide spoiler note'; }));
  }

  function bookCard(b) { return `<div class="card"><div class="badge"><span class="status-dot"></span>${esc(b.status)}</div><h3>${esc(b.title)}</h3><p>${esc(b.author)}</p>${b.progress?`<div class="progress"><span style="width:${b.percent||25}%"></span></div><div class="meta" style="margin-top:8px">${esc(b.progress)}</div>`:''}</div>`; }

  async function renderGaming() {
    const games = await data('games');
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">Gaming</div><h1>Game journey</h1><p>Not a database of games. A record of where I went, what I learned, and the characters I grew attached to.</p></section>
      <div class="chips">${['Playing','Completed','Backlog','Dropped'].map((x,i)=>`<button class="chip ${i===0?'active':''}" data-filter="${x}">${x}</button>`).join('')}<button class="chip" data-filter="All">All</button></div>
      <div class="grid grid-3" id="game-grid">${games.map(gameCard).join('')}</div>
      <section class="section"><div class="section-head"><h2>Fire Emblem Awakening · current party</h2></div><div class="table-wrap"><table><thead><tr><th>Character</th><th>Class</th><th>Level</th><th>Weapon rank</th><th>Skill / note</th></tr></thead><tbody>
        ${[['Robin','Tactician','10','Sword D · Tome C','Veteran'],['Chrom','Lord','9','Sword C','Dual Strike+'],['Frederick','Great Knight','—','Sword/Lance/Axe','Strong early-game anchor'],['Lissa','Cleric','8','Staff C','Healing support']].map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div></section>
      <section class="section"><div class="section-head"><h2>Recent log</h2></div><div class="timeline">${[['16 Sep','Completed Chapter 6'],['17 Sep','Robin reached level 10'],['18 Sep','Learned how promotion works']].map(([d,t])=>`<div class="timeline-item"><time>${d}</time><p>${t}</p></div>`).join('')}</div></section>`;
    const grid = $('#game-grid');
    $$('.chip').forEach(btn=>btn.addEventListener('click',()=>{ $$('.chip').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); const f=btn.dataset.filter; grid.innerHTML=games.filter(g=>f==='All'||g.status===f).map(gameCard).join('') || '<div class="empty">Nothing here yet.</div>'; }));
  }
  function gameCard(g){ return `<div class="card"><div class="badge">${esc(g.platform)}</div><h3>${esc(g.title)}</h3><p>${esc(g.status)}${g.progress?` · ${esc(g.progress)}`:''}</p></div>`; }

  async function renderNotes() {
    const notes = await data('notes'); const tags=[...new Set(notes.flatMap(n=>n.tags||[]))];
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">Knowledge garden</div><h1>Notes</h1><p>Small pieces of knowledge. Some are five lines, some grow into branches. None need to become a “blog post”.</p></section>
      <div class="chips"><button class="chip active" data-tag="All">All</button>${tags.map(t=>`<button class="chip" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="grid grid-3" id="notes-grid">${notes.map(noteCard).join('')}</div>
      <section class="section"><div class="section-head"><h2>Today I learned</h2></div><div class="timeline">${notes.slice(0,5).map(n=>`<div class="timeline-item"><time>${esc(n.date)}</time><p><strong>${esc(n.title)}</strong><br>${esc(n.summary)}</p></div>`).join('')}</div></section>`;
    const grid=$('#notes-grid'); $$('.chip').forEach(b=>b.addEventListener('click',()=>{ $$('.chip').forEach(x=>x.classList.remove('active')); b.classList.add('active'); const t=b.dataset.tag; grid.innerHTML=notes.filter(n=>t==='All'||(n.tags||[]).includes(t)).map(noteCard).join(''); }));
  }
  function noteCard(n){ return `<article class="card note-card"><div class="note-title">${esc(n.title)}</div><div class="note-body">${esc(n.summary)}</div><div class="tags">${(n.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></article>`; }

  async function renderProjects() {
    const projects=await data('projects');
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">Projects</div><h1>Things I am building</h1><p>Not a portfolio. These are experiments, useful tools and ideas that taught me something.</p></section><div class="grid grid-2">${projects.map(p=>`<article class="card"><div class="badge">${esc(p.status)}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><ul class="list-clean" style="margin-top:12px"><li><strong>Why?</strong><br><span class="meta">${esc(p.why)}</span></li><li><strong>Learned</strong><br><span class="meta">${esc(p.learned)}</span></li><li><strong>Next idea</strong><br><span class="meta">${esc(p.next)}</span></li></ul><div class="tags">${p.tech.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></article>`).join('')}</div>`;
  }

  async function renderEnglish() {
    const topics=await data('english-topics');
    const todayKey='ptpl-english-'+new Date().toISOString().slice(0,10);
    const stats=JSON.parse(localStorage.getItem('ptpl-english-stats')||'{"days":0,"minutes":0,"streak":0}');
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">English · 30 minute speaking lab</div><h1>Speak before you feel ready</h1><p>A tiny daily routine focused on turning passive English into spoken English.</p></section><div class="dashboard">
      <div class="card"><h2>Today’s practice</h2>${[['5 min','Warm-up'],['10 min','Shadowing'],['10 min','Speaking'],['5 min','Review']].map(([m,t])=>`<div class="practice-step"><strong>${m}</strong><div><b>${t}</b><br><span class="meta">Keep it simple and continuous.</span></div></div>`).join('')}</div>
      <div class="card"><div class="eyebrow">Random topic</div><h2 id="topic" style="margin-top:8px">${esc(topics[0])}</h2><div class="button-row"><button class="secondary-button" id="new-topic">Generate another topic</button></div>
        <div class="stat-row"><div class="stat"><small>Streak</small><strong>${stats.streak}</strong><span>days</span></div><div class="stat"><small>Total days</small><strong>${stats.days}</strong><span>days</span></div><div class="stat"><small>Practice</small><strong>${stats.minutes}</strong><span>minutes</span></div></div></div>
    </div><section class="section"><div class="card"><h2>Finish line</h2><label class="practice-check"><input type="checkbox" data-check="1">Spoke continuously for 2 minutes</label><label class="practice-check"><input type="checkbox" data-check="2">Used 3 new expressions</label><label class="practice-check"><input type="checkbox" data-check="3">Recorded myself</label><label class="practice-check"><input type="checkbox" data-check="4">Reviewed mistakes</label><div class="button-row"><button class="primary-button" id="complete-practice">Complete today’s 30 minutes</button></div><div id="practice-msg" class="meta" style="margin-top:10px"></div></div></section>`;
    $('#new-topic').addEventListener('click',()=>$('#topic').textContent=topics[Math.floor(Math.random()*topics.length)]);
    if(localStorage.getItem(todayKey)==='done') $('#practice-msg').textContent='Today is already logged. Nice.';
    $('#complete-practice').addEventListener('click',()=>{
      if(localStorage.getItem(todayKey)==='done'){ $('#practice-msg').textContent='Today is already logged.'; return; }
      const done=$$('[data-check]').filter(x=>x.checked).length;
      if(done<3){ $('#practice-msg').textContent='Tick at least three review items first.'; return; }
      const s=JSON.parse(localStorage.getItem('ptpl-english-stats')||'{"days":0,"minutes":0,"streak":0}'); s.days+=1; s.minutes+=30; s.streak+=1; localStorage.setItem('ptpl-english-stats',JSON.stringify(s)); localStorage.setItem(todayKey,'done'); location.reload();
    });
  }

  async function renderTraining() {
    const t=await data('training');
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">Training</div><h1>${esc(t.program)}</h1><p>A simple personal gym log: enough information to see progression without turning the garden into a fitness platform.</p></section>
      <div class="grid grid-3">${t.recent.map(w=>`<div class="card"><div class="meta">${esc(w.date)}</div><h3>${esc(w.name)}</h3><p>${esc(w.note)}</p></div>`).join('')}</div>
      <section class="section"><div class="section-head"><h2>Exercise history</h2></div><div class="table-wrap"><table><thead><tr><th>Exercise</th><th>Current</th><th>Last session</th><th>Sets</th><th>RIR</th><th>Trend</th></tr></thead><tbody>${t.exercises.map(e=>`<tr><td><strong>${esc(e.name)}</strong></td><td>${esc(e.current)}</td><td>${esc(e.last)}</td><td>${esc(e.sets)}</td><td>${esc(e.rir)}</td><td class="trend-up">${esc(e.trend)}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  async function renderPhotography() {
    const p=await data('photography');
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">Photography</div><h1>Film rolls & frames</h1><p>A slow archive of film, cameras, notes and the occasional frame worth keeping.</p></section>
      <section><div class="section-head"><h2>Film rolls</h2></div><div class="grid grid-3">${p.rolls.map(r=>`<div class="card"><div class="badge">${esc(r.status)}</div><h3>${esc(r.film)}</h3><p>ISO ${esc(r.iso)} · ${esc(r.camera||'Camera TBD')}</p><div class="progress"><span style="width:${Math.round(r.framesUsed/r.framesTotal*100)}%"></span></div><div class="meta" style="margin-top:8px">${r.framesUsed} / ${r.framesTotal} frames · loaded ${esc(r.loaded)}</div></div>`).join('')}</div></section>
      <section class="section"><div class="section-head"><h2>Recent frames</h2><p>Placeholders keep the layout ready without using stock photos.</p></div><div class="grid grid-3">${[1,2,3].map(i=>`<div class="gallery-placeholder">Frame ${i}</div>`).join('')}</div></section>`;
  }

  async function renderLab() {
    const topics=await data('english-topics');
    const questions=['What did you notice today that you normally ignore?','What hobby would you keep even if nobody saw it?','What small tool would make your week easier?','What did you learn recently that changed how you see something?'];
    $('#page').innerHTML = `<section class="page-hero"><div class="eyebrow">Lab</div><h1>Small experiments</h1><p>A playground for tiny tools. Useful is optional; curiosity is enough.</p></section><div class="tool-grid">
      <div class="card tool-card"><h3>🎲 Random English Topic</h3><p id="lab-topic">${esc(topics[2])}</p><div class="button-row"><button class="secondary-button" id="lab-topic-btn">Another one</button></div></div>
      <div class="card tool-card"><h3>🏋️ Plate Calculator</h3><p>Enter target barbell weight. Assumes a 20 kg bar and common plates.</p><input id="plate-weight" type="number" min="20" step="2.5" value="60"><div class="button-row"><button class="secondary-button" id="plate-btn">Calculate</button></div><div class="tool-output" id="plate-output"></div></div>
      <div class="card tool-card"><h3>📐 Unit Converter</h3><input id="unit-value" type="number" value="10"><select id="unit-mode"><option value="kg-lb">kg → lb</option><option value="lb-kg">lb → kg</option><option value="km-mi">km → miles</option><option value="mi-km">miles → km</option></select><div class="tool-output" id="unit-output"></div></div>
      <div class="card tool-card"><h3>❓ Random Daily Question</h3><p id="daily-q">${esc(questions[0])}</p><div class="button-row"><button class="secondary-button" id="daily-q-btn">New question</button></div></div>
    </div><section class="section"><div class="card"><h3>Coming soon</h3><p>Pomodoro · Random Pokémon · Reading Timer · Simple Calculator</p></div></section>`;
    $('#lab-topic-btn').addEventListener('click',()=>$('#lab-topic').textContent=topics[Math.floor(Math.random()*topics.length)]);
    $('#daily-q-btn').addEventListener('click',()=>$('#daily-q').textContent=questions[Math.floor(Math.random()*questions.length)]);
    const convert=()=>{ const v=Number($('#unit-value').value||0), m=$('#unit-mode').value; const r=m==='kg-lb'?v*2.2046226218:m==='lb-kg'?v/2.2046226218:m==='km-mi'?v*0.621371:v/0.621371; $('#unit-output').textContent=`${r.toFixed(2)} ${m.endsWith('lb')?'lb':m.endsWith('kg')?'kg':m.endsWith('mi')?'miles':'km'}`; }; $('#unit-value').addEventListener('input',convert); $('#unit-mode').addEventListener('change',convert); convert();
    $('#plate-btn').addEventListener('click',()=>{ let side=(Number($('#plate-weight').value)-20)/2; if(side<0){ $('#plate-output').textContent='Target must be at least 20 kg.'; return;} const plates=[25,20,15,10,5,2.5,1.25]; const use=[]; for(const p of plates){ const n=Math.floor((side+1e-9)/p); if(n){use.push(`${p} kg × ${n}`); side-=p*n;} } $('#plate-output').textContent=side>.001?'Cannot make this exact weight with common plates.':`Each side: ${use.join(' + ') || 'no plates'}`; });
  }

  const renderers={home:renderHome,reading:renderReading,gaming:renderGaming,notes:renderNotes,projects:renderProjects,english:renderEnglish,training:renderTraining,photography:renderPhotography,lab:renderLab};
  installShell(); themeInit(); installSearch();
  (renderers[page]||renderHome)().catch(err=>{ console.error(err); $('#page').innerHTML=`<div class="empty">Could not load this page. Run the site through a local web server rather than opening the HTML file directly.</div>`; });
})();
