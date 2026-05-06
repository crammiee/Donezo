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

  async mountCard(card, referenceCard) {
    const $targetColumn = this.getColumnEl(card.status);
    if (referenceCard && referenceCard.$element && referenceCard.$element.parentNode === $targetColumn) {
      await card.render($targetColumn);
      $targetColumn.insertBefore(card.$element, referenceCard.$element);
    } else {
      await card.render($targetColumn);
    }
    this.updateColumnCount(card.status);
  }

  reorderCard(card, referenceCard) {
    const $column = card.$element.closest('.column');
    if (referenceCard) {
      $column.insertBefore(card.$element, referenceCard.$element);
    } else {
      const $addBtn = $column.querySelector('.column__add-btn');
      $column.insertBefore(card.$element, $addBtn);
    }
  }

  unmountCard(card) {
    const oldStatus = card.status;
    card.remove();
    this.updateColumnCount(oldStatus);
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
