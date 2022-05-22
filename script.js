const canvas = document.querySelector('canvas');

const FPS = 60;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const context = canvas.getContext("2d", null);

const AU = 149.6e6 * 1000; // 1 AU =~ 150 BILLIONS KM; * 1000 = CONVERTING KM TO METERS
const G = 6.67428e-11;
const SCALE = 300 / AU; // 1 AU = 100 pixels
var TIMESTEP = 3600 * 24 * 1; // 1 day

class Star {

  constructor({
    name, x, y, radius, color, mass, x_vel, y_vel, orbit_line_size
  }) {

    this.name = name;
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius;
    this.color = color;
    this.mass = mass;
    this.orbit_line_size = orbit_line_size || 100;

    this.orbit = [];

    this.x_vel = x_vel || 0;
    this.y_vel = y_vel || 0;

    planets.push(this);

  }

  draw() {

    context.beginPath();
    for(let point of this.orbit) {

      context.lineTo(point[0] * SCALE + WIDTH/2, point[1] * SCALE + HEIGHT/2);

    }
    context.strokeStyle = "#fff";
    context.stroke();
    context.closePath();

    let x = this.x * SCALE + WIDTH/2;
    let y = this.y * SCALE + HEIGHT/2;

    context.beginPath();
    context.arc(x, y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();

    context.font = this.radius * 0.8 + "px Arial";
    context.fillText(this.name, x - this.radius * 0.6, y - this.radius*1.3);

  }

  attraction(other) {
    const otherX = other.x;
    const otherY = other.y;
  
    const distanceX = otherX - this.x;
    const distanceY = otherY - this.y;
    const distance = Math.sqrt(distanceX**2 + distanceY**2)

    const force = G * this.mass * other.mass / distance**2;
    const theta = Math.atan2(distanceY, distanceX);
    const forceX = Math.cos(theta) * force;
    const forceY = Math.sin(theta) * force;

    return [forceX, forceY]

  }

  updatePosition() {

    let total_fx = 0;
    let total_fy = 0;

    for(let planet of planets) {

      if(planet == this) continue;

      let att = this.attraction(planet);

      let fx = att[0];
      let fy = att[1];
      total_fx += fx;
      total_fy += fy;

    }

    this.x_vel += total_fx / this.mass * TIMESTEP;
    this.y_vel += total_fy / this.mass * TIMESTEP;

    this.x += this.x_vel * TIMESTEP;
    this.y += this.y_vel * TIMESTEP;

    if(this.orbit.length > this.orbit_line_size) this.orbit.shift();
    this.orbit.push([this.x, this.y]);

  }

}

const planets = [];

function main() {

  new Star({
    name: 'Sun',
    radius: 40,
    color: "#ff0",
    mass: 1.989 * 10**30
  });

  new Star({
    name: 'Mercury',
    x: 0.387*AU,
    radius: 7,
    color: "#e5e5e5",
    mass: 3.30 * 10**23,
    y_vel: -47.4 * 1000,
    orbit_line_size: 30
  });

  new Star({
    name: 'Venus',
    x: 0.723*AU,
    radius: 14,
    color: "#a57c1b",
    mass: 4.8685 * 10**24,
    y_vel: -35.02 * 1000
  });

  new Star({
    name: 'Earth',
    x: -1*AU,
    radius: 16,
    color: "#6b93d6",
    mass: 5.9742 * 10**24,
    y_vel: 29.783 * 1000
  });

  controlFramerate();
}

function loop() {
  
  context.clearRect(0, 0, WIDTH, HEIGHT);

  for(let planet of planets) {

    planet.updatePosition();
    planet.draw();

  }

}

function controlFramerate() {

  requestAnimationFrame(loop);

  setTimeout(controlFramerate, 1000 / FPS);

}

main();

// USER INTERACTION

document.querySelector('#dps').addEventListener('change', (e) => {
  
  const newValue = document.querySelector('#dps').value;

  TIMESTEP = 3600 * 24 * newValue;

});