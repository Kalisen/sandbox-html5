var cats = {};

//Leap.loop(function (frame) {
//    frame.hands.forEach(function (hand, index) {
//        var cat = cats[index] || (cats[index] = new Cat());
//        cat.setTransform(hand.screenPosition(), hand.roll());
//    })
//}).use('screenPosition', {scale: 0.25});

// alternative to the loop, more appropriate for integration within an existing loop?
//var controller = new Leap.Controller({enableGestures: true})
//    .use('screenPosition', {scale: 0.25})
//    .connect()
//    .on('frame', function(frame){
//        // Try making some circles
//        frame.hands.forEach(function (hand, index) {
//            var cat = cats[index] || (cats[index] = new Cat());
//            cat.setTransform(hand.screenPosition(), hand.roll());
//        })
//    });

var controller = new Leap.Controller({enableGestures: true})
    .use('boneHand', {
        scale: 0.25
    })
    .connect()
    .on('frame', function (frame) {
        // Try making some circles
        frame.hands.forEach(function (hand, index) {
            var cat = cats[index] || (cats[index] = new Cat());
            cat.setTransform(hand.screenPosition(), hand.roll());
        })
    });

var Cat = function () {
    var cat = this;
    var img = document.createElement('img');
    img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/109794/cat_2.png';
    img.style.position = 'absolute';
    img.onload = function () {
        cat.setTransform([window.innerWidth / 2, window / innerHeight / 2], 0);
        document.body.appendChild(img);
    };

    cat.setTransform = function (position, rotation) {
        img.style.left = position[0] - img.width / 2 + 'px';
        img.style.top = position[1] - img.height / 2 + 'px';
        img.style.transform = 'rotate(' + -rotation + 'rad)';

        // compatibility
        img.style.webkitTransform =
            img.style.MozTransform =
                img.style.msTransform =
                    img.style.OTransform =
                        img.style.transform;
    };
};

cats[0] = new Cat();

// to be active even when not focused
Leap.loopController.setBackground(true);