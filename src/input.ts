export class ActionInput {
  private space=false; private pointer=false; private pad=false; private queued=false;
  private pauseKeys=new Set<string>(); private menu=false; private pauseQueued=false;
  constructor(private pause:()=>void){
    window.addEventListener('keydown',e=>{
      if(e.code==='KeyP'||e.code==='Escape'){
        e.preventDefault();
        if(!e.repeat&&!this.pauseKeys.has(e.code))this.pauseQueued=true;
        this.pauseKeys.add(e.code);return;
      }
      if(e.code==='Space'&&!(e.target instanceof HTMLButtonElement)){e.preventDefault();if(!this.space&&!e.repeat)this.queued=true;this.space=true;}});
    window.addEventListener('keyup',e=>{this.pauseKeys.delete(e.code);if(e.code==='Space')this.space=false;});
    window.addEventListener('pointerdown',e=>{if((e.target as HTMLElement).closest('button'))return;if(!this.pointer)this.queued=true;this.pointer=true;});
    window.addEventListener('pointerup',()=>this.pointer=false);
    window.addEventListener('pointercancel',()=>this.pointer=false);
    const blur=()=>{this.pauseKeys.clear();this.pauseQueued=false;this.queued=false;this.space=false;this.pointer=false;this.pause();};
    window.addEventListener('blur',blur);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)blur();});
  }
  poll(){
    const pads=Array.from(navigator.getGamepads?.()??[]).filter(p=>p?.connected);
    const held=pads.some(p=>p?.buttons[0]?.pressed);
    if(held&&!this.pad&&document.hasFocus()&&!document.hidden)this.queued=true;
    this.pad=held;
    const menuHeld=pads.some(p=>p?.buttons[9]?.pressed);
    if(menuHeld&&!this.menu&&document.hasFocus()&&!document.hidden)this.pauseQueued=true;
    this.menu=menuHeld;
    document.querySelector('#controller')!.textContent=pads.length?'Pultelis prijungtas · Menu: pauzė':'SPACE / paliesk · P / Esc: pauzė';
    const pause=this.pauseQueued,action=this.queued&&!pause;
    this.queued=false;this.pauseQueued=false;return {action,pause};
  }
}
