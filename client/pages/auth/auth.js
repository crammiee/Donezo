// Form submit → auth-service → store JWT → redirect to /
import { login, register } from '../../services/auth-service.js';


function showError(message) {
  const errorEl = document.getElementById('AUTH_ERROR');
  errorEl.textContent = message;
  errorEl.classList.remove('auth__error--hidden');
}

function hideError() {
  document.getElementById('AUTH_ERROR').classList.add('auth__error--hidden');
}

function setLoading(btn, loading) {
  btn.classList.toggle('auth__btn--loading', loading);
  btn.textContent = loading ? '' : btn.dataset.label;
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('LOGIN_EMAIL').value;
  const password = document.getElementById('LOGIN_PASSWORD').value;
  const btn = document.getElementById('LOGIN_SUBMIT');

  if (!email || !password) {
    showError('Email and password are required.');
    return;
  }

  hideError();
  setLoading(btn, true);
  login(email, password)
    .then(() => {
      window.location.href = '/';
    })
    .catch(err => {
      showError(err.message);
      setLoading(btn, false);
    });
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('REGISTER_EMAIL').value;
  const password = document.getElementById('REGISTER_PASSWORD').value;
  const confirm = document.getElementById('REWRITE_REGISTER_PASSWORD').value;
  const btn = document.getElementById('REGISTER_SUBMIT');

  if (password !== confirm) {
    showError('Passwords do not match.');
    return;
  }

  hideError();
  setLoading(btn, true);
  register(email, password)
    .then(() => login(email, password))
    .then(() => {
      window.location.href = '/';
    })
    .catch(err => {
      showError(err.message);
      setLoading(btn, false);
    });
}

function handleTabSwitch(tab) {
  const isLogin = tab === 'login';
  document.getElementById('LOGIN_TAB').classList.toggle('auth__tab--active', isLogin);
  document.getElementById('REGISTER_TAB').classList.toggle('auth__tab--active', !isLogin);
  document.getElementById('LOGIN_FORM').classList.toggle('auth__form--hidden', !isLogin);
  document.getElementById('REGISTER_FORM').classList.toggle('auth__form--hidden', isLogin);
  hideError();
}

function handleStrengthCheck() {
  const val = document.getElementById('REGISTER_PASSWORD').value;
  const bar = document.querySelector('.auth__strength');
  const fill = document.getElementById('STRENGTH_FILL');
  const label = document.getElementById('STRENGTH_LABEL');

  bar.classList.toggle('auth__strength--visible', val.length > 0);

  let strength = 0;
  if (val.length >= 8) strength++;
  if (/[A-Z]/.test(val)) strength++;
  if (/[0-9]/.test(val)) strength++;
  if (/[^A-Za-z0-9]/.test(val)) strength++;

  const levels = [
    { width: '0%',   cls: '',                text: '' },
    { width: '25%',  cls: 'strength--weak',  text: 'Weak' },
    { width: '50%',  cls: 'strength--fair',  text: 'Fair' },
    { width: '75%',  cls: 'strength--good',  text: 'Good' },
    { width: '100%', cls: 'strength--strong',text: 'Strong' },
  ];

  const allClasses = ['strength--weak', 'strength--fair', 'strength--good', 'strength--strong'];
  fill.classList.remove(...allClasses);
  label.classList.remove(...allClasses);

  const level = levels[strength];
  fill.style.width = level.width;
  if (level.cls) {
    fill.classList.add(level.cls);
    label.classList.add(level.cls);
  }
  label.textContent = level.text;
}

document.getElementById('LOGIN_FORM').addEventListener('submit', handleLoginSubmit);
document.getElementById('REGISTER_FORM').addEventListener('submit', handleRegisterSubmit);
document.getElementById('LOGIN_TAB').addEventListener('click', () => handleTabSwitch('login'));
document.getElementById('REGISTER_TAB').addEventListener('click', () => handleTabSwitch('register'));
document.getElementById('REGISTER_PASSWORD').addEventListener('input', handleStrengthCheck);
document.querySelectorAll('.auth__input').forEach(input => input.addEventListener('focus', hideError));
