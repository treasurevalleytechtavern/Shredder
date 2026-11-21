import records from './shows-data.js';
import { browse, dateTime, showState, upcomingPreview } from '../lib/shows.js';
import { moreShowCards, showActions, showBackLink, showControls, showResults, venueShowCards } from '../lib/views.js';
import { staticPaths } from '../lib/static-paths.js';

const root = new URL('../', import.meta.url).pathname;
const render = (html) => staticPaths(html, root);
const shows = records.map((show) => ({ ...show, start: dateTime(show.startDateTime) }));

export function hydrateStaticPage(page) {
  const now = new Date();
  if (page.kind === 'listing') {
    const modelFor = (params) => browse(shows, params, page.archive, new Date());
    const initial = modelFor(new URLSearchParams(location.search));
    const oldSearch = document.querySelector('#show-search');
    const edited = oldSearch.value !== oldSearch.defaultValue;
    const focused = document.activeElement === oldSearch;
    const controls = document.querySelector('.controls');
    const nextControls = document.createElement('template');
    nextControls.innerHTML = render(showControls(initial, page.archive));
    const motion = controls.querySelector('.motion-setting');
    if (motion) nextControls.content.querySelector('.motion-setting').replaceWith(motion);
    controls.replaceWith(nextControls.content);
    document.querySelector('[data-show-results]').outerHTML = render(showResults(initial, page.archive));
    const search = document.querySelector('#show-search');
    if (edited) search.value = oldSearch.value;
    if (focused) {
      search.focus({ preventScroll: true });
      if (edited) search.setSelectionRange(oldSearch.selectionStart, oldSearch.selectionEnd);
    }
    return (params) => render(showResults(modelFor(params), page.archive));
  }

  if (page.kind === 'venue') {
    document.querySelector('.venue-show-cards').outerHTML = render(venueShowCards(upcomingPreview(shows, now)));
    return null;
  }

  const show = shows.find(({ slug }) => slug === page.slug);
  const moreShows = document.querySelector('.more-shows');
  if (moreShows) {
    moreShows.outerHTML = render(moreShowCards(upcomingPreview(shows, now, { limit: 4, excludeSlug: page.slug })));
  }
  if (show && showState(show, now) === 'completed' && page.state !== 'completed') {
    document.querySelector('.detail-actions .actions').outerHTML = render(showActions(show, 'completed', false));
    document.querySelector('.back-link').outerHTML = render(showBackLink('completed'));
    for (const link of document.querySelectorAll('header nav a, footer nav a')) {
      if (link.pathname === root + 'past-shows/') link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const script = document.querySelector('script[type="application/ld+json"]');
    const structured = JSON.parse(script.textContent);
    delete structured.offers;
    delete structured.eventStatus;
    script.textContent = JSON.stringify(structured).replaceAll('<', '\\u003c');
  }
  return null;
}
