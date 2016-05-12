var SBX_HTML5 = {REVISION: '0.1'};


SBX_HTML5.Stream = function (originPosition, targetPosition, textureImagePath, particleCount) {

    const DEFAULT_PARTICLE_COUNT = 20;

    this.originPosition = originPosition || new THREE.Vector3();
    this.targetPosition = targetPosition || new THREE.Vector3();
    this.textureImagePath = textureImagePath || "img/red_shroom_128.png";
    this.particleCount = particleCount || DEFAULT_PARTICLE_COUNT;
    this.movementVector = new THREE.Vector3().copy(this.targetPosition).add(new THREE.Vector3().copy(this.originPosition).negate());
    this.texture = THREE.ImageUtils.loadTexture(this.textureImagePath);
    this.streamMaterial = new THREE.PointCloudMaterial({
        color: 0xFFFFFF, size: 10, map: this.texture, blending: THREE.AdditiveBlending, transparent: false
    });
    this.movements = [];
    var points = new THREE.Geometry();
    var vertices = points.vertices;
    for (var i = 0; i < this.particleCount; i++) {
        vertices.push(new THREE.Vector3(this.originPosition.x, this.originPosition.y, this.originPosition.z));
        this.movements.push(new THREE.Vector3().copy(this.movementVector).normalize().multiplyScalar(Math.random()));
    }
    this.pointCloud = new THREE.PointCloud(points, this.streamMaterial);
    this.pointCloud.dynamic = true;
};

SBX_HTML5.Stream.prototype = {
    constructor: SBX_HTML5.Stream,

    fillScene: function (scene) {
        scene.add(this.pointCloud);
    },

    updateScene: function (camera, scene, renderer, delta) {
        var vertices = this.pointCloud.geometry.vertices;
        for (var v = 0; v < vertices.length; v++) {
            vertices[v].add(this.movements[v]);
            if (vertices[v].length() > this.targetPosition.length()) {
                vertices[v].copy(this.originPosition);
            }
        }
        this.pointCloud.geometry.verticesNeedUpdate = true;
    }
};

SBX_HTML5.Service = function (serviceName, x, y, z, material, textMaterialArray) {
    this.serviceName = serviceName || "Service";
    this.material = material || new THREE.MeshPhongMaterial({color: "#0000FF", shininess: 80, specular: "#FFFFFF"});
    var geometry = new THREE.BoxGeometry(50, 50, 50);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x || 0, y || 0, z || 0);
    this.textMaterialArray = new THREE.MeshFaceMaterial(textMaterialArray);

    function drawText(text, position, textMaterialArray) {
        var textGeom = new THREE.TextGeometry(text,
            {
                size: 30, height: 4, curveSegments: 3,
                font: "helvetiker", weight: "bold", style: "normal",
                bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
                material: 0, extrudeMaterial: 1
            });

        var textMesh = new THREE.Mesh(textGeom, textMaterial);

        // Center text
        textGeom.computeBoundingBox();
        var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
        var textHeight = textGeom.boundingBox.max.y - textGeom.boundingBox.min.y;
        textMesh.position.set(
            -0.5 * textWidth + position[0],
            -0.5 * textHeight + position[1],
            position[2]
        );

        parent.add(textMesh);
    }
};

SBX_HTML5.Service.prototype = {
    fillScene: function (scene) {
        scene.add(this.mesh);
        drawText(this.serviceName);
    },

    updateScene: function (camera, scene, renderer, delta) {
        // relax and drink a beer
    },

    // must load fonts <script src="fonts/helvetiker_bold.typeface.js"></script>
    drawText: function (text, position) {
        var textGeom = new THREE.TextGeometry(text,
            {
                size: 30, height: 4, curveSegments: 3,
                font: "helvetiker", weight: "bold", style: "normal",
                bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
                material: 0, extrudeMaterial: 1
            });

        var textMesh = new THREE.Mesh(textGeom, textMaterial);

        // Center text
        textGeom.computeBoundingBox();
        var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
        var textHeight = textGeom.boundingBox.max.y - textGeom.boundingBox.min.y;
        textMesh.position.set(
            -0.5 * textWidth + position[0],
            -0.5 * textHeight + position[1],
            position[2]
        );

        parent.add(textMesh);
    }
};

SBX_HTML5.Api = function () {

};

SBX_HTML5.Api.prototype = {};

var INDEX_SCENE = (function () {

    // add a new particle every X ms
    // vary the particles speed

    var light;
    var producerMesh;
    var consumerMesh;
    var consumerGlowMesh;
    var glowMaterial;
    var time = 0;
    var stream;
    var stream2;

    function init() {
        // init
    }

    function fill(scene) {

        // LIGHTS
        //light = new THREE.AmbientLight(0xFFFFFF);
        light = new THREE.PointLight(0xFFFFFF, 0.8);
        light.position.set(100, 150, 150);
        scene.add(light);
        scene.add(new THREE.PointLightHelper(light, 5));

        var textMaterialFront = new THREE.MeshBasicMaterial({color: 0xff0000});
        var textMaterialSide = new THREE.MeshBasicMaterial({color: 0x000000});
        var textMaterialArray = [textMaterialFront, textMaterialSide];

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
        //var cubeMaterial = new THREE.MeshBasicMaterial({color: "#0000FF", wireframe: false, transparent: true});
        var cubeMaterial = new THREE.MeshPhongMaterial({color: "#0000FF", shininess: 80, specular: "#FFFFFF"});

        var producerGeo = new THREE.BoxGeometry(50, 50, 50);
        producerMesh = new THREE.Mesh(producerGeo, cubeMaterial);
        producerMesh.position.set(-100, 0, 0);
        scene.add(producerMesh);
        var producerGlowGeo = new THREE.BoxGeometry(52, 52, 52);
        var producerGlowMesh = new THREE.Mesh(producerGlowGeo, cubeMaterial);
        producerGlowMesh.position.set(-100, 0, 0);
        scene.add(producerGlowMesh);

        var consumerGeo = new THREE.SphereGeometry(25, 50, 50);
        consumerMesh = new THREE.Mesh(consumerGeo, cubeMaterial);
        consumerMesh.position.set(100, 0, 0);
        scene.add(consumerMesh);
        var consumerGlowGeo = new THREE.SphereGeometry(30, 50, 50);
        consumerGlowMesh = new THREE.Mesh(consumerGlowGeo, glowMaterial);
        consumerGlowMesh.position.set(100, 0, 0);
        scene.add(consumerGlowMesh);

        stream = new SBX_HTML5.Stream(new THREE.Vector3().copy(producerMesh.position),
            new THREE.Vector3().copy(consumerMesh.position));
        stream.fillScene(scene);

        stream2 = new SBX_HTML5.Stream(new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(500, 200, 300));
        stream2.fillScene(scene);

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
        //glowMaterial.needsUpdate = true;

        stream.updateScene(camera, scene, renderer, delta);
        stream2.updateScene(camera, scene, renderer, delta);
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

