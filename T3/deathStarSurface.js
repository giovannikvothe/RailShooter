import * as THREE from 'three';
import { getRndInteger } from './utils.js';

// TRENCH GROUND
export const TRENCH_GROUND_X = 200.0;
export const TRENCH_GROUND_Y = 0.01;
export const TRENCH_GROUND_Z = 100.0;

export const TRENCH_WALL_X = 0.01;
export const TRENCH_WALL_Y = TRENCH_GROUND_X/2;
export const TRENCH_WALL_Z = TRENCH_GROUND_Z;

export const UPSIDE_X = TRENCH_GROUND_X;
export const UPSIDE_Y = 0.01;
export const UPSIDE_Z = TRENCH_GROUND_Z;




export function getDeathStarSurface() {
    let surfaceMaterial = getSurfaceMaterial();
    let reliefMaterial = getReliefMaterial();
    let trenchGround = getTrenchGround(surfaceMaterial, reliefMaterial);
    let trenchWallLeft = getTrenchWall(surfaceMaterial, reliefMaterial);
    let trenchWallRight = getTrenchWall(surfaceMaterial, reliefMaterial);
    let upsideLeft = getUpside(surfaceMaterial, reliefMaterial);
    let upsideRight = getUpside(surfaceMaterial, reliefMaterial);

    trenchGround.add(trenchWallLeft);
    trenchWallLeft.position.set((TRENCH_GROUND_X + TRENCH_WALL_X) * (-0.5),
        (TRENCH_GROUND_Y + TRENCH_WALL_Y) * (0.5),
        0);

    trenchGround.add(trenchWallRight);
    trenchWallRight.position.set((TRENCH_GROUND_X + TRENCH_WALL_X) * (0.5),
        (TRENCH_GROUND_Y + TRENCH_WALL_Y) * (0.5),
        0);

    trenchWallLeft.add(upsideLeft);
    upsideLeft.position.set((TRENCH_WALL_X + UPSIDE_X) * (-0.5),
        (TRENCH_WALL_Y + UPSIDE_Y) * (0.5),
        0);

    trenchWallRight.add(upsideRight);
    upsideRight.position.set((TRENCH_WALL_X + UPSIDE_X) * (0.5),
        (TRENCH_WALL_Y + UPSIDE_Y) * (0.5),
        0);

    return {
        trenchGround: trenchGround,
        trenchWallLeft: trenchWallLeft,
        trenchWallRight: trenchWallRight,
        upsideLeft: upsideLeft,
        upsideRight: upsideRight
    };

}

function getTrenchGround(surfaceMaterial, reliefMaterial) {
    let geometry = new THREE.BoxGeometry(TRENCH_GROUND_X, TRENCH_GROUND_Y, TRENCH_GROUND_Z);
    let mesh = new THREE.Mesh(geometry, surfaceMaterial);
    mesh.receiveShadow = true;
    return mesh;
}

function getTrenchWall(surfaceMaterial, reliefMaterial) {
    let geometry = new THREE.BoxGeometry(TRENCH_WALL_X, TRENCH_WALL_Y, TRENCH_WALL_Z);
    let mesh = new THREE.Mesh(geometry, surfaceMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let cube1 = getCubeRelief(reliefMaterial);
    mesh.add(cube1);
    cube1.position.set(0,(TRENCH_WALL_Y - 10)/2, (TRENCH_WALL_Z)*(-0.25));

    let cube2 = getCubeRelief(reliefMaterial);
    mesh.add(cube2);
    cube2.position.set(0,(TRENCH_WALL_Y - 10)/2, (TRENCH_WALL_Z)*(0.25));

    let cylinder1 = cylinderRelief(reliefMaterial);
    mesh.add(cylinder1);
    cylinder1.position.set(0,0, 0);

    let column = columnRelief(reliefMaterial);
    mesh.add(column);
    column.position.set(0,0, TRENCH_WALL_Z/2);
    
    return mesh;
}

function getUpside(surfaceMaterial, reliefMaterial) {
    let geometry = new THREE.BoxGeometry(UPSIDE_X, UPSIDE_Y, UPSIDE_Z);
    let mesh = new THREE.Mesh(geometry, surfaceMaterial);
    mesh.receiveShadow = true;
    return mesh;
}

export function getSurfaceMaterial() {
    var textureLoader = new THREE.TextureLoader();
    let material = new THREE.MeshPhongMaterial({ color: 'white' , shininess : 1});
    material.transparent = true;
    material.map = textureLoader.load('./customObjects/death-star-surface-textures/basecolor.png');
    material.aoMap = textureLoader.load('./customObjects/death-star-surface-textures/ao.png');
    material.normalMap = textureLoader.load('./customObjects/death-star-surface-textures/normal.png');
    material.displacementMap = textureLoader.load('./customObjects/death-star-surface-textures/height.png');
    material.metalnessMap = textureLoader.load('./customObjects/death-star-surface-textures/metallic.png');
    material.roughnessMap = textureLoader.load('./customObjects/death-star-surface-textures/roughness.png');
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.minFilter = THREE.LinearFilter;
    material.map.magFilter = THREE.NearestFilter;
    material.map.repeat.set(1, 1);

    return material;
}

export function getReliefMaterial() {
    var textureLoader = new THREE.TextureLoader();
    let material = new THREE.MeshPhongMaterial({ color: 'white' , shininess : 1});
    material.transparent = true;
    material.map = textureLoader.load('./customObjects/death-star-relief-textures/basecolor.png');
    material.aoMap = textureLoader.load('./customObjects/death-star-relief-textures/ao.png');
    material.normalMap = textureLoader.load('./customObjects/death-star-relief-textures/normal.png');
    material.metalnessMap = textureLoader.load('./customObjects/death-star-relief-textures/metallic.png');
    material.roughnessMap = textureLoader.load('./customObjects/death-star-relief-textures/roughness.png');
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.minFilter = THREE.LinearFilter;
    material.map.magFilter = THREE.NearestFilter;
    material.map.repeat.set(1, 1);

    return material;
}

export function getCubeRelief(material){
    let geometry = new THREE.BoxGeometry(10, 10, 10);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

export function cylinderRelief(material){
    let geometry = new THREE.CylinderGeometry(10,10,10,16);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotateZ(THREE.MathUtils.degToRad(90));
    return mesh;
}

export function columnRelief(material){
    let geometry = new THREE.CylinderGeometry(5,5,TRENCH_WALL_Y,16);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}