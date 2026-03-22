import { Card } from './card.js';

const COLUMN_ORDER = ['todo', 'doing', 'done'];

export class CardActions {
  constructor(boardDOM, storage, modal, deleteModal, syncQueue) {
    this.boardDOM = boardDOM;
    this.storage = storage;
    this.modal = modal;
    this.deleteModal = deleteModal;
    this.syncQueue = syncQueue;
    this.cards = [];
    this.onDragStart = null;
    this.onDragEnd = null;
    this.onHover = null;
    this.onChange = null;
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
    this.modal.onConfirm = async (data) => this.confirmEdit(card, data);
    const allTags = this.collectAllTags();
    this.modal.open(card.status, card.toData(), allTags);
  }

  collectAllTags() {
    return [...new Set(this.cards.flatMap(c => c.tags || []))];
  }

  async confirmEdit(card, data) {
    const oldStatus = card.status;
    card.updateContent(data.title, data.description, data.due_date, data.tags);
    card.updateStatus(data.status);
    this.storage.update({ ...card.toData(), synced: false });
    this.syncQueue.enqueue([card.toData()]);
    if (data.status !== oldStatus) await this.moveCardToColumn(card, oldStatus);
    this.onChange?.();
  }

  handleDelete(card) {
    this.deleteModal.onConfirm = () => this.confirmDelete(card);
    this.deleteModal.open(card.title);
  }

  confirmDelete(card) {
    const oldStatus = card.status;
    this.storage.softDelete(card.id);
    this.syncQueue.enqueue([{ id: card.id, is_deleted: true }]);
    card.remove();
    this.cards = this.cards.filter((c) => c.id !== card.id);
    this.boardDOM.updateColumnCount(oldStatus);
    this.onChange?.();
  }

  async handleMove(card, direction) {
    const newStatus = this.getNextStatus(card.status, direction);
    if (!newStatus) return;

    const oldStatus = card.status;
    card.updateStatus(newStatus);
    this.storage.update({ ...card.toData(), synced: false });
    this.syncQueue.enqueue([card.toData()]);
    await this.moveCardToColumn(card, oldStatus);
    card.$element.focus();
  }

  async handleDrop(card, newStatus, referenceCard) {
    if (!newStatus || newStatus === card.status) return;

    const oldStatus = card.status;
    card.updateStatus(newStatus);
    this.storage.update({ ...card.toData(), synced: false });
    this.syncQueue.enqueue([card.toData()]);
    await this.moveCardToColumn(card, oldStatus, referenceCard);
  }

  async moveCardToColumn(card, oldStatus, referenceCard) {
    card.$element.remove();
    this.boardDOM.updateColumnCount(oldStatus);
    await this.boardDOM.mountCard(card, referenceCard);
  }

  createCard(data) {
    const task = { id: this.generateId(), ...data, synced: false };
    this.storage.add(task);
    this.syncQueue.enqueue([task]);
    const card = new Card(task);
    this.assign(card);
    this.cards.push(card);
    return card;
  }

  createCardFromRemote(task) {
    const card = new Card(task);
    this.assign(card);
    this.cards.push(card);
    return card;
  }

  findCard(id) {
    return this.cards.find((c) => c.id === id) || null;
  }

  findCardByElement($element) {
    return this.cards.find((c) => c.$element === $element) || null;
  }

  getAllCards() {
    return this.cards.map((c) => c.toData());
  }

  fromStorage() {
    return this.storage.load().map((taskData) => {
      const card = new Card(taskData);
      this.assign(card);
      this.cards.push(card);
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
    return crypto.randomUUID();
  }
}
