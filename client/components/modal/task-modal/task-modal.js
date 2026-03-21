import { loadTemplate, trapFocus } from '../../../utils/dom-utils.js';
import { TagPicker } from './tag-picker.js';

const TEMPLATE_PATH = '/components/modal/task-modal/task-modal.html';

export class TaskModal {
  constructor() {
    this.$overlay = null;
    this.$titleHeading = null;
    this.$titleInput = null;
    this.$descInput = null;
    this.$statusSelect = null;
    this.$dueDateInput = null;
    this.tagPicker = null;
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

    this.tagPicker = new TagPicker(
      this.$overlay.querySelector('#MODAL_TAGS_SELECTED'),
      this.$overlay.querySelector('#MODAL_TAGS'),
      this.$overlay.querySelector('#MODAL_TAGS_DROPDOWN'),
      this.$overlay.querySelector('#MODAL_TAGS_ADD'),
      this.$overlay.querySelector('#MODAL_TAGS_WRAP'),
    );
  }

  attachEventListeners() {
    this.$overlay.querySelector('#MODAL_CANCEL').addEventListener('click', () => this.close());
    this.$overlay.querySelector('#MODAL_CONFIRM').addEventListener('click', () => this.handleConfirm());
    this.$overlay.addEventListener('click', (e) => this.handleOverlayClick(e));
    this.$overlay.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.tagPicker.attachListeners();
  }

  handleOverlayClick(e) {
    if (e.target === this.$overlay) this.close();
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      if (this.tagPicker.isInputVisible()) { this.tagPicker.hideInput(); return; }
      this.close();
      return;
    }
    const isTagInput = e.target === this.$overlay.querySelector('#MODAL_TAGS');
    if (e.key === 'Enter' && e.target !== this.$descInput && !isTagInput) {
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
      tags: this.tagPicker.getSelectedTags(),
    });
    this.close();
  }

  open(defaultStatus = 'todo', existingData = null, allTags = []) {
    const isEditing = existingData !== null;
    const tags = isEditing && existingData.tags ? existingData.tags : [];

    this.$titleHeading.textContent = isEditing ? 'Edit Task' : 'New Task';
    this.$titleInput.value = isEditing ? existingData.title : '';
    this.$descInput.value = isEditing ? existingData.description : '';
    this.$statusSelect.value = isEditing ? existingData.status : defaultStatus;
    this.$dueDateInput.value = isEditing && existingData.due_date
      ? existingData.due_date.slice(0, 10) : '';

    this.tagPicker.open(tags, allTags);
    this.$overlay.classList.remove('modal-overlay--hidden');
    this.$titleInput.focus();
  }

  close() {
    this.$overlay.classList.add('modal-overlay--hidden');
    this.tagPicker.hideDropdown();
  }
}
