import HTMLParser from 'node-html-parser';

const ESPN_URL = 'https://www.espn.com';
const ALL_EVENTS_IN_2025_URL = `${ESPN_URL}/mma/fightcenter/_/league/ufc/year/2025`;


let events = []

const parse = async () => {
  const pageHtml = await parsePageHtml(ALL_EVENTS_IN_2025_URL);

  events = getEvents(pageHtml);
};

const parsePageHtml = async (pageUrl) => {
  const response = await fetch(pageUrl);

  const htmlContent = await response.text();
  const htmlRoot = HTMLParser.parse(htmlContent);

  return htmlRoot;
};

const getEvents = (html) => {
  const filterDropDowns = html.querySelector('[data-testid=MMAHeaderDropdowns]');
  const eventDropDown = filterDropDowns.lastChild;
  const eventOptions = eventDropDown.querySelectorAll('select > option');

  const events = [];

  eventOptions.forEach((event) => {
    if (event.textContent === 'Events') {
      return;
    }
    events.push({
      title: event.textContent,
      url: event.getAttribute('data-url'),
      id: Number(event.getAttribute('value'))
    });
  });

  return events;
};
