export const venue = {
  name: 'The Shredder',
  address: '430 S 10th St',
  city: 'Boise',
  region: 'ID',
  postalCode: '83702',
  timezone: 'America/Boise',
};

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: venue.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
});
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: venue.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const timedDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/;
const dayLength = 86_400_000;

export const localDate = (instant) => dateFormatter.format(instant);
const utcDate = (date) => new Date(date + 'T12:00:00Z');
const shift = (date, days) => new Date(+utcDate(date) + days * dayLength).toISOString().slice(0, 10);
export const dateLabel = (date, options) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(utcDate(date));

export function dateTime(value) {
  if (typeof value !== 'string' || !timedDate.test(value)) return null;
  const instant = Date.parse(value);
  return Number.isFinite(instant) ? new Date(instant) : null;
}

function clockTime(value) {
  const match = /^(\d{1,2}):([0-5]\d)(?:\s*(AM|PM))?$/i.exec(value || '');
  if (!match) return '';
  const hour = Number(match[1]);
  const period = match[3]?.toUpperCase();
  if (period ? hour < 1 || hour > 12 : hour > 23) return '';
  const normalizedHour = period ? hour % 12 + (period === 'PM' ? 12 : 0) : hour;
  return `${String(normalizedHour).padStart(2, '0')}:${match[2]}`;
}

export function timeLabel(timestamp, legacyTime) {
  const instant = dateTime(timestamp);
  const time = instant ? timeFormatter.format(instant) : clockTime(legacyTime);
  if (!time) return 'TBA';
  const hour = Number(time.slice(0, 2));
  return `${hour % 12 || 12}:${time.slice(3)} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function secureUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function spotifyTrackId(value) {
  const url = secureUrl(value);
  if (!url) return null;
  const { origin, pathname } = new URL(url);
  if (origin !== 'https://open.spotify.com') return null;
  return /^\/(?:intl-[a-zA-Z-]+\/)?(?:embed\/)?track\/([a-zA-Z0-9]{22})\/?$/.exec(pathname)?.[1] || null;
}

export function assetUrl(value) {
  return typeof value === 'string' &&
    /^\/assets\/(?:[\w-]+\/)*[\w.-]+$/.test(value) &&
    !value.endsWith('/..') && !value.endsWith('/.') ? value : null;
}

export function normalizeShows(input) {
  const shows = input.flatMap((record) => {
    if (!(record.published ?? record.public)) return [];
    if (record.venue && record.venue.toLowerCase() !== venue.name.toLowerCase()) return [];
    const slug = record.slug || record.id?.replace(/^shredder-/, '');
    const title = record.title || record.showName;
    const start = dateTime(record.startDateTime);
    const date = start ? localDate(start) : record.date;
    if (!/^[a-z\d]+(?:-[a-z\d]+)*$/.test(slug || '') || !title || !dateOnly.test(date || '') ||
        !Number.isFinite(+utcDate(date)) || utcDate(date).toISOString().slice(0, 10) !== date) {
      throw new Error(`Invalid public show: ${record.id || slug || 'missing ID'}`);
    }
    const performers = record.artists || record.featuredBands || [];
    const artists = performers.map((artist) => typeof artist === 'string' ? { name: artist } : ({
      id: artist.id || artist.bandId,
      name: artist.name || artist.displayName || artist.bandName,
      role: artist.role,
      url: secureUrl(artist.url || artist.socials?.website) || secureUrl(artist.socials?.spotify),
      trackId: [
        artist.spotifyTrackUrl, artist.socials?.spotifyTrackUrl,
        artist.spotifyEmbedUrl, artist.socials?.spotifyEmbedUrl, artist.url,
      ].map(spotifyTrackId).find(Boolean),
    })).filter((artist) => artist.name);
    const lineup = record.lineupArtists || record.lineup?.split(';').map((name) => name.trim()) ||
      artists.map(({ name }) => name);
    return [{
      ...record, slug, title, date, start, artists, lineup,
      headliner: record.headliner || artists.find((artist) => artist.role === 'headline')?.name || lineup[0],
      flyer: assetUrl(typeof record.flyer === 'object' ? record.flyer?.src : record.flyer),
      flyerAlt: record.flyer?.alt || `Original flyer for ${title}`,
      eventStatus: (record.eventStatus || 'scheduled').toLowerCase(),
    }];
  });
  if (new Set(shows.map(({ slug }) => slug)).size !== shows.length) throw new Error('Duplicate public show slug');
  return shows;
}

export function showState(show, now) {
  if (show.eventStatus !== 'scheduled') {
    return show.eventStatus === 'cancelled' ? 'canceled' : show.eventStatus;
  }
  const end = dateTime(show.endDateTime);
  return (end ? now >= end : localDate(now) > show.date) ? 'completed' : 'scheduled';
}

export function ticket(show, state) {
  if (state === 'completed') return { label: 'Past show' };
  if (state === 'canceled') return { label: 'Canceled' };
  if (state === 'postponed') return { label: 'Postponed' };
  const status = show.ticketStatus || (show.isFreeShow ? 'free' :
    show.doorSalesOnly ? 'door-only' : show.ticketUrl ? 'on-sale' : 'unconfirmed');
  const url = secureUrl(show.ticketUrl);
  switch (status) {
    case 'on-sale': return url ? { label: 'Get Tickets', url } : { label: 'Ticket link pending' };
    case 'sold-out': return { label: 'Sold Out', waitlist: secureUrl(show.waitlistUrl) };
    case 'free': return { label: 'Free Admission' };
    case 'door-only': return { label: 'Tickets at Door' };
    case 'coming-soon': return { label: 'Tickets Coming Soon' };
    default: return { label: 'Ticket info pending' };
  }
}

function orderedShows(shows, archive, now) {
  const today = localDate(now);
  const direction = archive ? -1 : 1;
  const earliest = ({ start, showTime }) => (start ? timeFormatter.format(start) : clockTime(showTime)) || '99:99';
  return shows
    .map((show) => ({ show, state: showState(show, now) }))
    .filter(({ show, state }) => archive ? state === 'completed' :
      state === 'scheduled' || (['canceled', 'postponed'].includes(state) && show.date >= today))
    .sort((a, b) => direction * (a.show.date.localeCompare(b.show.date) ||
      earliest(a.show).localeCompare(earliest(b.show)) || a.show.title.localeCompare(b.show.title)));
}

export function upcomingPreview(shows, now) {
  return orderedShows(shows, false, now).filter(({ state }) => state === 'scheduled').slice(0, 5);
}

export function browse(shows, params, archive, now) {
  const today = localDate(now);
  const daysSinceMonday = (utcDate(today).getUTCDay() + 6) % 7;
  const sunday = shift(today, 6 - daysSinceMonday);
  const periodParameter = archive ? 'year' : 'month';
  const query = (params.get('q') || '').trim().slice(0, 120);
  const searchKey = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const needle = searchKey(query);
  const eligible = orderedShows(shows, archive, now);
  const periodFor = (date) => date.slice(0, archive ? 4 : 7);
  const periods = [...new Set(eligible.map(({ show }) => periodFor(show.date)))];
  const period = periods.includes(params.get(periodParameter)) ? params.get(periodParameter) : '';
  const dateFilter = !period && ['week', 'month'].includes(params.get('when')) ? params.get('when') : 'all';
  const calendar = params.get('view') === 'calendar';
  const pickedMonth = params.get('cal');
  const selectedCalendarMonth = /^20\d{2}-(?:0[1-9]|1[0-2])$/.test(pickedMonth || '') ? pickedMonth : '';
  const calendarMonth = selectedCalendarMonth || (eligible[0]?.show.date || today).slice(0, 7);
  const matches = eligible.filter(({ show }) => {
    if (calendar) {
      if (!show.date.startsWith(calendarMonth)) return false;
    } else {
      if (period && periodFor(show.date) !== period) return false;
      if (!archive && dateFilter === 'week' && show.date > sunday) return false;
      if (!archive && dateFilter === 'month' && periodFor(show.date) !== periodFor(today)) return false;
    }
    return !needle || searchKey([show.title, show.headliner, ...show.lineup].join(' ')).includes(needle);
  });
  const pageSize = archive ? 6 : 12;
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.max(1, Math.min(Number.parseInt(params.get('page'), 10) || 1, pageCount));
  return { periods, period, periodParameter, dateFilter, query, page, pageCount, today,
    calendar, calendarMonth,
    results: calendar ? matches : matches.slice((page - 1) * pageSize, page * pageSize),
    count: matches.length };
}

export function calendarDays(month) {
  const start = month + '-01';
  const next = shift(month + '-28', 4).slice(0, 7);
  const previous = shift(start, -1).slice(0, 7);
  const leading = (utcDate(start).getUTCDay() + 6) % 7;
  const days = Number(shift(next + '-01', -1).slice(-2));
  const cells = Math.ceil((leading + days) / 7) * 7;
  return { previous, next, dates: Array.from({ length: cells }, (_, index) => {
    const day = index - leading + 1;
    return day >= 1 && day <= days ? shift(start, day - 1) : null;
  }) };
}
