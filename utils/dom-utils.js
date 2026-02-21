export function createElement(tag, className, textContent = '') {
  const $el = document.createElement(tag);
  if (className) $el.className = className;
  if (textContent) $el.textContent = textContent;
  return $el;
}

export function trapFocus(e, $container) {
  if (e.key !== 'Tab') return;

  const focusable = $container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}