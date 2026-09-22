// Main Application Controller & Roguelike Game Flow
class CasinoApp {
  constructor() {
    this.currentTab = 'roulette';
    this.roulette = null;
    this.blackjack = null;
    this.slots = null;
    this.shop = null;
    this.plinko = null;

    this.init();
  }

  init() {
    this.roulette = new MultiplierRoulette('roulette-canvas');
    this.blackjack = new BlackjackTable();
    this.slots = new SlotMachine();
    this.shop = new RelicShop();
    this.plinko = new PlinkoGame('plinko-canvas');

    this.setupTabs();
    this.setupHUD();
    this.setupConsumables();
    this.setupModals();
    this.setupAudioToggle();

    // Initial HUD update
    this.updateHUD();
    window.gameState.subscribe(() => this.updateHUD());
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.dataset.view;
        this.switchView(targetView);
        window.soundFX.playChip();
      });
    });
  }

  switchView(viewName) {
    this.currentTab = viewName;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    document.querySelectorAll('.game-view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });

    if (viewName === 'roulette' && this.roulette) {
      this.roulette.render();
    }
    if (viewName === 'plinko' && this.plinko) {
      this.plinko.resize();
      this.plinko.buildLayout();
    }
    if (viewName === 'shop' && this.shop) {
      this.shop.renderAll();
    }

    if (window.casinoBetting) {
      window.casinoBetting.refreshAll();
    }

    // Play contextual ambient music on tab switch
    window.soundFX.playAmbient(viewName);
  }

  setupAudioToggle() {
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = window.soundFX.toggle();
        soundBtn.innerText = enabled ? '🔊 Som: ON' : '🔇 Som: MUDO';
        soundBtn.classList.toggle('muted', !enabled);
        if (enabled) window.soundFX.playChip();
      });
    }
  }

  setupConsumables() {
    // 1. Spyglass (Lupa)
    const spyBtn = document.getElementById('btn-use-spyglass');
    if (spyBtn) {
      spyBtn.addEventListener('click', () => {
        const gs = window.gameState;
        if (!gs.hasConsumable('spyglass')) return;

        let msg = '';
        if (this.currentTab === 'blackjack' && this.blackjack) {
          const nextCard = this.blackjack.peekNextCard();
          msg = nextCard ? `🔍 Lupa: Próxima carta é ${nextCard.name}${nextCard.suit}!` : 'Baralho vazio!';
        } else if (this.currentTab === 'slots') {
          msg = '🔍 Lupa: Bobina central calibrada para 7️⃣ ou 💎!';
        } else {
          msg = '🔍 Lupa: Probabilidade de vitória elevada nesta rodada!';
        }

        gs.useConsumable('spyglass');
        window.soundFX.playChip();
        window.particles.spawnFloatingText(msg, window.innerWidth / 2, window.innerHeight / 2 - 30, '#00ffcc', 28);
      });
    }

    // 2. Magnet (Ímã da Roleta)
    const magBtn = document.getElementById('btn-use-magnet');
    if (magBtn) {
      magBtn.addEventListener('click', () => {
        const gs = window.gameState;
        if (!gs.hasConsumable('magnet')) return;
        if (gs.activeMagnet) {
          window.particles.spawnFloatingText('Ímã já está ativo!', window.innerWidth / 2, window.innerHeight / 2, '#f1c40f', 22);
          return;
        }

        gs.useConsumable('magnet');
        gs.activeMagnet = true;
        window.soundFX.playWin();
        window.particles.spawnFloatingText('🧲 ÍMÃ ATIVADO! Protegido contra 0x!', window.innerWidth / 2, window.innerHeight / 2 - 30, '#00d2d3', 28);
        this.updateHUD();
      });
    }

    // 3. Energy Drink (+$cash bonus)
    const energyBtn = document.getElementById('btn-use-energy');
    if (energyBtn) {
      energyBtn.addEventListener('click', () => {
        const gs = window.gameState;
        if (!gs.hasConsumable('energy_drink')) return;
        const bonus = Math.round(gs.quota * 0.05);
        gs.useConsumable('energy_drink');
        gs.addCash(bonus);
        window.soundFX.playWin();
        window.particles.spawnFloatingText(`☕ CAFÉ: +$${bonus.toLocaleString()} EXTRA!`, window.innerWidth / 2, window.innerHeight / 2 - 30, '#ffd700', 30);
        window.particles.spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 20);
        this.updateHUD();
      });
    }

    // 4. Double Potion (Tônico da Sorte 2x)
    const doubleBtn = document.getElementById('btn-use-double');
    if (doubleBtn) {
      doubleBtn.addEventListener('click', () => {
        const gs = window.gameState;
        if (!gs.hasConsumable('double_potion')) return;
        if (gs.activeDoublePotion) {
          window.particles.spawnFloatingText('Tônico 2x já está ativo!', window.innerWidth / 2, window.innerHeight / 2, '#f1c40f', 22);
          return;
        }

        gs.useConsumable('double_potion');
        gs.activeDoublePotion = true;
        window.soundFX.playWin();
        window.particles.spawnFloatingText('🧪 TÔNICO ATIVADO: PRÓXIMO GANHO PAGARÁ 2x!', window.innerWidth / 2, window.innerHeight / 2 - 30, '#e056fd', 28);
        this.updateHUD();
      });
    }

    // 5. Insurance (Seguro 75%)
    const insBtn = document.getElementById('btn-use-insurance');
    if (insBtn) {
      insBtn.addEventListener('click', () => {
        const gs = window.gameState;
        if (!gs.hasConsumable('insurance_policy')) return;
        if (gs.activeInsurance) {
          window.particles.spawnFloatingText('Seguro já está contratado!', window.innerWidth / 2, window.innerHeight / 2, '#f1c40f', 22);
          return;
        }

        gs.useConsumable('insurance_policy');
        gs.activeInsurance = true;
        window.soundFX.playWin();
        window.particles.spawnFloatingText('🛡️ SEGURO ATIVADO: 75% da aposta protegida!', window.innerWidth / 2, window.innerHeight / 2 - 30, '#2ecc71', 28);
        this.updateHUD();
      });
    }
  }

  setupHUD() {
    const quotaPayBtn = document.getElementById('pay-quota-now-btn');
    if (quotaPayBtn) {
      quotaPayBtn.addEventListener('click', () => {
        if (window.gameState.cash >= window.gameState.quota) {
          this.triggerFloorSuccess();
        } else {
          window.particles.spawnFloatingText('Ainda falta dinheiro para a meta!', window.innerWidth / 2, window.innerHeight / 2, '#ff4757');
          window.soundFX.playLoss();
        }
      });
    }
  }

  updateHUD() {
    const gs = window.gameState;
    if (!gs) return;

    const cashEl = document.getElementById('hud-cash-val');
    const quotaEl = document.getElementById('hud-quota-val');
    const floorEl = document.getElementById('hud-floor-val');
    const progressFill = document.getElementById('hud-quota-progress-bar');
    const quotaPayBtn = document.getElementById('pay-quota-now-btn');

    if (cashEl) cashEl.innerText = `$${gs.cash.toLocaleString()}`;
    if (quotaEl) quotaEl.innerText = `$${gs.quota.toLocaleString()}`;
    if (floorEl) floorEl.innerText = `Andar ${gs.floor}`;

    // Progress bar towards quota
    if (progressFill) {
      const percentage = Math.min(100, Math.max(0, (gs.cash / gs.quota) * 100));
      progressFill.style.width = `${percentage}%`;
      progressFill.classList.toggle('ready', percentage >= 100);
    }

    if (quotaPayBtn) {
      const canPay = gs.cash >= gs.quota;
      quotaPayBtn.classList.toggle('highlight-pulse', canPay);
      quotaPayBtn.disabled = !canPay;
    }

    // Floor modifier display
    const modBox = document.getElementById('hud-modifier-box');
    const modName = document.getElementById('hud-modifier-name');
    const modDesc = document.getElementById('hud-modifier-desc');
    if (modBox) {
      if (gs.floorModifier) {
        modBox.style.display = '';
        if (modName) modName.innerText = `${gs.floorModifier.icon} ${gs.floorModifier.name}`;
        if (modDesc) modDesc.innerText = gs.floorModifier.desc;
      } else {
        modBox.style.display = 'none';
      }
    }

    // Update consumable counts in HUD
    const spyCount = document.getElementById('count-spyglass');
    const magCount = document.getElementById('count-magnet');
    const energyCount = document.getElementById('count-energy');
    const dblCount = document.getElementById('count-double');
    const insCount = document.getElementById('count-insurance');

    if (spyCount) spyCount.innerText = gs.consumables.spyglass || 0;
    if (magCount) magCount.innerText = gs.consumables.magnet || 0;
    if (energyCount) energyCount.innerText = gs.consumables.energy_drink || 0;
    if (dblCount) dblCount.innerText = gs.consumables.double_potion || 0;
    if (insCount) insCount.innerText = gs.consumables.insurance_policy || 0;

    // Consumable button disabled states
    const spyBtn = document.getElementById('btn-use-spyglass');
    const magBtn = document.getElementById('btn-use-magnet');
    const energyBtn = document.getElementById('btn-use-energy');
    const dblBtn = document.getElementById('btn-use-double');
    const insBtn = document.getElementById('btn-use-insurance');

    if (spyBtn) spyBtn.disabled = !(gs.consumables.spyglass > 0);
    if (magBtn) magBtn.disabled = !(gs.consumables.magnet > 0) || gs.activeMagnet;
    if (energyBtn) energyBtn.disabled = !(gs.consumables.energy_drink > 0);
    if (dblBtn) dblBtn.disabled = !(gs.consumables.double_potion > 0) || gs.activeDoublePotion;
    if (insBtn) insBtn.disabled = !(gs.consumables.insurance_policy > 0) || gs.activeInsurance;

    // Render active buffs
    const buffsContainer = document.getElementById('hud-active-buffs');
    if (buffsContainer) {
      let buffsHtml = '';
      if (gs.activeMagnet) buffsHtml += '<span class="buff-pill buff-magnet">🧲 Ímã Ativo</span>';
      if (gs.activeDoublePotion) buffsHtml += '<span class="buff-pill buff-double">🧪 Ganho 2x Ativo</span>';
      if (gs.activeInsurance) buffsHtml += '<span class="buff-pill buff-insurance">🛡️ Seguro 75% Ativo</span>';
      buffsContainer.innerHTML = buffsHtml;
    }
  }

  // Unified game condition handler — replaces handleRoundProgression
  handleGameCondition(result) {
    if (!result) return;
    if (result.status === 'BANKRUPT') {
      this.triggerGameOver('FALÊNCIA TOTAL! Você apostou até o último centavo e a Casa confiscou sua alma.');
    } else if (result.status === 'QUOTA_REACHED') {
      window.particles.spawnFloatingText('META DA FASE ATINGIDA! VOCÊ PODE AVANÇAR!', window.innerWidth / 2, 100, '#00ffcc', 28);
      window.soundFX.playWin();
    }
    // CONTINUE: do nothing, player keeps playing
  }

  setupModals() {
    const restartBtn = document.getElementById('gameover-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restartGame();
      });
    }

    const headerRestartBtn = document.getElementById('header-restart-btn');
    if (headerRestartBtn) {
      headerRestartBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente reiniciar a run atual do Andar 1? Todo o progresso desta tentativa será resetado.')) {
          this.restartGame();
        }
      });
    }

    const nextFloorBtn = document.getElementById('floor-next-btn');
    if (nextFloorBtn) {
      nextFloorBtn.addEventListener('click', () => {
        this.hideModals();
        window.gameState.nextFloor();

        // Refresh dynamic betting racks and shop stock for the new floor
        if (this.shop) this.shop.generateFloorStock();
        if (window.casinoBetting) window.casinoBetting.refreshAll();

        this.switchView('shop'); // Go straight to shop to upgrade before new floor!
        window.soundFX.playWin();
        const minBet = window.gameState.getMinBetForFloor();
        window.particles.spawnFloatingText(`BEM-VINDO AO ANDAR ${window.gameState.floor}! (Aposta Mínima: $${minBet})`, window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 30);
      });
    }
  }

  restartGame() {
    this.hideModals();
    window.gameState.reset();
    this.updateHUD();

    if (this.roulette) {
      this.roulette.currentAngle = 0;
      this.roulette.angularVelocity = 0;
      this.roulette.isSpinning = false;
      this.roulette.currentBet = window.gameState.getMinBetForFloor();
      this.roulette.renderWheelUpgradesBadge();
      this.roulette.updateBetDisplay();
      this.roulette.render();
    }

    if (this.blackjack) {
      this.blackjack.playerHand = [];
      this.blackjack.dealerHand = [];
      this.blackjack.isPlaying = false;
      this.blackjack.dealerHidden = true;
      this.blackjack.currentBet = window.gameState.getMinBetForFloor();
      this.blackjack.renderHands();
      this.blackjack.updateUIState();
    }

    if (this.slots) {
      this.slots.isSpinning = false;
      this.slots.currentBet = window.gameState.getMinBetForFloor();
      this.slots.updateBetDisplay();
    }

    if (this.plinko) {
      this.plinko.reset();
      this.plinko.currentBet = window.gameState.getMinBetForFloor();
    }

    if (this.shop) {
      this.shop.generateFloorStock();
      this.shop.renderAll();
    }

    if (window.casinoBetting) {
      window.casinoBetting.refreshAll();
    }

    window.soundFX.stopAmbient();
    this.switchView('roulette');
    window.soundFX.playWin();
    window.particles.spawnFloatingText('RUN REINICIADA COM SUCESSO!', window.innerWidth / 2, window.innerHeight / 2, '#00ffcc', 30);
  }

  triggerFloorSuccess() {
    window.soundFX.playJackpot();
    window.particles.spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 100);
    window.particles.screenShake(12, 400);

    const modal = document.getElementById('modal-floor-success');
    const titleEl = document.getElementById('floor-success-title');
    const descEl = document.getElementById('floor-success-desc');

    const nextMin = window.gameState.getMinBetForFloor(window.gameState.floor + 1);

    if (titleEl) titleEl.innerText = `ANDAR ${window.gameState.floor} SUPERADO!`;
    if (descEl) descEl.innerHTML = `
      Você pagou a cota de <strong>$${window.gameState.quota.toLocaleString()}</strong>.<br/>
      Saldo restante para o próximo andar: <strong>$${(window.gameState.cash - window.gameState.quota).toLocaleString()}</strong>.<br/>
      As apostas subirão no <strong>Andar ${window.gameState.floor + 1}</strong>! Aposta mínima: <strong>$${nextMin.toLocaleString()}</strong>.
    `;

    if (modal) modal.classList.add('visible');
  }

  triggerGameOver(reason) {
    window.soundFX.stopAmbient();
    window.soundFX.playLoss();
    window.particles.screenShake(18, 600);

    const modal = document.getElementById('modal-gameover');
    const reasonEl = document.getElementById('gameover-reason');
    const statsEl = document.getElementById('gameover-stats');

    if (reasonEl) reasonEl.innerText = reason;

    const gs = window.gameState;
    const st = gs.stats;

    // Determine favorite table
    const tableCounts = [
      { name: 'Roleta', count: st.rouletteSpins },
      { name: 'Blackjack', count: st.blackjackHands },
      { name: 'Caça-Níquel', count: st.slotsSpun },
      { name: 'Plinko', count: st.plinkoDrops }
    ];
    tableCounts.sort((a, b) => b.count - a.count);
    const favTable = tableCounts[0].count > 0 ? tableCounts[0].name : 'Nenhuma';

    // Calculate rank
    const rank = gs.floor >= 7 ? 'S' : gs.floor >= 5 ? 'A' : gs.floor >= 3 ? 'B' : gs.floor >= 2 ? 'C' : 'F';
    const rankColors = { S: '#ffd700', A: '#00ffcc', B: '#3498db', C: '#f39c12', F: '#ff4757' };
    const rankColor = rankColors[rank];

    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stats-rank-badge" style="color:${rankColor}; border-color:${rankColor}">${rank}</div>
        <div class="stats-grid">
          <div class="stat-row"><span>Andar alcançado:</span> <strong>Andar ${gs.floor}</strong></div>
          <div class="stat-row"><span>Maior vitória:</span> <strong>$${st.biggestWin.toLocaleString()}</strong></div>
          <div class="stat-row"><span>Mesa favorita:</span> <strong>${favTable}</strong></div>
          <div class="stat-row"><span>Mãos de Blackjack:</span> <strong>${st.blackjackHands}</strong></div>
          <div class="stat-row"><span>Giros de Roleta:</span> <strong>${st.rouletteSpins}</strong></div>
          <div class="stat-row"><span>Plinko drops:</span> <strong>${st.plinkoDrops}</strong></div>
          <div class="stat-row"><span>Giros de Caça-Níquel:</span> <strong>${st.slotsSpun}</strong></div>
          <div class="stat-row"><span>Total apostado:</span> <strong>${st.betsPlaced} apostas</strong></div>
          <div class="stat-row"><span>Consumíveis usados:</span> <strong>${st.consumablesUsed}</strong></div>
        </div>
        <div class="stats-chart-label">📈 Evolução do Saldo</div>
        <canvas id="gameover-chart-canvas" width="420" height="120" style="width:100%;max-width:420px;display:block;margin:0 auto;"></canvas>
      `;

      requestAnimationFrame(() => this.drawCashChart(gs.cashHistory, rankColor));
    }

    if (modal) modal.classList.add('visible');
  }

  drawCashChart(history, lineColor = '#00ffcc') {
    const canvas = document.getElementById('gameover-chart-canvas');
    if (!canvas || !history || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(7,10,18,0.8)';
    ctx.fillRect(0, 0, W, H);

    const padding = { top: 10, bottom: 20, left: 8, right: 8 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    const maxVal = Math.max(...history, 1);
    const minVal = Math.min(...history, 0);
    const range = maxVal - minVal || 1;

    const xStep = chartW / (history.length - 1);
    const yOf = val => padding.top + chartH - ((val - minVal) / range) * chartH;

    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, lineColor.replace(')', ', 0.4)').replace('rgb', 'rgba'));
    grad.addColorStop(1, 'rgba(7,10,18,0)');

    ctx.beginPath();
    ctx.moveTo(padding.left, yOf(history[0]));
    history.forEach((val, i) => {
      ctx.lineTo(padding.left + i * xStep, yOf(val));
    });
    ctx.lineTo(padding.left + (history.length - 1) * xStep, H - padding.bottom);
    ctx.lineTo(padding.left, H - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 6;
    ctx.moveTo(padding.left, yOf(history[0]));
    history.forEach((val, i) => {
      ctx.lineTo(padding.left + i * xStep, yOf(val));
    });
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`$${Math.round(minVal)}`, 2, H - padding.bottom + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`$${Math.round(maxVal)}`, W - 2, padding.top + 8);
  }

  hideModals() {
    document.querySelectorAll('.casino-modal-backdrop').forEach(modal => {
      modal.classList.remove('visible');
    });
  }
}

// Boot game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new CasinoApp();
});
