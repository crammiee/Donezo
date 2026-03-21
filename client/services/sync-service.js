// Push unsynced localStorage tasks to backend on reconnect (last-write-wins)

import { taskApiService } from './task-api-service.js';

export class SyncService {
  handleOnline(storage) {
    this.syncPendingTasks(storage);
  }

  async syncPendingTasks(storage) {
    const allTasks = storage.loadAll();
    const pending = allTasks.filter((t) => !t.synced);
    if (pending.length === 0) return;

    try {
      await taskApiService.syncTasks(pending);
      storage.save(this.markSynced(storage.loadAll(), pending));
    } catch (err) {
      console.error('syncPendingTasks error:', err);
    }
  }

  markSynced(allTasks, pending) {
    const pendingIds = new Set(pending.map((t) => t.id));
    return allTasks
      .map((t) => pendingIds.has(t.id) ? { ...t, synced: true } : t)
      .filter((t) => !(t.is_deleted && t.synced));
  }
}
