const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const dayEl = document.getElementById("day");

function atualizarTempo() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  dateEl.textContent = now.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
  dayEl.textContent = now.toLocaleDateString("pt-BR", { weekday: 'long' }).toUpperCase();
}
setInterval(atualizarTempo, 1000);
atualizarTempo();

const calendarId = '48a42449b898fb90d99e655ae515a0fb84b3bdeda0d839711aac8e86a8a5f023@group.calendar.google.com';
const apiKey = 'AIzaSyCZOcYgSCAX0pTWBR1mJ8m-udAFAIyGyRA';
let currentPage = 0;
let paginatedEvents = [];

function formatDate(date) {
  return date.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function updateAgendaTitle() {
  const today = new Date();
  const formattedDate = formatDate(today);
  document.getElementById('agenda-title').textContent = `AGENDA DE AUDIÊNCIAS - ${formattedDate}`;
}

function fetchTodaysEvents() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const timeMin = start.toISOString();
  const timeMax = end.toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const events = (data.items || []).filter(event => {
        const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
        return end > now;
      });

      paginatedEvents = [];
      for (let i = 0; i < events.length; i += 8) {
        paginatedEvents.push(events.slice(i, i + 8));
      }

      currentPage = 0;
      renderEvents();
    })
    .catch(error => {
      console.error('Erro ao buscar eventos:', error);
      document.getElementById('events').innerHTML = '<p>ERRO AO CARREGAR EVENTOS.</p>';
    });
}

function renderEvents() {
  const eventsContainer = document.getElementById('events');
  eventsContainer.innerHTML = '';

  if (paginatedEvents.length === 0) {
    eventsContainer.innerHTML = '<p>NENHUM EVENTO PARA HOJE.</p>';
    return;
  }

  const events = paginatedEvents[currentPage];
  events.forEach(event => {
    const div = document.createElement('div');
    div.className = 'event';

    const row = document.createElement('div');
    row.className = 'event-row';

    const leftCol = document.createElement('div');
    leftCol.className = 'event-left';

    const title = document.createElement('div');
    title.className = 'event-title';
    title.textContent = (event.summary || 'SEM TÍTULO').toUpperCase();
    leftCol.appendChild(title);

    const time = document.createElement('div');
    time.className = 'event-time';
    if (event.start.dateTime) {
      const startTime = new Date(event.start.dateTime).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      time.textContent = startTime;
    } else {
      time.textContent = 'DIA TODO';
    }
    leftCol.appendChild(time);

    const rightCol = document.createElement('div');
    rightCol.className = 'event-description';
    rightCol.textContent = (event.description || 'DESCRIÇÃO NÃO INFORMADA. TEXTO ALTERNATIVO TESTE.').toUpperCase();

    row.appendChild(leftCol);
    row.appendChild(rightCol);
    div.appendChild(row);

    eventsContainer.appendChild(div);
  });

  currentPage = (currentPage + 1) % paginatedEvents.length;
}

function updateAgenda() {
  updateAgendaTitle();
  fetchTodaysEvents();
}

updateAgenda();
setInterval(renderEvents, 60000);
setInterval(updateAgenda, 5 * 60 * 1000);
