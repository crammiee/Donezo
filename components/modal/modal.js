export class Modal {
  constructor() {
    this.$overlay = document.getElementById('TASK_MODAL');
    this.$titleHeading = document.getElementById('MODAL_TITLE');
    this.$titleInput = document.getElementById('MODAL_TITLE_INPUT');
    this.$descInput = document.getElementById('MODAL_DESC_INPUT');
    this.$statusSelect = document.getElementById('MODAL_STATUS_SELECT');
    this.onConfirm = null;
  }

  init() {
    document.getElementById('MODAL_CANCEL').addEventListener('click', () => this.close());
    document.getElementById('MODAL_CONFIRM').addEventListener('click', () => this.handleConfirm());
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

    this.trapFocus(e);
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
    this.$overlay.setAttribute('tabindex', '-1');
    this.$overlay.focus();
    this.$titleInput.focus();
  }

  close() {
    this.$overlay.classList.add('modal-overlay--hidden');
  }

  getFocusableElements() {
    return this.$overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = this.getFocusableElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}