import { showToast } from '../components/toast/toast.js';

const DEBOUNCE_MS = 300;
const STORAGE_KEY = 'donezo_tasks';

export class SyncQueue {
  constructor(taskApiService, retryHandler) {
    this.taskApiService = taskApiService;
    this.retryHandler = retryHandler;
    this.queue = new Map();
    this.debounceTimer = null;
    this.paused = false;
    this.retrying = false;
    this.onIdMappings = null;
  }

  enqueue(tasks) {
    for (const task of tasks) {
      this.queue.set(task.id, task);
    }
    this.scheduleFlush();
  }

  scheduleFlush() {
    if (this.paused) return;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.flush(), DEBOUNCE_MS);
  }

  async flush() {
    if (this.queue.size === 0) return;
    const batch = Array.from(this.queue.values());
    const batchIds = new Set(batch.map((t) => t.id));
    this.queue.clear();

    try {
      const { ok, status, data } = await this.taskApiService.syncTasks(batch);
      if (ok) {
        this.processIdMappings(data?.idMappings);
        this.markSynced(batchIds);
        return;
      }
      if (status === 429) {
        if (data?.error?.startsWith('Task limit')) { showToast(data.error); return; }
        showToast('Too many requests. Please slow down.');
      }
      this.startRetryLoop(0);
    } catch (err) {
      if (!(err instanceof TypeError)) console.error('sync error:', err);
      this.startRetryLoop(0);
    }
  }

  processIdMappings(idMappings) {
    if (!idMappings?.length || !this.onIdMappings) return;
    this.onIdMappings(idMappings);
  }

  async startRetryLoop(attempt) {
    if (this.retrying) return;
    this.retrying = true;

    try {
      await this.retryAttempt(attempt);
    } finally {
      this.retrying = false;
    }
  }

  async retryAttempt(attempt) {
    if (!this.retryHandler.shouldRetry(attempt)) {
      showToast('Sync failed. Will retry when online.');
      return;
    }
    if (!this.retryHandler.isOnline()) {
      await this.retryHandler.waitForOnline();
    }

    const delay = this.retryHandler.getDelay(attempt);
    await this.wait(delay);

    const pending = this.loadPending();
    if (pending.length === 0) return;

    try {
      const { ok, status, data } = await this.taskApiService.syncTasks(pending);
      if (ok) {
        this.processIdMappings(data?.idMappings);
        this.markSynced(new Set(pending.map((t) => t.id)));
        return;
      }
      if (status === 429) {
        if (data?.error?.startsWith('Task limit')) { showToast(data.error); return; }
        showToast('Too many requests. Please slow down.');
      }
      await this.retryAttempt(attempt + 1);
    } catch {
      await this.retryAttempt(attempt + 1);
    }
  }

  loadPending() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tasks = raw ? JSON.parse(raw) : [];
    return tasks.filter((t) => !t.synced && !t.is_deleted);
  }

  markSynced(ids) {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tasks = raw ? JSON.parse(raw) : [];
    const updated = tasks
      .map((t) => (ids.has(t.id) ? { ...t, synced: true } : t))
      .filter((t) => !(t.is_deleted && t.synced));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  pause() {
    this.paused = true;
    clearTimeout(this.debounceTimer);
  }

  resume() {
    this.paused = false;
    if (this.queue.size > 0) {
      this.scheduleFlush();
    } else {
      const pending = this.loadPending();
      if (pending.length > 0) this.flush.call(this);
    }
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
