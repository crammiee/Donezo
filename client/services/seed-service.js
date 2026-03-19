import { syncTasks } from './task-api-service.js';

const SEED_TASKS = [
  { title: 'Add your first real task',    description: 'Click "+ new task" below, or press Enter on the board.', status: 'todo'  },
  { title: 'Move a task between columns', description: 'Focus a card and press ← or → to move it.',               status: 'todo'  },
  { title: 'Try dragging this card',      description: 'Grab it and drop it into another column.',                 status: 'doing' },
  { title: 'All done with setup!',        description: 'Tasks are saved automatically.',                           status: 'done'  },
];

export class SeedService {
  seed(storage) {
    const tasks = SEED_TASKS.map((t) => ({ id: crypto.randomUUID(), ...t }));
    tasks.forEach((task) => storage.add(task));
    syncTasks(tasks);
    return tasks;
  }
}
