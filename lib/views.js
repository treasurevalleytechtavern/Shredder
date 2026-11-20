import { assetUrl, calendarDays, dateLabel, dateTime, secureUrl, ticket, timeLabel, venue } from './shows.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const json = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');
const showPath = ({ slug }) => '/shows/' + slug;
const city = `${venue.city}, ${venue.region}`;
const address = `${venue.address}, ${city} ${venue.postalCode}`;
const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(venue.name + ', ' + address);
const bookingEmail = 'shredderboise@gmail.com';
const socialLinks = [
  ['Instagram', 'https://www.instagram.com/theshredderboise/?hl=en'],
  ['Facebook', 'https://www.facebook.com/shredderboise'],
];
const siteOrigin = 'https://shredderboise.com';
const venueLocation = {
  '@type': 'MusicVenue',
  '@id': siteOrigin + '/venue#the-shredder',
  name: venue.name,
  url: siteOrigin + '/venue',
  address: {
    '@type': 'PostalAddress', streetAddress: venue.address, addressLocality: venue.city,
    addressRegion: venue.region, postalCode: venue.postalCode, addressCountry: 'US',
  },
};
const dateLong = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
const monthLong = { month: 'long', year: 'numeric' };
const external = 'target="_blank" rel="noopener noreferrer"';
const wordmark = '<a class="wordmark" href="/"><img src="/assets/marquee.webp" width="700" height="144" alt="The Shredder"></a>';

function icon(name) {
  const paths = {
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2"/>',
    ticket: '<path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z"/><path d="M14 8v1m0 2.5v1m0 2.5v1"/>',
    prev: '<path d="m14 6-6 6 6 6"/>',
    next: '<path d="m10 6 6 6-6 6"/>',
    pause: '<path d="M9 5v14m6-14v14"/>',
    play: '<path d="m8 5 11 7-11 7Z"/>',
    music: '<path d="M9 18V5l11-2v13"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

export function layout({ title, description, path, active, body, structured, shareImage, background = false, indexable = true }) {
  const links = [['/', 'Upcoming Shows'], ['/past-shows', 'Past Shows'], ['/venue', 'The Venue'], ['/contact', 'Contact & Socials']];
  const nav = links.map(([url, label]) => `<a href="${url}"${active === url ? ' aria-current="page"' : ''}>${escape(label)}</a>`).join('');
  const canonical = siteOrigin + path;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#111111">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  ${indexable ? `<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}">` : '<meta name="robots" content="noindex">'}
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  ${shareImage ? `<meta property="og:image" content="${escape(siteOrigin + shareImage.src)}">
  <meta property="og:image:alt" content="${escape(shareImage.alt)}">` : ''}
  <link rel="stylesheet" href="/assets/site.css?v=2">
  ${structured ? `<script type="application/ld+json">${json(structured)}</script>` : ''}
  ${background ? '<script defer src="/assets/background-motion.js"></script>' : ''}
  <script type="module" src="/assets/site.js?v=2"></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  ${background ? `<div class="backdrop" aria-hidden="true"><video muted loop playsinline preload="none" poster="/assets/shredder-bar.webp" data-src="/assets/shredder-bar.mp4"></video></div>` : ''}
  <header class="site-header">
    <div class="wrap masthead">
      ${wordmark}
      <nav aria-label="Main navigation">${nav}</nav>
    </div>
  </header>
  <main id="main" class="wrap">${body}</main>
  <footer>
    <div class="wrap footer-content">
      <div>${wordmark}<address>${escape(address)}</address></div>
      <nav aria-label="Footer navigation">${nav}</nav>
      <div class="footer-credit">
        <small>© ${new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: venue.timezone }).format()} The Shredder</small>
        <small>Powered by <a href="https://treasurevalleytechtavern.com/">Treasure Valley Tech Tavern</a></small>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

export function showActions(show, state, includeDetails = true) {
  const { label, url, waitlist } = ticket(show, state);
  return `<div class="actions">${state === 'completed' && includeDetails ? '' : url ?
    `<a class="button primary" href="${escape(url)}" ${external}>${icon('ticket')}${label}<span class="sr-only"> for ${escape(show.title)} (opens in a new tab)</span></a>` :
    `<span class="ticket-state">${label}</span>`}
    ${waitlist ? `<a class="button primary" href="${escape(waitlist)}" ${external}>Join Waitlist<span class="sr-only"> (opens in a new tab)</span></a>` : ''}
    ${includeDetails ? `<a class="button secondary" href="${showPath(show)}">${state === 'completed' ? 'View Show' : 'Show Details'}<span class="sr-only"> for ${escape(show.title)}</span></a>` : ''}
  </div>`;
}

function dateBlock(show) {
  return `<time class="date-stamp" datetime="${show.date}">
    <span class="sr-only">${dateLabel(show.date, dateLong)}</span>
    <span class="stamp-month" aria-hidden="true">${dateLabel(show.date, { month: 'short' })}</span>
    <span class="stamp-day" aria-hidden="true">${show.date.slice(8)}</span>
    <span class="stamp-weekday" aria-hidden="true">${dateLabel(show.date, { weekday: 'short' })} · ${show.date.slice(0, 4)}</span>
  </time>`;
}

function facts(show) {
  const fields = [
    ['Doors', timeLabel(show.doorsDateTime, show.doorsTime)],
    ['Show', timeLabel(show.startDateTime, show.showTime)],
    ['Ages', show.ageRestriction || 'TBA'],
  ];
  return `<dl class="facts">${fields.map(([label, value]) =>
    `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;
}

function lineup(show) {
  const names = show.lineup[0] === show.title ? show.lineup.slice(1) : show.lineup;
  return names.length ? `<p class="lineup">${show.lineup[0] === show.title ? '<span class="with">with</span> ' : ''}${names.map(escape).join(' · ')}</p>` : '';
}

function flyer(show, first, detail = false) {
  if (!show.flyer) return '';
  const img = `<img src="${show.flyer}" alt="${escape(show.flyerAlt)}" ${first ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  return detail ? `<div class="flyer">${img}</div>` : `<a class="flyer" href="${showPath(show)}" aria-label="Show details for ${escape(show.title)}">${img}</a>`;
}

function card({ show, state }, first) {
  const musicLink = show.artists.some(({ trackId }) => trackId) ?
    `<a class="card-listen" href="${showPath(show)}#listen">${icon('play')} Listen<span class="sr-only"> to the lineup for ${escape(show.title)}</span></a>` : '';
  return `<article class="show-card${show.flyer ? ' has-flyer' : ''}" id="day-${show.date}-${show.slug}" tabindex="-1">
    <div class="show-visual">${flyer(show, first)}${dateBlock(show)}</div>
    <div class="show-info">
      <h3><a href="${showPath(show)}">${escape(show.title)}</a></h3>
      ${lineup(show)}
      ${state === 'completed' ? '' : facts(show)}
      ${show.promoter || musicLink ? `<div class="show-meta">
        ${show.promoter ? `<span>Presented by ${escape(show.promoter)}</span>` : ''}
        ${musicLink}
      </div>` : ''}
    </div>
    ${showActions(show, state)}
  </article>`;
}

function pageUrl(path, params) {
  const pairs = Object.entries(params).filter(([key, value]) => value && (key !== 'when' || value !== 'all'));
  return escape(path + (pairs.length ? '?' + new URLSearchParams(pairs) : ''));
}

export function showControls(model, archive) {
  const path = archive ? '/past-shows' : '/';
  const { calendar, dateFilter, period, periods, periodParameter, query } = model;
  const allLabel = archive ? 'All Years' : 'All Months';
  const option = (value) => `<option value="${value}"${value === period ? ' selected' : ''}>${archive ?
    value : dateLabel(value + '-01', monthLong)}</option>`;
  const dateTabs = [['all', 'All Shows'], ['week', 'This Week'], ['month', 'This Month']];
  return `<div class="controls">
    ${!calendar && !archive ? `<nav class="date-tabs" aria-label="Show date range" data-search-links>${dateTabs.map(([when, label]) =>
      `<a href="${pageUrl(path, { when, q: query })}"${dateFilter === when && !period ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav>` : ''}
    <form class="filter-form" action="${path}" role="search">
      ${calendar ? `<input type="hidden" name="view" value="calendar"><input type="hidden" name="cal" value="${model.calendarMonth}">` :
        `${dateFilter === 'all' ? '' : `<input type="hidden" name="when" value="${dateFilter}">`}
        <label class="period"><span class="sr-only">${archive ? 'Filter by year' : 'Filter by month'}</span>
          <select name="${periodParameter}" data-period><option value="">${allLabel}</option>${periods.map(option).join('')}</select>${icon('next')}</label>`}
      <div class="search-box">
        <label class="sr-only" for="show-search">Search shows or artists</label>
        <input id="show-search" type="search" name="q" value="${escape(query)}" placeholder="Search shows" maxlength="120">
        <button type="submit" aria-label="Apply filters">${icon('search')}</button>
      </div>
    </form>
    <nav class="view-toggle" aria-label="Display mode" data-search-links>
      <a href="${pageUrl(path, calendar ? { q: query } : { when: dateFilter, q: query, [periodParameter]: period })}"${!calendar ? ' aria-current="true"' : ''}>${icon('list')} List</a>
      <a href="${pageUrl(path, { view: 'calendar', q: query, cal: archive ? '' : period })}"${calendar ? ' aria-current="true"' : ''}>${icon('calendar')} Calendar</a>
    </nav>
    ${archive ? '' : `<button class="motion-setting" type="button" hidden aria-label="Play background motion" data-paused="true" title="Play background motion">
      <span class="motion-pause">${icon('pause')}</span><span class="motion-play">${icon('play')}</span>
    </button>`}
  </div>`;
}

function listView(model, path, archive) {
  const { results, page, pageCount, period, periodParameter, query, dateFilter } = model;
  const groups = new Map();
  for (const entry of results) {
    const key = entry.show.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  if (!groups.size) {
    const filtered = query || period || dateFilter !== 'all';
    return `<div class="empty"><h2>${filtered ? 'No shows match these filters' : archive ? 'The archive is empty' : 'No upcoming dates are posted'}</h2>
      <p>${filtered ? 'Try another date range or artist name.' : archive ? 'Completed shows will appear here.' : 'Check back for new show announcements.'}</p>
      ${filtered ? `<a class="button secondary" href="${path}">Reset Filters</a>` : ''}</div>`;
  }
  const pagination = (other) => pageUrl(path, { when: dateFilter, [periodParameter]: period, q: query, page: other });
  return [...groups].map(([month, entries], groupIndex) =>
    `<section class="month-group" aria-labelledby="month-${month}">
      <h2 id="month-${month}" class="month-label">${dateLabel(month + '-01', monthLong)}</h2>
      ${entries.map((entry, index) => card(entry, !groupIndex && !index)).join('')}
    </section>`).join('') + (pageCount > 1 ?
      `<nav class="pagination" aria-label="Show pages" data-search-links>
       ${page > 1 ? `<a class="button secondary" href="${pagination(page - 1)}">Previous</a>` : ''}
       <span>Page ${page} of ${pageCount}</span>
       ${page < pageCount ? `<a class="button secondary" href="${pagination(page + 1)}">More Shows</a>` : ''}
       </nav>` : '');
}

function calendarTiming({ show, state }) {
  if (state !== 'scheduled') return null;
  const start = timeLabel(show.startDateTime, show.showTime);
  if (start !== 'TBA') return { label: start, compact: start.replace(':00 ', ' ') };
  const doors = timeLabel(show.doorsDateTime, show.doorsTime);
  if (doors !== 'TBA') return { label: 'Doors ' + doors, compact: doors.replace(':00 ', ' '), doors: true };
  return { label: 'Time TBA', compact: 'TBA' };
}

function calendarView(model, path) {
  const { calendarMonth, query, results, today } = model;
  const { dates, next, previous } = calendarDays(calendarMonth);
  const heading = dateLabel(calendarMonth + '-01', monthLong);
  const days = new Map();
  for (const entry of results) {
    if (!days.has(entry.show.date)) days.set(entry.show.date, []);
    days.get(entry.show.date).push(entry);
  }
  const monthUrl = (cal) => pageUrl(path, { view: 'calendar', cal, q: query });
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const rows = Array.from({ length: dates.length / 7 }, (_, row) => {
    const cells = dates.slice(row * 7, (row + 1) * 7).map((date) => {
      if (!date) return '<td class="blank"></td>';
      const entries = days.get(date) || [];
      const links = entries.map((entry) => {
        const { show, state } = entry;
        const meta = calendarTiming(entry)?.label || (['canceled', 'postponed'].includes(state) ? state : '');
        return `<a class="calendar-show" href="${showPath(show)}"><span>${escape(show.title)}</span>
          ${meta ? `<small>${meta}</small>` : ''}</a>`;
      }).join('');
      const agenda = entries[0]?.show;
      const timing = entries.length === 1 ? calendarTiming(entries[0]) : null;
      return `<td class="${date === today ? 'today' : ''}">
        <time datetime="${date}"${date === today ? ' aria-current="date"' : ''}>${Number(date.slice(-2))}</time>${links}
        ${agenda ? `<a class="calendar-marker" href="#day-${date}-${agenda.slug}">
          ${timing ? `<span class="marker-time" aria-hidden="true">${timing.doors ? '<small>Doors</small>' : ''}${timing.compact}</span>` :
            `<span class="marker-count" aria-hidden="true">${entries.length}</span>`}
          <span class="sr-only">${entries.length} ${entries.length === 1 ? 'show' : 'shows'} on ${dateLabel(date, dateLong)}${timing ? ', ' + timing.label : ''}</span>
        </a>` : ''}
      </td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<section class="calendar" aria-labelledby="calendar-month">
    <div class="calendar-heading" data-search-links>
      ${previous.startsWith('19') ? '<span></span>' : `<a class="button secondary" href="${monthUrl(previous)}" aria-label="Previous month">${icon('prev')}</a>`}
      <h2 id="calendar-month">${heading}</h2>
      ${next.startsWith('21') ? '<span></span>' : `<a class="button secondary" href="${monthUrl(next)}" aria-label="Next month">${icon('next')}</a>`}
    </div>
    <table aria-labelledby="calendar-month">
      <thead><tr>${weekdays.map((day) => `<th scope="col"><span aria-hidden="true">${day.slice(0, 3)}</span><span class="sr-only">${day}</span></th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${days.size ? `<div class="calendar-agenda"><h2 class="month-label">Shows in ${heading}</h2>${results.map((entry) => card(entry, false)).join('')}</div>` :
      '<div class="empty calendar-empty"><p>No shows match this month.</p></div>'}
  </section>`;
}

export function showResults(model, archive) {
  const path = archive ? '/past-shows' : '/';
  return `<div data-show-results="${model.count}">
    ${model.calendar ? calendarView(model, path) : listView(model, path, archive)}
  </div>`;
}

export function listing(model, archive) {
  const path = archive ? '/past-shows' : '/';
  const heading = archive ? 'Past Shows' : 'Upcoming Shows';
  const description = archive ? 'Browse past concerts and lineups at The Shredder in Boise, Idaho.' :
    'Find upcoming shows, lineups and official tickets for live music at The Shredder in Boise, Idaho.';
  return layout({ title: heading + ' | The Shredder', description, path, active: path, background: !archive,
    body: `<section class="page-heading">
      <div><p class="eyebrow">${archive ? 'The Shredder Show Archive' : 'Live Music in Boise, Idaho'}</p><h1>${heading}</h1></div>
      <a class="location-link" href="/venue">${icon('pin')} <span>${venue.address}<small>${city}</small></span></a>
    </section>
    ${showControls(model, archive)}
    <p class="sr-only" id="show-search-status" role="status"></p>
    ${showResults(model, archive)}
    <div class="listing-footer"><a href="${archive ? '/' : '/past-shows'}">${archive ? 'Browse Upcoming Shows' : 'Browse Past Shows'}</a></div>` });
}

function spotifyArtistLink(name, url) {
  return `<a class="spotify-artist-link" href="${escape(url)}" ${external}>
    ${icon('music')} Spotify Artist<span class="sr-only"> for ${escape(name)} (opens in a new tab)</span>
  </a>`;
}

function spotifyTracks(tracks) {
  if (!tracks.length) return '';
  return `<section class="detail-section spotify-tracks" aria-labelledby="listen">
    <h2 id="listen" tabindex="-1">Listen to the Lineup</h2>
    <ul>${tracks.map(({ name, trackId, spotifyArtistUrl }) => `<li>
      <div class="spotify-track">
        <h3>${escape(name)}</h3>
        ${spotifyArtistUrl ? spotifyArtistLink(name, spotifyArtistUrl) : ''}
      </div>
      <iframe src="https://open.spotify.com/embed/track/${trackId}" title="Spotify track by ${escape(name)}"
        height="152" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen></iframe>
    </li>`).join('')}</ul>
  </section>`;
}

function artistLinks(artists) {
  const entries = artists.flatMap(({ name, url, trackId, spotifyArtistUrl }) => {
    const website = url && url !== spotifyArtistUrl ?
      `<a href="${escape(url)}" ${external}>${escape(name)}<span class="sr-only"> (opens in a new tab)</span></a>` : '';
    const profile = spotifyArtistUrl && !trackId ? spotifyArtistLink(name, spotifyArtistUrl) : '';
    if (!website && !profile) return [];
    return [`<li>${website || `<span>${escape(name)}</span>`}${profile}</li>`];
  });
  return entries.length ? `<section class="detail-section"><h2>Artist Links</h2><ul class="artist-links">${entries.join('')}</ul></section>` : '';
}

export function detail(show, state) {
  const path = showPath(show);
  const date = dateLabel(show.date, dateLong);
  const description = show.description || `${show.title} at The Shredder in Boise, Idaho on ${date}.`;
  const ticketInfo = ticket(show, state);
  const eventStatus = { scheduled: 'EventScheduled', canceled: 'EventCancelled', postponed: 'EventPostponed' }[state];
  const structured = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: show.title, startDate: show.start ? show.start.toISOString() : show.date,
    ...(dateTime(show.endDateTime) ? { endDate: dateTime(show.endDateTime).toISOString() } : {}),
    ...(eventStatus ? { eventStatus: 'https://schema.org/' + eventStatus } : {}),
    ...(show.flyer ? { image: siteOrigin + show.flyer } : {}),
    ...(show.description ? { description: show.description } : {}),
    location: venueLocation,
    performer: show.lineup.map((name) => ({ '@type': 'MusicGroup', name })),
    ...(ticketInfo.url ? { offers: { '@type': 'Offer', url: ticketInfo.url,
      availability: 'https://schema.org/InStock' } } : {}),
  };
  const tracks = show.artists.filter(({ trackId }) => trackId);
  const media = (show.media || []).flatMap(({ src, alt, credit }) => {
    const url = assetUrl(src);
    if (!url) return [];
    const content = /\.(mp4|webm)$/i.test(url) ? `<video controls playsinline preload="none" aria-label="${escape(alt || show.title)}" src="${url}"></video>` :
      `<img loading="lazy" src="${url}" alt="${escape(alt || show.title)}">`;
    return [`<figure>${content}${credit ? `<figcaption>${escape(credit)}</figcaption>` : ''}</figure>`];
  });
  return layout({ title: `${show.title} at The Shredder | ${dateLabel(show.date, { month: 'long', day: 'numeric', year: 'numeric' })}`,
    description, path, active: state === 'completed' ? '/past-shows' : '/', structured,
    body: `${showBackLink(state)}
    <article class="detail">
      <div class="detail-top${show.flyer ? '' : ' has-venue-photo'}">
        ${show.flyer ? `<div class="detail-visual">${flyer(show, true, true)}</div>` : ''}
        <div class="detail-info">
          <p class="eyebrow"><time datetime="${show.date}">${date}</time></p>
          <h1>${escape(show.title)}</h1>
          ${lineup(show)}
          ${facts(show)}
          ${show.promoter ? `<p class="credit">Presented by ${escape(show.promoter)}</p>` : ''}
          <div class="detail-actions">
            ${showActions(show, state, false)}
            ${tracks.length ? `<a class="button secondary" href="#listen">${icon('play')} Listen to the Lineup</a>` : ''}
          </div>
        </div>
      </div>
      ${show.description ? `<section class="detail-section"><h2>About the Show</h2><p>${escape(show.description)}</p></section>` : ''}
      ${spotifyTracks(tracks)}
      ${artistLinks(show.artists)}
      ${media.length ? `<section class="detail-section"><h2>Show Media</h2><div class="gallery">${media.join('')}</div></section>` : ''}
      <section class="detail-section"><h2>The Venue</h2><address>${escape(address)}</address><a href="/venue">Venue Information</a></section>
    </article>` });
}

export function showBackLink(state) {
  return `<a class="back-link" href="${state === 'completed' ? '/past-shows' : '/'}">${icon('prev')}${state === 'completed' ? 'Past Shows' : 'Upcoming Shows'}</a>`;
}

export function contactPage() {
  return layout({ title: 'Contact & Socials | The Shredder', path: '/contact', active: '/contact',
    description: 'Contact The Shredder for show bookings and find the Boise venue on Instagram and Facebook.',
    body: `<section class="page-heading"><div><p class="eyebrow">Boise, Idaho</p><h1>Contact &amp; Socials</h1></div></section>
    <section class="venue-panel">
      <div class="venue-contact">
        <h2>Booking</h2>
        <a href="mailto:${bookingEmail}">${bookingEmail}</a>
        <h2>Follow The Shredder</h2>
        <ul class="artist-links">${socialLinks.map(([label, url]) =>
          `<li><a href="${escape(url)}" ${external}>${label}<span class="sr-only"> (opens in a new tab)</span></a></li>`).join('')}</ul>
        <address>${escape(address)}</address>
      </div>
      <img src="/assets/entrance.webp" alt="The Shredder entrance lit up at night">
    </section>` });
}

function venuePhoto(file, alt, className = '') {
  const src = `/assets/${file}.webp`;
  return `<a href="${src}"${className ? ` class="${className}"` : ''}><img src="${src}" alt="${escape(alt)}" loading="lazy" decoding="async"></a>`;
}

export function venuePage(upcoming) {
  const photos = [
    ['stage-red', 'Guitarist and bassist performing under red lights with arcade cabinets behind the stage'],
    ['pinball', 'Teenage Mutant Ninja Turtles pinball machine with a horror prop above it'],
    ['arcade', 'Tekken Tag Tournament and other cabinets along the green arcade hallway'],
    ['cabinets', 'Bad Dudes arcade cabinet inside The Shredder'],
  ];
  const videos = [
    ['shredder-bar', 'The sticker-covered bar'],
    ['shredder-restroom', 'The sticker-covered restroom'],
  ];
  const visitorInfo = [
    ['Location', address],
    ['Capacity', 'Approximately 300'],
    ['Ages', 'Generally all ages. Check individual show listings for any age restrictions.'],
    ['Drinks', 'Draft beer, canned alcoholic beverages, energy drinks, and other nonalcoholic options are available. Valid ID required for alcohol purchases.'],
    ['Seating', 'Most shows are general admission and primarily standing-room, with some seating available around the venue.'],
    ['Amenities', 'Pool table, arcade games, pinball, photo booth, upstairs seating, outdoor patio space, and a half-pipe.'],
    ['Tickets', 'Prices, doors, showtimes, and ticketing platforms vary by event. Check the individual show page for details.'],
    ['Sound', 'Live shows can get loud. Hearing protection is recommended.'],
  ];
  const description = 'Visit The Shredder, an independent live music venue in downtown Boise. Find directions, venue info, and upcoming punk, hardcore, metal, and indie shows.';
  const shareImage = { src: '/assets/exterior.webp', alt: 'The Shredder marquee, red roll-up door, and sticker-covered entrance' };
  return layout({ title: 'The Shredder | Independent Live Music Venue in Boise, Idaho', path: '/venue', active: '/venue',
    description, shareImage,
    structured: { '@context': 'https://schema.org', ...venueLocation, description,
      image: siteOrigin + shareImage.src, hasMap: maps, sameAs: socialLinks.map(([, url]) => url) },
    body: `<header class="page-heading"><div><p class="eyebrow">Downtown Boise, Idaho</p><h1>The Venue</h1></div></header>
    <section class="venue-panel venue-intro" aria-labelledby="the-shredder">
      <div class="venue-copy">
        <h2 id="the-shredder">The Shredder</h2>
        <address>430 S. 10th Street, Boise, Idaho</address>
        <p>The Shredder has been a fixture in Boise's underground music scene for well over a decade. Located downtown on 10th Street, it's an independent, roughly 300-capacity venue where local bands share the stage with touring artists from all over.</p>
        <p>Punk, hardcore, and metal are a big part of its history, but there's plenty more on the calendar. Indie rock, alternative, experimental music, and bands that don't fit neatly into any one category all find their way through here.</p>
        <p>It's a small enough room to get right up front, loud enough to make earplugs a good idea, and the kind of place where you might discover your next favorite band opening for somebody you already love.</p>
        <a class="button primary" href="${maps}" ${external}>Get Directions<span class="sr-only"> (opens in a new tab)</span></a>
      </div>
      <img src="${shareImage.src}" alt="${shareImage.alt}" fetchpriority="high" decoding="async">
    </section>
    <section class="venue-section" aria-labelledby="inside">
      <div class="venue-feature">
        <h2 id="inside">Inside The Shredder</h2>
        ${venuePhoto('entrance', 'The Shredder entrance lit up at night', 'venue-feature-photo')}
        <div class="venue-copy">
          <p>There's a lot more to The Shredder than the stage.</p>
          <p>Pool, old-school arcade games, pinball, a photo booth, and walls covered in posters, artwork, and assorted oddities give you plenty to explore before the music starts. Upstairs, there's additional seating and more of the collection of things that have accumulated around the venue over the years.</p>
          <p>There's also a bar serving beer and a variety of alcoholic and nonalcoholic drinks.</p>
          <p>The main music room is primarily standing-room, with the stage close to the crowd. Depending on the show, you might find a packed floor and an active pit, or a smaller audience watching a band that's just passing through town.</p>
          <p>There's room to hang back if that's more your speed, too.</p>
        </div>
      </div>
      <div class="venue-gallery">
        ${photos.map(([file, alt]) => venuePhoto(file, alt)).join('')}
        ${videos.map(([file, label]) => `<figure>
          <video src="/assets/${file}.mp4" poster="/assets/${file}.webp" controls playsinline preload="none" aria-label="${label} video"></video>
          <figcaption>${label}</figcaption>
        </figure>`).join('')}
      </div>
    </section>
    <section class="venue-section venue-feature" aria-labelledby="more-than-the-music-room">
      <h2 id="more-than-the-music-room">More Than the Music Room</h2>
      ${venuePhoto('patio', 'Patio picnic tables and the illuminated Shredder marquee after dark', 'venue-feature-photo venue-feature-patio')}
      <div class="venue-copy">
        <p>The Shredder has outdoor patio space for taking a break between sets, catching up with friends, or escaping the volume for a bit.</p>
        <p>And yes, there's a half-pipe.</p>
        <p>The skate influence isn't just in the name. It's been part of The Shredder's character for years, right alongside the arcade games, band posters, and everything else that makes the building recognizable to people who've spent time there.</p>
      </div>
    </section>
    <section class="venue-section venue-copy" aria-labelledby="boise-music">
      <h2 id="boise-music">Part of Boise's Music Scene</h2>
      <p>The Shredder has hosted live music dating back to at least 2010, and over the years it's become a regular stop for touring punk, hardcore, metal, and independent artists.</p>
      <p>It's also a place where Boise bands get to play alongside artists from outside the Treasure Valley. Some are established local favorites. Others are still finding their audience.</p>
      <p>Beyond regular concerts, The Shredder has participated in Treefort Music Fest and hosted community events like the Boise Punk Flea Market, bringing local artists, vendors, and music fans together under one roof.</p>
      <p>For a venue its size, a lot has happened here. And there's always another show on the calendar.</p>
    </section>
    <section class="venue-section" aria-labelledby="know-before-you-go">
      <h2 id="know-before-you-go">Know Before You Go</h2>
      <dl class="venue-facts">
        ${visitorInfo.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}
      </dl>
    </section>
    <section class="venue-section venue-upcoming" aria-labelledby="whats-playing">
      <div class="venue-copy">
        <h2 id="whats-playing">What's Playing?</h2>
        <p>There's always something coming through The Shredder. Check out the upcoming lineup, listen to the bands, and find your next show.</p>
      </div>
      ${venueShowCards(upcoming)}
      <div class="listing-footer"><a class="button secondary" href="/">Explore Upcoming Shows</a></div>
    </section>` });
}

export function venueShowCards(upcoming) {
  return `<div class="venue-show-cards">${upcoming.length ? upcoming.map((entry) => card(entry, false)).join('') :
    '<p class="empty">No upcoming dates are posted.</p>'}</div>`;
}

export function errorPage(code) {
  const heading = code === 404 ? 'Page Not Found' : 'Site Temporarily Unavailable';
  return layout({ title: heading + ' | The Shredder', description: heading, path: '/', indexable: false,
    body: `<section class="page-heading"><h1>${heading}</h1></section><a class="button secondary" href="/">Upcoming Shows</a>` });
}
