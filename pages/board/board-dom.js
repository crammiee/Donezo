export class BoardDOM {
  getColumnEl(status) {
    return document.querySelector(`.column[data-status="${status}"]`);
  }

  updateColumnCount(status) {
    const $col = this.getColumnEl(status);
    const count = $col.querySelectorAll('.card').length;
    $col.querySelector('.column__count').textContent = count;
    $col.querySelector('.column__empty').style.display = count === 0 ? 'block' : 'none';
  }

  async mountCard(card) {
    const $col = this.getColumnEl(card.status);
    await card.render($col);
    this.updateColumnCount(card.status);
  }

  highlightColumn($col) {
    this.clearColumnHighlights();
    if ($col) $col.classList.add('column--drag-over');
  }

  clearColumnHighlights() {
    document.querySelectorAll('.column--drag-over').forEach(($c) => {
      $c.classList.remove('column--drag-over');
    });
  }
}