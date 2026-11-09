/* =========================================================
   INNOVEXA STUDIO - 3D INTERACTIVE CANVAS & SCROLL SYSTEM
   ========================================================= */

// 1. PRELOADER DISMISSAL
window.addEventListener('load', dismissPreloader);
setTimeout(dismissPreloader, 1800); // Failsafe timeout

function dismissPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('fade-out')) {
    preloader.classList.add('fade-out');
    setTimeout(() => preloader.remove(), 650);
  }
}

// 2. CANVAS & MOUSE/TOUCH PHYSICS
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
const cursorGlow = document.getElementById('cursor-glow');

let width, height;
let cubes = [];

// Pointer state & spring interpolation
const pointer = {
  x: -9999,
  y: -9999,
  targetX: -9999,
  targetY: -9999,
  targetRadius: 180,
  isActive: false,
  shockwaveRadius: 0,
  shockwaveMax: 320,
  shockwaveActive: false
};

// Scroll tracking for background parallax
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  scrollVelocity = (currentScrollY - lastScrollY) * 0.15;
  lastScrollY = currentScrollY;
}, { passive: true });

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
  resize();
  initCubes();
});
resize();

// Mouse tracking
window.addEventListener('mousemove', (e) => {
  pointer.targetX = e.clientX;
  pointer.targetY = e.clientY;
  pointer.isActive = true;
});

window.addEventListener('mouseleave', () => {
  pointer.isActive = false;
  if (cursorGlow) cursorGlow.style.opacity = '0';
});

window.addEventListener('mouseenter', () => {
  if (cursorGlow) cursorGlow.style.opacity = '1';
});

// Click / Touch Shockwave Trigger
window.addEventListener('pointerdown', (e) => {
  pointer.targetX = e.clientX;
  pointer.targetY = e.clientY;
  pointer.shockwaveRadius = 10;
  pointer.shockwaveActive = true;
});

// Mobile Touch
window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    pointer.targetX = e.touches[0].clientX;
    pointer.targetY = e.touches[0].clientY;
    pointer.isActive = true;
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    pointer.targetX = e.touches[0].clientX;
    pointer.targetY = e.touches[0].clientY;
    pointer.isActive = true;
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  pointer.isActive = false;
});

// 3D Cube Class
class FloatingCube {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.size = Math.random() * 20 + 12;
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : height + this.size * 2;

    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.5 + 0.2); // Upward float

    this.pushVx = 0;
    this.pushVy = 0;

    this.angleX = Math.random() * Math.PI * 2;
    this.angleY = Math.random() * Math.PI * 2;
    this.angleZ = Math.random() * Math.PI * 2;
    this.rotSpeedX = (Math.random() - 0.5) * 0.016;
    this.rotSpeedY = (Math.random() - 0.5) * 0.016;
    this.rotSpeedZ = (Math.random() - 0.5) * 0.016;

    this.isCyan = Math.random() > 0.42;
    this.baseAlpha = Math.random() * 0.35 + 0.2;
  }

  update() {
    // Scroll drift
    this.y -= scrollVelocity;

    // Movement & physics damping
    this.x += this.vx + this.pushVx;
    this.y += this.vy + this.pushVy;
    this.pushVx *= 0.92;
    this.pushVy *= 0.92;

    // 3D Rotation
    this.angleX += this.rotSpeedX;
    this.angleY += this.rotSpeedY;
    this.angleZ += this.rotSpeedZ;

    // Interactive Mouse Deflection & Magnetic Tilt
    if (pointer.isActive) {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const dist = Math.hypot(dx, dy);

      if (dist < pointer.targetRadius && dist > 0) {
        const force = (pointer.targetRadius - dist) / pointer.targetRadius;
        const angle = Math.atan2(dy, dx);

        // Repel from cursor
        this.pushVx += Math.cos(angle) * force * 1.8;
        this.pushVy += Math.sin(angle) * force * 1.8;

        // Cube aligns rotation toward pointer angle
        this.angleX += Math.sin(angle) * force * 0.06;
        this.angleY += Math.cos(angle) * force * 0.06;
      }
    }

    // Shockwave pulse expansion effect
    if (pointer.shockwaveActive) {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      const ringDiff = Math.abs(dist - pointer.shockwaveRadius);

      if (ringDiff < 40 && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const impulse = (1 - ringDiff / 40) * 4;
        this.pushVx += Math.cos(angle) * impulse;
        this.pushVy += Math.sin(angle) * impulse;
      }
    }

    // Wrap around boundaries
    if (this.y < -this.size * 3) this.reset(false);
    if (this.y > height + this.size * 3) this.y = -this.size * 2;
    if (this.x < -this.size * 2) this.x = width + this.size;
    if (this.x > width + this.size * 2) this.x = -this.size;
  }

  draw() {
    const s = this.size / 2;
    const vertices = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s],  [s, -s, s],  [s, s, s],  [-s, s, s]
    ];

    const cosX = Math.cos(this.angleX), sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY), sinY = Math.sin(this.angleY);
    const cosZ = Math.cos(this.angleZ), sinZ = Math.sin(this.angleZ);

    const projected = vertices.map(([x, y, z]) => {
      let y1 = y * cosX - z * sinX;
      let z1 = y * sinX + z * cosX;
      let x2 = x * cosY + z1 * sinY;
      let z2 = -x * sinY + z1 * cosY;
      let x3 = x2 * cosZ - y1 * sinZ;
      let y3 = x2 * sinZ + y1 * cosZ;
      return { x: this.x + x3, y: this.y + y3, z: z2 };
    });

    const faces = [
      [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
      [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]
    ];

    const sortedFaces = faces
      .map(face => ({
        face,
        avgZ: (projected[face[0]].z + projected[face[1]].z + projected[face[2]].z + projected[face[3]].z) / 4
      }))
      .sort((a, b) => a.avgZ - b.avgZ);

    sortedFaces.forEach(({ face, avgZ }) => {
      const depthFactor = (avgZ + s) / (2 * s);
      const alpha = Math.max(0.08, Math.min(0.55, this.baseAlpha + depthFactor * 0.2));

      ctx.beginPath();
      ctx.moveTo(projected[face[0]].x, projected[face[0]].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(projected[face[i]].x, projected[face[i]].y);
      }
      ctx.closePath();

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
  const count = Math.floor(Math.min(width, 1600) / 36);
  for (let i = 0; i < count; i++) {
    cubes.push(new FloatingCube());
  }
}
initCubes();

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Smooth lerp pointer towards target
  pointer.x += (pointer.targetX - pointer.x) * 0.15;
  pointer.y += (pointer.targetY - pointer.y) * 0.15;

  // Move cursor glow orb
  if (cursorGlow && pointer.isActive) {
    cursorGlow.style.left = `${pointer.x}px`;
    cursorGlow.style.top = `${pointer.y}px`;
  }

  // Handle shockwave ring
  if (pointer.shockwaveActive) {
    pointer.shockwaveRadius += 9;
    if (pointer.shockwaveRadius > pointer.shockwaveMax) {
      pointer.shockwaveActive = false;
    }
  }

  // Decay scroll velocity
  scrollVelocity *= 0.9;

  for (let i = 0; i < cubes.length; i++) {
    cubes[i].update();
    cubes[i].draw();
  }

  requestAnimationFrame(animate);
}
animate();

// 3. 3D CARD HOVER TILT EFFECT (DESKTOP)
if (window.matchMedia('(min-width: 769px)').matches) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

// 4. SCROLL REVEAL OBSERVER
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
