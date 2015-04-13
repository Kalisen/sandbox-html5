var SCENE_RENDERING = (function() {

    var camera, scene, renderer;
    var cameraControls;
    var clock = new THREE.Clock();
    var sceneFiller;
    var sceneUpdater;
    var showHelpers;

    function create(_sceneFiller, _sceneUpdater, _showHelpers) {
        sceneFiller = _sceneFiller;
        sceneUpdater = _sceneUpdater;
        showHelpers = _showHelpers;
        try {
            init();
            fillScene();
            addToDOM();
            animate();
        } catch (e) {
            alert(e + "\n" + e.stack);
            var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
            $('#container').append(errorReport + e);
        }
    }

    function init() {
        var canvasWidth = window.innerWidth;
        var canvasHeight = window.innerHeight;

        // RENDERER
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.setSize(canvasWidth, canvasHeight);
        renderer.setClearColorHex(0xAAAAAA, 1.0);

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
        camera.position.set(-890, 600, -480);

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
            drawHelpers();
        }

        scene.add(camera);
    }

    function drawHelpers() {
        Coordinates.drawGround({size: 10000});
        Coordinates.drawGrid({size: 10000, scale: 0.01});
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

        sceneUpdater.update(camera);

        renderer.render(scene, camera);
    }

    return {
        create: create
    }
})();