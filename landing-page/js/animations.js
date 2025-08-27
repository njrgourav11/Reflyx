/* GSAP animations */
(function(){
  if (!window.gsap) return;
  const { gsap } = window;
  gsap.registerPlugin(window.ScrollTrigger);

  gsap.from('header', { y: -20, opacity: 0, duration: .6, ease: 'power2.out' });
  gsap.utils.toArray('.feature-card').forEach((el, i) => {
    gsap.from(el, { opacity: 0, y: 16, duration: .5, delay: i * .06, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('.step-card').forEach((el, i) => {
    gsap.from(el, { opacity: 0, y: 16, duration: .5, delay: i * .06, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
})();

