const STORAGE_KEY = 'donezo_tasks';

export class StorageService {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  add(task) {
    const tasks = this.load();
    tasks.push(task);
    this.save(tasks);
  }

  update(updatedTask) {
    const tasks = this.load();
    const index = tasks.findIndex((t) => t.id === updatedTask.id);
    if (index === -1) throw new Error(`Task not found: ${updatedTask.id}`);
    tasks[index] = updatedTask;
    this.save(tasks);
  }

  delete(taskId) {
    const tasks = this.load();
    this.save(tasks.filter((t) => t.id !== taskId));
  }

  save(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}