const STORAGE_KEY = 'donezo_tasks';

export class StorageService {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tasks = raw ? JSON.parse(raw) : [];
    return tasks.filter((t) => !t.is_deleted);
  }

  loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  add(task) {
    const tasks = this.load();
    tasks.push({ ...task, updated_at: new Date().toISOString() });
    this.save(tasks);
  }

  update(updatedTask) {
    const tasks = this.load();
    const index = tasks.findIndex((t) => t.id === updatedTask.id);
    if (index === -1) throw new Error(`Task not found: ${updatedTask.id}`);
    tasks[index] = { ...updatedTask, updated_at: new Date().toISOString() };
    this.save(tasks);
  }

  delete(taskId) {
    const tasks = this.loadAll();
    this.save(tasks.filter((t) => t.id !== taskId));
  }

  softDelete(taskId) {
    const tasks = this.loadAll();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.is_deleted = true;
      task.synced = false;
      task.updated_at = new Date().toISOString();
    }
    this.save(tasks);
  }

  replaceId(oldId, newId) {
    const tasks = this.loadAll();
    const task = tasks.find((t) => t.id === oldId);
    if (task) task.id = newId;
    this.save(tasks);
  }

  save(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}