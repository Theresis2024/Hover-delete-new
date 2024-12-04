let font;
let tSize = 120; // Increased font size by 1.2x
let pointCount = 0.3; // Density of particles

let speed = 60; // Speed of the particles
let comebackSpeed = 400; // Speed of returning to original position
let dia = 100; // Diameter of interaction
let randomPos = true; // Starting point
let pointsDirection = "right";
let interactionDirection = -1; // -1 or 1

let textPoints = [];
let messagePoints = [];
let words = ["Home", "My Works", "See Related", "Return"];
let currentWordIndex = 0; // Index to track the current word
let boatY = 0;
let boatWaveSpeed = 0.03;

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Fullscreen canvas
  textFont(font);
  generateParticles(words[currentWordIndex]);
  generateMessageParticles("Hover over the letters to delete them");

  // Set the color mode to HSB
  colorMode(HSB, 360, 100, 100);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Resize canvas on window resize
  generateParticles(words[currentWordIndex]); // Regenerate particles
}

function draw() {
  // Dynamic background color in HSB (Hue changes with each new word)
  background((currentWordIndex * 90) % 360, 20, 100);

  // If all text particles are deleted, switch to the next word
  if (textPoints.length === 0 && messagePoints.length === 0) {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    generateParticles(words[currentWordIndex]);
    generateMessageParticles("Hover over the letters to delete them");
  }

  // Draw and update text particles
  for (let i = textPoints.length - 1; i >= 0; i--) {
    let v = textPoints[i];
    if (v.isHovered()) {
      textPoints.splice(i, 3); // Delete multiple particles for a stronger effect
    } else {
      v.update();
      v.show();
      v.behaviors();
    }
  }

  // Draw and update message particles
  for (let i = messagePoints.length - 1; i >= 0; i--) {
    let v = messagePoints[i];
    if (v.isHovered()) {
      messagePoints.splice(i, 3); // Delete multiple particles for a stronger effect
    } else {
      v.update();
      v.show();
      v.behaviors();
    }
  }

  drawBoatAndWaves(); // Draw the boat and waves
}

function generateParticles(word) {
  textPoints = [];
  let tposX, tposY;

  // Determine the position based on the word
  if (word === "Home" || word === "Return") {
    tposX = 50; // Upper left corner X
    tposY = 150; // Upper left corner Y
  } else {
    let bounds = font.textBounds(word, 0, 0, tSize);
    tposX = width - bounds.w - 50; // Upper right corner X
    tposY = 150; // Upper right corner Y
  }

  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function generateMessageParticles(message) {
  messagePoints = [];
  let msgX = (width - font.textBounds(message, 0, 0, tSize / 2.5).w) / 2;
  let msgY = height / 2 + 50; // Position below the main text

  let points = font.textToPoints(message, msgX, msgY, tSize / 2.5, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let messagePoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    messagePoints.push(messagePoint);
  }
}

function drawBoatAndWaves() {
  let centerX = width / 2;
  let centerY = height / 2 + 150;

  // Update the boat's Y position to simulate floating
  boatY = sin(frameCount * boatWaveSpeed) * 10;

  // Draw waves
  stroke(0, 0, 40);
  strokeWeight(2);
  for (let x = 0; x < width; x += 20) {
    let waveY = centerY + sin(x * 0.05 + frameCount * 0.1) * 10;
    line(x, waveY, x + 20, waveY);
  }

  // Draw boat
  fill(0, 0, 20);
  noStroke();
  push();
  translate(centerX, centerY + boatY);

  // Hull of the boat
  beginShape();
  vertex(-50, 0);
  vertex(50, 0);
  vertex(30, 20);
  vertex(-30, 20);
  endShape(CLOSE);

  // Mast
  stroke(0, 0, 20);
  strokeWeight(4);
  line(0, 0, 0, -50);

  // Sail
  noStroke();
  fill(200, 10, 80); // Light-colored sail
  triangle(0, -50, 40, 0, 0, 0);

  pop();
}

function Interact(x, y, m, d, t, s, di, p) {
  if (t) {
    this.home = createVector(random(width), random(height));
  } else {
    this.home = createVector(x, y);
  }
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  this.vel = createVector(x, 0);
  this.acc = createVector();
  this.r = 20; // Radius of interaction for hover
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  stroke(0, 0, 20); // Dark grey
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};

Interact.prototype.isHovered = function () {
  let mouse = createVector(mouseX, mouseY);
  let d = p5.Vector.dist(this.pos, mouse);
  return d < this.r * 2;
};
