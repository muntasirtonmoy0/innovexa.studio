/* =========================================================
   INNOVEXA STUDIO - 3D FLOATING ISOMETRIC CUBES CANVAS
   Interactive with Mouse Hover & Mobile Touch
   ========================================================= */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let cubes = [];

// Mouse & Touch Tracking State
const pointer = {
  x: -9999,
  y: -9999,
  targetRadius: 160,
  isActive: false
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
  resize();
  initCubes();
});
resize();

// Track mouse position
window.addEventListener('mousemove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.isActive = true;
});

window.addEventListener('mouseleave', () => {
  pointer.x = -9999;
  pointer.y = -9999;
  pointer.isActive = false;
});

// Mobile Touch Interaction
window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    pointer.x = e.touches[0].clientX;
    pointer.y = e.touches[0].clientY;
    pointer.isActive = true;
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    pointer.x = e.touches[0].clientX;
    pointer.y = e.touches[0].clientY;
    pointer.isActive = true;
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  pointer.x = -9999;
  pointer.y = -9999;
  pointer.isActive = false;
});

// 3D Cube Class
class FloatingCube {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.size = Math.random() * 22 + 14; // Cube side length
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : height + this.size * 2;
    
    // Smooth natural floating velocities
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = -(Math.random() * 0.55 + 0.25); // Float upwards
    
    // Current interactive offset velocities (repulsion pushback)
    this.pushVx = 0;
    this.pushVy = 0;

    // 3D Angles and rotation speeds
    this.angleX = Math.random() * Math.PI * 2;
    this.angleY = Math.random() * Math.PI * 2;
    this.angleZ = Math.random() * Math.PI * 2;
    this.rotSpeedX = (Math.random() - 0.5) * 0.015;
    this.rotSpeedY = (Math.random() - 0.5) * 0.015;
    this.rotSpeedZ = (Math.random() - 0.5) * 0.015;

    // Palette: Alternate between Neon Cyan and Studio Indigo/Purple
    this.isCyan = Math.random() > 0.4;
    this.baseAlpha = Math.random() * 0.35 + 0.2;
  }

  update() {
    // 1. Natural drift
    this.x += this.vx + this.pushVx;
    this.y += this.vy + this.pushVy;

    // 2. Physics damping on pointer push
    this.pushVx *= 0.92;
    this.pushVy *= 0.92;

    // 3. Continuous 3D rotation
    this.angleX += this.rotSpeedX;
    this.angleY += this.rotSpeedY;
    this.angleZ += this.rotSpeedZ;

    // 4. Cursor / Touch deflection
    if (pointer.isActive) {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const dist = Math.hypot(dx, dy);

      if (dist < pointer.targetRadius && dist > 0) {
        const force = (pointer.targetRadius - dist) / pointer.targetRadius;
        const angle = Math.atan2(dy, dx);
        
        // Push cubes gently away from cursor/finger
        this.pushVx += Math.cos(angle) * force * 2.2;
        this.pushVy += Math.sin(angle) * force * 2.2;
        
        // Spin faster when interacting
        this.angleX += force * 0.04;
        this.angleY += force * 0.04;
      }
    }

    // Wrap around screen boundaries
    if (this.y < -this.size * 3) {
      this.reset(false);
    }
    if (this.x < -this.size * 2) this.x = width + this.size;
    if (this.x > width + this.size * 2) this.x = -this.size;
  }

  // 3D Isometric projection math
  draw() {
    const s = this.size / 2;
    
    // Define 8 vertices of cube in local 3D space
    const vertices = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s],  [s, -s, s],  [s, s, s],  [-s, s, s]
    ];

    // Euler rotation matrices
    const cosX = Math.cos(this.angleX), sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY), sinY = Math.sin(this.angleY);
    const cosZ = Math.cos(this.angleZ), sinZ = Math.sin(this.angleZ);

    const projected = vertices.map(([x, y, z]) => {
      // Rotate around X
      let y1 = y * cosX - z * sinX;
      let z1 = y * sinX + z * cosX;
      // Rotate around Y
      let x2 = x * cosY + z1 * sinY;
      let z2 = -x * sinY + z1 * cosY;
      // Rotate around Z
      let x3 = x2 * cosZ - y1 * sinZ;
      let y3 = x2 * sinZ + y1 * cosZ;

      return {
        x: this.x + x3,
        y: this.y + y3,
        z: z2
      };
    });

    // 6 Faces defined by vertex indices
    const faces = [
      [0, 1, 2, 3], // Front
      [5, 4, 7, 6], // Back
      [4, 0, 3, 7], // Left
      [1, 5, 6, 2], // Right
      [4, 5, 1, 0], // Top
      [3, 2, 6, 7]  // Bottom
    ];

    // Render faces with painter's algorithm (back to front depth sort)
    const sortedFaces = faces
      .map(face => {
        const avgZ = (projected[face[0]].z + projected[face[1]].z + projected[face[2]].z + projected[face[3]].z) / 4;
        return { face, avgZ };
      })
      .sort((a, b) => a.avgZ - b.avgZ);

    sortedFaces.forEach(({ face, avgZ }) => {
      // Face lighting calculation based on depth
      const depthFactor = (avgZ + s) / (2 * s);
      const alpha = Math.max(0.08, Math.min(0.55, this.baseAlpha + depthFactor * 0.2));

      ctx.beginPath();
      ctx.moveTo(projected[face[0]].x, projected[face[0]].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(projected[face[i]].x, projected[face[i]].y);
      }
      ctx.closePath();

      // Theme colors: Cyan (#38bdf8) and Indigo (#818cf8)
      if (this.isCyan) {
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.35})`;
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
      } else {
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha * 0.28})`;
        ctx.strokeStyle = `rgba(129, 140, 248, ${alpha * 0.8})`;
      }

      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
    });
  }
}

function initCubes() {
  cubes = [];
  // Cube count scales with screen width (20 on mobile, 45 on desktop)
  const count = Math.floor(Math.min(width, 1600) / 36);
  for (let i = 0; i < count; i++) {
    cubes.push(new FloatingCube());
  }
}

initCubes();

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < cubes.length; i++) {
    cubes[i].update();
    cubes[i].draw();
  }

  requestAnimationFrame(animate);
}
animate();

// Reveal animations on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
