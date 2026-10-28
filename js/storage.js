/* Device-local archives are separated by the connected Solana public key. */
window.SpeciesApp = { version: 2 };
(function(S){
 const key='species.archive.v1';
 const legacyKey=['species','proto'+'type','v1'].join('.');
 const fresh=()=>({version:1,wallet:null,custom:[],modifications:{},favorites:[],discovered:[],positions:{},cardSettings:{type:'SPECIES STATUS',format:'LANDSCAPE'},profile:{name:'GENESIS KEEPER'},activity:[]});
 const empty=()=>({version:2,guest:fresh(),keepers:{},lastWallet:null});
 let archive=empty(),activeAddress=null,state;
 try{
  const saved=localStorage.getItem(key),legacy=saved?null:localStorage.getItem(legacyKey),parsed=JSON.parse(saved||legacy);
  if(parsed?.version===2)archive={...empty(),...parsed,guest:{...fresh(),...parsed.guest},keepers:parsed.keepers||{}};
  else if(parsed?.version===1)archive={...empty(),guest:{...fresh(),...parsed,wallet:null}};
  if(parsed?.version===1||legacy){try{localStorage.setItem(key,JSON.stringify(archive));localStorage.removeItem(legacyKey);}catch{/* Retain the readable archive even when storage is full. */}}
 }catch{/* A fresh guest archive remains available when storage cannot be read. */}
 state={...archive.guest,wallet:null};
 const commit=next=>{try{localStorage.setItem(key,JSON.stringify(next));archive=next;return true;}catch{S.toast?.('Storage is full or unavailable. Download your archive or try a smaller image.');return false;}};
 const withState=(next,address=activeAddress)=>address?{...archive,keepers:{...archive.keepers,[address]:next}}:{...archive,guest:next};
 S.store={
  get:()=>state,
  identity:()=>activeAddress||'guest',
  rememberedWallet:()=>archive.lastWallet,
  save(patch){const next={...state,...patch,wallet:state.wallet};if(!commit(withState(next)))return false;state=next;return true;},
  activate(wallet){
   const next={...fresh(),...archive.keepers[wallet.address],wallet};
   const nextArchive={...withState(next,wallet.address),lastWallet:wallet};
   if(!commit(nextArchive))return false;
   activeAddress=wallet.address;state=next;return true;
  },
  deactivate(){
   // Wallet session changes must take effect even if storage becomes unavailable.
   const nextArchive={...archive,lastWallet:null};
   if(!commit(nextArchive))archive=nextArchive;
   activeAddress=null;state={...archive.guest,wallet:null};
  },
  reset(){const next={...fresh(),wallet:state.wallet};if(!commit(withState(next)))return false;state=next;return true;},
  activity(message){return this.save({activity:[{message,time:new Date().toISOString()},...state.activity].slice(0,40)});}
 };
 S.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 S.money=(v,full=false)=>{if(full)return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);return '$'+(v>=1e9?(v/1e9).toFixed(2)+'B':v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(1)+'K':Math.round(v));};
 S.roman=n=>['','I','II','III','IV','V','VI','VII','VIII','IX','X'][n]||n;
 S.hash=str=>{let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
})(window.SpeciesApp);
