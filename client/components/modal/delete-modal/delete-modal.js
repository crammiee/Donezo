import { loadTemplate, trapFocus } from '../../../utils/dom-utils.js';

const TEMPLATE_PATH = '/components/modal/delete-modal/delete-modal.html';

export class DeleteModal {
  constructor() {
    this.$overlay = null;
    this.$confirmBtn = null;
    this.$cancelBtn = null;
    this.$message = null;
    this.onConfirm = null;
  }

  async init() {
    this.$overlay = await loadTemplate(TEMPLATE_PATH);
    document.body.appendChild(this.$overlay);
    this.cacheElements();
    this.attachEventListeners();
  }

  cacheElements() {
    this.$confirmBtn = this.$overlay.querySelector('#DELETE_CONFIRM');
    this.$cancelBtn = this.$overlay.querySelector('#DELETE_CANCEL');
    this.$message = this.$overlay.querySelector('#DELETE_MESSAGE');
  }

  attachEventListeners() {
    this.$cancelBtn.addEventListener('click', () => this.close());
    this.$confirmBtn.addEventListener('click', () => this.handleConfirm());
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

    if (e.key === 'Enter') {
      this.handleConfirm();
      return;
    }

    trapFocus(e, this.$overlay);
  }

  handleConfirm() {
    if (this.onConfirm) this.onConfirm();
    this.close();
  }

  open(cardTitle) {
    this.$message.textContent = `Are you sure you want to delete "${cardTitle}"?`;
    this.$overlay.classList.remove('modal-overlay--hidden');
    this.$confirmBtn.focus();
  }

  close() {
    this.$overlay.classList.add('modal-overlay--hidden');
  }
}