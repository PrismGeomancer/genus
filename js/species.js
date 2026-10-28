(function(S){
 const e=S.escape;
 S.status=s=>`<span class="status ${s.status.toLowerCase()}">${e(S.statusLabel(s.status))}</span>`;
 S.card=s=>`<button class="species-card" data-species="${e(s.id)}" aria-label="Open ${e(s.ticker)} find"><div class="card-art"><span class="art-id">FIND / ${String(s.number).padStart(5,'0')}</span><span class="generation">ERA ${S.roman(s.generation)}</span><img src="${e(S.art(s))}" alt="${e(s.scientificName)} strata core sample" loading="lazy"><div class="dna-hover">RECORD // ${s.secondaryTraits.map(e).join(' · ')}<br>${s.mutationCount} FAULTS · ${s.extinctionEventsSurvived} EVENTS SURVIVED</div></div><div class="card-body"><div class="card-title"><h3>$${e(s.ticker)}</h3>${S.status(s)}</div><p class="scientific">${e(s.scientificName)}</p><div class="card-stats"><span>MC <b>${S.money(s.marketCap)}</b></span><span>HEALTH <b>${s.health}%</b></span></div><div class="health-track"><span style="width:${s.health}%;${s.health<25?'background:var(--orange)':''}"></span></div><div class="card-foot"><span class="trait-pill">${e(s.primaryTrait)}</span><span>${s.evolutionProgress}% TO NEXT ERA</span></div><div class="progress-track card-evolution"><span style="width:${s.evolutionProgress}%"></span></div><p class="card-next">NEXT ERA: ${S.money(s.nextEvolutionRequirement)} MC</p></div></button>`;
 S.filters=['TRENDING','NEWLY FOUND','DEEPEST ERA','FAULTED','CRITICAL','ANCIENT'];
 S.filtered=(tab,query='')=>{let all=S.all().filter(s=>s.status!=='EXTINCT');if(tab==='FAULTED')all=all.filter(s=>s.status==='MUTATING');if(tab==='CRITICAL')all=all.filter(s=>s.health<25);if(tab==='ANCIENT')all=all.filter(s=>s.age>=730||s.primaryTrait==='ANCIENT');if(tab==='DEEPEST ERA')all.sort((a,b)=>b.generation-a.generation||b.evolutionProgress-a.evolutionProgress);if(tab==='NEWLY FOUND')all.sort((a,b)=>Date.parse(b.discoveredAt)-Date.parse(a.discoveredAt));if(tab==='TRENDING')all.sort((a,b)=>b.volume24h-a.volume24h);return all.filter(s=>(s.ticker+' '+s.tokenName+' '+s.scientificName+' '+s.contractAddress).toLowerCase().includes(query.toLowerCase()));};
 S.tabs=(labels,active,attribute='data-filter')=>`<div class="tabs" role="tablist">${labels.map(t=>`<button role="tab" aria-selected="${t===active}" class="${t===active?'active':''}" ${attribute}="${e(t)}">${e(t)}</button>`).join('')}</div>`;
 S.empty=(text,action='SCAN A COIN')=>`<div class="empty"><h3>NOTHING HERE YET.</h3><p>${text}</p><button class="button" data-discover>${action} ↗</button></div>`;
 S.originalMeme=s=>{
 const image=s.demo?s.originalImage:s.originalImage?.startsWith('data:image/')?s.originalImage:/^https:\/\//.test(s.remoteImage||'')?s.remoteImage:null;
 return `<div class="original-meme">${image?`<button class="original-meme-image" data-original-image="${e(s.id)}" aria-label="View original ${e(s.tokenName)} image"><img referrerpolicy="no-referrer" src="${e(image)}" alt="Original ${e(s.tokenName)} token image"><span aria-hidden="true">↗</span></button>`:'<div class="original-meme-missing" aria-hidden="true">⌁</div>'}<div><span class="eyebrow">ORIGINAL MEME</span><strong>${e(s.tokenName)} <span>$${e(s.ticker)}</span></strong><p>${image?'The token that left this record.':s.demo?'Archive find. No source token image.':'No token image uploaded.'}</p></div></div>`;
 };

})(window.SpeciesApp);
/* Uploaded token art is embedded as a fossil medallion by the strata generator; no baking step is needed. */
(function(S){
 S.createSpecimenArt=async species=>({...species,customArt:true});
})(window.SpeciesApp);
