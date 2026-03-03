export class BoardDOM {
  getColumnEl(status) {
    return document.querySelector(`.column[data-status="${status}"]`);
  }

  updateColumnCount(status) {
    const $targetColumn = this.getColumnEl(status);
    const count = $targetColumn.querySelectorAll('.card').length;
    $targetColumn.querySelector('.column__count').textContent = count;
    $targetColumn.querySelector('.column__empty').classList.toggle('column__empty--hidden', count > 0);
  }

  async mountCard(card) {
    const $targetColumn = this.getColumnEl(card.status);
    await card.render($targetColumn);
    this.updateColumnCount(card.status);
  }

  highlightColumn($targetColumn) {
    this.clearColumnHighlights();
    if ($targetColumn) $targetColumn.classList.add('column--drag-over');
  }

  clearColumnHighlights() {
    document.querySelectorAll('.column--drag-over').forEach(($c) => {
      $c.classList.remove('column--drag-over');
    });
  }
}
