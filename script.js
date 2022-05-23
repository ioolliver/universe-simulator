const canvas = document.querySelector('canvas');

const FPS = 60;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const context = canvas.getContext("2d", null);

const AU = 149.6e6 * 1000; // 1 AU =~ 150 BILLIONS KM; * 1000 = CONVERTING KM TO METERS
const G = 6.67428e-11;
var SCALE = 150 / AU; // 1 AU = 100 pixels
var TIMESTEP = 3600 * 24 * 1; // 1 day

class Star {

  constructor({
    name, x, y, radius, color, massInfo, x_vel, y_vel
  }) {

    this.name = name;
    this.x = x || 0;
    this.y = y || 0;
    this.radiusInfo = radius;
    this.radius = radius * (SCALE*2000000);
    this.color = color;

    this.massInfo = massInfo;

    this.mass = this.massInfo[0] * 10**this.massInfo[1];

    this.orbit_line_size = this.radius * 8;

    this.orbit = [];

    this.x_vel = x_vel || 0;
    this.y_vel = y_vel || 0;

    planets.push(this);

  }

  draw() {

    context.beginPath();
    for(let point of this.orbit) {

      context.lineTo(point[0] * SCALE + WIDTH/2 + xVariant, point[1] * SCALE + HEIGHT/2 + yVariant);

    }
    context.strokeStyle = "#fff";
    context.stroke();
    context.closePath();

    let x = this.x * SCALE + WIDTH/2 + xVariant;
    let y = this.y * SCALE + HEIGHT/2 + yVariant;

    context.beginPath();
    context.arc(x, y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();

    context.font = this.radius * 0.8 + "px Arial";
    context.fillStyle = "#fff";
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

  updateRadius() {

    this.radius = this.radiusInfo * (SCALE*2000000);

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

  updateMass(newMassInfo) {

    this.massInfo = newMassInfo;
    this.mass = newMassInfo[0] * 10**newMassInfo[1];

  }

}

const planets = [];

function main() {

  new Star({
    name: 'Sun',
    radius: 20000,
    color: "#ff0",
    massInfo: [1.989, 30]
  });

  new Star({
    name: 'Mercury',
    x: 0.387*AU,
    radius: 2440,
    color: "#e5e5e5",
    massInfo: [3.30, 23],
    y_vel: -47.4 * 1000
  });

  new Star({
    name: 'Venus',
    x: 0.723*AU,
    radius: 6051,
    color: "#a57c1b",
    massInfo: [4.8685, 24],
    y_vel: -35.02 * 1000
  });

  new Star({
    name: 'Earth',
    x: -1*AU,
    radius: 6371,
    color: "#6b93d6",
    massInfo: [5.9742, 24],
    y_vel: 29.783 * 1000
  });

  new Star({
    name: 'Mars',
    x: -1.52*AU,
    radius: 3390,
    color: "#451804",
    massInfo: [6.39, 23],
    y_vel: 24.07 * 1000
  });

  new Star({
    name: 'Jupiter',
    x: -5.2*AU,
    radius: 69911/3,
    color: "#6b93d6",
    massInfo: [1.898, 27],
    y_vel: 13.06 * 1000
  });

  new Star({
    name: 'Saturn',
    x: -9.5*AU,
    radius: 58232/3,
    color: "#ab604a",
    massInfo: [5.683, 26],
    y_vel: 9.68 * 1000
  });

  new Star({
    name: 'Uranus',
    x: -19.8*AU,
    radius: 25362/3,
    color: "#e1eeee",
    massInfo: [8.681, 25],
    y_vel: 6.80 * 1000
  });

  new Star({
    name: 'Neptune',
    x: -30*AU,
    radius: 24622/3,
    color: "#5b5ddf",
    massInfo: [10.024, 26],
    y_vel: 5.43 * 1000
  });

  updateMassInfo();

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

function updatePlanetMass(planetName) {

  let planet = planets.find(p => p.name == planetName);

  if(!planet) return;

  const input1 = document.querySelector(`#${planetName.trim().toLowerCase()}-1`).value;
  const input2 = document.querySelector(`#${planetName.trim().toLowerCase()}-2`).value;

  planet.updateMass([input1, input2]);

}

function updateMassInfo() {

  const list = document.querySelector('ul');

  for(let planet of planets) {

    let node = document.createElement('li');

    node.innerHTML = `
      <h1>${planet.name}</h1>
      <p>
        Mass: 
          <input onchange="updatePlanetMass('${planet.name}')" id="${planet.name.trim().toLowerCase()}-1" style="width: 50px" min="0" value="${planet.massInfo[0]}" max="10" type="number"> 
          * 10^
          <input id="${planet.name.trim().toLowerCase()}-2" onchange="updatePlanetMass('${planet.name}')" min="1" value="${planet.massInfo[1]}" max="50" type="number"> </p>
    `;

    list.appendChild(node)

  }

}

main();

// USER INTERACTION

document.querySelector('#dps').addEventListener('change', (e) => {
  
  const newValue = document.querySelector('#dps').value;

  TIMESTEP = 3600 * 24 * newValue;

});

document.querySelector('#scale').addEventListener('change', (e) => {
  
  const newValue = document.querySelector('#scale').value;

  SCALE = newValue / AU;

  for(let planet of planets) planet.updateRadius();

});

function getMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left - WIDTH/2,
    y: evt.clientY - rect.top - HEIGHT/2
  };
}

var mouseDown = false;

canvas.addEventListener('mousedown', (e) => {
  mouseDown = true;
});

canvas.addEventListener('mouseup', (e) => { mouseDown = false; });

var lastPosition = {x: 0, y: 0};

var xVariant = 0;
var yVariant = 0;

canvas.addEventListener('mousemove', (e) => {

  let mousePos = getMousePos(e);

  if(mouseDown) {

    if(mousePos.x != lastPosition.x) {
      xVariant += mousePos.x - lastPosition.x;
    }
    if(mousePos.y != lastPosition.y) {
      yVariant += mousePos.y - lastPosition.y;
    }

  }

  lastPosition = mousePos;

});

canvas.addEventListener('wheel', (e) => {

  e.preventDefault();

  if(e.deltaY > 0) { // down / zoom-

    let newValue = Number(document.querySelector('#scale').value) - 10;

    if(newValue <= 0) newValue = 1;

    document.querySelector('#scale').value = newValue;

    SCALE = newValue / AU;

    for(let planet of planets) planet.updateRadius();

  }else {

    let newValue = Number(document.querySelector('#scale').value) + 10;

    document.querySelector('#scale').value = newValue;

    SCALE = newValue / AU;

    for(let planet of planets) planet.updateRadius();

  }

});