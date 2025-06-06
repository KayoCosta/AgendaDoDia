const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const dayEl = document.getElementById("day");

function atualizarTempo() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("pt-BR");
  dateEl.textContent = now.toLocaleDateString("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  dayEl.textContent = now.toLocaleDateString("pt-BR", { weekday: 'long' });
}

setInterval(atualizarTempo, 1000);
atualizarTempo();
