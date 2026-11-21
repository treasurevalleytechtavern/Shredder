(() => {
  const preview = document.querySelector('#flyer-preview');
  if (!preview?.showModal) return;

  const title = preview.querySelector('h2');
  const image = preview.querySelector('img');

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[data-flyer-title]');
    if (!link) return;
    title.textContent = link.dataset.flyerTitle + ' Flyer';
    image.alt = link.dataset.flyerAlt;
    image.src = link.href;
    preview.showModal();
    event.preventDefault();
  });

  preview.addEventListener('click', (event) => {
    if (event.target === preview) preview.close();
  });
})();
