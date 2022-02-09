import "/style/reset.css";

import * as three from "three";

import earcut from "earcut";

/* ------------------------------------------------------------------------------------------------------ */
/* CSS */
document.body.style.backgroundColor = "#000";

/* ------------------------------------------------------------------------------------------------------ */
/* Renderer */
const renderer = new three.WebGLRenderer( { antialias: window.devicePixelRatio < 2 } );

renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.append( renderer.domElement );

/* Scene */
const scene = new three.Scene();

/* Camera */
const aspect_ratio = window.innerWidth / window.innerHeight;
const camera = new three.OrthographicCamera(
    - 100 * aspect_ratio, // left
    + 100 * aspect_ratio, // right
    + 100,                // top
    - 100,                // bottom
    0.1,                  // near
    100,                  // far
);

camera.position.set( 0, 0, 1 );

scene.add( camera );

/* Resize */
window.addEventListener( "resize", _ => {

    renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
    renderer.setSize( window.innerWidth, window.innerHeight);

    const aspect_ratio = window.innerWidth / window.innerHeight;

    camera.left = - 100 * aspect_ratio;
    camera.right = + 100 * aspect_ratio;
    camera.updateProjectionMatrix();

} );

/* Render */
renderer.setAnimationLoop( function loop() {

    renderer.render( scene, camera );

} );

/* ------------------------------------------------------------------------------------------------------ */
/*  */
const geometry = new three.BufferGeometry();
const material_background = new three.MeshBasicMaterial( { color: 0x333333 } );
const material_bone = new three.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

const mesh_background = new three.Mesh( geometry, material_background );
const mesh_bone = new three.Mesh( geometry, material_bone );

scene.add( mesh_background, mesh_bone );

/*  */
const data = [
    - 50, + 50, 0, // 左上角
    + 50, + 50, 0, // 右上角
    + 50, - 50, 0, // 右下角
    - 50, - 50, 0, // 左下角
    - 40, + 40, 0, // 孔1
    - 40, - 30, 0, // 孔1
    + 30, + 40, 0, // 孔1
    + 40, - 40, 0, // 孔2
    - 30, - 40, 0, // 孔2
    + 40, + 30, 0, // 孔2
];

let position;

position = new Float32Array( data );
position = new three.BufferAttribute( position, 3 );

geometry.setAttribute( "position", position );

/*  */
let index;

index = earcut( data, [ 4, 7 ], 3 ); // 0~3号顶点是图形的轮廓，4~6号顶点是孔1的轮廓，7~9号顶点是孔2的轮廓
index = new Uint16Array( index );
index = new three.BufferAttribute( index, 1 );

geometry.setIndex( index );
geometry.index.needsUpdate = true;

/*  */
geometry.computeBoundingBox();
geometry.computeBoundingSphere();
