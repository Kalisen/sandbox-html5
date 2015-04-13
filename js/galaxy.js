var INDEX_SCENE = (function () {

    var cubeGroup = new THREE.Object3D();
    var light;
    var video;
    var videoImageContext;
    var videoTexture;
    var coin;

    function fill(scene) {

        // LIGHTS
        light = new THREE.PointLight(0xFFFFFF, 0.5);
        scene.add(light);

        var wireframeMaterial = new THREE.MeshBasicMaterial();
        wireframeMaterial.color.setRGB(31 / 255, 86 / 255, 169 / 255);
        wireframeMaterial.wireframe = true;
        wireframeMaterial.wireframeLinewidth = 1;

//    drawHelpers();
//    drawAxes(scene);
//        drawSphereRoom(scene, wireframeMaterial);
        drawGalaxy(scene, wireframeMaterial);
        drawGlowingSphere(scene);
//    drawVideoCoin(scene);
//    drawVideoScreen(scene);

//    drawGround(scene);
//    drawText(scene);
//    drawSkybox(scene);
    }

    function drawSkybox(scene) {
//    var texture = new THREE.ImageUtils.loadTexture('img/red_shroom_128.png');
//    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//    texture.repeat.set( 50, 50 );
        var texture = new THREE.ImageUtils.loadTexture('img/red_shroom_128.png');
        var skyMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
            //wireframe: true
        });
        var skyGeom = new THREE.CubeGeometry(10000, 10000, 10000, 100, 100, 100);
        var sky = new THREE.Mesh(skyGeom, skyMaterial);
        scene.add(sky);
    }

    function drawText(scene) {
        // add 3D text
        var materialFront = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        var materialSide = new THREE.MeshBasicMaterial({ color: 0x000088 });
        var materialArray = [ materialFront, materialSide ];
        // must load fonts <script src="fonts/helvetiker_bold.typeface.js"></script>
        var textGeom = new THREE.TextGeometry("Death to Bed bugs!",
            {
                size: 30, height: 4, curveSegments: 3,
                font: "helvetiker", weight: "bold", style: "normal",
                bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
                material: 0, extrudeMaterial: 1
            });

        var textMaterial = new THREE.MeshFaceMaterial(materialArray);
        var textMesh = new THREE.Mesh(textGeom, textMaterial);

        // Center text
        textGeom.computeBoundingBox();
        var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
        textMesh.position.set(-0.5 * textWidth, 50, 100);

        scene.add(textMesh);
    }

    function drawVideoCoin(scene) {
        setupVideo();
        var sideMaterial = new THREE.MeshPhongMaterial({
            color: 0x99CCFF,
            side: THREE.DoubleSide,
            shininess: 1
        });
        var movieMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, overdraw: true});
        var movieBackMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, overdraw: true, side: THREE.BackSide});

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

    function drawVideoScreen(scene) {
        setupVideo();
        var movieMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, overdraw: true, side: THREE.DoubleSide });
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

        videoTexture = new THREE.Texture(videoImage);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
    }

    function drawGlowingSphere(scene) {

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
            opacity: 0.8
        });

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

    function drawSphereRoom(scene, material) {

        var sphereGeom = new THREE.SphereGeometry(50, 32, 16);
        drawObject(scene, sphereGeom, material, 200, 100, 0);
        drawObject(scene, sphereGeom, material, 0, 100, 200);
        drawObject(scene, sphereGeom, material, 0, 100, -200);

        var discGeom = new THREE.CircleGeometry(70, 32);
        drawObject(scene, discGeom, material, 200, 0, 0, Math.PI / 2);
        drawObject(scene, discGeom, material, 0, 0, 200, Math.PI / 2);
        drawObject(scene, discGeom, material, 0, 0, -200, Math.PI / 2);

        drawObject(scene, new THREE.CircleGeometry(30, 32), material, 0, 0, 0, Math.PI / 2);

        var laneGeom = new THREE.CubeGeometry(10, 0.01, 130);
        drawObject(scene, laneGeom, material, 0, 0, 65);
        drawObject(scene, laneGeom, material, 0, 0, -65);
        drawObject(scene, laneGeom, material, 65, 0, 0, 0, Math.PI / 2);

        setupVideo();
        var movieMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, overdraw: true, side: THREE.DoubleSide});
        var screenGeom = new THREE.PlaneGeometry(200, 112, 4, 4);
        drawObject(scene, screenGeom, movieMaterial, 0, 100, -149);
        drawObject(scene, screenGeom, movieMaterial, 0, 100, 149, 0, Math.PI);
        drawObject(scene, screenGeom, movieMaterial, 149, 100, 0, 0, -Math.PI / 2);
    }

    function drawObject(scene, geom, material, x, y, z, rotationX, rotationY, rotationZ) {
        var disc = new THREE.Mesh(geom, material);
        disc.position.x = x || 0;
        disc.position.y = y || 0;
        disc.position.z = z || 0;
        disc.rotation.x = rotationX || 0;
        disc.rotation.y = rotationY || 0;
        disc.rotation.z = rotationZ || 0;

        scene.add(disc);
    }

    function drawGalaxy(scene, material) {

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

    function drawGround(scene) {
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

    function drawAxes(scene) {
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

    function update(camera) {
        //renderVideo();

        light.position.copy(camera.position);
        cubeGroup.rotation.z = cubeGroup.rotation.z - Math.PI / 360;
//    coin.rotation.z = coin.rotation.z - Math.PI / 180;
    }

    function renderVideo() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            videoImageContext.drawImage(video, 0, 0);
            if (videoTexture)
                videoTexture.needsUpdate = true;
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

    return {
        fill: fill,
        update: update
    }
})();

