import { createElement } from '../../utils/dom-utils.js';

const SHORTCUTS = [
  { key: 'Enter', action: 'Add a new task (defaults to To Do)' },
  { key: 'Tab', action: 'Navigate between elements' },
  { key: '← →', action: 'Move focused task between columns' },
  { key: 'Delete', action: 'Remove focused task' },
  { key: 'Esc', action: 'Close modal' },
];

function createHelpOverlay() {
  const $overlay = createElement('div', 'modal-overlay');
  $overlay.id = 'HELP_MODAL';
  $overlay.appendChild(createHelpContent($overlay));
  return $overlay;
}

function createHelpContent($overlay) {
  const $modal = createElement('div', 'modal');
  $modal.appendChild(createElement('h2', 'modal__title', 'Keyboard Shortcuts'));
  $modal.appendChild(createShortcutList());
  $modal.appendChild(createCloseButton($overlay));
  return $modal;
}

function createShortcutList() {
  const $list = createElement('ul', 'help__list');
  SHORTCUTS.forEach((shortcut) => $list.appendChild(createShortcutItem(shortcut)));
  return $list;
}

function createShortcutItem({ key, action }) {
  const $item = createElement('li', 'help__item');
  $item.appendChild(createElement('kbd', 'help__key', key));
  $item.appendChild(createElement('span', 'help__action', action));
  return $item;
}

function createCloseButton($overlay) {
  const $actions = createElement('div', 'modal__actions');
  const $btn = createElement('button', 'modal__btn modal__btn--confirm', 'Got it');
  $btn.addEventListener('click', () => $overlay.remove());
  $actions.appendChild($btn);
  return $actions;
}

export function openHelpModal() {
  const $existing = document.getElementById('HELP_MODAL');
  if ($existing) $existing.remove();

  const $overlay = createHelpOverlay();
  $overlay.addEventListener('click', (e) => { if (e.target === $overlay) $overlay.remove(); });
  $overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') $overlay.remove(); });

  document.body.appendChild($overlay);
  $overlay.querySelector('.modal__btn--confirm').focus();
}