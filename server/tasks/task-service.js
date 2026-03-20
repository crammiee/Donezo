// Task CRUD — upsert and soft delete against PostgreSQL
import { query } from '../db/db.js';

export async function getTasksByUser(userId) {
    const result = await query('SELECT * FROM tasks WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    return result.rows;    
}

export async function upsertTask(task, userId) {
    const { id, title, description, status, position, due_date, tags, updated_at } = task;
    const result = await query(`
        INSERT INTO tasks (id, user_id, title, description, status, position, due_date, tags, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id)
        DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            position = EXCLUDED.position,
            due_date = EXCLUDED.due_date,
            tags = EXCLUDED.tags,
            updated_at = EXCLUDED.updated_at
        WHERE tasks.updated_at < EXCLUDED.updated_at
        RETURNING *;`,
        [id, userId, title, description, status, position ?? 0, due_date || null, tags || [], updated_at]);
    return result.rows[0];
}

export async function softDeleteTask(taskId, userId) {
    const result = await query(`
        UPDATE tasks 
        SET deleted_at = NOW(), updated_at = NOW() 
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
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