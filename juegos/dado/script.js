// Navegación de pestañas
function switchTab(tab) {
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById('view-' + tab).classList.add('active');
}

// Variables de estado
let stats = {
  total: 0,
  A: 0, // Número impar
  B: 0, // Múltiplo de 3
  C: 0, // A ∩ B
  D: 0  // A ∪ B
};

let isRunning = false;

// Referencias al DOM
const ui = {
  total: document.getElementById('total-count'),
  totalRefs: document.querySelectorAll('.total-ref'),

  diceFace: document.getElementById('dice-face'),
  diceInfo: document.getElementById('dice-info'),

  btnRun: document.getElementById('btn-run'),
  stageText: document.getElementById('stage-text'),

  A: {
    pct: document.getElementById('pct-A'),
    bar: document.getElementById('bar-A'),
    count: document.getElementById('count-A'),
    pool: document.getElementById('pool-A'),
    card: document.getElementById('card-A'),
    colorClass: 'flash-blue',
    colorHex: 'var(--primary)'
  },

  B: {
    pct: document.getElementById('pct-B'),
    bar: document.getElementById('bar-B'),
    count: document.getElementById('count-B'),
    pool: document.getElementById('pool-B'),
    card: document.getElementById('card-B'),
    colorClass: 'flash-green',
    colorHex: 'var(--success)'
  },

  C: {
    pct: document.getElementById('pct-C'),
    bar: document.getElementById('bar-C'),
    count: document.getElementById('count-C'),
    pool: document.getElementById('pool-C'),
    card: document.getElementById('card-C'),
    colorClass: 'flash-warning',
    colorHex: 'var(--warning)'
  },

  D: {
    pct: document.getElementById('pct-D'),
    bar: document.getElementById('bar-D'),
    count: document.getElementById('count-D'),
    pool: document.getElementById('pool-D'),
    card: document.getElementById('card-D'),
    colorClass: 'flash-purple',
    colorHex: 'var(--purple)'
  }
};

// Generar resultado de un dado justo
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// Determinar si un número es impar
function isOdd(n) {
  return n % 2 !== 0;
}

// Determinar si un número es múltiplo de 3
function isMultipleOfThree(n) {
  return n % 3 === 0;
}

// Dibujar la cara del dado usando puntitos
function createDiceDots(result) {
  const dotPositions = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  let html = '';

  for (let i = 1; i <= 9; i++) {
    if (dotPositions[result].includes(i)) {
      html += '<span class="dot active"></span>';
    } else {
      html += '<span class="dot"></span>';
    }
  }

  return html;
}

// Agregar miniatura al historial de cada suceso
function addMiniToken(pool, result, bgColor) {
  const el = document.createElement('div');
  el.className = 'mini-dice';
  el.style.backgroundColor = bgColor;
  el.innerHTML = createMiniDiceDots(result);

  pool.appendChild(el);

  if (pool.children.length > 24) {
    pool.removeChild(pool.firstChild);
  }
}

// Crear mini dado para los historiales
function createMiniDiceDots(result) {
  const dotPositions = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  let html = '';

  for (let i = 1; i <= 9; i++) {
    if (dotPositions[result].includes(i)) {
      html += '<span class="mini-dot active"></span>';
    } else {
      html += '<span class="mini-dot"></span>';
    }
  }

  return html;
}

// Efecto visual cuando un resultado pertenece a un suceso
function highlightCard(evKey, delay) {
  const el = ui[evKey];

  el.card.classList.add(el.colorClass);

  setTimeout(() => {
    el.card.classList.remove(el.colorClass);
  }, delay * 0.8);
}

// Cambiar el aspecto del dado según el resultado
function renderDice(result, animate = true) {
  ui.diceFace.innerHTML = createDiceDots(result);
  ui.diceFace.className = 'dice-face result-' + result;

  if (animate) {
    ui.diceFace.classList.remove('anim-pop');
    void ui.diceFace.offsetWidth;
    ui.diceFace.classList.add('anim-pop');
  }

  const parity = isOdd(result) ? 'impar' : 'par';
  const multiple = isMultipleOfThree(result) ? 'sí es múltiplo de 3' : 'no es múltiplo de 3';

  ui.diceInfo.textContent = `Salió ${result}: es ${parity} y ${multiple}.`;
}

// Refrescar estadísticas en pantalla
function updateUI() {
  ui.total.textContent = stats.total;

  ui.totalRefs.forEach(ref => {
    ref.textContent = stats.total;
  });

  if (stats.total === 0) return;

  ['A', 'B', 'C', 'D'].forEach(ev => {
    ui[ev].count.textContent = stats[ev];

    const p = (stats[ev] / stats.total) * 100;

    ui[ev].pct.textContent = p.toFixed(2) + '%';
    ui[ev].bar.style.width = p + '%';
  });
}

// Lanzamiento y evaluación
function extractToken(animate = true, animDelay = 500) {
  const result = rollDice();

  stats.total++;

  const belongsA = isOdd(result);
  const belongsB = isMultipleOfThree(result);
  const belongsC = belongsA && belongsB;
  const belongsD = belongsA || belongsB;

  if (animate) {
    renderDice(result, true);
  }

  if (belongsA) {
    stats.A++;
    if (animate) {
      highlightCard('A', animDelay);
      addMiniToken(ui.A.pool, result, ui.A.colorHex);
    }
  }

  if (belongsB) {
    stats.B++;
    if (animate) {
      highlightCard('B', animDelay);
      addMiniToken(ui.B.pool, result, ui.B.colorHex);
    }
  }

  if (belongsC) {
    stats.C++;
    if (animate) {
      highlightCard('C', animDelay);
      addMiniToken(ui.C.pool, result, ui.C.colorHex);
    }
  }

  if (belongsD) {
    stats.D++;
    if (animate) {
      highlightCard('D', animDelay);
      addMiniToken(ui.D.pool, result, ui.D.colorHex);
    }
  }

  return result;
}

// Control del botón de lanzamiento
document.getElementById('btn-run').addEventListener('click', () => {
  const amount = parseInt(document.getElementById('amount').value);

  ui.btnRun.disabled = true;
  ui.btnRun.textContent = '⚙️ Simulando...';
  ui.stageText.textContent = 'Lanzando el dado...';

  isRunning = true;

  let speed;

  if (amount === 1) speed = 800;
  else if (amount === 10) speed = 350;
  else if (amount === 50) speed = 150;
  else if (amount === 100) speed = 100;
  else speed = 0;

  if (amount === 1000) {
    setTimeout(() => {
      let lastResult = null;

      for (let i = 0; i < 1000; i++) {
        lastResult = extractToken(false);
      }

      renderDice(lastResult, false);
      finishSimulation();
    }, 100);

    return;
  }

  let count = 0;

  const interval = setInterval(() => {
    extractToken(true, speed);
    updateUI();

    count++;

    if (count >= amount) {
      clearInterval(interval);
      finishSimulation();
    }
  }, speed);
});

function finishSimulation() {
  updateUI();

  ui.btnRun.disabled = false;
  ui.btnRun.textContent = '▶ Lanzar Dado';
  ui.stageText.textContent = 'Resultado del Lanzamiento';

  isRunning = false;
}

// Botón para limpiar resultados
document.getElementById('btn-reset').addEventListener('click', () => {
  if (isRunning) return;

  stats = {
    total: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };

  ui.diceFace.innerHTML = '<span class="question-mark">?</span>';
  ui.diceFace.className = 'dice-face unknown';
  ui.diceInfo.textContent = 'Esperando el primer lanzamiento...';

  ['A', 'B', 'C', 'D'].forEach(k => {
    ui[k].pct.textContent = '0.00%';
    ui[k].bar.style.width = '0%';
    ui[k].count.textContent = '0';
    ui[k].pool.innerHTML = '';
    ui[k].card.classList.remove(ui[k].colorClass);
  });

  ui.total.textContent = '0';

  ui.totalRefs.forEach(ref => {
    ref.textContent = '0';
  });
});