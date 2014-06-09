
var Liner = (function () {
    
    // Point object
    function Point () {
        this.x = -1;
        this.y = -1;
        this.pressed = false;
    }

    Point.prototype.distanceTo = function (b) {
        return Math.sqrt((b.x - this.x) * (b.x - this.x) + (b.y - this.y) * (b.y - this.y));
    };

    Point.prototype.render = function (ct) {

        ct.beginPath();
        ct.arc(this.x, this.y, POINT_RADIUS, 0, 2 * Math.PI);

        if (this.pressed) {
            ct.fill();
        } else {
            ct.stroke();
        }
    };

    var canvas = {}, ctx = {},
        vCanvas = {}, vCtx = {},
        screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        pointA = new Point(),
        pointB =  new Point(),
        fingerDown = false,
        finger = new Point(),
        tickInterval = 0;
        
        
    // Macros
    var RENDER_TIMEOUT = 0,
        POINT_RADIUS = Math.min(screenWidth, screenHeight) * 0.1,
        MIN_DISTANCE = POINT_RADIUS * 6;
    
    // Check if finger touches given point
    function fingerInPoint (point) {
        if (finger.x > (point.x - POINT_RADIUS) && finger.x < (point.x + POINT_RADIUS) &&
            finger.y > (point.y - POINT_RADIUS) && finger.y < (point.y + POINT_RADIUS))  {
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
        } 
    }
    
    function onFingerUp (e) {
        fingerDown = false;
    }
    
    function onFingerMove (e) {
        if (e.touches) {
            finger.x = e.touches[0].pageX;
            finger.y = e.touches[0].pageY;
        } else {
            finger.x = e.pageX;
            finger.y = e.pageY;
        }
        
        if (fingerDown) {
            if (fingerInPoint(pointA)) {
                pointA.pressed = true;
            } else if (fingerInPoint(pointB)) {
                pointB.pressed = true;
            }
        
            if (pointA.pressed && pointB.pressed) {
                updatePoints();
            }
        }
        
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
    }
    
    function start () {
        // Bind events
        // Mouse        
        window.addEventListener('mousedown', onFingerDown);
        window.addEventListener('mouseup', onFingerUp);
        window.addEventListener('mousemove', onFingerMove);
       
        // Touch
        window.addEventListener('touchstart', onFingerDown);
        window.addEventListener('touchend', onFingerUp);
        window.addEventListener('touchmove', onFingerMove);
        
        
        // Set interval tick()
        tickInterval = setInterval(tick, RENDER_TIMEOUT);
    }
    
    function tick () {
        update();
        render();
    }
    
    function getRandomPoint (maxWidth, maxHeight) {
        var p = new Point();
        
        p.x = Math.floor(POINT_RADIUS  + Math.random() * (maxWidth - 2 * POINT_RADIUS));
        p.y = Math.floor(POINT_RADIUS  + Math.random() * (maxHeight - 2 * POINT_RADIUS));
        
        return p;
    }
    
    function updatePoints () {
        pointB = pointA;
        do {
            
            pointA = getRandomPoint(screenWidth, screenHeight);
        } while (pointA.distanceTo(pointB) < MIN_DISTANCE);
    }
        
    function update () {
        if (pointA.x === -1 || pointA.y === -1 || pointB.x === -1 || pointB.y === -1)
            updatePoints();
    }
        
    function renderPoints (c) {
        pointA.render(c);
        pointB.render(c);
    }
    
    function renderRay (c) {
        var pressed = pointA.pressed? pointA : pointB;
        
        if (fingerDown) {
           
           c.beginPath();
           c.moveTo(pressed.x, pressed.y);
           c.lineTo(finger.x,finger.y);
           c.lineWidth = POINT_RADIUS / 4;
           c.stroke(); 
        }
        
    }
    function render () {
        // Draw every object in virtual canvas
        vCtx.clearRect(0, 0, screenWidth, screenHeight);
        renderPoints(vCtx);
        renderRay(vCtx);
        
        // Copy virtual to real canvas
        ctx.clearRect(0, 0, screenWidth, screenHeight);
        ctx.drawImage(vCanvas, 0, 0, screenWidth, screenHeight);
    }
    
    return {
        bindCanvas: bindCanvas,
        start: start
    };
    
} ());