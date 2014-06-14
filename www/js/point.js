// Point object

function Point (r) {
    this.x = -1;
    this.y = -1;
    this.pressed = false;
    this.radius = r || 1; 
}

Point.prototype.distanceTo = function (b) {
    return Math.sqrt((b.x - this.x) * (b.x - this.x) + (b.y - this.y) * (b.y - this.y));
};

Point.prototype.render = function (ct) {

    ct.beginPath();
    ct.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

    if (this.pressed) {
        ct.fill();
    } else {
        ct.stroke();
    }
};
