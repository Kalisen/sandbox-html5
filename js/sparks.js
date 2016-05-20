var INDEX_SCENE = (function () {

    const PARTICLE_COUNT = 1000;
    var light;
    var rayCaster;
    var mouseVector;
    var container;

    var varyingOpacityMaterial;

    var pointCloud;
    var particleIndex = 0;
    var sinceLastParticle = 0;
    var sinceLastMove = 0;
    var displacement = [];
    var moving = [];

    var time = 0;

    function onMouseMove(e) {
        var canvas = container.getElementsByTagName('canvas')[0];
        //console.log("x=" + e.clientX + ", y=" + e.clientY + ", width=" + canvas.width + ", height=" + canvas.height);
        mouseVector.x = 2 * (e.clientX / canvas.clientWidth) - 1; // must use canvas.clientWidth and canvas.clientHeight to account for pixelRatio
        mouseVector.y = 1 - 2 * (e.clientY / canvas.clientHeight);
        //console.log("x=" + mouseVector.x + ", y=" + mouseVector.y);
    }

    function init() {
        container = document.getElementById("container");
        rayCaster = new THREE.Raycaster();
        mouseVector = new THREE.Vector3(0, 0, 1);
        container.addEventListener('mousemove', onMouseMove, false);
    }

    function fill(scene) {

        // LIGHTS
        light = new THREE.PointLight(0xFFFFFF, 0.5);
        scene.add(light);

        var cube = new THREE.BoxGeometry(50, 50, 50);
        var cubeMaterial = new THREE.MeshBasicMaterial({wireframe: true});
        var mesh = new THREE.Mesh(cube, cubeMaterial);
        scene.add(mesh);

        var points = new THREE.Geometry();
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            points.vertices.push(new THREE.Vector3());
            displacement.push(0);
            moving.push(false);
        }
        var texture = THREE.ImageUtils.loadTexture("img/glow.png");
        var sparksMaterial = new THREE.PointCloudMaterial({
            color: 0xFFFF00, size: 10, map: texture, blending: THREE.AdditiveBlending, transparent: true
        });
        varyingOpacityMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {type: "f", value: 1.0},
                uFadingHorizon: {type: "f", value: 10}
            },
            attributes: {},
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent,
            transparent: true
        });
        pointCloud = new THREE.PointCloud(points, varyingOpacityMaterial);
        pointCloud.dynamic = true;
        scene.add(pointCloud);

        SCENE_RENDERING.drawAxes(scene);

    }

    function update(camera, scene, renderer, delta) {
        time += delta;
        light.position.copy(camera.position);
        rayCaster.setFromCamera(mouseVector.normalize(), camera);
        var sceneObjects = scene.children;
        var intersects = rayCaster.intersectObjects(sceneObjects, false);
        var vertices = pointCloud.geometry.vertices;
        sinceLastParticle += delta;
        if (intersects) {
            for (var i = 0; i < intersects.length; i++) {
                if (intersects[i].face) {
                    if (sinceLastParticle > 0) {
                        sinceLastParticle = 0;
                        vertices[particleIndex].set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);
                        moving[particleIndex] = true;
                        particleIndex = (particleIndex + 1) % PARTICLE_COUNT;
                    }
                }
            }
        }

        sinceLastMove += delta;
        if (sinceLastMove > .01) {
            sinceLastMove = 0;
            for (var v = 0; v < PARTICLE_COUNT; v++) {
                displacement[v] = Math.random();
                //console.log(displacement[v]);
                if (moving[v]) {
                    vertices[v].setY(vertices[v].y + displacement[v]);
                }
                if (vertices[v].y > 200) {
                    moving[v] = false;
                }
            }
            //console.log(pointCloud.geometry.vertices.length);
            pointCloud.geometry.verticesNeedUpdate = true;
        }
        varyingOpacityMaterial.uniforms.uTime = {type: "f", value: time};
        varyingOpacityMaterial.needsUpdate = true;
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

