const staticPage = document.querySelector('#static-page');
let staticSearch;
if (staticPage) {
  try {
    const { hydrateStaticPage } = await import('./static-site.js');
    staticSearch = hydrateStaticPage(JSON.parse(staticPage.textContent));
  } catch (error) {
    console.error('The static site could not update from the show data.', error);
  }
}

const period = document.querySelector('[data-period]');
period?.addEventListener('change', () => {
  const dateRange = period.form.elements.namedItem('when');
  if (period.value && dateRange) dateRange.disabled = true;
  period.form.requestSubmit();
});

const showSearch = document.querySelector('#show-search');
if (showSearch && (!staticPage || staticSearch)) {
  const results = document.querySelector('[data-show-results]');
  const status = document.querySelector('#show-search-status');
  let timer;
  let request;

  const updateSearch = (event) => {
    if (event.isComposing) return;
    clearTimeout(timer);
    request?.abort();
    const query = showSearch.value.trim();
    for (const link of document.querySelectorAll('[data-search-links] a')) {
      const url = new URL(link.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      link.href = url.href;
    }
    timer = setTimeout(async () => {
      const controller = new AbortController();
      request = controller;
      const url = new URL(showSearch.form.action);
      for (const [key, value] of new FormData(showSearch.form)) {
        const filter = key === 'q' ? query : value;
        if (filter) url.searchParams.set(key, filter);
      }
      results.setAttribute('aria-busy', 'true');
      try {
        let html;
        if (staticSearch) {
          html = staticSearch(url.searchParams);
        } else {
          const response = await fetch(url, {
            headers: { 'X-Show-Search': 'results' },
            signal: controller.signal,
          });
          if (!response.ok) throw new Error('Search request failed');
          html = await response.text();
        }
        const fragment = document.createElement('template');
        fragment.innerHTML = html;
        if (controller.signal.aborted) return;
        const update = fragment.content.querySelector('[data-show-results]');
        if (!update) throw new Error('Search results missing');
        results.replaceChildren(...update.childNodes);
        results.dataset.showResults = update.dataset.showResults;
        history.replaceState(history.state, '', url);
        const count = Number(update.dataset.showResults);
        status.classList.add('sr-only');
        status.textContent = count === 0 ? 'No matching shows.' : `${count} ${count === 1 ? 'show' : 'shows'} found.`;
      } catch {
        if (controller.signal.aborted) return;
        status.classList.remove('sr-only');
        status.textContent = 'Search could not update. Use Apply filters to retry.';
      } finally {
        if (!controller.signal.aborted) results.removeAttribute('aria-busy');
      }
    }, 180);
  };
  showSearch.addEventListener('input', updateSearch);
  showSearch.addEventListener('compositionend', updateSearch);
  if (showSearch.value !== showSearch.defaultValue) updateSearch({ isComposing: false });
}


