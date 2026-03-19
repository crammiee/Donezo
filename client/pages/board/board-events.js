import { TaskModal } from '../../components/modal/task-modal/task-modal.js';
import { DeleteModal } from '../../components/modal/delete-modal/delete-modal.js';
import { CardActions } from '../../components/card/card-actions.js';
import { HelpModal } from '../../components/modal/help-modal/help-modal.js';
import { WelcomeModal } from '../../components/modal/welcome-modal/welcome-modal.js';
import { SeedService } from '../../services/seed-service.js';
import { isAuthenticated, AUTH_PAGE, getToken } from '../../services/auth-service.js';
import { connectSocket } from '../../services/socket-service.js';
import { API_BASE } from '../../config.js';

export class BoardEvents {
  constructor(boardDOM, storage) {
    this.boardDOM = boardDOM;
    this.storage = storage;
    this.modal = new TaskModal();
    this.deleteModal = new DeleteModal();
    this.helpModal = new HelpModal();
    this.welcomeModal = new WelcomeModal();
    this.seedService = new SeedService();
    this.cardActions = new CardActions(boardDOM, storage, this.modal, this.deleteModal);
    this.isUsingKeyboard = false;
    this.draggedCard = null;

    this.cardActions.onDragStart = (card) => this.handleCardDragStart(card);
    this.cardActions.onDragEnd = () => this.handleCardDragEnd();
    this.cardActions.onHover = (card) => this.handleCardHover(card);
  }

  async init() {

    if (!isAuthenticated()) { window.location.href = AUTH_PAGE; return; }

    connectSocket((tasks) => this.handleRemoteTaskUpdate(tasks));

    await this.modal.init();
    await this.deleteModal.init();

    const isNewAccount = await this.fetchAndSyncTasks();
    if (isNewAccount) this.seedService.seed(this.storage);

    await this.loadAndRenderTasks();
    this.attachColumnDropListeners();

    document.addEventListener('click', (e) => this.handleAddButtonClick(e));
    document.addEventListener('keydown', (e) => this.handleBoardKeydown(e));
    document.addEventListener('mousemove', () => this.handleBoardMouseMove());
    document.getElementById('HELP_BTN').addEventListener('click', () => this.handleHelpOpen());

    if (isNewAccount) {
      this.welcomeModal.onDismiss = () => {};
      await this.welcomeModal.open();
    }
  }

  async fetchAndSyncTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) return false;
      const { tasks } = await res.json();
      if (tasks.length > 0) {
        this.storage.save(tasks);
        return false;
      }
      return this.storage.load().length === 0;
    } catch {
      return false;
    }
  }

  async loadAndRenderTasks() {
    const cards = this.cardActions.fromStorage();
    for (const card of cards) {
      await this.boardDOM.mountCard(card);
    }
  }

  handleAddTask(status) {
    this.modal.onConfirm = async (data) => {
      const card = this.cardActions.createCard(data);
      await this.boardDOM.mountCard(card);
    };
    this.modal.open(status);
  }

  handleCardDragStart(card) {
    this.draggedCard = card;
  }

  handleCardDragEnd() {
    this.draggedCard = null;
    this.boardDOM.clearColumnHighlights();
  }

  handleCardHover(card) {
    if (this.isUsingKeyboard) return;
    card.$element.focus();
  }

  handleColumnDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.boardDOM.highlightColumn(e.currentTarget);
  }

  handleColumnDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) this.boardDOM.clearColumnHighlights();
  }

  async handleColumnDrop(e) {
    e.preventDefault();
    this.boardDOM.clearColumnHighlights();
    if (!this.draggedCard) return;

    const newStatus = e.currentTarget.dataset.status;
    if (newStatus === this.draggedCard.status) return;

    await this.cardActions.handleDrop(this.draggedCard, newStatus);
    this.draggedCard = null;
  }

  handleAddButtonClick(e) {
    const $btn = e.target.closest('.column__add-btn');
    if (!$btn) return;
    this.handleAddTask($btn.dataset.status);
  }

  handleBoardKeydown(e) {
    this.isUsingKeyboard = true;
    if (e.key === 'Enter' && e.target === document.body) this.handleAddTask('todo');
  }

  handleBoardMouseMove() {
    this.isUsingKeyboard = false;
  }

  attachColumnDropListeners() {
    document.querySelectorAll('.column').forEach(($col) => {
      $col.addEventListener('dragover', (e) => this.handleColumnDragOver(e));
      $col.addEventListener('dragleave', (e) => this.handleColumnDragLeave(e));
      $col.addEventListener('drop', (e) => this.handleColumnDrop(e));
    });
  }

  handleHelpOpen() {
    this.helpModal.open();
  }

  async handleRemoteTaskUpdate(tasks) {
    for (const task of tasks) {
      const existing = this.cardActions.findCard(task.id);
      if (task.deleted_at) {
        if (existing) {
          this.boardDOM.unmountCard(existing);
          this.cardActions.cards = this.cardActions.cards.filter((c) => c.id !== task.id);
        }
      } else if (existing) {
        existing.title = task.title;
        existing.description = task.description;
        if (existing.status !== task.status) {
          this.boardDOM.unmountCard(existing);
          existing.status = task.status;
          await this.boardDOM.mountCard(existing);
        } else {
          existing.$element.querySelector('.card__title').textContent = task.title;
        }
      } else {
        const card = this.cardActions.createCardFromRemote(task);
        await this.boardDOM.mountCard(card);
      }
    }
    this.storage.save(this.cardActions.getAllCards());
  }
}