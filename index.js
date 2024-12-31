import http from 'http';
import { fetchAllEvents, fetchSingleEvent } from './api/eventApi.js';
import { getAllEvents, updateOrCreateEvent, updateOrCreateEventDetail } from './services/event.js';

const transfromAllEventsData = (originalData) => {
  return Object.values(originalData.events).map((event) => {
    const eventData = event[0];
    return {
      completed: eventData.completed,
      date: new Date(eventData.date).toISOString(),
      id: Number(eventData.id),
      url: eventData.link,
      title: eventData.name,
    };
  });
};

const transformSingleEventData = (originalData) => {
  const getCardData = (card) => {
    return {
      name: card.name,
      displayName: card.displayName,
      competitions: card.competitions.map((competition) => {
        return {
          id: Number(competition.id),
          matchNumber: competition.matchNumber,
          ...(competition?.type?.text && { fightWeight: competition.type.text }),
          competitors: competition.competitors.map((competitor) => {
            return {
              id: Number(competitor.id),
              fullName: competitor.athlete.fullName,
              age: competitor.athlete.age,
              country: competitor.athlete.country,
              record: competitor.displayRecord,
              ...(competitor?.bets?.odds && {
                bets: competitor.bets.odds.flatMap((bet) => {
                  if (bet.values[0].odds !== 'OFF') {
                    return [
                      {
                        name: bet.displayName,
                        odd: bet.values[0].odds,
                      },
                    ];
                  } else {
                    return [];
                  }
                }),
              }),
            };
          }),
        };
      }),
    };
  };

  return {
    id: Number(originalData.event.id),
    name: originalData.event.name,
    shortName: originalData.event.shortName,
    date: new Date(originalData.event.date).toISOString(),
    cards: Object.values(originalData.cards).map(getCardData),
  };
};

const getAllEventsFromApi = async () => {
  const events = await fetchAllEvents();

  const transformedEvents = transfromAllEventsData(events);
  return transformedEvents;
};

const insertAllEventsToDB = (events) => {
  events.forEach((event) => updateOrCreateEvent(event));
};

const getSingleEventFromApi = async (eventId) => {
    const event = await fetchSingleEvent(eventId);

    const transformedEvent = transformSingleEventData(event);
    return transformedEvent;
};

const insertSingleEventToDB = async (event) => {
  await updateOrCreateEventDetail(event);
};

http
  .createServer(async (request, response) => {
    if (request.url === '/') {
      const events = await getAllEventsFromApi();
      insertAllEventsToDB(events);
      response.end(JSON.stringify(events));
    } else if (request.url === '/events') {
      const allEvents = await getAllEvents();

      if (allEvents.length) {
        try {
          for (const event of allEvents) {
            const singleEvent = await getSingleEventFromApi(event.id);
            await insertSingleEventToDB(singleEvent);
          }
          response.end(JSON.stringify({ success: true }));
        } catch (e) {
          response.end(JSON.stringify({ success: false, message: e.message }));
        }
      } else {
        response.end(JSON.stringify({ success: false, message: 'no events' }));
      }
    }

    response.end();
  })
  .listen(3000);
