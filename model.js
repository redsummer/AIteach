(function(root){
  "use strict";
  const defaults={scenario:"stopped",speed:50,gap:45,mu:.75,threshold:2,delay:.3};
  function simulate(input){
    const p={...defaults,...input};
    for(const k of ["speed","gap","mu","threshold","delay"]){if(!Number.isFinite(p[k]))throw new Error("参数必须是有限数值");}
    if(p.speed<0||p.gap<=0||p.mu<=0||p.threshold<=0||p.delay<0)throw new Error("参数超出有效范围");
    if(!["stopped","braking"].includes(p.scenario))throw new Error("未知场景");
    const dt=.02, decel=Math.min(6,p.mu*9.81);
    let v=p.speed/3.6, lead=p.scenario==="braking"?v*.7:0;
    let x=0,y=p.gap,trigger=null,brake=null,minGap=p.gap,maxDecel=0,collision=false;
    const frames=[];
    for(let i=0;i<=1000;i++){
      const t=i*dt,gap=y-x,closing=v-lead,ttc=closing>1e-8?Math.max(0,gap)/closing:Infinity;
      if(trigger===null&&ttc<=p.threshold)trigger=t;
      const braking=trigger!==null&&t+1e-9>=trigger+p.delay;
      if(braking&&brake===null&&v>0)brake=t;
      const a=braking&&v>0?decel:0;
      maxDecel=Math.max(maxDecel,a);
      minGap=Math.min(minGap,Math.max(0,gap));
      collision=gap<=0;
      frames.push({t,x,y,v,lead,gap:Math.max(0,gap),ttc,braking,collision});
      if(collision||(v<=1e-8&&lead<=1e-8)||i===1000)break;
      const leadA=p.scenario==="braking"&&t>=1?3:0;
      const nextV=Math.max(0,v-a*dt),nextLead=Math.max(0,lead-leadA*dt);
      const ownMove=a>0&&v/a<dt?v*v/(2*a):(v+nextV)*dt/2;
      const leadMove=leadA>0&&lead/leadA<dt?lead*lead/(2*leadA):(lead+nextLead)*dt/2;
      x+=ownMove;y+=leadMove;v=nextV;lead=nextLead;
    }
    return {params:p,frames,trigger,brake,minGap,maxDecel,collision,duration:frames.at(-1).t,impactSpeed:collision?frames.at(-1).v*3.6:0};
  }
  const api={simulate,defaults,version:"1.0.0"};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else root.DrivingModel=api;
})(typeof globalThis!=="undefined"?globalThis:this);
