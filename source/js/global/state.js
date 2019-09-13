export default() => {
  const body = document.body;
  const STATES = {
    mouse: 'is-mouse',
    key: 'is-key',
    touch: 'is-touch'
  };

  document.addEventListener('mousedown', () => {
    body.classList.add(STATES.mouse);
    body.classList.remove(STATES.key);
  });

  document.addEventListener('touchstart', () => {
    body.classList.add(STATES.touch);
    body.classList.remove(STATES.mouse);

    window.isTouch = true;
  });

  document.addEventListener('keydown', () => {
    body.classList.add(STATES.key);
    body.classList.remove(STATES.mouse);
  });

  window.addEventListener('resize', () => {
    body.classList.remove(STATES.touch);
    body.classList.remove(STATES.key);

    window.isTouch = false;
  });
};
