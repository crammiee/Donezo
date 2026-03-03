export class BoardDOM {
  getColumnEl(status) {
    return document.querySelector(`.column[data-status="${status}"]`);
  }

  updateColumnCount(status) {
    const $target_column = this.getColumnEl(status);
    const count = $target_column.querySelectorAll('.card').length;
    $target_column.querySelector('.column__count').textContent = count;
    $target_column.querySelector('.column__empty').style.display = count === 0 ? 'block' : 'none';
  }

  async mountCard(card) {
    const $target_column = this.getColumnEl(card.status);
    await card.render($target_column);
    this.updateColumnCount(card.status);
  }

  highlightColumn($target_column) {
    this.clearColumnHighlights();
    if ($target_column) $target_column.classList.add('column--drag-over');
  }

  clearColumnHighlights() {
    document.querySelectorAll('.column--drag-over').forEach(($c) => {
      $c.classList.remove('column--drag-over');
    });
  }
}