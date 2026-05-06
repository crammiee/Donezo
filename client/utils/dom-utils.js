const templateCache = {};

export async function loadTemplate(path) {
  if (templateCache[path]) return templateCache[path].cloneNode(true);

  const response = await fetch(path);
  const html = await response.text();
  const $wrapper = document.createElement('div');
  $wrapper.innerHTML = html.trim();
  templateCache[path] = $wrapper.firstElementChild;
  return templateCache[path].cloneNode(true);
}

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
    if (document.activeElement === first) wrapFocusToEnd(e, last);
  } else {
    if (document.activeElement === last) wrapFocusToStart(e, first);
  }
}

function wrapFocusToEnd(e, $last) {
  e.preventDefault();
  $last.focus();
}

function wrapFocusToStart(e, $first) {
  e.preventDefault();
  $first.focus();
}