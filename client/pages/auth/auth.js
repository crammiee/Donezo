import { login, register } from '../../services/auth-service.js';
import { API_BASE } from '../../config.js';

const STRENGTH_LEVELS = [
  { width: '0%',   cls: '',                text: '' },
  { width: '25%',  cls: 'strength--weak',  text: 'Weak' },
  { width: '50%',  cls: 'strength--fair',  text: 'Fair' },
  { width: '75%',  cls: 'strength--good',  text: 'Good' },
  { width: '100%', cls: 'strength--strong',text: 'Strong' },
];

class AuthPage {
  constructor() {
    this.attachListeners();
    this.checkServer();
  }

  async checkServer() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) { this.setServerReady(); return; }
    } catch {}
    this.setServerWaking();
    setTimeout(() => this.checkServer(), 3000);
  }

  setServerWaking() {
    document.getElementById('WAKEUP_BANNER').classList.remove('auth__wakeup--hidden');
  }

  setServerReady() {
    document.getElementById('WAKEUP_BANNER').classList.add('auth__wakeup--hidden');
  }

  attachListeners() {
    document.getElementById('LOGIN_FORM').addEventListener('submit', (e) => this.handleLoginSubmit(e));
    document.getElementById('REGISTER_FORM').addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    document.getElementById('LOGIN_TAB').addEventListener('click', () => this.switchTo('login'));
    document.getElementById('REGISTER_TAB').addEventListener('click', () => this.switchTo('register'));
    document.getElementById('SWITCH_LINK').addEventListener('click', (e) => { e.preventDefault(); this.switchTo('login'); });
    document.getElementById('REGISTER_PASSWORD').addEventListener('input', () => this.handleStrengthCheck());
    document.querySelectorAll('.auth__input').forEach((input) => input.addEventListener('focus', () => this.hideError()));
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('LOGIN_EMAIL').value;
    const password = document.getElementById('LOGIN_PASSWORD').value;
    if (!email || !password) { this.showError('Email and password are required.'); return; }
    this.submitAuth(document.getElementById('LOGIN_SUBMIT'), login(email, password));
  }

  handleRegisterSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('REGISTER_EMAIL').value;
    const password = document.getElementById('REGISTER_PASSWORD').value;
    const confirm = document.getElementById('REWRITE_REGISTER_PASSWORD').value;
    if (password !== confirm) { this.showError('Passwords do not match.'); return; }
    const btn = document.getElementById('REGISTER_SUBMIT');
    this.submitAuth(btn, register(email, password).then(() => login(email, password)));
  }

  switchTo(tab) {
    const isLogin = tab === 'login';
    this.updateTabVisibility(isLogin);
    this.updateSwitchText(isLogin);
    this.hideError();
  }

  handleStrengthCheck() {
    const val = document.getElementById('REGISTER_PASSWORD').value;
    document.querySelector('.auth__strength').classList.toggle('auth__strength--visible', val.length > 0);
    const level = STRENGTH_LEVELS[this.calculateStrength(val)];
    this.applyStrengthLevel(document.getElementById('STRENGTH_FILL'), document.getElementById('STRENGTH_LABEL'), level);
  }

  submitAuth(btn, authPromise) {
    this.hideError();
    this.setLoading(btn, true);
    authPromise
      .then(() => { window.location.href = '/'; })
      .catch((err) => { this.showError(err.message); this.setLoading(btn, false); });
  }

  showError(message) {
    const errorEl = document.getElementById('AUTH_ERROR');
    errorEl.textContent = message;
    errorEl.classList.remove('auth__error--hidden');
  }

  hideError() {
    document.getElementById('AUTH_ERROR').classList.add('auth__error--hidden');
  }

  setLoading(btn, loading) {
    btn.classList.toggle('auth__btn--loading', loading);
    btn.textContent = loading ? '' : btn.dataset.label;
  }

  updateTabVisibility(isLogin) {
    document.getElementById('LOGIN_TAB').classList.toggle('auth__tab--active', isLogin);
    document.getElementById('REGISTER_TAB').classList.toggle('auth__tab--active', !isLogin);
    document.getElementById('LOGIN_FORM').classList.toggle('auth__form--hidden', !isLogin);
    document.getElementById('REGISTER_FORM').classList.toggle('auth__form--hidden', isLogin);
    document.querySelector('.auth__tabs').classList.toggle('auth__tabs--hidden', !isLogin);
  }

  updateSwitchText(isLogin) {
    const heading = document.getElementById('FORM_HEADING');
    const switchText = document.getElementById('AUTH_SWITCH');
    heading.textContent = isLogin ? 'Welcome back' : 'Sign up to get started';
    const linkText = isLogin ? 'Sign up' : 'Sign in';
    const prompt = isLogin ? 'Don\'t have an account?' : 'Already have an account?';
    switchText.innerHTML = `${prompt} <a href="#" class="welcome__switch-link" id="SWITCH_LINK">${linkText}</a>`;
    document.getElementById('SWITCH_LINK').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTo(isLogin ? 'register' : 'login');
    });
  }

  calculateStrength(val) {
    let s = 0;
    if (val.length >= 8) s++;
    if (/[A-Z]/.test(val)) s++;
    if (/[0-9]/.test(val)) s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    return s;
  }

  applyStrengthLevel(fill, label, level) {
    const allClasses = ['strength--weak', 'strength--fair', 'strength--good', 'strength--strong'];
    fill.classList.remove(...allClasses);
    label.classList.remove(...allClasses);
    fill.style.width = level.width;
    if (level.cls) { fill.classList.add(level.cls); label.classList.add(level.cls); }
    label.textContent = level.text;
  }
}

new AuthPage();
