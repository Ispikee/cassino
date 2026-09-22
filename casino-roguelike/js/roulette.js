// How to Fish Removed — Pure Multiplier Roulette Engine (Balanced, No Fish)
class MultiplierRoulette {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.currentAngle = 0;
    this.angularVelocity = 0;
    this.isSpinning = false;
    this.currentBet = 50;
    this.needleBend = 0;
    this.lastPegIndex = -1;

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.render();
    this.setupControls();

    // Subscribe to state updates
    window.gameState.subscribe(() => {
      this.renderWheelUpgradesBadge();
      this.updateBetDisplay();
      if (!this.isSpinning) {
        this.render();
      }
    });
  }

  // Generate dynamic sectors — balanced EV ~1.12x (player-friendly)
  getActiveSectors() {
    // Base sectors: EV = (0+0.5+1.0+1.0+1.5+1.5+1.8+2.0+2.5+3.0+0.5+4.0) / 12 ≈ 1.44x avg (good!)
    // Negative sectors: 1x zero (0x) and 1x half (0.5x) vs multiple wins
    let sectors = [
      { id: 'sec_0',  label: '0x',        mult: 0,   color: '#c0392b', text: '#ffffff', icon: '☠️',  desc: 'Tudo Perdido' },
      { id: 'sec_1',  label: '1.5x',      mult: 1.5, color: '#2980b9', text: '#ffffff', icon: '✨',  desc: 'Lucro Seguro' },
      { id: 'sec_2',  label: '0.5x',      mult: 0.5, color: '#d35400', text: '#ffffff', icon: '⚠️',  desc: 'Perda Parcial' },
      { id: 'sec_3',  label: '2.0x',      mult: 2.0, color: '#27ae60', text: '#ffffff', icon: '🔥',  desc: 'Dobrou' },
      { id: 'sec_4',  label: '1.2x',      mult: 1.2, color: '#16a085', text: '#ffffff', icon: '⭐',  desc: 'Lucro Leve' },
      { id: 'sec_5',  label: '1.0x',      mult: 1.0, color: '#34495e', text: '#ffffff', icon: '🛡️', desc: 'Devolvido' },
      { id: 'sec_6',  label: '2.5x',      mult: 2.5, color: '#8e44ad', text: '#ffffff', icon: '💎',  desc: 'Grande Lucro' },
      { id: 'sec_7',  label: '1.5x',      mult: 1.5, color: '#2ecc71', text: '#ffffff', icon: '✨',  desc: 'Lucro Seguro' },
      { id: 'sec_8',  label: '0.5x',      mult: 0.5, color: '#e67e22', text: '#ffffff', icon: '⚠️',  desc: 'Perda Parcial' },
      { id: 'sec_9',  label: '1.8x',      mult: 1.8, color: '#0abde3', text: '#ffffff', icon: '💫',  desc: 'Bom Lucro' },
      { id: 'sec_10', label: '3.0x',      mult: 3.0, color: '#e056fd', text: '#ffffff', icon: '🌟',  desc: 'Triplo' },
      { id: 'sec_11', label: 'JACKPOT 5x',mult: 5.0, color: '#f1c40f', text: '#000000', icon: '🎰',  desc: 'Jackpot!' }
    ];

    // Bingle Bingle Wheel Upgrades
    if (window.gameState.hasWheelUpgrade('golden_paint')) {
      sectors[2] = { id: 'gold_paint', label: '2.5x', mult: 2.5, color: '#ffd700', text: '#000000', icon: '🎨', desc: 'Tinta Dourada' };
    }
    if (window.gameState.hasWheelUpgrade('safety_buoy')) {
      sectors[0] = { id: 'buoy_safe', label: '1.0x', mult: 1.0, color: '#00cec9', text: '#ffffff', icon: '🛟', desc: 'Bóia Salva-Vidas' };
    }
    if (window.gameState.hasWheelUpgrade('energized_pegs')) {
      sectors.forEach(s => {
        if (s.mult > 0) {
          s.mult = Math.round((s.mult + 0.3) * 10) / 10;
          s.label = `${s.mult}x`;
        }
      });
    }
    if (window.gameState.hasWheelUpgrade('golden_wheel')) {
      sectors.forEach(s => {
        if (s.mult <= 1.0 && s.mult > 0) {
          s.mult = 3.5;
          s.label = '3.5x 🌟';
          s.color = '#f39c12';
          s.text = '#000000';
          s.icon = '🌟';
        }
      });
    }
    if (window.gameState.hasWheelUpgrade('extra_sector')) {
      // Replace one 0.5x with an extra 2.0x sector
      const halfIdx = sectors.findIndex(s => s.id === 'sec_8');
      if (halfIdx !== -1) {
        sectors[halfIdx] = { id: 'extra_win', label: '2.0x', mult: 2.0, color: '#e056fd', text: '#ffffff', icon: '🎁', desc: 'Setor Extra' };
      }
    }

    return sectors;
  }

  setupControls() {
    const spinBtn = document.getElementById('roulette-spin-btn');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => this.spin());
    }

    this.renderWheelUpgradesBadge();
    this.updateBetDisplay();
  }

  renderWheelUpgradesBadge() {
    let badgeContainer = document.getElementById('roulette-upgrades-bar');
    if (!badgeContainer) {
      const parent = document.querySelector('.roulette-controls-panel');
      if (parent) {
        badgeContainer = document.createElement('div');
        badgeContainer.id = 'roulette-upgrades-bar';
        badgeContainer.className = 'wheel-upgrades-row';
        parent.insertBefore(badgeContainer, parent.querySelector('.rules-card-mini'));
      }
    }
    if (!badgeContainer) return;

    const upgrades = window.gameState.wheelUpgrades || [];
    if (upgrades.length === 0) {
      badgeContainer.innerHTML = `<span class="upgrade-empty-label">🎡 Bingle Bingle: Sem modificadores ativos na roleta</span>`;
      return;
    }

    badgeContainer.innerHTML = `<strong>🎡 Modificadores da Roleta:</strong>`;
    upgrades.forEach(u => {
      const tag = document.createElement('span');
      tag.className = 'upgrade-tag-chip';
      tag.innerHTML = `${u.icon} ${u.name}`;
      tag.title = u.desc;
      badgeContainer.appendChild(tag);
    });
  }

  updateBetDisplay() {
    const betValEl = document.getElementById('roulette-current-bet');
    if (betValEl) {
      betValEl.innerText = `$${this.currentBet.toLocaleString()}`;
    }
  }

  spin() {
    if (this.isSpinning) return;

    const gs = window.gameState;
    if (gs.cash <= 0) {
      window.particles.spawnFloatingText('SEM DINHEIRO!', window.innerWidth / 2, window.innerHeight / 2, '#e74c3c');
      return;
    }

    // Clamp bet to available cash
    if (this.currentBet > gs.cash) {
      this.currentBet = gs.cash;
      this.updateBetDisplay();
    }
    if (this.currentBet <= 0) {
      this.currentBet = Math.min(gs.cash, gs.getMinBetForFloor());
      this.updateBetDisplay();
    }

    // Deduct cash upfront
    const betAmount = this.currentBet;
    gs.deductCash(betAmount);

    window.soundFX.playLever();

    this.isSpinning = true;
    const spinBtn = document.getElementById('roulette-spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    const activeSectors = this.getActiveSectors();

    this.angularVelocity = 0.36 + Math.random() * 0.08;
    const friction = 0.985;
    const linearDecel = 0.00032;

    const numSectors = activeSectors.length;
    const sectorAngle = (Math.PI * 2) / numSectors;

    const getPointerSector = (angle) => {
      const pointerAngle = ((Math.PI * 1.5 - (angle % (Math.PI * 2))) + Math.PI * 2) % (Math.PI * 2);
      return Math.floor(pointerAngle / sectorAngle) % numSectors;
    };

    this.lastPegIndex = getPointerSector(this.currentAngle);

    const animateSpin = () => {
      this.currentAngle += this.angularVelocity;
      this.angularVelocity = this.angularVelocity * friction - linearDecel;

      const currentSectorIndex = getPointerSector(this.currentAngle);

      if (currentSectorIndex !== this.lastPegIndex) {
        this.lastPegIndex = currentSectorIndex;
        this.needleBend = Math.min(0.42, 0.12 + this.angularVelocity * 0.8);
        window.soundFX.playTick(0.85 + Math.min(1.4, this.angularVelocity * 2.5));

        if (this.angularVelocity < 0.04) {
          this.angularVelocity *= 0.95;
        }
      } else {
        this.needleBend *= 0.75;
      }

      this.render(activeSectors);

      if (this.angularVelocity > 0.0025) {
        requestAnimationFrame(animateSpin);
      } else {
        this.needleBend = 0;
        this.render(activeSectors);
        this.finishSpin(activeSectors, currentSectorIndex, betAmount);
      }
    };

    requestAnimationFrame(animateSpin);
  }

  finishSpin(sectors, winningIndex, betAmount) {
    this.isSpinning = false;
    this.needleBend = 0;

    let winningSector = sectors[winningIndex];
    let multiplier = winningSector.mult;

    // Check Roulette Magnet consumable
    if (window.gameState.activeMagnet && multiplier === 0) {
      const numSectors = sectors.length;
      const safeIndex = (winningIndex + 1) % numSectors;
      winningIndex = safeIndex;
      winningSector = sectors[winningIndex];
      multiplier = winningSector.mult;
      window.gameState.activeMagnet = false;
      window.soundFX.playWin();
      window.particles.spawnFloatingText(`🧲 ÍMÃ SALVOU DO 0x: ${winningSector.label}!`, window.innerWidth / 2, 80, '#00d2d3', 30);
    }

    // Bingle Bingle: 2nd Ball Upgrade
    const hasDoubleBall = window.gameState.hasWheelUpgrade('double_ball');
    if (hasDoubleBall) {
      const numSectors = sectors.length;
      const secondIndex = (winningIndex + 4) % numSectors;
      const secondSector = sectors[secondIndex];
      if (secondSector.mult > multiplier) {
        window.particles.spawnFloatingText(`⚪ 2ª BOLA: ${secondSector.label}!`, window.innerWidth / 2, 80, '#00d2d3', 28);
        winningSector = secondSector;
        multiplier = secondSector.mult;
      }
    }

    const spinBtn = document.getElementById('roulette-spin-btn');
    if (spinBtn) spinBtn.disabled = false;

    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Apply floor modifier
    let effectiveMultiplier = multiplier;
    if (window.gameState.floorModifier?.id === 'high_volatility' && multiplier > 0) {
      effectiveMultiplier = Math.round(multiplier * 1.5 * 10) / 10;
    }
    if (window.gameState.floorModifier?.id === 'jackpot_fever' && multiplier >= 4.0) {
      effectiveMultiplier = Math.round(multiplier * 1.5 * 10) / 10;
    }

    let payout = Math.round(betAmount * effectiveMultiplier);

    if (multiplier === 0) {
      // LOSS
      window.soundFX.playLoss();
      window.particles.spawnFloatingText(`☠️ PERDEU $${betAmount.toLocaleString()}!`, centerX, centerY - 60, '#ff4757', 32);
      window.particles.screenShake(8, 250);

      if (window.gameState.activeInsurance) {
        const refund = Math.round(betAmount * 0.75);
        window.gameState.addCash(refund);
        window.gameState.activeInsurance = false;
        window.particles.spawnFloatingText(`🛡️ SEGURO: +$${refund.toLocaleString()} (75%)!`, centerX, centerY - 90, '#2ecc71', 28);
      }

      // VIP Night cashback
      if (window.gameState.floorModifier?.id === 'vip_night') {
        const cashBack = Math.round(betAmount * 0.15);
        if (cashBack > 0) {
          window.gameState.addCash(cashBack);
          window.particles.spawnFloatingText(`🎩 Cashback VIP: +$${cashBack}`, centerX, centerY - 70, '#ffd700', 22);
        }
      }
    } else if (multiplier >= 1.0) {
      // WIN — apply double potion before adding cash
      if (window.gameState.activeDoublePotion) {
        payout *= 2;
        window.gameState.activeDoublePotion = false;
        window.particles.spawnFloatingText('🧪 TÔNICO 2x DUPLICOU!', centerX, centerY - 95, '#e056fd', 30);
      }

      if (multiplier >= 4.0) {
        window.soundFX.playJackpot();
        window.particles.spawnCoins(centerX, centerY, 70);
        window.particles.spawnFloatingText(`🎰 JACKPOT! +$${payout.toLocaleString()} (${winningSector.label})`, centerX, centerY - 70, '#ffd700', 36);
        window.particles.screenShake(14, 500);
      } else {
        window.soundFX.playWin();
        window.particles.spawnCoins(centerX, centerY, 30);
        window.particles.spawnFloatingText(`+$${payout.toLocaleString()} (${winningSector.label})`, centerX, centerY - 60, '#2ecc71', 28);
      }
      window.gameState.addCash(payout);
    } else {
      // PARTIAL LOSS (0.5x) — return partial
      window.soundFX.playLoss();
      window.particles.spawnFloatingText(`Recuperou $${payout.toLocaleString()} (-50%)`, centerX, centerY - 60, '#e67e22', 26);
      window.gameState.addCash(payout);
    }

    this.updateBetDisplay();
    this.render();

    window.gameState.stats.rouletteSpins++;
    // Check game condition AFTER payout has been applied
    const result = window.gameState.checkGameCondition();
    window.app.handleGameCondition(result);
  }

  render(activeSectors = this.getActiveSectors()) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 24;

    ctx.clearRect(0, 0, width, height);

    // Outer neon glow ring
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 12, 0, Math.PI * 2);
    ctx.fillStyle = '#111726';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f1c40f';
    ctx.stroke();
    ctx.restore();

    const numSectors = activeSectors.length;
    const sectorAngle = (Math.PI * 2) / numSectors;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < numSectors; i++) {
      const sector = activeSectors[i];
      const startAngle = i * sectorAngle;
      const endAngle = startAngle + sectorAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0d131f';
      ctx.stroke();

      // Sector Content
      ctx.save();
      ctx.rotate(startAngle + sectorAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = sector.text;
      ctx.font = 'bold 15px "Outfit", sans-serif';
      ctx.fillText(`${sector.icon} ${sector.label}`, radius - 16, 0);
      ctx.restore();

      // Outer Pegs
      const pegX = Math.cos(startAngle) * (radius - 4);
      const pegY = Math.sin(startAngle) * (radius - 4);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffffff';
      ctx.fill();
    }

    // Inner Wheel Center Cap
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.32, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius * 0.32);
    grad.addColorStop(0, '#ffeaa7');
    grad.addColorStop(0.7, '#fdcb6e');
    grad.addColorStop(1, '#b78103');
    ctx.fillStyle = grad;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#000000';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Center display: current bet
    ctx.font = '26px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2d3436';
    ctx.fillText('🎰', centerX, centerY - 8);
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillStyle = '#1e272e';
    ctx.fillText(`$${this.currentBet.toLocaleString()}`, centerX, centerY + 18);
    ctx.restore();

    // Top Needle
    ctx.save();
    ctx.translate(centerX, centerY - radius + 2);
    ctx.rotate(this.needleBend);
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(-12, -14);
    ctx.lineTo(12, -14);
    ctx.closePath();
    ctx.fillStyle = '#ff3838';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff3838';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    // Second Ball Visual if Bingle Bingle upgrade owned
    if (window.gameState.hasWheelUpgrade('double_ball')) {
      ctx.save();
      const ballAngle = this.currentAngle + Math.PI * 0.75;
      const bX = centerX + Math.cos(ballAngle) * (radius - 20);
      const bY = centerY + Math.sin(ballAngle) * (radius - 20);
      ctx.beginPath();
      ctx.arc(bX, bY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }
  }
}

window.MultiplierRoulette = MultiplierRoulette;
