var INDEX_SCENE = (function () {

    var light;
    var consumerGlowMesh;

    var glowMaterial;

    var time = 0;

    function init() {
        // init
    }

    function fill(scene) {

        // LIGHTS
        light = new THREE.AmbientLight(0xFFFFFF);
        //light = new THREE.PointLight(0xFFFFFF, 1.0);
        //light.position.set(100, 100, 100);
        scene.add(light);
        scene.add(new THREE.PointLightHelper(light, 5));

        glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uViewVector: {type: "v3", value: light.position}
            },
            attributes: {},
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            vertexColors: THREE.VertexColors // feeds into vec3 'color' shader variable
        });
        //var objectMaterial = new THREE.MeshBasicMaterial({color: "#0000FF", wireframe: false, transparent: true});
        var objectMaterial = new THREE.MeshPhongMaterial({
                color: "#0000AF",
                shininess: 1,
                specular: "#00FFFF"
            }
        );

        var consumerGeo = new THREE.SphereGeometry(25, 50, 50);
        var consumerMesh = new THREE.Mesh(consumerGeo, objectMaterial);
        //consumerMesh.position.set(100, 0, 0);
        scene.add(consumerMesh);
        var consumerGlowGeo = new THREE.SphereGeometry(30, 50, 50);
        consumerGlowMesh = new THREE.Mesh(consumerGlowGeo, glowMaterial);
        //consumerGlowMesh.position.set(100, 0, 0);
        scene.add(consumerGlowMesh);

        //SCENE_RENDERING.drawAxes(scene);
        //var normalHelper = new THREE.FaceNormalsHelper(consumerGlowMesh);
        //scene.add(normalHelper);
        //var vertexNormalHelper = new THREE.VertexNormalsHelper(consumerGlowMesh, 10);
        //scene.add(vertexNormalHelper);

    }

    function update(camera, scene, renderer, delta) {
        time += delta;
        light.position.copy(camera.position);
        //console.log(camera.position);
        //console.log(light.position);
        glowMaterial.uniforms.uViewVector.value = new THREE.Vector3().subVectors(camera.position, consumerGlowMesh.position);
        glowMaterial.needsUpdate = true;
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

