"use strict";

var INDEX4_SCENE = (function () {

    var light;
    var elementMaterial;
    var arrowMaterial;
    var textMaterial;
    var ground;
    var element1;
    var element2;
    var element3;
    var arrow3;
    var diagram = new THREE.Object3D();

    function fill(scene) {

        elementMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            emissive: 0x99CCFF
//            wireframe: true
        });
        arrowMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000
        });
        var textMaterialFront = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        var textMaterialSide = new THREE.MeshBasicMaterial({ color: 0x000000 });
        var textMaterialArray = [ textMaterialFront, textMaterialSide ];
        textMaterial = new THREE.MeshFaceMaterial(textMaterialArray);

        element1 = drawInterfaceElement(scene, ":Variance", [0, 200, 0]);
        diagram.add(element1);

        element2 = drawInterfaceElement(scene, ":Product", [-800, 200, 0]);
        diagram.add(element2);

        element3 = drawInterfaceElement(scene, ":Component", [800, 200, 0]);
        diagram.add(element3);

        var arrow1 = new UML.Arrow(scene, element1, element3, arrowMaterial);
        diagram.add(arrow1.model);
        var arrow2 = new UML.Arrow(scene, element2, element1, arrowMaterial);
        diagram.add(arrow2.model);

        scene.add(diagram);

        var sphere = drawGlowingSphere(scene, [100, 1000, 300]);
        drawGround(scene);
        arrow3 = new UML.Arrow(scene, element2, sphere, arrowMaterial);

        initControls(scene, sphere);
    }

    function initControls(scene, sphere) {
        new Leap.Controller({enableGestures: true})
            .use('boneHand', {
                scale: 1,
                targetEL: "canvas",
                scene: scene
            })
            .connect()
            .on('frame', function (frame) {
                if (frame.valid && frame.hands.length > 0) {
                    //frame.hands[0].indexFinger.distal.position
                    var fingerPosition = frame.hands[0].indexFinger.dipPosition;
                    if (fingerPosition) {
                        sphere.position.set(fingerPosition[0], fingerPosition[1], fingerPosition[2]);
                        sphere.geometry.verticesNeedUpdate = true;
                        arrow3.update();
                    }
                }
            });
    }

    function drawGlowingSphere(scene, position) {
        var glowLambertMaterial = new THREE.MeshLambertMaterial({
            color: 0xFCD440,
            ambient: 0xFCD440,
            emissive: 0xFCD440,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.9
        });

        // LIGHTS
        light = new THREE.PointLight(0xFCD440, 1, 1000);
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), glowLambertMaterial);
        sphere.position.set(position[0], position[1], position[2]);
        light.position.copy(sphere.position);
        scene.add(light);
        scene.add(sphere);

        var spriteMaterial = new THREE.SpriteMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/glow2.png'),
                useScreenCoordinates: false,
                color: 0xFCD440,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(300, 300, 1.0);
        sphere.add(sprite); // this centers the glow at the mesh
        return sphere;
    }

    function drawGround(parent) {
        var geom = new THREE.PlaneBufferGeometry(10000, 10000, 100, 100);

        var groundMaterial = new THREE.MeshBasicMaterial(
            {
                wireframe: true
            }
        );

        ground = new THREE.Mesh(geom, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1000;
        parent.add(ground);

        var groundLayerMaterial = new THREE.MeshPhongMaterial({
            color: 0x0099FF,
            transparent: true,
            opacity: 0.2
        });
        var groundLayer2 = new THREE.Mesh(geom, groundLayerMaterial);
        groundLayer2.rotation.x = -Math.PI / 2;
        groundLayer2.position.y = -999;
        parent.add(groundLayer2);
    }

//    function drawGround(parent) {
//        var geom = new THREE.PlaneGeometry(1000, 1000, 10, 10);
//        var fov = 157, aspect = 1;
////        cameraPY = new THREE.OrthographicCamera(500, -500, 500, -500, 0.1, 1000);
//        cameraPY = new THREE.PerspectiveCamera(fov, aspect, 0.1 , 2000);
//        cameraPY.up.set(0, 0, -1);
//        cameraPY.lookAt(new THREE.Vector3(0, 1, 0));
//        parent.add(cameraPY);
//
//        renderTarget = new THREE.WebGLRenderTarget( 1000, 1000, { format: THREE.RGBFormat } );
//
//        var groundMaterial = new THREE.MeshBasicMaterial(
//            {
//                map: renderTarget
//            }
//        );
//
//        ground = new THREE.Mesh(geom, groundMaterial);
//        ground.rotation.x = -Math.PI / 2;
//        cameraPY.position = ground.position;
//        parent.add(ground);
//
//        var groundLayerMaterial = new THREE.MeshPhongMaterial({
//            color: 0x0099FF,
//            transparent: true,
//            opacity: 0.2
//        });
//        var groundLayer2 = new THREE.Mesh(geom, groundLayerMaterial);
//        groundLayer2.rotation.x = -Math.PI / 2;
//        groundLayer2.position.y = 1;
//        parent.add(groundLayer2);
//    }
//
    // position: number[3]
    function drawInterfaceElement(parent, text, position) {
        var elementDimensions = [500, 200, 30];
        var geom = new THREE.BoxGeometry(
            elementDimensions[0],
            elementDimensions[1],
            elementDimensions[2]
        );
        var element = new THREE.Mesh(geom, elementMaterial);
        element.position.set(position[0], position[1], position[2]);

        drawText(element,
            text,
            [
                0,
                    elementDimensions[1] / 4,
                elementDimensions[2]
            ]
        );

        parent.add(element);

        return element;
    }

    function drawText(parent, text, position) {
        // add 3D text
        // must load fonts <script src="fonts/helvetiker_bold.typeface.js"></script>
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

    function update(camera, scene, renderer) {
//        light.position.copy(camera.position);
//        ground.visible = false;
//        cameraPY.updateProjectionMatrix();
//        renderer.render( scene, cameraPY, renderTarget, true);
//        ground.visible = true;
//        diagram.rotation.y = diagram.rotation.y + Math.PI / 360;
    }

    return {
        fill: fill,
        update: update
    }
})();

var UML = UML || {};

UML.Arrow = function (parent, origin, destination, material) {

    // protect against accidental call to Arrow constructor without 'new' keyword
    if (!(this instanceof UML.Arrow)) {
        return new UML.Arrow();
    }

    this.model = new THREE.Object3D();

    var that = this;
    var _originElement = origin;
    var _destinationElement = destination;
    var _originPosition = new THREE.Vector3(0, 0, 0);
    var _destPosition = new THREE.Vector3(0, 0, 0);
    var _line;
    var _arrowHead;

    function updateLine() {
        var origBoundingBox = _originElement.geometry.boundingBox;
        var destBoundingBox = _destinationElement.geometry.boundingBox;
        if (!origBoundingBox) {
            _originElement.geometry.computeBoundingBox();
            origBoundingBox = _originElement.geometry.boundingBox;
        }
        if (!destBoundingBox) {
            _destinationElement.geometry.computeBoundingBox();
            destBoundingBox = _destinationElement.geometry.boundingBox;
        }
        var origBoundingBoxMin = origBoundingBox.min;
        var origBoundingBoxMax = origBoundingBox.max;
        var destBoundingBoxMin = destBoundingBox.min;
        var destBoundingBoxMax = destBoundingBox.max;
        var originElementPosition = _originElement.position;
        var destElementPosition = _destinationElement.position;
        _originPosition.set(
                originElementPosition.x + (origBoundingBoxMax.x - origBoundingBoxMin.x) / 2,
                originElementPosition.y,
                originElementPosition.z
        );
        _destPosition.set(
                destElementPosition.x - (destBoundingBoxMax.x - destBoundingBoxMin.x) / 2,
                destElementPosition.y,
                destElementPosition.z
        );
    }

    function updateArrowHead() {
        _arrowHead.position.set(_destPosition.x, _destPosition.y, _destPosition.z);
        _arrowHead.rotation.z = -Math.atan2(_destPosition.y - _originPosition.y, _destPosition.x - _originPosition.x);
        _arrowHead.rotation.y = -Math.atan2(_destPosition.z - _originPosition.z, _destPosition.x - _originPosition.x);
        _arrowHead.rotation.x = -Math.atan2(_destPosition.z - _originPosition.z, _destPosition.y - _originPosition.y);
    }

    this.update = function () {
        updateLine();
        _line.geometry.verticesNeedUpdate = true;
//      pre r49:  line.geometry.__dirtyVertices = true;
        updateArrowHead();
        _arrowHead.geometry.verticesNeedUpdate = true;
    };

    function createLine() {
        var geo = new THREE.Geometry();
        geo.vertices.push(_originPosition);
        geo.vertices.push(_destPosition);
        _line = new THREE.Line(geo, that.arrowLineMaterial);
        that.model.add(_line);
    }

    function createArrowHead() {
        _arrowHead = new THREE.Mesh(that.arrowHeadGeometry, material || that.arrowHeadMaterial);
        _line.add(_arrowHead);
    }

    updateLine();
    createLine();
    createArrowHead();
    updateArrowHead();
    parent.add(this.model);

};

UML.Arrow.prototype.arrowHeadGeometry = new THREE.CylinderGeometry(0, 10, 20, 32, 32, false);

UML.Arrow.prototype.arrowLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

UML.Arrow.prototype.arrowHeadMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

UML.Interface = function () {

};