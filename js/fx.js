/* Motion and polish: scroll reveals, count-ups, card tilt, cursor glow and the sticky header state. */
(function(S){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const revealSelector='.section-head,.page-heading>div,.species-card,.story-band>*,.ecosystem-stats>div,.tomb,.position-row,.evolution-node,.keeper-stats .metric,.metric-grid .metric,.event-banner,.badge,.simulate,.dna-panel>div,.settings,.original-meme,tbody tr,.empty';
 const seen=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;seen.unobserve(el);el.classList.add('in');if(el.dataset.count!==undefined)countUp(el);}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 function countUp(el){const target=parseFloat(el.dataset.count),decimals=+el.dataset.decimals||0,suffix=el.dataset.suffix||'';if(!Number.isFinite(target)||reduced.matches){return;}const t0=performance.now(),dur=1100;const tick=now=>{const p=Math.min(1,(now-t0)/dur),v=target*(1-Math.pow(1-p,3));el.textContent=(decimals?v.toFixed(decimals):Math.round(v).toLocaleString('en-US'))+suffix;if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);}
 S.fx={
  /* Tag newly rendered elements. Content stays visible without motion or IntersectionObserver. */
  scan(root=document){if(reduced.matches)return;let i=0;root.querySelectorAll(revealSelector).forEach(el=>{if(el.classList.contains('reveal'))return;el.classList.add('reveal');el.style.setProperty('--d',(i++%6)*70+'ms');seen.observe(el);});root.querySelectorAll('[data-count]').forEach(el=>{if(el.dataset.armed)return;el.dataset.armed='1';el.textContent=(el.dataset.suffix?(0).toFixed(+el.dataset.decimals||0):'0')+(el.dataset.suffix||'');seen.observe(el);});}
 };
 /* Header gains a frosted state once the page moves. */
 const header=document.querySelector('.header'),onScroll=()=>header.classList.toggle('scrolled',scrollY>24);addEventListener('scroll',onScroll,{passive:true});onScroll();
 /* Cards tilt toward the pointer and catch a moving highlight. */
 let tiltEl=null;
 const clearTilt=()=>{if(tiltEl){tiltEl.style.removeProperty('--rx');tiltEl.style.removeProperty('--ry');tiltEl=null;}};
 document.addEventListener('pointermove',ev=>{
  const hero=document.querySelector('.hero');if(hero){const r=hero.getBoundingClientRect();if(ev.clientY>=r.top&&ev.clientY<=r.bottom){hero.style.setProperty('--mx',(ev.clientX-r.left)+'px');hero.style.setProperty('--my',(ev.clientY-r.top)+'px');if(!reduced.matches){const scene=document.querySelector('#habitat');if(scene){scene.style.setProperty('--px',((ev.clientX/innerWidth-.5)*2).toFixed(3));scene.style.setProperty('--py',((ev.clientY/innerHeight-.5)*2).toFixed(3));}}}}
  if(reduced.matches||!fine.matches)return;const card=ev.target.closest?.('.species-card');if(!card){clearTilt();return;}if(tiltEl&&tiltEl!==card)clearTilt();tiltEl=card;const r=card.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;card.style.setProperty('--ry',((x-.5)*9).toFixed(2)+'deg');card.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg');card.style.setProperty('--sx',(x*100).toFixed(1)+'%');card.style.setProperty('--sy',(y*100).toFixed(1)+'%');
 },{passive:true});
 document.addEventListener('pointerleave',clearTilt,true);
 document.addEventListener('click',ev=>{const replay=ev.target.closest('[data-replay-intro]');if(replay){ev.preventDefault();S.intro.replay();}});
})(window.SpeciesApp);
