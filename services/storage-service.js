const STORAGE_KEY = 'DONEZO_TASKS';

/**
 * Loads all tasks from localStorage.
 * @returns {Object[]}
 */
export function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Persists the full tasks array to localStorage.
 * @param {Object[]} tasks
 */
export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Creates a new task and appends it to storage.
 * @param {string} text
 * @param {string} status
 * @returns {Object}
 */
export function addTask(text, status) {
  const tasks = loadTasks();
  const task = {
    id: crypto.randomUUID(),
    text: text.trim(),
    status,
    createdAt: Date.now(),
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

/**
 * Applies partial changes to a task by id.
 * @param {string} id
 * @param {Object} changes
 */
export function updateTask(id, changes) {
  const tasks = loadTasks().map((task) =>
    task.id === id ? { ...task, ...changes } : task
  );
  saveTasks(tasks);
}

/**
 * Removes a task by id from storage.
 * @param {string} id
 */
export function removeTask(id) {
  saveTasks(loadTasks().filter((task) => task.id !== id));
}