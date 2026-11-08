import {expect,it} from 'vitest';
import {Pursuer} from './pursuer';
import {World,type Obstacle} from './model';
it('approaches gradually with frame independent easing',()=>{
  const a=new Pursuer(),b=new Pursuer(),start=a.x;
  a.tick(66,[],1/60);expect(a.x).toBeGreaterThan(start);expect(a.visualGap).toBeGreaterThan(90);
  for(let i=1;i<60;i++)a.tick(66,[],1/60);
  b.tick(66,[],1);expect(a.x).toBeCloseTo(b.x,8);expect(a.visualGap).toBeCloseTo(67.6928,3);
});
it.each(['pit','stone','leaves'] as const)('clears %s from edge to edge',kind=>{
  const p=new Pursuer();
  const obstacle:Obstacle={id:1,kind,x:p.x+100,width:kind==='pit'?135:60,spent:false};
  for(let i=0;i<320;i++){
    obstacle.x-=1;p.tick(100,[obstacle],1/300);
    if(p.x>=obstacle.x&&p.x<=obstacle.x+obstacle.width)expect(p.height).toBeGreaterThan(65);
  }
  expect(p.height).toBe(0);
});
it('pause freezes pursuit and resume does not jump; reset restores pursuit',()=>{
  const w=new World();w.action();w.chase.gap=66;w.tick(0.1);
  w.togglePause();const before=[w.elapsed,w.y,w.pursuer.x,w.pursuer.height];
  w.tick(3);expect([w.elapsed,w.y,w.pursuer.x,w.pursuer.height]).toEqual(before);
  w.togglePause();expect(w.state).toBe('RUNNING');expect(w.grounded).toBe(true);
  w.state='CAUGHT';w.action();expect(w.pursuer.visualGap).toBe(100);expect(w.pursuer.height).toBe(0);
});
