const ESPN_URL = 'https://www.espn.com'
const ESPN_API_URL = 'https://site.web.api.espn.com'
const SINGLE_EVENT_ENDPOINT = '/apis/common/v3/sports/mma/ufc/fightcenter/'
const ALL_EVENTS_ENDPOINT = '/mma/schedule/_/year/'

export const fetchAllEvents = async (year = 2025) => {
  const response = await fetch(`${ESPN_URL}${ALL_EVENTS_ENDPOINT}${year}/league/ufc?_xhr=pageContent`)
  const responseData = await response.json()
  return responseData
}

export const fetchSingleEvent = async (eventId) => {
  const response = await fetch(`${ESPN_API_URL}${SINGLE_EVENT_ENDPOINT}${eventId}`)
  const responseData = await response.json()
  return responseData
}