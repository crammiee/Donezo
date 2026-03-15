// Form submit → auth-service → store JWT → redirect to /
import { login, register } from '../../services/auth-service.js';

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('LOGIN_EMAIL').value;
  const password = document.getElementById('LOGIN_PASSWORD').value;

  login(email, password)
    .then(() => {
      window.location.href = '/';
    })
    .catch(err => {
      const errorEl = document.getElementById('AUTH_ERROR');
      errorEl.textContent = err.message;
      errorEl.classList.remove('auth__error--hidden');
    });
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('REGISTER_EMAIL').value;
  const password = document.getElementById('REGISTER_PASSWORD').value;

  register(email, password)
    .then(() => login(email, password))
    .then(() => {
      window.location.href = '/';
    })
    .catch(err => {
      const errorEl = document.getElementById('AUTH_ERROR');
      errorEl.textContent = err.message;
      errorEl.classList.remove('auth__error--hidden');
    });
}

function handleTabSwitch(tab) {
  const isLogin = tab === 'login';
  document.getElementById('LOGIN_TAB').classList.toggle('auth__tab--active', isLogin);
  document.getElementById('REGISTER_TAB').classList.toggle('auth__tab--active', !isLogin);
  document.getElementById('LOGIN_FORM').classList.toggle('auth__form--hidden', !isLogin);
  document.getElementById('REGISTER_FORM').classList.toggle('auth__form--hidden', isLogin);
}

function handleStrengthCheck() {
  const val = document.getElementById('REGISTER_PASSWORD').value;
  const fill = document.getElementById('STRENGTH_FILL');
  const label = document.getElementById('STRENGTH_LABEL');

  let strength = 0;
  if (val.length >= 8) strength++;
  if (/[A-Z]/.test(val)) strength++;
  if (/[0-9]/.test(val)) strength++;
  if (/[^A-Za-z0-9]/.test(val)) strength++;

  const levels = [
    { width: '0%',   color: '#e4e4e7', text: '' },
    { width: '25%',  color: '#f87171', text: 'Weak' },
    { width: '50%',  color: '#fb923c', text: 'Fair' },
    { width: '75%',  color: '#facc15', text: 'Good' },
    { width: '100%', color: '#84cc16', text: 'Strong' },
  ];

  const level = levels[strength];
  fill.style.width = level.width;
  fill.style.background = level.color;
  label.textContent = level.text;
  label.style.color = level.color;
}

document.getElementById('LOGIN_FORM').addEventListener('submit', handleLoginSubmit);
document.getElementById('REGISTER_FORM').addEventListener('submit', handleRegisterSubmit);
document.getElementById('LOGIN_TAB').addEventListener('click', () => handleTabSwitch('login'));
document.getElementById('REGISTER_TAB').addEventListener('click', () => handleTabSwitch('register'));
