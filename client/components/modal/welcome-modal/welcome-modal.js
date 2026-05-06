import { loadTemplate } from '../../../utils/dom-utils.js';

const TEMPLATE_PATH = '/components/modal/welcome-modal/welcome-modal.html';

export class WelcomeModal {
  constructor() {
    this.onDismiss = null;
  }

  async open() {
    const $overlay = await loadTemplate(TEMPLATE_PATH);
    this.attachEventListeners($overlay);
    document.body.appendChild($overlay);
    $overlay.classList.remove('modal-overlay--hidden');
    $overlay.querySelector('#WELCOME_START').focus();
  }

  attachEventListeners($overlay) {
    const dismiss = () => {
      $overlay.remove();
      if (this.onDismiss) this.onDismiss();
    };
    $overlay.querySelector('#WELCOME_START').addEventListener('click', dismiss);
    $overlay.addEventListener('click', (e) => { if (e.target === $overlay) dismiss(); });
    $overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismiss(); });
  }
}
