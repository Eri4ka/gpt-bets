import prisma from '../lib/prisma.js';

export const updateOrCreateEvent = async (data) => {
  try {
    await prisma.event.upsert({
      where: {
        id: data.id,
      },
      update: {
        id: data.id,
        title: data.title,
        url: data.url,
        date: data.date,
        completed: data.completed,
      },
      create: {
        id: data.id,
        title: data.title,
        url: data.url,
        date: data.date,
        completed: data.completed,
      },
    });
  } catch (e) {
    console.log('error:', e);
  }
};

export const getAllEvents = async () => {
  const events = await prisma.event.findMany({
    where: {
      completed: false,
    },
    orderBy: {
      date: 'asc',
    },
  });
  return events;
};

export const updateOrCreateEventDetail = async (data) => {
  const eventDetailsRecord = await prisma.eventDetails.upsert({
    where: { eventId: data.id },
    update: {
      name: data.name,
      shortName: data.shortName,
      date: new Date(data.date),
    },
    create: {
      eventId: data.id,
      name: data.name,
      shortName: data.shortName,
      date: new Date(data.date),
    },
  });

  data.cards.forEach(async (card) => {
    const cardRecord = await prisma.card.upsert({
      where: { name_eventDetailsId: { name: card.name, eventDetailsId: eventDetailsRecord.id } },
      update: {
        name: card.name,
        displayName: card.displayName,
      },
      create: {
        name: card.name,
        displayName: card.displayName,
        eventDetailsId: eventDetailsRecord.id,
      },
    });

    for (const competition of card.competitions) {
      await prisma.competition.upsert({
        where: {
          id: competition.id,
        },
        update: {
          matchNumber: competition.matchNumber,
          ...(competition.fightWeight && { fightWeight: competition.fightWeight }),
        },
        create: {
          id: competition.id,
          matchNumber: competition.matchNumber,
          ...(competition.fightWeight && { fightWeight: competition.fightWeight }),
          cardId: cardRecord.id,
          competitors: {
            create: competition.competitors.map((competitor) => ({
              record: competitor.record,
              athlete: {
                connectOrCreate: {
                  where: { id: competitor.id },
                  create: {
                    id: competitor.id,
                    fullName: competitor.fullName,
                    age: competitor.age,
                    country: competitor.country,
                  },
                },
              },
              ...(competitor.bets && {
                bets: {
                  create: competitor.bets.map((bet) => ({
                    name: bet.name,
                    odd: bet.odd,
                  })),
                },
              }),
            })),
          },
        },
      });
    }
  });
};
