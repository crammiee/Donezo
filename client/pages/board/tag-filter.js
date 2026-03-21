import { getTagColor } from '../../utils/tag-colors.js';

export class TagFilter {
  constructor(cardActions) {
    this.cardActions = cardActions;
    this.activeTag = null;
    this.$container = null;
  }

  init() {
    this.$container = document.getElementById('TAG_FILTERS');
  }

  render() {
    if (!this.$container) return;
    this.$container.innerHTML = '';
    const allTags = this.cardActions.collectAllTags();
    for (const tag of allTags) {
      this.$container.appendChild(this.createFilterButton(tag));
    }
  }

  createFilterButton(tag) {
    const color = getTagColor(tag);
    const $btn = document.createElement('button');
    $btn.className = 'filter-tag';
    if (this.activeTag === tag) $btn.classList.add('filter-tag--active');
    $btn.textContent = tag;
    $btn.style.backgroundColor = color.bg;
    $btn.style.color = color.text;
    $btn.addEventListener('click', () => this.toggle(tag));
    return $btn;
  }

  toggle(tag) {
    this.activeTag = this.activeTag === tag ? null : tag;
    this.apply();
    this.render();
  }

  apply() {
    for (const card of this.cardActions.cards) {
      if (!card.$element) continue;
      if (!this.activeTag) {
        card.$element.style.display = '';
      } else {
        const hasTag = (card.tags || []).includes(this.activeTag);
        card.$element.style.display = hasTag ? '' : 'none';
      }
    }
  }

  update() {
    this.render();
    this.apply();
  }
}
