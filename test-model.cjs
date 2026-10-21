const assert=require("node:assert/strict");
const {simulate,defaults}=require("./model.js");
const base=simulate(defaults);
assert.equal(base.collision,false);
assert(base.brake!==null);
assert(base.frames.every(f=>f.v>=0&&f.lead>=0));
const risky=simulate({...defaults,speed:100,gap:10,threshold:.5,delay:1.5});
assert.equal(risky.collision,true);
const early=simulate({...defaults,threshold:3}),late=simulate({...defaults,threshold:1});
assert(early.minGap>late.minGap);
const delayed=simulate({...defaults,delay:1.2});
assert(delayed.minGap<base.minGap);
const slippery=simulate({...defaults,mu:.2});
assert(slippery.minGap<base.minGap);
assert.deepEqual(simulate(defaults),base);
assert(base.maxDecel<=Math.min(6,defaults.mu*9.81));
assert.equal(simulate({...defaults,speed:0}).duration,0);
for(const scenario of ["stopped","braking"]) for(const speed of [20,50,100]) for(const mu of [.2,.75,.9]){
 const r=simulate({...defaults,scenario,speed,mu});
 assert(r.duration<=20);assert(r.minGap>=0);
 assert(r.frames.every(f=>Number.isFinite(f.gap)&&Number.isFinite(f.v)&&f.v>=0));
 if(r.brake!==null)assert(r.brake+1e-8>=r.trigger+r.params.delay);
}
assert.throws(()=>simulate({...defaults,gap:0}));
console.log("PASS: deterministic model, stopping, collision, delay, friction, TTC comparison and 18 parameter combinations.");
