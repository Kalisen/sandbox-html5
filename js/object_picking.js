var INDEX_SCENE = (function () {

    var light;

    function fill(scene) {

        // LIGHTS
        light = new THREE.PointLight(0xFFFFFF, 0.5);
        scene.add(light);

        var wireframeMaterial = new THREE.MeshBasicMaterial();
        wireframeMaterial.color.setRGB(31 / 255, 86 / 255, 169 / 255);
        wireframeMaterial.wireframe = true;
        wireframeMaterial.wireframeLinewidth = 1;

        var cube = new THREE.BoxGeometry(50, 50, 50);
        var mesh = new THREE.Mesh(cube, wireframeMaterial);

        scene.add(mesh);

        SCENE_RENDERING.drawAxes(scene);

        window.addEventListener( 'mousemove', onMouseMove, false );

    }

    function onMouseMove(e) {
        var projector = new THREE.Projector();
        var mouseVector = new THREE.Vector3();
        var container = document.getElementById("container");
        var containerWidth = container.width;
        var containerHeight = container.height;
        mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
        mouseVector.y = 1 - 2 * (e.clientY / containerHeight);

        var rayCaster = mouseVector.project(SCENE_RENDERING.camera());

        var intersects = rayCaster.intersectObjects(SCENE_RENDERING.scene().children);
        console.log(intersects);
    }

    function update(camera) {
        light.position.copy(camera.position);
    }

    return {
        fill: fill,
        update: update
    }
})();

