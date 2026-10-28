/* Procedural strata art. Every find is a core sample: one band per era reached, cracks for faults. */
(function(S){
 const warm=['#4a2918','#6e3a22','#8f4a28','#b5622f','#d99a4e','#e8c98f','#efe6d2'],stone=['#26241f','#3a3834','#4d4a44','#6a665e','#8c857a','#a79f92','#c4bdae'];
 const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),toHex=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
 const mix=(a,b,t)=>{const x=hex(a),y=hex(b);return toHex(x.map((v,i)=>v+(y[i]-v)*t));};
 const ramp=(palette,t)=>{const x=Math.min(.9999,Math.max(0,t))*(palette.length-1),i=Math.floor(x);return mix(palette[i],palette[i+1],x-i);};
 const rng=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
 const cache=new Map();
 /* opts: eras, faults, health, fossil, reformed, token (data URI), label (3 letters), labels, inline */
 S.strataSVG=(opts)=>{
  const {eras=3,faults=0,health=80,fossil=false,reformed=false,token=null,label='GEN',labels=true,inline=false,seed=1}=opts;
  const r=rng(seed),n=Math.max(1,Math.min(10,eras)),uid='s'+seed.toString(36);
  const palette=fossil?stone:warm,x0=165,x1=325,dx=40,dy=-24,bottom=440,height=Math.min(350,130+40*n),top=bottom-height;
  const extra=reformed?1:0,weights=Array.from({length:n},()=>.7+r()*.6),total=weights.reduce((a,b)=>a+b,0);
  const reformH=reformed?16:0,usable=height-reformH;
  const edges=[{l:bottom,r:bottom}];let y=bottom;
  for(let i=0;i<n;i++){y-=usable*weights[i]/total;edges.push({l:y+(r()-.5)*(i===n-1?3:8),r:y+(r()-.5)*(i===n-1?3:8)});}
  if(extra)edges.push({l:top+(r()-.5)*2,r:top+(r()-.5)*2});
  const bands=edges.slice(1).map((e,i)=>{const t=n===1?.65:i/(n-1),isReform=extra&&i===n;return {i,bl:edges[i].l,br:edges[i].r,tl:e.l,tr:e.r,color:isReform?'#6fb3a8':ramp(palette,t*.92+.08*(health/100)),reform:isReform};});
  const poly=pts=>pts.map(p=>p.join(',')).join(' ');
  const lastBand=bands[bands.length-1];
  let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"${inline?' class="strata-art"':''} role="img" aria-label="Strata core sample"><defs><radialGradient id="${uid}g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${fossil?'#8c857a':'#d99a4e'}" stop-opacity=".18"/><stop offset="1" stop-color="${fossil?'#8c857a':'#d99a4e'}" stop-opacity="0"/></radialGradient><clipPath id="${uid}c"><circle cx="${x0+80}" cy="0" r="22"/></clipPath></defs>`;
  out+=`<circle cx="250" cy="275" r="205" fill="url(#${uid}g)"/><g fill="none" stroke="#efe6d2"><ellipse cx="250" cy="285" rx="228" ry="84" transform="rotate(-24 250 285)" stroke-opacity=".2"/><ellipse cx="250" cy="285" rx="196" ry="64" transform="rotate(-24 250 285)" stroke-opacity=".1" stroke-dasharray="3 7"/></g>`;
  out+=`<ellipse cx="${x0+100}" cy="${bottom+12}" rx="128" ry="16" fill="#000" opacity=".38"/>`;
  bands.forEach(b=>{
   const front=[[x0,b.bl],[x1,b.br],[x1,b.tr],[x0,b.tl]],side=[[x1,b.br],[x1+dx,b.br+dy],[x1+dx,b.tr+dy],[x1,b.tr]];
   const op=health<25&&!fossil&&b.i===bands.length-1?.55:1;
   out+=`<g class="layer" style="--i:${b.i}" opacity="${op}"><polygon points="${poly(front)}" fill="${b.color}"/><polygon points="${poly(side)}" fill="${b.color}"/><polygon points="${poly(side)}" fill="#0e0d0b" opacity=".38"/>`;
   const grain=3+Math.floor(r()*4);for(let k=0;k<grain;k++){const gx=x0+10+r()*(x1-x0-40),gy=b.tl+(b.bl-b.tl)*(.2+r()*.6);out+=`<path d="M${gx.toFixed(1)} ${gy.toFixed(1)}h${(8+r()*22).toFixed(1)}" stroke="#0e0d0b" stroke-opacity=".14" stroke-width="1.4"/>`;}
   if(b.reform)out+=`<polygon points="${poly(front)}" fill="#6fb3a8" opacity=".35"><animate attributeName="opacity" values=".15;.5;.15" dur="3s" repeatCount="indefinite"/></polygon>`;
   out+=`<path d="M${x0} ${b.tl}L${x1} ${b.tr}L${x1+dx} ${b.tr+dy}" fill="none" stroke="#0e0d0b" stroke-opacity=".5" stroke-width="1.3"/></g>`;
  });
  out+=`<g class="layer cap" style="--i:${bands.length}"><polygon points="${poly([[x0,lastBand.tl],[x1,lastBand.tr],[x1+dx,lastBand.tr+dy],[x0+dx,lastBand.tl+dy]])}" fill="${lastBand.color}"/><polygon points="${poly([[x0,lastBand.tl],[x1,lastBand.tr],[x1+dx,lastBand.tr+dy],[x0+dx,lastBand.tl+dy]])}" fill="#fff" opacity="${fossil?.05:.16}"/></g>`;
  const crackCount=Math.min(4,faults),crackStarts=[];
  for(let k=0;k<crackCount;k++){let cx=x0+(k+1)*(x1-x0)/(crackCount+1)+(r()-.5)*14,cy=lastBand.tl+(k%2?2:0),d=`M${cx.toFixed(1)} ${cy.toFixed(1)}`;crackStarts.push({x:cx,y:cy});const depth=bottom-(24+r()*60)-(1-(k+1)/(crackCount+1))*30,steps=5+Math.floor(r()*3);for(let s=1;s<=steps;s++){cx+=(r()-.5)*20;cy+=(depth-cy)/(steps-s+1);d+=`L${cx.toFixed(1)} ${cy.toFixed(1)}`;}out+=`<path class="fault" pathLength="1" d="${d}" fill="none" stroke="#0e0d0b" stroke-width="2.6" stroke-linejoin="bevel"/>`;}
  const mid=bands[Math.min(bands.length-1-extra,Math.floor(r()*Math.max(1,n)))],my=(mid.bl+mid.tl+mid.br+mid.tr)/4,mx=x0+80;
  out+=`<g class="fossil-mark" transform="translate(0 ${my.toFixed(1)})"><circle cx="${mx}" cy="0" r="25" fill="#0e0d0b" opacity=".85"/>`;
  out+=token?`<image href="${token}" x="${mx-22}" y="-22" width="44" height="44" preserveAspectRatio="xMidYMid slice" clip-path="url(#${uid}c)"${fossil?' style="filter:grayscale(1)"':''}/>`:`<text x="${mx}" y="4" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${label.length>3?11:13}" fill="${fossil?'#a79f92':'#efe6d2'}">${S.escape(label)}</text>`;
  out+=`<circle cx="${mx}" cy="0" r="25" fill="none" stroke="${fossil?'#8c857a':'#e8c98f'}" stroke-width="1.3"/></g>`;
  const dust=fossil?8:5;for(let k=0;k<dust;k++){const px=x0-40+r()*(x1-x0+130),py=fossil?bottom-6+r()*14:top-10-r()*70+(health<25?40:0),sz=2+r()*4;out+=`<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}" fill="${fossil?'#6a665e':'#e8c98f'}" opacity="${(.25+r()*.4).toFixed(2)}" transform="rotate(${Math.floor(r()*60)} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;}
  if(labels){out+=`<g font-family="SFMono-Regular,Consolas,monospace" font-size="11" fill="#9a9282" text-anchor="end" letter-spacing="1">`;bands.forEach(b=>{if(b.reform)return;const cy=(b.bl+b.tl)/2+3;out+=`<text x="${x0-20}" y="${cy.toFixed(1)}">${S.roman(b.i+1)}</text><path d="M${x0-14} ${(cy-3.5).toFixed(1)}h8" stroke="#5a4d38"/>`;});out+='</g>';}
  opts.onGeometry&&opts.onGeometry({x0,x1,dx,top:lastBand.tl,bottom,eras:n,bands:bands.map(b=>({reform:b.reform,i:b.i,cy:(b.bl+b.tl+b.br+b.tr)/4})),medallion:{x:mx,y:my},cracks:crackStarts});
  return out+'</svg>';
 };
 const options=(s,o={})=>({eras:o.form??s.generation,faults:o.faults??(s.mutationCount?Math.min(4,Math.ceil(s.mutationCount/2)):0),health:o.health??s.health,fossil:o.fossil??s.status==='EXTINCT',reformed:o.reformed??s.status==='RESURRECTED',token:o.token===undefined?(s.originalImage?.startsWith?.('data:image/')?s.originalImage:null):o.token,label:s.ticker.slice(0,4),labels:o.labels!==false,inline:!!o.inline,onGeometry:o.onGeometry,seed:S.hash(s.id+'|'+s.ticker)});
 S.strataFor=(s,o)=>S.strataSVG(options(s,o));
 S.strata=(s,o={})=>{const opt=options(s,o),key=[opt.seed,opt.eras,opt.faults,opt.health,opt.fossil,opt.reformed,opt.token?opt.token.length:0,opt.labels].join('|');let uri=cache.get(key);if(!uri){uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(S.strataSVG({...opt,inline:false}));cache.set(key,uri);}return uri;};
 S.art=s=>S.strata(s);
 /* Display vocabulary: stored status and event codes stay stable, labels follow the GENUS language. */
 const statusNames={MUTATING:'FAULTED',EXTINCT:'FOSSIL',RESURRECTED:'REFORMED'},eventNames={BIRTH:'GENESIS',MUTATION:'FAULT',RESURRECTION:'REFORMATION',EVOLUTION:'NEW ERA',EXTINCTION:'FOSSILIZED'};
 S.statusLabel=v=>statusNames[v]||v;
 S.eventLabel=v=>eventNames[v]||String(v).replace(/^GEN /,'ERA ');
 S.eraNames=['','GENESIS','DORMANT','EMERGING','ESTABLISHED','ASCENDANT','DOMINANT','SOVEREIGN','APEX','TITAN','MYTHIC'];
})(window.SpeciesApp);
