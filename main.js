const eventContainer = document.querySelector("#cal-test");
const eventAmtToFetch = document.querySelector("#eventAmt");

const getRandomNumBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getMonth = (month) =>
  [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][month];
const getDayOfWeek = (weekday) =>
  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][weekday];
const isAM = (hour) => hour < 12;
const getHour = (hour) => (hour <= 12 ? hour : hour - 12);
const getMinute = (minute) => (minute === 0 ? "00" : minute);

function processDate(date) {
  const hour =
    getHour(date.getHours()) === 0 ? false : getHour(date.getHours());
  const minute = getMinute(date.getMinutes());
  const timeSuffix = `<small>${isAM(date.getHours()) ? `AM` : `PM`}</small>`;
  const time = hour && `${hour}:${minute}${timeSuffix}`;

  return {
    month: getMonth(date.getMonth()),
    weekday: getDayOfWeek(date.getDay()),
    time,
    date: date.getDate(),
  };
}

function mapEventObject(event) {
  const startDate = event.start.dateTime
    ? processDate(new Date(event.start.dateTime))
    : processDate(new Date(`${event.start.date}T00:00:00`));
  const endDate = event.end.dateTime
    ? processDate(new Date(event.end.dateTime))
    : processDate(new Date(`${event.end.date}T00:00:00`));
  let dateRange;
  if (startDate.date !== endDate.date) {
    dateRange = `${startDate.month} ${startDate.date}–${endDate.month} ${endDate.date}`;
  } else if (!startDate.time) {
    dateRange = `${startDate.month} ${startDate.date}`;
  } else {
    dateRange = `${startDate.weekday}, ${startDate.time}–${endDate.time}`;
  }

  return {
    name: event.summary,
    description: event.description,
    location: event.location,
    start: startDate,
    end: endDate,
    dateRange,
    link: event.htmlLink,
  };
}

function createEvent(e, i) {
  return `
    <article class="dark-mode event-card">
      <div class="date">
        <p>${e.start.month}</p>
        <div>${e.start.date}</div>
      </div>
      <div class="event-info">
        <p>${e.dateRange}</p>
        <h3 class="cs-title event-title">
          <a class="cs-link" href="${e.link}">${e.name}</a>
        </h3>
        <div class="other-details">
          <button class="details-dropdown" aria-expanded="false" aria-controls="details-1" id="btn-1">
            <p class="dropdown-label">See details</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="dropdown-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="details-content hidden" id="details-1" aria-labelledby="btn-1">
            <p class="details-content-text">${e.description}</p>
          </div>
        </div>
        <a href="" class="view-event-btn">View Event</a>
      </div>
    </article>`;
}

async function loadEvents(max = 9) {
  try {
    const endpoint = await fetch(
      `/.netlify/functions/calFetch?maxResults=${max}`
    );
    const data = await endpoint.json();
    console.log(data);
    const processedEvents = data.map((e) => mapEventObject(e));
    eventContainer.innerHTML = processedEvents
      .map((event, i) => createEvent(event, i))
      .join("");
  } catch (e) {
    eventContainer.innerHTML = `<p>🙀 Something went wrong!</p>`;
    console.log(e);
  }
}

// Event listener for page load
document.addEventListener("DOMContentLoaded", () => {
  // Call the function to load events when the page is fully loaded
  loadEvents();
});

eventContainer.addEventListener("click", (e) => {
  if (e.target.hasAttribute("aria-expanded")) {
    e.target.setAttribute(
      "aria-expanded",
      e.target.getAttribute("aria-expanded") === "false" ? "true" : "false"
    );
    e.target.querySelector("svg").classList.toggle("rotate-180");
    e.target.nextElementSibling.classList.toggle("hidden");
  }
});

eventAmtToFetch.addEventListener("change", (e) =>
  loadEvents(eventAmtToFetch.value)
);
