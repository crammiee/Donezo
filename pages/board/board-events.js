import { Modal } from '../../components/modal/modal.js';
import { DeleteModal } from '../../components/modal/delete-modal.js';
import { CardActions } from '../../components/card/card-actions.js';

export class BoardEvents {
  constructor(boardDOM, storage) {
    this.boardDOM = boardDOM;
    this.storage = storage;
    this.modal = new Modal();
    this.deleteModal = new DeleteModal();
    this.cardActions = new CardActions(boardDOM, storage, this.modal, this.deleteModal);
    this.isUsingKeyboard = false;
    this.draggedCard = null;

    this.cardActions.onDragStart = (card) => this.handleCardDragStart(card);
    this.cardActions.onDragEnd = () => this.handleCardDragEnd();
    this.cardActions.onHover = (card) => this.handleCardHover(card);
  }

  async init() {
    await this.modal.init();
    await this.deleteModal.init();
    await this.loadAndRenderTasks();

    this.attachColumnDropListeners();

    document.addEventListener('click', (e) => this.handleAddButtonClick(e));
    document.addEventListener('keydown', (e) => this.handleBoardKeydown(e));
    document.addEventListener('mousemove', () => this.handleBoardMouseMove());
    document.getElementById('HELP_BTN').addEventListener('click', () => this.handleHelpOpen());
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
    import('./help-modal.js').then(({ openHelpModal }) => openHelpModal());
  }
}