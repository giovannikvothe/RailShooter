import * as THREE from  'three';

export function createAim(){
    //Creating a grid of points
    var vertices = [];
    vertices.push( new THREE.Vector3( 10, 10, 0 ) );
    vertices.push( new THREE.Vector3( -10, 10, 0 ) );
    vertices.push( new THREE.Vector3( -10, -8, 0 ) );
    vertices.push( new THREE.Vector3( 10, -8, 0 ) );
    vertices.push( new THREE.Vector3( 10, 10, 0 ) );

    
    //Transforming in a Geometry
    var geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    //Setting material
    var material = new THREE.LineBasicMaterial( { color: "rgb(0,255,0)" } );
    //Drawing the geometry
    var crosshair = new THREE.Line( geometry, material );

    crosshair.position.set(0, 0, 0)

    return crosshair;
}