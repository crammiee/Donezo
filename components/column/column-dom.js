import { createElement, clearChildren } from '../../utils/dom-utils.js';

/**
 * Renders a column's header and empty task list into its container.
 * Task cards are injected in a later branch.
 * @param {Column} column
 * @param {Object[]} tasks
 */
export function renderColumn(column, tasks) {
  const $col = column.$element;
  clearChildren($col);

  $col.appendChild(buildColumnHeader(column, tasks.length));
  $col.appendChild(buildTaskList());
}

function buildColumnHeader(column, count) {
  const $header = createElement('div', ['column__header']);

  const $dot = createElement('span', ['column__dot']);

  const $title = createElement('span', ['column__title']);
  $title.textContent = column.label;

  const $count = createElement('span', ['column__count']);
  $count.textContent = count;

  $header.appendChild($dot);
  $header.appendChild($title);
  $header.appendChild($count);

  return $header;
}

function buildTaskList() {
  const $list = createElement('div', ['column__task-list'], { role: 'list' });
  return $list;
}