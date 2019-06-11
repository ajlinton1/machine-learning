var bag_size = 600;
var width = 4;
var left = 75;
var right = left + bag_size;
var up = 25;
var down = up + bag_size;

function Particle(x, y, id, index) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.index = index;
}

var particles = [];

function init() {
    var x = left + 0.5 * bag_size + Math.random();
    var y = up + 0.5 * bag_size + Math.random();
    var index = particles.length;
    id = setInterval(function() {
        update(index);
    }, 150);
    var particle = new Particle(x, y, id, index);
    particles.push(particle);
    document.getElementById("demo").innerHTML = "Added new particle: " + index;
}

function update(index) {
    var particle = particles[index];
    move(particle);
    draw(particle);
    if (!in_bag(particle, left, right, up, down)) {
        document.getElementById("demo").innerHTML = "Success for particle " + index;
        clearInterval(particle.id);
    }
}

function distance_index(distance, index) {
    this.distance = distance;
    this.index = index;
}

function euclidean_distance(item, neighbor) {
    return Math.sqrt(Math.pow(item.x - neighbor.x, 2)) + Math.pow(item.y - neighbor.y, 2);
}

function knn(items, index, k) {
    var results = [];
    var item = items[index];
    for (var i = 0; i < items.length; i++) {
        if (i != index) {
            var neighbor = items[i];
            var distance = euclidean_distance(item, neighbor);
            results.push(new distance_index(distance, i));
        }
    }
    results.sort(function(a,b) {
        return a.distance - b.distance;
    });
    var top_k = Math.min(k, results.length);
    return results.slice(0, top_k);
}

function move(particle) {
    particle.x += 5 * (Math.random() - 0.5);
    particle.y += 5 * (Math.random() - 0.5);
    var k = Math.min(5, particles.length - 1);
    var items = knn(particles, particle.index, k);
    var x_step = nudge(items, particles, "x");
    particle.x += (x_step - particle.x) * (Math.random() - 0.5);
    var y_step = nudge(items, particles, "y");
    particle.y += (y_step - particle.y) * (Math.random() - 0.5);
}

function nudge(neighbors, positions, property) {
    if (neighbors.length ===0 ) {
        return 0;
    }
    var sum = neighbors.reduce(function(sum, item) {
        return sum + positions[item.index][property];
    }, 0);
    return sum/neighbors.length;
}

function draw(particle) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#E0B044";
    bag_left = c.width/3;
    bag_top = c.height/3;
    ctx.fillRect(bag_left, bag_top, c.width/3, c.height/3);
    ctx.beginPath();
    ctx.rect(particle.x, particle.y, 4, 4);
    ctx.strokeStyle = "black";
    ctx.stroke();

    return in_bag(particle,
        bag_left, bag_left + c.width/3,
        bag_top, bag_top + c.height/3);
}

function in_bag(particle, left, right, top, bottom) {
    return (particle.x > left) && (particle.x < right)
        && (particle.y > top) && (particle.y < bottom);
}
