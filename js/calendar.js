const calendarId = '48a42449b898fb90d99e655ae515a0fb84b3bdeda0d839711aac8e86a8a5f023@group.calendar.google.com';
const apiKey = 'AIzaSyCZOcYgSCAX0pTWBR1mJ8m-udAFAIyGyRA';
let currentPage = 0;
let paginatedEvents = [];

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function updateAgendaTitle() {
  const today = new Date();
  const formattedDate = formatDate(today);
  document.getElementById('agenda-title').textContent = `Agenda do dia ${formattedDate}`;
}

function displayEvents(page = 0) {
  const eventsPerPage = 8;
  const column1 = document.getElementById('column1');
  const column2 = document.getElementById('column2');
  column1.innerHTML = '';
  column2.innerHTML = '';

  const start = page * eventsPerPage;
  const selectedEvents = paginatedEvents.slice(start, start + eventsPerPage);

  selectedEvents.forEach((event, index) => {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';

    const leftDiv = document.createElement('div');
    leftDiv.className = 'event-left';

    const title = document.createElement('div');
    title.className = 'event-title';
    title.textContent = event.summary || 'SEM TÍTULO';
    leftDiv.appendChild(title);

    const time = document.createElement('div');
    time.className = 'event-time';
    if (event.start?.dateTime) {
      const startTime = new Date(event.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      time.textContent = `${startTime}`;
    } else {
      time.textContent = 'DIA TODO';
    }
    leftDiv.appendChild(time);

    const rightDiv = document.createElement('div');
    rightDiv.className = 'event-description';
    rightDiv.textContent = event.description || 'DESCRIÇÃO PADRÃO PARA TESTE';

    eventDiv.appendChild(leftDiv);
    eventDiv.appendChild(rightDiv);

    if (index % 2 === 0) {
      column1.appendChild(eventDiv);
    } else {
      column2.appendChild(eventDiv);
    }
  });
}

function fetchTodaysEvents() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const timeMin = start.toISOString();
  const timeMax = end.toISOString();
  const timeZone = 'America/Sao_Paulo';

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true&timeZone=${timeZone}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const now = new Date();
      const filtered = (data.items || []).filter(event => {
        const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
        return endDate > now;
      });

      paginatedEvents = filtered;
      currentPage = 0;
      displayEvents(currentPage);
    })
    .catch(err => {
      console.error('Erro ao buscar eventos:', err);
    });
}

function cyclePages() {
  const eventsPerPage = 8;
  const totalPages = Math.ceil(paginatedEvents.length / eventsPerPage);
  currentPage = (currentPage + 1) % totalPages;
  displayEvents(currentPage);
}

function updateAgenda() {
  updateAgendaTitle();
  fetchTodaysEvents();
}

updateAgenda();
setInterval(updateAgenda, 5 * 60 * 1000); // Atualiza dados a cada 5 minutos
setInterval(cyclePages, 60 * 1000); // Troca de página a cada 1 minuto
