import * as THREE from  'three';
import * as DSS from './deathStarSurface.js';
export function createCamera(){
    let camera = new THREE.PerspectiveCamera(82, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, destination){
    
    if (worldAimPos.x<(-0.5)*DSS.TRENCH_GROUND_X+20) {worldAimPos.x = (-0.2)*DSS.TRENCH_GROUND_X}
    else if (worldAimPos.x>(0.5)*DSS.TRENCH_GROUND_X-20) {worldAimPos.x = (0.2)*DSS.TRENCH_GROUND_X}
    else {worldAimPos.x=0}
    if (worldAimPos.y<(0.5)*DSS.TRENCH_WALL_Y) {worldAimPos.y = (0.5)*DSS.TRENCH_WALL_Y}
    else if (worldAimPos.y>DSS.TRENCH_WALL_Y) {worldAimPos.y = (1.1)*DSS.TRENCH_WALL_Y}
    else {worldAimPos.y=(0.7)*DSS.TRENCH_WALL_Y}
    destination = new THREE.Vector3(worldAimPos.x, worldAimPos.y, -60);
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.01,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
} 