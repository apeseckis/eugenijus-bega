// Original four-bar square-wave melody with a soft triangle bass.
// Scheduled ahead on the audio clock, independent of rendering speed.
export class Music {
  private context?: AudioContext;
  private master?: GainNode;
  private timer?: number;
  private next=0;
  private step=0;
  private active=false;
  muted=false;
  private melody=[76,79,83,79,81,79,76,74,72,76,79,76,74,71,67,71,
    69,72,76,79,78,76,74,71,72,76,79,83,81,79,76,72];
  listenForGestures(){
    // Safari needs creation/resume on the event stack, not in the next RAF.
    const unlock=(event:Event)=>{if(event.isTrusted)this.unlock();};
    const events=['pointerdown','pointerup','touchend','click','keydown'];
    for(const event of events)window.addEventListener(event,unlock,{capture:true,passive:true});
    return ()=>{for(const event of events)window.removeEventListener(event,unlock,true);};
  }
  unlock(){
    try {
      // On recent iOS, playback routing also prevents the ringer switch from
      // silencing Web Audio. Older Safari simply lacks this optional API.
      try {
        const session=(navigator as Navigator & {audioSession?:{type:string}}).audioSession;
        if(session)session.type='playback';
      } catch { /* Unsupported routing must not disable audio. */ }
      if(!this.context||this.context.state==='closed'){
        this.context=new AudioContext();
        this.master=this.context.createGain();
        this.master.gain.value=0;
        this.master.connect(this.context.destination);
        this.timer=window.setInterval(()=>this.schedule(),50);
      }
      if(this.context.state!=='running'){
        // Prime the output with silence inside the same gesture on older iOS.
        const source=this.context.createBufferSource();
        source.buffer=this.context.createBuffer(1,1,this.context.sampleRate);
        source.connect(this.context.destination);
        source.onended=()=>source.disconnect();
        source.start();
        void this.context.resume().catch(()=>{});
      }
    } catch { /* Silent gameplay remains available without Web Audio. */ }
  }
  setActive(active:boolean){
    this.active=active;
    const ctx=this.context;
    if(ctx&&this.master){
      this.master.gain.setTargetAtTime(active&&!this.muted?0.065:0,ctx.currentTime,0.04);
    }
  }
  toggle(){this.unlock();this.muted=!this.muted;this.setActive(this.active);}
  private note(midi:number,start:number,duration:number,type:OscillatorType,volume:number){
    const ctx=this.context!;
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=type;oscillator.frequency.value=440*2**((midi-69)/12);
    gain.gain.setValueAtTime(0,start);
    gain.gain.linearRampToValueAtTime(volume,start+0.008);
    gain.gain.exponentialRampToValueAtTime(0.001,start+duration);
    oscillator.connect(gain);gain.connect(this.master!);
    oscillator.start(start);oscillator.stop(start+duration+0.02);
  }
  private schedule(){
    const ctx=this.context;
    if(!ctx||ctx.state!=='running')return;
    if(!this.active||this.muted){this.next=ctx.currentTime;return;}
    if(this.next<ctx.currentTime)this.next=ctx.currentTime+0.02;
    while(this.next<ctx.currentTime+0.15){
      this.note(this.melody[this.step%32],this.next,0.12,'square',0.3);
      if(this.step%2===0)this.note([48,48,45,43][Math.floor(this.step/8)%4],this.next,0.24,'triangle',0.6);
      this.step++;this.next+=0.16;
    }
  }
  effect(kind:'leaves'|'stone'|'pit'){
    const ctx=this.context;
    if(!ctx||ctx.state!=='running'||this.muted)return;
    const start=ctx.currentTime;
    if(kind==='leaves'){
      // A soft filtered noise rustle, with a short attack and slow fade.
      const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*0.3),ctx.sampleRate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
      source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1600;filter.Q.value=0.6;
      gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(0.55,start+0.015);
      gain.gain.exponentialRampToValueAtTime(0.001,start+0.3);
      source.connect(filter);filter.connect(gain);gain.connect(this.master!);source.start(start);
    }else{
      // Football: rubbery boing. Pit: a descending cartoon whistle.
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();
      const duration=kind==='stone'?0.24:0.42;
      oscillator.type=kind==='stone'?'triangle':'sine';
      oscillator.frequency.setValueAtTime(kind==='stone'?340:780,start);
      oscillator.frequency.exponentialRampToValueAtTime(kind==='stone'?85:110,start+duration);
      gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(0.65,start+0.008);
      gain.gain.exponentialRampToValueAtTime(0.001,start+duration);
      oscillator.connect(gain);gain.connect(this.master!);
      oscillator.start(start);oscillator.stop(start+duration+0.02);
    }
  }
  destroy(){if(this.timer)window.clearInterval(this.timer);void this.context?.close();}
}
