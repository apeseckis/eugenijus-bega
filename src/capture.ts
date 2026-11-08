import Phaser from 'phaser';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function capturePose(time:number){
  const arrival=1-(1-clamp(time/1.3))**3;
  const departure=clamp((time-3.4)/2);
  const truckX=1400-900*arrival+1100*departure**2;
  const loading=clamp((time-1.3)/1.2);
  return {truckX,hippoX:370+(truckX+105-370)*loading,
    hippoY:560-66*loading-Math.sin(loading*Math.PI)*110,
    caged:time>=2.5,phase:time<1.3?'arriving':time<2.5?'loading':time<3.4?'caged':'departing'};
}
export function drawTruck(g:Phaser.GameObjects.Graphics,x:number,time:number,front:boolean){
  const pose=capturePose(time);
  if(front){
    if(pose.caged){
      g.lineStyle(7,0x637888);
      g.strokeRoundedRect(x+12,333,192,170,8);
      for(let i=0;i<5;i++)g.lineBetween(x+27+i*40,336,x+27+i*40,500);
    }
    return;
  }
  // Truck bed, open cage frame and a round friendly police cab.
  g.fillStyle(0x315785);g.fillRoundedRect(x,500,340,35,10);
  g.fillStyle(0xe8eadb);g.fillRoundedRect(x+10,332,196,171,9);
  g.fillStyle(0x5286b0);g.fillRoundedRect(x+215,385,114,120,16);
  g.fillStyle(0xc8eff4);g.fillRoundedRect(x+225,396,91,64,8);
  g.lineStyle(6,0x637888);g.strokeRoundedRect(x+12,333,192,170,8);
  for(const wheel of [55,275]){
    g.fillStyle(0x233e48);g.fillCircle(x+wheel,540,31);
    g.fillStyle(0xb4c5ca);g.fillCircle(x+wheel,540,15);
    const angle=time*8;g.lineStyle(3,0x637888);
    g.lineBetween(x+wheel-12*Math.cos(angle),540-12*Math.sin(angle),x+wheel+12*Math.cos(angle),540+12*Math.sin(angle));
  }
  // Čivilis is now at the wheel, with a visible smile.
  for(let i=0;i<5;i++){g.fillStyle(0x775143);g.fillTriangle(x+236+i*9,441,x+239+i*9,410,x+248+i*9,441);}
  g.fillStyle(0xb48b69);g.fillEllipse(x+267,438,59,35);
  g.fillStyle(0xe8c99a);g.fillEllipse(x+290,438,33,27);
  g.fillStyle(0x233e48);g.fillCircle(x+294,431,3);
  g.lineStyle(2,0x233e48);g.beginPath();g.arc(x+291,436,8,0,Math.PI,false);g.strokePath();
  g.fillStyle(0x315785);g.fillRect(x+271,412,28,7);
  g.fillStyle(Math.floor(time*6)%2?0xf25b69:0x4e8ffa);g.fillRoundedRect(x+251,371,29,14,5);
  g.fillStyle(0xffdf85);g.fillRect(x+322,479,12,14);
}
