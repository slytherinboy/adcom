import * as THREE from './assets/three.module.js';

const host = document.getElementById('hero-scene');
function showFallback() {
  if (!host) return;
  host.classList.remove('scene-ready');
  host.classList.add('fallback-art');
  host.dataset.renderMode = 'fallback';
  const button = host.querySelector('.scene-toggle');
  if (button) button.hidden = true;
}
if (host) {
  try { initialize(); } catch (error) {
    console.warn('Visuel de secours A.DCOM :', error.message);
    showFallback();
  }
}
function initialize() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.WebGLRenderingContext) throw new Error('WebGL indisponible');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 40);
  camera.position.set(0, .1, 10);
  camera.lookAt(0, 0, 0);
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#dddddd');
  const shell = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: '#9caaa2', side: THREE.BackSide }));
  studio.add(shell);
  for (const [x,y,z,w,h,intensity] of [[-4,4,3,4,7,5],[4,2,2,2,8,4],[0,7,-3,6,3,5],[-3,-2,-5,3,4,1]]) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color:new THREE.Color(intensity,intensity,intensity),side:THREE.DoubleSide}));
    panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .06);
  scene.environment = environment.texture;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb4c8ba, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);key.position.set(-3,5,6);scene.add(key);
  const rim = new THREE.DirectionalLight(0xd0fff0, 2);rim.position.set(4,2,-3);scene.add(rim);
  const group = new THREE.Group();scene.add(group);
  const green = new THREE.MeshPhysicalMaterial({color:'#009a51',metalness:.18,roughness:.18,clearcoat:.85,clearcoatRoughness:.1,transmission:0,thickness:.6,ior:1.45,envMapIntensity:.65});
  const pearl = new THREE.MeshPhysicalMaterial({color:'#fafbf9',metalness:.07,roughness:.23,clearcoat:1,envMapIntensity:1});
  const chrome = new THREE.MeshStandardMaterial({color:'#bfc8c5',metalness:1,roughness:.13,envMapIntensity:1.4});
  const black = new THREE.MeshPhysicalMaterial({color:'#101815',metalness:.32,roughness:.22,clearcoat:1});
  function extrude(shape,depth=.32,bevel=.12) {
    const geometry = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:6,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:28});
    geometry.translate(0,0,-depth/2);return geometry;
  }
  function speechShape() {
    const s = new THREE.Shape();
    s.moveTo(-.8,.86);s.lineTo(.8,.86);s.quadraticCurveTo(1.14,.86,1.14,.51);s.lineTo(1.14,-.42);s.quadraticCurveTo(1.14,-.76,.8,-.76);
    s.lineTo(.34,-.76);s.quadraticCurveTo(.26,-.8,.15,-1.01);s.lineTo(-.06,-1.28);s.quadraticCurveTo(-.16,-1.37,-.19,-1.17);s.lineTo(-.28,-.76);
    s.lineTo(-.8,-.76);s.quadraticCurveTo(-1.14,-.76,-1.14,-.42);s.lineTo(-1.14,.51);s.quadraticCurveTo(-1.14,.86,-.8,.86);return s;
  }
  function bubble(material,dotsMaterial){
    const b = new THREE.Group();b.add(new THREE.Mesh(extrude(speechShape(),.5,.16),material));
    for(const x of [-.56,0,.56]){
      const dot=new THREE.Mesh(new THREE.SphereGeometry(.145,28,20),dotsMaterial);dot.scale.z=.48;dot.position.set(x,.08,.50);b.add(dot);
    }return b;
  }
  const greenBubble=bubble(green,pearl);greenBubble.position.set(-.93,.74,-.4);greenBubble.rotation.set(.07,-.42,.13);group.add(greenBubble);
  const whiteBubble=bubble(pearl,black);whiteBubble.position.set(.45,-.35,.6);whiteBubble.rotation.set(-.08,.4,-.14);group.add(whiteBubble);
  // An actual three-dimensional orbital curve: it passes in front of and behind the bubbles.
  const points=[];
  for(let i=0;i<=180;i++){const a=i/180*Math.PI*2;const x=2.65*Math.cos(a),y=1.35*Math.sin(a);points.push(new THREE.Vector3(x*Math.cos(.35)-y*Math.sin(.35),x*Math.sin(.35)+y*Math.cos(.35),Math.sin(a)*1.1));}
  const orbit=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true),180,.035,10,true),chrome);orbit.position.y=.15;group.add(orbit);
  function roundSquare(){const s=new THREE.Shape();const r=.18,a=.44;s.moveTo(-a+r,-a);s.lineTo(a-r,-a);s.quadraticCurveTo(a,-a,a,-a+r);s.lineTo(a,a-r);s.quadraticCurveTo(a,a,a-r,a);s.lineTo(-a+r,a);s.quadraticCurveTo(-a,a,-a,a-r);s.lineTo(-a,-a+r);s.quadraticCurveTo(-a,-a,-a+r,-a);return s;}
  const love=new THREE.Group();love.add(new THREE.Mesh(extrude(roundSquare(),.16,.07),black));
  const heart=new THREE.Shape();heart.moveTo(0,-.23);heart.bezierCurveTo(-.5,.06,-.25,.39,0,.16);heart.bezierCurveTo(.25,.39,.5,.06,0,-.23);
  const heartMesh=new THREE.Mesh(extrude(heart,.06,.025),pearl);heartMesh.position.z=.17;love.add(heartMesh);love.position.set(1.15,1.68,.1);love.rotation.set(.06,.2,-.23);group.add(love);
  const video=new THREE.Group();video.add(new THREE.Mesh(extrude(roundSquare(),.16,.07),green));
  const triangle=new THREE.Shape();triangle.moveTo(-.12,-.23);triangle.lineTo(.23,0);triangle.lineTo(-.12,.23);triangle.closePath();
  const play=new THREE.Mesh(extrude(triangle,.06,.025),pearl);play.position.z=.19;video.add(play);video.position.set(2.22,.18,.4);video.rotation.set(-.1,-.25,-.22);video.scale.setScalar(.8);group.add(video);
  const spheres=[];
  for(const [x,y,z,r] of [[-1.6,-1.3,.6,.16],[.35,1.63,.1,.1],[1.8,1.01,1,.17],[-.4,-1.82,.45,.1]]){
    const sphere=new THREE.Mesh(new THREE.SphereGeometry(r,28,20),chrome);sphere.position.set(x,y,z);sphere.userData.baseY=y;spheres.push(sphere);group.add(sphere);
  }
  // Soft grounding shadow is a texture on a plane in the 3D scene.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,2,64,64,64);gradient.addColorStop(0,'rgba(20,35,27,.24)');gradient.addColorStop(1,'rgba(20,35,27,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5.3,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.position.set(0,-2.07,-.6);scene.add(shadow);
  let paused=reducedMotion.matches,visible=true,frame=0,time=0,last=0;
  const pointer={x:0,y:0};
  const isMobile=window.matchMedia('(max-width:600px)').matches;
  const button=host.querySelector('.scene-toggle');
  function updateButton(){button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Animer le visuel 3D':'Mettre le visuel 3D en pause');button.textContent=paused?'Animer':'Pause';}
  button.addEventListener('click',()=>{paused=!paused;updateButton();start();});
  reducedMotion.addEventListener('change',e=>{paused=e.matches;updateButton();start();});
  host.addEventListener('pointermove',e=>{if(paused||e.pointerType==='touch')return;const box=host.getBoundingClientRect();pointer.x=(e.clientX-box.left)/box.width-.5;pointer.y=(e.clientY-box.top)/box.height-.5;});
  host.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<1?11.2:9.7;camera.updateProjectionMatrix();renderer.render(scene,camera);}
  function draw(now){frame=0;if(!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused){time+=dt;const drift=isMobile?.22:.12;group.rotation.y=Math.sin(time*.38)*drift+pointer.x*.28;group.rotation.x=Math.cos(time*.31)*drift*.32-pointer.y*.12;greenBubble.position.y=.74+Math.sin(time*.75)*.14;whiteBubble.position.y=-.35+Math.sin(time*.75+1.2)*.12;love.rotation.z=-.23+Math.sin(time*.6)*.14;video.rotation.y=-.25+Math.sin(time*.7)*.18;spheres.forEach((s,i)=>s.position.y=s.userData.baseY+Math.sin(time*.8+i)*.1);}renderer.render(scene,camera);if(!paused)frame=requestAnimationFrame(draw);}
  function start(){if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(draw);}}
  new ResizeObserver(()=>{resize();start();}).observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else if(frame){cancelAnimationFrame(frame);frame=0;}},{threshold:.05}).observe(host);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);showFallback();});
  canvas.addEventListener('webglcontextrestored',()=>{resize();host.classList.add('scene-ready');start();});
  resize();host.classList.remove('fallback-art');host.classList.add('scene-ready');host.dataset.renderMode='webgl';updateButton();start();
}
