import Phaser from 'phaser';
import {C} from './config';
import {World} from './model';
import {ActionInput} from './input';
import './style.css';
import {drawFootball,drawParrot,drawFoliage} from './scenery';
import {Music} from './music';
import {capturePose,drawTruck} from './capture';
class Runner extends Phaser.Scene {
  world=new World(); controls!:ActionInput; g!:Phaser.GameObjects.Graphics;
  title!:Phaser.GameObjects.Text; subtitle!:Phaser.GameObjects.Text; hud!:Phaser.GameObjects.Text;
  effects={leaves:0,stone:0,pit:0};
  caughtTime=0; music=new Music();
  create(){
    const stopAudioGestures=this.music.listenForGestures();
    this.events.once('shutdown',stopAudioGestures);
    this.g=this.add.graphics();
    this.title=this.add.text(640,180,'',{fontFamily:'sans-serif',fontSize:'56px',fontStyle:'bold',color:'#233e48'}).setOrigin(0.5);
    this.subtitle=this.add.text(640,252,'',{fontFamily:'sans-serif',fontSize:'25px',color:'#233e48',align:'center'}).setOrigin(0.5);
    this.hud=this.add.text(40,32,'',{fontFamily:'sans-serif',fontSize:'24px',color:'#233e48'});
    const mute=document.querySelector<HTMLButtonElement>('#music')!;
    mute.addEventListener('click',()=>{this.music.toggle();mute.textContent=this.music.muted?'Garsas: išjungtas':'Garsas: įjungtas';mute.setAttribute('aria-pressed',String(!this.music.muted));});
    this.controls=new ActionInput(()=>{this.world.pause();this.music.setActive(false);});
    this.events.once('shutdown',()=>this.music.destroy());
    this.game.events.on('blur',()=>this.world.pause());
  }
  update(_time:number,delta:number){
    const input=this.controls.poll();
    if(input.pause)this.world.togglePause();
    if(input.action){this.music.unlock();this.world.action();}
    this.music.setActive(this.world.state==='RUNNING'&&!document.hidden&&document.hasFocus());
    // Small steps keep collision and jump behavior stable through slow frames.
    let remaining=Math.min(delta/1000,0.1);
    while(remaining>0){const step=Math.min(remaining,1/120);this.world.tick(step);remaining-=step;}
    for(const kind of this.world.events.splice(0)){this.music.effect(kind);this.effects[kind]++;}
    this.caughtTime=this.world.state==='CAUGHT'?this.caughtTime+(!document.hidden&&document.hasFocus()?Math.min(delta/1000,0.1):0):0;
    this.draw();
  }
  ellipse(x:number,y:number,w:number,h:number,color:number){this.g.fillStyle(color);this.g.fillEllipse(x,y,w,h);}
  draw(){
    const w=this.world,g=this.g,t=w.elapsed;
    g.clear();g.fillStyle(0xc8eff4);g.fillRect(0,0,1280,720);
    this.ellipse(1110,100,105,105,0xffdf85);
    for(let i=0;i<7;i++){
      const x=((i*250-t*28)%1600+1600)%1600-160;
      this.ellipse(x,470,440,220,0xa6cfab);
      this.ellipse(x+90,130+(i%2)*55,130,40,0xffffff);
    }
    drawFoliage(g,t);
    const parrotVisible=drawParrot(g,t);
    g.fillStyle(0xc39768);g.fillRect(0,560,1280,160);
    g.fillStyle(0x68a968);g.fillRect(0,560,1280,17);
    for(let i=0;i<30;i++){g.fillStyle(0xb18458);g.fillRect(((i*65-t*300)%1400+1400)%1400,625+(i%3)*24,22,5);}
    for(const o of w.obstacles){
      if(o.kind==='pit'){
        g.fillStyle(0xc8eff4);g.fillRect(o.x,560,o.width,160);
        g.fillStyle(0x334d55);g.fillRect(o.x,588,o.width,132);
      }else if(o.kind==='leaves'){
        for(let j=0;j<7;j++)this.ellipse(o.x+8+j*8,548-(j%3)*7,26,18,j%2?0xd59b35:0xb86d37);
      }else{drawFootball(g,o.x,t,o.flight);}
    }
    const pose=capturePose(this.caughtTime);
    if(w.state==='CAUGHT')drawTruck(g,pose.truckX,this.caughtTime,false);
    if(w.state!=='CAUGHT'){
    const hx=w.pursuer.x;
    this.ellipse(hx,562,69,9,0x9b805b);
    g.save();g.translateCanvas(0,-w.pursuer.height-10);
    // Opposite pairs of short legs swing behind the body. Elapsed game time
    // freezes on pause, so the running pose freezes with the scenery.
    for(let i=0;i<4;i++){
      const stride=Math.sin(t*22+(i%2)*Math.PI);
      const airborne=w.pursuer.height>2;
      const hip=hx-25+i*16;
      const footX=hip+(airborne?(i<2?-5:5):stride*8);
      const footY=airborne?563:570-Math.max(0,-stride)*5;
      g.lineStyle(5,i<2?0x775143:0x916347);
      g.lineBetween(hip,550,hip+3,559);
      g.lineBetween(hip+3,559,footX,footY-2);
      this.ellipse(footX+2,footY,13,6,i<2?0x775143:0x916347);
    }
    for(let i=0;i<8;i++){g.fillStyle(0x775143);g.fillTriangle(hx-34+i*8,535,hx-29+i*8,497-(i%2)*9,hx-18+i*8,535);}
    this.ellipse(hx,537,76,43,0xb48b69);this.ellipse(hx+30,538,38,30,0xe8c99a);
    this.ellipse(hx+37,533,5,7,0x233e48);
    g.fillStyle(0x315785);g.fillRect(hx+13,514,30,9);
    this.ellipse(hx,497,22,20,Math.floor(t*6)%2?0xf25b69:0x4e8ffa);
    g.restore();
    }
    g.save();
    if(w.state==='CAUGHT')g.translateCanvas(pose.hippoX-C.playerX,pose.hippoY-C.ground);
    const y=w.state==='CAUGHT'?560:w.y;
    const bounce=w.grounded&&w.state==='RUNNING'?Math.sin(t*18)*3:0;
    const tumble=w.stumble>0;
    const bob=y+bounce;
    this.ellipse(370,564,120,13,0x9b805b);
    for(let i=0;i<2;i++)this.ellipse(342+i*57,bob-12+Math.sin(t*18+i*Math.PI)* (w.state==='RUNNING'?7:0),32,27,0x838ab9);
    this.ellipse(365,bob-61,tumble?140:125,tumble?85:110,0x959ccc);
    this.ellipse(401,bob-110,29,33,0x959ccc);
    this.ellipse(401,bob-110,15,19,0xc2b5d7);
    this.ellipse(417,bob-67,80,56,0xb0b5db);
    this.ellipse(420,bob-101,20,25,0xffffff);this.ellipse(425,bob-100,7,12,0x233e48);
    this.ellipse(444,bob-73,6,5,0x69739d);
    g.lineStyle(3,0x58638e);g.lineBetween(426,bob-51,445,bob-54);
    if(tumble)this.ellipse(347,bob-137,18,12,0xffdf85);
    g.restore();
    if(w.state==='CAUGHT'){
      drawTruck(g,pose.truckX,this.caughtTime,true);
      this.subtitle.setText('Spausk A arba SPACE — bėgam iš naujo!\nČivilis veža į morkų pertraukėlę!');
    } else this.subtitle.setText(w.state==='READY'?'Spausk A arba SPACE\nŠok per lapus, kamuolius ir duobes!':w.state==='PAUSED'?'P / Esc / Menu — tęsti (arba A / SPACE)':'');
    this.title.setText(w.state==='READY'?'Eugenijus bėga!':w.state==='CAUGHT'?'Čivilis sugavo Eugenijų!':w.state==='PAUSED'?'Morkų pertraukėlė!':'');
    this.hud.setText('PABĖGIMAS  '+Math.floor(w.distance)+' m     •     TARPAS  '+Math.ceil(w.chase.gap));
    const indicator=document.querySelector<HTMLElement>('[data-testid=state]')!;
    indicator.textContent=w.state; indicator.dataset.pursuerX=String(w.pursuer.x); indicator.dataset.pursuerHeight=String(w.pursuer.height); indicator.dataset.elapsed=String(w.elapsed); indicator.dataset.y=String(w.y); indicator.dataset.effects=JSON.stringify(this.effects); indicator.dataset.parrot=String(parrotVisible); indicator.dataset.ballFlying=String(w.obstacles.some(o=>o.flight!==undefined)); indicator.dataset.capturePhase=w.state==='CAUGHT'?pose.phase:'';
    document.querySelector('#distance')!.textContent=Math.floor(w.distance)+' m';
  }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:C.width,height:C.height,backgroundColor:'#c8eff4',audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Runner});
