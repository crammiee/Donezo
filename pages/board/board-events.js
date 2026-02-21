import { Card } from '../../components/card/card.js';
import { Modal } from '../../components/modal/modal.js';
import { DeleteModal } from '../../components/modal/delete-modal.js';
import { loadTasks, addTask, updateTask, deleteTask } from '../../services/storage-service.js';
import { getColumnEl, updateColumnCount } from './board-dom.js';

const COLUMN_ORDER = ['todo', 'doing', 'done'];

const modal = new Modal();
const deleteModal = new DeleteModal();

function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getNextStatus(currentStatus, direction) {
  const index = COLUMN_ORDER.indexOf(currentStatus);
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= COLUMN_ORDER.length) return null;
  return COLUMN_ORDER[nextIndex];
}

async function mountCard(card) {
  const $col = getColumnEl(card.status);
  await card.render($col);
  updateColumnCount(card.status);
}

function assignCardHandlers(card) {
  card.onEdit = handleEditCard;
  card.onDelete = handleDeleteCard;
  card.onMove = handleMoveCard;
}

function handleAddTask(status) {
  modal.onConfirm = async (data) => {
    const task = { id: generateId(), ...data };
    addTask(task);
    const card = new Card(task);
    assignCardHandlers(card);
    await mountCard(card);
  };
  modal.open(status);
}

function handleEditCard(card) {
  modal.onConfirm = async (data) => {
    card.updateContent(data.title, data.description);
    const oldStatus = card.status;
    card.updateStatus(data.status);
    updateTask(card.toJSON());

    if (data.status !== oldStatus) {
      card.$element.remove();
      updateColumnCount(oldStatus);
      await mountCard(card);
    }
  };
  modal.open(card.status, card.toJSON());
}

function handleDeleteCard(card) {
  deleteModal.onConfirm = () => {
    const oldStatus = card.status;
    deleteTask(card.id);
    card.remove();
    updateColumnCount(oldStatus);
  };
  deleteModal.open(card.title);
}

async function handleMoveCard(card, direction) {
  const newStatus = getNextStatus(card.status, direction);
  if (!newStatus) return;

  const oldStatus = card.status;
  card.updateStatus(newStatus);
  updateTask(card.toJSON());

  card.$element.remove();
  updateColumnCount(oldStatus);
  await mountCard(card);
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

async function loadAndRenderTasks() {
  const tasks = loadTasks();
  for (const taskData of tasks) {
    const card = Card.fromJSON(taskData);
    assignCardHandlers(card);
    await mountCard(card);
  }
}

export async function initBoard() {
  await modal.init();
  await deleteModal.init();
  await loadAndRenderTasks();

  document.addEventListener('click', handleAddButtonClick);
  document.addEventListener('keydown', handleBoardKeydown);
  document.getElementById('HELP_BTN').addEventListener('click', handleHelpOpen);
}

function handleHelpOpen() {
  import('./help-modal.js').then(({ openHelpModal }) => openHelpModal());
}