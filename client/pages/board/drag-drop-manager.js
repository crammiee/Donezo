export class DragDropManager {
  constructor(boardDOM, cardActions, storage, syncQueue) {
    this.boardDOM = boardDOM;
    this.cardActions = cardActions;
    this.storage = storage;
    this.syncQueue = syncQueue;
    this.draggedCard = null;
    this.dropTarget = null;
  }

  handleDragStart(card) {
    this.draggedCard = card;
  }

  handleDragEnd() {
    this.draggedCard = null;
    this.boardDOM.clearColumnHighlights();
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.boardDOM.highlightColumn(e.currentTarget);
    this.updateDropTarget(e.currentTarget, e.clientY);
  }

  handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.boardDOM.clearColumnHighlights();
      this.clearDropIndicator();
    }
  }

  async handleDrop(e) {
    e.preventDefault();
    this.boardDOM.clearColumnHighlights();
    this.clearDropIndicator();
    if (!this.draggedCard) return;

    const newStatus = e.currentTarget.dataset.status;
    const referenceCard = this.dropTarget;
    this.dropTarget = null;

    if (newStatus === this.draggedCard.status) {
      this.boardDOM.reorderCard(this.draggedCard, referenceCard);
    } else {
      await this.cardActions.handleDrop(this.draggedCard, newStatus, referenceCard);
    }
    this.saveColumnOrder(newStatus);
    this.draggedCard = null;
  }

  updateDropTarget($column, clientY) {
    this.clearDropIndicator();
    const $cards = Array.from($column.querySelectorAll('.card:not(.card--dragging)'));
    if ($cards.length === 0) { this.dropTarget = null; return; }

    const closest = this.findClosestCard($cards, clientY);
    if (closest) {
      closest.classList.add('card--drop-above');
      this.dropTarget = this.cardActions.findCardByElement(closest);
    } else {
      $cards[$cards.length - 1].classList.add('card--drop-below');
      this.dropTarget = null;
    }
  }

  findClosestCard($cards, clientY) {
    let closest = null;
    let closestOffset = Infinity;
    for (const $card of $cards) {
      const midY = $card.getBoundingClientRect().top + $card.offsetHeight / 2;
      const offset = clientY - midY;
      if (offset < 0 && Math.abs(offset) < closestOffset) {
        closestOffset = Math.abs(offset);
        closest = $card;
      }
    }
    return closest;
  }

  clearDropIndicator() {
    document.querySelectorAll('.card--drop-above, .card--drop-below').forEach(($c) => {
      $c.classList.remove('card--drop-above', 'card--drop-below');
    });
  }

  saveColumnOrder(status) {
    const $column = this.boardDOM.getColumnEl(status);
    const $cards = $column.querySelectorAll('.card');
    const updatedTasks = [];

    Array.from($cards).forEach(($c, i) => {
      const card = this.cardActions.findCard($c.dataset.id);
      if (!card) return;
      card.position = i;
      updatedTasks.push(card.toData());
    });

    const allTasks = this.storage.load();
    for (const t of allTasks) {
      const card = this.cardActions.findCard(t.id);
      if (card) t.position = card.position;
    }
    this.storage.save(allTasks);
    this.syncQueue.enqueue(updatedTasks);
  }

  attachListeners() {
    document.querySelectorAll('.column').forEach(($col) => {
      $col.addEventListener('dragover', (e) => this.handleDragOver(e));
      $col.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      $col.addEventListener('drop', (e) => this.handleDrop(e));
    });
  }
}
