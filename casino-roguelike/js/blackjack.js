// High-Stakes Blackjack Engine with Dungeons & Degenerate Gamblers Special Cards
class BlackjackTable {
  constructor() {
    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.currentBet = 50;
    this.isPlaying = false;
    this.dealerHidden = true;

    this.suits = [
      { name: 'hearts', symbol: '♥', color: '#e74c3c' },
      { name: 'diamonds', symbol: '♦', color: '#e74c3c' },
      { name: 'clubs', symbol: '♣', color: '#2c3e50' },
      { name: 'spades', symbol: '♠', color: '#2c3e50' }
    ];

    this.values = [
      { name: '2', val: 2 }, { name: '3', val: 3 }, { name: '4', val: 4 },
      { name: '5', val: 5 }, { name: '6', val: 6 }, { name: '7', val: 7 },
      { name: '8', val: 8 }, { name: '9', val: 9 }, { name: '10', val: 10 },
      { name: 'J', val: 10 }, { name: 'Q', val: 10 }, { name: 'K', val: 10 },
      { name: 'A', val: 11 }
    ];

    this.init();
  }

  init() {
    this.buildDeck();
    this.setupControls();
  }

  buildDeck() {
    this.deck = [];
    // 4 standard decks in shoe for realistic distribution
    for (let d = 0; d < 4; d++) {
      for (const suit of this.suits) {
        for (const val of this.values) {
          this.deck.push({ ...val, suit: suit.symbol, color: suit.color, suitName: suit.name });
        }
      }
    }

    // Dungeons & Degenerate Gamblers - Special Cards
    this.deck.push(
      { name: '🃏', val: 0, isJoker: true, suit: '⭐', color: '#9b59b6', suitName: 'cosmic', title: 'Curinga Cósmico' },
      { name: '🃏', val: 0, isJoker: true, suit: '⭐', color: '#9b59b6', suitName: 'cosmic', title: 'Curinga Cósmico' },
      { name: '🛡️', val: 10, isShield: true, suit: '🔮', color: '#00d2d3', suitName: 'taro', title: 'Carta Escudo (Tarô)' },
      { name: '🛡️', val: 10, isShield: true, suit: '🔮', color: '#00d2d3', suitName: 'taro', title: 'Carta Escudo (Tarô)' },
      { name: 'A', val: 11, isGoldAce: true, suit: '💰', color: '#f1c40f', suitName: 'gold', title: 'Ás de Ouro 3x' },
      { name: 'A', val: 11, isGoldAce: true, suit: '💰', color: '#f1c40f', suitName: 'gold', title: 'Ás de Ouro 3x' }
    );

    this.shuffle();
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Peek top card for Spyglass consumable
  peekNextCard() {
    if (this.deck.length === 0) this.buildDeck();
    return this.deck[this.deck.length - 1];
  }

  setupControls() {
    const dealBtn = document.getElementById('bj-deal-btn');
    const hitBtn = document.getElementById('bj-hit-btn');
    const standBtn = document.getElementById('bj-stand-btn');
    const doubleBtn = document.getElementById('bj-double-btn');

    if (dealBtn) dealBtn.addEventListener('click', () => this.startHand());
    if (hitBtn) hitBtn.addEventListener('click', () => this.hit());
    if (standBtn) standBtn.addEventListener('click', () => this.stand());
    if (doubleBtn) doubleBtn.addEventListener('click', () => this.doubleDown());

    const chipBtns = document.querySelectorAll('.bj-chip-btn');
    chipBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.isPlaying) return;
        const val = parseInt(e.currentTarget.dataset.val, 10);
        this.currentBet = Math.min(window.gameState.cash, val);
        this.updateBetDisplay();
        window.soundFX.playChip();
      });
    });

    const allInBtn = document.getElementById('bj-allin-btn');
    if (allInBtn) {
      allInBtn.addEventListener('click', () => {
        if (this.isPlaying) return;
        this.currentBet = window.gameState.cash;
        this.updateBetDisplay();
        window.soundFX.playChip();
      });
    }

    this.updateBetDisplay();
  }

  updateBetDisplay() {
    const betEl = document.getElementById('bj-current-bet');
    if (betEl) {
      betEl.innerText = `$${this.currentBet}`;
    }
  }

  calculateScore(hand) {
    let score = 0;
    let aces = 0;
    let jokers = 0;
    let shields = [];

    for (const card of hand) {
      if (card.isJoker) {
        jokers++;
      } else if (card.isShield) {
        shields.push(card);
        score += 10;
      } else {
        score += card.val;
        if (card.name === 'A') aces++;
      }
    }

    // Soft Aces adjustment
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    // Cosmic Joker adjustment (fits the best needed value)
    while (jokers > 0) {
      const needed = 21 - score;
      if (needed >= 1 && needed <= 11) {
        score += needed;
      } else if (score < 21) {
        score += Math.min(10, 21 - score);
      } else {
        score += 1;
      }
      jokers--;
    }

    // Shield adjustment (prevents bust)
    if (score > 21 && shields.length > 0) {
      score = 21; // Shield absorbs bust and caps at 21!
      shields.forEach(s => s.shieldTriggered = true);
    }

    return score;
  }

  drawCard(guaranteeAce = false) {
    if (this.deck.length < 15) {
      this.buildDeck();
    }
    if (guaranteeAce) {
      const aceIdx = this.deck.findIndex(c => c.name === 'A');
      if (aceIdx !== -1) {
        return this.deck.splice(aceIdx, 1)[0];
      }
    }
    return this.deck.pop();
  }

  startHand() {
    if (this.isPlaying) return;
    if (window.gameState.cash <= 0) {
      window.particles.spawnFloatingText('SEM DINHEIRO!', window.innerWidth / 2, window.innerHeight / 2, '#ff4757');
      return;
    }

    // Clamp bet to available cash
    if (this.currentBet <= 0 || this.currentBet > window.gameState.cash) {
      this.currentBet = Math.min(window.gameState.cash, window.gameState.getMinBetForFloor());
      this.updateBetDisplay();
    }

    // Deduct bet (save actual bet amount before deducting)
    const betCost = this.currentBet;
    window.gameState.deductCash(betCost);
    this.activeBet = betCost;

    this.isPlaying = true;
    this.dealerHidden = true;
    this.playerHand = [];
    this.dealerHand = [];

    this.setButtonsState({ deal: false, hit: true, stand: true, double: window.gameState.cash >= betCost });

    const isBlindMod = window.gameState.floorModifier?.id === 'dealer_blind';
    if (isBlindMod) {
      this.setDealerMessage("🕶️ BLEFE CEGO ATIVO: Não olhe minhas cartas! Vitória paga 2.5x!");
    } else {
      this.setDealerMessage("Façam suas apostas... As cartas foram dadas!");
    }

    // Deal sequence with delay for fluid animation
    const hasAceCheat = window.gameState.hasRelic('ace_in_sleeve');

    window.soundFX.playCardSlide();
    this.playerHand.push(this.drawCard(hasAceCheat));
    this.renderHands();

    setTimeout(() => {
      window.soundFX.playCardSlide();
      this.dealerHand.push(this.drawCard());
      this.renderHands();
    }, 250);

    setTimeout(() => {
      window.soundFX.playCardSlide();
      this.playerHand.push(this.drawCard());
      this.renderHands();
    }, 500);

    setTimeout(() => {
      window.soundFX.playCardSlide();
      this.dealerHand.push(this.drawCard());
      this.renderHands();
      this.checkNaturalBlackjack();
    }, 750);
  }

  checkNaturalBlackjack() {
    const playerScore = this.calculateScore(this.playerHand);
    if (playerScore === 21) {
      this.dealerHidden = false;
      this.renderHands();
      const dealerScore = this.calculateScore(this.dealerHand);

      if (dealerScore === 21) {
        this.finishHand('Empate! Ambos têm Blackjack.', this.currentBet, 'PUSH');
      } else {
        // Gold Ace Blackjack gives 3.0x payout!
        const hasGoldAce = this.playerHand.some(c => c.isGoldAce);
        const mult = hasGoldAce ? 3.0 : 2.5;
        const payout = Math.round(this.currentBet * mult);
        const title = hasGoldAce ? '💰 ÁS DE OURO! BLACKJACK 3:1!' : 'BLACKJACK NATURAL! Pagamento 3:2';
        this.finishHand(title, payout, 'BLACKJACK');
      }
    }
  }

  hit() {
    if (!this.isPlaying) return;
    window.soundFX.playCardSlide();
    const card = this.drawCard();
    this.playerHand.push(card);
    this.renderHands();

    const doubleBtn = document.getElementById('bj-double-btn');
    if (doubleBtn) doubleBtn.disabled = true;

    if (card.isJoker) {
      window.particles.spawnFloatingText('🃏 CURINGA CÓSMICO!', window.innerWidth / 2, window.innerHeight / 2 - 40, '#9b59b6', 26);
    } else if (card.isShield) {
      window.particles.spawnFloatingText('🛡️ CARTA ESCUDO EQUIPADA!', window.innerWidth / 2, window.innerHeight / 2 - 40, '#00d2d3', 26);
    }

    const score = this.calculateScore(this.playerHand);
    if (score > 21) {
      // Player busts
      this.dealerHidden = false;
      this.renderHands();
      this.finishHand('ESTOUROU! Você passou de 21.', 0, 'BUST');
    } else if (score === 21) {
      // Auto-stand on 21
      this.stand();
    }
  }

  doubleDown() {
    const extraBet = Math.min(this.activeBet, window.gameState.cash);
    if (!this.isPlaying || extraBet <= 0) return;
    window.gameState.deductCash(extraBet);
    this.activeBet += extraBet;
    this.currentBet = this.activeBet;
    this.updateBetDisplay();
    this.isDoubled = true;

    window.soundFX.playCardSlide();
    this.playerHand.push(this.drawCard());
    this.renderHands();

    const score = this.calculateScore(this.playerHand);
    if (score > 21) {
      this.dealerHidden = false;
      this.renderHands();
      this.finishHand('ESTOUROU NO DOBRO!', 0, 'BUST');
    } else {
      this.stand();
    }
  }

  stand() {
    if (!this.isPlaying) return;
    this.dealerHidden = false;
    this.setButtonsState({ deal: false, hit: false, stand: false, double: false });
    this.renderHands();

    this.playDealerTurn();
  }

  playDealerTurn() {
    const playStep = () => {
      const dealerScore = this.calculateScore(this.dealerHand);
      if (dealerScore < 17) {
        window.soundFX.playCardSlide();
        this.dealerHand.push(this.drawCard());
        this.renderHands();
        setTimeout(playStep, 500);
      } else {
        this.evaluateWinner();
      }
    };
    setTimeout(playStep, 400);
  }

  evaluateWinner() {
    const pScore = this.calculateScore(this.playerHand);
    const dScore = this.calculateScore(this.dealerHand);

    let winMult = 2.0;
    // Floor modifier: dealer_blind pays 2.5x
    if (window.gameState.floorModifier?.id === 'dealer_blind') {
      winMult = 2.5;
    }
    // Floor modifier: high_volatility
    if (window.gameState.floorModifier?.id === 'high_volatility') {
      winMult = Math.round(winMult * 1.5 * 10) / 10;
    }

    if (dScore > 21) {
      const payout = Math.round(this.currentBet * winMult);
      this.finishHand(`Dealer estourou com ${dScore}! Você venceu!`, payout, 'WIN');
    } else if (pScore > dScore) {
      const payout = Math.round(this.currentBet * winMult);
      this.finishHand(`Você venceu com ${pScore} contra ${dScore} do Dealer!`, payout, 'WIN');
    } else if (pScore < dScore) {
      this.finishHand(`Dealer venceu com ${dScore} contra seus ${pScore}.`, 0, 'LOSE');
    } else {
      this.finishHand(`Empate com ${pScore}. Aposta devolvida.`, this.currentBet, 'PUSH');
    }
  }

  finishHand(message, payout, type) {
    this.isPlaying = false;
    this.setDealerMessage(message);
    this.setButtonsState({ deal: true, hit: false, stand: false, double: false });

    const playerBox = document.getElementById('bj-player-cards');
    const rect = playerBox ? playerBox.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const centerX = rect.left + 100;
    const centerY = rect.top;

    const betRef = this.activeBet || this.currentBet;

    if (this.isDoubled && window.gameState.hasRelic('bj_double_master') && (type === 'WIN' || type === 'BLACKJACK')) {
      payout = Math.round(payout * 1.5);
    }

    if (type === 'WIN' || type === 'BLACKJACK') {
      if (window.gameState.activeDoublePotion) {
        payout *= 2;
        window.gameState.activeDoublePotion = false;
        window.particles.spawnFloatingText('🧪 TÔNICO 2x DUPLICOU O PRÊMIO!', centerX, centerY - 80, '#e056fd', 30);
      }
      window.soundFX.playWin();
      window.particles.spawnCoins(centerX, centerY, 40);
      window.particles.spawnFloatingText(`+ $${payout.toLocaleString()}!`, centerX, centerY - 50, '#2ecc71', 32);
      // Add cash BEFORE checking condition
      window.gameState.addCash(payout);
    } else if (type === 'PUSH') {
      window.soundFX.playChip();
      window.particles.spawnFloatingText(`Empate: +$${payout.toLocaleString()}`, centerX, centerY - 40, '#f1c40f', 26);
      window.gameState.addCash(payout);
    } else {
      // Loss or Bust
      window.soundFX.playLoss();
      window.particles.screenShake(6, 200);
      window.particles.spawnFloatingText(`Derrota! -$${betRef.toLocaleString()}`, centerX, centerY - 40, '#ff4757', 28);

      if (window.gameState.activeInsurance) {
        const refund = Math.round(betRef * 0.75);
        window.gameState.addCash(refund);
        window.gameState.activeInsurance = false;
        window.particles.spawnFloatingText(`🛡️ SEGURO REEMBOLSOU 75%: +$${refund.toLocaleString()}!`, centerX, centerY - 70, '#2ecc71', 28);
      }

      // VIP Night cashback (15%)
      if (window.gameState.floorModifier?.id === 'vip_night') {
        const cashBack = Math.round(betRef * 0.15);
        if (cashBack > 0) {
          window.gameState.addCash(cashBack);
          window.particles.spawnFloatingText(`🎩 Cashback VIP: +$${cashBack}`, centerX, centerY - 95, '#ffd700', 22);
        }
      }
    }

    this.isDoubled = false;
    this.activeBet = 0;
    window.gameState.stats.blackjackHands++;
    // Check game condition AFTER all payouts applied
    const result = window.gameState.checkGameCondition();
    window.app.handleGameCondition(result);
  }

  setDealerMessage(msg) {
    const el = document.getElementById('bj-dealer-speech');
    if (el) el.innerText = msg;
  }

  setButtonsState({ deal, hit, stand, double }) {
    const dealBtn = document.getElementById('bj-deal-btn');
    const hitBtn = document.getElementById('bj-hit-btn');
    const standBtn = document.getElementById('bj-stand-btn');
    const doubleBtn = document.getElementById('bj-double-btn');

    if (dealBtn) dealBtn.disabled = !deal;
    if (hitBtn) hitBtn.disabled = !hit;
    if (standBtn) standBtn.disabled = !stand;
    if (doubleBtn) doubleBtn.disabled = !double;
  }

  createCardElement(card, isHidden = false) {
    const cardEl = document.createElement('div');
    let specialClass = '';
    if (card.isJoker) specialClass = 'card-joker';
    if (card.isShield) specialClass = 'card-shield';
    if (card.isGoldAce) specialClass = 'card-gold-ace';

    cardEl.className = `playing-card ${isHidden ? 'face-down' : 'face-up'} ${specialClass}`;

    if (isHidden) {
      const hasDealerTell = window.gameState.hasRelic('dealer_tells');
      if (hasDealerTell) {
        cardEl.classList.add('dealer-tell');
        cardEl.innerHTML = `
          <div class="card-inner-peek">
            <span style="color:${card.color}">${card.name}${card.suit}</span>
            <small>(Raio-X)</small>
          </div>
        `;
      } else {
        cardEl.innerHTML = `<div class="card-back-pattern">♠️</div>`;
      }
    } else {
      const badgeHtml = card.title ? `<div class="card-special-label">${card.title}</div>` : '';
      cardEl.innerHTML = `
        <div class="card-corner top-left" style="color:${card.color}">
          <span>${card.name}</span>
          <span>${card.suit}</span>
        </div>
        <div class="card-center" style="color:${card.color}">
          <span>${card.suit}</span>
          ${badgeHtml}
        </div>
        <div class="card-corner bottom-right" style="color:${card.color}">
          <span>${card.name}</span>
          <span>${card.suit}</span>
        </div>
      `;
    }
    return cardEl;
  }

  renderHands() {
    const dealerContainer = document.getElementById('bj-dealer-cards');
    const playerContainer = document.getElementById('bj-player-cards');
    const dealerScoreEl = document.getElementById('bj-dealer-score');
    const playerScoreEl = document.getElementById('bj-player-score');

    const isBlindMod = window.gameState.floorModifier?.id === 'dealer_blind';

    if (dealerContainer) {
      dealerContainer.innerHTML = '';
      this.dealerHand.forEach((card, idx) => {
        // Blind modifier hides both dealer cards when dealerHidden is true
        const isHidden = this.dealerHidden && (idx === 1 || (isBlindMod && idx === 0));
        dealerContainer.appendChild(this.createCardElement(card, isHidden));
      });
    }

    if (playerContainer) {
      playerContainer.innerHTML = '';
      this.playerHand.forEach(card => {
        playerContainer.appendChild(this.createCardElement(card, false));
      });
    }

    if (playerScoreEl) {
      playerScoreEl.innerText = this.calculateScore(this.playerHand);
    }

    if (dealerScoreEl) {
      if (this.dealerHidden) {
        if (isBlindMod) {
          dealerScoreEl.innerText = '?';
        } else {
          dealerScoreEl.innerText = this.dealerHand.length > 0 ? this.calculateScore([this.dealerHand[0]]) : 0;
        }
      } else {
        dealerScoreEl.innerText = this.calculateScore(this.dealerHand);
      }
    }
  }

  updateUIState() {
    this.updateBetDisplay();
    this.setButtonsState({ deal: true, hit: false, stand: false, double: false });
  }
}

window.BlackjackTable = BlackjackTable;
