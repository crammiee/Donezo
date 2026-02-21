import { trapFocus } from '../../utils/dom-utils.js';

export class DeleteModal {
  constructor() {
    this.$overlay = document.getElementById('DELETE_MODAL');
    this.$confirmBtn = document.getElementById('DELETE_CONFIRM');
    this.$cancelBtn = document.getElementById('DELETE_CANCEL');
    this.$message = document.getElementById('DELETE_MESSAGE');
    this.onConfirm = null;
  }

  init() {
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