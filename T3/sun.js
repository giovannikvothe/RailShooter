import * as THREE from 'three';


const SUN_RADIUS = 10
const SUN_COLOR = "rgb(255,255,50)";
const SUN_LIGHT_COLOR = "rgb(255,255,255)";
const SUN_POSITION = new THREE.Vector3(-100, 100, -100);
const BACKLIGHT_STRENGHT = 0.3;

// Create and return a sun with a spotlight
export function makeSun() {
    let sunGeometry = new THREE.SphereGeometry(10, 16, 32);
    let sunMaterial = new THREE.MeshBasicMaterial({ color: SUN_COLOR });
    let sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(SUN_POSITION);


    let sunLight = new THREE.DirectionalLight(SUN_LIGHT_COLOR);
    sunLight.position.copy(SUN_POSITION);
    sunLight.castShadow = true;
    sunLight.intensity = 1
    sunLight.shadow.mapSize.width = 4*1024;
    sunLight.shadow.mapSize.height = 4*1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 1000;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    sun.add(sunLight)

    return sun;
}
