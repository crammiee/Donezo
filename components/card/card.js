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
    const $card = document.createElement('div');
    $card.className = 'card';
    $card.dataset.id = this.id;
    $card.setAttribute('tabindex', '0');
    $card.setAttribute('aria-label', `Task: ${this.title}`);

    $card.appendChild(this.createTitle());
    $card.appendChild(this.createDescription());
    $card.appendChild(this.createActions());

    return $card;
  }

  createTitle() {
    const $title = document.createElement('p');
    $title.className = 'card__title';
    $title.textContent = this.title;
    return $title;
  }

  createDescription() {
    const $desc = document.createElement('p');
    $desc.className = 'card__description';
    $desc.textContent = this.description;
    return $desc;
  }

  createActions() {
    const $actions = document.createElement('div');
    $actions.className = 'card__actions';
    $actions.appendChild(this.createEditButton());
    $actions.appendChild(this.createDeleteButton());
    return $actions;
  }

  createEditButton() {
    const $btn = document.createElement('button');
    $btn.className = 'card__btn card__btn--edit';
    $btn.textContent = 'edit';
    $btn.setAttribute('tabindex', '-1');
    return $btn;
  }

  createDeleteButton() {
    const $btn = document.createElement('button');
    $btn.className = 'card__btn card__btn--delete';
    $btn.textContent = 'delete';
    $btn.setAttribute('tabindex', '-1');
    return $btn;
  }

  attachEventListeners() {
    const $editBtn = this.$element.querySelector('.card__btn--edit');
    const $deleteBtn = this.$element.querySelector('.card__btn--delete');

    $editBtn.addEventListener('click', () => this.onEdit(this));
    $deleteBtn.addEventListener('click', () => this.onDelete(this));
    this.$element.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    if (e.key === 'Delete') this.onDelete(this);
    if (e.key === 'Enter') this.onEdit(this);
    if (e.key === 'ArrowLeft') this.onMove(this, -1);
    if (e.key === 'ArrowRight') this.onMove(this, 1);
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