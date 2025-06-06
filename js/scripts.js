const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const dayEl = document.getElementById("day");

const calendarId = '48a42449b898fb90d99e655ae515a0fb84b3bdeda0d839711aac8e86a8a5f023@group.calendar.google.com';
const apiKey = 'AIzaSyCZOcYgSCAX0pTWBR1mJ8m-udAFAIyGyRA';

const eventsPerPage = 8; // Máximo de eventos por página
let currentPage = 0;
let paginatedEvents = [];

// Atualizar relógio e data
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

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function updateAgendaTitle() {
    const today = new Date();
    const formattedDate = formatDate(today);
    document.getElementById('agenda-title').textContent = `AGENDA DE AUDIÊNIAS - ${formattedDate}`;
}

function paginateEvents(events) {
    const pages = [];
    for (let i = 0; i < events.length; i += eventsPerPage) {
        pages.push(events.slice(i, i + eventsPerPage));
    }
    return pages;
}

function renderPage(pageEvents) {
    const column1 = document.getElementById('column1');
    column1.innerHTML = '';

    if (!pageEvents || pageEvents.length === 0) {
        column1.innerHTML = '<p style="font-size: 2rem; text-align:center;">Nenhum evento para hoje.</p>';
        return;
    }

    pageEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';

        const eventTitle = document.createElement('div');
        eventTitle.className = 'event-title';
        eventTitle.textContent = event.summary || 'Sem título';
        eventDiv.appendChild(eventTitle);

        const eventTime = document.createElement('div');
        eventTime.className = 'event-time';

        if (event.start.dateTime) {
            const startTime = new Date(event.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(event.end.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            eventTime.textContent = `${startTime} - ${endTime}`;
        } else if (event.start.date) {
            eventTime.textContent = 'Dia todo';
        }

        eventDiv.appendChild(eventTime);

        if (event.description) {
            const eventDescription = document.createElement('div');
            eventDescription.className = 'event-description';
            eventDescription.textContent = event.description;
            eventDiv.appendChild(eventDescription);
        }

        column1.appendChild(eventDiv);
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
        .then(response => response.json())
        .then(data => {
            const events = data.items || [];
            const currentTime = new Date();

            const filteredEvents = events.filter(event => {
                const eventEnd = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
                return eventEnd > currentTime;
            });

            if (filteredEvents.length === 0) {
                paginatedEvents = [[]];
                renderPage([]);
                return;
            }

            paginatedEvents = paginateEvents(filteredEvents);
            currentPage = 0;
            renderPage(paginatedEvents[currentPage]);
        })
        .catch(error => {
            console.error('Erro ao buscar eventos:', error);
            document.getElementById('column1').innerHTML = '<p style="font-size: 2rem; text-align:center;">Erro ao carregar eventos.</p>';
        });
}

function nextPage() {
    if (!paginatedEvents || paginatedEvents.length === 0) return;

    currentPage++;
    if (currentPage >= paginatedEvents.length) {
        currentPage = 0;
    }
    renderPage(paginatedEvents[currentPage]);
}

function updateAgenda() {
    updateAgendaTitle();
    fetchTodaysEvents();
}

updateAgenda();

setInterval(() => {
    if (paginatedEvents.length > 1) {
        nextPage();
    } else {
        updateAgenda();
    }
}, 60000);
