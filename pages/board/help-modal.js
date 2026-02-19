const SHORTCUTS = [
  { key: 'Enter', action: 'Add a new task (defaults to To Do)' },
  { key: 'Tab', action: 'Navigate between elements' },
  { key: '← →', action: 'Move focused task between columns' },
  { key: 'Delete', action: 'Remove focused task' },
  { key: 'Esc', action: 'Close modal' },
];

function createHelpOverlay() {
  const $overlay = document.createElement('div');
  $overlay.className = 'modal-overlay';
  $overlay.id = 'HELP_MODAL';
  $overlay.appendChild(createHelpContent($overlay));
  return $overlay;
}

function createHelpContent($overlay) {
  const $modal = document.createElement('div');
  $modal.className = 'modal';

  $modal.appendChild(createTitle());
  $modal.appendChild(createShortcutList());
  $modal.appendChild(createCloseButton($overlay));

  return $modal;
}

function createTitle() {
  const $title = document.createElement('h2');
  $title.className = 'modal__title';
  $title.textContent = 'Keyboard Shortcuts';
  return $title;
}

function createShortcutList() {
  const $list = document.createElement('ul');
  $list.className = 'help__list';
  SHORTCUTS.forEach((shortcut) => $list.appendChild(createShortcutItem(shortcut)));
  return $list;
}

function createShortcutItem({ key, action }) {
  const $item = document.createElement('li');
  $item.className = 'help__item';

  const $key = document.createElement('kbd');
  $key.className = 'help__key';
  $key.textContent = key;

  const $action = document.createElement('span');
  $action.className = 'help__action';
  $action.textContent = action;

  $item.appendChild($key);
  $item.appendChild($action);
  return $item;
}

function createCloseButton($overlay) {
  const $actions = document.createElement('div');
  $actions.className = 'modal__actions';

  const $btn = document.createElement('button');
  $btn.className = 'modal__btn modal__btn--confirm';
  $btn.textContent = 'Got it';
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