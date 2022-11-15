import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import earcut from "earcut";
const positions = [
    0,0,0,  6,0,0,  6,3,0,  0,3,0, // 轮廓的顶点，建议按逆时针顺序来提供
    1,1,0,  1,2,0,  2,2,0,  2,1,0, // 孔1的顶点，建议按顺时针顺序来提供
    4,1,0,  4,2,0,  5,2,0,  5,1,0, // 孔2的顶点，建议按顺时针顺序来提供
];
const holes = [ 4, 8 ]; // 代表4~7号顶点为孔1，8~11号顶点为孔2

const r = earcut( positions, holes, 3 );
console.log( r );
/* ------------------------------------------------------------------------------------------------------ */
/* Camera */
const size = {};

size.right = 150;
size.left = - size.right;
size.top = size.right * globalThis.innerHeight / globalThis.innerWidth;
size.bottom = - size.top;

const camera = new three.OrthographicCamera( size.left, size.right, size.top, size.bottom, 0.1, 2 );

camera.position.set( 0, 0, 1 );

/* Scene */
const scene = new three.Scene();

scene.add( camera );

/* Renderer */
const canvas = document.querySelector( "canvas" );
const renderer = new three.WebGLRenderer( { canvas, antialias: globalThis.devicePixelRatio < 2 } );

renderer.setPixelRatio( Math.min( globalThis.devicePixelRatio, 2 ) );
renderer.setSize( globalThis.innerWidth, globalThis.innerHeight );

/* Resize */
globalThis.addEventListener( "resize", _ => {

    /*  */
    renderer.setPixelRatio( Math.min( globalThis.devicePixelRatio, 2 ) );
    renderer.setSize( globalThis.innerWidth, globalThis.innerHeight);

    /*  */
    size.top = size.right * globalThis.innerHeight / globalThis.innerWidth;
    size.bottom = - size.top;

    camera.top = size.top;
    camera.bottom = size.bottom;
    camera.updateProjectionMatrix();

} );

/* Render */
renderer.setAnimationLoop( function loop() {

    renderer.render( scene, camera );

} );

/* ------------------------------------------------------------------------------------------------------ */
const polygon_with_zero_hole = createPolygonWithZeroHole();
const polygon_with_four_hole = createPolygonWithFourHole();

polygon_with_zero_hole.translateX( - 60 );
polygon_with_four_hole.translateX( 60 );

scene.add( polygon_with_zero_hole );
scene.add( polygon_with_four_hole );

/**
 * 创建一个没有孔的多边形。
 * @returns { Object } - Group实例。
 */
function createPolygonWithZeroHole () {

    const positions = [
        - 50,   50,   0, // 轮廓：左上（建议按逆时针顺序提供）
        - 50, - 50,   0, // 轮廓：左下
          50, - 50,   0, // 轮廓：右下
          50,   50,   0, // 轮廓：右上
    ];

    const indexes = earcut( positions, undefined, 3 );
    const polygon = createPolygon( positions, indexes );

    return polygon;

}

/**
 * 创建一个有4个孔的多边形。
 * @returns { Object } - Group实例。
 */
function createPolygonWithFourHole () {

    // =========================================================================================================
    // 问题：为什么要按逆时针顺序来提供轮廓的顶点坐标，以及按顺时针的顺序来提供孔的顶点坐标呢？
    // 回答：建议这样做，但不强制要求这样做。之所以建议这样做，是因为这样做符合GeoJSON规范对多边形的定义。之所以不强制要求这样做，
    //      是因为无论你是否遵循GeoJSON规范，earcut都能正确的进行三角剖分。
    // =========================================================================================================

    const positions = [
        - 50,   50,   0, // 轮廓：左上（建议按逆时针顺序提供）
        - 50, - 50,   0, // 轮廓：左下
          50, - 50,   0, // 轮廓：右下
          50,   50,   0, // 轮廓：右上

        - 15,   15,   0, // 孔：左上（建议按顺时针顺序提供）
        -  5,   15,   0, // 孔：右上
        -  5,    5,   0, // 孔：右下
        - 15,    5,   0, // 孔：左下

           5,   15,   0, // 孔：左上（建议按顺时针顺序提供）
          15,   15,   0, // 孔：右上
          15,    5,   0, // 孔：右下
           5,    5,   0, // 孔：左下

           5, -  5,   0, // 孔：左上（建议按顺时针顺序提供）
          15, -  5,   0, // 孔：右上
          15, - 15,   0, // 孔：右下
           5, - 15,   0, // 孔：左下

        - 15, -  5,   0, // 孔：左上（建议按顺时针顺序提供）
        -  5, -  5,   0, // 孔：右上
        -  5, - 15,   0, // 孔：右下
        - 15, - 15,   0, // 孔：左下
    ];

    const indexes = earcut( positions, [ 4, 8, 12, 16 ], 3 );
    const polygon = createPolygon( positions, indexes );

    return polygon;

}

/**
 * 创建一个多边形。
 * @param { number[] } positions - 顶点坐标数组。
 * @param { number[] } indexes - 顶点连接顺序数组。
 * @returns { Object } - Group实例。
 */
function createPolygon ( positions, indexes ) {

    // =========================================================================================================
    // 问题：是否需要执行`BufferAttribute.needsUpdate = true`呢？
    // 回答：不需要，因为BufferGeometry的setAttribute和setIndex的实现逻辑都是：接收一个BufferAttribute实例来作为入参，
    //      然后使用这个新BufferAttribute实例来替换掉BufferGeometry实例中的旧BufferAttribute。
    //      如果我们修改了旧的BufferAttribute实例并期望其生效，那么我们就需要为旧的BufferAttribute实例执行上述命令。如果
    //      我们直接使用了新的BufferAttribute实例来替换掉旧的BufferAttribute，那么就自然不需要执行上述命令了。
    // =========================================================================================================

    const index_attribute = new three.BufferAttribute( new Uint8Array( indexes ), 1 );
    const position_attribute = new three.BufferAttribute( new Int8Array( positions ), 3 );

    const geometry = new three.BufferGeometry();

    geometry.setIndex( index_attribute );                    //
    geometry.setAttribute( "position", position_attribute ); //
    geometry.computeBoundingBox();                           // 更新包围盒属性，避免被「视锥体剔除」误杀
    geometry.computeBoundingSphere();                        // 更新包围盒属性，避免被「视锥体剔除」误杀

    const material_wireframe = new three.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
    const material_background = new three.MeshBasicMaterial( { color: 0x333333, wireframe: false } );

    material_wireframe.depthTest = false;
    material_wireframe.depthWrite = false;

    const mesh_wireframe = new three.Mesh( geometry, material_wireframe );
    const mesh_background = new three.Mesh( geometry, material_background );

    mesh_wireframe.renderOrder = 1;

    const group = new three.Group().add( mesh_wireframe, mesh_background );

    return group;

}
