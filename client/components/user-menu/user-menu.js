import { loadTemplate } from '../../utils/dom-utils.js';
import { logout, getUserEmail } from '../../services/auth-service.js';
import { socketService } from '../../services/socket-service.js';

const TEMPLATE_PATH = '/components/user-menu/user-menu.html';

export class UserMenu {
  async init() {
    this.$menu = await loadTemplate(TEMPLATE_PATH);
    this.populateUserInfo();
    this.attachListeners();
    document.querySelector('.board__header').appendChild(this.$menu);
  }

  populateUserInfo() {
    const email = getUserEmail() || 'user';
    const initial = email.charAt(0).toUpperCase();
    this.$menu.querySelector('.user-menu__avatar').textContent = initial;
    this.$menu.querySelector('.user-menu__email').textContent = email;
    this.$menu.querySelectorAll('.user-menu__avatar')[1].textContent = initial;
    this.$menu.querySelector('.user-menu__email-full').textContent = email;
  }

  attachListeners() {
    const $dropdown = this.$menu.querySelector('.user-menu__dropdown');
    this.$menu.querySelector('.user-menu__trigger').addEventListener('click', () => {
      $dropdown.classList.toggle('user-menu__dropdown--hidden');
    });
    document.addEventListener('click', (e) => {
      if (!this.$menu.contains(e.target)) $dropdown.classList.add('user-menu__dropdown--hidden');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') $dropdown.classList.add('user-menu__dropdown--hidden');
    });
    this.$menu.querySelector('.user-menu__logout').addEventListener('click', () => {
      socketService.disconnect();
      logout();
    });
  }
}