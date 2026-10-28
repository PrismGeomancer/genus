/* Five-second intro: a wall of computers, each showing a genus. The camera glides in and pushes through the centre screen into the page. */
(function(S){
 let finish;S.introDone=new Promise(r=>{finish=r;});
 const root=document.documentElement,overlay=document.querySelector('#intro');
 S.intro={replay(){try{sessionStorage.removeItem('genus.intro');}catch{/* Storage can be unavailable. */}location.reload();}};
 if(!overlay||!root.classList.contains('intro-active')){root.classList.remove('intro-active');overlay?.remove();finish();return;}
 try{sessionStorage.setItem('genus.intro','1');}catch{/* The intro simply replays next visit. */}
 const DURATION=5000,ZOOM_END=4700,FADE_AT=4350,e=S.escape,P=1100,vw=innerWidth,vh=innerHeight,portrait=vw<vh*.9;
 const sw=portrait?Math.min(vw*.74,420):Math.min(vw*.3,560),sh=portrait?sw*.62:sw*vh/vw;
 const endScale=Math.max(vw/sw,vh/sh)*1.04,startScale=portrait?.42:.36,z0=P*(1-1/startScale),z1=P*(1-1/endScale);
 /* x and y are in screen widths, z in px, ry in degrees, k scales the monitor. */
 const layout=[['bonk',-1.55,-.1,-150,24,.92],['wif',1.55,-.08,-170,-24,.92],['popcat',-.92,-.74,-420,12,.8],['pnut',.98,-.78,-450,-12,.8],['goat',-.82,.8,-300,10,.8],['fartcoin',.88,.78,-330,-10,.8],['pengu',-2.7,.12,-720,32,.9],['mog',2.7,.06,-740,-32,.9],['spx',0,-1.12,-900,0,1],['rugrat',.02,1.08,-640,0,.85]];
 const find=id=>S.all().find(s=>s.id===id);
 const monitor=(s,x,y,z,ry,k,i)=>{const w=sw*k,h=sh*k,fossil=s.status==='EXTINCT';
  return `<div class="pc" style="--w:${w.toFixed(1)}px;--h:${h.toFixed(1)}px;transform:translate3d(${(x*sw).toFixed(1)}px,${(y*sw).toFixed(1)}px,${z}px) rotateY(${ry}deg);--d:${(i*90+120)}ms"><div class="pc-inner" style="--bd:${(i*-.7).toFixed(1)}s"><div class="pc-bezel"><div class="pc-screen"><div class="pc-bar"><i></i><i></i><i></i><span>GENUS.EXE — $${e(s.ticker)}</span></div><div class="pc-body"><img class="pc-art" src="${e(S.strata(s,{labels:false}))}" alt=""><div class="pc-data"><b>$${e(s.ticker)}</b><span>${fossil?'FOSSIL':'ERA '+S.roman(s.generation)+' · '+(S.eraNames[s.generation]||'')}</span><div class="pc-meter"><i style="--w:${s.health}%"></i></div><span>MC ${S.money(s.marketCap)}</span><span class="pc-line" style="--c:${14+i%3*3}ch">&gt; reading layers…</span><span class="pc-line l2" style="--c:${12+i%4*2}ch">&gt; ${s.mutationCount} faults logged</span></div></div><div class="pc-scan"></div></div><span class="pc-led"></span></div><div class="pc-stand"><i></i><b></b></div></div></div>`;};
 const hero=`<div class="pc pc-main" style="--w:${sw.toFixed(1)}px;--h:${sh.toFixed(1)}px;transform:translate3d(0,0,0)"><div class="pc-inner" style="--bd:0s"><div class="pc-bezel"><div class="pc-screen"><div class="pc-bar"><i></i><i></i><i></i><span>GENUS.EXE — MARKET RECORD</span></div><div class="pc-brand"><img class="pc-symbol" src="assets/logo/genus-symbol.svg" alt=""><img class="pc-word" src="assets/logo/genus-type.svg" alt="GENUS"><span>EVERYTHING LEAVES A TRACE.</span></div><div class="pc-layers"><i></i><i></i><i></i><i></i><i></i></div><div class="pc-scan"></div></div><span class="pc-led"></span></div><div class="pc-stand"><i></i><b></b></div></div></div>`;
 overlay.style.setProperty('--sw',sw+'px');
 overlay.innerHTML=`<div class="intro-stage" style="perspective:${P}px"><div class="intro-world"><div class="intro-floor"></div>${layout.map(([id,x,y,z,ry,k],i)=>monitor(find(id),x,y,z,ry,k,i)).join('')}${hero}</div></div><div class="intro-vignette"></div><div class="intro-hud"><span>GENUS // MARKET RECORD</span><span>CAM 01 · DOLLY IN</span><span class="intro-time">00:00.0</span></div><div class="intro-progress"><i></i></div><button class="intro-skip" type="button">SKIP ▸</button>`;
 const world=overlay.querySelector('.intro-world'),time=overlay.querySelector('.intro-time'),bar=overlay.querySelector('.intro-progress i'),skip=overlay.querySelector('.intro-skip');
 let start=0,frame=0,done=false,fading=false;
 function leave(fast){if(done)return;done=true;cancelAnimationFrame(frame);root.classList.remove('intro-active');overlay.classList.add('leaving');if(fast)overlay.classList.add('fast');finish();setTimeout(()=>{overlay.remove();},fast?400:620);removeEventListener('keydown',onKey);}
 const onKey=ev=>{if(['Escape','Enter',' '].includes(ev.key)){ev.preventDefault();leave(true);}};addEventListener('keydown',onKey);
 skip.onclick=ev=>{ev.stopPropagation();leave(true);};overlay.addEventListener('click',()=>leave(true));skip.focus({preventScroll:true});
 function step(now){if(done)return;if(!start)start=now;const ms=Math.min(DURATION,now-start),t=ms/DURATION,g=Math.pow(Math.min(1,ms/ZOOM_END),2.2);
  const scale=startScale*Math.pow(endScale/startScale,g),z=P*(1-1/scale),calm=1-Math.pow(Math.min(1,ms/ZOOM_END),1.6),swayY=Math.sin(t*3.1)*5*calm,swayX=Math.cos(t*2.3)*2*calm;
  world.style.transform=`translateZ(${z.toFixed(1)}px) rotateX(${swayX.toFixed(2)}deg) rotateY(${swayY.toFixed(2)}deg) translate3d(${(Math.sin(t*2)*40*calm).toFixed(1)}px,${(-30*calm).toFixed(1)}px,0)`;
  time.textContent='00:'+(ms/1000).toFixed(1).padStart(4,'0');bar.style.transform=`scaleX(${t.toFixed(3)})`;
  if(ms>=FADE_AT&&!fading){fading=true;root.classList.remove('intro-active');overlay.classList.add('leaving');}
  if(ms>=FADE_AT+250)finish();
  if(ms>=DURATION){leave(false);return;}
  frame=requestAnimationFrame(step);}
 frame=requestAnimationFrame(step);
})(window.SpeciesApp);
