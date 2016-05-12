var INDEX_SCENE = (function () {

    var light;

    var mesh;

    var time = 0;

    function init() {
        // init
    }

    function fill(scene) {

        // LIGHTS
        //light = new THREE.PointLight(0xFFFFFF, 1);
        light = new THREE.AmbientLight(0xFFFFFF);
        scene.add(light);

        var texture = THREE.ImageUtils.loadTexture('img/led-zeppelin-ticketstub.jpg');
        var ticketMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        var geometry = new THREE.PlaneGeometry(100, 50, 20, 10);
        mesh = new THREE.Mesh(geometry, ticketMaterial);
        scene.add(mesh);
    }

    function update(camera, scene, renderer, delta) {
        time += delta;
        mesh.rotateY(2 * Math.PI / 360);
        light.position.copy(camera.position);
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

