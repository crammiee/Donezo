import { loadTasks } from '../../services/storage-service.js';
import { Column } from '../../components/column/column.js';
import { renderColumn } from '../../components/column/column-dom.js';

const STATUSES = ['todo', 'doing', 'done'];

/**
 * Loads tasks from storage and renders all three columns.
 */
export function renderBoard() {
  const tasks = loadTasks();

  STATUSES.forEach((status) => {
    const column = new Column(status);
    const columnTasks = tasks.filter((task) => task.status === status);
    renderColumn(column, columnTasks);
  });
}

renderBoard();