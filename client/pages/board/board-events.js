export class BoardEvents {
  constructor(cardActions, boardDOM, modal, dragDrop, tagFilter) {
    this.cardActions = cardActions;
    this.boardDOM = boardDOM;
    this.modal = modal;
    this.dragDrop = dragDrop;
    this.tagFilter = tagFilter;
    this.isUsingKeyboard = false;

    this.cardActions.onDragStart = (card) => this.dragDrop.handleDragStart(card);
    this.cardActions.onDragEnd = () => this.dragDrop.handleDragEnd();
    this.cardActions.onHover = (card) => this.handleCardHover(card);
  }

  attachListeners() {
    document.addEventListener('click', (e) => this.handleAddButtonClick(e));
    document.addEventListener('keydown', (e) => this.handleBoardKeydown(e));
    document.addEventListener('mousemove', () => this.handleBoardMouseMove());
  }

  handleAddButtonClick(e) {
    const $btn = e.target.closest('.column__add-btn');
    if (!$btn) return;
    this.handleAddTask($btn.dataset.status);
  }

  handleAddTask(status) {
    this.modal.onConfirm = async (data) => {
      const card = this.cardActions.createCard(data);
      await this.boardDOM.mountCard(card);
      this.tagFilter.update();
    };
    const allTags = this.cardActions.collectAllTags();
    this.modal.open(status, null, allTags);
  }

  handleCardHover(card) {
    if (this.isUsingKeyboard) return;
    card.$element.focus();
  }

  handleBoardKeydown(e) {
    this.isUsingKeyboard = true;
    if (e.key === 'Enter' && e.target === document.body) this.handleAddTask('todo');
  }

  handleBoardMouseMove() {
    this.isUsingKeyboard = false;
  }

  async handleRemoteTaskUpdate(tasks) {
    const columnsToReorder = new Set();
    for (const task of tasks) {
      if (task.deleted_at) {
        this.handleRemoteDelete(task);
      } else {
        const status = await this.handleRemoteUpsert(task);
        if (status) columnsToReorder.add(status);
      }
    }
    this.reorderColumns(columnsToReorder);
    this.tagFilter.update();
  }

  handleRemoteDelete(task) {
    const existing = this.cardActions.findCard(task.id);
    if (!existing) return;
    this.boardDOM.unmountCard(existing);
    this.cardActions.cards = this.cardActions.cards.filter((c) => c.id !== task.id);
  }

  async handleRemoteUpsert(task) {
    const existing = this.cardActions.findCard(task.id);
    if (!existing) {
      const card = this.cardActions.createCardFromRemote(task);
      await this.boardDOM.mountCard(card);
      return card.status;
    }
    existing.due_date = task.due_date ?? existing.due_date;
    existing.tags = task.tags ?? existing.tags;
    existing.position = task.position ?? existing.position;
    if (existing.status !== task.status) {
      this.boardDOM.unmountCard(existing);
      existing.status = task.status;
      await this.boardDOM.mountCard(existing);
    } else {
      existing.updateContent(task.title, task.description, task.due_date, task.tags);
    }
    return existing.status;
  }

  reorderColumns(statuses) {
    for (const status of statuses) {
      const $column = this.boardDOM.getColumnEl(status);
      const $addBtn = $column.querySelector('.column__add-btn');
      const cards = this.cardActions.cards
        .filter((c) => c.status === status && c.$element)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      for (const card of cards) {
        $column.insertBefore(card.$element, $addBtn);
      }
    }
    const storage = this.cardActions.storage;
    storage.save(this.cardActions.getAllCards());
  }
}
