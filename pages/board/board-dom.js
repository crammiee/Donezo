export const COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    emptyText: 'No tasks yet.\nAdd one above to get started.',
  },
  {
    id: 'doing',
    label: 'Doing',
    emptyText: "Tasks you're working on\nappear here.",
  },
  {
    id: 'done',
    label: 'Done',
    emptyText: 'Completed tasks appear here.\nNice progress!',
  },
];

function createHeader() {
  const $header = document.createElement('div');
  $header.className = 'board__header';

  const $title = document.createElement('h1');
  $title.className = 'board__title';
  $title.textContent = 'Donezo';

  const $subtitle = document.createElement('p');
  $subtitle.className = 'board__subtitle';
  $subtitle.textContent = 'Stay organized. Finish fast.';

  $header.appendChild($title);
  $header.appendChild($subtitle);
  return $header;
}

function createColumnHeader(column) {
  const $header = document.createElement('div');
  $header.className = 'column__header';

  const $title = document.createElement('span');
  $title.className = 'column__title';
  $title.textContent = column.label;

  const $count = document.createElement('span');
  $count.className = 'column__count';
  $count.textContent = '0';

  $header.appendChild($title);
  $header.appendChild($count);
  return $header;
}

function createEmptyState(text) {
  const $empty = document.createElement('p');
  $empty.className = 'column__empty';
  $empty.textContent = text;
  return $empty;
}

function createAddButton(status) {
  const $btn = document.createElement('button');
  $btn.className = 'column__add-btn';
  $btn.dataset.status = status;
  $btn.textContent = '+ new task';
  return $btn;
}

export function createColumn(column) {
  const $col = document.createElement('div');
  $col.className = 'column';
  $col.dataset.status = column.id;

  $col.appendChild(createColumnHeader(column));
  $col.appendChild(createEmptyState(column.emptyText));
  $col.appendChild(createAddButton(column.id));

  return $col;
}

export function createHelpButton() {
  const $btn = document.createElement('button');
  $btn.className = 'board__help-btn';
  $btn.id = 'HELP_BTN';
  $btn.textContent = '?';
  $btn.setAttribute('aria-label', 'Keyboard shortcuts help');
  return $btn;
}

export function createBoard() {
  const $board = document.createElement('div');
  $board.className = 'board';

  const $columns = document.createElement('div');
  $columns.className = 'board__columns';
  COLUMNS.forEach((col) => $columns.appendChild(createColumn(col)));

  $board.appendChild(createHeader());
  $board.appendChild($columns);
  $board.appendChild(createHelpButton());

  return $board;
}

export function getColumnEl(status) {
  return document.querySelector(`.column[data-status="${status}"]`);
}

export function updateColumnCount(status) {
  const $col = getColumnEl(status);
  const count = $col.querySelectorAll('.card').length;
  $col.querySelector('.column__count').textContent = count;
  $col.querySelector('.column__empty').style.display = count === 0 ? 'block' : 'none';
}