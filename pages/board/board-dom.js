export function getColumnEl(status) {
  return document.querySelector(`.column[data-status="${status}"]`);
}

export function updateColumnCount(status) {
  const $col = getColumnEl(status);
  const count = $col.querySelectorAll('.card').length;
  $col.querySelector('.column__count').textContent = count;
  $col.querySelector('.column__empty').style.display = count === 0 ? 'block' : 'none';
}

export function highlightColumn($col) {
  clearColumnHighlights();
  if ($col) $col.classList.add('column--drag-over');
}

export function clearColumnHighlights() {
  document.querySelectorAll('.column--drag-over').forEach(($c) => {
    $c.classList.remove('column--drag-over');
  });
}