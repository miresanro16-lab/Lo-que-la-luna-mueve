"use strict";
// Un solo punto de entrada, con inicialización por página.

// Portada
if(document.querySelector('#intro')){
(()=>{
const next=document.querySelector('#continue');
next.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();next.classList.add('is-pressed');setTimeout(()=>location.assign(next.href),240)});

})();
}

// Experiencia
if(document.querySelector('#explore')){
(()=>{
// Alturas y fechas transcritas de la tabla proporcionada por la usuaria.
const data=[{name:'Luna nueva',day:10,height:1.95,img:'Luna nueva',x:14,y:49},{name:'Luna creciente',day:14,height:1.58,img:'luna creciente',x:23,y:49},{name:'Cuarto creciente',day:18,height:1.04,img:'cuarto creciente',x:32,y:34},{name:'Gibosa creciente',day:22,height:1.40,img:'gibosa creciente',x:42,y:23},{name:'Luna llena',day:26,height:2.35,img:'luna llena',x:53,y:17},{name:'Gibosa menguante',day:29,height:2.16,img:'gibosa menguante',x:65,y:24},{name:'Cuarto menguante',day:3,height:1.55,img:'cuarto menguante',x:75,y:38},{name:'Luna menguante',day:7,height:1.86,img:'luna menguante',x:85,y:54}];
let displayedHeight=2.35,carouselOffset=4,dragging=false,dragStart=0,dragOrigin=4;
let selected=4,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),canvas=$('#waves'),ctx=canvas.getContext('2d');let w=0,h=0,t=0;
data.forEach((d,i)=>{let b=document.createElement('button');b.className='phase';b.style.left=d.x+'%';b.style.top=d.y+'%';b.setAttribute('aria-label',`${d.name}, ${d.day} de octubre, ${d.height} metros`);b.innerHTML=`<img src="assets/${d.img}@300x.png" alt="${d.name}"><span class="lunar-name">${d.name}</span>`;b.tabIndex=-1;$('#phases').append(b);let n=document.createElement('button');n.innerHTML='<i></i>';n.setAttribute('aria-label',`${d.name} · ${d.day} oct`);n.title=`${d.name} · ${d.day} oct · ${d.height.toFixed(2)} m`;n.tabIndex=-1;$('#timeline').append(n)});
function select(i){selected=i;const d=data[i];$('#phase-name').textContent=d.name;$('#height').textContent=d.height.toFixed(2)+' m';$('#date').textContent=d.day+' Oct 2026';const chronological=[...data].sort((a,b)=>a.day-b.day),index=chronological.indexOf(d),previous=chronological[index-1];$('#trend').textContent=previous?`${d.height>=previous.height?'↑ Sube':'↓ Baja'} ${Math.abs(d.height-previous.height).toFixed(2)} m respecto al ${previous.day} oct`:'Primer dato del mes';$('#level').style.height=((d.height+.5)/3*100)+'%';document.querySelectorAll('.phase').forEach((b,j)=>{b.classList.toggle('active',i===j);b.setAttribute('aria-pressed',i===j)});document.querySelectorAll('nav button').forEach((b,j)=>{b.classList.toggle('active',i===j);b.setAttribute('aria-pressed',i===j)});layoutMoons();draw()}
function motionLabel(){$('#motion').textContent=paused?'Reanudar movimiento ▷':'Pausar movimiento Ⅱ'}$('#motion').onclick=()=>{paused=!paused;motionLabel()};motionLabel();
function resize(){w=innerWidth;h=$('#explore').clientHeight||innerHeight;let r=Math.min(devicePixelRatio||1,2);canvas.width=w*r;canvas.height=h*r;ctx.setTransform(r,0,0,r,0,0);layoutMoons();draw()}addEventListener('resize',resize);
// El arco se arrastra de forma continua; la fase más cercana al centro controla la marea.
const arc=$('#phases');
arc.setAttribute('role','slider');arc.setAttribute('tabindex','0');arc.setAttribute('aria-label','Desliza para explorar las fases lunares');arc.setAttribute('aria-valuemin','1');arc.setAttribute('aria-valuemax','8');
const hint=document.createElement('div');hint.className='swipe-hint';hint.innerHTML='<span>↔</span> Desliza para explorar<small>Arrastra las lunas sobre el arco</small>';$('#explore').append(hint);
function layoutMoons(){document.querySelectorAll('.phase').forEach((b,i)=>{let delta=i-carouselOffset;const radius=arc.clientWidth*.48,angle=delta*.31;b.style.left=(arc.clientWidth/2+Math.sin(angle)*radius)+'px';b.style.top=(arc.clientHeight*.12+(1-Math.cos(angle))*radius)+'px';b.style.opacity=Math.abs(delta)>3.8?'0':'1';b.style.visibility=Math.abs(delta)>3.8?'hidden':'visible'});arc.setAttribute('aria-valuenow',selected+1);arc.setAttribute('aria-valuetext',data[selected].name+', '+data[selected].height.toFixed(2)+' metros')}
arc.addEventListener('pointerdown',e=>{dragging=true;dragStart=e.clientX;dragOrigin=carouselOffset;arc.setPointerCapture(e.pointerId);arc.classList.add('dragging')});
arc.addEventListener('pointermove',e=>{if(!dragging)return;carouselOffset=Math.max(0,Math.min(7,dragOrigin-(e.clientX-dragStart)/(arc.clientWidth*.14)));let next=Math.round(carouselOffset);if(next!==selected)select(next);layoutMoons()});
function release(){if(!dragging)return;dragging=false;carouselOffset=selected;arc.classList.remove('dragging');layoutMoons()}
arc.addEventListener('pointerup',release);arc.addEventListener('pointercancel',release);
arc.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();carouselOffset=e.key==='Home'?0:e.key==='End'?7:Math.max(0,Math.min(7,selected+(e.key==='ArrowRight'?1:-1)));select(carouselOffset)});
let wheelLock=0;arc.addEventListener('wheel',e=>{e.preventDefault();if(Date.now()-wheelLock<220)return;wheelLock=Date.now();carouselOffset=Math.max(0,Math.min(7,selected+(e.deltaX+e.deltaY>0?1:-1)));select(carouselOffset)},{passive:false});
// Velos atmosféricos: curvas Bézier y densidad gaussiana, sin franjas delimitadas.
const veilLayer=document.createElement('canvas'),veilCtx=veilLayer.getContext('2d');
const veilShapes=[[-.03,-.12,.04,-.17,.08,-.04,-.10],[.06,-.03,.09,-.10,.03,.11,-.04],[.10,.04,-.02,.11,-.05,.02,.10],[.01,-.06,.12,-.01,.13,-.09,.02]];
// Escala expresiva común a imagen y audio; las cifras mostradas siguen siendo exactas.
function tideIntensity(){return Math.max(0,Math.min(1,(displayedHeight-1.04)/(2.35-1.04)))}
function tideVolume(){
// Altura instantánea de la cresta dominante, incluida su deformación animada.
const points=veilPoints(0);let crest=Infinity;for(let i=1;i<points.length-1;i++)crest=Math.min(crest,points[i].y/h);
const height=Math.max(0,Math.min(1,(.74-crest)/.43));
// Casi silencio abajo, nivel medio al centro y máximo arriba.
const response=height<.5?.015+.435*Math.pow(height/.5,2):.45+.55*Math.pow((height-.5)/.5,.8);
return Math.max(.015,Math.min(1,response));}
function veilPoints(k){const intensity=tideIntensity(),baseline=.76-intensity*.15,amplitude=.32+intensity*1.18,motion=.35+intensity*.75;return veilShapes[k].map((v,i)=>({x:(i-0.5)*w/5+Math.sin(t*.44+k*.9)*w*.125,y:h*(baseline+v*amplitude+(Math.sin(t*(.38+k*.045)+i*1.47+k)*.060+Math.sin(t*.24+i*.8)*.028+Math.sin(t*.32+k*1.3)*.018)*motion)}))}
function veilPath(c,points,layer=0,k=0){const p=points.map((q,i)=>({x:q.x,y:q.y+layer*h*(.018+.018*(.5+.5*Math.sin(i*1.9+k+t*.14)))}));c.beginPath();c.moveTo(p[0].x,p[0].y);for(let i=0;i<p.length-1;i++){const a=p[Math.max(0,i-1)],b=p[i],d=p[i+1],e=p[Math.min(p.length-1,i+2)];c.bezierCurveTo(b.x+(d.x-a.x)/6,b.y+(d.y-a.y)/6,d.x-(e.x-b.x)/6,d.y-(e.y-b.y)/6,d.x,d.y)}}
function surface(x,k){const p=veilPoints(k),u=Math.max(0,Math.min(p.length-1.001,x/w*5+.5)),i=Math.floor(u),f=u-i;return p[i].y+(p[i+1].y-p[i].y)*(f*f*(3-2*f))}
function draw(){if(!w)return;const scale=Math.min(devicePixelRatio||1,2);if(veilLayer.width!==Math.round(w*scale)||veilLayer.height!==Math.round(h*scale)){veilLayer.width=Math.round(w*scale);veilLayer.height=Math.round(h*scale)}const c=veilCtx;c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,w,h);c.lineCap='round';c.lineJoin='round';c.globalCompositeOperation='lighter';
[1,3,0,2].forEach(k=>{const points=veilPoints(k),gold=k===3,color=gold?'245,178,40':k===1?'9,35,91':k===2?'20,57,125':'12,48,113';
// Gaussian density across the surface fades in both directions, never closing a band.
for(let j=-14;j<=14;j++){const u=j/14,density=Math.exp(-u*u*5.2);veilPath(c,points,u*1.8,k);c.lineWidth=h*(.012+.008*density);c.strokeStyle=`rgba(${color},${density*(gold?.072:.067)})`;c.stroke()}
// Diffuse lighting on a single crest; no second boundary or repeated filaments.
for(const pass of [{width:28,alpha:.055},{width:12,alpha:.13},{width:2.1,alpha:gold?1:.76}]){veilPath(c,points,-.3,k);const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,`rgba(${color},0)`);g.addColorStop(.18,`rgba(${color},${pass.alpha*.7})`);g.addColorStop(.5,`rgba(${gold?'255,210,85':'67,107,177'},${pass.alpha})`);g.addColorStop(.82,`rgba(${color},${pass.alpha*.7})`);g.addColorStop(1,`rgba(${color},0)`);c.strokeStyle=g;c.lineWidth=pass.width;c.stroke()}
});
// 720 filamentos distribuidos entre los cuatro velos de luz.
const filamentsPerGap=180;
for(let gap=0;gap<4;gap++){const start=veilPoints(gap),end=veilPoints((gap+1)%4);for(let line=1;line<=filamentsPerGap;line++){const f=line/(filamentsPerGap+1),blend=f*f*(3-2*f),gold=(gap===3||gap===2)&&line%3===0;const points=start.map((p,i)=>({x:p.x+(end[i].x-p.x)*blend,y:p.y+(end[i].y-p.y)*blend+Math.sin(i*1.7+f*5+t*.3)*h*.003*Math.sin(f*Math.PI)}));veilPath(c,points,0,gap);const color=gold?'255,190,48':'25,65,137',alpha=(gold?1.6:1)*(.065+.10*Math.pow(Math.sin(f*Math.PI),2));const light=c.createLinearGradient(0,0,w,0);light.addColorStop(0,`rgba(${color},0)`);light.addColorStop(.22,`rgba(${color},${alpha*.65})`);light.addColorStop(.52,`rgba(${color},${alpha})`);light.addColorStop(.83,`rgba(${color},${alpha*.6})`);light.addColorStop(1,`rgba(${color},0)`);c.strokeStyle=light;c.lineWidth=gold?.65:.55;c.stroke()}}
ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.save();ctx.globalAlpha=.85;ctx.filter='blur(7px)';ctx.drawImage(veilLayer,0,0,w,h);ctx.filter='none';ctx.globalAlpha=1;ctx.drawImage(veilLayer,0,0,w,h);ctx.restore();
// Reflection breaks into narrow, low-opacity ripples and dissipates toward the viewer.
const horizon=h*.79;ctx.save();for(let y=horizon;y<h*.95;y+=3){const depth=(y-horizon)/(h*.16),sy=horizon-(y-horizon)*1.8,dx=Math.sin(y*.12+t*.4)*(2+depth*9);ctx.globalAlpha=(1-depth)*.22;ctx.drawImage(veilLayer,0,Math.max(0,sy*scale),veilLayer.width,2*scale,dx,y,w,1.4)}ctx.restore();
// Pinpoint light sources remain small and are attached to the wave.
for(let i=0;i<8;i++){const x=w*(.14+i*.116),y=surface(x,0);ctx.beginPath();ctx.moveTo(x,y-35);ctx.lineTo(x,h*.83);ctx.setLineDash([1,5]);ctx.strokeStyle='rgba(151,183,223,.19)';ctx.lineWidth=.6;ctx.stroke();ctx.setLineDash([]);const gold=i===selected,color=gold?'255,201,65':'66,111,183',r=gold?11:7,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},.65)`);g.addColorStop(.17,`rgba(${color},.25)`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.beginPath();ctx.arc(x,y,gold?2.2:1.3,0,Math.PI*2);ctx.fillStyle=gold?'#ffcd52':'#426fb7';ctx.fill()}}
let previousFrame=0;function animate(now){const dt=Math.min((now-previousFrame)/1000||0, .05);previousFrame=now;if(!$('#explore').hidden){const target=data[selected].height;displayedHeight+=(target-displayedHeight)*(1-Math.exp(-3*dt));t+=dt*.38;draw()}requestAnimationFrame(animate)}select(selected);resize();requestAnimationFrame(animate);

const months=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
let activeMonth=9;const monthButton=$('#month'),monthOptions=$('#month-options');
function closeMonths(){monthOptions.hidden=true;monthButton.setAttribute('aria-expanded','false')}
months.forEach((name,i)=>{const option=document.createElement('button');option.type='button';option.setAttribute('role','option');option.setAttribute('aria-selected',i===9);option.textContent=name+' 2026';option.onclick=()=>{activeMonth=i;monthButton.firstElementChild.textContent=name+' 2026';monthOptions.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-selected',i===j));closeMonths();monthButton.focus();const available=i===9;$('#phases').style.visibility=available?'':'hidden';$('#waves').style.visibility=available?'':'hidden';$('#timeline').style.visibility=available?'':'hidden';$('#level').style.opacity=available?'1':'0';$('.swipe-hint').style.visibility=available?'':'hidden';$('.reading').hidden=!available;let empty=$('#empty-month');if(!empty){empty=document.createElement('div');empty.id='empty-month';empty.setAttribute('role','status');$('#explore').append(empty)}empty.hidden=available;empty.innerHTML='<span>'+name+' 2026</span><p>Aún no hay datos de marea para este mes.</p>';$('.bottom-note').firstChild.textContent=available?'DATOS PROPORCIONADOS · OCTUBRE 2026 ':'SIN DATOS · '+name+' 2026 '};option.onkeydown=e=>{if(e.key==='Escape'){closeMonths();monthButton.focus()}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const next=(i+(e.key==='ArrowDown'?1:11))%12;monthOptions.children[next].focus()}};monthOptions.append(option)});
monthButton.onclick=()=>{const open=monthOptions.hidden;monthOptions.hidden=!open;monthButton.setAttribute('aria-expanded',String(open));if(open){monthOptions.children[activeMonth].focus();monthOptions.children[activeMonth].scrollIntoView({block:'nearest'})}};
monthButton.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();monthButton.click()}};
document.addEventListener('pointerdown',e=>{if(!$('.month').contains(e.target))closeMonths()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMonths()});

// Dos copias se solapan al final para suavizar imagen y sonido en cada vuelta.
const seaVideo=document.querySelector('#sea-video'),seaAudio=document.querySelector('#sea-audio');
const seaTwin=seaVideo.cloneNode(true);seaTwin.id='sea-video-twin';seaVideo.after(seaTwin);const seaClips=[seaVideo,seaTwin];seaClips.forEach(v=>{v.loop=false;v.volume=0;v.style.opacity='0'});
let seaCurrent=0,seaRunning=false,seaMuted=false,seaNeedsPlay=false,seaMix=false,seaMixStart=0;const seaFade=1.5;
function updateSeaAudio(){seaAudio.textContent=seaNeedsPlay?'Reproducir mar con sonido':seaMuted?'Sonido: desactivado':'Sonido: activado';seaAudio.setAttribute('aria-pressed',String(!seaMuted));seaAudio.setAttribute('aria-label',seaMuted?'Activar sonido del mar':'Silenciar sonido del mar')}
async function startSea(){try{const v=seaClips[seaCurrent];v.style.opacity='1';v.muted=seaMuted;v.volume=tideVolume();await v.play();seaRunning=true;seaNeedsPlay=false}catch{seaMuted=true;seaClips.forEach(clip=>clip.muted=true);try{await seaClips[seaCurrent].play();seaRunning=true;seaNeedsPlay=false}catch{seaNeedsPlay=true}}updateSeaAudio()}
function pauseSea(){seaRunning=false;seaClips.forEach(v=>v.pause())}
function seaLoop(){if(seaRunning){const v=seaClips[seaCurrent],next=seaClips[1-seaCurrent];if(!seaMix)v.volume=tideVolume();if(!seaMix&&Number.isFinite(v.duration)&&v.duration-v.currentTime<=seaFade){seaMix=true;seaMixStart=performance.now();next.currentTime=0;next.muted=seaMuted;next.volume=0;next.style.zIndex='0';v.style.zIndex='0';next.play().catch(()=>{seaMix=false})}if(seaMix){const f=Math.min(1,(performance.now()-seaMixStart)/(seaFade*1000));v.style.opacity=String(1-f);next.style.opacity=String(f);v.volume=tideVolume()*(1-f);next.volume=tideVolume()*f;if(f===1){v.pause();v.currentTime=0;seaCurrent=1-seaCurrent;seaMix=false}}}requestAnimationFrame(seaLoop)}requestAnimationFrame(seaLoop);
document.querySelector('#back').addEventListener('click',pauseSea);seaAudio.onclick=()=>{if(seaNeedsPlay){seaMuted=false;startSea()}else{seaMuted=!seaMuted;seaClips.forEach(v=>v.muted=seaMuted);updateSeaAudio()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseSea();else if(!document.querySelector('#explore').hidden)startSea()});

startSea();

})();
}

// Reflexión
if(document.querySelector('.reflection')){
(()=>{
const scenarios=[{title:'Escenario utópico:',text:'Generar mayor conciencia y apreciación de la conexión entre los fenómenos naturales.'},{title:'Escenario distópico:',text:'Simplificar excesivamente el fenómeno, provocando interpretaciones erróneas.'},{title:'Escenario probable:',text:'Facilitar la comprensión visual de las mareas y despertar curiosidad por las conexiones naturales.'}];
let scenario=0;
const scenarioText=document.querySelector('#scenario-text'),count=document.querySelector('#scenario-count');
function showScenario(change){scenario=(scenario+change+scenarios.length)%scenarios.length;scenarioText.replaceChildren();const title=document.createElement('strong');title.textContent=scenarios[scenario].title;scenarioText.append(title,document.createElement('br'),document.createTextNode(scenarios[scenario].text));count.textContent=`${scenario+1} / ${scenarios.length}`;const card=document.querySelector('#scenario-card');card.dataset.pinned='true';card.classList.add('is-flipped');card.querySelector('.flip-button').setAttribute('aria-pressed','true')}
document.querySelectorAll('.moon-card').forEach(card=>{const button=card.querySelector('.flip-button');function flip(on){card.classList.toggle('is-flipped',on);button.setAttribute('aria-pressed',String(on))}card.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)flip(true)});card.addEventListener('mouseleave',()=>{if(card.dataset.pinned!=='true')flip(false)});button.onclick=()=>{const pin=card.dataset.pinned!=='true';card.dataset.pinned=String(pin);flip(pin)};button.addEventListener('keydown',e=>{if(e.key==='Escape'){card.dataset.pinned='false';flip(false)}if(card.id==='scenario-card'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showScenario(e.key==='ArrowRight'?1:-1)}})});
document.querySelector('#scenario-prev').onclick=()=>showScenario(-1);document.querySelector('#scenario-next').onclick=()=>showScenario(1);
let startX;const scenarioCard=document.querySelector('#scenario-card');scenarioCard.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});scenarioCard.addEventListener('touchend',e=>{if(startX!==undefined&&Math.abs(e.changedTouches[0].clientX-startX)>35){showScenario(e.changedTouches[0].clientX<startX?1:-1)}startX=undefined},{passive:true});

})();
}

// Estrellas compartidas por las tres pantallas.
(()=>{
// Cielo de estrellas: secuencia estable con duraciones y retrasos independientes.
let starSeed=2718;function starRandom(){starSeed=(starSeed*16807)%2147483647;return(starSeed-1)/2147483646}
document.querySelectorAll('.screen, .reflection').forEach(screen=>{const sky=document.createElement('div');sky.className='star-sky';sky.setAttribute('aria-hidden','true');for(let i=0;i<85;i++){const star=document.createElement('i');const size=1+starRandom()*1.8;star.className='sky-star'+(i%9===0?' star-spark':'');star.style.cssText=`left:${2+starRandom()*96}%;top:${2+starRandom()*65}%;width:${size}px;height:${size}px;--duration:${3.5+starRandom()*7}s;--delay:${-starRandom()*14}s;--peak:${.6+starRandom()*.4}`;sky.append(star)}screen.prepend(sky)});




})();
