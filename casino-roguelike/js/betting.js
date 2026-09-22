// Universal Dynamic Betting Controller for all Casino Tables
class CasinoBettingController {
  constructor() {
    this.games = ['roulette', 'bj', 'slots', 'plinko'];
  }

  init() {
    this.setupListeners();
    this.refreshAll();

    if (window.gameState) {
      window.gameState.subscribe(() => {
        this.refreshAll();
      });
    }
  }

  formatMoney(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toLocaleString();
  }

  getMinBet() {
    const gs = window.gameState;
    if (!gs) return 15;
    return gs.getMinBetForFloor(gs.floor);
  }

  getStep() {
    const gs = window.gameState;
    if (!gs) return 5;
    return gs.getStepForFloor(gs.floor);
  }

  clampBet(amount) {
    const gs = window.gameState;
    if (!gs || gs.cash <= 0) return 0;
    const minBet = this.getMinBet();

    // Desperate All-In rule if cash is below table minimum
    if (gs.cash < minBet) {
      return gs.cash;
    }

    return Math.max(minBet, Math.min(gs.cash, Math.round(amount)));
  }

  getGameInstance(gameId) {
    if (!window.app) return null;
    switch (gameId) {
      case 'roulette': return window.app.roulette;
      case 'bj': return window.app.blackjack;
      case 'slots': return window.app.slots;
      case 'plinko': return window.app.plinko;
      default: return null;
    }
  }

  setGameBet(gameId, bet) {
    const game = this.getGameInstance(gameId);
    if (!game) return;

    const clamped = this.clampBet(bet);
    game.currentBet = clamped;

    if (gameId === 'roulette') {
      // In roulette, if betting chips, deselect fish
      game.selectedFish = null;
      if (typeof game.renderAquarium === 'function') game.renderAquarium();
    }

    if (typeof game.updateBetDisplay === 'function') {
      game.updateBetDisplay();
    }

    this.updateActiveChipHighlight(gameId, clamped);
    if (window.soundFX) window.soundFX.playChip();
  }

  setupListeners() {
    this.games.forEach(gameId => {
      // Step Minus
      const minusBtn = document.getElementById(`${gameId}-step-minus`);
      if (minusBtn) {
        minusBtn.addEventListener('click', () => {
          const game = this.getGameInstance(gameId);
          if (!game) return;
          const step = this.getStep();
          const current = game.currentBet || this.getMinBet();
          this.setGameBet(gameId, current - step);
        });
      }

      // Step Plus
      const plusBtn = document.getElementById(`${gameId}-step-plus`);
      if (plusBtn) {
        plusBtn.addEventListener('click', () => {
          const game = this.getGameInstance(gameId);
          if (!game) return;
          const step = this.getStep();
          const current = game.currentBet || this.getMinBet();
          this.setGameBet(gameId, current + step);
        });
      }

      // 25% Pct
      const pct25Btn = document.getElementById(`${gameId}-pct-25`);
      if (pct25Btn) {
        pct25Btn.addEventListener('click', () => {
          const cash = window.gameState.cash;
          const step = this.getStep();
          const calculated = Math.round((cash * 0.25) / step) * step;
          this.setGameBet(gameId, calculated);
        });
      }

      // 50% Pct
      const pct50Btn = document.getElementById(`${gameId}-pct-50`);
      if (pct50Btn) {
        pct50Btn.addEventListener('click', () => {
          const cash = window.gameState.cash;
          const step = this.getStep();
          const calculated = Math.round((cash * 0.50) / step) * step;
          this.setGameBet(gameId, calculated);
        });
      }

      // ALL-IN
      const allinBtn = document.getElementById(`${gameId}-allin-btn`);
      if (allinBtn) {
        allinBtn.addEventListener('click', () => {
          this.setGameBet(gameId, window.gameState.cash);
          if (window.particles) {
            window.particles.spawnFloatingText('🔥 ALL-IN!', window.innerWidth / 2, window.innerHeight / 2, '#ff4757', 34);
          }
        });
      }
    });
  }

  refreshAll() {
    const gs = window.gameState;
    if (!gs) return;

    const minBet = this.getMinBet();
    const chips = gs.getDynamicChips(gs.floor);

    this.games.forEach(gameId => {
      // Update Table limits banner
      const floorEl = document.getElementById(`${gameId}-limit-floor`);
      const minEl = document.getElementById(`${gameId}-limit-min`);
      if (floorEl) floorEl.innerText = gs.floor;
      if (minEl) {
        if (gs.cash < minBet) {
          minEl.innerHTML = `<span style="color:#ff4757">$${minBet.toLocaleString()} (All-in Forçado: $${gs.cash})</span>`;
        } else {
          minEl.innerText = `$${minBet.toLocaleString()}`;
        }
      }

      // Render Dynamic Chips Rack
      const rackEl = document.getElementById(`${gameId}-chips-rack`);
      if (rackEl) {
        rackEl.innerHTML = '';
        chips.forEach((val, index) => {
          const btn = document.createElement('button');
          btn.className = `chip-btn dynamic-chip chip-tier-${index + 1}`;
          btn.dataset.val = val;
          btn.innerHTML = `<span>$${this.formatMoney(val)}</span>`;
          btn.title = `Apostar $${val.toLocaleString()}`;

          if (val > gs.cash) {
            btn.classList.add('disabled');
            btn.disabled = true;
          }

          btn.addEventListener('click', () => {
            this.setGameBet(gameId, val);
          });

          rackEl.appendChild(btn);
        });
      }

      // Ensure game's current bet is valid and displayed
      const game = this.getGameInstance(gameId);
      if (game) {
        if (!game.currentBet || game.currentBet < minBet || game.currentBet > gs.cash) {
          game.currentBet = this.clampBet(minBet);
        }
        if (typeof game.updateBetDisplay === 'function') {
          game.updateBetDisplay();
        }
        this.updateActiveChipHighlight(gameId, game.currentBet);
      }
    });
  }

  updateActiveChipHighlight(gameId, currentVal) {
    const rackEl = document.getElementById(`${gameId}-chips-rack`);
    if (!rackEl) return;
    rackEl.querySelectorAll('.chip-btn').forEach(btn => {
      const v = parseInt(btn.dataset.val, 10);
      btn.classList.toggle('active', v === currentVal);
    });
  }
}

window.casinoBetting = new CasinoBettingController();

// Boot betting system on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.casinoBetting.init();
});
