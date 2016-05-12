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

SBX_HTML5.Service = function (serviceName, position, material, textMaterialArray) {
    this.serviceName = serviceName || "Service";
    this.material = material || new THREE.MeshPhongMaterial({color: "#0000FF", shininess: 80, specular: "#FFFFFF"});
    var geometry = new THREE.BoxGeometry(50, 50, 50);
    this.mesh = new THREE.Mesh(geometry, material);
    if (position) {
        this.mesh.position.copy(position);
    } else {
        this.mesh.position.set(0, 0, 0);
    }
    if (textMaterialArray) {
        this.textMaterial = new THREE.MeshFaceMaterial(textMaterialArray);
    } else {
        var textMaterialFront = new THREE.MeshBasicMaterial({color: 0xff0000});
        var textMaterialSide = new THREE.MeshBasicMaterial({color: 0x000000});
        this.textMaterial = new THREE.MeshFaceMaterial([textMaterialFront, textMaterialSide]);
    }

};

SBX_HTML5.Service.prototype = {
    fillScene: function (scene) {
        buildTextMesh(this.mesh, this.serviceName, this.mesh.position);
        scene.add(this.mesh);

        // must load fonts <script src="fonts/helvetiker_bold.typeface.js"></script>
        function buildTextMesh(parent, text, position) {
            var textGeom = new THREE.TextGeometry(text,
                {
                    size: 10, height: 1, curveSegments: 3,
                    font: "helvetiker", weight: "bold", style: "normal",
                    bevelEnabled: false,
                    material: 0, extrudeMaterial: 1
                });

            var textMesh = new THREE.Mesh(textGeom, this.textMaterial);

            // Center text
            textGeom.computeBoundingBox();
            var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
            var textHeight = textGeom.boundingBox.max.y - textGeom.boundingBox.min.y;
            console.log("textPosition: " + position.x + ", " + position.y + ", " + position.z);
            parent.geometry.computeBoundingBox();
            textMesh.position.set(
                -0.5 * textWidth,
                -0.5 * textHeight,
                parent.geometry.boundingBox.max.z
            );

            parent.add(textMesh);
        }
    },

    updateScene: function (camera, scene, renderer, delta) {
        // relax and drink a beer
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
        var nexus = new SBX_HTML5.Service("Nexus", new THREE.Vector3(0, 0, 0), cubeMaterial);
        nexus.fillScene(scene);
        var serviceB = new SBX_HTML5.Service("Service B", new THREE.Vector3(-100, 0, 0), cubeMaterial);
        serviceB.fillScene(scene);
        var serviceC = new SBX_HTML5.Service("Service C", new THREE.Vector3(100, 0, 0), cubeMaterial);
        serviceC.fillScene(scene);
        var serviceD = new SBX_HTML5.Service("Service D", new THREE.Vector3(0, 100, 0), cubeMaterial);
        serviceD.fillScene(scene);
        var serviceE = new SBX_HTML5.Service("Service E", new THREE.Vector3(0, -100, 0), cubeMaterial);
        serviceE.fillScene(scene);
        var serviceF = new SBX_HTML5.Service("Service F", new THREE.Vector3(0, 0, 100), cubeMaterial);
        serviceF.fillScene(scene);
        var serviceG = new SBX_HTML5.Service("Service G", new THREE.Vector3(0, 0, -100), cubeMaterial);
        serviceG.fillScene(scene);

        var consumerGeo = new THREE.SphereGeometry(25, 50, 50);
        consumerMesh = new THREE.Mesh(consumerGeo, cubeMaterial);
        consumerMesh.position.set(100, 0, 0);
        scene.add(consumerMesh);
        var consumerGlowGeo = new THREE.SphereGeometry(30, 50, 50);
        consumerGlowMesh = new THREE.Mesh(consumerGlowGeo, glowMaterial);
        consumerGlowMesh.position.set(100, 0, 0);
        scene.add(consumerGlowMesh);

        stream = new SBX_HTML5.Stream(new THREE.Vector3().copy(nexus.mesh.position),
            new THREE.Vector3().copy(serviceB.mesh.position));
        stream.fillScene(scene);

        stream2 = new SBX_HTML5.Stream(new THREE.Vector3().copy(nexus.mesh.position),
            new THREE.Vector3().copy(serviceC.mesh.position));
        stream2.fillScene(scene);

        //SCENE_RENDERING.drawAxes(scene);
        //var normalHelper = new THREE.FaceNormalsHelper(consumerGlowMesh);
        //scene.add(normalHelper);
        //var vertexNormalHelper = new THREE.VertexNormalsHelper(consumerGlowMesh, 10);
        //scene.add(vertexNormalHelper);

    }

    function addTopologyToScene(topology) {
        var serviceMaterial = new THREE.MeshPhongMaterial({color: "#0000FF", shininess: 80, specular: "#FFFFFF"});

        var serviceDefinitions = topology.services;
        var serviceDefinition;
        var service;
        for (var i = 0; i < serviceDefinitions.length; i++) {
            var serviceDefinition = serviceDefinitions[i];
            var service = new SBX_HTML5.Service(
                serviceDefinition.name,
                new THREE.Vector3(serviceDefinition.x, serviceDefinition.y, serviceDefinition.z),
                serviceMaterial
            );
            service.fillScene(scene);
        }
    }


    function buildTopology() {
        return {
            topology: {
                services: [
                    {
                        name: "Nexus",
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    {
                        name: "Service A",
                        x: -100,
                        y: 0,
                        z: 0
                    },
                    {
                        name: "Service B",
                        x: 100,
                        y: 0,
                        z: 0
                    },
                    {
                        name: "Service C",
                        x: 0,
                        y: -100,
                        z: 0
                    },
                    {
                        name: "Service D",
                        x: 0,
                        y: 100,
                        z: 0
                    },
                    {
                        name: "Service E",
                        x: 0,
                        y: 0,
                        z: -100
                    },
                    {
                        name: "Service F",
                        x: 0,
                        y: 0,
                        z: 100
                    },

                ]
            }
        }
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

