import { createElement } from '../../../utils/dom-utils.js';

const SHORTCUTS = [
  { key: 'Enter', action: 'Add a new task (defaults to To Do)' },
  { key: 'Tab / Shift + Tab', action: 'Navigate between elements' },
  { key: '← →', action: 'Move focused task between columns' },
  { key: '↑ ↓', action: 'Navigate between tasks' },
  { key: 'Delete', action: 'Remove focused task' },
  { key: 'Esc', action: 'Close modal' },
];

export class HelpModal {
  open() {
    const $existing = document.getElementById('HELP_MODAL');
    if ($existing) $existing.remove();

    const $overlay = this.createElement();
    this.attachEventListeners($overlay);
    document.body.appendChild($overlay);
    $overlay.querySelector('.modal__btn--confirm').focus();
  }

  createElement() {
    const $overlay = createElement('div', 'modal-overlay');
    $overlay.id = 'HELP_MODAL';
    $overlay.appendChild(this.createContent($overlay));
    return $overlay;
  }

  createContent($overlay) {
    const $modal = createElement('div', 'modal');
    $modal.appendChild(createElement('h2', 'modal__title', 'Keyboard Shortcuts'));
    $modal.appendChild(this.createShortcutList());
    $modal.appendChild(this.createCloseButton($overlay));
    return $modal;
  }

  createShortcutList() {
    const $list = createElement('ul', 'help__list');
    SHORTCUTS.forEach((shortcut) => $list.appendChild(this.createShortcutItem(shortcut)));
    return $list;
  }

  createShortcutItem({ key, action }) {
    const $item = createElement('li', 'help__item');
    $item.appendChild(createElement('kbd', 'help__key', key));
    $item.appendChild(createElement('span', 'help__action', action));
    return $item;
  }

  createCloseButton($overlay) {
    const $actions = createElement('div', 'modal__actions');
    const $btn = createElement('button', 'modal__btn modal__btn--confirm', 'Got it');
    $btn.addEventListener('click', () => $overlay.remove());
    $actions.appendChild($btn);
    return $actions;
  }

  attachEventListeners($overlay) {
    $overlay.addEventListener('click', (e) => { if (e.target === $overlay) $overlay.remove(); });
    $overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') $overlay.remove(); });
  }
}