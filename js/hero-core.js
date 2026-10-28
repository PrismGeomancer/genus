/* One-shot hero replay: a core sample deposits layer by layer, then cracks and takes its fossil mark. Market data is never changed. */
(function(S){
 const START=700,STEP=1150,smooth=v=>v*v*(3-2*v);
 S.heroCore={dispose:null,mount(container,species){
  this.dispose?.();const host=container?.querySelector('#hero-core');if(!host)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),eras=Math.min(species.generation,10);
  let geometry=null;host.innerHTML=S.strataFor(species,{inline:true,faults:2,health:90,labels:false,onGeometry:g=>{geometry=g;}});
  const svg=host.querySelector('svg'),layers=[...svg.querySelectorAll('.layer')],bands=layers.length-1;
  const tags=geometry.bands.filter(b=>!b.reform).map(b=>{const tag=document.createElement('span');tag.className='core-tag';tag.style.top=(b.cy/5)+'%';tag.style.right=(100-(geometry.x0-14)/5)+'%';tag.innerHTML=`ERA ${S.roman(b.i+1)}<span class="nm"> · ${S.eraNames[b.i+1]||''}</span>`;host.append(tag);return tag;});
  const scan=document.createElement('div');scan.className='core-scan';host.append(scan);
  const duration=START+bands*STEP+2600,stageLabels=Array.from({length:eras},(_,i)=>`ERA ${S.roman(i+1)} / ${S.eraNames[i+1]}`);
  const wrapper=document.createElement('div');wrapper.className='hero-evolution-controls';wrapper.innerHTML=`<div class="hero-evolution-heading"><span class="eyebrow">DEPOSITION / ERA TIMELINE</span><button class="hero-evolution-toggle" type="button" aria-label="Pause hero deposition">PAUSE Ⅱ</button></div><div class="hero-evolution-stages">${stageLabels.map((_,i)=>`<span data-phase="${i}">${S.roman(i+1)}</span>`).join('')}</div><div class="hero-evolution-track"><span></span></div><span class="hero-evolution-state" aria-live="polite">AWAITING FIRST LAYER</span>`;container.append(wrapper);
  const button=wrapper.querySelector('button'),track=wrapper.querySelector('.hero-evolution-track span'),label=wrapper.querySelector('.hero-evolution-state'),phases=[...wrapper.querySelectorAll('[data-phase]')];
  let frame=0,elapsed=0,lastTime=0,paused=false,complete=false,visible=true,active=true,lastCount=-1;
  function paint(ms){
   const count=Math.max(0,Math.min(bands+1,Math.floor((ms-START)/STEP)+1));
   layers.forEach((l,i)=>l.classList.toggle('on',i<count));
   tags.forEach((t,i)=>t.classList.toggle('on',i<count));
   svg.classList.toggle('cracked',ms>START+bands*STEP+500);svg.classList.toggle('marked',ms>START+bands*STEP+1500);
   track.style.width=(Math.min(1,ms/duration)*100).toFixed(2)+'%';
   if(count!==lastCount){lastCount=count;const era=Math.max(0,Math.min(eras,count)-1);label.textContent=count?stageLabels[Math.min(era,eras-1)]:'AWAITING FIRST LAYER';phases.forEach((p,i)=>{p.classList.toggle('reached',i<count);p.classList.toggle('current',i===era&&count>0);});}
  }
  function updateButton(){button.textContent=reduced.matches||complete?'REPLAY ↺':paused?'PLAY ▷':'PAUSE Ⅱ';button.setAttribute('aria-label',reduced.matches?'Show the full core sample':complete?'Replay hero deposition':paused?'Resume hero deposition':'Pause hero deposition');button.disabled=reduced.matches;}
  function finish(){elapsed=duration;complete=true;paint(duration);label.textContent=stageLabels[eras-1]+' · RECORD COMPLETE';updateButton();}
  function tick(time){if(!active)return;if(!visible||paused||document.hidden){frame=0;lastTime=0;return;}if(lastTime)elapsed+=Math.min(64,time-lastTime);lastTime=time;paint(elapsed);if(elapsed>=duration){finish();frame=0;return;}frame=requestAnimationFrame(tick);}
  function startFrame(){if(!frame&&active&&!complete&&!paused&&visible&&!document.hidden){lastTime=0;frame=requestAnimationFrame(tick);}}
  button.onclick=()=>{if(reduced.matches)return;if(complete){elapsed=0;complete=false;paused=false;lastCount=-1;svg.classList.remove('cracked','marked');paint(0);startFrame();}else{paused=!paused;lastTime=0;if(paused){cancelAnimationFrame(frame);frame=0;}else startFrame();}updateButton();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;lastTime=0;if(!visible){cancelAnimationFrame(frame);frame=0;}else startFrame();},{threshold:.12});observer.observe(container);
  const onMotion=()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;finish();}updateButton();};reduced.addEventListener('change',onMotion);
  const onVisibility=()=>{lastTime=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else startFrame();};document.addEventListener('visibilitychange',onVisibility);
  /* The replay begins once the intro has handed over to the page. */
  const begin=()=>{if(!active)return;if(reduced.matches)finish();else{paint(0);updateButton();startFrame();}};
  host.classList.add('hero-core-ready');container.classList.add('hero-is-evolving');paint(-1);S.introDone.then(begin);
  this.dispose=()=>{active=false;cancelAnimationFrame(frame);observer.disconnect();reduced.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',onVisibility);wrapper.remove();host.innerHTML='';container.classList.remove('hero-is-evolving');this.dispose=null;};
 }};
})(window.SpeciesApp);
