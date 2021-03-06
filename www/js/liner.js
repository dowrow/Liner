// Liner
// Simple yet addictive geometric game
// Diego Castaño (Dowrow) 06-2014

// Requires audio and point modules
define(['audio', 'point'], function (audio) {
    
    // DOM referenecs
    var canvas = {}, ctx = {},
        vCanvas = {}, vCtx = {},
        screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        
    // Macros
        POINT_RADIUS = Math.min(screenWidth, screenHeight) * 0.1,
        MIN_DISTANCE = POINT_RADIUS * 6,
        HALO_SPEED = 0.2,
        INITIAL_TIME = 30000, // In milliseconds
    
    // Private variables
        pointA = new Point(POINT_RADIUS),
        pointB = new Point(POINT_RADIUS),
        pointC = new Point(POINT_RADIUS),
        fingerDown = false,
        finger = new Point(),
        halo = [new Point(), new Point()],
        haloStep = 0,
        activeHalo = false,
        score = 0,
        last = 0,
        now = 0,
        delta = 1,
        failed = false,
        failStep = 0,
        collision = new Point(),
        time = 0,
        timerInterval = -1;
    
    // Check if finger touches given point
    function fingerInPoint (point) {
        if (finger.x > (point.x - point.radius) && finger.x < (point.x + point.radius) &&
            finger.y > (point.y - point.radius) && finger.y < (point.y + point.radius))  {
            return true;
        } 
        return false;
    }
    
    // Event callbacks
    function onFingerDown (e) {
        fingerDown = true;
        onFingerMove(e);
        if (fingerInPoint(pointA)) {
            pointA.pressed = true;
        } else if (fingerInPoint(pointB)) {
            pointB.pressed = true;
        } else if (fingerInPoint(pointC)) {
            pointC.pressed = true;
        }
    }
    
    function onFingerUp (e) {
        fingerDown = false;
        pointA.pressed = false;
        pointB.pressed = false;
        pointC.pressed = false;
    }
    
    // Segment collision detection: http://stackoverflow.com/questions/3838329/how-can-i-check-if-two-segments-intersect
    function ccw (a, b, c) {
        return ((c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x));
    }
    
    function intersect (segment1, segment2) {
        var a = segment1[0],
            b = segment1[1],
            c = segment2[0],
            d = segment2[1];
        return (ccw(a, c, d) != ccw(b, c, d) && ccw(a, b, c) != ccw(a, b, d));
    }
    
    function onFingerMove (e) {
       
        // Update finger position
        if (e.touches) {
            finger.x = e.touches[0].pageX;
            finger.y = e.touches[0].pageY;
        } else {
            finger.x = e.pageX;
            finger.y = e.pageY;
        }
        
        // Press points
        if (fingerDown) {
            if (fingerInPoint(pointA) && !pointA.pressed) {
                pointA.pressed = true;
                audio.playClick();
                // Start counting!!
                timerInterval = setInterval(timer, 10);
            } else if (fingerInPoint(pointB) && pointA.pressed && !pointB.pressed) {
                pointB.pressed = true;
                audio.playClack();
            } else if (fingerInPoint(pointC) && pointB.pressed && !pointC.pressed) {
                pointC.pressed = true;
                audio.playClack();
                score++; // WIN A POINT
            }
            
            // Make halo active when 3 points are pressed
            if (pointA.pressed && pointB.pressed && pointC.pressed) {
                halo[0].x = pointA.x;
                halo[0].y = pointA.y;
                halo[1].x = pointB.x;
                halo[1].y = pointB.y;
                haloStep = 0;
                activeHalo = true;
                updatePoints();
            }
        }
        
        // Detect collision with halo
        if (activeHalo) {
            var ray = [pointB, finger];
            if (intersect(halo, ray)) {
                onCollision();
            }
        }
        
    }
    
    function onCollision () {
        audio.playFail();
                
        // Stop rendering halo
        activeHalo = false;
        
        // Un press everything
        pointA.pressed = false;
        pointB.pressed = false;
        pointC.pressed = false;
        
        // Render fail
        collision.x = finger.x;
        collision.y = finger.y;
        failed = true;
        
        // You loose everything
        score = 0;
    }
        
    function bindCanvas (id) {
        // Get canvas
        canvas = document.getElementById(id);
        vCanvas = document.createElement('canvas');
        // Set size and style
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        canvas.style.position = 'relative';
        canvas.style.left = '0';
        canvas.style.top  = '0';
        canvas.style.width = screenWidth + 'px';
        canvas.style.height = screenHeight + 'px';
        vCanvas.width = screenWidth;
        vCanvas.height = screenHeight;
        vCanvas.style.position = 'relative';
        vCanvas.style.left = '0';
        vCanvas.style.top  = '0';
        vCanvas.style.width = screenWidth + 'px';
        vCanvas.style.height = screenHeight + 'px';
        // Get context
        ctx = canvas.getContext('2d');
        vCtx = vCanvas.getContext('2d');
        vCtx.lineWidth = POINT_RADIUS / 4;
    }
    
    function bindEvents () {
        // Mouse        
        window.addEventListener('mousedown', onFingerDown);
        window.addEventListener('mouseup', onFingerUp);
        window.addEventListener('mousemove', onFingerMove);
       
        // Touch
        window.addEventListener('touchstart', onFingerDown);
        window.addEventListener('touchend', onFingerUp);
        window.addEventListener('touchmove', onFingerMove);
    }
    
    function start () {
        // Bind events
        bindEvents();
        // Start running game clock 
        clock();
        // Reset timer
        time = INITIAL_TIME;

    }
    
    function timer () {
        if (time > 0) {
            time -= 10;
        } else {
            alert('YOU SCORED ' + score + ' POINTS');
            clearInterval(timerInterval);
        }
    }
    
    function clock () {
        tick();
        requestAnimationFrame(clock);
    }
    
    function tick () {
        now = new Date();
        delta = now - last;
        update();
        render();
        last = now;
    }
    
    function getRandomPoint (maxWidth, maxHeight) {
        var p = new Point(POINT_RADIUS),
            scoreMargin = Math.min(screenHeight, screenWidth) * 0.1;
        
        p.x = Math.floor(POINT_RADIUS + Math.random() * (maxWidth - 2 * POINT_RADIUS));
        p.y = Math.floor(scoreMargin + POINT_RADIUS + Math.random() * (maxHeight - 2 * POINT_RADIUS - scoreMargin   ));
        
        return p;
    }
    
    function updatePoints () {
        
        pointA = pointB;
        pointB = pointC;
        
        do {
            pointC = getRandomPoint(screenWidth, screenHeight);
        } while ((pointC.distanceTo(pointB) < MIN_DISTANCE) || (pointC.distanceTo(pointA) < MIN_DISTANCE));
    }
    
    function updateFail () {
        
        if (!failed)
            return;
        
        if (failStep < 100) {
            failStep+=10;
            return;
        }
        
        failStep = 0;
        failed = false;
        
    }
    
    function update () {
        if (pointA.x === -1 || pointA.y === -1 || pointB.x === -1 || pointB.y === -1)
            updatePoints();
        
        if (activeHalo) {
            for (var i = 0; i < delta; i++) {
                haloStep += HALO_SPEED;
            }
            if (haloStep > 100) {
                activeHalo = false;
            }
        }
        
        if (failed) {
            updateFail ();
        }
    }
        
    function renderPoints (c) {
        
        pointA.render(c);
        
        if (pointA.pressed)
            pointB.render(c);
        
        if (pointB.pressed)
            pointC.render(c);
    }
    
    function renderRays (c) {
        
        if (!fingerDown)
            return;
        
        // One pressed
        if (pointA.pressed && !pointB.pressed) {
            
            // Ray from a to finger
            c.beginPath();
            c.moveTo(pointA.x, pointA.y);
            c.lineTo(finger.x, finger.y);
            c.stroke(); 
            
        // Two pressed
        } else if (pointA.pressed && pointB.pressed) {
            
            // One ray from a to b
            c.beginPath();
            c.moveTo(pointA.x, pointA.y);
            c.lineTo(pointB.x, pointB.y);
            c.stroke(); 
            
            // Ray from b to pointer
            c.beginPath();
            c.moveTo(pointB.x, pointB.y);
            c.lineTo(finger.x, finger.y);
            c.stroke(); 
            
        }
        
    }
    
    function renderHalo (c) {
        
        if (!activeHalo) {
            return;
        }
        
        var oldStyle = c.strokeStyle;
        c.strokeStyle = 'rgba(255,0,0,' + (1 - (haloStep / 100)) +')';
        c.beginPath();
        c.moveTo(halo[0].x, halo[0].y);
        c.lineTo(halo[1].x, halo[1].y);
        c.stroke(); 
        c.strokeStyle = oldStyle;
        
    }
    
    function renderFail (c) {
        if (failed) {
            // Red bg
            var oldF = c.fillStyle;
            c.fillStyle = 'red';
            c.fillRect(0, 0, screenWidth, screenHeight);
            
            // White halo
            var oldStyle = c.strokeStyle;
            c.strokeStyle = 'white';
            c.beginPath();
            c.moveTo(halo[0].x, halo[0].y);
            c.lineTo(halo[1].x, halo[1].y);
            c.stroke(); 
            c.strokeStyle = oldStyle;
            c.fillStyle = oldF;
        }
    }
    
    // Draw score in top left corner (10% top)
    function renderScore (c) {
        var fontSize = Math.min(screenHeight, screenWidth) * 0.05;
        c.font = fontSize +  'px Helvetica, Arial, sans-serif';
        c.fillText('Score: ' + score, fontSize * 0.5, fontSize);
    }
    
    // Draw remaining seconds in top right corner (10%top)
    function renderTime (c) {
        var fontSize = Math.min(screenHeight, screenWidth) * 0.05;
        c.font = fontSize +  'px Helvetica, Arial, sans-serif';
        c.fillText('Time: ' + Math.floor(time/1000) + ':' + (time % 1000), screenWidth - fontSize * 6, fontSize);
    } 
    
    function render () {
        // Draw every object in virtual canvas
        vCtx.clearRect(0, 0, screenWidth, screenHeight);
        renderTime(vCtx);
        renderHalo(vCtx);
        renderPoints(vCtx);
        renderRays(vCtx);
        renderScore(vCtx);
        renderFail(vCtx);
        
        // Copy virtual to real canvas
        ctx.clearRect(0, 0, screenWidth, screenHeight);
        ctx.drawImage(vCanvas, 0, 0, screenWidth, screenHeight);
    }
    
    return {
        bindCanvas: bindCanvas,
        start: start
    };
});

