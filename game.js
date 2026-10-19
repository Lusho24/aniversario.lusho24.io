/**
 * LA FLOR MÁS HERMOSA — aniversario 19/10/26
 * Juego completo en HTML5 Canvas, sin bibliotecas ni conexiones externas.
 * Personajes dibujados en pixel art tomando como referencia la foto recibida.
 */
'use strict';

const $ = (id) => document.getElementById(id);
const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;
const WORLD_LENGTH = 2810;
const FLOWER_X = 2570;
const GIRL_X = 2640;
const START_X = 55;
let VW = 480, VH = 270, floorY = 214;
let mode = 'menu';
let activeMemoryIndex = -1;
let soundOn = true;
let audioContext = null;
let lastMusic = 0;
let musicStep = 0;
let animationClock = 0;
let frameTime = 0;
let game = null;
let toastTimer = 0;
let lockTimer = 0;
const held = { left: false, right: false, run: false };
const sprites = {};
const spritesList = ['chico_0', 'chico_1', 'chico_2', 'chica', 'chica_saluda'];
for (const name of spritesList) {
  const image = new Image();
  image.src = `assets/${name}.png`;
  sprites[name] = image;
}

// Deterministic environmental details: the landscape is the same every visit.
function randomFactory(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
const rand = randomFactory(191026);
const stars = Array.from({ length: 190 }, () => ({
  x: rand() * 1170, y: rand(), size: rand() > .90 ? 2 : 1, phase: rand() * 7
}));
const hillsBack = Array.from({ length: 38 }, (_, i) => ({ x: i * 96 - 90, size: 27 + rand() * 38 }));
const hillsFront = Array.from({ length: 36 }, (_, i) => ({ x: i * 112 - 80, size: 21 + rand() * 42 }));
const trees = Array.from({ length: 49 }, (_, i) => ({
  x: i * 69 + rand() * 32 - 10, h: 25 + rand() * 35, t: rand()
}));
// Estas son las flores marchitas del camino: CADA UNA quita una vida al tocarla.
// Se colocan separadas para que TODAS puedan saltarse limpiamente.
const hazardPositions = [325, 490, 660, 825, 995, 1160, 1330, 1500, 1670, 1840, 2010, 2180, 2350, 2490];
const dryFlowers = hazardPositions.map((x, i) => ({
  x, size: 20 + (i % 3) * 2, depth: 0,
  tilt: i % 2 ? -1 : 1, variant: i % 4, phase: i * 1.7
}));
// Flores lejanas: están DETRÁS del camino y no pueden tocarse.
// Las flores grandes que aparecen sobre la línea del suelo son los obstáculos reales.
const backgroundWiltedFlowers = Array.from({ length: 115 }, (_,i) => ({
  x: 18 + i*24.3 + (rand()-.5)*17, h: 8+rand()*15,
  side: rand()>.5?1:-1, tint: Math.floor(rand()*3)
}));
const rocks = Array.from({ length: 285 }, () => ({
  x: rand() * WORLD_LENGTH, y: rand(), width: 1 + rand() * 5, tint: Math.floor(rand() * 4)
}));
// Cada corazón abre un recuerdo distinto. El primer corazón es la chica leyendo.
const heartPositions = [205, 408, 610, 813, 1016, 1219, 1422, 1625, 1828, 2031, 2234, 2437];
const defaultMemories = [
  {title:'Nuestro primer sí', message:'Y pensar que todo empezó así... con un sí, un día como hoy. ♥'},
  {title:'Esa sonrisa', message:'Hay sonrisas que se vuelven el lugar favorito de alguien. La mía siempre busca la tuya. ♡'},
  {title:'Un recuerdo bonito', message:'De todos los momentos que guardo, mis favoritos siempre llevan un pedacito de ti.'},
  {title:'Nuestro pequeño universo', message:'Contigo hasta los días más sencillos se sienten extraordinarios. ✦'},
  {title:'De la mano', message:'Si la vida es un camino, qué suerte la mía de recorrerlo contigo.'},
  {title:'Un día inolvidable', message:'Ojalá pudiera guardar cada abrazo para volver a sentirlo cuando te extraño.'},
  {title:'Las risas', message:'Gracias por tantas risas, por las ocurrencias y por hacer mis días más ligeros.'},
  {title:'Nuestro lugar', message:'No importa el lugar ni la distancia: mi hogar siempre se parece un poquito a ti.'},
  {title:'Las aventuras', message:'Todavía nos quedan tantos lugares por descubrir y tantas historias por contar.'},
  {title:'Pequeñas coincidencias', message:'Qué bonito que entre tantas posibilidades la vida nos haya encontrado.'},
  {title:'Mi persona favorita', message:'Me enamoran los detalles que quizá ni tú notas, pero que yo nunca olvido.'},
  {title:'Lo que viene', message:'Esto es solo el comienzo de todos los recuerdos que quiero seguir creando contigo. ♥'}
];
// Coloca el archivo recuerdos.js generado con personalizar.html junto a index.html.
const personalMemories = Array.isArray(window.RECUERDOS_PERSONALIZADOS) ? window.RECUERDOS_PERSONALIZADOS : [];
const memories = defaultMemories.map((m, index) => {
  const extra = personalMemories[index] || {};
  return {title: extra.title || m.title, message: extra.message || m.message,
    image: extra.image || null, artwork: `assets/recuerdos/${String(index+1).padStart(2,'0')}.png`};
});
const inspectLines = [
  'Esta flor necesita un poquito de primavera...',
  'No es esta... Mi corazón me dice que siga. ♡',
  'Hasta los pétalos tristes tienen una historia.',
  'Por aquí hay flores, pero ninguna brilla.',
  'Tal vez la más hermosa esté más adelante...'
];

function layoutCanvas() {
  const portrait = window.innerWidth <= 680 && window.innerHeight > window.innerWidth;
  VW = portrait ? 320 : 480;
  VH = portrait ? 392 : 270;
  floorY = VH - 56;
  canvas.width = VW;
  canvas.height = VH;
  ctx.imageSmoothingEnabled = false;
  if (game) game.camera = Math.min(Math.max(0,game.camera), WORLD_LENGTH - VW);
  if (game && mode === 'playing') render(game);
}

function resetInputs() {
  held.left = false;held.right = false;held.run = false;
  document.querySelectorAll('.touch-button.is-held').forEach(b => b.classList.remove('is-held'));
}
function newGame() {
  return {
    player: { x: START_X, z: 0, vz: 0, vx: 0, facing: 1, walk: 0 },
    camera: 0, time: 0, hearts: new Set(), observed: new Set(),
    trigger: false, readyEndAt: null, hintStage: 0, twinkle: 0,
    lives: 3, immunity: 0, lastHitAt: null
  };
}
function showScreen(name) {
  $('menuScreen').hidden = name !== 'menu';
  $('gameScreen').hidden = name !== 'game';
  $('endScreen').hidden = name !== 'end';
  window.scrollTo(0,0);
}
function play() {
  resetInputs();
  game = newGame();
  mode = 'playing';
  layoutCanvas();
  $('pauseLayer').hidden = true;
  $('gameOverLayer').hidden = true;
  $('memoryLayer').hidden = true;
  activeMemoryIndex = -1;
  $('livesText').textContent = 'VIDAS ♥ ♥ ♥';
  $('progressFill').style.width = '0%';
  $('progressText').textContent = '0%';
  $('heartsText').textContent = `♡ 0/${heartPositions.length}`;
  showScreen('game');
  startAudio();
  lastMusic = 0;musicStep = 0;
  notify('¡SALTA las flores marchitas! ♥ Tienes 3 vidas.', 3600);
  frameTime = 0;
}
function menu() {
  mode = 'menu';resetInputs();
  $('pauseLayer').hidden = true;
  $('gameOverLayer').hidden = true;
  $('memoryLayer').hidden = true;
  activeMemoryIndex = -1;
  $('gameToast').classList.remove('show');
  refreshMenu();showScreen('menu');
}
function refreshMenu() {
  try { if (localStorage.getItem('flor_encontrada_191026') === 'si') $('levelOneCaption').textContent = 'Nuestra historia, para revivirla ♡'; }
  catch (_) { /* Storage may be unavailable when opened as a local file. */ }
}
function openMemory(index) {
  if (mode !== 'playing' || !memories[index]) return;
  const memory = memories[index];
  mode = 'memory';
  activeMemoryIndex = index;
  resetInputs();
  const image = $('memoryPhoto');
  const artwork = $('memoryPlaceholder');
  image.hidden = true;
  artwork.hidden = false;
  image.onload = () => {if (activeMemoryIndex === index) { image.hidden = false; artwork.hidden = true; }};
  image.onerror = () => { image.hidden = true; artwork.hidden = false; };
  image.src = memory.image || memory.artwork;
  $('memoryCount').textContent = `RECUERDO ${String(index+1).padStart(2,'0')} / ${memories.length}`;
  $('memoryTitle').textContent = memory.title;
  $('memoryCaption').textContent = memory.message;
  $('memoryLayer').hidden = false;
  $('continueMemoryButton').focus({preventScroll:true});
}
function closeMemory() {
  if (mode !== 'memory') return;
  mode = 'playing';
  activeMemoryIndex = -1;
  $('memoryLayer').hidden = true;
  $('memoryPhoto').removeAttribute('src');
  frameTime = 0;
}
function updateLivesHUD() {
  if (!game) return;
  $('livesText').textContent = `VIDAS ${'♥ '.repeat(game.lives)}${'♡ '.repeat(3 - game.lives)}`.trim();
  $('livesText').setAttribute('aria-label', `${game.lives} de 3 vidas restantes`);
}
function hitFlower(flower) {
  if (!game || mode !== 'playing' || game.immunity > 0) return;
  const p = game.player;
  game.lives -= 1;
  updateLivesHUD();
  tone(235, .25, .035, 'sawtooth');
  tone(155, .36, .022, 'sawtooth', .11);
  game.lastHitAt = game.time;
  p.vx = 0;
  p.vz = 0;
  p.z = 0;
  p.x = Math.max(START_X, flower.x - 58); // Reintento antes de la flor, sin perder corazones.
  if (game.lives <= 0) {
    mode = 'gameover';
    resetInputs();
    $('gameOverLayer').hidden = false;
    $('gameOverHearts').textContent = `Conseguiste ${game.hearts.size} de ${heartPositions.length} recuerdos`;
    $('retryButton').focus({preventScroll:true});
    return;
  }
  game.immunity = 1.45; // Evita que la misma flor quite las otras dos vidas inmediatamente.
  notify(`¡Una flor marchita te tocó! Te quedan ${game.lives} ${game.lives===1?'vida':'vidas'}. ¡SÁLTALA!`, 2600);
}
function pauseToggle() {
  if (mode === 'playing') { mode = 'paused';resetInputs();$('pauseLayer').hidden = false; }
  else if (mode === 'paused') { mode = 'playing';$('pauseLayer').hidden = true;frameTime = 0; }
}
function endGame() {
  if (mode !== 'winning') return;
  mode = 'end';
  resetInputs();
  showScreen('end');
  try { localStorage.setItem('flor_encontrada_191026','si'); } catch (_) {}
}
function notify(message, duration = 2200) {
  const toast = $('gameToast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}
function lockedMessage() {
  $('lockedNote').textContent = '🔒 Este capítulo sigue guardadito para el 19/10/27. ♡';
  clearTimeout(lockTimer);
  lockTimer = setTimeout(() => $('lockedNote').textContent = '', 4300);
}

// Minimal, self-contained chiptune using the Web Audio API. No mp3 needed.
function startAudio() {
  if (!soundOn) return;
  try {
    const AudioApi = window.AudioContext || window.webkitAudioContext;
    if (!AudioApi) return;
    if (!audioContext) audioContext = new AudioApi();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  } catch (_) { /* Music is optional, gameplay still works everywhere. */ }
}
function tone(frequency, duration = .13, volume = .019, type = 'triangle', delay = 0) {
  if (!soundOn || !audioContext || audioContext.state !== 'running') return;
  try {
    const t = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const volumeNode = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency,t);
    volumeNode.gain.setValueAtTime(.0001,t);
    volumeNode.gain.exponentialRampToValueAtTime(volume,t+.017);
    volumeNode.gain.exponentialRampToValueAtTime(.0001,t+duration);
    oscillator.connect(volumeNode);volumeNode.connect(audioContext.destination);
    oscillator.start(t);oscillator.stop(t+duration+.02);
  } catch (_) {}
}
const tune = [261.63,329.63,392,493.88,440,392,329.63,293.66,261.63,329.63,440,523.25,493.88,392,329.63,293.66];
function musicUpdate() {
  if (!soundOn || !game || mode !== 'playing') return;
  if (game.time-lastMusic > .34) {
    lastMusic = game.time;
    tone(tune[musicStep % tune.length],.27,.012,'triangle');
    if (musicStep % 4 === 0) tone(130.81, .35, .007, 'sine', .04);
    musicStep++;
  }
}
function winSound() {
  [392,493.88,587.33,783.99,1046.5].forEach((note,i) => tone(note,.4,.028,'triangle',i*.14));
}
function soundToggle() {
  soundOn = !soundOn;
  if (soundOn) startAudio();
  $('musicButton').innerHTML = soundOn ? '♪ <span>ON</span>' : '♪ <span>OFF</span>';
  $('musicButton').setAttribute('aria-label', soundOn ? 'Desactivar música' : 'Activar música');
}

function jump() {
  if (mode !== 'playing' || !game) return;
  if (game.player.z < .3) {
    game.player.z = .5;
    game.player.vz = 245;
    tone(430,.11,.015,'square');
  }
}
function examine() {
  if (mode !== 'playing' || !game) return;
  const nearby = dryFlowers.filter(f => Math.abs(f.x - game.player.x) < 38);
  if (!nearby.length) {notify('Acércate a una flor para mirarla. ✿',1500);return;}
  const f = nearby.reduce((a,b) => Math.abs(a.x-game.player.x)<Math.abs(b.x-game.player.x)?a:b);
  const index = dryFlowers.indexOf(f);
  game.observed.add(index);
  tone(345,.09,.009);
  notify(inspectLines[index % inspectLines.length],2700);
}
function win() {
  if (mode !== 'playing') return;
  mode = 'winning';
  game.trigger = true;
  game.readyEndAt = game.time + 1.2;
  resetInputs();
  $('progressText').textContent = '100%';
  $('endingCollected').textContent = `${game.hearts.size} de ${heartPositions.length} recuerdos encontrados`; 
  $('progressFill').style.width = '100%';
  notify('¡La encontraste! ♡',1300);
  winSound();
}
function update(dt) {
  if (!game) return;
  if (mode === 'memory' || mode === 'gameover') return;
  game.time += dt;
  game.immunity = Math.max(0, game.immunity-dt);
  const p = game.player;
  if (mode === 'winning') {
    p.vx *= Math.max(0, 1 - dt * 7);
    if (game.time >= game.readyEndAt) endGame();
  }
  if (mode !== 'playing' && mode !== 'winning') return;
  if (mode === 'playing') {
    const inputDirection = Number(held.right) - Number(held.left);
    const speed = held.run ? 185 : 115;
    const target = inputDirection * speed;
    const accel = dt * (inputDirection ? 650 : 1100);
    p.vx += Math.max(-accel, Math.min(accel, target-p.vx));
    if (inputDirection) p.facing = inputDirection;
  }
  const oldX = p.x;
  p.x = Math.max(24,Math.min(WORLD_LENGTH - 20, p.x + p.vx * dt));
  if (Math.abs(p.vx) > 10) p.walk += dt * Math.abs(p.vx) / 30;
  if (p.z > 0 || p.vz > 0) {
    p.z += p.vz * dt;
    p.vz -= 650 * dt;
    if (p.z <= 0) {p.z=0;p.vz=0;}
  }
  const cameraTarget = Math.max(0,Math.min(WORLD_LENGTH-VW, p.x - VW * .36));
  game.camera += (cameraTarget-game.camera)*Math.min(1,dt*6.8);
  if (mode === 'playing') {
    // Colisión continua en X: funciona también al correr y con FPS variables.
    if (game.immunity <= 0) {
      for (const flower of dryFlowers) {
        const sweptMin = Math.min(oldX,p.x)-12;
        const sweptMax = Math.max(oldX,p.x)+12;
        if (flower.x >= sweptMin && flower.x <= sweptMax && p.z < 26) {
          hitFlower(flower);
          break;
        }
      }
    }
    if (mode !== 'playing') return;
    for (let i=0;i<heartPositions.length;i++) {
      if (!game.hearts.has(i) && Math.abs(p.x-heartPositions[i]) < 19 && p.z < 55) {
        game.hearts.add(i);
        $('heartsText').textContent = `♥ ${game.hearts.size}/${heartPositions.length}`;
        tone(698.46,.12,.024,'triangle');tone(880,.18,.018,'triangle',.08);
        openMemory(i);
        break;
      }
    }
    const percentage = Math.min(100,Math.max(0,Math.round((p.x - START_X)/(FLOWER_X-START_X)*100)));
    $('progressFill').style.width = `${percentage}%`;
    $('progressText').textContent = `${percentage}%`;
    if (p.x > 930 && game.hintStage < 1) {game.hintStage = 1;notify('Hay muchas flores... pero ninguna es como ella. ♡',3200);}
    if (p.x > 1950 && game.hintStage < 2) {game.hintStage = 2;notify('A lo lejos parece haber un brillo diferente... ✦',3400);}
    if (Math.abs(p.x-FLOWER_X) < 56) win();
    musicUpdate();
  }
}

// ------------- All stage art is drawn at low resolution for true pixel graphics.
function box(x,y,w,h,color) {
  ctx.fillStyle=color;
  ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function polygon(points,color) {
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(Math.round(points[0][0]),Math.round(points[0][1]));
  for(let i=1;i<points.length;i++)ctx.lineTo(Math.round(points[i][0]),Math.round(points[i][1]));
  ctx.closePath();ctx.fill();
}
function pixelLine(x1,y1,x2,y2,color,width=1) {
  ctx.strokeStyle=color;ctx.lineWidth=width;
  ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();
}
function screenX(worldX,cam) {return Math.round(worldX - cam);}
function sky(cam,t) {
  const colors = ['#191626','#211b30','#292038','#30243e','#392a46','#46324f','#523b52','#654853'];
  for(let i=0;i<colors.length;i++){
    const y=Math.floor(floorY*i/colors.length);
    box(0,y,VW,Math.ceil(floorY/colors.length)+1,colors[i]);
  }
  // Stars with slight twinkle, moving with the distant sky.
  for (const star of stars) {
    const x = Math.round(star.x-cam*.20);
    const y = Math.round(9+star.y*(floorY-75));
    if(x<0 || x>=VW)continue;
    const glowing=Math.sin(t*1.45+star.phase)>0.65;
    box(x,y,star.size,star.size,glowing?'#ffe5ce':'#b7a1bc');
  }
  // Square pixel moon.
  let moonX=Math.floor(VW*.84-cam*.055),moonY=42;
  for(let dy=-16;dy<=16;dy+=2){
    const wid=Math.floor(Math.sqrt(Math.max(0,16*16-dy*dy))/2)*2;
    box(moonX-wid,moonY+dy,wid*2,2,'#f5dfc4');
  }
  box(moonX-5,moonY-6,5,4,'#e0bdaf');box(moonX+6,moonY+4,4,5,'#e8c8b3');
  // Distant hills.
  for (const hill of hillsBack) {
    const x=hill.x-cam*.25, peak=floorY-57-hill.size*.45;
    if(x>VW+100||x< -180)continue;
    polygon([[x-73,floorY],[x,peak],[x+83,floorY]],'#3b3148');
  }
  for (const hill of hillsFront) {
    const x=hill.x-cam*.48,peak=floorY-25-hill.size*.54;
    if(x>VW+110||x< -150)continue;
    polygon([[x-78,floorY],[x,peak],[x+99,floorY]],'#30283e');
  }
  // Leafless trees, further away than the flowers.
  for(const tree of trees) {
    const x=tree.x-cam*.69,y=floorY+3,h=tree.h;
    if(x< -27 || x>VW+27)continue;
    box(x,y-h,3,h+3,'#292333');
    pixelLine(x+1,y-h*.63,x-h*.29,y-h*.94,'#292333',2);
    pixelLine(x+1,y-h*.47,x+h*.34,y-h*.85,'#292333',2);
    pixelLine(x-h*.25,y-h*.88,x-h*.36,y-h*.96,'#292333',1);
    pixelLine(x+h*.27,y-h*.77,x+h*.34,y-h*.93,'#292333',1);
  }
}
function distantWiltedFlowers(cam) {
  for (const flower of backgroundWiltedFlowers) {
    const x=Math.round(flower.x-cam*.88);
    if (x<-12 || x>VW+12)continue;
    const by=floorY-9, hy=by-flower.h;
    pixelLine(x,by,x,hy+3,'#594e60');
    pixelLine(x,hy+3,x+flower.side*4,hy+3,'#594e60');
    box(x+flower.side*4-3,hy,6,3,['#6e6170','#716474','#7a6877'][flower.tint]);
    box(x+flower.side*3,hy+3,4,2,'#4b4657');
  }
}
function ground(cam) {
  box(0,floorY,VW,VH-floorY,'#4e4149');
  box(0,floorY+5,VW,3,'#675051');
  box(0,floorY+8,VW,VH-floorY-8,'#382f3c');
  for(const rock of rocks) {
    let x=Math.round(rock.x-cam);
    if(x< -8 || x>VW+8)continue;
    const y = floorY+9+Math.round(rock.y*(VH-floorY-14));
    box(x,y,rock.width,rock.width>3?2:1,['#685259','#55444f','#78605f','#453c49'][rock.tint]);
  }
  // Little tufts of grass.
  for(let i=0;i<55;i++){
    let x=screenX(i*53+17,cam);
    if(x< -6||x>VW+6)continue;
    pixelLine(x,floorY+2,x-2,floorY-3,'#5d5a52');
    pixelLine(x+1,floorY+2,x+4,floorY-2,'#5d5a52');
  }
}
function wiltedFlower(f,cam,t) {
  const x=screenX(f.x,cam),base=floorY+(f.depth>.68?4:0);
  if(x< -35||x>VW+30)return;
  const height=f.size;
  const bend = f.tilt*(4+height*.18);
  const topY=base-height;
  let stem='#657062';
  pixelLine(x,base,x-1,topY+5,stem,2);
  pixelLine(x-1,topY+5,x+bend,topY+1,stem,2);
  box(x-1,base-height*.36,3,2,'#768078');
  polygon([[x,base-height*.4],[x+5,base-height*.52],[x+4,base-height*.32]],'#727b70');
  const headX=x+bend;
  const c=['#806b76','#89746d','#735f6c','#99817e'][f.variant];
  box(headX-5,topY-3,8,4,c);
  box(headX-6,topY,11,3,c);
  box(headX-3,topY+3,7,3,'#62565f');
  box(headX-2,topY+4,4,4,'#514b52');
  if(f.depth>.75)box(x+4,base+2,3,1,'#65545d');
  // Las flores peligrosas son las que crecen SOBRE el sendero.
  // Pétalos secos, espinas y pequeña señal de peligro.
  box(x-7,base+1,15,2,'#6f485d');
  polygon([[x-4,base-7],[x-9,base-13],[x-6,base-12]],'#be7c92');
  polygon([[x+3,base-10],[x+10,base-17],[x+7,base-9]],'#be7c92');
  box(headX-4,topY-5,3,2,'#deb0aa');
  box(headX+2,topY-1,2,2,'#e2b0a5');
}
function floatingHeart(x,y,t,index) {
  const bob = Math.round(Math.sin(t*3+index*3)*3);
  const px=Math.round(x),py=Math.round(y+bob);
  // Heart silhouette in 10x9 pixels.
  const rows=['.##.##.','#######','#######','.#####.','..###..','...#...'];
  rows.forEach((r,iy)=>{
    for(let ix=0;ix<r.length;ix++)if(r[ix]==='#')box(px+ix-3,py+iy,1,1,iy===0?'#ffe3d7':'#f7a0b8');
  });
  box(px-7,py+1,1,1,'#ffe5c5');box(px+8,py-3,2,2,'#ffe5c5');
}
function rose(cx,base,t) {
  const x=Math.round(cx),y=Math.round(base),b=Math.sin(t*2)*2;
  // Light motes: unique colour in the desaturated field.
  const pulses=[[-22,-49],[19,-56],[-35,-27],[32,-32],[0,-71],[26,-16],[-17,-12]];
  for(let i=0;i<pulses.length;i++){
    const s=pulses[i],sparkle=Math.sin(t*3+i*2.5);
    if(sparkle>-.55)box(x+s[0],y+s[1]+Math.round(b),sparkle>.5?3:2,sparkle>.5?3:2,'#f7d4a1');
  }
  // Halo is stepped / blocky, not smooth.
  for(let r=38;r>=22;r-=8){
    ctx.globalAlpha=r===38?.04:r===30?.08:.13;
    box(x-r/2,y-45-r/2,r,r,'#ff93b7');
  }
  ctx.globalAlpha=1;
  pixelLine(x,y,x-1,y-34,'#45704a',3);
  polygon([[x,y-13],[x-11,y-25],[x-13,y-21],[x-6,y-12]],'#70b574');
  polygon([[x,y-20],[x+10,y-28],[x+13,y-26],[x+8,y-18]],'#77b46d');
  box(x-2,y-42,4,10,'#517c4e');
  box(x-11,y-57,23,20,'#b33865');
  box(x-14,y-54,29,13,'#df4d78');
  box(x-9,y-61,19,28,'#f47e98');
  box(x-11,y-53,22,14,'#ffadc0');
  box(x-7,y-58,14,21,'#ffcad0');
  box(x-5,y-53,12,15,'#f45e8b');
  box(x-2,y-50,8,10,'#d63470');
  box(x,y-47,4,6,'#9f305f');
  box(x-8,y-57,5,3,'#ffe4cb');
  box(x+5,y-39,5,3,'#fa7291');
}
function drawSprite(name,x,y,w,h,face=1) {
  const pic=sprites[name];
  if(!pic || !pic.complete || !pic.naturalWidth) {
    box(x+4,y+5,w-8,h-8,'#f1dec6');box(x+8,y,w-16,18,'#d39b7f');
    return;
  }
  const drawX=Math.round(x),drawY=Math.round(y);
  if(face===-1){
    ctx.save();ctx.translate(drawX+w,drawY);ctx.scale(-1,1);
    ctx.drawImage(pic,0,0,w,h);
    ctx.restore();
  } else ctx.drawImage(pic,drawX,drawY,w,h);
}
function goalScene(cam,t) {
  const rx=screenX(FLOWER_X,cam),gx=screenX(GIRL_X,cam);
  if(rx < -90 || rx> VW+90)return;
  // Green island of hope.
  box(rx-41,floorY+1,80,4,'#5c6c56');
  box(rx-29,floorY+5,57,2,'#6e7859');
  rose(rx,floorY,t);
  const girlBob=Math.round(Math.sin(t*1.7)*.6);
  drawSprite(Math.sin(t*2)>0?'chica_saluda':'chica',gx-20,floorY-60+girlBob,40,60,1);
  if(rx>0 && rx<VW){
    ctx.textAlign='center';ctx.font='bold 8px monospace';ctx.fillStyle='#ffe6c6';
    ctx.fillText('✦',rx,floorY-80+Math.sin(t*3)*2);
  }
}
function foreground(cam,t) {
  // Petals in the last part of the trail point to the living rose.
  if(cam+VW > 2030){
    for(let i=0;i<19;i++){
      let wx=2070+i*27;
      let x=screenX(wx,cam),y=floorY-13-((i*17)%72)+Math.sin(t*.8+i)*5;
      if(x<0||x>VW)continue;
      box(x,y,3,2,i%3?'#b77899':'#efb2b7');
    }
  }
  // Additional tiny rose sparkles after finding it.
  if(game && game.trigger){
    for(let i=0;i<24;i++){
      const x=screenX(FLOWER_X+Math.sin(i*3.88)*(12+t%2*38),cam);
      const y=floorY-43+Math.cos(i*6.1)*(11+t%2*38);
      box(x,y,2,2,i%2===0?'#fff0c3':'#ff87ab');
    }
  }
}
function render(g) {
  const cam=g.camera,p=g.player,t=g.time;
  ctx.clearRect(0,0,VW,VH);
  sky(cam,t);
  distantWiltedFlowers(cam);
  ground(cam);
  for(const f of dryFlowers)wiltedFlower(f,cam,t);
  for(let i=0;i<heartPositions.length;i++){
    const x=screenX(heartPositions[i],cam);
    if(!g.hearts.has(i)&&x>-20&&x<VW+20)floatingHeart(x,floorY-77,t,i);
  }
  goalScene(cam,t);
  const pX=screenX(p.x,cam),pY=floorY-52-p.z;
  // shadow reduces as he jumps.
  box(pX-12+p.z*.05,floorY+1,26-p.z*.10,3,'#2c2636');
  const walking=p.z<1 && Math.abs(p.vx)>14;
  let frame=0;
  if(walking)frame=Math.floor(p.walk*2.2)%3;
  if (!(g.immunity > 0 && Math.floor(g.time*13)%2 === 0)) drawSprite('chico_'+frame,pX-17,pY,35,53,p.facing);
  if(p.z>8){box(pX-2,pY-9,2,2,'#f3c1bc');}
  foreground(cam,t);
  // Soft message suspended above rose just before the final reveal.
  if(p.x>FLOWER_X-210 && mode==='playing') {
    let x=screenX(FLOWER_X,cam);
    if(x>10 && x<VW-10){
      ctx.font='bold 9px monospace';ctx.textAlign='center';
      ctx.fillStyle='#ffdee0';ctx.fillText('¿SERÁ ELLA? ♡',x,floorY-90);
    }
  }
  // Far-left / far-right decorative borders, only on stage edges.
  if(cam<2){box(1,floorY-25,5,28,'#2c2637');box(6,floorY-35,3,10,'#2c2637');}
}

function frame(ts) {
  if (!frameTime) frameTime=ts;
  const dt=Math.min(.038,(ts-frameTime)/1000);
  frameTime=ts;
  animationClock+=dt;
  if ((mode === 'playing' || mode === 'winning') && game) {
    update(dt);
    if (game && mode !== 'end')render(game);
  }
  requestAnimationFrame(frame);
}

// Keyboard controls (PC). Keydown jump is one-shot to avoid autojump on repeat.
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  const playable = mode==='playing'||mode==='paused';
  if(['arrowleft','arrowright','arrowup',' ','shift','escape'].includes(key)&&playable)e.preventDefault();
  if(mode==='memory') {if(key==='escape'||key==='enter'||key===' ') {e.preventDefault();closeMemory();}return;}
  if(key==='escape') {if(playable)pauseToggle();return;}
  if(mode!=='playing')return;
  if(key==='arrowleft'||key==='a')held.left=true;
  if(key==='arrowright'||key==='d')held.right=true;
  if(key==='shift')held.run=true;
  if((key==='arrowup'||key==='w'||key===' ')&&!e.repeat)jump();
  if(key==='e'&&!e.repeat)examine();
});
window.addEventListener('keyup',e=>{
  const key=e.key.toLowerCase();
  if(key==='arrowleft'||key==='a')held.left=false;
  if(key==='arrowright'||key==='d')held.right=false;
  if(key==='shift')held.run=false;
});
window.addEventListener('blur',resetInputs);
window.addEventListener('resize',layoutCanvas);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){resetInputs();if(mode==='playing')pauseToggle();}
});

// Mobile: pointer events handle both fingers at once and release outside buttons.
for(const button of document.querySelectorAll('[data-control]')){
  const action=button.dataset.control;
  button.addEventListener('pointerdown',e=>{
    if(mode!=='playing')return;
    e.preventDefault();
    try{button.setPointerCapture(e.pointerId);}catch(_){}
    button.classList.add('is-held');
    if(action==='jump')jump(); else held[action]=true;
    startAudio();
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture']){
    button.addEventListener(event,()=>{
      button.classList.remove('is-held');
      if(action!=='jump')held[action]=false;
    });
  }
  // Disable context menu on long touches.
  button.addEventListener('contextmenu',e=>e.preventDefault());
}
$('inspectButton').addEventListener('click',examine);
$('continueMemoryButton').addEventListener('click',closeMemory);
$('startButton').addEventListener('click',play);
$('lockedButton').addEventListener('click',lockedMessage);
$('backButton').addEventListener('click',menu);
$('pauseButton').addEventListener('click',pauseToggle);
$('resumeButton').addEventListener('click',pauseToggle);
$('restartPauseButton').addEventListener('click',play);
$('menuPauseButton').addEventListener('click',menu);
$('musicButton').addEventListener('click',soundToggle);
$('retryButton').addEventListener('click',play);
$('gameOverMenuButton').addEventListener('click',menu);
$('playAgainButton').addEventListener('click',play);
$('endMenuButton').addEventListener('click',menu);

// Prevent selection/dragging while rapidly pressing controls.
canvas.addEventListener('contextmenu',e=>e.preventDefault());
layoutCanvas();refreshMenu();requestAnimationFrame(frame);
