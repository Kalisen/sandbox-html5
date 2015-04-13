var LEAP_DEMO3 = (function () {

    var sphereGroup = new THREE.Object3D();
    var light;
    var sphereMaterial;
    var glowMaterial;

    function fill(scene) {

        // LIGHTS
        light = new THREE.PointLight(0xFFFFFF, 0.5);
        scene.add(light);

        sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xFCD440,
            ambient: 0xFCD440,
            emissive: 0xFCD440,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.9
        });

        glowMaterial = new THREE.SpriteMaterial(
            {
                map: new THREE.ImageUtils.loadTexture('img/glow2.png'),
                useScreenCoordinates: false,
                color: 0xFCD440,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

        scene.add(sphereGroup);

        initControls(scene);
    }

    function initControls(scene) {
        var controller = new Leap.Controller({enableGestures: true})
            .use('boneHand', {
                scale: 1,
                targetEL: "canvas",
                scene: scene
            })
            .connect()
            .on('frame', function (frame) {
                // Try making some circles
                if(frame.valid && frame.gestures.length > 0) {
                    frame.gestures.forEach(function(gesture){
                        switch (gesture.type){
                            case "circle":
                                console.log("Circle Gesture");
                                break;
                            case "keyTap":
                                console.log("Key Tap Gesture");
                                var indexPosition = gesture.position;
                                drawGlowingSphere(scene, indexPosition);
                                break;
                            case "screenTap":
                                console.log("Screen Tap Gesture");
                                break;
                            case "swipe":
                                console.log("Swipe Gesture");
                                break;
                        }
                    });
                }
            });
    }

    // indexPosition: number[3]
    function drawGlowingSphere(scene, indexPosition) {

        var sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 32), sphereMaterial);
        sphere.position.set(indexPosition[0], indexPosition[1], indexPosition[2]);

        var sprite = new THREE.Sprite(glowMaterial);
        sprite.scale.set(30, 30, 1.0);
        sphere.add(sprite); // this centers the glow at the mesh

        if (sphereGroup.children.length > 50) {
            sphereGroup.remove(sphereGroup.children[0]);
        }
        sphereGroup.add(sphere);
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

    function drawHelpers() {
        Coordinates.drawGround({size: 10000});
        Coordinates.drawGrid({size: 10000, scale: 0.01});
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
        light.position.copy(camera.position);
    }

    return {
        fill: fill,
        update: update
    }
})();

