var INDEX_SCENE = (function () {

    var light;

    var shaderMaterial;

    var intensity = 0;

    var time = 0;

    var mouseX = 0;
    var mouseY = 0;

    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;

    function init() {
        document.onmousemove = function (mouseEvent) {
            mouseX = (mouseEvent.clientX - sceneWidth / 2) / sceneWidth * 360;
            mouseY = (mouseEvent.clientY - sceneHeight / 2) / sceneHeight * 360;
        };
    }

    function fill(scene) {

        // LIGHTS
        //light = new THREE.PointLight(0xFFFFFF, 1);
        light = new THREE.AmbientLight(0xFFFFFF);
        scene.add(light);

        shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                //iResolution: { type: "v3", value: new THREE.Vector3() },
                //iGlobalTime: { type: "f", value: 0 },
                uMousePosition: {type: "v2", value: new THREE.Vector2(mouseX, mouseY)},
                uIntensity: {type: "f", value: 50}
            },
            attributes: {},
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent,
            //transparent: true,
            //blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            //vertexColors: THREE.VertexColors // feeds into vec3 'color' shader variable
        });
        var geometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
        var mesh = new THREE.Mesh(geometry, shaderMaterial);
        mesh.rotateX(Math.PI / 2);
        scene.add(mesh);
    }

    function update(camera, scene, renderer, delta) {
        time += delta;
        intensity = Math.cos(time) * 100 + 50;
        shaderMaterial.uniforms.uMousePosition = {type: "v2", value: new THREE.Vector2(mouseX, mouseY)};
        shaderMaterial.uniforms.uIntensity = {type: "f", value: 100};
        shaderMaterial.needsUpdate = true;
        light.position.copy(camera.position);
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

