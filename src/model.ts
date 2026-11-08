import {Pursuer} from './pursuer';
import { C } from './config';
export type State = 'READY'|'RUNNING'|'PAUSED'|'CAUGHT';
export type Kind = 'leaves'|'stone'|'pit';
export interface Obstacle {id:number;kind:Kind;x:number;width:number;spent:boolean;flight?:number}
export class Chase {
  gap=100; sinceHit=Infinity; protection=0;
  tick(dt:number) {
    const previous=this.sinceHit;
    this.sinceHit+=dt; this.protection=Math.max(0,this.protection-dt);
    const recovering=Math.max(0,this.sinceHit-Math.max(previous,C.recoveryDelay));
    if(Number.isFinite(recovering)) this.gap=Math.min(100,this.gap+recovering*C.recoveryRate);
  }
  hit(obstacle:Obstacle) {
    if(obstacle.spent || this.protection>0 || obstacle.kind==='pit') return false;
    obstacle.spent=true; this.gap=Math.max(0,this.gap-(obstacle.kind==='leaves'?34:36));
    this.sinceHit=0; this.protection=C.invulnerability; return true;
  }
}
export class World {
  events:Kind[]=[]; pursuer=new Pursuer();
  state:State='READY'; chase=new Chase(); y=C.ground; vy=0; grounded=true;
  obstacles:Obstacle[]=[]; elapsed=0; distance=0; spawnIn=C.firstSpawn; nextId=0; stumble=0; falling=false;
  action() {
    if(this.state==='READY'||this.state==='CAUGHT') {this.reset();this.state='RUNNING';}
    else if(this.state==='PAUSED') this.state='RUNNING';
    else if(this.grounded&&!this.falling){this.vy=C.jump;this.grounded=false;}
  }
  reset(){Object.assign(this,new World());}
  pause(){if(this.state==='RUNNING')this.state='PAUSED';}
  togglePause(){
    if(this.state==='RUNNING')this.pause();
    else if(this.state==='PAUSED')this.state='RUNNING';
  }
  tick(dt:number){
    if(this.state!=='RUNNING')return;
    this.elapsed+=dt; this.chase.tick(dt); this.stumble=Math.max(0,this.stumble-dt);
    const speed=C.speed*(this.stumble>0?0.65:1);
    this.distance+=speed*dt/30;
    this.spawnIn-=dt;
    if(this.spawnIn<=0){
      const kind:Kind=(['leaves','stone','pit'] as const)[this.nextId%3];
      this.obstacles.push({id:this.nextId++,kind,x:1340,width:kind==='pit'?C.pitWidth:60,spent:false});
      this.spawnIn=C.spacing;
    }
    for(const o of this.obstacles){
      if(o.flight!==undefined)o.flight+=dt;
      else o.x-=speed*dt;
    }
    this.obstacles=this.obstacles.filter(o=>o.x+o.width>-100&&(o.flight===undefined||o.flight<2));
    const wasFalling=this.falling;
    const pit=this.obstacles.some(o=>o.kind==='pit'&&C.playerX>o.x+8&&C.playerX<o.x+o.width-8);
    if(this.grounded&&pit){this.grounded=false;this.falling=true;}
    if(!this.grounded){
      this.vy+=C.gravity*dt;this.y+=this.vy*dt;
      if(this.y>=C.ground&&this.vy>0){
        if(pit||this.falling)this.falling=true;
        else{this.y=C.ground;this.vy=0;this.grounded=true;}
      }
    }
    if(!wasFalling&&this.falling)this.events.push('pit');
    for(const o of this.obstacles){
      if(o.kind!=='pit'&&o.x<C.playerX+22&&o.x+o.width>C.playerX-22&&this.y>C.ground-40&&this.chase.hit(o)){
        this.stumble=0.5;this.events.push(o.kind);
        if(o.kind==='stone')o.flight=0;
      }
    }
    this.pursuer.tick(this.chase.gap,this.obstacles,dt);
    if(this.chase.gap===0||this.y>C.ground+120)this.state='CAUGHT';
  }
}
