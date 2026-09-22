// Plinko Game — Physics-based ball drop with Canvas 2D
// Supports launching multiple balls simultaneously
class PlinkoGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.currentBet = 50;
    this.ballCount = 1; // How many balls to drop at once
    this.animFrameId = null;

    // Physics constants
    this.ROWS = 9;
    this.GRAVITY = 0.28;
    this.BALL_RADIUS = 9;
    this.PEG_RADIUS = 5;

    this.pegs = [];
    this.balls = [];
    this.buckets = [];
    this.particles = [];

    // Track active balls so we don't double-count rounds
    this.activeBallCount = 0;

    // Bucket multipliers — center is jackpot, edges are low
    this.BUCKET_MULTIPLIERS = [0.2, 0.5, 1, 2, 5, 20, 5, 2, 1, 0.5, 0.2];

    if (this.canvas) {
      this.resize();
      this.buildLayout();
      this.setupControls();
      this.render();
      window.addEventListener('resize', () => { this.resize(); this.buildLayout(); });
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = Math.min(parent ? parent.clientWidth : 520, 520);
    this.canvas.width = w;
    this.canvas.height = Math.round(w * 1.1);
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }

  buildLayout() {
    this.pegs = [];
    this.buckets = [];
    const W = this.W, H = this.H;
    const topPad = H * 0.14;
    const bottomPad = H * 0.17;
    const usableH = H - topPad - bottomPad;
    const rowSpacing = usableH / (this.ROWS - 1);
    const pegsInLastRow = this.ROWS + 2;
    const colSpacing = W / (pegsInLastRow);

    for (let row = 0; row < this.ROWS; row++) {
      const pegsInRow = row + 3;
      const totalW = (pegsInRow - 1) * colSpacing;
      const startX = (W - totalW) / 2;
      const y = topPad + row * rowSpacing;
      for (let col = 0; col < pegsInRow; col++) {
        this.pegs.push({ x: startX + col * colSpacing, y });
      }
    }

    // Buckets at the bottom
    const bucketCount = this.BUCKET_MULTIPLIERS.length;
    const bucketW = W / bucketCount;
    for (let i = 0; i < bucketCount; i++) {
      this.buckets.push({
        x: i * bucketW,
        y: H - bottomPad + 8,
        w: bucketW,
        h: bottomPad - 8,
        mult: this.BUCKET_MULTIPLIERS[i],
        lit: false,
        litTimer: 0
      });
    }
  }

  setupControls() {
    const dropBtn = document.getElementById('plinko-drop-btn');
    if (dropBtn) dropBtn.addEventListener('click', () => this.dropBalls());

    document.querySelectorAll('.plinko-chip-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const val = parseInt(e.currentTarget.dataset.val);
        if (isNaN(val)) return;
        if (val > window.gameState.cash) {
          window.particles.spawnFloatingText('Saldo insuficiente!', this.W / 2, this.H / 3, '#ff4757');
          return;
        }
        this.currentBet = val;
        this.updateBetDisplay();
        window.soundFX.playChip();
      });
    });

    const allInBtn = document.getElementById('plinko-allin-btn');
    if (allInBtn) allInBtn.addEventListener('click', () => {
      this.currentBet = window.gameState.cash;
      this.updateBetDisplay();
      window.soundFX.playChip();
    });

    // Ball count selector buttons
    document.querySelectorAll('.plinko-ball-count-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const count = parseInt(e.currentTarget.dataset.count);
        if (!isNaN(count)) {
          this.ballCount = count;
          document.querySelectorAll('.plinko-ball-count-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.updateBetDisplay();
          window.soundFX.playChip();
        }
      });
    });
  }

  updateBetDisplay() {
    const el = document.getElementById('plinko-current-bet');
    if (el) {
      const totalCost = this.currentBet * this.ballCount;
      el.innerText = `$${this.currentBet.toLocaleString()} × ${this.ballCount} = $${totalCost.toLocaleString()}`;
    }
  }

  dropBalls() {
    const gs = window.gameState;
    const totalCost = this.currentBet * this.ballCount;

    if (gs.cash <= 0) {
      window.particles.spawnFloatingText('SEM DINHEIRO!', this.W / 2, 120, '#ff4757');
      window.soundFX.playLoss();
      return;
    }

    // Clamp bet if needed
    if (this.currentBet > gs.cash) {
      this.currentBet = gs.cash;
      this.updateBetDisplay();
    }

    const actualCount = this.ballCount;
    const actualCost = Math.min(totalCost, gs.cash);
    const betPerBall = Math.floor(actualCost / actualCount);

    if (betPerBall <= 0) {
      window.particles.spawnFloatingText('Saldo insuficiente!', this.W / 2, 120, '#ff4757');
      return;
    }

    // Deduct total cost upfront
    gs.deductCash(actualCost);
    gs.stats.plinkoDrops = (gs.stats.plinkoDrops || 0) + actualCount;

    window.soundFX.playLever();

    // Drop all balls with slight stagger
    for (let i = 0; i < actualCount; i++) {
      setTimeout(() => {
        const dropX = this.W / 2 + (Math.random() - 0.5) * (this.W * 0.12);
        this.activeBallCount++;
        this.balls.push({
          x: dropX,
          y: 30,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0,
          radius: this.BALL_RADIUS,
          trail: [],
          settled: false,
          bet: betPerBall,
          glow: 0,
          id: Date.now() + i
        });
      }, i * 120);
    }

    // Twin Balls relic: extra free ball
    if (gs.hasRelic('twin_balls')) {
      setTimeout(() => {
        const dropX = this.W / 2 + (Math.random() - 0.5) * 24;
        this.activeBallCount++;
        this.balls.push({
          x: dropX,
          y: 30,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0,
          radius: this.BALL_RADIUS,
          trail: [],
          settled: false,
          bet: betPerBall,
          glow: 8,
          id: Date.now() + 999
        });
      }, actualCount * 120 + 100);
    }
  }

  resolveBall(ball) {
    // Find which bucket
    const bw = this.W / this.buckets.length;
    let bucketIdx = Math.floor(ball.x / bw);
    bucketIdx = Math.max(0, Math.min(this.buckets.length - 1, bucketIdx));

    const gs = window.gameState;

    // Relic: Ímã Central
    if (gs.hasRelic && gs.hasRelic('center_magnet')) {
      const bias = 0.15;
      if (Math.random() < bias) {
        const center = Math.floor(this.buckets.length / 2);
        bucketIdx = center + (Math.random() < 0.5 ? -1 : 0);
        bucketIdx = Math.max(0, Math.min(this.buckets.length - 1, bucketIdx));
      }
    }

    // Plinko Jackpot Magnet relic: massive center boost
    if (gs.hasRelic('jackpot_magnet')) {
      const center = Math.floor(this.buckets.length / 2);
      if (Math.abs(bucketIdx - center) <= 1 && Math.random() < 0.3) {
        bucketIdx = center;
      }
      this.buckets[center].mult = 50;
    }

    let mult = this.buckets[bucketIdx].mult;

    // Floor modifier: Alta Volatilidade
    if (gs.floorModifier && gs.floorModifier.id === 'high_volatility') {
      if (mult <= 1) mult = 0;
      else mult *= 2;
    }

    // Jackpot Fever
    if (gs.floorModifier?.id === 'jackpot_fever' && mult >= 5) {
      mult = Math.round(mult * 1.5);
    }

    let winAmount = Math.round(ball.bet * mult);

    const bucket = this.buckets[bucketIdx];
    bucket.lit = true;
    bucket.litTimer = 80;

    this.spawnLandParticles(ball.x, this.H - 80, mult);

    let finalWin = winAmount;

    // Double potion — only apply to first resolving ball if multiple
    if (finalWin > 0 && window.gameState.activeDoublePotion) {
      finalWin *= 2;
      window.gameState.activeDoublePotion = false;
      window.particles.spawnFloatingText('🧪 TÔNICO 2x!', this.W / 2, this.H / 3 - 30, '#e056fd', 28);
    }

    if (mult >= 5) window.soundFX.playJackpot();
    else if (mult >= 1) window.soundFX.playWin();
    else {
      window.soundFX.playLoss();
      if (window.gameState.activeInsurance) {
        const refund = Math.round(ball.bet * 0.75);
        window.gameState.addCash(refund);
        window.gameState.activeInsurance = false;
        window.particles.spawnFloatingText(`🛡️ SEGURO: +$${refund.toLocaleString()} (75%)!`, this.W / 2, this.H / 3 - 30, '#2ecc71', 26);
      }
    }

    // Add payout FIRST before checking conditions
    if (finalWin > 0) {
      gs.addCash(finalWin);
      gs.stats.biggestWin = Math.max(gs.stats.biggestWin, finalWin);
    }

    const label = mult >= 5 ? `JACKPOT! ${mult}x = +$${finalWin.toLocaleString()}` : mult >= 1 ? `${mult}x → +$${finalWin.toLocaleString()}` : `${mult}x → $${finalWin.toLocaleString()}`;
    const color = mult >= 5 ? '#ffd700' : mult >= 1 ? '#00ffcc' : '#ff4757';
    window.particles.spawnFloatingText(label, this.W / 2, this.H / 3, color, 22);

    // Only check game condition after LAST ball resolves
    this.activeBallCount--;
    if (this.activeBallCount <= 0) {
      this.activeBallCount = 0;
      const result = gs.checkGameCondition();
      setTimeout(() => {
        if (window.app) window.app.handleGameCondition(result);
      }, 600);
    }
  }

  spawnLandParticles(x, y, mult) {
    const color = mult >= 5 ? '#ffd700' : mult >= 1 ? '#00ffcc' : '#ff4757';
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        decay: 0.025 + Math.random() * 0.025,
        r: 3 + Math.random() * 3,
        color
      });
    }
  }

  updatePhysics() {
    const W = this.W, H = this.H;

    for (let b = this.balls.length - 1; b >= 0; b--) {
      const ball = this.balls[b];
      if (ball.settled) continue;

      // Store trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 12) ball.trail.shift();

      // Gravity
      ball.vy += this.GRAVITY;

      // Apply velocity
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall bounce
      if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = Math.abs(ball.vx) * 0.6; }
      if (ball.x + ball.radius > W) { ball.x = W - ball.radius; ball.vx = -Math.abs(ball.vx) * 0.6; }

      // Peg collisions
      for (const peg of this.pegs) {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + this.PEG_RADIUS + 1;

        if (dist < minDist && dist > 0.01) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          ball.x += nx * overlap;
          ball.y += ny * overlap;

          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx = (ball.vx - 2 * dot * nx) * 0.65;
          ball.vy = (ball.vy - 2 * dot * ny) * 0.65;

          const bias = (Math.random() - 0.48) * 1.2;
          ball.vx += bias;
          ball.vx = Math.max(-4, Math.min(4, ball.vx));

          window.soundFX.playPing && window.soundFX.playPing();
          ball.glow = 8;
        }
      }

      // Check if ball reached bucket zone
      const bucketTopY = this.H - (this.H * 0.17) + 8;
      if (ball.y + ball.radius >= bucketTopY) {
        ball.settled = true;
        this.resolveBall(ball);
        setTimeout(() => {
          const idx = this.balls.indexOf(ball);
          if (idx !== -1) this.balls.splice(idx, 1);
        }, 400);
      }

      if (ball.glow > 0) ball.glow--;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Bucket lit timers
    for (const bkt of this.buckets) {
      if (bkt.litTimer > 0) bkt.litTimer--;
      else bkt.lit = false;
    }
  }

  draw() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#070a12');
    bgGrad.addColorStop(1, '#0a1020');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Draw pegs
    for (const peg of this.pegs) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, this.PEG_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#c0d8f0';
      ctx.shadowColor = '#88b8e0';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    // Draw buckets
    for (let i = 0; i < this.buckets.length; i++) {
      const bkt = this.buckets[i];
      const isCenter = i === Math.floor(this.buckets.length / 2);
      const isHighVal = bkt.mult >= 5;

      let baseColor = bkt.lit
        ? (isCenter ? '#ffd700' : isHighVal ? '#00ffcc' : '#4a90d9')
        : (isCenter ? 'rgba(255,215,0,0.18)' : isHighVal ? 'rgba(0,255,204,0.12)' : 'rgba(74,144,217,0.10)');

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bkt.x + 2, bkt.y, bkt.w - 4, bkt.h, 4);
      ctx.fillStyle = baseColor;

      if (bkt.lit) {
        ctx.shadowColor = isCenter ? '#ffd700' : isHighVal ? '#00ffcc' : '#3498db';
        ctx.shadowBlur = 24;
      }
      ctx.fill();

      ctx.strokeStyle = isCenter ? 'rgba(255,215,0,0.6)' : isHighVal ? 'rgba(0,255,204,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Multiplier label
      ctx.save();
      ctx.fillStyle = bkt.lit ? '#fff' : (isCenter ? '#ffd700' : isHighVal ? '#00ffcc' : '#94a3b8');
      ctx.font = `bold ${isCenter ? 11 : 9.5}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${bkt.mult}x`, bkt.x + bkt.w / 2, bkt.y + bkt.h / 2);
      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // Draw balls
    for (const ball of this.balls) {
      // Trail
      for (let t = 0; t < ball.trail.length; t++) {
        const alpha = (t / ball.trail.length) * 0.4;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(ball.trail[t].x, ball.trail[t].y, ball.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffcc';
        ctx.fill();
        ctx.restore();
      }

      // Ball body
      ctx.save();
      const ballGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.radius);
      ballGrad.addColorStop(0, '#fff');
      ballGrad.addColorStop(0.4, '#00ffcc');
      ballGrad.addColorStop(1, '#007a6e');
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ballGrad;
      if (ball.glow > 0) {
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 16 + ball.glow * 2;
      }
      ctx.fill();
      ctx.restore();
    }

    // Drop indicator arrows at top — multiple if ballCount > 1
    const numArrows = Math.min(this.ballCount, 5);
    for (let i = 0; i < numArrows; i++) {
      const offset = (i - (numArrows - 1) / 2) * 20;
      ctx.save();
      ctx.fillStyle = `rgba(0,255,204,${0.8 - i * 0.1})`;
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 10;
      const cx = this.W / 2 + offset;
      ctx.beginPath();
      ctx.moveTo(cx, 18);
      ctx.lineTo(cx - 7, 6);
      ctx.lineTo(cx + 7, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  render() {
    this.updatePhysics();
    this.draw();
    this.animFrameId = requestAnimationFrame(() => this.render());
  }

  reset() {
    this.balls = [];
    this.particles = [];
    this.activeBallCount = 0;
    this.currentBet = 50;
    this.ballCount = 1;
    this.updateBetDisplay();
    for (const bkt of this.buckets) { bkt.lit = false; bkt.litTimer = 0; }
  }
}

window.PlinkoGame = PlinkoGame;
