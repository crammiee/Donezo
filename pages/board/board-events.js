import { Card } from '../../components/card/card.js';
import { Modal } from '../../components/modal/modal.js';
import { loadTasks, addTask, updateTask, deleteTask } from '../../services/storage-service.js';
import { COLUMNS, getColumnEl, updateColumnCount } from './board-dom.js';

const COLUMN_ORDER = COLUMNS.map((col) => col.id);

const modal = new Modal();

function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getNextStatus(currentStatus, direction) {
  const index = COLUMN_ORDER.indexOf(currentStatus);
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= COLUMN_ORDER.length) return null;
  return COLUMN_ORDER[nextIndex];
}

function mountCard(card) {
  const $col = getColumnEl(card.status);
  card.render($col);
  updateColumnCount(card.status);
}

function assignCardHandlers(card) {
  card.onEdit = handleEditCard;
  card.onDelete = handleDeleteCard;
  card.onMove = handleMoveCard;
}

function handleAddTask(status) {
  modal.onConfirm = (data) => {
    const task = { id: generateId(), ...data };
    addTask(task);
    const card = new Card(task);
    assignCardHandlers(card);
    mountCard(card);
  };
  modal.open(status);
}

function handleEditCard(card) {
  modal.onConfirm = (data) => {
    card.updateContent(data.title, data.description);
    const oldStatus = card.status;
    card.updateStatus(data.status);
    updateTask(card.toJSON());

    if (data.status !== oldStatus) {
      card.$element.remove();
      updateColumnCount(oldStatus);
      mountCard(card);
    }
  };
  modal.open(card.status, card.toJSON());
}

function handleDeleteCard(card) {
  const oldStatus = card.status;
  deleteTask(card.id);
  card.remove();
  updateColumnCount(oldStatus);
}

function handleMoveCard(card, direction) {
  const newStatus = getNextStatus(card.status, direction);
  if (!newStatus) return;

  const oldStatus = card.status;
  card.updateStatus(newStatus);
  updateTask(card.toJSON());

  card.$element.remove();
  updateColumnCount(oldStatus);
  mountCard(card);
  card.$element.focus();
}

function handleAddButtonClick(e) {
  const $btn = e.target.closest('.column__add-btn');
  if (!$btn) return;
  handleAddTask($btn.dataset.status);
}

function handleBoardKeydown(e) {
  if (e.key === 'Enter' && e.target === document.body) handleAddTask('todo');
}

function loadAndRenderTasks() {
  const tasks = loadTasks();
  tasks.forEach((taskData) => {
    const card = Card.fromJSON(taskData);
    assignCardHandlers(card);
    mountCard(card);
  });
}

export function initBoard() {
  modal.render();
  loadAndRenderTasks();

  document.addEventListener('click', handleAddButtonClick);
  document.addEventListener('keydown', handleBoardKeydown);

  const $helpBtn = document.getElementById('HELP_BTN');
  $helpBtn.addEventListener('click', handleHelpOpen);
}

function handleHelpOpen() {
  import('./help-modal.js').then(({ openHelpModal }) => openHelpModal());
}