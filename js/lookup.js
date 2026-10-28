/* Live coin lookup from public, keyless, CORS-enabled APIs (DexScreener and GeckoTerminal), so it works on static hosting.
   A scan resolves from one fast DexScreener call; holders, ATH and the real layer history load afterwards from GeckoTerminal. */
(function(S){
 const DEX='https://api.dexscreener.com/latest/dex/tokens/',GECKO='https://api.geckoterminal.com/api/v2/networks/solana/';
 const ADDRESS=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,CACHE_KEY='genus.lookup.v1',DEEP_TTL=30*60e3,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 class LookupError extends Error{constructor(kind,message){super(message);this.kind=kind;}}
 async function getJSON(url,timeout=9000){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout);
  try{const r=await fetch(url,{signal:ctl.signal,headers:{accept:'application/json'}});if(r.status===429)throw new LookupError('ratelimit','Rate limited');if(r.status===404)throw new LookupError('notfound','Not found');if(!r.ok)throw new LookupError('network','HTTP '+r.status);return await r.json();}
  catch(e){if(e instanceof LookupError)throw e;throw new LookupError('network',e.name==='AbortError'?'Timed out':'Network unavailable');}finally{clearTimeout(timer);}}
 /* GeckoTerminal allows roughly 30 calls a minute per visitor, so calls are queued, spaced out and retried once. */
 let chain=Promise.resolve(),last=0;
 const gecko=path=>{const run=async()=>{const wait=last+2200-Date.now();if(wait>0)await sleep(wait);last=Date.now();try{return await getJSON(GECKO+path);}catch(e){if(e.kind!=='ratelimit')throw e;await sleep(7000);last=Date.now();return getJSON(GECKO+path);}};const p=chain.then(run,run);chain=p.catch(()=>{});return p;};
 const readCache=()=>{try{return JSON.parse(localStorage.getItem(CACHE_KEY))||{};}catch{return {};}};
 const writeCache=(address,data)=>{try{const all=readCache(),keep=Object.entries(all).filter(([,v])=>Date.now()-v.t<DEEP_TTL*4).slice(-30);localStorage.setItem(CACHE_KEY,JSON.stringify({...Object.fromEntries(keep),[address]:{t:Date.now(),data}}));}catch{/* The cache is an optimisation only. */}};

 /* Step 1: market snapshot. */
 async function fetchBase(address){
  address=String(address||'').trim();
  if(!ADDRESS.test(address))throw new LookupError('invalid','Not a Solana token address');
  const data=await getJSON(DEX+address);
  const pairs=(data.pairs||[]).filter(p=>p.chainId==='solana'&&(p.baseToken?.address===address||p.quoteToken?.address===address)).map(p=>p.baseToken?.address===address?p:{...p,baseToken:p.quoteToken});
  if(!pairs.length)throw new LookupError('notfound','No trading pairs found');
  pairs.sort((a,b)=>(b.liquidity?.usd||0)-(a.liquidity?.usd||0));
  const best=pairs[0],marketCap=+best.marketCap||+best.fdv||0;
  if(!(marketCap>0))throw new LookupError('notfound','No market cap reported yet');
  const created=Math.min(...pairs.map(p=>p.pairCreatedAt||Infinity));
  return {address,tokenName:String(best.baseToken.name||best.baseToken.symbol||'Unknown').trim().slice(0,50),ticker:String(best.baseToken.symbol||'').replace(/[^A-Za-z0-9]/g,'').slice(0,12).toUpperCase()||'UNKNOWN',
   marketCap,volume24h:pairs.reduce((n,p)=>n+(+p.volume?.h24||0),0),age:Number.isFinite(created)?Math.max(0,Math.floor((Date.now()-created)/864e5)):0,price:+best.priceUsd||0,
   pairs:pairs.slice(0,3).map(p=>p.pairAddress),dex:String(best.dexId||''),pairUrl:/^https:\/\/dexscreener\.com\//.test(best.url||'')?best.url:null,imageUrl:/^https:\/\//.test(best.info?.imageUrl||'')?best.info.imageUrl:null};
 }

 /* Step 2: holders, price history and a token image that can be embedded. Every part can fail without losing the find. */
 async function imageData(url){try{const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),7000);const r=await fetch(url,{signal:ctl.signal,mode:'cors'});clearTimeout(timer);if(!r.ok)return null;const bitmap=await createImageBitmap(await r.blob()),scale=Math.min(1,256/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/png');}catch{return null;}}
 async function enrich(base){
  const cached=readCache()[base.address];if(cached&&Date.now()-cached.t<DEEP_TTL)return cached.data;
  const out={holders:null,candles:null,image:null,errors:[]};
  try{const info=(await gecko(`tokens/${base.address}/info`)).data?.attributes;if(Number.isFinite(+info?.holders?.count))out.holders=+info.holders.count;const img=info?.image_url;if(/^https:\/\//.test(img||'')&&!/missing/i.test(img))out.image=img;}catch(e){out.errors.push('info:'+e.kind);}
  for(const pair of base.pairs.slice(0,2)){
   try{let list=(await gecko(`pools/${pair}/ohlcv/day?limit=1000&currency=usd`)).data?.attributes?.ohlcv_list||[];
    if(list.length<8){const hourly=(await gecko(`pools/${pair}/ohlcv/hour?limit=1000&currency=usd`)).data?.attributes?.ohlcv_list||[];if(hourly.length>list.length)list=hourly;}
    if(list.length>=3){out.candles=list.filter(c=>c.every(Number.isFinite)).sort((a,b)=>a[0]-b[0]);break;}}
   catch(e){out.errors.push('history:'+e.kind);if(e.kind!=='notfound')break;}
  }
  out.imageData=out.image?await imageData(out.image):null;
  if(out.holders!==null||out.candles)writeCache(base.address,{holders:out.holders,candles:out.candles,image:out.image,imageData:out.imageData,errors:out.errors});
  return out;
 }

 /* Turn daily or hourly candles into real era dates, faults and a market-cap trail. */
 const eraFields=(generation,mc)=>{const gens=S.evolution.thresholds.generations,target=gens[generation]||mc*2,base=gens[generation-1]||0;return {nextEvolutionRequirement:target,evolutionProgress:Math.min(99,Math.max(0,Math.round((mc-base)/(target-base)*100)))};};
 function readSeries(base,candles){
  if(!candles||candles.length<3||!(base.price>0))return null;
  const supply=base.marketCap/base.price,series=candles.map(c=>({t:c[0]*1000,mc:c[4]*supply,high:c[2]*supply})).filter(p=>p.mc>0);
  if(series.length<3)return null;series.push({t:Date.now(),mc:base.marketCap,high:base.marketCap});return series;
 }
 function readHistory(species,series){
  const gens=S.evolution.thresholds.generations,day=t=>new Date(t).toISOString().slice(0,10),genOf=mc=>Math.max(1,gens.filter(t=>mc>=t).length),traits=species.secondaryTraits?.length?species.secondaryTraits:['GENESIS'];
  const events=[{date:day(series[0].t),marketCap:Math.round(series[0].mc),event:'BIRTH',trait:'GENESIS',form:1}];
  let reached=genOf(series[0].mc),peak=series[0].mc,low=0,inFault=false,faults=0;
  for(let g=2;g<=reached;g++)events.push({date:day(series[0].t),marketCap:Math.round(series[0].mc),event:`GEN ${S.roman(g)}`,trait:traits[(g-1)%traits.length],form:g});
  for(const p of series.slice(1)){
   const g=genOf(p.mc);while(reached<g){reached++;events.push({date:day(p.t),marketCap:Math.round(p.mc),event:`GEN ${S.roman(reached)}`,trait:traits[(reached-1)%traits.length],form:reached});}
   if(!inFault){if(p.mc>peak)peak=p.mc;else if(p.mc<=peak*.35&&faults<6){faults++;inFault=true;low=p.mc;events.push({date:day(p.t),marketCap:Math.round(p.mc),event:'MUTATION',trait:'SCARRED',form:reached,description:`${Math.round((1-p.mc/peak)*100)}% drawdown. A fault line formed, and the layer held.`});}}
   else{low=Math.min(low,p.mc);if(p.mc>=low*3){inFault=false;peak=p.mc;}}
  }
  const lastDay=day(series.at(-1).t);for(let g=reached+1;g<=species.generation;g++)events.push({date:lastDay,marketCap:Math.round(series.at(-1).mc),event:`GEN ${S.roman(g)}`,trait:traits[(g-1)%traits.length],form:g});
  const pick=Math.min(40,series.length),trail=Array.from({length:pick},(_,i)=>Math.round(series[Math.round(i*(series.length-1)/Math.max(1,pick-1))].mc));
  const days=Math.max(1,Math.round((series.at(-1).t-series[0].t)/864e5));if(species.age>days+7)events[0].description='Earliest price data available. This coin is older than its tracked history.';
  return {events,faults,reached,trail,days};
 }

 /* Build or update a saved find from a snapshot and optional enrichment. */
 function build(base,existing,enr){
  const series=readSeries(base,enr?.candles),seriesAth=series?Math.max(...series.map(p=>p.high)):0;
  const holdersKnown=Number.isFinite(enr?.holders)||(existing&&!existing.holdersUnknown);
  const holders=Number.isFinite(enr?.holders)?enr.holders:existing&&!existing.holdersUnknown?existing.holders:0;
  const image=enr?.imageData||(existing?.originalImage?.startsWith('data:image/')?existing.originalImage:null);
  let s=S.evolution.analyze({contractAddress:base.address,tokenName:base.tokenName,ticker:base.ticker,marketCap:base.marketCap,athMarketCap:Math.max(existing?.athMarketCap||0,base.marketCap,seriesAth),volume24h:base.volume24h,holders,age:Math.max(base.age,existing?.age||0),originalImage:image||undefined,description:existing?.description},existing||null);
  s={...s,originalImage:image,speciesImage:s.speciesImage,holdersUnknown:!holdersKnown};
  const prior=existing?.live||{};
  let live={source:'DEXSCREENER',dex:base.dex,pairUrl:base.pairUrl,updatedAt:new Date().toISOString(),enrichedAt:enr?new Date().toISOString():prior.enrichedAt||null,history:prior.history||'none',days:prior.days||0,pairs:base.pairs,remoteImage:enr?.image||prior.remoteImage||base.imageUrl||null};
  if(series){const h=readHistory(s,series);s.generation=Math.max(s.generation,h.reached);Object.assign(s,eraFields(s.generation,s.marketCap));s.evolutionHistory=h.events;s.marketHistory=h.trail;s.mutationCount=h.faults;live={...live,history:'series',days:h.days};}
  s.remoteImage=live.remoteImage;s.live=live;return s;
 }
 const save=species=>{const state=S.store.get();return S.store.save({custom:[...state.custom.filter(x=>x.id!==species.id),species]});};
 const notify=id=>document.dispatchEvent(new CustomEvent('genus:live',{detail:{id}}));
 const pending=new Set();

 S.live={
  isAddress:v=>ADDRESS.test(String(v||'').trim()),
  LookupError,
  isPending:id=>pending.has(id),
  stale:(s,ms=120000)=>!!s?.live&&Date.now()-Date.parse(s.live.updatedAt)>ms,
  /* Scan: one fast call, then the find is saved and returned. Deeper data follows with deepen(). */
  async scan(address){
   const identity=S.store.identity(),base=await fetchBase(address),id='custom-'+S.hash(base.address.toLowerCase()).toString(36),existing=S.store.get().custom.find(x=>x.id===id);
   const species=build(base,existing,null);
   if(identity!==S.store.identity())throw new LookupError('cancelled','Profile changed');
   if(!save(species))throw new LookupError('storage','Storage unavailable');
   S.store.activity(`New find unearthed: $${species.ticker}. ERA ${S.roman(species.generation)} / ${S.statusLabel(species.status)}.`);
   return species;
  },
  /* Holders, ATH and layer history, in the background. */
  async deepen(id){
   const found=S.find(id);if(!found?.live||pending.has(id))return found;
   pending.add(id);notify(id);const identity=S.store.identity();
   try{
    const base=await fetchBase(found.contractAddress),enr=await enrich(base),current=S.find(id);
    if(identity!==S.store.identity()||!current)return current;
    const next=build(base,current,{...enr,imageData:enr.imageData||null});
    if(!enr.candles&&!Number.isFinite(enr.holders))next.live={...next.live,enrichedAt:current.live.enrichedAt,history:current.live.history,days:current.live.days,partial:true};
    save(next);return next;
   }catch(e){return S.find(id);}
   finally{pending.delete(id);notify(id);}
  },
  /* Refresh market numbers; reload the deeper data only when it is older than 30 minutes. */
  async refresh(id,{force=false}={}){
   const found=S.find(id);if(!found?.live)return null;
   const identity=S.store.identity(),base=await fetchBase(found.contractAddress),next=build(base,found,null);
   if(identity!==S.store.identity())return null;save(next);notify(id);
   if(force||!found.live.enrichedAt||Date.now()-Date.parse(found.live.enrichedAt)>DEEP_TTL)this.deepen(id);
   return next;
  }
 };
})(window.SpeciesApp);
