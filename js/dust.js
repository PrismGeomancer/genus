/* Hero atmosphere: drifting sediment dust on a 2D canvas, with a soft pointer parallax. No WebGL needed. */
(function(S){
 const colors=['#efe6d2','#e8c98f','#d99a4e','#b5622f'];
 S.scene={dispose:null,mount(container){this.dispose?.();if(!container)return;
  const mobile=innerWidth<760,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;canvas.className='dust-canvas';canvas.setAttribute('aria-hidden','true');container.prepend(canvas);
  let w=0,h=0,dpr=Math.min(devicePixelRatio||1,mobile?1:1.5),parts=[],pointer={x:0,y:0},frame=0,active=true,visible=true;
  const seed=()=>({x:Math.random(),y:Math.random(),z:.3+Math.random()*.7,s:1+Math.random()*2.6,c:colors[Math.floor(Math.random()*colors.length)],v:.00003+Math.random()*.00007,p:Math.random()*6.28,sq:Math.random()<.45});
  const resize=()=>{w=container.clientWidth;h=container.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);};
  const count=mobile?34:70;parts=Array.from({length:count},seed);resize();
  const observer=new ResizeObserver(resize);observer.observe(container);
  const move=ev=>{pointer.x=(ev.clientX/innerWidth-.5);pointer.y=(ev.clientY/innerHeight-.5);};window.addEventListener('pointermove',move,{passive:true});
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;},{threshold:0});io.observe(container);
  let last=0;
  const draw=time=>{if(!active)return;frame=requestAnimationFrame(draw);if(!visible||document.hidden)return;const dt=Math.min(64,time-last||16);last=time;ctx.clearRect(0,0,w,h);
   /* faint drifting strata lines */
   ctx.lineWidth=1;for(let k=0;k<6;k++){const y=((k/6+time*.00002)%1)*h;ctx.strokeStyle=`rgba(239,230,210,${.025+.02*Math.sin(time*.0004+k)})`;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
   for(const p of parts){if(!reduced){p.y-=p.v*dt*p.z*6;p.x+=Math.sin(time*.0004+p.p)*.00006*dt;}if(p.y<-.05){p.y=1.05;p.x=Math.random();}
    const x=(p.x+pointer.x*.04*p.z)*w,y=(p.y+pointer.y*.03*p.z)*h;ctx.globalAlpha=(.15+.5*p.z)*(.6+.4*Math.sin(time*.001+p.p));ctx.fillStyle=p.c;if(p.sq){ctx.save();ctx.translate(x,y);ctx.rotate(p.p+time*.0003);ctx.fillRect(-p.s/2,-p.s/2,p.s*p.z*1.6,p.s*p.z*1.6);ctx.restore();}else{ctx.beginPath();ctx.arc(x,y,p.s*p.z*.7,0,6.283);ctx.fill();}}
   ctx.globalAlpha=1;if(reduced){cancelAnimationFrame(frame);frame=0;}};
  frame=requestAnimationFrame(draw);
  this.dispose=()=>{active=false;cancelAnimationFrame(frame);observer.disconnect();io.disconnect();window.removeEventListener('pointermove',move);canvas.remove();this.dispose=null;};
 }};
})(window.SpeciesApp);
