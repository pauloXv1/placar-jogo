const state = {
  p1: { score: 0 },
  p2: { score: 0 },
  history: []
};

// ── Carregar estado salvo ──────────────────────
function loadState() {
  try {
    const saved = localStorage.getItem('placarBaralho');
    if (saved) {
      const data = JSON.parse(saved);
      state.p1.score = data.p1?.score ?? 0;
      state.p2.score = data.p2?.score ?? 0;
      state.history  = data.history ?? [];

      document.getElementById('name-p1').value = data.name1 ?? 'Você';
      document.getElementById('name-p2').value = data.name2 ?? 'Namorada';
    }
  } catch (e) {
    console.warn('Erro ao carregar placar salvo.');
  }
}

// ── Salvar estado ─────────────────────────────
function saveState() {
  try {
    localStorage.setItem('placarBaralho', JSON.stringify({
      p1:      state.p1,
      p2:      state.p2,
      history: state.history,
      name1:   document.getElementById('name-p1').value,
      name2:   document.getElementById('name-p2').value,
    }));
  } catch (e) { /* sem suporte a localStorage */ }
}

// ── Atualizar interface ───────────────────────
function updateUI() {
  const s1 = state.p1.score;
  const s2 = state.p2.score;

  // Placares
  ['p1', 'p2'].forEach(id => {
    const score = state[id].score;
    document.getElementById(`score-${id}`).textContent    = score;
    document.getElementById(`score-tl-${id}`).textContent = score;
    document.getElementById(`score-br-${id}`).textContent = score;
  });

  document.getElementById('total-rounds').textContent = s1 + s2;

  const card1 = document.getElementById('card-p1');
  const card2 = document.getElementById('card-p2');

  card1.classList.remove('leading');
  card2.classList.remove('leading');

  if (s1 > s2) card1.classList.add('leading');
  else if (s2 > s1) card2.classList.add('leading');

  renderHistory();
  saveState();
}

function changeScore(player, delta) {
  const newScore = state[player].score + delta;
  if (newScore < 0) return; 

  state[player].score = newScore;

  if (delta > 0) {
    const name = document.getElementById(`name-${player}`).value || (player === 'p1' ? 'Jogador 1' : 'Jogador 2');
    const now  = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    state.history.unshift({ name, time, score1: state.p1.score, score2: state.p2.score });
    if (state.history.length > 20) state.history.pop();
  }

  const el = document.getElementById(`score-${player}`);
  el.classList.remove('pop');
  void el.offsetWidth; 
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 150);

  updateUI();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (state.history.length === 0) {
    list.innerHTML = '<li class="history-empty">Nenhuma partida registrada ainda.</li>';
    return;
  }

  list.innerHTML = state.history.map((entry, i) => {
    const suit = (entry.name === document.getElementById('name-p1').value) ? '♥' : '♠';
    return `
      <li>
        <span>${suit} <strong>${entry.name}</strong> venceu — placar ${entry.score1} × ${entry.score2}</span>
        <span class="history-time">${entry.time}</span>
      </li>
    `;
  }).join('');
}

function resetScores() {
  if (!confirm('Zerar o placar? O histórico será apagado.')) return;
  state.p1.score = 0;
  state.p2.score = 0;
  state.history  = [];
  updateUI();
}

function endGame() {
  const s1    = state.p1.score;
  const s2    = state.p2.score;
  const name1 = document.getElementById('name-p1').value || 'Jogador 1';
  const name2 = document.getElementById('name-p2').value || 'Jogador 2';
  const total = s1 + s2;

  let title, body;

  if (s1 === 0 && s2 === 0) {
    title = 'Nenhuma partida!';
    body  = 'Registre pelo menos uma partida antes de encerrar.';
    document.getElementById('modal-suit').textContent = '🃏';
  } else if (s1 > s2) {
    title = `${name1} venceu!`;
    body  = `Parabéns! ${name1} ganhou com ${s1} vitória${s1 !== 1 ? 's' : ''} contra ${s2} de ${name2}. Total de ${total} partidas disputadas.`;
    document.getElementById('modal-suit').textContent = '🏆';
  } else if (s2 > s1) {
    title = `${name2} venceu!`;
    body  = `Parabéns! ${name2} ganhou com ${s2} vitória${s2 !== 1 ? 's' : ''} contra ${s1} de ${name1}. Total de ${total} partidas disputadas.`;
    document.getElementById('modal-suit').textContent = '🏆';
  } else {
    title = 'Empate!';
    body  = `Incrível — ${name1} e ${name2} terminaram empatados com ${s1} vitória${s1 !== 1 ? 's' : ''} cada! Total de ${total} partidas.`;
    document.getElementById('modal-suit').textContent = '🤝';
  }

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent  = body;
  document.getElementById('modal').style.display     = 'flex';
}

function newGame() {
  state.p1.score = 0;
  state.p2.score = 0;
  state.history  = [];
  closeModal();
  updateUI();
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

loadState();
updateUI();