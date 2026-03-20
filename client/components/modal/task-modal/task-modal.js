import { loadTemplate, trapFocus } from '../../../utils/dom-utils.js';
import { getTagColor } from '../../../utils/tag-colors.js';

const TEMPLATE_PATH = '/components/modal/task-modal/task-modal.html';

export class TaskModal {
  constructor() {
    this.$overlay = null;
    this.$titleHeading = null;
    this.$titleInput = null;
    this.$descInput = null;
    this.$statusSelect = null;
    this.$dueDateInput = null;
    this.$tagsInput = null;
    this.$tagsSelected = null;
    this.$tagsDropdown = null;
    this.$tagsAddBtn = null;
    this.$tagsInputWrap = null;
    this.selectedTags = [];
    this.allTags = [];
    this.onConfirm = null;
  }

  async init() {
    this.$overlay = await loadTemplate(TEMPLATE_PATH);
    document.body.appendChild(this.$overlay);
    this.cacheElements();
    this.attachEventListeners();
  }

  cacheElements() {
    this.$titleHeading = this.$overlay.querySelector('#MODAL_TITLE');
    this.$titleInput = this.$overlay.querySelector('#MODAL_TITLE_INPUT');
    this.$descInput = this.$overlay.querySelector('#MODAL_DESC_INPUT');
    this.$statusSelect = this.$overlay.querySelector('#MODAL_STATUS_SELECT');
    this.$dueDateInput = this.$overlay.querySelector('#MODAL_DUE_DATE');
    this.$tagsInput = this.$overlay.querySelector('#MODAL_TAGS');
    this.$tagsSelected = this.$overlay.querySelector('#MODAL_TAGS_SELECTED');
    this.$tagsDropdown = this.$overlay.querySelector('#MODAL_TAGS_DROPDOWN');
    this.$tagsAddBtn = this.$overlay.querySelector('#MODAL_TAGS_ADD');
    this.$tagsInputWrap = this.$overlay.querySelector('#MODAL_TAGS_WRAP');
  }

  attachEventListeners() {
    this.$overlay.querySelector('#MODAL_CANCEL').addEventListener('click', () => this.close());
    this.$overlay.querySelector('#MODAL_CONFIRM').addEventListener('click', () => this.handleConfirm());
    this.$overlay.addEventListener('click', (e) => this.handleOverlayClick(e));
    this.$overlay.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.$tagsAddBtn.addEventListener('click', () => this.showTagInput());
    this.$tagsInput.addEventListener('input', () => this.handleTagInput());
    this.$tagsInput.addEventListener('keydown', (e) => this.handleTagKeydown(e));
    this.$tagsInput.addEventListener('blur', () => this.handleTagBlur());
    this.$tagsDropdown.addEventListener('mousedown', (e) => e.preventDefault());
    this.$tagsDropdown.addEventListener('click', (e) => this.handleDropdownClick(e));
    this.$tagsSelected.addEventListener('click', (e) => this.handlePillClick(e));
  }

  handleOverlayClick(e) {
    if (e.target === this.$overlay) this.close();
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      if (!this.$tagsInputWrap.classList.contains('tag-picker__input-wrap--hidden')) {
        this.hideTagInput();
        return;
      }
      this.close();
      return;
    }

    if (e.key === 'Enter' && e.target !== this.$descInput && e.target !== this.$tagsInput) {
      e.preventDefault();
      this.handleConfirm();
      return;
    }

    trapFocus(e, this.$overlay);
  }

  handleConfirm() {
    const title = this.$titleInput.value.trim();
    if (!title) return this.$titleInput.focus();

    this.onConfirm({
      title,
      description: this.$descInput.value.trim(),
      status: this.$statusSelect.value,
      due_date: this.$dueDateInput.value || null,
      tags: [...this.selectedTags],
    });

    this.close();
  }

  open(defaultStatus = 'todo', existingData = null, allTags = []) {
    const isEditing = existingData !== null;
    this.allTags = allTags;
    this.selectedTags = isEditing && existingData.tags ? [...existingData.tags] : [];

    this.$titleHeading.textContent = isEditing ? 'Edit Task' : 'New Task';
    this.$titleInput.value = isEditing ? existingData.title : '';
    this.$descInput.value = isEditing ? existingData.description : '';
    this.$statusSelect.value = isEditing ? existingData.status : defaultStatus;
    this.$dueDateInput.value = isEditing && existingData.due_date
      ? existingData.due_date.slice(0, 10) : '';
    this.$tagsInput.value = '';
    this.renderSelectedTags();
    this.hideDropdown();
    this.$overlay.classList.remove('modal-overlay--hidden');
    this.$titleInput.focus();
  }

  close() {
    this.$overlay.classList.add('modal-overlay--hidden');
    this.hideDropdown();
  }

  // --- Tag Picker ---

  showTagInput() {
    this.$tagsInputWrap.classList.remove('tag-picker__input-wrap--hidden');
    this.$tagsInput.value = '';
    this.$tagsInput.focus();
    this.showAllAvailableTags();
  }

  hideTagInput() {
    this.$tagsInputWrap.classList.add('tag-picker__input-wrap--hidden');
    this.hideDropdown();
  }

  handleTagBlur() {
    this.hideTagInput();
  }

  showAllAvailableTags() {
    const available = this.allTags
      .filter(t => !this.selectedTags.includes(t.toLowerCase()));
    if (available.length === 0) {
      this.hideDropdown();
      return;
    }
    this.$tagsDropdown.innerHTML = '';
    for (const tag of available) {
      const color = getTagColor(tag);
      const $opt = document.createElement('div');
      $opt.className = 'tag-picker__option';
      $opt.dataset.tag = tag;
      $opt.innerHTML = `<span class="tag-picker__option-dot" style="background:${color.text}"></span> ${tag}`;
      this.$tagsDropdown.appendChild($opt);
    }
    this.$tagsDropdown.classList.remove('tag-picker__dropdown--hidden');
  }

  addTag(tag) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || this.selectedTags.includes(normalized)) return;
    this.selectedTags.push(normalized);
    this.renderSelectedTags();
    this.$tagsInput.value = '';
    this.showAllAvailableTags();
    this.$tagsInput.focus();
  }

  removeTag(tag) {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
    this.renderSelectedTags();
  }

  renderSelectedTags() {
    this.$tagsSelected.innerHTML = '';
    for (const tag of this.selectedTags) {
      const color = getTagColor(tag);
      const $pill = document.createElement('span');
      $pill.className = 'tag-picker__pill';
      $pill.dataset.tag = tag;
      $pill.style.backgroundColor = color.bg;
      $pill.style.color = color.text;
      $pill.innerHTML = `${tag} <span class="tag-picker__pill-remove">&times;</span>`;
      this.$tagsSelected.appendChild($pill);
    }
  }

  handleTagInput() {
    const query = this.$tagsInput.value.trim().toLowerCase();
    if (!query) {
      this.hideDropdown();
      return;
    }

    const suggestions = this.allTags
      .filter(t => t.toLowerCase().includes(query) && !this.selectedTags.includes(t.toLowerCase()));

    if (suggestions.length === 0) {
      this.hideDropdown();
      return;
    }

    this.$tagsDropdown.innerHTML = '';
    for (const tag of suggestions) {
      const color = getTagColor(tag);
      const $opt = document.createElement('div');
      $opt.className = 'tag-picker__option';
      $opt.dataset.tag = tag;
      $opt.innerHTML = `<span class="tag-picker__option-dot" style="background:${color.text}"></span> ${tag}`;
      this.$tagsDropdown.appendChild($opt);
    }
    this.$tagsDropdown.classList.remove('tag-picker__dropdown--hidden');
  }

  handleTagKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const value = this.$tagsInput.value.trim();
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

  hideDropdown() {
    this.$tagsDropdown.classList.add('tag-picker__dropdown--hidden');
  }
}
