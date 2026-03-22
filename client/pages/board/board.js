import { StorageService } from '../../services/storage-service.js';
import { BoardDOM } from './board-dom.js';
import { BoardEvents } from './board-events.js';
import { DragDropManager } from './drag-drop-manager.js';
import { TagFilter } from './tag-filter.js';
import { CardActions } from '../../components/card/card-actions.js';
import { TaskModal } from '../../components/modal/task-modal/task-modal.js';
import { DeleteModal } from '../../components/modal/delete-modal/delete-modal.js';
import { HelpModal } from '../../components/modal/help-modal/help-modal.js';
import { WelcomeModal } from '../../components/modal/welcome-modal/welcome-modal.js';
import { UserMenu } from '../../components/user-menu/user-menu.js';
import { SeedService } from '../../services/seed-service.js';
import { isAuthenticated, AUTH_PAGE, getToken } from '../../services/auth-service.js';
import { socketService } from '../../services/socket-service.js';
import { taskApiService } from '../../services/task-api-service.js';
import { SyncQueue } from '../../services/sync-queue.js';
import { RetryHandler } from '../../services/retry-handler.js';
import { API_BASE } from '../../config.js';

if (!isAuthenticated()) {
  window.location.href = AUTH_PAGE;
} else {
  initBoard();
}

async function initBoard() {
  const storage = new StorageService();
  const boardDOM = new BoardDOM();
  const modal = new TaskModal();
  const deleteModal = new DeleteModal();
  const retryHandler = new RetryHandler();
  const syncQueue = new SyncQueue(taskApiService, retryHandler);
  const cardActions = new CardActions(boardDOM, storage, modal, deleteModal, syncQueue);
  const dragDrop = new DragDropManager(boardDOM, cardActions, storage, syncQueue);
  const tagFilter = new TagFilter(cardActions);
  const events = new BoardEvents(cardActions, boardDOM, modal, dragDrop, tagFilter);

  await initServices(modal, deleteModal, events, syncQueue);
  await loadBoard(cardActions, boardDOM, tagFilter, dragDrop, events, storage);
}

async function initServices(modal, deleteModal, events, syncQueue) {
  const userMenu = new UserMenu();
  await userMenu.init();
  socketService.connect((tasks) => events.handleRemoteTaskUpdate(tasks));
  await modal.init();
  await deleteModal.init();
  window.addEventListener('online', () => syncQueue.resume());
  document.getElementById('HELP_BTN').addEventListener('click', () => new HelpModal().open());
}

async function loadBoard(cardActions, boardDOM, tagFilter, dragDrop, events, storage) {
  const isNewAccount = await fetchAndSyncTasks(storage);
  if (isNewAccount) new SeedService().seed(storage);

  await loadAndRenderTasks(cardActions, boardDOM);
  tagFilter.init();
  tagFilter.render();
  dragDrop.attachListeners();
  events.attachListeners();
  cardActions.onChange = () => tagFilter.update();

  if (isNewAccount) {
    const welcomeModal = new WelcomeModal();
    welcomeModal.onDismiss = () => {};
    await welcomeModal.open();
  }
}

async function fetchAndSyncTasks(storage) {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) return false;
    const { tasks } = await res.json();
    if (tasks.length > 0) {
      mergePositions(storage, tasks);
      return false;
    }
    return storage.load().length === 0;
  } catch {
    return false;
  }
}

function mergePositions(storage, tasks) {
  const local = storage.load();
  const positionMap = {};
  for (const t of local) {
    if (t.position != null) positionMap[t.id] = t.position;
  }
  for (const t of tasks) {
    if (positionMap[t.id] != null) t.position = positionMap[t.id];
  }
  storage.save(tasks);
}

async function loadAndRenderTasks(cardActions, boardDOM) {
  const cards = cardActions.fromStorage();
  cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  for (const card of cards) {
    await boardDOM.mountCard(card);
  }
}
