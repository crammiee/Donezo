const VISITED_KEY = 'donezo_visited';

const SEED_TASKS = [
  { id: 'seed_1', title: 'Add your first real task',    description: 'Click "+ new task" below, or press Enter on the board.', status: 'todo'  },
  { id: 'seed_2', title: 'Move a task between columns', description: 'Focus a card and press ← or → to move it.',               status: 'todo'  },
  { id: 'seed_3', title: 'Try dragging this card',      description: 'Grab it and drop it into another column.',                 status: 'doing' },
  { id: 'seed_4', title: 'All done with setup!',        description: 'Tasks are saved automatically — no account needed.',       status: 'done'  },
];

export class SeedService {
  isFirstVisit() {
    return !localStorage.getItem(VISITED_KEY);
  }

  markVisited() {
    localStorage.setItem(VISITED_KEY, 'true');
  }

  seed(storage) {
    SEED_TASKS.forEach((task) => storage.add(task));
  }
}
