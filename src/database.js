const { mkdirSync } = require("node:fs");
const { DatabaseSync } = require("node:sqlite");

mkdirSync("data", { recursive: true });

const database = new DatabaseSync("data/foco-ai.db");

database.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'done')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const addTask = database.prepare(`
  INSERT OR IGNORE INTO tasks (title, status)
  VALUES (?, ?)
`);

addTask.run("Criar a primeira tela do FocoAI", "pending");

const tasks = database.prepare(`
  SELECT id, title, status, created_at
  FROM tasks
  ORDER BY id
`).all();

console.table(tasks);
database.close();
