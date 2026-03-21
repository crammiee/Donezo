import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initSocket } from './services/socket-service.js';
import { startCronJobs } from './services/cron-service.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

startCronJobs();