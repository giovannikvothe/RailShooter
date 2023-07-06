import * as THREE from 'three';
import {
  initRenderer,
  initDefaultBasicLight,
  onWindowResize
} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { makeMap } from './map.js';
import { makeSun } from './sun.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import * as DSS from './deathStarSurface.js';

let scene, renderer, camera, light, lerpCameraConfig,
  aimPosMin, aimPosMax, camDestination, dist, quaternionZ, quaternionXY;
let aircraft;
let worldAimPos = new THREE.Vector3; // Initial variables
let worldAim2Pos = new THREE.Vector3;
let fireListener = true;      // Evitar que o click para sair do pause chame firebullet()
let directionAnim = new THREE.Vector3();
let posMundoAircraft = new THREE.Vector3(0, 0, 0);
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
let keyboard = new KeyboardState(); //Variável para o teclado
let aircraftHealth = 5;
let rngTimer = 0;

//Camera parameters
camera = createCamera();
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
cameraHolder.position.set(0, (1.1)*DSS.TRENCH_WALL_Y, -60);

aimPosMin = new THREE.Vector3((-0.5)*DSS.TRENCH_GROUND_X+12, 10, -1024);
aimPosMax = new THREE.Vector3((0.5)*DSS.TRENCH_GROUND_X-12, DSS.TRENCH_WALL_Y*1.50, 1024);

// Create a basic light to illuminate the scene
let ambientColor = "rgb(150,150,150)";
let ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);

//Raycaster
let raycaster = new THREE.Raycaster();
let raycasterPlane, raycasterPlaneGeometry, raycasterPlaneMaterial, objects;
objects = [];
raycasterPlaneGeometry = new THREE.PlaneGeometry(9200, 9800, 20, 20);
raycasterPlaneMaterial = new THREE.MeshLambertMaterial({ color: "rgb(255,0,0)" });
raycasterPlaneMaterial.side = THREE.DoubleSide;
raycasterPlaneMaterial.transparent = true;
raycasterPlaneMaterial.opacity = 0.5;
raycasterPlane = new THREE.Mesh(raycasterPlaneGeometry, raycasterPlaneMaterial);
raycasterPlane.visible = false;
raycasterPlane.position.set(0, 0, 0);
cameraHolder.add(raycasterPlane);
raycasterPlane.translateZ((-cameraHolder.position.z) + 500)
objects.push(raycasterPlane);
window.addEventListener('mousemove', onMouseMove);
function onMouseMove(event) {
  let point;
  let pointer = new THREE.Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  let intersects = raycaster.intersectObjects(objects);
  point = intersects[0].point;
  point.clamp(aimPosMin, aimPosMax);
  scene.attach(aim2);
  aim2.position.set(point.x, point.y, 500);
  cameraHolder.attach(aim2);

}

//Carrega o avião e o adiciona à cena
loadGLBFile('./customObjects/', 'xwing', true, 3);

function loadGLBFile(modelPath, modelName, visibility, desiredScale) {
  var loader = new GLTFLoader();
  loader.load(modelPath + modelName + '.glb', function (gltf) {
    aircraft = gltf.scene;
    aircraft.name = modelName;
    aircraft.visible = visibility;
    aircraft.traverse(function (child) {
      if (child) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    aircraft.traverse(function (node) {
      if (node.material) node.material.side = THREE.DoubleSide;
    });
    aircraft.scale.set(desiredScale, desiredScale, desiredScale);
    aircraft.position.set(0,(1.5)*DSS.TRENCH_WALL_Y,-20);
    scene.add(aircraft);
  });
}

//Update Position
function updatePosition() {
  lerpConfig.destination.set(worldAim2Pos.x, worldAim2Pos.y, 0);
  if (lerpConfig) { aircraft.position.lerp(lerpConfig.destination, lerpConfig.alpha) }
}

//Lerp Config
const lerpConfig = {
  destination: new THREE.Vector3(0, 55, 0),
  alpha: 0.01,
  move: true
}


//Create aim
let aim = createAim();
let aim2 = createAim();
scene.add(aim)
raycasterPlane.add(aim2);

//Plano mira grande
let nearAimPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 160);

//Update Aim
function updateAim() {
  scene.attach(aim2);
  aim2.position.clamp(aimPosMin, aimPosMax);
  cameraHolder.attach(aim2);
  if (!aircraft) {
    return;
  }
  aim2.getWorldPosition(worldAim2Pos);
  let lineAircraftAim = new THREE.Line3(aircraft.position, worldAim2Pos);
  let intersectPoint = new THREE.Vector3();
  nearAimPlane.intersectLine(lineAircraftAim, intersectPoint);
  aim.position.set(intersectPoint.x, intersectPoint.y, intersectPoint.z);
}

//Update Animation
function updateAnimation(dist, quaternionZ, quaternionXY) {

  dist = aircraft.position.x - worldAim2Pos.x;
  if (dist < -50) { dist = -50 };
  if (dist > 50) { dist = 50 }
  quaternionZ = new THREE.Quaternion();
  quaternionZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI * (dist / 16)) / 4);
  aircraft.quaternion.slerp(quaternionZ, 0.029);

  aircraft.getWorldPosition(posMundoAircraft);  // Pega posição global do aviao
  directionAnim.subVectors(worldAim2Pos, posMundoAircraft).normalize();  // Calcula direção do avião até a mira
  let matrixQuat = new THREE.Matrix4().lookAt(worldAim2Pos, posMundoAircraft, new THREE.Vector3(0, 0, 0));
  quaternionXY = new THREE.Quaternion().setFromRotationMatrix(matrixQuat);
  aircraft.quaternion.slerp(quaternionXY, 0.1);

}

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Cria o mapa e ativa a fila
let map = makeMap();
map.queue.forEach(element => scene.add(element.map));

// Cria o sol
let sun = makeSun();
scene.add(sun)

// Carrega o céu
const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load('./customObjects/sky.png');
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.encoding = THREE.sRGBEncoding;
scene.background = textureEquirec

camera.lookAt(cameraHolder.position.x, cameraHolder.position.y, cameraHolder.position.z + 1); // Inicializa a camera sempre virada para frente

let isPaused = false; //Variável que define estado pausado/não pausado

// Array para armazenar os tiros disparados
var bullets = [];

// Função que realiza os tiros
function fireBullet() {
  aircraft.add(bulletSound);
  if (bulletSound.isPlaying) {
    bulletSound.stop();
    bulletSound.play();
  }
  else {
    bulletSound.play();
  }
  var direction = new THREE.Vector3();
  var bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  var bulletMaterial = new THREE.MeshStandardMaterial({ color: "rgb(255,0,0)", emissive: "rgb(255,0,0)" });
  var bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.scale.set(1, 1, 10);


  //let posMundoAim = new THREE.Vector3(0, 0, 0);
  aim2.getWorldPosition(worldAim2Pos)   // Pega posição global da mira

  aircraft.getWorldPosition(posMundoAircraft);  // Pega posição global do aviao
  direction.subVectors(worldAim2Pos, posMundoAircraft).normalize();  // Calcula direção do avião até a mira
  bullet.velocity = direction;
  bullet.velocity.multiplyScalar(15); // Muda velocidade do disparo

  aircraft.add(bullet); // Faz o disparo sair do avião
  bullet.position.set(0, 0, 0);
  scene.attach(bullet)  // Adiciona o disparo à cena
  bullets.push(bullet); // Adiciona o disparo no array

}

var turretV;

function euclideanDistance(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
}

function bulletMov() {
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].position.add(bullets[i].velocity) // Atualiza o movimento dos disparos
    for (var j = 0; j < map.MAX_TURRET; j++) {
      if (!map.turrets[j].dying && map.turrets[j].visible) {
        turretV = new THREE.Vector3();
        map.turrets[j].mesh.getWorldPosition(turretV) // Armazena a posição global das torretas

        if (bullets.length != 0) {
          // Verifica se a torreta foi atingida
          if (euclideanDistance(bullets[i].position.x, bullets[i].position.y, bullets[i].position.z, turretV.x, turretV.y+30, turretV.z) < map.DISTANCE_TOLERANCE) {
            map.turrets[j].dying = true; // Se atingida, status passa sendo destruída
            scene.remove(bullets[i]);  //Remove o tiro da cena
            bullets.splice(i, 1);  //Remove do array
            i--;
            map.turrets[j].mesh.add(turretDamageSound[j]);
            if (!turretDamageSound[j].isPlaying) {
              turretDamageSound[j].stop();
              turretDamageSound[j].play();
            }
            else {
              turretDamageSound[j].play();
            }
            break;
          }
        }
        else {
          
        }
      }
    }

    if (bullets.length != 0 && i >= 0) {
      if (bullets[i].position.z > map.FADE_END() || bullets[i].position.y < map.MAP_Y / 2 || Math.abs(bullets[i].position.x) > map.MAP_X / 2) {
        scene.remove(bullets[i]);  //Remove o tiro da cena
        bullets.splice(i, 1);  //Remove do array
        i--;
      }
    }
    else {
      continue;
    }
  }
}

function turretRNG() {
  for (let i = 0; i <=2; i++) {
    if (!map.turrets[i].loaded){
      return;
    }
    let rng = Math.floor(Math.random() * 10);
    if (rng <= 6) {
      if (map.turrets[i].visible && !map.turrets[i].dying) {
        turretFire(i);
      }
    }
  }
}
let enemyBullets = [];
function turretFire(index) {
  
  if (!map.turrets[index].visible || map.turrets[index].dying || !aircraft){
    return;
  }
  
  map.turrets[index].mesh.add(enemyBulletSound[index]);
  let directionEnemy = new THREE.Vector3()
  let bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  let bulletMaterial = new THREE.MeshStandardMaterial({ color: "rgb(138,43,226)", emissive: "rgb(138,43,226)" });
  let bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.scale.set(0.3, 0.3, 5)
  let turretPos = new THREE.Vector3();
  aircraft.getWorldPosition(posMundoAircraft);  // Pega posição global do aviao
  map.turrets[index].mesh.getWorldPosition(turretPos);
  turretPos.y += 40;
  directionEnemy.subVectors(posMundoAircraft, turretPos).normalize();
  bullet.velocity = directionEnemy;
  bullet.velocity.multiplyScalar(6 + map.SPEED * 0.2); // Muda velocidade do disparo
  map.turrets[index].mesh.add(bullet); // Faz o disparo sair do avião
  bullet.position.set(0, 40/15, 0);
  scene.attach(bullet)  // Adiciona o disparo à cena
  bullet.lookAt(posMundoAircraft);
  enemyBullets.push(bullet); // Adiciona o disparo no array
  
  if (enemyBulletSound[index].isPlaying) {
    enemyBulletSound[index].stop();
    enemyBulletSound[index].play();
  }
  else {
    enemyBulletSound[index].play(); 
  }
}

function enemyBulletMov() {
  for (var i = 0; i < enemyBullets.length; i++) {
    enemyBullets[i].position.add(enemyBullets[i].velocity) // Atualiza o movimento dos disparos

    if (Math.abs(enemyBullets[i].position.x - aircraft.position.x) < 15 && Math.abs(enemyBullets[i].position.y - aircraft.position.y) < 10 && Math.abs(enemyBullets[i].position.z - aircraft.position.z) < 20) {
      aircraftDamage();
      scene.remove(enemyBullets[i]);  //Remove o tiro da cena
      enemyBullets.splice(i, 1);  //Remove do array
      i--;
      continue;
    }
    if (enemyBullets[i].position.z > map.FADE_END() || enemyBullets[i].position.y < map.MAP_Y / 2 || Math.abs(enemyBullets[i].position.x) > map.MAP_X / 2) {
      scene.remove(enemyBullets[i]);  //Remove o tiro da cena
      enemyBullets.splice(i, 1);  //Remove do array
      i--;
    }
  }
}
//Listener do Tiro (Botão esquerdo do mouse)
document.addEventListener("click", fireBullet);

function keyboardUpdate() {

  keyboard.update();

  //Velocidades
  if (keyboard.down(1)) { map.SPEED = 1 }
  if (keyboard.down(2)) { map.SPEED = 3 }
  if (keyboard.down(3)) { map.SPEED = 5 }
  //Music
  if (keyboard.down('S')) {
    if (!music.isPlaying) {
      music.play();
    }
    else {
      music.pause();
    }
  }

  //Pause
  if (keyboard.down('esc')) { isPaused = !isPaused; document.body.style.cursor = 'auto'; }
}

//Mouse invisibility
document.body.style.cursor = 'none';

function aircraftDamage() {
  aircraft.add(aircraftDamageSound);
  if (aircraftDamageSound.isPlaying) {
    aircraftDamageSound.stop();
    aircraftDamageSound.play();
  }
  else {
    aircraftDamageSound.play();
  }
  aircraftHealth -= 1;
  changeObjectColor();
}
//Audio
const listener = new THREE.AudioListener();
camera.add(listener);
let audioLoader = new THREE.AudioLoader();
const music = new THREE.Audio(listener);
const bulletSound = new THREE.PositionalAudio(listener);
let enemyBulletSound = [];
let aircraftDamageSound = new THREE.PositionalAudio(listener);
let turretDamageSound = [];
audioLoader.load('./customObjects/mixkit-short-laser-gun-shot-1670.wav', function (buffer) {
  bulletSound.setBuffer(buffer);
  bulletSound.setLoop = false;
  bulletSound.setVolume(1);
  bulletSound.setRefDistance(1000.0)
});
audioLoader.load('./customObjects/raptor-151529.mp3', function (buffer) {
  music.setBuffer(buffer);
  music.setLoop(true);
  music.setVolume(0.32);
  music.hasPlaybackControl = true
});
for (let i = 0; i <= 2; i++) {
  enemyBulletSound[i] = new THREE.PositionalAudio(listener);
  audioLoader.load('./customObjects/mixkit-laser-weapon-shot-1681.wav', function (buffer) {
    enemyBulletSound[i].setBuffer(buffer);
    enemyBulletSound[i].setLoop(false);
    enemyBulletSound[i].setVolume(1.0);
    enemyBulletSound[i].setRefDistance(350.0);
  })
  turretDamageSound[i] = new THREE.PositionalAudio(listener);
  audioLoader.load('./customObjects/587196__derplayer__explosion_06.ogg', function (buffer) {
    turretDamageSound[i].setBuffer(buffer);
    turretDamageSound[i].setLoop = false;
    turretDamageSound[i].setVolume(0.9);
    turretDamageSound[i].setRefDistance(350.0);
  })
  
}
audioLoader.load('./customObjects/682438__feliusers__impacts-crash-metal.mp3', function (buffer) {
  aircraftDamageSound.setBuffer(buffer);
  aircraftDamageSound.setLoop = false;
  aircraftDamageSound.setVolume(1.0);
  aircraftDamageSound.setRefDistance(1000.0);
});

function changeObjectColor() {
  if (aircraft) {
    aircraft.traverse(function (child) {
      if (child.material)
        child.material.color.set(`rgb(${255},${aircraftHealth * 51}, ${aircraftHealth * 51})`);
    });
  }
}


render();
function render() {
  if (isPaused) { // Pause Ativo
    keyboardUpdate();
    requestAnimationFrame(render);
    if (fireListener) {
      aim.visible = false;
      aim2.visible = false;
      renderer.render(scene, camera);
      document.removeEventListener("click", fireBullet);
      document.addEventListener('click', function () { isPaused = false });
      fireListener = false; // Desativa os disparos
    }

  } else {
    if (!fireListener) {
      aim.visible = true;
      aim2.visible = true;
      document.addEventListener("click", fireBullet);
      //Mouse invisibility
      document.body.style.cursor = 'none';
      fireListener = true; // Ativa os disparos
    }

    //Render scene
    requestAnimationFrame(render);
    renderer.render(scene, camera)
    map.updateMapQueue(scene); // Atualiza a fila de mapas
    aim.getWorldPosition(worldAimPos);
    updateAim(); // Atualiza mira
    if (aircraft) {
      updatePosition(); // Atualiza posição do avião
      updateAnimation(dist, quaternionZ, quaternionXY); // Realiza animações de movimento do avião

      if (enemyBullets != null) {
        enemyBulletMov();
      }

      if (bullets != null) {
        bulletMov();
      }
    }

    updateCamera(aim2, worldAim2Pos, lerpCameraConfig, cameraHolder, camDestination); // Atualiza posição da câmera

    keyboardUpdate(); // Atualiza teclado
    rngTimer++;
    if (rngTimer == 180) {
      turretRNG();
      rngTimer = 0;
    }
  }

}