import { loadTemplate, createElement } from '../../utils/dom-utils.js';

const TEMPLATE_PATH = '/components/card/card.html';

export class Card {
  constructor({ id, title, description, status }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.$element = null;
  }

  async render($container) {
    this.$element = await loadTemplate(TEMPLATE_PATH);
    this.populate();
    $container.insertBefore(this.$element, $container.querySelector('.column__add-btn'));
    this.attachEventListeners();
  }

  populate() {
    this.$element.dataset.id = this.id;
    this.$element.setAttribute('aria-label', `Task: ${this.title}`);
    this.$element.querySelector('.card__title').textContent = this.title;
    this.$element.querySelector('.card__description').textContent = this.description;
  }

  attachEventListeners() {
    this.$element.querySelector('.card__btn--edit').addEventListener('click', () => this.onEdit(this));
    this.$element.querySelector('.card__btn--delete').addEventListener('click', () => this.onDelete(this));
    this.$element.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  focusSibling(direction) {
    const $col = this.$element.closest('.column');
    const cards = Array.from($col.querySelectorAll('.card'));
    const nextIndex = cards.indexOf(this.$element) + direction;
    if (nextIndex < 0 || nextIndex >= cards.length) return;
    cards[nextIndex].focus();
  }

  handleKeydown(e) {
    if (e.key === 'Delete') this.onDelete(this);
    if (e.key === 'Enter') this.onEdit(this);
    if (e.key === 'ArrowLeft') this.onMove(this, -1);
    if (e.key === 'ArrowRight') this.onMove(this, 1);
    if (e.key === 'ArrowUp') { e.preventDefault(); this.focusSibling(-1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.focusSibling(1); }
  }

  updateContent(title, description) {
    this.title = title;
    this.description = description;
    this.$element.querySelector('.card__title').textContent = title;
    this.$element.querySelector('.card__description').textContent = description;
    this.$element.setAttribute('aria-label', `Task: ${title}`);
  }

  updateStatus(newStatus) {
    this.status = newStatus;
  }

  remove() {
    this.$element.remove();
  }

  onEdit(card) {}
  onDelete(card) {}
  onMove(card, direction) {}

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
    };
  }

  static fromJSON(data) {
    return new Card(data);
  }
}