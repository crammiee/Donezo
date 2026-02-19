const COLUMN_CONFIG = {
  todo:  { label: 'To Do', elementId: 'COL_TODO' },
  doing: { label: 'Doing', elementId: 'COL_DOING' },
  done:  { label: 'Done',  elementId: 'COL_DONE' },
};

export class Column {
  constructor(status) {
    this.status = status;
    this.label = COLUMN_CONFIG[status].label;
    this.elementId = COLUMN_CONFIG[status].elementId;
  }

  get $element() {
    return document.getElementById(this.elementId);
  }
}