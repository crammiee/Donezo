// Push unsynced localStorage tasks to backend on reconnect

import { getToken } from './auth-service.js';
import { API_BASE } from '../config.js';

export class SyncService {
  handleOnline(storage) {
    this.syncPendingTasks(storage);
  }

  async syncPendingTasks(storage) {
    const allTasks = storage.loadAll();
    const pendingTasks = allTasks.filter((t) => !t.synced);
    if (pendingTasks.length === 0) return;

    try {
      const serverTasks = await this.fetchServerTasks();
      if (!serverTasks) return;

      const tasksToSync = this.filterNewerTasks(pendingTasks, serverTasks);
      if (tasksToSync.length === 0) { storage.save(this.markAllSynced(allTasks, pendingTasks)); return; }

      const saved = await this.pushTasks(tasksToSync);
      if (!saved) return;
      const savedIds = new Set(saved.map((t) => t.id));
      storage.save(this.reconcileTasks(allTasks, pendingTasks, tasksToSync, savedIds));
    } catch (err) {
      console.error('syncPendingTasks error:', err);
    }
  }

  async fetchServerTasks() {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) return null;
    const { tasks } = await res.json();
    return tasks;
  }

  filterNewerTasks(pendingTasks, serverTasks) {
    const serverMap = new Map(serverTasks.map((t) => [t.id, t]));
    return pendingTasks.filter((local) => {
      const server = serverMap.get(local.id);
      if (!server || !local.updated_at) return true;
      return new Date(local.updated_at) > new Date(server.updated_at);
    });
  }

  async pushTasks(tasks) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ tasks }),
    });
    if (!res.ok) return null;
    const { tasks: saved } = await res.json();
    return saved;
  }

  markAllSynced(allTasks, pendingTasks) {
    return allTasks.map((t) =>
      pendingTasks.find((p) => p.id === t.id) ? { ...t, synced: true } : t
    );
  }

  reconcileTasks(allTasks, pendingTasks, tasksToSync, savedIds) {
    return allTasks
      .map((t) => {
        if (!pendingTasks.find((p) => p.id === t.id)) return t;
        const accepted = savedIds.has(t.id);
        const serverNewer = !tasksToSync.find((s) => s.id === t.id);
        return accepted || serverNewer ? { ...t, synced: true } : t;
      })
      .filter((t) => !(t.is_deleted && t.synced));
  }
}
