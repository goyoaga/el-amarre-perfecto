import './style.css';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
const W=1000,H=800,BOAT_HALF=58;let phase='ready',best=null,audioOn=false,audio,state;
try{const n=Number(localStorage.getItem('el-amarre-perfecto-best'));if(Number.isFinite(n)&&n>=0)best=n}catch{}
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function newRound(){
  const dockFace=rand(720,850),startX=rand(75,185),v=rand(175,235),decel=rand(54,72),current=rand(-8,10);
  phase='ready';state={last:performance.now(),x:startX,v,decel,current,dockFace,mooringX:dockFace-34,impactAt:0,impactV:0,shake:0,resultAt:0};
  $('ready').hidden=false;$('result').hidden=true;$('action').disabled=false;
  $('scene-label').textContent='OBJETIVO: DETENTE JUNTO A LA BOYA · SIN TOCAR EL MUELLE';
  $('best').textContent=best===null?'MEJOR · —':'MEJOR · '+best.toFixed(2)+' M';
}
function confetti(){const host=$('scene');for(let i=0;i<28;i++){const p=document.createElement('i');p.className='confetti';p.style.left=(42+Math.random()*22)+'%';p.style.top=(42+Math.random()*12)+'%';p.style.setProperty('--dx',((Math.random()-.5)*360)+'px');p.style.setProperty('--dy',(90+Math.random()*230)+'px');p.style.transform='rotate('+Math.random()*180+'deg)';host.appendChild(p);setTimeout(()=>p.remove(),1300)}}
function sound(freq=360,d=.15){if(!audioOn)return;try{audio??=new AudioContext();let o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.06,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d+.01)}catch{}}
function cut(){if(phase!=='ready')return;phase='coast';$('action').disabled=true;$('scene-label').textContent='MOTOR CORTADO · AHORA SOLO PUEDES MIRAR…';sound(250,.1)}
function end(kind){
  if(phase==='result')return;phase='result';state.resultAt=performance.now();
  const bow=state.x+BOAT_HALF,gapPx=Math.max(0,state.dockFace-bow),err=gapPx/90;
  let verdict,side;
  if(kind==='crash'){verdict='¡Has chocado!';side='Llegaste con demasiada velocidad al muelle.'}
  else if(err<=.12){verdict='¡Amarre perfecto!';side='La dejaste prácticamente clavada.'}
  else if(err<=.45){verdict='¡Casi perfecto!';side='Te faltaron '+err.toFixed(2)+' m.'}
  else if(err<=1.15){verdict='Buen amarre.';side='Te faltaron '+err.toFixed(2)+' m.'}
  else{verdict='Te quedaste corto.';side='Te faltaron '+err.toFixed(2)+' m.'}
  $('verdict').textContent=verdict;$('distance').textContent=kind==='crash'?'—':err.toFixed(2);$('side').textContent=side;
  if(kind!=='crash'&&(best===null||err<best)){best=err;try{localStorage.setItem('el-amarre-perfecto-best',String(best))}catch{}}
  $('best').textContent=best===null?'MEJOR · —':'MEJOR · '+best.toFixed(2)+' M';$('ready').hidden=true;$('result').hidden=false;$('action').disabled=false;
  $('scene-label').textContent=kind==='crash'?'IMPACTO · DEMASIADO TARDE':verdict.toUpperCase()+' · '+err.toFixed(2)+' M';
  if(kind!=='crash'&&err<=.45)confetti();sound(kind==='crash'?120:err<=.12?700:430,.2);
  try{window.goatcounter?.count?.({path:'amarre-completado',title:'Amarre completado',event:true,no_session:true})}catch{}
}
function path(points,fill){ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function boat(x,y,tilt=0){ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
  ctx.fillStyle='rgba(14,55,62,.2)';ctx.beginPath();ctx.ellipse(0,34,66,12,0,0,Math.PI*2);ctx.fill();
  path([[-62,-5],[62,-5],[46,29],[-45,29]],'#fff8e9');ctx.strokeStyle='#284f55';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#bd6b50';ctx.fillRect(-47,-1,91,7);path([[-29,-7],[31,-7],[20,-31],[-15,-31]],'#c78a4e');
  ctx.fillStyle='#f3e5cb';ctx.fillRect(-10,-25,30,17);ctx.strokeStyle='#6b4d36';ctx.lineWidth=2;ctx.strokeRect(-10,-25,30,17);
  ctx.fillStyle='#23464d';ctx.beginPath();ctx.roundRect(-47,12,22,30,5);ctx.fill();ctx.fillStyle='#d9e4df';ctx.font='700 10px sans-serif';ctx.fillText('40',-42,31);
  ctx.strokeStyle='#d9ddd4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-32,-7);ctx.lineTo(-25,-27);ctx.lineTo(29,-27);ctx.lineTo(38,-7);ctx.stroke();
  ctx.restore()}
function drawTargetZone(){
  const right=state.dockFace-9,left=Math.max(0,right-118),top=535,bottom=638,r=18;
  ctx.save();ctx.fillStyle='rgba(248,230,116,.10)';ctx.strokeStyle='rgba(255,246,197,.95)';ctx.lineWidth=5;ctx.setLineDash([15,12]);
  ctx.beginPath();ctx.roundRect(left,top,right-left,bottom-top,r);ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.restore();
}
function drawDock(){
  const d=state.dockFace;
  ctx.fillStyle='#d8c19b';ctx.fillRect(d,392,W-d,272);ctx.fillStyle='#b89468';
  for(let y=414;y<655;y+=42)ctx.fillRect(d+8,y,W-d-16,5);
  ctx.fillStyle='#765d45';ctx.fillRect(d-5,405,10,260);
  ctx.strokeStyle='#f6ead4';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(state.mooringX,485);ctx.lineTo(state.mooringX,650);ctx.stroke();
  ctx.fillStyle='#b75a42';ctx.beginPath();ctx.arc(state.mooringX,595,21,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4ead8';ctx.beginPath();ctx.arc(state.mooringX,595,8,0,Math.PI*2);ctx.fill();
}
function draw(now){
  ctx.clearRect(0,0,W,H);let sky=ctx.createLinearGradient(0,0,0,480);sky.addColorStop(0,'#e9eee7');sky.addColorStop(1,'#eee4d3');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(224,177,106,.3)';ctx.beginPath();ctx.arc(820,125,68,0,Math.PI*2);ctx.fill();
  path([[0,355],[90,310],[155,325],[225,270],[300,322],[385,245],[465,315],[560,260],[650,318],[735,240],[825,305],[905,260],[1000,300],[1000,410],[0,410]],'#8ea89a');
  path([[0,372],[120,338],[215,354],[330,306],[425,350],[540,315],[660,356],[790,315],[900,344],[1000,320],[1000,410],[0,410]],'#6f9386');
  ctx.fillStyle='#f0dfc3';for(const [x,y,s] of [[112,324,1],[270,317,.8],[470,323,.9],[680,323,.75],[858,312,.9]]){ctx.fillRect(x,y,34*s,20*s);ctx.fillStyle='#b86d4e';ctx.beginPath();ctx.moveTo(x-3*s,y);ctx.lineTo(x+17*s,y-12*s);ctx.lineTo(x+37*s,y);ctx.fill();ctx.fillStyle='#f0dfc3'}
  let sea=ctx.createLinearGradient(0,390,0,H);sea.addColorStop(0,'#6faaa2');sea.addColorStop(1,'#397b79');ctx.fillStyle=sea;ctx.fillRect(0,390,W,H-390);
  ctx.strokeStyle='rgba(235,245,238,.35)';ctx.lineWidth=3;for(let y=445;y<760;y+=62){ctx.beginPath();for(let x=0;x<=W;x+=20){let yy=y+Math.sin(x*.018+now*.0012)*5;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke()}
  drawDock();drawTargetZone();
  let dt=Math.min(.032,(now-state.last)/1000);state.last=now;
  if(phase==='ready'||phase==='coast'){
    if(phase==='coast')state.v=Math.max(0,state.v-state.decel*dt);
    state.x+=(state.v+state.current)*dt;
    const bow=state.x+BOAT_HALF;
    if(bow>=state.dockFace){
      state.x=state.dockFace-BOAT_HALF;state.impactV=state.v;state.shake=1;phase='impact';state.impactAt=now;sound(105,.22);
    }else if(phase==='coast'&&state.v<=2)end('stop');
  }else if(phase==='impact'){
    state.shake=Math.max(0,1-(now-state.impactAt)/420);
    if(now-state.impactAt>480)end('crash');
  }
  let shake=state.shake?Math.sin((now-state.impactAt)*.09)*12*state.shake:0,tilt=state.shake?-.08*state.shake:0;
  boat(state.x+shake,585,tilt);
  if(phase==='impact'){ctx.fillStyle='rgba(248,242,218,.9)';for(let i=0;i<10;i++){ctx.beginPath();ctx.arc(state.dockFace-12-Math.random()*45,610+(Math.random()-.5)*45,3+Math.random()*6,0,Math.PI*2);ctx.fill()}}
  requestAnimationFrame(draw)
}
$('action').onclick=e=>{e.stopPropagation();cut()};$('scene').onclick=cut;$('again').onclick=newRound;
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&phase==='ready'){e.preventDefault();cut()}});
$('sound').onclick=()=>{audioOn=!audioOn;$('sound').setAttribute('aria-pressed',String(audioOn));$('sound-label').textContent=audioOn?'ON':'OFF';$('sound-icon').textContent=audioOn?'◖))':'◖̸'};
$('bookmark').onclick=()=>{$('bookmark-text').textContent=/iPhone|iPad/i.test(navigator.userAgent)?'En Safari, pulsa Compartir y elige «Añadir a favoritos».':'Pulsa Ctrl+D (Windows/Linux), ⌘+D (Mac) o usa el menú del navegador para guardar el juego.';$('bookmark-dialog').showModal()};
newRound();requestAnimationFrame(draw);