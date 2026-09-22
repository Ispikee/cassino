// Particle system and visual feedback engine
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.floatingTexts = [];
    this.animId = null;
    this.shakeTime = 0;
    this.shakeIntensity = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  screenShake(intensity = 10, durationMs = 300) {
    this.shakeIntensity = intensity;
    this.shakeTime = durationMs;
    const body = document.body;
    const startTime = performance.now();

    const shakeStep = (now) => {
      const elapsed = now - startTime;
      if (elapsed < durationMs) {
        const factor = 1 - elapsed / durationMs;
        const dx = (Math.random() * 2 - 1) * intensity * factor;
        const dy = (Math.random() * 2 - 1) * intensity * factor;
        body.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(shakeStep);
      } else {
        body.style.transform = '';
      }
    };
    requestAnimationFrame(shakeStep);
  }

  spawnCoins(x, y, count = 35) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 4 + Math.random() * 12;
      this.particles.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        radius: 6 + Math.random() * 6,
        color: Math.random() > 0.3 ? '#ffd700' : '#ffae19',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3,
        alpha: 1,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        gravity: 0.45
      });
    }
  }

  spawnSparks(x, y, color = '#00ffcc', count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color: color,
        alpha: 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        gravity: 0.05
      });
    }
  }

  spawnFloatingText(text, x, y, color = '#ffd700', fontSize = 28) {
    this.floatingTexts.push({
      text: text,
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      color: color,
      fontSize: fontSize,
      alpha: 1,
      vy: -2.5,
      life: 1,
      decay: 0.015
    });
  }

  loop() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Render & update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0;
        p.vx *= 0.98;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);

        if (p.rotation !== undefined) {
          p.rotation += p.vRot;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;

        if (p.rotation !== undefined) {
          // Flattened oval coin illusion
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.scale(1, Math.abs(Math.sin(p.rotation * 2)));
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();

        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // Render floating texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const t = this.floatingTexts[i];
        t.y += t.vy;
        t.life -= t.decay;
        t.alpha = Math.max(0, t.life);

        this.ctx.save();
        this.ctx.globalAlpha = t.alpha;
        this.ctx.font = `900 ${t.fontSize}px 'Outfit', sans-serif`;
        this.ctx.fillStyle = t.color;
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = t.color;
        this.ctx.fillText(t.text, t.x, t.y);
        this.ctx.restore();

        if (t.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(() => this.loop());
  }
}

window.particles = new ParticleSystem('effects-canvas');
