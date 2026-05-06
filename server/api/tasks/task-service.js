import { query } from '../../db/db.js';

export async function getTasksByUser(userId) {
    const result = await query('SELECT * FROM tasks WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    return result.rows;
}

export async function insertNewTask(task, userId) {
    const { title, description, status, position, due_date, tags, updated_at } = task;
    const result = await query(`
        INSERT INTO tasks (user_id, title, description, status, position, due_date, tags, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;`,
        [userId, title, description, status, position ?? 0, due_date || null, tags || [], updated_at]);
    return result.rows[0];
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

export async function getTasksSince(userId, since) {
    const result = await query(
        'SELECT * FROM tasks WHERE user_id = $1 AND updated_at > $2',
        [userId, since]
    );
    return result.rows;
}

const TASK_LIMIT = 100;

async function countActiveTasks(userId) {
    const result = await query(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND deleted_at IS NULL',
        [userId]
    );
    return parseInt(result.rows[0].count, 10);
}

function isTempId(id) {
    return typeof id === 'string' && id.startsWith('temp_');
}

export async function processBatch(tasks, userId) {
    const results = [];
    const idMappings = [];

    const newCount = tasks.filter(t => isTempId(t.id) && !t.is_deleted).length;
    if (newCount > 0) {
        const current = await countActiveTasks(userId);
        if (current + newCount > TASK_LIMIT) {
            const err = new Error(`Task limit reached. Maximum ${TASK_LIMIT} tasks per account.`);
            err.code = 'TASK_LIMIT_REACHED';
            throw err;
        }
    }

    for (const task of tasks) {
        if (task.is_deleted) {
            if (!isTempId(task.id)) {
                const deleted = await softDeleteTask(task.id, userId);
                if (deleted) results.push(deleted);
            }
        } else if (isTempId(task.id)) {
            const created = await insertNewTask(task, userId);
            if (created) {
                results.push(created);
                idMappings.push({ tempId: task.id, realId: created.id });
            }
        } else {
            const upserted = await upsertTask(task, userId);
            if (upserted) results.push(upserted);
        }
    }

    return { tasks: results, idMappings };
}
