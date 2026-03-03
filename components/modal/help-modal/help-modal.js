import { loadTemplate, createElement } from '../../../utils/dom-utils.js';

const TEMPLATE_PATH = '/components/modal/help-modal/help-modal.html';

const SHORTCUTS = [
  { key: 'Enter', action: 'Add a new task (defaults to To Do)' },
  { key: 'Tab / Shift + Tab', action: 'Navigate between elements' },
  { key: '← →', action: 'Move focused task between columns' },
  { key: '↑ ↓', action: 'Navigate between tasks' },
  { key: 'Delete', action: 'Remove focused task' },
  { key: 'Esc', action: 'Close modal' },
];

export class HelpModal {
  async open() {
    const $existing = document.getElementById('HELP_MODAL');
    if ($existing) $existing.remove();

    const $overlay = await loadTemplate(TEMPLATE_PATH);
    this.populateShortcuts($overlay);
    this.attachEventListeners($overlay);
    document.body.appendChild($overlay);
    $overlay.classList.remove('modal-overlay--hidden');
    $overlay.querySelector('#HELP_CLOSE').focus();
  }

  populateShortcuts($overlay) {
    const $list = $overlay.querySelector('.help__list');
    SHORTCUTS.forEach((shortcut) => $list.appendChild(this.createShortcutItem(shortcut)));
  }

  createShortcutItem({ key, action }) {
    const $item = createElement('li', 'help__item');
    $item.appendChild(createElement('kbd', 'help__key', key));
    $item.appendChild(createElement('span', 'help__action', action));
    return $item;
  }

  attachEventListeners($overlay) {
    $overlay.querySelector('#HELP_CLOSE').addEventListener('click', () => $overlay.remove());
    $overlay.addEventListener('click', (e) => { if (e.target === $overlay) $overlay.remove(); });
    $overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') $overlay.remove(); });
  }
}