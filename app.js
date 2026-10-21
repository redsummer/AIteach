/* Browser-only demonstration. No account, analytics, or remote data submission. */
"use strict";
const $=id=>document.getElementById(id),model=DrivingModel;
const names={stopped:"静止前车",braking:"前车减速"};
const keys=["speed","gap","mu","threshold","delay"];
const storageKey="zhixing-lab-v1";
let records=[],animation=0,current=null;
try{const saved=JSON.parse(localStorage.getItem(storageKey)||"[]");records=Array.isArray(saved)?saved.filter(r=>r&&r.params&&Number.isFinite(r.minGap)&&typeof r.time==="string"&&names[r.params.scenario]).slice(-50):[];}catch{}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(records));return true;}catch{$("saveState").textContent="浏览器存储不可用，请下载记录保存。";return false;}}
function params(){return {scenario:$("scenario").value,...Object.fromEntries(keys.map(k=>[k,Number($(k).value)]))};}
function labels(){const p=params();$("speedOut").textContent=p.speed+" km/h";$("gapOut").textContent=p.gap+" m";$("muOut").textContent=p.mu.toFixed(2);$("thresholdOut").textContent=p.threshold.toFixed(2)+" s";$("delayOut").textContent=p.delay.toFixed(1)+" s";}
function rr(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function drawRoad(f,p){
 const c=$("road"),g=c.getContext("2d"),W=c.width,H=c.height;
 g.clearRect(0,0,W,H);g.fillStyle="#eaf0f4";g.fillRect(0,0,W,H);
 g.strokeStyle="#dce5ec";g.lineWidth=1;for(let x=0;x<W;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}for(let y=0;y<H;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
 g.fillStyle="#d0dce6";g.fillRect(0,94,W,154);
 g.fillStyle="#e1e8ee";g.fillRect(0,92,W,12);g.fillRect(0,236,W,12);
 g.strokeStyle="#fafcfe";g.lineWidth=3;g.setLineDash([28,25]);g.lineDashOffset=f.x*4;g.beginPath();g.moveTo(0,171);g.lineTo(W,171);g.stroke();g.setLineDash([]);
 const scale=Math.min(7,560/(p.gap+10)),own=135,other=own+64+f.gap*scale;
 const cone=g.createLinearGradient(own+64,0,other+30,0);cone.addColorStop(0,"#2778ee22");cone.addColorStop(1,"#2778ee04");
 g.fillStyle=cone;g.beginPath();g.moveTo(own+64,204);g.lineTo(Math.min(900,other+100),141);g.lineTo(Math.min(900,other+100),267);g.closePath();g.fill();
 function car(x,color){rr(g,x,183,64,35,8,color);rr(g,x+16,188,30,25,4,"#163d5e99");g.fillStyle="#faf8de";g.fillRect(x+59,188,3,7);g.fillRect(x+59,206,3,7);g.fillStyle="#ed7666";g.fillRect(x+2,188,3,7);g.fillRect(x+2,206,3,7);}
 car(own,"#2473e8");car(other,"#526d82");
 g.fillStyle="#315573";g.font="16px Segoe UI, Microsoft YaHei";g.fillText("主车",own+14,278);g.fillText("前车",other+14,278);
 g.strokeStyle=f.collision?"#ce5947":"#6385a6";g.lineWidth=1.5;g.beginPath();g.moveTo(own+64,142);g.lineTo(other,142);g.moveTo(own+64,135);g.lineTo(own+64,149);g.moveTo(other,135);g.lineTo(other,149);g.stroke();
 g.textAlign="center";g.font="15px Segoe UI";g.fillText(f.gap.toFixed(1)+" m",(own+64+other)/2,128);g.textAlign="left";
 g.fillStyle="#8aa0b3";g.font="12px Segoe UI, Microsoft YaHei";g.fillText("示意比例随初始车距调整 · 主车跟随视角",23,30);
 if(f.braking){rr(g,24,291,130,29,5,"#fff4e7");g.fillStyle="#b97827";g.fillText("AEB 制动中",43,311);}
}
function drawChart(result,index){
 const c=$("chart"),g=c.getContext("2d"),w=c.width,h=c.height,left=47,right=20,top=20,bottom=35;
 g.clearRect(0,0,w,h);const fs=result.frames,maxV=Math.max(result.params.speed,20),maxT=Math.max(result.duration,1);
 g.font="12px Segoe UI";g.textAlign="right";
 for(let i=0;i<=4;i++){const y=top+(h-top-bottom)*i/4;g.strokeStyle="#edf1f5";g.beginPath();g.moveTo(left,y);g.lineTo(w-right,y);g.stroke();g.fillStyle="#90a0b0";g.fillText((maxV*(1-i/4)).toFixed(0),left-10,y+4);}
 g.textAlign="center";for(let i=0;i<=4;i++){g.fillText((maxT*i/4).toFixed(1)+" s",left+(w-left-right)*i/4,h-10);}
 for(const [field,color] of [["v","#2674ed"],["lead","#8194a6"]]){g.strokeStyle=color;g.lineWidth=3;g.beginPath();fs.slice(0,index+1).forEach((f,i)=>{const x=left+f.t/maxT*(w-left-right),y=top+(1-f[field]*3.6/maxV)*(h-top-bottom);i?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();}
 g.textAlign="left";
}
function display(f,p){drawRoad(f,p);$("simTime").textContent="t = "+f.t.toFixed(2)+" s";$("liveSpeed").innerHTML=(f.v*3.6).toFixed(1)+" <em>km/h</em>";$("liveGap").innerHTML=f.gap.toFixed(1)+" <em>m</em>";$("liveTtc").innerHTML=(Number.isFinite(f.ttc)?f.ttc.toFixed(2):"∞")+" <em>s</em>";$("simStatus").textContent=f.collision?"发生碰撞":f.braking&&f.v>0?"AEB 制动中":f.v===0?"主车已停车":"行驶中";}
function preview(){cancelAnimationFrame(animation);$("run").disabled=false;labels();const p=params(),r=model.simulate(p);display(r.frames[0],p);drawChart(r,0);$("simStatus").textContent="准备就绪";$("result").className="result";$("result").textContent="参数已就绪。运行实验以生成结果。";}
function store(r){const {frames,...record}=r;records.push({...record,time:new Date().toISOString()});records=records.slice(-50);persist();renderHistory();}
function badge(collision){return '<span class="badge'+(collision?' bad':'')+'">'+(collision?"发生碰撞":"时段内无碰撞")+"</span>";}
function cells(row,values){for(const v of values){const td=document.createElement("td");td.textContent=String(v);row.appendChild(td);}}
function renderHistory(){const body=$("historyRows");body.replaceChildren();if(!records.length){const row=body.insertRow();const cell=row.insertCell();cell.colSpan=7;cell.className="empty";cell.textContent="还没有实验记录。完成一次运行后，结果会显示在这里。";return;}for(const r of [...records].reverse()){const row=body.insertRow();cells(row,[new Date(r.time).toLocaleString("zh-CN",{hour12:false}),names[r.params.scenario],r.params.speed+" km/h",r.params.mu,r.params.threshold+" s / "+r.params.delay+" s",r.minGap.toFixed(2)+" m"]);row.insertCell().innerHTML=badge(r.collision);}}
$("parameters").addEventListener("submit",e=>{e.preventDefault();cancelAnimationFrame(animation);current=model.simulate(params());const r=current,start=performance.now();$("run").disabled=true;$("result").textContent="正在运行……";function tick(now){const time=(now-start)/1000,index=Math.min(Math.floor(time/.02),r.frames.length-1);display(r.frames[index],r.params);drawChart(r,index);if(index<r.frames.length-1){animation=requestAnimationFrame(tick);}else{$("run").disabled=false;store(r);$("result").className="result"+(r.collision?" danger":"");$("result").textContent=(r.collision?"发生碰撞，碰撞时主车速度 "+r.impactSpeed.toFixed(1)+" km/h。":"本次模拟时段内无碰撞。")+"最小净车距 "+r.minGap.toFixed(2)+" m；"+(r.brake===null?"未触发有效制动。":"制动开始于 "+r.brake.toFixed(2)+" s。")+"结果已加入实验记录。";}}animation=requestAnimationFrame(tick);});
keys.forEach(k=>$(k).addEventListener("input",preview));$("scenario").addEventListener("change",preview);
$("reset").onclick=()=>{for(const [k,v] of Object.entries(model.defaults))$(k).value=v;preview();};
document.querySelectorAll(".preset").forEach(b=>b.onclick=()=>{$("delay").value=b.dataset.delay;preview();location.hash="experiment";$("delay").focus({preventScroll:true});});
$("batch").onclick=()=>{const p=params(),body=$("compareRows");body.replaceChildren();for(const threshold of [1,2,3]){const r=model.simulate({...p,threshold}),row=body.insertRow();cells(row,[threshold.toFixed(1)+" s",r.brake===null?"未制动":r.brake.toFixed(2)+" s",r.minGap.toFixed(2)+" m",r.maxDecel.toFixed(2)+" m/s²"]);row.insertCell().innerHTML=badge(r.collision);store(r);}};
function download(filename,content,type){const url=URL.createObjectURL(new Blob(["\ufeff",content],{type})),a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$("export").onclick=()=>{if(!records.length){$("saveState").textContent="请先完成一次实验，再导出记录。";return;}const rows=[["时间","场景","车速_kmh","初始净车距_m","主车附着系数","TTC阈值_s","总延迟_s","制动开始_s","最小净车距_m","最大减速度_m_s2","碰撞","模拟时长_s","模型版本"],...records.map(r=>[r.time,names[r.params.scenario],r.params.speed,r.params.gap,r.params.mu,r.params.threshold,r.params.delay,r.brake??"",r.minGap.toFixed(3),r.maxDecel.toFixed(3),r.collision?"是":"否",r.duration,model.version])];download("知行实验记录.csv",rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\r\n"),"text/csv;charset=utf-8");};
try{$("notes").value=localStorage.getItem("zhixing-notes")||"";}catch{}
$("notes").addEventListener("input",()=>{try{localStorage.setItem("zhixing-notes",$("notes").value);$("saveState").textContent="反思已保存到当前浏览器";}catch{$("saveState").textContent="无法本地保存，请下载报告。";}});
$("report").onclick=()=>{const latest=records.at(-1);download("知行实验报告草稿.txt",["人—车—环境一体化智能驾驶教学示意实验","生成时间："+new Date().toLocaleString("zh-CN"),"模型版本："+model.version,"","一、实验假设与控制变量","（请填写你的假设、固定参数和改变的参数）","","二、最近一次实验",latest?JSON.stringify(latest,null,2):"尚无记录","","三、反思与分析",$("notes").value||"（待填写）","","四、适用范围","本报告来自浏览器一维示意模型，未接入 PanoSim、真实 AI 或实体设备；结果不是正式成绩或实车性能验证。"].join("\n"),"text/plain;charset=utf-8");};
let takeoverTimer=null,requestTime=null,waiting=false;
function resetTakeover(message){clearTimeout(takeoverTimer);takeoverTimer=null;requestTime=null;waiting=false;$("startTakeover").disabled=false;$("respond").disabled=true;$("takeoverState").textContent=message;document.querySelector(".takeover-box").classList.remove("alert");}
$("startTakeover").onclick=()=>{resetTakeover("保持注意，等待接管提示……");waiting=true;$("startTakeover").disabled=true;$("respond").disabled=false;$("reaction").innerHTML="— <small>ms</small>";takeoverTimer=setTimeout(()=>{requestTime=performance.now();$("takeoverState").textContent="请立即接管！";document.querySelector(".takeover-box").classList.add("alert");takeoverTimer=setTimeout(()=>resetTakeover("本次等待超时，请重新开始"),10000);},2000+Math.random()*3000);};
function respond(){if(!waiting)return;if(requestTime===null){resetTakeover("提前响应：请在提示出现后再接管");return;}const ms=Math.round(performance.now()-requestTime);$("reaction").innerHTML=ms+" <small>ms</small>";resetTakeover("已记录本次页面反应时间，可重新练习");}
$("respond").onclick=respond;document.addEventListener("keydown",e=>{if(e.code==="Space"&&!e.repeat&&waiting&&!["INPUT","TEXTAREA","SELECT","BUTTON"].includes(document.activeElement.tagName)){e.preventDefault();respond();}});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&waiting)resetTakeover("页面切换，本次练习已取消，请重新开始");});
const modules=[
 ["场景设计","01",1,["确定场景风险","配置道路几何","设置主车状态","设计目标运动","配置环境变量","验证场景复现"],["可选两种纵向风险工况","PanoSim 上机任务：道路几何编辑","可调主车速度与净车距","采用预设前车运动，PanoSim 中配置目标轨迹","可调主车附着系数","相同参数可复现确定性计算"]],
 ["感知配置与验证","02",7,["布置摄像头","布置毫米波雷达","配置激光雷达","检查坐标与时间","注入感知扰动","改进感知配置"],["PanoSim 上机任务：相机视场与安装配置","PanoSim 上机任务：雷达安装与输出核查","PanoSim 上机任务：点云与遮挡分析","PanoSim 上机任务：传感器时间和坐标对齐","本页可比较总延迟；不模拟真实漏检","可记录延迟对比；安装优化在 PanoSim 中验证"]],
 ["AI 感知与控制对比","03",13,["建立规则基线","接入视觉 AI 链路","调整检测阈值","比较感知链路","探究控制参数","复测改进算法"],["本页提供简化 AEB 规则示意","PanoSim 上机任务：真实视觉模型和雷达关联","PanoSim 上机任务：检测阈值与误检漏检分析","本页仅比较总延迟，不代表 AI 性能","可进行三组 TTC 阈值对照","可复测参数配置并导出记录"]],
 ["人机协同","04",19,["设计接管条件","配置提示与切换","完成基准人工驾驶","完成自动至人工接管","比较接管策略","分析接管稳定性"],["本页采用随机提示练习","仅演示提示与按键响应","PanoSim 上机任务：人工驾驶闭环","本页测量页面反应时间，不切换车辆控制权","可重复反应练习；完整策略测试需已联调的 PanoSim 与设备","PanoSim 上机任务：切换前后轨迹与加速度分析"]],
 ["综合评价","05",25,["设计参数矩阵","执行批量回归","计算综合指标","定位失效原因","提交论证与改进","答辩并验证结论"],["固定场景后设计单变量对照","本页支持三组阈值批量计算","记录最小车距、制动时刻和最大减速度","对照碰撞结果与不同参数配置","填写反思并下载报告草稿","重复实验检查假设；正式评价由教师复核"]]
];
for(const [title,num,start,tasks,descriptions] of modules){const d=document.createElement("details");d.className="panel";const s=document.createElement("summary");s.innerHTML="<span>"+num+"</span>"+title+"<small>步骤 "+start+"—"+(start+5)+"</small>";d.append(s);const ol=document.createElement("ol");ol.start=start;tasks.forEach((t,i)=>{const li=document.createElement("li");li.textContent=t;const em=document.createElement("em");em.textContent=descriptions[i];li.append(em);ol.append(li);});d.append(ol);$("taskList").append(d);}
function nav(){document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.hash===(location.hash||"#overview")));}window.addEventListener("hashchange",nav);
renderHistory();preview();nav();
