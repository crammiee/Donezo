import { createElement } from '../../utils/dom-utils.js';

export class Card {
  constructor({ id, title, description, status }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.$element = null;
  }

  render($container) {
    this.$element = this.createElement();
    $container.insertBefore(this.$element, $container.querySelector('.column__add-btn'));
    this.attachEventListeners();
  }

  createElement() {
    const $card = createElement('div', 'card');
    $card.dataset.id = this.id;
    $card.setAttribute('tabindex', '0');
    $card.setAttribute('aria-label', `Task: ${this.title}`);

    $card.appendChild(this.createTitle());
    $card.appendChild(this.createDescription());
    $card.appendChild(this.createActions());

    return $card;
  }

  createTitle() {
    return createElement('p', 'card__title', this.title);
  }

  createDescription() {
    return createElement('p', 'card__description', this.description);
  }

  createActions() {
    const $div = createElement('div', 'card__actions');
    $div.appendChild(this.createButton('edit', 'card__btn card__btn--edit'));
    $div.appendChild(this.createButton('delete', 'card__btn card__btn--delete'));
    return $div;
  }

  createButton(label, className) {
    const $btn = createElement('button', className, label);
    $btn.setAttribute('tabindex', '-1');
    return $btn;
  }

  focusSibling(direction) {
    const column = this.$element.closest('.column');
    const cards = Array.from(column.querySelectorAll('.card'));

    const currentIndex = cards.indexOf(this.$element);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= cards.length) return;

    cards[nextIndex].focus();
  }

  attachEventListeners() {
    this.$element.querySelector('.card__btn--edit').addEventListener('click', () => this.onEdit(this));
    this.$element.querySelector('.card__btn--delete').addEventListener('click', () => this.onDelete(this));
    this.$element.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    if (e.key === 'Delete') this.onDelete(this);
    if (e.key === 'Enter') this.onEdit(this);
    if (e.key === 'ArrowLeft') this.onMove(this, -1);
    if (e.key === 'ArrowRight') this.onMove(this, 1);

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.focusSibling(-1);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.focusSibling(1);
    }
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