import {describe,it,expect} from 'vitest';
import {Chase,World,type Obstacle} from './model';
const obstacle=(id=0,kind:Obstacle['kind']='leaves'):Obstacle=>({id,kind,x:370,width:60,spent:false});
describe('chase',()=>{
 it('starts at 100 and survives one or two hits',()=>{const c=new Chase();expect(c.gap).toBe(100);c.hit(obstacle());expect(c.gap).toBe(66);c.tick(0.9);c.hit(obstacle(1));expect(c.gap).toBe(32);});
 it('three quick hits capture, clamped at zero',()=>{const c=new Chase();for(let i=0;i<3;i++){c.hit(obstacle(i));c.tick(0.9);}expect(c.gap).toBe(0);});
 it('recovers only beyond 2.5 seconds and caps at 100',()=>{const c=new Chase();c.hit(obstacle());c.tick(2.5);expect(c.gap).toBe(66);c.tick(1);expect(c.gap).toBe(72);c.tick(100);expect(c.gap).toBe(100);});
 it('recovery is frame-rate independent including delay crossing',()=>{const a=new Chase(),b=new Chase();a.hit(obstacle());b.hit(obstacle());a.tick(5);for(let i=0;i<300;i++)b.tick(1/60);expect(a.gap).toBeCloseTo(b.gap,8);});
 it('each obstacle damages once and protection blocks other minor hits',()=>{const c=new Chase(),o=obstacle();expect(c.hit(o)).toBe(true);expect(c.hit(obstacle(1))).toBe(false);c.tick(1);expect(c.hit(o)).toBe(false);expect(c.gap).toBe(66);});
});
describe('world collisions and controls',()=>{
 it('start does not jump and cannot double jump',()=>{const w=new World();w.action();expect(w.grounded).toBe(true);w.action();expect(w.vy).toBe(-720);w.tick(0.1);const v=w.vy;w.action();expect(w.vy).toBe(v);});
 it('restart resets every gameplay field',()=>{const w=new World();w.action();w.chase.hit(obstacle());w.obstacles.push(obstacle());w.state='CAUGHT';w.action();expect(w.chase.gap).toBe(100);expect(w.obstacles).toEqual([]);expect(w.distance).toBe(0);expect(w.state).toBe('RUNNING');});
 it('pit captures even during minor invulnerability',()=>{const w=new World();w.action();w.chase.hit(obstacle());w.obstacles.push(obstacle(1,'pit'));for(let i=0;i<70;i++)w.tick(1/120);expect(w.state).toBe('CAUGHT');});
 it('jump clears minor collision and ground contact damages once',()=>{const w=new World();w.action();w.y=450;w.grounded=false;w.obstacles.push(obstacle());w.tick(0.01);expect(w.chase.gap).toBe(100);w.y=560;w.grounded=true;w.tick(0.01);expect(w.chase.gap).toBe(66);w.tick(0.01);expect(w.chase.gap).toBe(66);});
 it('pause freezes world and deliberate resume does not jump',()=>{const w=new World();w.action();w.pause();w.tick(1);expect(w.distance).toBe(0);w.action();expect(w.state).toBe('RUNNING');expect(w.grounded).toBe(true);});
 it('no obstacles before three seconds',()=>{const w=new World();w.action();w.tick(3);expect(w.obstacles).toHaveLength(0);});
});

describe('collision feedback',()=>{
 it('emits each minor effect once and launches only the struck football',()=>{
   const w=new World();w.action();
   const ball=obstacle(1,'stone');w.obstacles.push(ball);
   w.tick(0.01);expect(w.events).toEqual(['stone']);expect(ball.flight).toBe(0);
   w.tick(0.1);expect(ball.flight).toBeCloseTo(0.1);expect(w.events).toEqual(['stone']);
   expect(w.chase.gap).toBe(64);
   w.pause();w.tick(1);expect(ball.flight).toBeCloseTo(0.1);
   w.state='CAUGHT';w.action();expect(w.events).toEqual([]);
 });
 it('emits pit sound once at fall onset even with protection',()=>{
   const w=new World();w.action();w.chase.hit(obstacle());
   w.obstacles.push(obstacle(1,'pit'));
   for(let i=0;i<50;i++)w.tick(1/120);
   expect(w.events).toEqual(['pit']);
 });
 it('leaves emit their own effect without launching',()=>{
   const w=new World();w.action();const leaves=obstacle();w.obstacles.push(leaves);
   w.tick(0.01);expect(w.events).toEqual(['leaves']);expect(leaves.flight).toBeUndefined();
 });
});
