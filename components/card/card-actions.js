import { Card } from './card.js';

const COLUMN_ORDER = ['todo', 'doing', 'done'];

export class CardActions {
  constructor(boardDOM, storage, modal, deleteModal) {
    this.boardDOM = boardDOM;
    this.storage = storage;
    this.modal = modal;
    this.deleteModal = deleteModal;
    this.onDragStart = null;
    this.onDragEnd = null;
    this.onHover = null;
  }

  assign(card) {
    card.onEdit = (c) => this.handleEdit(c);
    card.onDelete = (c) => this.handleDelete(c);
    card.onMove = (c, dir) => this.handleMove(c, dir);
    card.onDrop = (c, status) => this.handleDrop(c, status);
    card.onDragStart = (c) => { if (this.onDragStart) this.onDragStart(c); };
    card.onDragEnd = () => { if (this.onDragEnd) this.onDragEnd(); };
    card.onHover = (c) => { if (this.onHover) this.onHover(c); };
  }

  handleEdit(card) {
    this.modal.onConfirm = async (data) => {
      const oldStatus = card.status;
      card.updateContent(data.title, data.description);
      card.updateStatus(data.status);
      this.storage.update(card.toJSON());

      if (data.status !== oldStatus) {
        card.$element.remove();
        this.boardDOM.updateColumnCount(oldStatus);
        await this.boardDOM.mountCard(card);
      }
    };
    this.modal.open(card.status, card.toJSON());
  }

  handleDelete(card) {
    this.deleteModal.onConfirm = () => {
      const oldStatus = card.status;
      this.storage.delete(card.id);
      card.remove();
      this.boardDOM.updateColumnCount(oldStatus);
    };
    this.deleteModal.open(card.title);
  }

  async handleMove(card, direction) {
    const newStatus = this.getNextStatus(card.status, direction);
    if (!newStatus) return;

    const oldStatus = card.status;
    card.updateStatus(newStatus);
    this.storage.update(card.toJSON());

    card.$element.remove();
    this.boardDOM.updateColumnCount(oldStatus);
    await this.boardDOM.mountCard(card);
    card.$element.focus();
  }

  async handleDrop(card, newStatus) {
    if (!newStatus || newStatus === card.status) return;

    const oldStatus = card.status;
    card.updateStatus(newStatus);
    this.storage.update(card.toJSON());

    card.$element.remove();
    this.boardDOM.updateColumnCount(oldStatus);
    await this.boardDOM.mountCard(card);
  }

  createCard(data) {
    const task = { id: this.generateId(), ...data };
    this.storage.add(task);
    const card = new Card(task);
    this.assign(card);
    return card;
  }

  fromStorage() {
    return this.storage.load().map((taskData) => {
      const card = Card.fromJSON(taskData);
      this.assign(card);
      return card;
    });
  }

  getNextStatus(currentStatus, direction) {
    const index = COLUMN_ORDER.indexOf(currentStatus);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= COLUMN_ORDER.length) return null;
    return COLUMN_ORDER[nextIndex];
  }

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
}