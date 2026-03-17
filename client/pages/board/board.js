import { StorageService } from '../../services/storage-service.js';
import { BoardDOM } from './board-dom.js';
import { BoardEvents } from './board-events.js';

const storage = new StorageService();
const boardDOM = new BoardDOM();
const boardEvents = new BoardEvents(boardDOM, storage);

boardEvents.init();