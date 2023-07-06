import * as THREE from  'three';
import {setDefaultMaterial} from "../libs/util/util.js";

export function createPlane(scene){
    let material, materialDarkYellow, materialFan, materialFanRing, materialMotor, materialCabin;
    material = setDefaultMaterial('gray');
    materialDarkYellow = setDefaultMaterial('rgb(255,200,0)');
    materialMotor = setDefaultMaterial('rgb(200,200,200)');
    materialCabin =  setDefaultMaterial('rgb(180,200,200)');
    materialFan = new THREE.MeshBasicMaterial({color: "gray", transparent: true, opacity: 0.5});
    materialFanRing = new THREE.MeshBasicMaterial({color: "rgb(255,255,0)", transparent: true, opacity: 0.5});

    let bodyGeometry = new THREE.CylinderGeometry(2.5, 1.5, 15, 32);
    let body = new THREE.Mesh(bodyGeometry, material);
    scene.add(body);

    let tailGeometry = new THREE.SphereGeometry(1.5, 32, 16);
    let tail = new THREE.Mesh(tailGeometry, material);
    tail.translateY(-7.5);
    body.add(tail);

    let axisGeometry = new THREE.CylinderGeometry(0.1,0.1, 1, 16);
    let axis = new THREE.Mesh(axisGeometry, material);
    axis.translateY(8);
    body.add(axis);

    let fanGeometry = new THREE.SphereGeometry(2.4 ,32, 16);
    let fan = new THREE.Mesh(fanGeometry, materialFan);
    fan.scale.set(1, 1, 0.05);
    fan.translateY(0.5);
    fan.rotateX(THREE.MathUtils.degToRad(90));
    axis.add(fan);

    let wingGeometry = new THREE.SphereGeometry(1.5, 32, 16);
    let wing = new THREE.Mesh(wingGeometry, materialDarkYellow);
    wing.scale.set(10, 1.3, 0.2);
    wing.rotateY(THREE.MathUtils.degToRad(90));
    wing.translateY(3);
    body.add(wing);

    let wing2Geometry = new THREE.SphereGeometry(1, 32, 16);
    let wing2 = new THREE.Mesh(wing2Geometry, material);
    wing2.scale.set(0.8, 3, 0.1);
    wing2.rotateZ(THREE.MathUtils.degToRad(90));
    wing2.translateY(1.5);
    tail.add(wing2);

    let wing3Geometry = new THREE.SphereGeometry(1, 32, 16);
    let wing3 = new THREE.Mesh(wing3Geometry, material);
    wing3.scale.set(0.8, 5, 0.1);
    wing3.rotateX(THREE.MathUtils.degToRad(90));
    wing3.rotateY(THREE.MathUtils.degToRad(90));
    tail.add(wing3);

    let cabinGeometry = new THREE.SphereGeometry(1.5, 32, 16);
    let cabin = new THREE.Mesh(cabinGeometry, materialCabin);
    cabin.translateY(3);
    cabin.translateX(-1.8);
    cabin.scale.set(1.0, 1.5, 0.8);
    body.add(cabin);

    let ringGeometry = new THREE.TorusGeometry(2, 0.6, 16, 100);
    let ring = new THREE.Mesh(ringGeometry, materialFanRing);
    fan.add(ring);

    let outsideMotorGeometry = new THREE.TorusGeometry(2.4, 0.1, 16, 100);
    let outsideMotor = new THREE.Mesh(outsideMotorGeometry, materialDarkYellow);
    outsideMotor.scale.set(1, 1, 2);
    outsideMotor.rotateX(THREE.MathUtils.degToRad(90));
    outsideMotor.translateZ(-7.6);
    body.add(outsideMotor);

    let insideMotorGeometry = new THREE.CylinderGeometry(1, 1, 1, 32);
    let insideMotor1 = new THREE.Mesh(insideMotorGeometry, materialMotor);
    insideMotor1.translateY(7.1);
    body.add(insideMotor1);

    let insideMotor2= new THREE.Mesh(insideMotorGeometry, materialMotor);
    insideMotor2.scale.set(0.3, 1, 0.3);
    insideMotor2.translateY(7.3);
    body.add(insideMotor2);

    body.rotateX(THREE.MathUtils.degToRad(90));
    body.rotateY(THREE.MathUtils.degToRad(-90));
    body.children.forEach((child) => {
        child.castShadow = true;
    });
    return body;
}