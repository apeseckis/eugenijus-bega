import {C} from './config';
import type {Obstacle} from './model';

export class Pursuer {
  visualGap=100;
  height=0;
  get x(){return C.playerX-65-this.visualGap*1.9;}
  tick(gap:number,obstacles:Obstacle[],dt:number){
    // Exponential easing is stable at different frame rates and never overshoots.
    this.visualGap=gap+(this.visualGap-gap)*Math.exp(-C.pursuerEase*dt);
    this.height=0;
    for(const obstacle of obstacles){
      if(obstacle.flight!==undefined)continue;
      const progress=(this.x-obstacle.x+C.pursuerJumpLead)/
        (obstacle.width+C.pursuerJumpLead+C.pursuerJumpTrail);
      if(progress>0&&progress<1){
        this.height=Math.max(this.height,Math.sin(progress*Math.PI)*C.pursuerJumpHeight);
      }
    }
  }
}
