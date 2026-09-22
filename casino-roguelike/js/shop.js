// Shady Relics, Bingle Bingle Wheel Workshop & VIP Services Engine (No Fish)
class RelicShop {
  constructor() {
    // Expanded Relics Pool across Rarities & Minigames
    this.allRelics = [
      // --- Roleta / Wheel Mods (Bingle Bingle) ---
      {
        id: 'golden_paint',
        name: 'Tinta Dourada (Bingle Bingle)',
        icon: '🎨',
        type: 'wheel',
        rarity: 'common',
        cost: 110,
        desc: 'Converte um setor 0.5x da Roleta em um setor 2.5x Dourado permanentemente.'
      },
      {
        id: 'safety_buoy',
        name: 'Bóia Salva-Vidas (Bingle Bingle)',
        icon: '🛟',
        type: 'wheel',
        rarity: 'common',
        cost: 130,
        desc: 'Converte o setor 0x (Tudo Perdido) em um setor Seguro 1.0x permanentemente.'
      },
      {
        id: 'energized_pegs',
        name: 'Pinos Energizados (Bingle Bingle)',
        icon: '⚡',
        type: 'wheel',
        rarity: 'rare',
        cost: 280,
        desc: 'Adiciona +0.3x a todos os multiplicadores positivos da roleta permanentemente.'
      },
      {
        id: 'double_ball',
        name: 'Esfera Dupla (Bingle Bingle)',
        icon: '⚪',
        type: 'wheel',
        rarity: 'epic',
        cost: 550,
        desc: 'Gira com 2 bolas simultâneas na roleta e mantém o maior multiplicador!'
      },
      {
        id: 'golden_wheel',
        name: 'Roda de Puro Ouro',
        icon: '🌟',
        type: 'wheel',
        rarity: 'legendary',
        cost: 1600,
        desc: 'Converte todos os setores baixos (≤1.0x) em setores 3.5x Hiper-Dourados!'
      },
      {
        id: 'extra_sector',
        name: 'Setor Extra (Bingle Bingle)',
        icon: '🎁',
        type: 'wheel',
        rarity: 'rare',
        cost: 350,
        desc: 'Adiciona um setor extra 2.0x à roleta substituindo um setor 0.5x.'
      },

      // --- Blackjack High-Stakes ---
      {
        id: 'dealer_tells',
        name: 'Óculos Raio-X',
        icon: '👓',
        type: 'relic',
        rarity: 'common',
        cost: 140,
        desc: 'Permite ver a carta secreta virada para baixo do Dealer no Blackjack.'
      },
      {
        id: 'ace_in_sleeve',
        name: 'Ás na Manga',
        icon: '🃏',
        type: 'relic',
        rarity: 'rare',
        cost: 320,
        desc: 'Sua primeira carta em qualquer mão de Blackjack é sempre um Ás garantido.'
      },
      {
        id: 'bj_double_master',
        name: 'Mãos Firmes',
        icon: '💪',
        type: 'relic',
        rarity: 'rare',
        cost: 380,
        desc: 'Vencer após Dobrar (Double Down) no Blackjack paga 3x a aposta!'
      },
      {
        id: 'cosmic_joker',
        name: 'Curinga Astral',
        icon: '✨',
        type: 'relic',
        rarity: 'epic',
        cost: 700,
        desc: 'Adiciona 2 cartas Curinga ao baralho que transformam sua mão em 21 automaticamente.'
      },
      {
        id: 'shield_deck',
        name: 'Baralho Blindado de Tarô',
        icon: '🛡️',
        type: 'relic',
        rarity: 'legendary',
        cost: 1300,
        desc: 'Adiciona 3 Cartas Escudo de Tarô que impedem qualquer mão de estourar acima de 21.'
      },

      // --- Quantum Slots ---
      {
        id: 'golden_reel',
        name: 'Cilindro Dourado',
        icon: '🎰',
        type: 'relic',
        rarity: 'common',
        cost: 150,
        desc: 'Aumenta significativamente a chance de símbolos 7️⃣ e 💎 no Caça-Níquel.'
      },
      {
        id: 'cyber_cherry',
        name: 'Cereja Atômica',
        icon: '🍒',
        type: 'relic',
        rarity: 'common',
        cost: 120,
        desc: 'Qualquer combinação de cerejas no caça-níquel paga 5x a aposta por giro.'
      },
      {
        id: 'quantum_overload',
        name: 'Sobrecarga Quântica',
        icon: '⚡',
        type: 'relic',
        rarity: 'rare',
        cost: 420,
        desc: 'Todos os Giros Grátis têm multiplicador triplo (3x) em todos os prêmios!'
      },
      {
        id: 'jackpot_accelerator',
        name: 'Acelerador 777',
        icon: '🚀',
        type: 'relic',
        rarity: 'epic',
        cost: 850,
        desc: 'O JACKPOT de três 7️⃣ no Caça-Níquel agora paga extraordinários 100x a aposta!'
      },

      // --- Plinko Caótico ---
      {
        id: 'rubber_pegs',
        name: 'Pinos de Borracha',
        icon: '🎾',
        type: 'relic',
        rarity: 'common',
        cost: 130,
        desc: 'Aumenta o salto das bolas no Plinko, facilitando trajetórias para potes altos.'
      },
      {
        id: 'twin_balls',
        name: 'Esferas Gêmeas',
        icon: '🔵',
        type: 'relic',
        rarity: 'rare',
        cost: 450,
        desc: 'Cada drop no Plinko solta uma bola extra gratuita junto com as apostadas!'
      },
      {
        id: 'center_magnet',
        name: 'Ímã Central',
        icon: '🧲',
        type: 'relic',
        rarity: 'epic',
        cost: 750,
        desc: 'Puxa bolas do Plinko em direção ao pote central com mais frequência.'
      },
      {
        id: 'jackpot_magnet',
        name: 'Pote Dourado dos Deuses',
        icon: '🎯',
        type: 'relic',
        rarity: 'legendary',
        cost: 1500,
        desc: 'O pote central do Plinko passa a pagar inacreditáveis 50x JACKPOT!'
      },

      // --- Economia & Trapaças Globais ---
      {
        id: 'interest_piggy',
        name: 'Cofre Suíço',
        icon: '🐷',
        type: 'relic',
        rarity: 'rare',
        cost: 350,
        desc: 'Rende +10% de juros compostos sobre toda a sua banca ao superar cada andar!'
      },
      {
        id: 'black_card',
        name: 'Cartão VIP Black',
        icon: '💳',
        type: 'relic',
        rarity: 'epic',
        cost: 600,
        desc: 'Concede 20% de desconto permanente em todas as relíquias e itens da loja.'
      },
      {
        id: 'platinum_chip',
        name: 'Ficha de Platina',
        icon: '💎',
        type: 'relic',
        rarity: 'rare',
        cost: 500,
        desc: 'Aumenta todos os ganhos de todas as mesas em +25% permanente.'
      },
      {
        id: 'shark_loan',
        name: 'Pacto do Agiota',
        icon: '🦈',
        type: 'relic',
        rarity: 'common',
        cost: 0,
        desc: 'Receba +$300 imediatamente, mas a meta do andar aumenta em +$400.'
      },
      {
        id: 'quota_reducer',
        name: 'Suborno ao Fiscal',
        icon: '💸',
        type: 'relic',
        rarity: 'rare',
        cost: 400,
        desc: 'Reduz permanentemente a meta do andar atual em -10% (não acumula acima de 30%).'
      },
      {
        id: 'lucky_horseshoe',
        name: 'Ferradura da Sorte',
        icon: '🧲',
        type: 'relic',
        rarity: 'epic',
        cost: 900,
        desc: 'Em qualquer derrota, 25% de chance de anular completamente a perda e devolver a aposta!'
      }
    ];

    // Performance Upgrades (new category, replaces fish)
    this.performanceUpgrades = [
      {
        id: 'cash_boost_sm',
        name: 'Maleta de Dinheiro (P)',
        icon: '💰',
        type: 'cash',
        rarity: 'common',
        baseCost: 0,
        baseReward: 50,
        desc: 'Receba dinheiro extra imediatamente para ajudar na meta da fase.'
      },
      {
        id: 'cash_boost_md',
        name: 'Maleta de Dinheiro (M)',
        icon: '💵',
        type: 'cash',
        rarity: 'rare',
        baseCost: 0,
        baseReward: 150,
        desc: 'Uma quantidade maior de dinheiro extra para impulsionar seu saldo.'
      },
      {
        id: 'cash_boost_lg',
        name: 'Maleta de Dinheiro (G)',
        icon: '🏦',
        type: 'cash',
        rarity: 'epic',
        baseCost: 0,
        baseReward: 400,
        desc: 'Grande injeção de dinheiro para virar o jogo rapidamente.'
      }
    ];

    this.currentStock = {
      relics: [],
      consumables: [],
      performance: []
    };

    this.init();
  }

  init() {
    this.generateFloorStock();

    const rerollBtn = document.getElementById('shop-reroll-btn');
    if (rerollBtn) {
      rerollBtn.addEventListener('click', () => this.reroll());
    }

    this.renderAll();

    window.gameState.subscribe(() => {
      this.renderAll();
    });
  }

  getDiscountMultiplier() {
    return window.gameState.hasRelic('black_card') ? 0.8 : 1.0;
  }

  getAdjustedCost(baseCost) {
    if (baseCost === 0) return 0;
    return Math.round(baseCost * this.getDiscountMultiplier());
  }

  generateFloorStock() {
    const floor = window.gameState.floor || 1;

    // 1. Pick 3 unowned relics
    const unownedRelics = this.allRelics.filter(r => {
      const isWheel = r.type === 'wheel';
      return isWheel ? !window.gameState.hasWheelUpgrade(r.id) : !window.gameState.hasRelic(r.id);
    });
    const shuffledRelics = [...unownedRelics].sort(() => 0.5 - Math.random());
    this.currentStock.relics = shuffledRelics.slice(0, 3);

    // 2. Consumables list with floor scaling price
    const consumableBases = [
      { id: 'spyglass', name: 'Lupa do Cassino', icon: '🔍', baseCost: 35, desc: 'Espia a carta oculta do Dealer ou prevê os Slots.' },
      { id: 'magnet', name: 'Ímã da Roleta', icon: '🧲', baseCost: 55, desc: 'Salva do 0x no próximo giro da Roleta.' },
      { id: 'energy_drink', name: 'Café Expresso', icon: '☕', baseCost: 60, desc: `Dá +5% da meta como dinheiro extra imediatamente ($${Math.round(window.gameState.quota * 0.05)}).` },
      { id: 'double_potion', name: 'Tônico da Sorte (2x)', icon: '🧪', baseCost: 95, desc: 'Dobra (2x) o pagamento em dinheiro da sua próxima vitória!' },
      { id: 'insurance_policy', name: 'Apólice de Seguro', icon: '🛡️', baseCost: 65, desc: 'Reembolsa 75% do valor da aposta caso você perca.' }
    ];

    this.currentStock.consumables = consumableBases.map(c => ({
      ...c,
      cost: Math.round((c.baseCost + (floor - 1) * 20) * this.getDiscountMultiplier())
    }));

    // 3. Performance items (cash boosts scaled by floor)
    const quotaPercents = [0.08, 0.18, 0.35]; // 8%, 18%, 35% of quota
    const rarities = ['common', 'rare', 'epic'];
    const icons = ['💰', '💵', '🏦'];
    const names = ['Maleta de Dinheiro (P)', 'Maleta de Dinheiro (M)', 'Maleta de Dinheiro (G)'];

    this.currentStock.performance = quotaPercents.map((pct, i) => {
      const reward = Math.round(window.gameState.quota * pct);
      const cost = Math.round(reward * 0.55 * this.getDiscountMultiplier()); // buy for 55% of value
      return {
        id: `cash_boost_${i}`,
        name: names[i],
        icon: icons[i],
        type: 'cash',
        rarity: rarities[i],
        reward,
        cost,
        desc: `Receba $${reward.toLocaleString()} em dinheiro imediatamente. Custo: $${cost.toLocaleString()}.`
      };
    });
  }

  reroll() {
    const gs = window.gameState;
    const cost = Math.round(gs.rerollCost * this.getDiscountMultiplier());

    if (gs.cash < cost) {
      if (window.particles) {
        window.particles.spawnFloatingText('Saldo insuficiente para reabastecer!', window.innerWidth / 2, window.innerHeight / 2, '#ff4757');
      }
      if (window.soundFX) window.soundFX.playLoss();
      return;
    }

    gs.deductCash(cost);
    gs.rerollCost += 25;

    this.generateFloorStock();
    this.renderAll();

    if (window.soundFX) window.soundFX.playChip();
    if (window.particles) {
      window.particles.spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 20);
      window.particles.spawnFloatingText('Estoque Renovado!', window.innerWidth / 2, window.innerHeight / 2 - 40, '#00ffcc', 28);
    }
  }

  renderAll() {
    this.updateRerollButton();
    this.renderRelics();
    this.renderConsumables();
    this.renderPerformance();
    this.renderActiveRelics();
  }

  updateRerollButton() {
    const costEl = document.getElementById('shop-reroll-cost');
    const btn = document.getElementById('shop-reroll-btn');
    if (!costEl || !btn) return;

    const cost = Math.round(window.gameState.rerollCost * this.getDiscountMultiplier());
    costEl.innerText = `$${cost.toLocaleString()}`;
    btn.disabled = window.gameState.cash < cost;
  }

  renderRelics() {
    const container = document.getElementById('shop-items-container');
    if (!container) return;
    container.innerHTML = '';

    if (this.currentStock.relics.length === 0) {
      container.innerHTML = `<div class="shop-empty-msg">Todas as relíquias deste andar foram adquiridas! Reabasteça para novas opções.</div>`;
      return;
    }

    this.currentStock.relics.forEach(relic => {
      const isWheelUpgrade = relic.type === 'wheel';
      const isOwned = isWheelUpgrade
        ? window.gameState.hasWheelUpgrade(relic.id)
        : window.gameState.hasRelic(relic.id);

      const actualCost = this.getAdjustedCost(relic.cost);
      const canAfford = window.gameState.cash >= actualCost;

      const itemCard = document.createElement('div');
      itemCard.className = `shop-item-card rarity-${relic.rarity || 'common'} ${isOwned ? 'owned' : ''} ${isWheelUpgrade ? 'wheel-upgrade-card' : ''}`;
      itemCard.innerHTML = `
        <div class="shop-item-header">
          <span class="shop-item-icon">${relic.icon}</span>
          <div>
            <h4>${relic.name} <span class="rarity-badge ${relic.rarity || 'common'}">${(relic.rarity || 'Comum').toUpperCase()}</span></h4>
            <span class="shop-item-cost">${actualCost === 0 ? 'GRÁTIS' : '$' + actualCost.toLocaleString()}</span>
          </div>
        </div>
        <p class="shop-item-desc">${relic.desc}</p>
        <button class="buy-relic-btn btn-luxury" ${isOwned || !canAfford ? 'disabled' : ''}>
          ${isOwned ? 'Instalado ✓' : (isWheelUpgrade ? 'Modificar Roleta' : 'Comprar Relíquia')}
        </button>
      `;

      const btn = itemCard.querySelector('.buy-relic-btn');
      if (btn && !isOwned && canAfford) {
        btn.addEventListener('click', () => this.buyRelic(relic, actualCost));
      }

      container.appendChild(itemCard);
    });
  }

  buyRelic(relic, cost) {
    if (window.gameState.cash < cost) return;

    window.gameState.deductCash(cost);

    if (relic.type === 'wheel') {
      window.gameState.addWheelUpgrade(relic);
      if (window.particles) {
        window.particles.spawnFloatingText(`🎡 Roleta Modificada: ${relic.name}!`, window.innerWidth / 2, window.innerHeight / 2 - 50, '#f1c40f', 28);
      }
    } else {
      window.gameState.addRelic(relic);
      if (window.particles) {
        window.particles.spawnFloatingText(`Relíquia: ${relic.name}!`, window.innerWidth / 2, window.innerHeight / 2 - 50, '#00ffcc', 28);
      }
    }

    if (relic.id === 'shark_loan') {
      window.gameState.addCash(300);
      window.gameState.quota += 400;
      if (window.particles) {
        window.particles.spawnFloatingText(`+$300! (Meta aumentou +$400!)`, window.innerWidth / 2, window.innerHeight / 2, '#ffae19', 30);
      }
    }

    if (relic.id === 'quota_reducer') {
      const reduction = Math.round(window.gameState.quota * 0.10);
      window.gameState.quota = Math.max(1, window.gameState.quota - reduction);
      if (window.particles) {
        window.particles.spawnFloatingText(`💸 Meta reduzida em $${reduction.toLocaleString()}!`, window.innerWidth / 2, window.innerHeight / 2, '#2ecc71', 30);
      }
    }

    // Remove from current stock
    this.currentStock.relics = this.currentStock.relics.filter(r => r.id !== relic.id);
    this.renderAll();

    if (window.soundFX) window.soundFX.playWin();
    if (window.particles) window.particles.spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 35);
  }

  renderConsumables() {
    const container = document.getElementById('shop-consumables-container');
    if (!container) return;
    container.innerHTML = '';

    this.currentStock.consumables.forEach(c => {
      const actualCost = c.cost;
      const canAfford = window.gameState.cash >= actualCost;
      const currentCount = window.gameState.consumables[c.id] || 0;

      const card = document.createElement('div');
      card.className = 'shop-item-card consumable-card';
      card.innerHTML = `
        <div class="shop-item-header">
          <span class="shop-item-icon">${c.icon}</span>
          <div>
            <h4>${c.name} <small style="color:#00ffcc">(Possui: ${currentCount})</small></h4>
            <span class="shop-item-cost">$${actualCost.toLocaleString()}</span>
          </div>
        </div>
        <p class="shop-item-desc">${c.desc}</p>
        <button class="buy-relic-btn btn-luxury" ${!canAfford ? 'disabled' : ''}>
          Comprar Item
        </button>
      `;

      const btn = card.querySelector('.buy-relic-btn');
      if (btn && canAfford) {
        btn.addEventListener('click', () => {
          if (window.gameState.cash < actualCost) return;
          window.gameState.deductCash(actualCost);
          window.gameState.addConsumable(c.id, 1);
          this.renderAll();
          if (window.soundFX) window.soundFX.playChip();
          if (window.particles) {
            window.particles.spawnFloatingText(`+1 ${c.name}!`, window.innerWidth / 2, window.innerHeight / 2, '#00d2d3', 26);
          }
        });
      }

      container.appendChild(card);
    });
  }

  renderPerformance() {
    const container = document.getElementById('shop-performance-container');
    if (!container) return;
    container.innerHTML = '';

    this.currentStock.performance.forEach(item => {
      const canAfford = window.gameState.cash >= item.cost;

      const card = document.createElement('div');
      card.className = `shop-item-card rarity-${item.rarity}`;
      card.innerHTML = `
        <div class="shop-item-header">
          <span class="shop-item-icon">${item.icon}</span>
          <div>
            <h4>${item.name} <span class="rarity-badge ${item.rarity}">${item.rarity.toUpperCase()}</span></h4>
            <span class="shop-item-cost">${item.cost === 0 ? 'GRÁTIS' : '$' + item.cost.toLocaleString()}</span>
          </div>
        </div>
        <p class="shop-item-desc">${item.desc}</p>
        <div style="text-align:center; margin: 0.3rem 0; font-size:0.85rem; color:#ffd700;">
          💰 Retorno: <strong>$${item.reward.toLocaleString()}</strong> (Lucro: +$${(item.reward - item.cost).toLocaleString()})
        </div>
        <button class="buy-relic-btn btn-luxury" ${!canAfford ? 'disabled' : ''}>
          Comprar Dinheiro
        </button>
      `;

      const btn = card.querySelector('.buy-relic-btn');
      if (btn && canAfford) {
        btn.addEventListener('click', () => {
          if (window.gameState.cash < item.cost) return;
          window.gameState.deductCash(item.cost);
          window.gameState.addCash(item.reward);
          // Regenerate performance items so they can be bought again
          this.generateFloorStock();
          this.renderAll();
          if (window.soundFX) window.soundFX.playWin();
          if (window.particles) {
            window.particles.spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 40);
            window.particles.spawnFloatingText(`+$${item.reward.toLocaleString()} Recebido!`, window.innerWidth / 2, window.innerHeight / 2 - 50, '#ffd700', 32);
          }
        });
      }

      container.appendChild(card);
    });
  }

  renderActiveRelics() {
    const container = document.getElementById('hud-relics-list');
    if (!container) return;
    container.innerHTML = '';

    const allActive = [
      ...window.gameState.relics.map(r => ({ ...r, category: 'relic' })),
      ...window.gameState.wheelUpgrades.map(u => ({ ...u, category: 'wheel' }))
    ];

    if (allActive.length === 0) {
      container.innerHTML = `<span class="relic-empty-hint">Nenhuma relíquia ativa (visite a loja para trapaças!)</span>`;
      return;
    }

    allActive.forEach(item => {
      const badge = document.createElement('div');
      badge.className = `relic-badge ${item.category === 'wheel' ? 'badge-wheel-mod' : ''}`;
      badge.title = `${item.name}: ${item.desc}`;
      badge.innerHTML = `<span>${item.icon}</span><small>${item.name}</small>`;
      container.appendChild(badge);
    });
  }
}

window.RelicShop = RelicShop;
