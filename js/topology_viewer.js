var SBX_HTML5 = {REVISION: '0.1'};

SBX_HTML5.Topology = function () {
    this.services = [];
    this.dataFlows = [];
};

SBX_HTML5.Topology.prototype = {
    constructor: SBX_HTML5.Topology,

    fillScene: function (scene) {
        for (var i = 0; i < this.services.length; i++) {
            this.services[i].fillScene(scene);
        }
        for (i = 0; i < this.dataFlows.length; i++) {
            this.dataFlows[i].fillScene(scene);
        }
    },

    updateScene: function (camera, scene, renderer, delta) {
        for (var i = 0; i < this.services.length; i++) {
            this.services[i].updateScene(camera, scene, renderer, delta);
        }
        for (i = 0; i < this.dataFlows.length; i++) {
            this.dataFlows[i].updateScene(camera, scene, renderer, delta);
        }
    },

    findServiceById: function (serviceId) {
        var service;
        var serviceIndex = 0;
        while (!service) {
            if (this.services[serviceIndex].id == serviceId) {
                service = this.services[serviceIndex];
            }
            serviceIndex++;
        }
        return service;
    }
};

SBX_HTML5.Service = function (id, name, position, material, textMaterialArray) {
    this.id = id || THREE.Math.generateUUID();
    this.name = name || "Service";
    this.material = material || new THREE.MeshPhongMaterial({color: "#0000FF", shininess: 50, specular: "#FFFFFF"});
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
        buildTextMesh(this.mesh, this.name, this.mesh.position);
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

SBX_HTML5.DataFlow = function (originPosition, targetPosition, textureImagePath, particleCount) {

    const DEFAULT_PARTICLE_COUNT = 20;

    this.originPosition = originPosition || new THREE.Vector3();
    this.targetPosition = targetPosition || new THREE.Vector3();
    this.textureImagePath = textureImagePath || "img/glow.png";
    this.particleCount = particleCount || DEFAULT_PARTICLE_COUNT;
    this.movementVector = new THREE.Vector3().copy(this.targetPosition).add(new THREE.Vector3().copy(this.originPosition).negate());
    this.texture = THREE.ImageUtils.loadTexture(this.textureImagePath);
    this.streamMaterial = new THREE.PointCloudMaterial({
        color: 0xFF00FF, size: 10, map: this.texture, blending: THREE.AdditiveBlending, transparent: true
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

SBX_HTML5.DataFlow.prototype = {
    constructor: SBX_HTML5.DataFlow,

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

SBX_HTML5.Api = function () {

};

SBX_HTML5.Api.prototype = {};

var INDEX_SCENE = (function () {

    var light;
    //var consumerMesh;
    //var consumerGlowMesh;
    //var glowMaterial;
    var time = 0;
    var topology;

    function init() {
        // init
    }

    function fill(scene) {

        // LIGHTS
        //light = new THREE.AmbientLight(0xFFFFFF);
        light = new THREE.PointLight(0xFFFFFF, 0.8);
        light.position.set(200, 150, 150);
        scene.add(light);
        scene.add(new THREE.PointLightHelper(light, 5));

        //glowMaterial = new THREE.ShaderMaterial({
        //    uniforms: {
        //        uViewVector: {type: "v3", value: light.position}
        //    },
        //    attributes: {},
        //    vertexShader: document.getElementById('vertexShader').textContent,
        //    fragmentShader: document.getElementById('fragmentShader').textContent,
        //    transparent: true,
        //    blending: THREE.AdditiveBlending,
        //    side: THREE.BackSide,
        //    vertexColors: THREE.VertexColors // feeds into vec3 'color' shader variable
        //});

        var jsonTopology = buildJsonTopology();
        console.log(jsonTopology);
        topology = buildTopology(jsonTopology);
        topology.fillScene(scene);

        //var consumerGeo = new THREE.SphereGeometry(25, 50, 50);
        //consumerMesh = new THREE.Mesh(consumerGeo, cubeMaterial);
        //consumerMesh.position.set(200, 0, 0);
        //scene.add(consumerMesh);
        //var consumerGlowGeo = new THREE.SphereGeometry(30, 50, 50);
        //consumerGlowMesh = new THREE.Mesh(consumerGlowGeo, glowMaterial);
        //consumerGlowMesh.position.set(200, 0, 0);
        //scene.add(consumerGlowMesh);

        // Helpers
        //
        //SCENE_RENDERING.drawAxes(scene);
        //var normalHelper = new THREE.FaceNormalsHelper(consumerGlowMesh);
        //scene.add(normalHelper);
        //var vertexNormalHelper = new THREE.VertexNormalsHelper(consumerGlowMesh, 10);
        //scene.add(vertexNormalHelper);

    }

    function buildTopology(jsonTopology) {
        var serviceMaterial = new THREE.MeshPhongMaterial({color: "#0000FF", shininess: 80, specular: "#FFFFFF"});

        var rawTopology = JSON.parse(jsonTopology);
        var topology = new SBX_HTML5.Topology();
        var serviceDefinitions = rawTopology.topology.services;
        for (var i = 0; i < serviceDefinitions.length; i++) {
            var serviceDefinition = serviceDefinitions[i];
            var service = new SBX_HTML5.Service(
                serviceDefinition.id,
                serviceDefinition.name,
                new THREE.Vector3(serviceDefinition.x, serviceDefinition.y, serviceDefinition.z),
                serviceMaterial
            );
            topology.services.push(service);
        }
        var dataFlowDefinitions = rawTopology.topology.dataFlows;
        for (i = 0; i < dataFlowDefinitions.length; i++) {
            var dataFlowDefinition = dataFlowDefinitions[i];
            var originService = topology.findServiceById(dataFlowDefinition.originId);
            var originPosition = new THREE.Vector3().copy(originService.mesh.position);
            var targetService = topology.findServiceById(dataFlowDefinition.targetId);
            var targetPosition = new THREE.Vector3().copy(targetService.mesh.position);
            var dataFlow = new SBX_HTML5.DataFlow(originPosition, targetPosition, undefined, dataFlowDefinition.rate);
            topology.dataFlows.push(dataFlow);
        }
        return topology;
    }

    function buildJsonTopology() {
        var topology = {
            topology: {
                services: [
                    {
                        id: "s-1",
                        name: "Nexus",
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    {
                        id: "s-2",
                        name: "Service A",
                        x: -200,
                        y: 0,
                        z: 0
                    },
                    {
                        id: "s-3",
                        name: "Service B",
                        x: 200,
                        y: 0,
                        z: 0
                    },
                    {
                        id: "s-4",
                        name: "Service C",
                        x: 0,
                        y: -200,
                        z: 0
                    },
                    {
                        id: "s-5",
                        name: "Service D",
                        x: 0,
                        y: 200,
                        z: 0
                    },
                    {
                        id: "s-6",
                        name: "Service E",
                        x: 0,
                        y: 0,
                        z: -200
                    },
                    {
                        id: "s-7",
                        name: "Service F",
                        x: 0,
                        y: 0,
                        z: 200
                    }

                ],
                dataFlows: [
                    {
                        id: "df-1",
                        originId: "s-1",
                        targetId: "s-2",
                        rate: 5
                    },
                    {
                        id: "df-1",
                        originId: "s-1",
                        targetId: "s-3",
                        rate: 5
                    },
                    {
                        id: "df-1",
                        originId: "s-1",
                        targetId: "s-4",
                        rate: 20
                    },
                    {
                        id: "df-1",
                        originId: "s-1",
                        targetId: "s-5",
                        rate: 20
                    },
                    {
                        id: "df-1",
                        originId: "s-1",
                        targetId: "s-6",
                        rate: 10
                    },
                    {
                        id: "df-1",
                        originId: "s-1",
                        targetId: "s-7",
                        rate: 50
                    }
                ]
            }
        };
        return JSON.stringify(topology);
    }


    function update(camera, scene, renderer, delta) {
        time += delta;
        light.position.copy(camera.position);

        //glowMaterial.uniforms.uViewVector.value = new THREE.Vector3().subVectors(camera.position, consumerGlowMesh.position);
        //glowMaterial.needsUpdate = true;

        topology.updateScene(camera, scene, renderer, delta);
    }


    return {
        init: init,
        fill: fill,
        update: update
    }
})();

