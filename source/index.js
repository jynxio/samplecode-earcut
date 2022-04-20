import "/style/reset.css";

import * as three from "three";
import earcut from "earcut";

/* CSS */
/* ------------------------------------------------------------------------------------------------------ */
document.body.style.backgroundColor = "#000";

/* Base */
/* ------------------------------------------------------------------------------------------------------ */
const renderer = new three.WebGLRenderer( { antialias: window.devicePixelRatio < 2 } );

renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.append( renderer.domElement );

const scene = new three.Scene();
const aspect_ratio = window.innerWidth / window.innerHeight;
const camera = new three.OrthographicCamera( - 180 * aspect_ratio, 180 * aspect_ratio, 180, - 180, 0.1, 10 );

camera.position.set( 0, 0, 1 );
scene.add( camera );

window.addEventListener( "resize", _ => {

    renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
    renderer.setSize( window.innerWidth, window.innerHeight);

    const aspect_ratio = window.innerWidth / window.innerHeight;

    camera.left = - 100 * aspect_ratio;
    camera.right = 100 * aspect_ratio;
    camera.updateProjectionMatrix();

} );

renderer.setAnimationLoop( function loop() {

    renderer.render( scene, camera );

} );

/* Simple Code */
/* ------------------------------------------------------------------------------------------------------ */
const polygon_without_hole = new PolygonWithoutHole();
const polygon_with_a_hole = new PolygonWithAHole();
const polygon_with_four_hole = new PolygonWithFourHole();

polygon_without_hole.translateX( - 120 );
polygon_with_four_hole.translateX( 120 );

scene.add( polygon_without_hole );
scene.add( polygon_with_a_hole );
scene.add( polygon_with_four_hole );

function PolygonWithoutHole() {

    const vertices = [
        - 50, + 50, 0, // 轮廓：左上
        - 50, - 50, 0, // 轮廓：左下
        + 50, - 50, 0, // 轮廓：右下
        + 50, + 50, 0, // 轮廓：右上
    ];
    const triangulation = earcut( vertices, null, 3 );
    const polygon = new Polygon( vertices, triangulation );

    return polygon;

}

function PolygonWithAHole() {

    const vertices = [
        - 50, + 50, 0, // 轮廓：左上
        - 50, - 50, 0, // 轮廓：左下
        + 50, - 50, 0, // 轮廓：右下
        + 50, + 50, 0, // 轮廓：右上

        - 30, + 30, 0, // 孔：左上
        + 30, + 30, 0, // 孔：右上
        + 30, - 30, 0, // 孔：右下
        - 30, - 30, 0, // 孔：左下
    ];
    const triangulation = earcut( vertices, [ 4 ], 3 );
    const polygon = new Polygon( vertices, triangulation );

    return polygon;

}

function PolygonWithFourHole() {

    const vertices = [
        - 50, + 50, 0, // 轮廓：左上
        - 50, - 50, 0, // 轮廓：左下
        + 50, - 50, 0, // 轮廓：右下
        + 50, + 50, 0, // 轮廓：右上

        - 15, + 15, 0, // 孔：左上
        -  5, + 15, 0, // 孔：右上
        -  5, +  5, 0, // 孔：右下
        - 15, +  5, 0, // 孔：左下

        +  5, + 15, 0, // 孔：左上
        + 15, + 15, 0, // 孔：右上
        + 15, +  5, 0, // 孔：右下
        +  5, +  5, 0, // 孔：左下

        +  5, -  5, 0, // 孔：左上
        + 15, -  5, 0, // 孔：右上
        + 15, - 15, 0, // 孔：右下
        +  5, - 15, 0, // 孔：左下

        - 15, -  5, 0, // 孔：左上
        -  5, -  5, 0, // 孔：右上
        -  5, - 15, 0, // 孔：右下
        - 15, - 15, 0, // 孔：左下
    ];
    const triangulation = earcut( vertices, [ 4, 8, 12, 16 ], 3 );
    const polygon = new Polygon( vertices, triangulation );

    return polygon;

}

function Polygon( position, triangulation ) {

    const index_attribute = new three.BufferAttribute( new Uint16Array( triangulation ), 1 );
    const position_attribute = new three.BufferAttribute( new Float32Array( position ), 3 );
    const geometry = new three.BufferGeometry();

    geometry.setIndex( index_attribute );
    geometry.index.needsUpdate = true;
    geometry.setAttribute( "position", position_attribute );
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const material_background = new three.MeshBasicMaterial( { color: 0x333333 } );
    const material_bone = new three.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    const mesh_background = new three.Mesh( geometry, material_background );
    const mesh_bone = new three.Mesh( geometry, material_bone );
    const group = new three.Group();

    group.add( mesh_background, mesh_bone );

    return group;

}
