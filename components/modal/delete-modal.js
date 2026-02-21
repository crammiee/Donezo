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

    this.$overlay.addEventListener('click', (e) => {
      if (e.target === this.$overlay) this.close();
    });

    this.$overlay.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				this.close();
				return;
			}

			if (e.key === 'Enter') {
				this.handleConfirm();
				return;
			}

			this.trapFocus(e);
		});
  }

  handleConfirm() {
    if (this.onConfirm) this.onConfirm();
    this.close();
  }

	open(cardTitle) {
		if (this.$message) {
			this.$message.textContent = `Are you sure you want to delete "${cardTitle}"?`;
		}

		this.$overlay.classList.remove('modal-overlay--hidden');
		this.$overlay.setAttribute('tabindex', '-1');
		this.$overlay.focus();
		this.$confirmBtn.focus();
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