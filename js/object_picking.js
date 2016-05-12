var INDEX_SCENE = (function () {

    var light;
    var rayCaster;
    var mouseVector;
    var container;

    var selectedFaceIndex;
    var selectedMaterial;
    var unselectedMaterial;

    function onMouseMove(e) {
        var canvas = container.getElementsByTagName('canvas')[0];
        //console.log("x=" + e.clientX + ", y=" + e.clientY + ", width=" + canvas.width + ", height=" + canvas.height);
        mouseVector.x = 2 * (e.clientX / canvas.clientWidth) - 1; // must use canvas.clientWidth and canvas.clientHeight to account for pixelRatio
        mouseVector.y = 1 - 2 * (e.clientY / canvas.clientHeight);
        //console.log("x=" + mouseVector.x + ", y=" + mouseVector.y);
    }

    function init() {
        container = document.getElementById("container");
        rayCaster = new THREE.Raycaster();
        mouseVector = new THREE.Vector3(0, 0, 11);
        container.addEventListener('mousemove', onMouseMove, false);
    }

    function fill(scene) {

        // LIGHTS
        light = new THREE.PointLight(0xFFFFFF, 0.5);
        scene.add(light);

        unselectedMaterial = new THREE.MeshBasicMaterial();
        unselectedMaterial.color.setRGB(31 / 255, 86 / 255, 169 / 255);
        unselectedMaterial.wireframe = true;
        unselectedMaterial.wireframeLinewidth = 1;

        selectedMaterial = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
        selectedMaterial.color.setRGB(31 / 255, 0 / 255, 0 / 255);
        var cube = new THREE.BoxGeometry(50, 50, 50);
        var cubeFaces = cube.faces;
        var materials = [];
        for (var i = 0; i < cubeFaces.length; i++) {
            cubeFaces[i].materialIndex = i;
            materials.push(unselectedMaterial);
        }
        var cubeMaterial = new THREE.MeshFaceMaterial(materials);
        var mesh = new THREE.Mesh(cube, cubeMaterial);

        scene.add(mesh);

        SCENE_RENDERING.drawAxes(scene);

    }

    function update(camera, scene) {
        light.position.copy(camera.position);
        rayCaster.setFromCamera(mouseVector.normalize(), camera);
        var sceneObjects = scene.children;
        var intersects = rayCaster.intersectObjects(sceneObjects, false);
        if (intersects) {
            for (var j = 0; j < sceneObjects.length; j++) {
                if (sceneObjects[j] instanceof THREE.Mesh && sceneObjects[j].material) {
                    sceneObjects[j].material.materials[selectedFaceIndex] = unselectedMaterial;
                }
            }
            for (var i = 0; i < intersects.length; i++) {
                if (intersects[i].face) {
                    //console.log(intersects[i]);
                    selectedFaceIndex = intersects[i].face.materialIndex;
                    intersects[i].object.material.materials[selectedFaceIndex] = selectedMaterial;
                }
            }
        }
    }

    return {
        init: init,
        fill: fill,
        update: update
    }
})();

