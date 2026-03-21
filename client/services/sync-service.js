// Push unsynced localStorage tasks to backend on reconnect

import { getToken } from './auth-service.js';
import { API_BASE } from '../config.js';

export async function syncPendingTasks(storage) {
  const allTasks = storage.loadAll();
  const pendingTasks = allTasks.filter((t) => !t.synced);

  if (pendingTasks.length === 0) return;

  try {
    // Fetch current server state to compare timestamps
    const getRes = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!getRes.ok) return;

    const { tasks: serverTasks } = await getRes.json();
    const serverMap = new Map(serverTasks.map((t) => [t.id, t]));

    // Only push tasks where local updated_at is newer than server's
    const tasksToSync = pendingTasks.filter((local) => {
      const server = serverMap.get(local.id);
      if (!server) return true;
      if (!local.updated_at) return true;
      return new Date(local.updated_at) > new Date(server.updated_at);
    });

    if (tasksToSync.length === 0) {
      // Server is newer for everything — just mark all as synced
      const updatedTasks = allTasks.map((t) =>
        pendingTasks.find((p) => p.id === t.id) ? { ...t, synced: true } : t
      );
      storage.save(updatedTasks);
      return;
    }

    const postRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ tasks: tasksToSync }),
    });

    if (!postRes.ok) return;

    const { tasks: savedTasks } = await postRes.json();
    const savedIds = new Set(savedTasks.map((t) => t.id));

    const updatedTasks = allTasks
      .map((t) => {
        const wasPending = pendingTasks.find((p) => p.id === t.id);
        if (!wasPending) return t;
        const accepted = savedIds.has(t.id);
        const serverWasNewer = !tasksToSync.find((s) => s.id === t.id);
        return accepted || serverWasNewer ? { ...t, synced: true } : t;
      })
      .filter((t) => !(t.is_deleted && t.synced));

    storage.save(updatedTasks);
  } catch (err) {
    console.error('syncPendingTasks error:', err);
  }
}

export function handleOnline(storage) {
  syncPendingTasks(storage);
}
