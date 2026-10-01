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
  sound(kind==='crash'?120:err<=.12?700:430,.2);
  try{window.goatcounter?.count?.({path:'amarre-completado',title:'Amarre completado',event:true,no_session:true})}catch{}
}
function path(points,fill){ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function boat(x,y,tilt=0){ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.fillStyle='rgba(22,65,66,.17)';ctx.beginPath();ctx.ellipse(0,31,61,10,0,0,Math.PI*2);ctx.fill();path([[-58,0],[58,0],[38,30],[-40,30]],'#f4ead8');ctx.strokeStyle='#315d5b';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#bd6b50';ctx.fillRect(-15,-31,34,31);ctx.fillStyle='#244c4d';ctx.fillRect(-2,-44,4,44);ctx.restore()}
function drawDock(){
  const d=state.dockFace;
  ctx.fillStyle='#d8c19b';ctx.fillRect(d,392,W-d,272);ctx.fillStyle='#b89468';
  for(let y=414;y<655;y+=42)ctx.fillRect(d+8,y,W-d-16,5);
  ctx.fillStyle='#765d45';ctx.fillRect(d-5,405,10,260);
  ctx.strokeStyle='#f6ead4';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(state.mooringX,485);ctx.lineTo(state.mooringX,650);ctx.stroke();
  ctx.fillStyle='#b75a42';ctx.beginPath();ctx.arc(state.mooringX,595,21,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4ead8';ctx.beginPath();ctx.arc(state.mooringX,595,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#213d40';ctx.font='700 16px DM Sans';ctx.fillText('AMARRE',state.mooringX-34,555);
}
function draw(now){
  ctx.clearRect(0,0,W,H);let sky=ctx.createLinearGradient(0,0,0,480);sky.addColorStop(0,'#e9eee7');sky.addColorStop(1,'#eee4d3');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(224,177,106,.3)';ctx.beginPath();ctx.arc(820,125,68,0,Math.PI*2);ctx.fill();path([[0,335],[150,295],[270,330],[405,280],[545,330],[700,295],[840,330],[1000,285],[1000,410],[0,410]],'#9fb7a9');
  let sea=ctx.createLinearGradient(0,390,0,H);sea.addColorStop(0,'#6faaa2');sea.addColorStop(1,'#397b79');ctx.fillStyle=sea;ctx.fillRect(0,390,W,H-390);
  ctx.strokeStyle='rgba(235,245,238,.35)';ctx.lineWidth=3;for(let y=445;y<760;y+=62){ctx.beginPath();for(let x=0;x<=W;x+=20){let yy=y+Math.sin(x*.018+now*.0012)*5;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke()}
  drawDock();
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