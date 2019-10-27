/*
Frozen brush

Makes use of a delaunay algorithm to create crystal-like shapes.
I did NOT develop delaunay.js, and not sure who the author really is to give proper credit.

Controls:
	- Drag the mouse.
    - Press any key to toggle between fill and stroke.

Inspired by:
	Makio135's sketch www.openprocessing.org/sketch/385808

Author:
  Jason Labbe

Site:
  jasonlabbe3d.com
*/
import p5 from 'p5';
import Delaunay from './delaunay';

export default function frozenBrush(p) {
  var allParticles = [];
  var maxLevel = 5;
  var useFill = false;

  var data = [];

  // Moves to a random direction and comes to a stop.
  // Spawns other particles within its lifetime.
  function Particle(x, y, level) {
    this.level = level;
    this.life = 0;

    this.pos = new p5.Vector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(p.map(this.level, 0, maxLevel, 5, 2));

    this.move = function() {
      this.life++;

      // Add friction.
      this.vel.mult(0.9);

      this.pos.add(this.vel);

      // Spawn a new particle if conditions are met.
      if (this.life % 10 == 0) {
        if (this.level > 0) {
          this.level -= 1;
          var newParticle = new Particle(
            this.pos.x,
            this.pos.y,
            this.level - 1
          );
          allParticles.push(newParticle);
        }
      }
    };
  }

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);

    p.colorMode(p.HSB, 360);

    p.background(0);
  };

  p.draw = function() {
    // Create fade effect.
    p.noStroke();
    p.fill(0, 30);
    p.rect(0, 0, p.width, p.height);

    // Move and spawn particles.
    // Remove any that is below the velocity threshold.
    for (var i = allParticles.length - 1; i > -1; i--) {
      allParticles[i].move();

      if (allParticles[i].vel.mag() < 0.01) {
        allParticles.splice(i, 1);
      }
    }

    if (allParticles.length > 0) {
      // Run script to get points to create triangles with.
      data = Delaunay.triangulate(
        allParticles.map(function(pt) {
          return [pt.pos.x, pt.pos.y];
        })
      );

      p.strokeWeight(0.1);

      // Display triangles individually.
      for (var i = 0; i < data.length; i += 3) {
        // Collect particles that make this triangle.
        var p1 = allParticles[data[i]];
        var p2 = allParticles[data[i + 1]];
        var p3 = allParticles[data[i + 2]];

        // Don't draw triangle if its area is too big.
        var distThresh = 75;

        if (p.dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) > distThresh) {
          continue;
        }

        if (p.dist(p2.pos.x, p2.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
          continue;
        }

        if (p.dist(p1.pos.x, p1.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
          continue;
        }

        // Base its hue by the particle's life.
        if (useFill) {
          p.noStroke();
          p.fill(165 + p1.life * 1.5, 360, 360);
        } else {
          p.noFill();
          p.stroke(165 + p1.life * 1.5, 360, 360);
        }

        p.triangle(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y, p3.pos.x, p3.pos.y);
      }
    }
  };

  p.mouseDragged = function() {
    allParticles.push(new Particle(p.mouseX, p.mouseY, maxLevel));
  };

  p.keyPressed = function() {
    useFill = !useFill;
  };
}
