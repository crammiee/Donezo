import { loadTemplate } from '../../utils/dom-utils.js';
import { logout, getUserEmail } from '../../services/auth-service.js';
import { disconnectSocket } from '../../services/socket-service.js';

const TEMPLATE_PATH = '/components/user-menu/user-menu.html';

export class UserMenu {
  async init() {
    const $menu = await loadTemplate(TEMPLATE_PATH);
    const email = getUserEmail() || 'user';
    const initial = email.charAt(0).toUpperCase();

    $menu.querySelector('.user-menu__avatar').textContent = initial;
    $menu.querySelector('.user-menu__email').textContent = email;

    const $avatarLg = $menu.querySelectorAll('.user-menu__avatar')[1];
    $avatarLg.textContent = initial;
    $menu.querySelector('.user-menu__email-full').textContent = email;

    const $trigger = $menu.querySelector('.user-menu__trigger');
    const $dropdown = $menu.querySelector('.user-menu__dropdown');

    $trigger.addEventListener('click', () => {
      $dropdown.classList.toggle('user-menu__dropdown--hidden');
    });

    document.addEventListener('click', (e) => {
      if (!$menu.contains(e.target)) {
        $dropdown.classList.add('user-menu__dropdown--hidden');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $dropdown.classList.add('user-menu__dropdown--hidden');
      }
    });

    $menu.querySelector('.user-menu__logout').addEventListener('click', () => {
      disconnectSocket();
      logout();
    });

    document.querySelector('.board__header').appendChild($menu);
  }
}