import { loadTemplate, trapFocus } from '../../utils/dom-utils.js';

const TEMPLATE_PATH = '/components/modal/modal.html';

export class Modal {
  constructor() {
    this.$overlay = null;
    this.$titleHeading = null;
    this.$titleInput = null;
    this.$descInput = null;
    this.$statusSelect = null;
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
  }

  attachEventListeners() {
    this.$overlay.querySelector('#MODAL_CANCEL').addEventListener('click', () => this.close());
    this.$overlay.querySelector('#MODAL_CONFIRM').addEventListener('click', () => this.handleConfirm());
    this.$overlay.addEventListener('click', (e) => this.handleOverlayClick(e));
    this.$overlay.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleOverlayClick(e) {
    if (e.target === this.$overlay) this.close();
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }

    if (e.key === 'Enter' && e.target !== this.$descInput) {
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
    });

    this.close();
  }

  open(defaultStatus = 'todo', existingData = null) {
    const isEditing = existingData !== null;
    this.$titleHeading.textContent = isEditing ? 'Edit Task' : 'New Task';
    this.$titleInput.value = isEditing ? existingData.title : '';
    this.$descInput.value = isEditing ? existingData.description : '';
    this.$statusSelect.value = isEditing ? existingData.status : defaultStatus;
    this.$overlay.classList.remove('modal-overlay--hidden');
    this.$titleInput.focus();
  }

  close() {
    this.$overlay.classList.add('modal-overlay--hidden');
  }
}