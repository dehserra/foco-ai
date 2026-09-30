const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const test = require("node:test");
const { createTaskStore } = require("../src/database");
const { createServer } = require("../src/server");

async function request(server, path, options = {}) {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}${path}`, options);

  return {
    status: response.status,
    body: await response.json(),
  };
}

test("API cria, lista e conclui tarefas", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "foco-ai-test-"));
  const store = createTaskStore(join(directory, "foco-ai-test.db"));
  const server = createServer(store);

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
    rmSync(directory, { recursive: true, force: true });
  });

  const initial = await request(server, "/tasks");
  assert.equal(initial.status, 200);
  assert.deepEqual(initial.body, { tasks: [] });

  const created = await request(server, "/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Testar API automaticamente" }),
  });
  assert.equal(created.status, 201);

  const updated = await request(server, `/tasks/${created.body.task.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "done" }),
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.task.status, "done");

  const missingTitle = await request(server, "/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(missingTitle.status, 400);

  const missingTask = await request(server, "/tasks/9999", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "done" }),
  });
  assert.equal(missingTask.status, 404);

  const duplicate = await request(server, "/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Testar API automaticamente" }),
  });
  assert.equal(duplicate.status, 409);
});