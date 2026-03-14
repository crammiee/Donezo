import cron from 'node-cron';
import { query } from './db/db.js';

export function startCronJobs() {
  // Runs daily at midnight
  // For demo: change to '*/10 * * * * *' (every 10 sec), then revert
  cron.schedule('0 0 * * *', cleanDeletedTasks)
  console.log('Cron jobs started.');
}

async function cleanDeletedTasks() {
  try {
    const result = await query(
      `DELETE FROM tasks
       WHERE is_deleted = TRUE
       AND updated_at < NOW() - INTERVAL '30 days'`
    );
    console.log(`[Cron] Purged ${result.rowCount} soft-deleted task(s).`);
  } catch (err) {
    console.error('[Cron] Error purging tasks:', err);
  }
} 