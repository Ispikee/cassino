// Global Roguelike Game State Manager
class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.floor = 1;
    this.cash = 100;
    this.initialCash = 100;
    this.quota = 250;
    this.relics = [];
    this.wheelUpgrades = []; // Bingle Bingle wheel modifications
    this.consumables = { spyglass: 1, magnet: 1, energy_drink: 0, double_potion: 0, insurance_policy: 0 };
    this.activeMagnet = false;
    this.activeDoublePotion = false;
    this.activeInsurance = false;
    this.rerollCost = 40;
    this.floorModifier = null; // Gamble Friend loan shark anomaly
    this.freeSpins = 0; // Quantum Slots bonus free spins

    this.stats = {
      totalWon: 0,
      biggestWin: 0,
      betsPlaced: 0,
      rouletteSpins: 0,
      blackjackHands: 0,
      slotsSpun: 0,
      plinkoDrops: 0,
      consumablesUsed: 0,
      favoriteMesa: null
    };
    this.cashHistory = [100]; // Track cash over time for end-screen chart
    this.isFloorCleared = false;
    this.triggerStateChange();
  }

  getPossibleModifiers() {
    return [
      { id: 'high_volatility', name: 'Alta Volatilidade', icon: '🌪️', desc: 'Todos os ganhos +50%, mas derrotas custam +50%!' },
      { id: 'dealer_blind', name: 'Blefe Cego', icon: '🕶️', desc: 'No Blackjack, o Dealer esconde ambas as cartas, mas vitórias pagam 2.5x!' },
      { id: 'quantum_surge', name: 'Sobrecarga Quântica', icon: '⚡', desc: 'Caça-níquel tem chance tripla de alinhar 7️⃣ e 💎!' },
      { id: 'vip_night', name: 'Noite VIP', icon: '🎩', desc: '15% de cashback em dinheiro devolvido em qualquer derrota!' },
      { id: 'jackpot_fever', name: 'Febre do Jackpot', icon: '🎰', desc: 'Todos os jackpots pagam +50% a mais neste andar!' }
    ];
  }

  getQuotaForFloor(floor) {
    const quotas = [0, 250, 650, 1500, 3200, 7000, 15000, 35000, 100000];
    if (floor < quotas.length) return quotas[floor];
    return Math.floor(quotas[quotas.length - 1] * Math.pow(2.2, floor - quotas.length + 1));
  }

  getMinBetForFloor(floor = this.floor) {
    const mins = [0, 15, 50, 150, 350, 800, 1800, 4000, 10000];
    if (floor < mins.length) return mins[floor];
    return Math.round(this.getQuotaForFloor(floor) * 0.12);
  }

  getDynamicChips(floor = this.floor) {
    const min = this.getMinBetForFloor(floor);
    const rawChips = [
      min,
      Math.max(min * 2, Math.round((min * 2.5) / 5) * 5),
      Math.max(min * 4, Math.round((min * 5) / 10) * 10),
      Math.max(min * 8, Math.round((min * 10) / 25) * 25)
    ];

    const cleanRound = (v) => {
      if (v < 100) return Math.round(v / 5) * 5;
      if (v < 1000) return Math.round(v / 25) * 25;
      if (v < 10000) return Math.round(v / 100) * 100;
      return Math.round(v / 500) * 500;
    };

    return [...new Set(rawChips.map(cleanRound))];
  }

  getStepForFloor(floor = this.floor) {
    const min = this.getMinBetForFloor(floor);
    if (min < 50) return 5;
    if (min < 200) return 25;
    if (min < 1000) return 100;
    if (min < 3000) return 250;
    return 500;
  }

  hasRelic(id) {
    return this.relics.some(r => r.id === id);
  }

  addRelic(relic) {
    if (!this.hasRelic(relic.id)) {
      this.relics.push(relic);
      this.triggerStateChange();
    }
  }

  hasWheelUpgrade(id) {
    return this.wheelUpgrades.some(u => u.id === id);
  }

  addWheelUpgrade(upgrade) {
    if (!this.hasWheelUpgrade(upgrade.id)) {
      this.wheelUpgrades.push(upgrade);
      this.triggerStateChange();
    }
  }

  addCash(amount) {
    let finalAmount = amount;
    // Platinum Chip relic adds +25% to all winnings
    if (amount > 0 && this.hasRelic('platinum_chip')) {
      finalAmount = Math.round(amount * 1.25);
    }

    this.cash += finalAmount;
    if (finalAmount > 0) {
      this.stats.totalWon += finalAmount;
      if (finalAmount > this.stats.biggestWin) {
        this.stats.biggestWin = finalAmount;
      }
    }
    this.triggerStateChange();
    return finalAmount;
  }

  deductCash(amount) {
    this.cash -= amount;
    this.triggerStateChange();
    return this.cash;
  }

  // Simplified: only checks for bankrupt or quota reached
  // NO round limit — player bets as long as they have money or haven't met quota
  checkGameCondition() {
    this.stats.betsPlaced++;
    // Track cash history on every bet
    this.cashHistory.push(this.cash);
    this.triggerStateChange();

    if (this.cash <= 0) {
      return { status: 'BANKRUPT' };
    }

    if (this.cash >= this.quota) {
      return { status: 'QUOTA_REACHED' };
    }

    return { status: 'CONTINUE' };
  }

  hasConsumable(type) {
    return (this.consumables[type] || 0) > 0;
  }

  useConsumable(type) {
    if (!this.hasConsumable(type)) return false;
    this.consumables[type]--;
    this.stats.consumablesUsed++;
    this.triggerStateChange();
    return true;
  }

  addConsumable(type, count = 1) {
    this.consumables[type] = (this.consumables[type] || 0) + count;
    this.triggerStateChange();
  }

  nextFloor() {
    // Interest Piggy relic: +10% cash bonus on completing a floor
    if (this.hasRelic('interest_piggy')) {
      const interest = Math.round(this.cash * 0.10);
      this.cash += interest;
    }

    this.floor++;
    // Pay rent/quota
    this.cash -= this.quota;
    this.quota = this.getQuotaForFloor(this.floor);
    this.isFloorCleared = false;
    this.rerollCost = 40 + (this.floor - 1) * 20;

    // Clear one-round consumable buffs
    this.activeMagnet = false;
    this.activeDoublePotion = false;
    this.activeInsurance = false;

    // Track cash in history
    this.cashHistory.push(this.cash);

    // Gamble Friend Loan Shark Anomaly (Floor 2+)
    if (this.floor >= 2) {
      const mods = this.getPossibleModifiers();
      this.floorModifier = mods[Math.floor(Math.random() * mods.length)];
    } else {
      this.floorModifier = null;
    }

    this.triggerStateChange();
  }

  subscribe(callback) {
    if (!this.listeners) this.listeners = [];
    this.listeners.push(callback);
  }

  triggerStateChange() {
    if (this.listeners) {
      this.listeners.forEach(cb => cb(this));
    }
  }
}

window.gameState = new GameState();
