import { loadTemplate } from '../../utils/dom-utils.js';
import { getTagColor } from '../../utils/tag-colors.js';

const TEMPLATE_PATH = '/components/card/card.html';

export class Card {
  constructor({ id, title, description, status, position, due_date, tags }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.position = position ?? 0;
    this.due_date = due_date || null;
    this.tags = tags || [];
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
    this.$element.setAttribute('tabindex', '0');
    this.$element.setAttribute('draggable', 'true');
    this.$element.setAttribute('aria-label', `Task: ${this.title}`);
    this.$element.querySelector('.card__title').textContent = this.title;
    this.$element.querySelector('.card__description').textContent = this.description;
    this.renderTags();
    this.renderDueDate();
  }

  renderTags() {
    const $tags = this.$element.querySelector('.card__tags');
    $tags.innerHTML = '';
    if (!this.tags.length) return;
    for (const tag of this.tags) {
      const color = getTagColor(tag);
      const $pill = document.createElement('span');
      $pill.className = 'card__tag';
      $pill.textContent = tag;
      $pill.style.backgroundColor = color.bg;
      $pill.style.color = color.text;
      $tags.appendChild($pill);
    }
  }

  renderDueDate() {
    const $due = this.$element.querySelector('.card__due-date');
    if (!this.due_date) {
      $due.style.display = 'none';
      return;
    }
    const date = new Date(this.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    $due.style.display = '';
    $due.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    $due.classList.toggle('card__due-date--overdue', date < today);
  }

  attachEventListeners() {
    this.$element.querySelector('.card__btn--edit').addEventListener('click', () => this.onEdit(this));
    this.$element.querySelector('.card__btn--delete').addEventListener('click', () => this.onDelete(this));
    this.$element.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.$element.addEventListener('mouseenter', () => this.handleMouseEnter());
    this.$element.addEventListener('dragstart', (e) => this.handleDragStart(e));
    this.$element.addEventListener('dragend', () => this.handleDragEnd());
  }

  handleMouseEnter() {
    if (this.onHover) this.onHover(this);
  }

  handleDragStart(e) {
    e.dataTransfer.setData('text/plain', this.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => this.$element.classList.add('card--dragging'), 0);
    if (this.onDragStart) this.onDragStart(this);
  }

  handleDragEnd() {
    this.$element.classList.remove('card--dragging');
    if (this.onDragEnd) this.onDragEnd();
  }

  focusSibling(direction) {
    const $col = this.$element.closest('.column');
    const cards = Array.from($col.querySelectorAll('.card'));
    const nextIndex = cards.indexOf(this.$element) + direction;
    if (nextIndex < 0 || nextIndex >= cards.length) return;
    cards[nextIndex].focus();
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'Delete':     this.onDelete(this); break;
      case 'Enter':      this.onEdit(this); break;
      case 'ArrowLeft':  this.onMove(this, -1); break;
      case 'ArrowRight': this.onMove(this, 1); break;
      case 'ArrowUp':    this.focusSiblingUp(e); break;
      case 'ArrowDown':  this.focusSiblingDown(e); break;
    }
  }

  focusSiblingUp(e) {
    e.preventDefault();
    this.focusSibling(-1);
  }

  focusSiblingDown(e) {
    e.preventDefault();
    this.focusSibling(1);
  }

  updateContent(title, description, due_date, tags) {
    this.title = title;
    this.description = description;
    this.due_date = due_date ?? this.due_date;
    this.tags = tags ?? this.tags;
    this.$element.querySelector('.card__title').textContent = title;
    this.$element.querySelector('.card__description').textContent = description;
    this.$element.setAttribute('aria-label', `Task: ${title}`);
    this.renderTags();
    this.renderDueDate();
  }

  updateId(newId) {
    this.id = newId;
    if (this.$element) this.$element.dataset.id = newId;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
  }

  remove() {
    this.$element.remove();
  }

  toData() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      position: this.position,
      due_date: this.due_date,
      tags: this.tags,
    };
  }
}