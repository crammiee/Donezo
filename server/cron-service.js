import cron from 'node-cron';
import { query } from './db/db.js';

export function startCronJobs() {
  cron.schedule('0 0 * * *', cleanDeletedTasks);
  console.log('Cron jobs started.');
}

async function cleanDeletedTasks() {
  try {
    const result = await query(
      `DELETE FROM tasks
       WHERE deleted_at IS NOT NULL
       AND deleted_at < NOW() - INTERVAL '30 days'`
    );
    if (result.rowCount > 0) {
      console.log(`[Cron] Purged ${result.rowCount} soft-deleted task(s).`);
    }
  } catch (err) {
    console.error('[Cron] Error purging tasks:', err);
  }
}