// Task CRUD — upsert and soft delete against PostgreSQL
import { query } from '../db/db.js';

export async function getTasksByUser(userId) {
    const result = await query('SELECT * FROM tasks WHERE user_id = $1 AND is_deleted = false', [userId]);
    return result.rows;    
}

export async function upsertTask(task, userID) {
    const { id, title, description, status, is_deleted, updated_at } = task;
    const result = await query(`
        INSERT INTO tasks (id, user_id, title, description, status, is_deleted, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) 
        DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            is_deleted = EXCLUDED.is_deleted,
            updated_at = EXCLUDED.updated_at
        WHERE tasks.updated_at < EXCLUDED.updated_at
        RETURNING *;`,
        [id, userID, title, description, status, is_deleted, updated_at]);
    return result.rows[0];
}
export async function softDeleteTask(taskId, userId) {
    const result = await query(`
        UPDATE tasks 
        SET is_deleted = true, updated_at = NOW() 
        WHERE id = $1 AND user_id = $2 AND is_deleted = false
        RETURNING *;`,
        [taskId, userId]);
    return result.rows[0];
}

export async function processBatch(tasks, userId) {
    const results = [];
    for (const task of tasks) {
        if (task.is_deleted) {
      const deleted = await softDeleteTask(task.id, userId);
      if (deleted) results.push(deleted);
    } else {
      const upserted = await upsertTask(task, userId);
      if (upserted) results.push(upserted);
    }
  }
  return results;
}