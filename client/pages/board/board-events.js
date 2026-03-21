import { TaskModal } from '../../components/modal/task-modal/task-modal.js';
import { DeleteModal } from '../../components/modal/delete-modal/delete-modal.js';
import { CardActions } from '../../components/card/card-actions.js';
import { HelpModal } from '../../components/modal/help-modal/help-modal.js';
import { WelcomeModal } from '../../components/modal/welcome-modal/welcome-modal.js';
import { SeedService } from '../../services/seed-service.js';
import { isAuthenticated, AUTH_PAGE, getToken } from '../../services/auth-service.js';
import { UserMenu } from '../../components/user-menu/user-menu.js';
import { connectSocket } from '../../services/socket-service.js';
import { syncTasks } from '../../services/task-api-service.js';
import { handleOnline } from '../../services/sync-service.js'; 
import { API_BASE } from '../../config.js';
import { getTagColor } from '../../utils/tag-colors.js';

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
    this.userMenu = new UserMenu();
    this.isUsingKeyboard = false;
    this.draggedCard = null;
    this.dropTarget = null;
    this.activeFilterTag = null;
    this.$tagFilters = null;

    this.cardActions.onDragStart = (card) => this.handleCardDragStart(card);
    this.cardActions.onDragEnd = () => this.handleCardDragEnd();
    this.cardActions.onHover = (card) => this.handleCardHover(card);
    this.cardActions.onChange = () => { this.renderTagFilters(); this.applyTagFilter(); };
  }

  async init() {

    if (!isAuthenticated()) { window.location.href = AUTH_PAGE; return; }

    await this.userMenu.init();
    connectSocket((tasks) => this.handleRemoteTaskUpdate(tasks));

    await this.modal.init();
    await this.deleteModal.init();

    const isNewAccount = await this.fetchAndSyncTasks();
    if (isNewAccount) this.seedService.seed(this.storage);

    await this.loadAndRenderTasks();
    this.$tagFilters = document.getElementById('TAG_FILTERS');
    this.renderTagFilters();
    this.attachColumnDropListeners();

    document.addEventListener('click', (e) => this.handleAddButtonClick(e));
    document.addEventListener('keydown', (e) => this.handleBoardKeydown(e));
    document.addEventListener('mousemove', () => this.handleBoardMouseMove());
    document.getElementById('HELP_BTN').addEventListener('click', () => this.handleHelpOpen());

    if (isNewAccount) {
      this.welcomeModal.onDismiss = () => {};
      await this.welcomeModal.open();
    }
    window.addEventListener('online', () => handleOnline(this.storage));
  }

  async fetchAndSyncTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) return false;
      const { tasks } = await res.json();
      if (tasks.length > 0) {
        const local = this.storage.load();
        const positionMap = {};
        for (const t of local) {
          if (t.position != null) positionMap[t.id] = t.position;
        }
        for (const t of tasks) {
          if (positionMap[t.id] != null) t.position = positionMap[t.id];
        }
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
    cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    for (const card of cards) {
      await this.boardDOM.mountCard(card);
    }
  }

  handleAddTask(status) {
    this.modal.onConfirm = async (data) => {
      const card = this.cardActions.createCard(data);
      await this.boardDOM.mountCard(card);
      this.renderTagFilters();
      this.applyTagFilter();
    };
    const allTags = this.cardActions.collectAllTags();
    this.modal.open(status, null, allTags);
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
    this.updateDropTarget(e.currentTarget, e.clientY);
  }

  handleColumnDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.boardDOM.clearColumnHighlights();
      this.clearDropIndicator();
    }
  }

  async handleColumnDrop(e) {
    e.preventDefault();
    this.boardDOM.clearColumnHighlights();
    this.clearDropIndicator();
    if (!this.draggedCard) return;

    const newStatus = e.currentTarget.dataset.status;
    const referenceCard = this.dropTarget;
    this.dropTarget = null;

    if (newStatus === this.draggedCard.status) {
      this.boardDOM.reorderCard(this.draggedCard, referenceCard);
      this.saveColumnOrder(newStatus);
    } else {
      await this.cardActions.handleDrop(this.draggedCard, newStatus, referenceCard);
      this.saveColumnOrder(newStatus);
    }
    this.draggedCard = null;
  }

  updateDropTarget($column, clientY) {
    this.clearDropIndicator();
    const cards = Array.from($column.querySelectorAll('.card:not(.card--dragging)'));
    if (cards.length === 0) { this.dropTarget = null; return; }

    let closest = null;
    let closestOffset = Infinity;
    for (const $card of cards) {
      const rect = $card.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const offset = clientY - midY;
      if (offset < 0 && Math.abs(offset) < closestOffset) {
        closestOffset = Math.abs(offset);
        closest = $card;
      }
    }

    if (closest) {
      closest.classList.add('card--drop-above');
      this.dropTarget = this.cardActions.findCardByElement(closest);
    } else {
      const lastCard = cards[cards.length - 1];
      lastCard.classList.add('card--drop-below');
      this.dropTarget = null;
    }
  }

  clearDropIndicator() {
    document.querySelectorAll('.card--drop-above, .card--drop-below').forEach(($c) => {
      $c.classList.remove('card--drop-above', 'card--drop-below');
    });
  }

  saveColumnOrder(status) {
    const $column = this.boardDOM.getColumnEl(status);
    const orderedIds = Array.from($column.querySelectorAll('.card')).map(($c) => $c.dataset.id);
    const allTasks = this.storage.load();
    const updatedTasks = [];
    let position = 0;
    for (const id of orderedIds) {
      const task = allTasks.find((t) => t.id === id);
      if (task) task.position = position;
      const card = this.cardActions.findCard(id);
      if (card) {
        card.position = position;
        updatedTasks.push(card.toData());
      }
      position++;
    }
    this.storage.save(allTasks);
    syncTasks(updatedTasks);
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
    const columnsToReorder = new Set();
    for (const task of tasks) {
      const existing = this.cardActions.findCard(task.id);
      if (task.deleted_at) {
        if (existing) {
          this.boardDOM.unmountCard(existing);
          this.cardActions.cards = this.cardActions.cards.filter((c) => c.id !== task.id);
        }
      } else if (existing) {
        existing.due_date = task.due_date ?? existing.due_date;
        existing.tags = task.tags ?? existing.tags;
        existing.position = task.position ?? existing.position;
        if (existing.status !== task.status) {
          this.boardDOM.unmountCard(existing);
          existing.status = task.status;
          await this.boardDOM.mountCard(existing);
        } else {
          existing.updateContent(task.title, task.description, task.due_date, task.tags);
        }
        columnsToReorder.add(existing.status);
      } else {
        const card = this.cardActions.createCardFromRemote(task);
        await this.boardDOM.mountCard(card);
        columnsToReorder.add(card.status);
      }
    }
    for (const status of columnsToReorder) {
      this.reorderColumnByPosition(status);
    }
    this.storage.save(this.cardActions.getAllCards());
    this.renderTagFilters();
    this.applyTagFilter();
  }

  reorderColumnByPosition(status) {
    const $column = this.boardDOM.getColumnEl(status);
    const $addBtn = $column.querySelector('.column__add-btn');
    const cards = this.cardActions.cards
      .filter((c) => c.status === status && c.$element)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    for (const card of cards) {
      $column.insertBefore(card.$element, $addBtn);
    }
  }

  // --- Tag Filters ---

  renderTagFilters() {
    if (!this.$tagFilters) return;
    this.$tagFilters.innerHTML = '';
    const allTags = this.cardActions.collectAllTags();
    for (const tag of allTags) {
      const color = getTagColor(tag);
      const $btn = document.createElement('button');
      $btn.className = 'filter-tag';
      if (this.activeFilterTag === tag) $btn.classList.add('filter-tag--active');
      $btn.textContent = tag;
      $btn.style.backgroundColor = color.bg;
      $btn.style.color = color.text;
      $btn.addEventListener('click', () => this.toggleTagFilter(tag));
      this.$tagFilters.appendChild($btn);
    }
  }

  toggleTagFilter(tag) {
    this.activeFilterTag = this.activeFilterTag === tag ? null : tag;
    this.applyTagFilter();
    this.renderTagFilters();
  }

  applyTagFilter() {
    for (const card of this.cardActions.cards) {
      if (!card.$element) continue;
      if (!this.activeFilterTag) {
        card.$element.style.display = '';
      } else {
        const hasTag = (card.tags || []).includes(this.activeFilterTag);
        card.$element.style.display = hasTag ? '' : 'none';
      }
    }
  }
}