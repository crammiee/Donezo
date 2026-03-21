export function showToast(message) {
  const $toast = document.createElement('div');
  $toast.className = 'toast';
  $toast.textContent = message;
  document.body.appendChild($toast);
  requestAnimationFrame(() => $toast.classList.add('toast--visible'));
  setTimeout(() => {
    $toast.classList.remove('toast--visible');
    $toast.addEventListener('transitionend', () => $toast.remove());
  }, 3000);
}
