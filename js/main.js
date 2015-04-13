/*global THREE, Coordinates, document, window, $*/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var cubeGroup = new THREE.Object3D();
var light;
var video;
var videoImageContext;
var cameraTexture;
var coin;

function init() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColorHex(0xAAAAAA, 1.0);

    // CAMERA
    var viewSize = 900;
    // aspect ratio of width of window divided by height of window
    var aspectRatio = canvasWidth / canvasHeight;
    // OrthographicCamera( left, right, top, bottom, near, far )
//    camera = new THREE.OrthographicCamera(
//            -aspectRatio*viewSize / 2, aspectRatio*viewSize / 2,
//            viewSize / 2, -viewSize / 2,
//        0, 10000 );
//    camera.position.set( -890, 600, -480 );

    camera = new THREE.PerspectiveCamera(45, aspectRatio, 10, -viewSize / 2, 0, 10000);
    camera.position.set(-890, 600, -480);

    // CONTROLS
    cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);

    // Student: set the target for the camera.
    // The last known position of the drinking bird is x: -2800, y: 360, z: -1600
    cameraControls.target = new THREE.Vector3(0, 0, 0);

}

function fillScene() {
    scene = new THREE.Scene();

    // LIGHTS
    light = new THREE.PointLight(0xFFFFFF, 0.5);
    scene.add(light);

    var wireframeMaterial = new THREE.MeshBasicMaterial();
    wireframeMaterial.color.setRGB(31 / 255, 86 / 255, 169 / 255);
    wireframeMaterial.wireframe = true;
    wireframeMaterial.wireframeLinewidth = 1;

//    drawHelpers();
//    drawAxes();
    drawSphereRoom(wireframeMaterial);
    //drawGalaxy(wireframeMaterial);
    //drawGlowingSphere();
//    drawVideoCoin();
//    drawVideoScreen();

//    drawGround();
//    drawText();
//    drawSkybox();

    scene.add(camera);
}

function drawSkybox() {
//    var texture = new THREE.ImageUtils.loadTexture('img/red_shroom_128.png');
//    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//    texture.repeat.set( 50, 50 );
    var texture = new THREE.ImageUtils.loadTexture('img/Underwater.png');
    var skyMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
        //wireframe: true
    } );
    var skyGeom = new THREE.CubeGeometry(10000, 10000, 10000, 100, 100, 100);
    var sky = new THREE.Mesh(skyGeom, skyMaterial);
    scene.add(sky);
}

function drawText() {
    // add 3D text
    var materialFront = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    var materialSide = new THREE.MeshBasicMaterial( { color: 0x000088 } );
    var materialArray = [ materialFront, materialSide ];
    // must load fonts <script src="fonts/helvetiker_bold.typeface.js"></script>
    var textGeom = new THREE.TextGeometry( "Death to Bed bugs!",
        {
            size: 30, height: 4, curveSegments: 3,
            font: "helvetiker", weight: "bold", style: "normal",
            bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
            material: 0, extrudeMaterial: 1
        });

    var textMaterial = new THREE.MeshFaceMaterial(materialArray);
    var textMesh = new THREE.Mesh(textGeom, textMaterial );

    // Center text
    textGeom.computeBoundingBox();
    var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
    textMesh.position.set( -0.5 * textWidth, 50, 100 );

    scene.add(textMesh);
}

function drawVideoCoin() {
    setupVideo();
    var sideMaterial = new THREE.MeshPhongMaterial({
        color: 0x99CCFF,
        side: THREE.DoubleSide,
        shininess: 1
    });
    var movieMaterial = new THREE.MeshBasicMaterial({ map: cameraTexture, overdraw: true});
    var movieBackMaterial = new THREE.MeshBasicMaterial({ map: cameraTexture, overdraw: true, side: THREE.BackSide});

    var openEnded = true;
    var cylGeo = new THREE.CylinderGeometry(100, 100, 5, 64, 16, openEnded);
    var discGeo = new THREE.CircleGeometry(100, 64);
    var coinHead = new THREE.Mesh(discGeo, movieMaterial);
    coinHead.rotation.x = Math.PI / 2;
    coinHead.position.y = -2.5;
    var coinTail = new THREE.Mesh(discGeo, movieBackMaterial);
    coinTail.rotation.x = Math.PI / 2;
    coinTail.position.y = 2.5;
    var coinSide = new THREE.Mesh(cylGeo, sideMaterial);

    coin = new THREE.Object3D();
    coin.add(coinHead);
    coin.add(coinTail);
    coin.add(coinSide);

    scene.add(coin);
}

function drawVideoScreen() {
    setupVideo();
    var movieMaterial = new THREE.MeshBasicMaterial({ map: cameraTexture, overdraw: true, side: THREE.DoubleSide });
    // the geometry on which the movie will be displayed;
    // 		movie image will be scaled to fit these dimensions.
    var movieGeometry = new THREE.PlaneGeometry(240, 100, 4, 4);
    var movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);
    movieScreen.position.set(0, 50, 0);
    scene.add(movieScreen);
}

function setupVideo() {
    video = document.createElement('video');
    video.id = 'video';
    video.type = ' video/ogg; codecs="theora, vorbis" ';
    video.src = "videos/sintel.ogv";
//    video.src = "//www.youtube.com/embed/vF-eVnqq-bw";
    video.load(); // must call after setting/changing source
    video.play();

    videoImage = document.createElement('canvas');
    videoImage.width = 480;
    videoImage.height = 204;

    videoImageContext = videoImage.getContext('2d');
    // background color if no video present
    videoImageContext.fillStyle = '#000000';
    videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

    cameraTexture = new THREE.Texture(videoImage);
    cameraTexture.minFilter = THREE.LinearFilter;
    cameraTexture.magFilter = THREE.LinearFilter;
}

function drawGlowingSphere() {

    var glowPhongMaterial = new THREE.MeshPhongMaterial({
        color: 0x6699FF,
        ambient: 0x6699FF,
        emissive: 0x6699FF,
//        specular: 0xAAAAAA,
        shininess: 1,
        opacity: 1});

    var glowLambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xFCD440,
        ambient: 0xFCD440,
        emissive: 0xFCD440,
        //wireframe: true,
        opacity: 0.8});

//    var innerSphere = new THREE.Mesh(new THREE.SphereGeometry( 20, 32, 16 ), glowPhongMaterial );
//
//    scene.add( innerSphere );
//
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), glowLambertMaterial);

    scene.add(sphere);

    // Types of Blending
//    THREE.NoBlending = 0;
//    THREE.NormalBlending = 1;
//    THREE.AdditiveBlending = 2;
//    THREE.SubtractiveBlending = 3;
//    THREE.MultiplyBlending = 4;
//    THREE.CustomBlending = 5;

    // SUPER SIMPLE GLOW EFFECT
    // use sprite because it appears the same from all angles
    var spriteMaterial = new THREE.SpriteMaterial(
        {
            map: new THREE.ImageUtils.loadTexture('img/glow2.png'),
            useScreenCoordinates: false,
            alignment: THREE.SpriteAlignment.center,
            color: 0xFCD440,
            transparent: false,
            blending: THREE.AdditiveBlending
        });

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(300, 300, 1.0);
    sphere.add(sprite); // this centers the glow at the mesh
//    scene.add(sprite);
}

function drawSphereRoom(material) {

    var sphereGeom = new THREE.SphereGeometry(50, 32, 16);
    drawObject(sphereGeom, material, 200, 100, 0);
    drawObject(sphereGeom, material, 0, 100, 200);
    drawObject(sphereGeom, material, 0, 100, -200);

    var discGeom = new THREE.CircleGeometry(70, 32);
    drawObject(discGeom, material, 200, 0, 0, Math.PI / 2);
    drawObject(discGeom, material, 0, 0, 200, Math.PI / 2);
    drawObject(discGeom, material, 0, 0, -200, Math.PI / 2);

    drawObject(new THREE.CircleGeometry(30, 32), material, 0, 0, 0, Math.PI / 2);

    var laneGeom = new THREE.CubeGeometry(10, 0.01, 130);
    drawObject(laneGeom, material, 0, 0, 65);
    drawObject(laneGeom, material, 0, 0, -65);
    drawObject(laneGeom, material, 65, 0, 0, 0, Math.PI / 2);

    setupVideo();
    var movieMaterial = new THREE.MeshBasicMaterial({ map: cameraTexture, overdraw: true, side: THREE.DoubleSide});
    var screenGeom = new THREE.PlaneGeometry(200, 112, 4, 4);
    drawObject(screenGeom, movieMaterial, 0, 100, -149);
    drawObject(screenGeom, movieMaterial, 0, 100, 149, 0, Math.PI);
    drawObject(screenGeom, movieMaterial, 149, 100, 0, 0, - Math.PI / 2);
}

function drawObject(geom, material, x, y, z, rotationX, rotationY, rotationZ) {
    var disc = new THREE.Mesh(geom, material);
    disc.position.x = x || 0;
    disc.position.y = y || 0;
    disc.position.z = z || 0;
    disc.rotation.x = rotationX || 0;
    disc.rotation.y = rotationY || 0;
    disc.rotation.z = rotationZ || 0;

    scene.add(disc);
}

function drawGalaxy(material) {

    var glowMaterial = new THREE.MeshPhongMaterial({
        color: 0xFCD440,
        ambient: 0xFCD440,
        emissive: 0xFCD440,
        specular: 0xAAAAAA,
        shininess: 0.1,
        opacity: 1});
    var centerGlow = new THREE.Mesh(new THREE.SphereGeometry(20, 64, 32), glowMaterial);
    centerGlow.position.set(0, 0, 0);
    scene.add(centerGlow);

    var cubeGeometry = new THREE.CubeGeometry(10, 10, 10);
    for (i = 1; i < 1000; i++) {
        var cube = new THREE.Mesh(cubeGeometry, material);
        cube.position.x = 0 + Math.cos(i) * i;
        cube.position.y = Math.sin(i) * i;
        cube.position.z = 0;
        cubeGroup.add(cube);
    }

    cubeGroup.rotation.x = Math.PI / 2;
    scene.add(cubeGroup);
}

function drawHelpers() {
    Coordinates.drawGround({size: 10000});
    Coordinates.drawGrid({size: 10000, scale: 0.01});
}

function drawGround() {
    var groundMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        ambient: 0xFFFFFF,
        emissive: 0xFFFFFF,
        opacity: 0.5
    });

    var groundGeo = new THREE.PlaneGeometry(1000, 1000);
    var ground = new THREE.Mesh(groundGeo, groundMaterial, 1000, 1000);
    ground.rotation.x = -Math.PI / 2;
    ground.position.x = 0;
    ground.position.y = -1000;
    ground.position.z = 0;

    scene.add(ground);
}

function drawAxes() {
    var lineMaterial = new THREE.LineBasicMaterial();
    lineMaterial.color.setRGB(31 / 255, 86 / 255, 169 / 255);
    lineMaterial.lineWidth = 1;

    var redLineMaterial = lineMaterial.clone();
    redLineMaterial.color.setRGB(255, 0, 0);

    var greenLineMaterial = lineMaterial.clone();
    greenLineMaterial.color.setRGB(0, 255, 0);

    var xAxisGeo = new THREE.Geometry();
    xAxisGeo.vertices.push(new THREE.Vector3(0, 0, 0));
    xAxisGeo.vertices.push(new THREE.Vector3(100, 0, 0));
    var xAxis = new THREE.Line(xAxisGeo, greenLineMaterial);

    scene.add(xAxis);

    var yAxisGeo = new THREE.Geometry();
    yAxisGeo.vertices.push(new THREE.Vector3(0, 0, 0));
    yAxisGeo.vertices.push(new THREE.Vector3(0, 100, 0));
    var yAxis = new THREE.Line(yAxisGeo, redLineMaterial);

    scene.add(yAxis);

    var zAxisGeo = new THREE.Geometry();
    zAxisGeo.vertices.push(new THREE.Vector3(0, 0, 0));
    zAxisGeo.vertices.push(new THREE.Vector3(0, 0, 100));
    var zAxis = new THREE.Line(zAxisGeo, lineMaterial);

    scene.add(zAxis);
}

function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild(renderer.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {

    renderVideo();

    var delta = clock.getDelta();
    cameraControls.update(delta);

    light.position.copy(camera.position);
    cubeGroup.rotation.z = cubeGroup.rotation.z - Math.PI / 360;
//    coin.rotation.z = coin.rotation.z - Math.PI / 180;

    renderer.render(scene, camera);
}

function renderVideo() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        videoImageContext.drawImage(video, 0, 0);
        if (cameraTexture)
            cameraTexture.needsUpdate = true;
    }
}

function isPowerOfTwo(x) {
    return (x & (x - 1)) == 0;
}

function nextHighestPowerOfTwo(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
}

try {
    init();
    fillScene();
    addToDOM();
    animate();
} catch (e) {
    alert(e + "\n" + e.stack);
    var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
    $('#container').append(errorReport + e);
}
