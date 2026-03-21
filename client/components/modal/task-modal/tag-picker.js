import { getTagColor } from '../../../utils/tag-colors.js';

export class TagPicker {
  constructor($selected, $input, $dropdown, $addBtn, $inputWrap) {
    this.$selected = $selected;
    this.$input = $input;
    this.$dropdown = $dropdown;
    this.$addBtn = $addBtn;
    this.$inputWrap = $inputWrap;
    this.selectedTags = [];
    this.allTags = [];
  }

  attachListeners() {
    this.$addBtn.addEventListener('click', () => this.showInput());
    this.$input.addEventListener('input', () => this.handleInput());
    this.$input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.$input.addEventListener('blur', () => this.hideInput());
    this.$dropdown.addEventListener('mousedown', (e) => e.preventDefault());
    this.$dropdown.addEventListener('click', (e) => this.handleDropdownClick(e));
    this.$selected.addEventListener('click', (e) => this.handlePillClick(e));
  }

  open(selectedTags, allTags) {
    this.selectedTags = [...selectedTags];
    this.allTags = allTags;
    this.$input.value = '';
    this.renderPills();
    this.hideDropdown();
  }

  getSelectedTags() {
    return [...this.selectedTags];
  }

  isInputVisible() {
    return !this.$inputWrap.classList.contains('tag-picker__input-wrap--hidden');
  }

  showInput() {
    this.$inputWrap.classList.remove('tag-picker__input-wrap--hidden');
    this.$input.value = '';
    this.$input.focus();
    this.renderDropdown(this.getAvailableTags());
  }

  hideInput() {
    this.$inputWrap.classList.add('tag-picker__input-wrap--hidden');
    this.hideDropdown();
  }

  addTag(tag) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || this.selectedTags.includes(normalized)) return;
    this.selectedTags.push(normalized);
    this.renderPills();
    this.$input.value = '';
    this.renderDropdown(this.getAvailableTags());
    this.$input.focus();
  }

  removeTag(tag) {
    this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    this.renderPills();
  }

  getAvailableTags(query = '') {
    return this.allTags.filter((t) => {
      const lower = t.toLowerCase();
      const isSelected = this.selectedTags.includes(lower);
      const isMatch = !query || lower.includes(query);
      return !isSelected && isMatch;
    });
  }

  renderPills() {
    this.$selected.innerHTML = '';
    for (const tag of this.selectedTags) {
      const color = getTagColor(tag);
      const $pill = document.createElement('span');
      $pill.className = 'tag-picker__pill';
      $pill.dataset.tag = tag;
      $pill.style.backgroundColor = color.bg;
      $pill.style.color = color.text;
      $pill.innerHTML = `${tag} <span class="tag-picker__pill-remove">&times;</span>`;
      this.$selected.appendChild($pill);
    }
  }

  renderDropdown(tags) {
    if (tags.length === 0) { this.hideDropdown(); return; }
    this.$dropdown.innerHTML = '';
    for (const tag of tags) {
      const color = getTagColor(tag);
      const $opt = document.createElement('div');
      $opt.className = 'tag-picker__option';
      $opt.dataset.tag = tag;
      $opt.innerHTML = `<span class="tag-picker__option-dot" style="background:${color.text}"></span> ${tag}`;
      this.$dropdown.appendChild($opt);
    }
    this.$dropdown.classList.remove('tag-picker__dropdown--hidden');
  }

  hideDropdown() {
    this.$dropdown.classList.add('tag-picker__dropdown--hidden');
  }

  handleInput() {
    const query = this.$input.value.trim().toLowerCase();
    if (!query) { this.hideDropdown(); return; }
    this.renderDropdown(this.getAvailableTags(query));
  }

  handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const value = this.$input.value.trim();
      if (value) this.addTag(value);
    }
  }

  handleDropdownClick(e) {
    const $opt = e.target.closest('.tag-picker__option');
    if ($opt) this.addTag($opt.dataset.tag);
  }

  handlePillClick(e) {
    const $remove = e.target.closest('.tag-picker__pill-remove');
    if (!$remove) return;
    const $pill = $remove.closest('.tag-picker__pill');
    if ($pill) this.removeTag($pill.dataset.tag);
  }
}
