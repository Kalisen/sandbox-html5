var INDEX_SCENE = (function () {

    var light;

    var shaderMaterial;

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
                iResolution: {type: "v3", value: new THREE.Vector3()},
                iGlobalTime: {type: "f", value: 0}
            },
            attributes: {},
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent,
            //transparent: true,
            //blending: THREE.AdditiveBlending,
            //side: THREE.BackSide,
            //vertexColors: THREE.VertexColors // feeds into vec3 'color' shader variable
        });
        var geometry = new THREE.CubeGeometry(100, 100, 100);
        var mesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mesh);
    }

    function update(camera, scene, renderer, delta) {
        time += delta;
        var canvas = $('canvas');
        //canvas.width = 800;
        //canvas.height = 600;

        light.position.copy(camera.position);
        shaderMaterial.uniforms.iGlobalTime.value = time;
        var iResolution = new THREE.Vector3(
            canvas.attr('width'),
            canvas.attr('height'),
            window.devicePixelRatio || 1
        );
        //console.log(iResolution)
        shaderMaterial.uniforms.iResolution.value = iResolution;
        shaderMaterial.needsUpdate = true;
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

