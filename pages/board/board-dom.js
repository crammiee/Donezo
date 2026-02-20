export function getColumnEl(status) {
  return document.querySelector(`.column[data-status="${status}"]`);
}

export function updateColumnCount(status) {
  const $col = getColumnEl(status);
  const count = $col.querySelectorAll('.card').length;
  $col.querySelector('.column__count').textContent = count;
  $col.querySelector('.column__empty').style.display = count === 0 ? 'block' : 'none';
}