var INDEX_SCENE = (function () {

    var light;

    var shaderMaterial;

    var intensity = 0;

    var time = 0;

    function init() {
        // init
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
                uIntensity: {type: "f", value: 50}
            },
            attributes: {},
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent,
            //transparent: true,
            //blending: THREE.AdditiveBlending,
            //side: THREE.BackSide,
            //vertexColors: THREE.VertexColors // feeds into vec3 'color' shader variable
        });
        var geometry = new THREE.SphereGeometry(100, 50, 50);
        var mesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mesh);
    }

    function update(camera, scene, renderer, delta) {
        time += delta;
        intensity = Math.cos(time) * 100 + 50;
        shaderMaterial.uniforms.uIntensity = {type: "f", value: intensity};
        shaderMaterial.needsUpdate = true;
        light.position.copy(camera.position);
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

