import Phaser from 'phaser';

// Purely decorative: uses elapsed time and never touches the simulation.
export function drawParrot(g:Phaser.GameObjects.Graphics,time:number){
  const phase=(time+10)%18;
  if(phase>6)return false;
  const x=1400-phase*255,y=220+Math.sin(phase*3)*17;
  g.fillStyle(0x713ea4);g.fillTriangle(x+14,y+8,x+53,y+29,x+36,y+1);
  g.fillStyle(0xa76bd5);g.fillEllipse(x,y,58,32);
  g.fillStyle(0x8043b5);g.fillCircle(x-22,y-12,21);
  const flap=Math.sin(time*15);
  g.fillStyle(0x603092);g.fillTriangle(x-2,y,x+27,y-12-flap*36,x+17,y+16);
  g.fillStyle(0xffcc59);g.fillTriangle(x-37,y-15,x-55,y-7,x-37,y-1);
  g.fillStyle(0xffffff);g.fillCircle(x-28,y-18,6);
  g.fillStyle(0x233e48);g.fillCircle(x-30,y-18,3);
  return true;
}
export function drawFootball(g:Phaser.GameObjects.Graphics,x:number,time:number,flight?:number){
  const age=flight??0;
  const y=536-520*age+180*age*age;
  g.save();g.translateCanvas(x+30+age*650,y);g.rotateCanvas(flight===undefined?-time*4:age*12);
  g.fillStyle(0xfff8e8);g.fillCircle(0,0,24);
  g.lineStyle(2,0x36434a);g.strokeCircle(0,0,24);
  g.fillStyle(0x293940);
  // Central pentagon and five outer panels make a recognizable football.
  const pentagon=(cx:number,cy:number,r:number)=>{
    g.beginPath();
    for(let i=0;i<5;i++){
      const a=-Math.PI/2+i*Math.PI*2/5;
      if(i===0)g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
      else g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
    }
    g.closePath();g.fillPath();
  };
  pentagon(0,0,9);
  for(let i=0;i<5;i++){
    const a=-Math.PI/2+i*Math.PI*2/5;
    const px=Math.cos(a)*20,py=Math.sin(a)*20;
    g.lineStyle(1,0x637888);g.lineBetween(Math.cos(a)*8,Math.sin(a)*8,px,py);
    pentagon(px,py,5);
  }
  g.restore();
}

// Background foliage scrolls more slowly than the track to create depth.
export function drawFoliage(g:Phaser.GameObjects.Graphics,time:number){
  for(let i=0;i<5;i++){
    const x=((i*430-time*45)%2150+2150)%2150-160;
    const top=330+(i%3)*28,base=530;
    g.fillStyle(0x9a8966);g.fillRoundedRect(x-9,top+38,18,base-top-38,6);
    g.lineStyle(9,0x9a8966);g.lineBetween(x,top+95,x-28,top+59);
    g.lineBetween(x,top+110,x+29,top+72);
    g.fillStyle(i%2?0x7eb391:0x88bb9a);
    g.fillEllipse(x,top+10,128,105);
    g.fillEllipse(x-40,top+45,100,94);
    g.fillEllipse(x+40,top+48,100,90);
    g.fillStyle(0x9ac8a5);g.fillEllipse(x-14,top-9,61,36);
  }
  for(let i=0;i<8;i++){
    const x=((i*220-time*85)%1760+1760)%1760-100;
    const base=544+(i%2)*8;
    g.fillStyle(i%2?0x6fa57c:0x78ad83);
    g.fillEllipse(x,base-12,100,44);
    g.fillEllipse(x-29,base-17,48,43);
    g.fillEllipse(x+8,base-30,55,56);
    g.fillEllipse(x+36,base-13,52,40);
    g.fillStyle(0x9ac49a);
    g.fillEllipse(x-13,base-29,16,7);g.fillEllipse(x+24,base-16,13,6);
  }
}
