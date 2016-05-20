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
        while (!service && serviceIndex < this.services.length) {
            if (this.services[serviceIndex].id == serviceId) {
                service = this.services[serviceIndex];
            }
            serviceIndex++;
        }
        return service;
    },

    findApiById: function (apiId) {
        var service;
        var api;
        var serviceIndex = 0;
        var apiIndex = 0;
        while (!api && serviceIndex < this.services.length) {
            service = this.services[serviceIndex];
            apiIndex = 0;
            while (!api && apiIndex < service.apis.length) {
                if (service.apis[apiIndex].id == apiId) {
                    api = service.apis[apiIndex];
                    console.log("Found api by id " + apiId + ": " + api);
                }
                apiIndex++;
            }
            serviceIndex++;
        }
        return api;
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
    this.apis = [];

};

SBX_HTML5.Service.prototype = {
    fillScene: function (scene) {
        buildTextMesh(this.mesh, this.name, this.mesh.position);
        for (var i = 0; i < this.apis.length; i++) {
            this.apis[i].fillScene(scene);
        }

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
        for (var i = 0; i < this.apis.length; i++) {
            this.apis[i].updateScene(camera, scene, renderer, delta);
        }
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
    console.log(this.movementVector);
    this.texture = THREE.ImageUtils.loadTexture(this.textureImagePath);
    this.streamMaterial = new THREE.PointCloudMaterial({
        color: 0xFFFFFF,
        size: 10,
        map: this.texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        alphaTest: 0.8
    });
    this.movements = [];
    var points = new THREE.Geometry();
    var vertices = points.vertices;
    for (var i = 0; i < this.particleCount; i++) {
        vertices.push(new THREE.Vector3(this.originPosition.x, this.originPosition.y, this.originPosition.z));
        this.movements.push(new THREE.Vector3().copy(this.movementVector).normalize().multiplyScalar(Math.random()));
    }
    this.pointCloud = new THREE.PointCloud(points, this.streamMaterial);
    this.pointCloud.sortParticles = true;
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
            if (vertices[v].length() - this.targetPosition.length() < 10) {
                vertices[v].copy(this.originPosition);
            }
        }
        this.pointCloud.geometry.verticesNeedUpdate = true;
    }
};

SBX_HTML5.Api = function (id, name, material, parentService, apiPosition) {
    this.id = id;
    this.name = name;
    this.material = material;
    this.parentService = parentService;
    this.apiPosition = apiPosition;
    this.sphereRadius = 2;
    var geometry = new THREE.SphereGeometry(this.sphereRadius, 16, 16);
    this.mesh = new THREE.Mesh(geometry, this.material);
};

SBX_HTML5.Api.TOP_POSITION = 0;
SBX_HTML5.Api.BOTTOM_POSITION = 1;
SBX_HTML5.Api.FRONT_POSITION = 2;
SBX_HTML5.Api.BACK_POSITION = 3;
SBX_HTML5.Api.LEFT_POSITION = 4;
SBX_HTML5.Api.RIGHT_POSITION = 5;

SBX_HTML5.Api.prototype = {
    fillScene: function (scene) {
        var parentMesh = this.parentService.mesh;
        parentMesh.geometry.computeBoundingBox();
        switch (this.apiPosition) {
            case (SBX_HTML5.Api.TOP_POSITION):
                this.mesh.position.set(parentMesh.position.x, parentMesh.geometry.boundingBox.max.y + this.sphereRadius, parentMesh.position.z);
                break;
            case (SBX_HTML5.Api.BOTTOM_POSITION):
                this.mesh.position.set(parentMesh.position.x, parentMesh.geometry.boundingBox.min.y - this.sphereRadius, parentMesh.position.z);
                break;
            case (SBX_HTML5.Api.FRONT_POSITION):
                this.mesh.position.set(parentMesh.position.x, parentMesh.position.y, parentMesh.geometry.boundingBox.max.z + this.sphereRadius);
                break;
            case (SBX_HTML5.Api.BACK_POSITION):
                this.mesh.position.set(parentMesh.position.x, parentMesh.position.y, parentMesh.geometry.boundingBox.min.z - this.sphereRadius);
                break;
            case (SBX_HTML5.Api.LEFT_POSITION):
                this.mesh.position.set(parentMesh.geometry.boundingBox.max.x + this.sphereRadius, parentMesh.position.y, parentMesh.position.z);
                break;
            case (SBX_HTML5.Api.RIGHT_POSITION):
                this.mesh.position.set(parentMesh.geometry.boundingBox.min.x - this.sphereRadius, parentMesh.position.y, parentMesh.position.z);
                break;
            default:
                console.log("default");
                //this.mesh.position.set(100, 0, 0);
                break;
        }
        scene.add(this.mesh);
    },

    updateScene: function (camera, scene, renderer, delta) {
        // relax and get a beer
    }
};

var INDEX_SCENE = (function () {

    var light;
    var time = 0;
    var topology;

    function init() {
        // init
    }

    function fill(scene) {

        // LIGHTS
        light = new THREE.PointLight(0xFFFFFF, 0.8);
        light.position.set(200, 150, 150);
        scene.add(light);
        scene.add(new THREE.PointLightHelper(light, 5));

        var jsonTopology = buildJsonTopology();
        console.log(jsonTopology);
        topology = buildTopology(jsonTopology);
        topology.fillScene(scene);

        // Helpers
        //
        //SCENE_RENDERING.drawAxes(scene);
        //var normalHelper = new THREE.FaceNormalsHelper(consumerGlowMesh);
        //scene.add(normalHelper);
        //var vertexNormalHelper = new THREE.VertexNormalsHelper(consumerGlowMesh, 10);
        //scene.add(vertexNormalHelper);

    }

    function buildTopology(jsonTopology) {
        var rawTopology = JSON.parse(jsonTopology);
        var topology = new SBX_HTML5.Topology();
        var serviceMaterial = new THREE.MeshPhongMaterial({
            color: "#0000FF",
            wireframe: true,
            shininess: 80,
            specular: "#FFFFFF"
        });
        var apiMaterial = new THREE.MeshPhongMaterial({color: "#FF0000", shininess: 10, specular: "#FF0000"});

        var serviceDefinitions = rawTopology.topology.services;
        var serviceDefinition;
        var service;
        var apiDefinitions;
        var apiDefinition;
        var api;
        for (var i = 0; i < serviceDefinitions.length; i++) {
            serviceDefinition = serviceDefinitions[i];
            service = new SBX_HTML5.Service(
                serviceDefinition.id,
                serviceDefinition.name,
                new THREE.Vector3(serviceDefinition.x, serviceDefinition.y, serviceDefinition.z),
                serviceMaterial
            );
            apiDefinitions = serviceDefinition.apis;
            if (apiDefinitions) {
                for (var j = 0; j < apiDefinitions.length; j++) {
                    apiDefinition = apiDefinitions[j];
                    api = new SBX_HTML5.Api(
                        apiDefinition.id,
                        apiDefinition.name,
                        apiMaterial,
                        service,
                        apiDefinition.position
                    );
                    service.apis.push(api);
                }
            }
            topology.services.push(service);
        }
        console.log("services count: " + topology.services.length);

        var dataFlowDefinitions = rawTopology.topology.dataFlows;
        for (i = 0; i < dataFlowDefinitions.length; i++) {
            var dataFlowDefinition = dataFlowDefinitions[i];
            var originService = topology.findServiceById(dataFlowDefinition.originId);
            var originPosition = new THREE.Vector3().copy(originService.mesh.position);
            var targetApi = topology.findApiById(dataFlowDefinition.targetId);
            //console.log(targetApi.mesh.position);
            var targetPosition = new THREE.Vector3().copy(targetApi.mesh.position);
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
                        z: 0,
                        apis: [
                            {
                                id: "api-1",
                                name: "api 1",
                                position: 0
                            },
                            {
                                id: "api-2",
                                name: "api 2",
                                position: 1
                            },
                            {
                                id: "api-3",
                                name: "api 3",
                                position: 2
                            },
                            {
                                id: "api-4",
                                name: "api 4",
                                position: 3
                            },
                            {
                                id: "api-5",
                                name: "api 5",
                                position: 4
                            },
                            {
                                id: "api-6",
                                name: "api 6",
                                position: 5
                            }
                        ]
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
                        originId: "s-2",
                        targetId: "api-1",
                        rate: 5
                    },
                    {
                        id: "df-1",
                        originId: "s-3",
                        targetId: "api-1",
                        rate: 5
                    },
                    {
                        id: "df-1",
                        originId: "s-4",
                        targetId: "api-1",
                        rate: 20
                    },
                    {
                        id: "df-1",
                        originId: "s-5",
                        targetId: "api-1",
                        rate: 20
                    },
                    {
                        id: "df-1",
                        originId: "s-6",
                        targetId: "api-1",
                        rate: 10
                    },
                    {
                        id: "df-1",
                        originId: "s-7",
                        targetId: "api-1",
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

