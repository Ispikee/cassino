// Quantum Slots Machine Engine with Sequential Suspense & Free Spins
class SlotMachine {
  constructor() {
    this.reels = [
      document.getElementById('slot-reel-1'),
      document.getElementById('slot-reel-2'),
      document.getElementById('slot-reel-3')
    ];
    this.currentBet = 25;
    this.isSpinning = false;
    this.nextPeek = null;

    this.symbols = [
      { id: 'skull', icon: '💀', mult3: 0, mult2: 0, weight: 15 },
      { id: 'cherry', icon: '🍒', mult3: 3, mult2: 1.5, weight: 28 },
      { id: 'lemon', icon: '🍋', mult3: 4, mult2: 1.5, weight: 24 },
      { id: 'bell', icon: '🔔', mult3: 8, mult2: 2, weight: 18, freeSpins: 3 },
      { id: 'diamond', icon: '💎', mult3: 15, mult2: 3, weight: 11 },
      { id: 'seven', icon: '7️⃣', mult3: 35, mult2: 5, weight: 6, freeSpins: 5 },
      { id: 'crown', icon: '👑', mult3: 65, mult2: 10, weight: 3 }
    ];

    this.init();
  }

  init() {
    this.setupControls();
    this.setupInitialDisplay();

    window.gameState.subscribe(() => {
      this.updateBetDisplay();
      this.renderFreeSpinsBadge();
    });
  }

  setupInitialDisplay() {
    this.reels.forEach((reel, i) => {
      if (reel) reel.innerText = ['7️⃣', '💎', '7️⃣'][i];
    });
    this.updateBetDisplay();
    this.renderFreeSpinsBadge();
  }

  setupControls() {
    const spinBtn = document.getElementById('slots-spin-btn');
    if (spinBtn) spinBtn.addEventListener('click', () => this.spin());

    const chipBtns = document.querySelectorAll('.slots-chip-btn');
    chipBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.isSpinning) return;
        const val = parseInt(e.currentTarget.dataset.val, 10);
        this.currentBet = Math.min(window.gameState.cash, val);
        this.updateBetDisplay();
        window.soundFX.playChip();
      });
    });

    const allInBtn = document.getElementById('slots-allin-btn');
    if (allInBtn) {
      allInBtn.addEventListener('click', () => {
        if (this.isSpinning) return;
        this.currentBet = window.gameState.cash;
        this.updateBetDisplay();
        window.soundFX.playChip();
      });
    }
  }

  updateBetDisplay() {
    const betEl = document.getElementById('slots-current-bet');
    if (betEl) {
      if (window.gameState.freeSpins > 0) {
        betEl.innerHTML = `<span style="color:#00ffcc">GRÁTIS (${window.gameState.freeSpins} giros)</span>`;
      } else {
        betEl.innerText = `$${this.currentBet}`;
      }
    }
  }

  renderFreeSpinsBadge() {
    let badge = document.getElementById('slots-freespins-banner');
    if (!badge) {
      const container = document.querySelector('.slots-machine-cabinet');
      if (container) {
        badge = document.createElement('div');
        badge.id = 'slots-freespins-banner';
        badge.className = 'slots-freespins-badge';
        container.insertBefore(badge, container.querySelector('.slots-reels-stage'));
      }
    }
    if (badge) {
      const fs = window.gameState.freeSpins || 0;
      if (fs > 0) {
        badge.style.display = 'block';
        badge.innerHTML = `✨ MODO BÔNUS: <strong>${fs} GIROS GRÁTIS ATIVOS</strong> (Sem gastar fichas nem rodadas!)`;
      } else {
        badge.style.display = 'none';
      }
    }
  }

  getRandomSymbol() {
    const isSurge = window.gameState.floorModifier?.id === 'quantum_surge';
    const hasGoldenReel = window.gameState.hasRelic('golden_reel');

    const workingSymbols = this.symbols.map(s => {
      let w = s.weight;
      if (isSurge && (s.id === 'seven' || s.id === 'diamond')) w *= 3;
      if (hasGoldenReel && (s.id === 'seven' || s.id === 'diamond')) w *= 2;
      return { ...s, weight: w };
    });

    const totalWeight = workingSymbols.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of workingSymbols) {
      if (rand < sym.weight) return sym;
      rand -= sym.weight;
    }
    return workingSymbols[0];
  }

  // Peek for Spyglass consumable
  peekNextResult() {
    const s1 = this.getRandomSymbol();
    const s2 = this.getRandomSymbol();
    const s3 = this.getRandomSymbol();
    this.nextPeek = [s1, s2, s3];
    return this.nextPeek;
  }

  spin() {
    if (this.isSpinning) return;

    const isFreeSpin = window.gameState.freeSpins > 0;

    if (!isFreeSpin) {
      if (window.gameState.cash <= 0) {
        window.particles.spawnFloatingText('SEM DINHEIRO!', window.innerWidth / 2, window.innerHeight / 2, '#ff4757');
        return;
      }

      // Clamp to available cash
      if (this.currentBet > window.gameState.cash) {
        this.currentBet = window.gameState.cash;
        this.updateBetDisplay();
      }
      if (this.currentBet <= 0) {
        this.currentBet = Math.min(window.gameState.cash, window.gameState.getMinBetForFloor());
        this.updateBetDisplay();
      }

      window.gameState.deductCash(this.currentBet);
    } else {
      window.gameState.freeSpins--;
      this.renderFreeSpinsBadge();
    }

    const betAmount = this.currentBet;

    window.soundFX.playLever();

    this.isSpinning = true;
    const spinBtn = document.getElementById('slots-spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    // Pick final symbols (or use peeked result if available)
    let finalSymbols;
    if (this.nextPeek) {
      finalSymbols = this.nextPeek;
      this.nextPeek = null;
    } else {
      finalSymbols = [
        this.getRandomSymbol(),
        this.getRandomSymbol(),
        this.getRandomSymbol()
      ];

      // Golden reel guarantee
      if (window.gameState.hasRelic('golden_reel') && Math.random() < 0.35) {
        finalSymbols[0] = this.symbols.find(s => s.id === 'seven');
        finalSymbols[1] = this.symbols.find(s => s.id === 'seven');
      }
    }

    // Check for suspense: if reel 1 & 2 match on high-value symbol
    const isSuspense = finalSymbols[0].id === finalSymbols[1].id && finalSymbols[0].id !== 'skull';

    // Start reel animations
    const intervals = [];
    this.reels.forEach((reel, idx) => {
      reel.classList.add('spinning');
      reel.classList.remove('suspense-reel');
      const interval = setInterval(() => {
        const randomSym = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        reel.innerText = randomSym.icon;
        window.soundFX.playTick(1.0 + idx * 0.2);
      }, 65);
      intervals.push(interval);
    });

    // Reel 1 Stops (0.8s)
    setTimeout(() => {
      clearInterval(intervals[0]);
      this.reels[0].classList.remove('spinning');
      this.reels[0].innerText = finalSymbols[0].icon;
      window.soundFX.playCardFlip();
      window.particles.screenShake(2, 80);
    }, 800);

    // Reel 2 Stops (1.5s)
    setTimeout(() => {
      clearInterval(intervals[1]);
      this.reels[1].classList.remove('spinning');
      this.reels[1].innerText = finalSymbols[1].icon;
      window.soundFX.playCardFlip();
      window.particles.screenShake(3, 100);

      // If suspense, activate Frenzy on Reel 3!
      if (isSuspense) {
        this.reels[2].classList.add('suspense-reel');
        window.particles.spawnFloatingText(`TENSÃO DE TRINCA: ${finalSymbols[0].icon}?!`, window.innerWidth / 2, window.innerHeight / 2 - 60, '#ffd700', 30);
        window.soundFX.playJackpot();
      }
    }, 1500);

    // Reel 3 Stops (2.3s or 3.0s if suspense)
    const reel3StopTime = isSuspense ? 2900 : 2200;
    setTimeout(() => {
      clearInterval(intervals[2]);
      this.reels[2].classList.remove('spinning');
      this.reels[2].classList.remove('suspense-reel');
      this.reels[2].innerText = finalSymbols[2].icon;
      window.soundFX.playCardFlip();
      window.particles.screenShake(5, 150);

      this.resolveSpin(finalSymbols, betAmount, isFreeSpin);
    }, reel3StopTime);
  }

  resolveSpin(finalSymbols, betAmount, wasFreeSpin) {
    this.isSpinning = false;
    const spinBtn = document.getElementById('slots-spin-btn');
    if (spinBtn) spinBtn.disabled = false;

    const [s1, s2, s3] = finalSymbols;
    let multiplier = 0;
    let winMessage = '';
    let awardedFreeSpins = 0;

    const reelsBox = document.getElementById('slots-reels-container');
    const rect = reelsBox ? reelsBox.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (s1.id === s2.id && s2.id === s3.id) {
      multiplier = s1.mult3;
      if (s1.id === 'seven' && window.gameState.hasRelic('jackpot_accelerator')) {
        multiplier = 100;
      }
      winMessage = multiplier > 0 ? `TRINCA DE ${s1.icon}!` : 'TRINCA DA MORTE 💀';
      if (s1.freeSpins) {
        awardedFreeSpins = s1.freeSpins;
      }
    } else if (s1.id === s2.id || s2.id === s3.id || s1.id === s3.id) {
      const matchSym = (s1.id === s2.id) ? s1 : s3;
      multiplier = matchSym.mult2;
      winMessage = multiplier > 0 ? `PAR DE ${matchSym.icon}!` : 'PERDA!';
    }

    if (window.gameState.hasRelic('cyber_cherry') && (s1.id === 'cherry' || s2.id === 'cherry' || s3.id === 'cherry')) {
      multiplier = Math.max(multiplier, 5);
      winMessage += ' (🍒 Cereja Atômica 5x)';
    }

    if (wasFreeSpin && window.gameState.hasRelic('quantum_overload') && multiplier > 0) {
      multiplier *= 3;
      winMessage += ' (⚡ Sobrecarga 3x)';
    }

    // Floor modifier: high_volatility
    if (window.gameState.floorModifier?.id === 'high_volatility' && multiplier > 0) {
      multiplier = Math.round(multiplier * 1.5 * 10) / 10;
    }

    let payout = Math.round(betAmount * multiplier);

    if (multiplier > 0 && window.gameState.activeDoublePotion) {
      payout *= 2;
      window.gameState.activeDoublePotion = false;
      window.particles.spawnFloatingText('🧪 TÔNICO 2x DUPLICOU O PRÊMIO!', centerX, centerY - 95, '#e056fd', 30);
    }

    if (multiplier >= 15) {
      window.soundFX.playJackpot();
      window.particles.spawnCoins(centerX, centerY, 80);
      window.particles.spawnFloatingText(`🎰 ${winMessage} +$${payout}!`, centerX, centerY - 60, '#ffd700', 36);
      window.particles.screenShake(14, 450);
      window.gameState.addCash(payout);
    } else if (multiplier > 0) {
      window.soundFX.playWin();
      window.particles.spawnCoins(centerX, centerY, 30);
      window.particles.spawnFloatingText(`${winMessage} +$${payout}!`, centerX, centerY - 50, '#2ecc71', 28);
      window.gameState.addCash(payout);
    } else {
      window.soundFX.playLoss();
      window.particles.spawnFloatingText(`Nada dessa vez! -$${betAmount}`, centerX, centerY - 50, '#ff4757', 24);
      window.particles.screenShake(4, 150);

      if (window.gameState.activeInsurance && !wasFreeSpin) {
        const refund = Math.round(betAmount * 0.75);
        window.gameState.addCash(refund);
        window.gameState.activeInsurance = false;
        window.particles.spawnFloatingText(`🛡️ SEGURO REEMBOLSOU 75%: +$${refund.toLocaleString()}!`, centerX, centerY - 80, '#2ecc71', 28);
      }

      // VIP Night cashback (15%)
      if (window.gameState.floorModifier?.id === 'vip_night' && !wasFreeSpin) {
        const cashBack = Math.round(betAmount * 0.15);
        if (cashBack > 0) {
          window.gameState.addCash(cashBack);
          window.particles.spawnFloatingText(`🎩 Cashback VIP: +$${cashBack}`, centerX, centerY - 70, '#ffd700', 22);
        }
      }
    }

    // Award Free Spins if triggered
    if (awardedFreeSpins > 0) {
      window.gameState.freeSpins += awardedFreeSpins;
      window.soundFX.playWin();
      window.particles.spawnFloatingText(`🎉 +${awardedFreeSpins} GIROS GRÁTIS DESBLOQUEADOS!`, centerX, centerY - 90, '#00ffcc', 30);
      this.renderFreeSpinsBadge();
    }

    window.gameState.stats.slotsSpun++;

    // Free spins DO NOT trigger game condition check
    if (!wasFreeSpin) {
      const result = window.gameState.checkGameCondition();
      window.app.handleGameCondition(result);
    }
  }
}

window.SlotMachine = SlotMachine;
