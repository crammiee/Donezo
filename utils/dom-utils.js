/**
 * Creates a DOM element with optional class names and attributes.
 * @param {string} tag
 * @param {string[]} classNames
 * @param {Object} attrs
 * @returns {HTMLElement}
 */
export function createElement(tag, classNames = [], attrs = {}) {
  const $el = document.createElement(tag);
  if (classNames.length) $el.className = classNames.join(' ');
  Object.entries(attrs).forEach(([key, val]) => $el.setAttribute(key, val));
  return $el;
}

/**
 * Removes all children from a DOM element.
 * @param {HTMLElement} $el
 */
export function clearChildren($el) {
  while ($el.firstChild) $el.removeChild($el.firstChild);
}