(() => {
  const ambientVideo = document.querySelector('[data-src]');
  if (ambientVideo) {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    const toggle = document.querySelector('.motion-setting');
    const preferenceKey = 'shredder-pause-background';
    let pausedByVisitor = false;
    let startedByVisitor = false;
    let playbackFailed = false;
    let attempt = 0;
    try {
      pausedByVisitor = localStorage.getItem(preferenceKey) === 'true';
    } catch {
      // The in-page toggle still works when storage is unavailable.
    }

    const prefersStill = () => motion.matches || connection?.saveData ||
      ['slow-2g', '2g'].includes(connection?.effectiveType);
    const shouldPause = () => pausedByVisitor || playbackFailed || (prefersStill() && !startedByVisitor);
    const displayPaused = (paused) => {
      toggle.hidden = false;
      toggle.dataset.paused = String(paused);
      toggle.title = paused ? 'Play background motion' : 'Pause background motion';
      toggle.setAttribute('aria-label', toggle.title);
    };
    const updatePlayback = async () => {
      const current = ++attempt;
      const paused = shouldPause();
      displayPaused(paused);
      if (paused) {
        if (ambientVideo.hasAttribute('src')) {
          ambientVideo.pause();
          ambientVideo.removeAttribute('src');
          ambientVideo.load();
        }
        ambientVideo.classList.remove('playing');
        return;
      }
      if (!ambientVideo.hasAttribute('src')) ambientVideo.src = ambientVideo.dataset.src;
      ambientVideo.defaultPlaybackRate = 0.55;
      ambientVideo.playbackRate = 0.55;
      try {
        await ambientVideo.play();
        if (current === attempt && !ambientVideo.paused) ambientVideo.classList.add('playing');
      } catch {
        if (current !== attempt) return;
        playbackFailed = true;
        ambientVideo.classList.remove('playing');
        displayPaused(true);
      }
    };
    toggle.addEventListener('click', () => {
      startedByVisitor = shouldPause();
      pausedByVisitor = !startedByVisitor;
      playbackFailed = false;
      try {
        localStorage.setItem(preferenceKey, String(pausedByVisitor));
      } catch {
        // Storage is optional.
      }
      updatePlayback();
    });
    if (document.readyState === 'complete') updatePlayback();
    else window.addEventListener('load', updatePlayback, { once: true });
    const refreshPreference = () => {
      startedByVisitor = false;
      updatePlayback();
    };
    motion.addEventListener('change', refreshPreference);
    connection?.addEventListener('change', refreshPreference);
  }
})();
