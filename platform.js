"use strict";
(() => {
 const get=id=>document.getElementById(id);
 const videos={
  overview:{src:"assets/project-overview.mp4",poster:"assets/driving-simulator.jpg",title:"项目展示 · 人—车—环境一体化",description:"实验设备、虚拟场景、传感器配置和人在环教学的整体展示。"},
  guide:{src:"assets/teaching-guide.mp4",poster:"assets/panosim-cockpit.jpg",title:"教学引导 · 从平台操作到实验评价",description:"围绕教学资源、学情、教学目标、重难点、实施过程和评价展开。"}
 };
 const video=get("platformVideo");let selected="overview",seekRequest=0,requestSerial=0;
 function updateMessage(text){get("videoMessage").textContent=text;}
 async function playAt(seconds,token){
  if(token!==requestSerial)return;
  try{
   video.currentTime=Math.max(0,Math.min(seconds,Number.isFinite(video.duration)?video.duration:seconds));
   seekRequest=null;
   await video.play();
   if(token===requestSerial)updateMessage("");
  }catch{if(token===requestSerial)updateMessage("片段已定位。如未自动播放，请点击播放器中的播放按钮。");}
 }
 function chooseFilm(key,seconds=0){
  if(!videos[key])return;
  const token=++requestSerial,film=videos[key];
  get("videoTitle").textContent=film.title;
  get("videoDescription").textContent=film.description;
  get("videoDownload").href=film.src;
  document.querySelectorAll("[data-film]").forEach(b=>{const on=b.dataset.film===key;b.classList.toggle("selected",on);b.setAttribute("aria-pressed",String(on));});
  updateMessage("正在载入视频……");
  seekRequest={seconds,token};
  if(selected!==key){
   video.pause();selected=key;video.src=film.src;video.poster=film.poster;video.load();
  }else if(video.readyState>=1){playAt(seconds,token);}
  else{video.load();}
 }
 video.addEventListener("loadedmetadata",()=>{if(seekRequest&&typeof seekRequest==="object")playAt(seekRequest.seconds,seekRequest.token);});
 video.addEventListener("error",()=>updateMessage("视频未能加载，请检查 assets 视频文件是否与网页一同上传，或使用“单独打开”链接。"));
 document.querySelectorAll("[data-film]").forEach(b=>b.addEventListener("click",()=>chooseFilm(b.dataset.film)));
 function jump(seconds){chooseFilm("guide",seconds);location.hash="showcase";}
 document.querySelectorAll("[data-seek]").forEach(b=>b.addEventListener("click",()=>jump(Number(b.dataset.seek))));
 document.querySelectorAll("[data-video-time]").forEach(b=>b.addEventListener("click",()=>jump(Number(b.dataset.videoTime))));
 const workflows={
  world:{tool:"WORLDBUILDER",title:"先定义道路，再定义风险",image:"assets/panosim-scene.jpg",alt:"项目视频中的 WorldBuilder 道路与天气配置界面",caption:"项目视频画面 · WorldBuilder 道路与天气配置",intro:"把道路几何、目标运动和环境条件整理成可复现的工况，再在平台内运行检查。",steps:["在 WorldBuilder 中构建或选择道路，核对车道、路口与交通设施。","在实验配置中设置主车和目标的初始状态、轨迹及触发条件。","先检查无初始碰撞，再保存场景配置；含随机交通时记录随机种子。"],evidence:"道路与场景截图、主车/目标初始状态、触发条件、场景文件或配置版本。",time:140},
  sensor:{tool:"VEHICLEBUILDER / SENSORBUILDER",title:"把车辆与传感器配置放在同一坐标下",image:"assets/panosim-sensors.jpg",alt:"项目视频中的 PanoExp 主车实验树与初始状态配置",caption:"项目视频画面 · PanoExp 主车配置与传感器入口导引",intro:"先核对整车参数，再调整相机、毫米波雷达与激光雷达的安装配置，检查输出是否覆盖目标。",steps:["在 VehicleBuilder 中核对车辆质量、轴距等参数，保留原始配置作基线。","结合视频中 Edit Sensor / SensorBuilder 的入口检查安装位置、姿态及探测范围。","运行相同工况，分别检查图像、雷达或点云输出；与真值对比时对齐坐标、时间戳和单位。"],evidence:"车辆与传感器配置、安装与覆盖截图、输出样例、时间与坐标核对记录。",time:165},
  control:{tool:"PANOEXP"+" / ALGORITHM",title:"固定工况，比较算法或参数",image:"assets/panosim-cockpit.jpg",alt:"项目视频中的 PanoSim 驾驶视角及车辆状态显示",caption:"项目视频画面 · 驾驶视角与状态显示",intro:"在平台实验环境中运行可用的 AEB / ACC 算法。先确认算法输入与控制输出，再进行单变量对比。",steps:["选择校内已验证的算法与实验配置，核查其需要的传感器输入和控制输出。","固定车辆、场景和感知链路，设置至少三组 TTC 阈值或 ACC 期望时距；具体参数由算法决定。","记录速度、净车距、制动时刻与加速度，检查异常样例；更换感知模型时固定下游控制。"],evidence:"算法名称/版本、参数表、输入输出核查记录、三组运行日志与对照曲线。",time:190},
  driver:{tool:"DRIVER IN THE LOOP / DIL",title:"从人工输入，追踪到车辆响应",image:"assets/driving-simulator.jpg",alt:"项目现场的多屏驾驶模拟器和方向盘",caption:"项目实录 · 多屏驾驶模拟器",intro:"项目视频呈现了驾驶模拟器上的人在环实践。正式操作由教师组织，使用校内已验证的设备和接口。",steps:["由教师完成设备检查，确认方向盘、踏板与控制模式的对应关系。","在相同场景下记录人工驾驶基准，再根据已实现的接管机制进行对照。","使用实际请求与有效控制输入的时间戳计算反应时间，分析接管后轨迹、加速度及失败情况。"],evidence:"设备配置与控制模式、接管事件时间戳、人工输入、轨迹和加速度曲线。",time:210},
  analysis:{tool:"PLOTBUILDER / DATAMANAGER",title:"让结果回到可追溯的数据",image:"assets/panosim-cockpit.jpg",alt:"用于核对车辆响应的 PanoSim 仿真画面",caption:"项目视频画面 · 运行结果观察；非后处理工具截图",intro:"保存参数与原始输出，再利用本机版本提供的绘图和数据管理工具核对结果，形成能够复测的结论。",steps:["将每组场景、车辆、传感器、算法版本与运行日志关联保存。","利用 PlotBuilder 或本机对应绘图工具比较速度、间距与加速度，核对采样时间和单位。","结合失败样例说明原因，提交配置、指标和报告；教学助手建议及成绩由教师复核。"],evidence:"原始日志、配置清单、指标计算方法、对照曲线、结论与复测记录。",time:240}
 };
 let active="world";
 const tabs=[...document.querySelectorAll("[data-workflow]")];
 function selectWorkflow(key,focus=false){
  const data=workflows[key];if(!data)return;active=key;
  tabs.forEach(b=>{const on=b.dataset.workflow===key;b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();});
  get("workflowPanel").setAttribute("aria-labelledby","tab-"+key);
  get("workflowTool").textContent=data.tool;
  get("workflowTitle").textContent=data.title;
  get("workflowIntro").textContent=data.intro;
  get("workflowImage").src=data.image;get("workflowImage").alt=data.alt;
  get("workflowCaption").textContent=data.caption;
  get("workflowEvidence").textContent=data.evidence;
  get("workflowSteps").replaceChildren(...data.steps.map(text=>{const li=document.createElement("li");li.textContent=text;return li;}));
 }
 tabs.forEach((b,index)=>{
  b.addEventListener("click",()=>selectWorkflow(b.dataset.workflow));
  b.addEventListener("keydown",e=>{
   let next=null;
   if(e.key==="ArrowRight")next=(index+1)%tabs.length;
   if(e.key==="ArrowLeft")next=(index+tabs.length-1)%tabs.length;
   if(e.key==="Home")next=0;if(e.key==="End")next=tabs.length-1;
   if(next!==null){e.preventDefault();selectWorkflow(tabs[next].dataset.workflow,true);}
  });
 });
 get("workflowVideo").addEventListener("click",()=>jump(workflows[active].time));
 document.querySelectorAll("[data-target-workflow]").forEach(b=>b.addEventListener("click",()=>{selectWorkflow(b.dataset.targetWorkflow);location.hash="platform";get("workflowPanel").focus({preventScroll:true});}));
 get("exportPlan").addEventListener("click",()=>{
  const p=params();
  const content=[
   "PanoSim 上机实验任务单","用途：课前设计与人工配置核对；不是 PanoSim 原生工程或可导入配置文件。",
   "生成时间："+new Date().toLocaleString("zh-CN"),"",
   "一、待核对的上机环境","PanoSim 版本：________    授权模块：________","场景/实验标识：________    车辆/传感器配置版本：________","算法名称及版本：________    运行日志位置：________","",
   "二、网页预演参数","场景："+names[p.scenario],"主车初速："+p.speed+" km/h","初始净车距："+p.gap+" m","主车附着系数："+p.mu,"TTC 阈值："+p.threshold+" s","感知与执行总延迟："+p.delay+" s",
   p.scenario==="braking"?"前车运动：初速为主车 70%，1 s 起以 3 m/s² 减速。":"前车运动：静止。",
   "网页预演采用 min(6, μ×9.81) m/s² 固定减速度；不得把预演结果当作 PanoSim 输出。","",
   "三、单变量对照","固定场景、主车/目标初态、车辆和传感器配置；设置 1 / 2 / 3 s 三组 TTC 阈值。","如果实际算法不使用 TTC，应改用已验证的算法参数并重写假设。","附着、延迟的生效范围须依据本机版本和模型验证，不能仅按网页值认定。","",
   "四、提交证据","[ ] 场景与初始状态  [ ] 车辆/传感器配置  [ ] 算法版本与参数","[ ] 时间戳、速度、车距、加速度日志  [ ] 三组对照曲线  [ ] 失败样例及复测","",
   "五、结论","实验假设：________","平台结果与网页预演有哪些差异：________","差异是否来自模型、单位、控制逻辑或初始条件：________",
   "适用范围与下一次改进：________"
  ].join("\r\n");
  download("PanoSim上机实验任务单.txt",content,"text/plain;charset=utf-8");
 });
 selectWorkflow("world");
})();
