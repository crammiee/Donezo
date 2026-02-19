import { createBoard } from './board-dom.js';
import { initBoard } from './board-events.js';

const $app = document.getElementById('APP');
$app.appendChild(createBoard());
initBoard();