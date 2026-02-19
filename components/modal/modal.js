const STATUSES = ['todo', 'doing', 'done'];
const STATUS_LABELS = { todo: 'To Do', doing: 'Doing', done: 'Done' };

export class Modal {
  constructor() {
    this.$overlay = null;
    this.$titleInput = null;
    this.$descInput = null;
    this.$statusSelect = null;
    this.onConfirm = null;
  }

  render() {
    this.$overlay = this.createOverlay();
    document.body.appendChild(this.$overlay);
    this.attachEventListeners();
  }

  createOverlay() {
    const $overlay = document.createElement('div');
    $overlay.className = 'modal-overlay modal-overlay--hidden';
    $overlay.id = 'TASK_MODAL';
    $overlay.appendChild(this.createModal());
    return $overlay;
  }

  createModal() {
    const $modal = document.createElement('div');
    $modal.className = 'modal';
    $modal.setAttribute('role', 'dialog');
    $modal.setAttribute('aria-modal', 'true');

    this.$titleInput = this.createInput('text', 'modal__input', 'Task title');
    this.$descInput = this.createTextarea();
    this.$statusSelect = this.createStatusSelect();

    $modal.appendChild(this.createModalTitle());
    $modal.appendChild(this.createField('Title', this.$titleInput));
    $modal.appendChild(this.createField('Description', this.$descInput));
    $modal.appendChild(this.createField('Status', this.$statusSelect));
    $modal.appendChild(this.createActions());

    return $modal;
  }

  createModalTitle() {
    const $h2 = document.createElement('h2');
    $h2.className = 'modal__title';
    $h2.id = 'MODAL_TITLE';
    $h2.textContent = 'New Task';
    return $h2;
  }

  createField(labelText, $input) {
    const $field = document.createElement('div');
    $field.className = 'modal__field';

    const $label = document.createElement('label');
    $label.className = 'modal__label';
    $label.textContent = labelText;

    $field.appendChild($label);
    $field.appendChild($input);
    return $field;
  }

  createInput(type, className, placeholder) {
    const $input = document.createElement('input');
    $input.type = type;
    $input.className = className;
    $input.placeholder = placeholder;
    return $input;
  }

  createTextarea() {
    const $textarea = document.createElement('textarea');
    $textarea.className = 'modal__input modal__textarea';
    $textarea.placeholder = 'Optional description';
    return $textarea;
  }

  createStatusSelect() {
    const $select = document.createElement('select');
    $select.className = 'modal__input';

    STATUSES.forEach((status) => {
      const $option = document.createElement('option');
      $option.value = status;
      $option.textContent = STATUS_LABELS[status];
      $select.appendChild($option);
    });

    return $select;
  }

  createActions() {
    const $actions = document.createElement('div');
    $actions.className = 'modal__actions';
    $actions.appendChild(this.createCancelButton());
    $actions.appendChild(this.createConfirmButton());
    return $actions;
  }

  createCancelButton() {
    const $btn = document.createElement('button');
    $btn.className = 'modal__btn modal__btn--cancel';
    $btn.id = 'MODAL_CANCEL';
    $btn.textContent = 'Cancel';
    return $btn;
  }

  createConfirmButton() {
    const $btn = document.createElement('button');
    $btn.className = 'modal__btn modal__btn--confirm';
    $btn.id = 'MODAL_CONFIRM';
    $btn.textContent = 'Save';
    return $btn;
  }

  attachEventListeners() {
    const $cancel = this.$overlay.querySelector('#MODAL_CANCEL');
    const $confirm = this.$overlay.querySelector('#MODAL_CONFIRM');

    $cancel.addEventListener('click', () => this.close());
    $confirm.addEventListener('click', () => this.handleConfirm());
    this.$overlay.addEventListener('click', (e) => this.handleOverlayClick(e));
    this.$overlay.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleOverlayClick(e) {
    if (e.target === this.$overlay) this.close();
  }

  handleKeydown(e) {
    if (e.key === 'Escape') this.close();
    if (e.key === 'Enter' && e.target !== this.$descInput) {
      e.preventDefault();
      this.handleConfirm();
    }
  }

  handleConfirm() {
    const title = this.$titleInput.value.trim();
    if (!title) return this.$titleInput.focus();

    this.onConfirm({
      title,
      description: this.$descInput.value.trim(),
      status: this.$statusSelect.value,
    });

    this.close();
  }

  open(defaultStatus = 'todo', existingData = null) {
    const isEditing = existingData !== null;
    this.$overlay.querySelector('#MODAL_TITLE').textContent = isEditing ? 'Edit Task' : 'New Task';
    this.$titleInput.value = isEditing ? existingData.title : '';
    this.$descInput.value = isEditing ? existingData.description : '';
    this.$statusSelect.value = isEditing ? existingData.status : defaultStatus;
    this.$overlay.classList.remove('modal-overlay--hidden');
    this.$titleInput.focus();
  }

  close() {
    this.$overlay.classList.add('modal-overlay--hidden');
  }
}