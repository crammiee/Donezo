export class RetryHandler {
  constructor({ base = 1000, cap = 30000, maxRetries = 8 } = {}) {
    this.base = base;
    this.cap = cap;
    this.maxRetries = maxRetries;
  }

  getDelay(attempt) {
    const exponential = this.base * Math.pow(2, attempt);
    const capped = Math.min(this.cap, exponential);
    const jitter = Math.random() * this.base;
    return capped + jitter;
  }

  shouldRetry(attempt) {
    return attempt < this.maxRetries;
  }

  isOnline() {
    return navigator.onLine;
  }

  waitForOnline() {
    if (this.isOnline()) return Promise.resolve();
    return new Promise((resolve) => {
      window.addEventListener('online', resolve, { once: true });
    });
  }
}
