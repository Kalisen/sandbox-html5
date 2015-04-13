var SCENE_RENDERING = (function () {

    var camera, scene, renderer;
    var cameraControls;
    var clock = new THREE.Clock();
    var sceneFiller;
    var sceneUpdater;
    var showHelpers;

    function create(_sceneFiller, _sceneUpdater, _showHelpers, cameraPosition) {
        sceneFiller = _sceneFiller;
        sceneUpdater = _sceneUpdater;
        showHelpers = _showHelpers;
        try {
            init(cameraPosition);
            fillScene();
            addToDOM();
            animate();
        } catch (e) {
            alert(e + "\n" + e.stack);
            var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
            $('#container').append(errorReport + e);
        }
    }

    function init(cameraPosition) {
        var canvasWidth = window.innerWidth;
        var canvasHeight = window.innerHeight;

        // RENDERER
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.setSize(canvasWidth, canvasHeight);
        renderer.setClearColor(0xAAAAAA, 1.0);

        // CAMERA
        var viewSize = 900;
        // aspect ratio of width of window divided by height of window
        var aspectRatio = canvasWidth / canvasHeight;
        // OrthographicCamera( left, right, top, bottom, near, far )
        //    camera = new THREE.OrthographicCamera(
        //            -aspectRatio*viewSize / 2, aspectRatio*viewSize / 2,
        //            viewSize / 2, -viewSize / 2,
        //        0, 10000 );
        //    camera.position.set( -890, 600, -480 );

        camera = new THREE.PerspectiveCamera(45, aspectRatio, 10, -viewSize / 2, 0, 10000);
        var position = cameraPosition || new THREE.Vector3(-890, 600, -480);
        camera.position.set(position.x, position.y, position.z);

        // CONTROLS
        cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);

        // Student: set the target for the camera.
        // The last known position of the drinking bird is x: -2800, y: 360, z: -1600
        cameraControls.target = new THREE.Vector3(0, 0, 0);

    }

    function fillScene() {
        scene = new THREE.Scene();

        if (sceneFiller) {
            sceneFiller.fill(scene);
        }

        if (showHelpers) {
            drawGround(scene);
        }

        scene.add(camera);

    }

    function drawGround(scene) {
        var groundMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            ambient: 0xFFFFFF,
            emissive: 0xFFFFFF,
            opacity: 0.5
        });

        var groundGeo = new THREE.PlaneGeometry(1000, 1000);
        var ground = new THREE.Mesh(groundGeo, groundMaterial, 1000, 1000);
        ground.rotation.x = -Math.PI / 2;
        ground.position.x = 0;
        ground.position.y = -1000;
        ground.position.z = 0;

        scene.add(ground);
    }

    function drawAxes(scene) {
        var lineMaterial = new THREE.LineBasicMaterial();
        lineMaterial.color.setRGB(31 / 255, 86 / 255, 169 / 255);
        lineMaterial.lineWidth = 1;

        var redLineMaterial = lineMaterial.clone();
        redLineMaterial.color.setRGB(255, 0, 0);

        var greenLineMaterial = lineMaterial.clone();
        greenLineMaterial.color.setRGB(0, 255, 0);

        var xAxisGeo = new THREE.Geometry();
        xAxisGeo.vertices.push(new THREE.Vector3(0, 0, 0));
        xAxisGeo.vertices.push(new THREE.Vector3(100, 0, 0));
        var xAxis = new THREE.Line(xAxisGeo, greenLineMaterial);

        scene.add(xAxis);

        var yAxisGeo = new THREE.Geometry();
        yAxisGeo.vertices.push(new THREE.Vector3(0, 0, 0));
        yAxisGeo.vertices.push(new THREE.Vector3(0, 100, 0));
        var yAxis = new THREE.Line(yAxisGeo, redLineMaterial);

        scene.add(yAxis);

        var zAxisGeo = new THREE.Geometry();
        zAxisGeo.vertices.push(new THREE.Vector3(0, 0, 0));
        zAxisGeo.vertices.push(new THREE.Vector3(0, 0, 100));
        var zAxis = new THREE.Line(zAxisGeo, lineMaterial);

        scene.add(zAxis);
    }

    function addToDOM() {
        var container = document.getElementById('container');
        var canvas = container.getElementsByTagName('canvas');
        if (canvas.length > 0) {
            container.removeChild(canvas[0]);
        }
        container.appendChild(renderer.domElement);
    }

    function animate() {
        window.requestAnimationFrame(animate);
        render();
    }

    function render() {

        var delta = clock.getDelta();
        cameraControls.update(delta);

        sceneUpdater.update(camera, scene, renderer);

        renderer.render(scene, camera);
    }

    function getCamera() {
        return camera;
    }

    function getScene() {
        return scene;
    }

    return {
        create: create,
        drawAxes: drawAxes,
        drawGround: drawGround,
        camera: getCamera,
        scene: getScene
    }
})();