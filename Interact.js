function Interact(x, y, m, d, t, s, di, p) {
    if (t) {
        this.home = createVector(random(width), random(height));
    } else {
        this.home = createVector(x, y);
    }
    this.pos = this.home.copy();
    this.target = createVector(x, y);

    if (di == "general") {
        this.vel = createVector();
    } else if (di == "up") {
        this.vel = createVector(0, -y);
    } else if (di == "down") {
        this.vel = createVector(0, y);
    } else if (di == "left") {
        this.vel = createVector(-x, 0);
    } else if (di == "right") {
        this.vel = createVector(x, 0);
    }


    this.acc = createVector();
    this.r = 8;
    this.maxSpeed = m;
    this.maxforce = 1
    this.dia = d
    this.come = s
    this.dir = p
}

Interact.prototype.behaviors = function () {
    let arrive = this.arrive(this.target);
    let mouse = createVector(mouseX, mouseY)
    let flee = this.flee(mouse)

    this.applyForce(arrive)
    this.applyForce(flee)
}

Interact.prototype.applyForce = function (f) {
    this.acc.add(f);

}

Interact.prototype.arrive = function (target) {
    let desired = p5.Vector.sub(target, this.pos)
    let d = desired.mag();
    let speed = this.maxSpeed;
    if (d < this.come) {
        speed = map(d, 0, this.come, 0, this.maxSpeed)

    }
    desired.setMag(speed)
    let steer = p5.Vector.sub(desired, this.vel)
    return steer
}


Interact.prototype.flee = function (target) {
    let desired = p5.Vector.sub(target, this.pos)
    let d = desired.mag()

    if (d < this.dia) {
        desired.setMag(this.maxSpeed)
        desired.mult(this.dir)
        let steer = p5.Vector.sub(desired, this.vel)
        steer.limit(this.maxForce)
        return steer
    } else {
        return createVector(0, 0)
    }

}

Interact.prototype.update = function () {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0)
}

Interact.prototype.show = function () {
    stroke(255)
    strokeWeight(4)
    point(this.pos.x, this.pos.y)
}