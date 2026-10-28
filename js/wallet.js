/* Real injected Solana wallet providers. Connection shares the public key only. */
(function(S){
 const wallets={Phantom:{url:'https://phantom.com/download',symbol:'◉'},Solflare:{url:'https://solflare.com/download',symbol:'☼'}};
 let session=null,pending=false,attempt=0,cleanup=()=>{};
 const addressOf=key=>{const value=key?.toBase58?.()||key?.toString?.();return typeof value==='string'&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)?value:null;};
 const providerFor=name=>{
  if(name==='Phantom'){const p=window.phantom?.solana||window.solana;return p?.isPhantom?p:null;}
  if(name==='Solflare')return window.solflare?.isSolflare?window.solflare:null;
  return null;
 };
 const refresh=()=>{S.closeModal?.();S.render?.();};
 function release(){attempt++;cleanup();cleanup=()=>{};session=null;pending=false;S.store.deactivate();refresh();}
 function watch(provider,name){
  cleanup();const lost=()=>{if(session?.provider===provider){release();S.toast('Wallet disconnected. Your profile is saved.');}};
  const changed=publicKey=>{
   if(session?.provider!==provider)return;
   const address=addressOf(publicKey);
   if(!address){lost();return;}
   if(!S.store.activate({provider:name,address})){lost();return;}
   session.address=address;refresh();S.toast('Wallet changed. Curator profile loaded.');
  };
  provider.on?.('disconnect',lost);provider.on?.('accountChanged',changed);
  cleanup=()=>{const off=provider.removeListener?.bind(provider)||provider.off?.bind(provider);off?.('disconnect',lost);off?.('accountChanged',changed);};
 }
 function showError(message){const error=document.querySelector('#wallet-error');if(error)error.textContent=message;else S.toast(message);}
 S.wallet={
  short:address=>address.slice(0,4)+'…'+address.slice(-4),
  connected:()=>!!session,
  render(){const button=document.querySelector('#wallet-button');button.innerHTML=session?`${S.escape(this.short(session.address))} <span>⌄</span>`:'CONNECT WALLET <span>↗</span>';button.setAttribute('aria-label',session?`${session.name} curator ${session.address}`:'Connect a Solana wallet');},
  async connect(name,{silent=false}={}){
   if(pending)return;
   const provider=providerFor(name);
   if(!provider){if(!silent)showError(`Open GENUS in ${name}’s app browser, or install its browser extension and refresh this page.`);return;}
   pending=true;const current=++attempt;
   document.querySelectorAll('[data-provider]').forEach(b=>b.disabled=true);const error=document.querySelector('#wallet-error');if(error)error.textContent='Waiting for wallet approval…';
   try{
    // Phantom supports a silent trusted reconnect. Solflare is restored only
    // when its injected provider already reports an active connection.
    const response=silent&&name==='Solflare'?null:await provider.connect(silent?{onlyIfTrusted:true}:undefined);
    if(current!==attempt)return;
    const address=addressOf(provider.publicKey||response?.publicKey);
    if(!address||(provider.isConnected===false&&provider.connected!==true))throw new Error('Wallet did not provide a connected account.');
    if(!S.store.activate({provider:name,address}))throw new Error('Your curator profile could not be saved. Free some browser storage and try again.');
    session={provider,name,address};watch(provider,name);refresh();
    if(!silent){location.hash='curator';S.toast(`${name} connected. Your curator profile is ready.`);}
   }catch(error){
    if(current!==attempt)return;
    if(!silent)showError(error?.code===4001||/reject|cancel|declin/i.test(error?.message||'')?'Connection canceled. Your wallet has not been connected.':error?.message||`Could not connect to ${name}. Unlock your wallet and try again.`);
   }finally{if(current===attempt){pending=false;document.querySelectorAll('[data-provider]').forEach(b=>b.disabled=false);this.render();}}
  },
  async disconnect(){
   if(!session||pending)return;const provider=session.provider;pending=true;
   try{await provider.disconnect();if(session?.provider===provider)release();S.toast('Wallet disconnected. Your profile is saved.');}
   catch{pending=false;showError('Unable to disconnect. Try again or disconnect GENUS inside your wallet.');}
  },
  open(){
   if(session){const w=S.store.get().wallet;S.modal(`<div class="eyebrow">${S.escape(w.provider)} / SOLANA CONNECTED</div><h2 class="modal-heading">CONNECTED</h2><p class="help wallet-address">${S.escape(w.address)}</p><div class="wallet-options"><button data-wallet-link="curator">CURATOR PROFILE <span>↗</span></button><button data-wallet-link="collection">MY COLLECTION <span>↗</span></button><button data-wallet-link="pnl">MY PNL <span>↗</span></button><button id="copy-wallet">COPY ADDRESS <span>⧉</span></button><button id="disconnect-wallet">DISCONNECT <span>↗</span></button></div><p class="help">Your collection and display name are saved for this wallet on this browser.</p><p id="wallet-error" class="error-text" role="alert"></p>`);document.querySelector('#copy-wallet').onclick=()=>S.copy(w.address);document.querySelector('#disconnect-wallet').onclick=()=>this.disconnect();}
   else{
    S.modal(`<div class="eyebrow">CURATOR ACCESS / SOLANA</div><h2 class="modal-heading">CONNECT YOUR WALLET</h2><p class="modal-intro">Connect your wallet to open your curator profile. Your wallet address is your identity.</p><div class="wallet-options">${Object.entries(wallets).map(([name,w])=>`<button data-provider="${name}"><b>${w.symbol} &nbsp; ${name}</b><small>${providerFor(name)?'CONNECT ↗':'NOT DETECTED'}</small></button>`).join('')}</div><p id="wallet-error" class="error-text" role="alert"></p><p class="help">Approve the connection in your wallet. Collection and position records are saved per wallet in this browser.</p><div class="actions">${Object.entries(wallets).map(([name,w])=>`<a class="text-link" href="${w.url}" target="_blank" rel="noopener noreferrer">GET ${name.toUpperCase()} ↗</a>`).join('')}</div><button class="text-link" data-wallet-link="curator" style="margin-top:24px">CONTINUE AS GUEST ↗</button>`);
    document.querySelectorAll('[data-provider]').forEach(b=>b.onclick=()=>this.connect(b.dataset.provider));
   }
   document.querySelectorAll('[data-wallet-link]').forEach(b=>b.onclick=()=>{S.closeModal();location.hash=b.dataset.walletLink;});
  },
  async init(){if(session||pending)return;const remembered=S.store.rememberedWallet();if(!remembered||!wallets[remembered.provider])return;const provider=providerFor(remembered.provider);if(!provider)return;if(remembered.provider==='Solflare'&&!provider.isConnected&&!provider.connected)return;await this.connect(remembered.provider,{silent:true});}
 };
})(window.SpeciesApp);
