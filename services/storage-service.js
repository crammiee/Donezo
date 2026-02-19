const STORAGE_KEY = 'donezo_tasks';

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(task) {
  const tasks = loadTasks();
  tasks.push(task);
  saveTasks(tasks);
}

function updateTask(updatedTask) {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === updatedTask.id);
  if (index === -1) throw new Error(`Task not found: ${updatedTask.id}`);
  tasks[index] = updatedTask;
  saveTasks(tasks);
}

function deleteTask(taskId) {
  const tasks = loadTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  saveTasks(filtered);
}

export { loadTasks, addTask, updateTask, deleteTask };