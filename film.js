// Quiet, viewport-led playback. The poster remains when motion or autoplay is unavailable.
(() => {
 const video = document.querySelector('#agni-film');
 if (!video) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let visible = false, paused = document.body.classList.contains('motion-paused');
 video.muted = true;
 video.defaultMuted = true;
 video.playsInline = true;
 video.controls = false;
 video.disablePictureInPicture = true;
 function sync() {
  if (visible && !document.hidden && !reduced.matches && !paused) {
   const source = video.querySelector('source[data-src]');
   if (source && source.dataset.src) {
     source.src = source.dataset.src;
     source.removeAttribute('data-src');
     video.load();
     if (video.paused) video.play().catch(() => { /* Preserve the quiet poster fallback. */ });
   }
  } else video.pause();
 }
 new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .1;
  sync();
 }, {threshold: [0, .1]}).observe(video);
 reduced.addEventListener('change', sync);
 document.addEventListener('visibilitychange', sync);
 addEventListener('nova:motion', event => { paused = event.detail; sync(); });
 addEventListener('pagehide', () => video.pause());
 addEventListener('pageshow', sync);
})();
