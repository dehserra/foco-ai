const { mkdirSync } = require("node:fs");
const { DatabaseSync } = require("node:sqlite");
const {dirname, join } = require("node:path");
function createTaskStore(
  databasePath = join(__dirname, "..", "data", "foco-ai.db"),
) {
mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'done')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const listTasksStatement = database.prepare(`
    SELECT id, title, status, created_at
    FROM tasks
    ORDER BY id
  `);
  const createTaskStatement = database.prepare(`
    INSERT INTO tasks (title)
    VALUES (?)
  `);
  const findTaskByIdStatement = database.prepare(`
    SELECT id, title, status, created_at
    FROM tasks
    WHERE id = ?
  `);
  const updateTaskStatusStatement = database.prepare(`
    UPDATE tasks
    SET status = ?
    WHERE id = ?
  `);
  function listTasks() {
    return listTasksStatement.all();
  }
  function createTask(title) {
    const result = createTaskStatement.run(title);
    return findTaskByIdStatement.get(result.lastInsertRowid);
  }
  function updateTaskStatus(id, status) {
    const result = updateTaskStatusStatement.run(status, id);
    if (result.changes === 0) {
      return null;
    }
    return findTaskByIdStatement.get(id);
  }
  function close() {
    database.close();
  }
  return { listTasks, createTask, updateTaskStatus, close };
}
module.exports = { createTaskStore };