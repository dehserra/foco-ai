const http = require("node:http");
const { createTaskStore } = require("./database");


function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
  });
}

function createServer(store = createTaskStore()) {
  return http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && request.url === "/tasks") {
      sendJson(response, 200, { tasks: store.listTasks() });
      return;
    }

    if (request.method === "POST" && request.url === "/tasks") {
      const { title } = await readJsonBody(request);

      if (typeof title !== "string" || title.trim() === "") {
        sendJson(response, 400, { error: "title é obrigatório" });
        return;
      }

      const task = store.createTask(title.trim());
      sendJson(response, 201, { task });
      return;
    }

    const taskRoute = request.url.match(/^\/tasks\/(\d+)$/);

    if (request.method === "PATCH" && taskRoute) {
      const { status } = await readJsonBody(request);
      const id = Number(taskRoute[1]);

      if (status !== "pending" && status !== "done") {
        sendJson(response, 400, { error: "status deve ser pending ou done" });
        return;
      }

      const task = store.updateTaskStatus(id, status);

      if (!task) {
        sendJson(response, 404, { error: "Tarefa não encontrada" });
        return;
      }

      sendJson(response, 200, { task });
      return;
    }

    sendJson(response, 404, { error: "Rota não encontrada" });
  } catch (error) {
    if (error.message === "JSON inválido") {
      sendJson(response, 400, { error: error.message });
      return;
    }

    if (
      error.code === "ERR_SQLITE_ERROR" &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      sendJson(response, 409, { error: "Já existe uma tarefa com esse título" });
      return;
    }

    console.error(error);
    sendJson(response, 500, { error: "Erro interno" });
  }
  });
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = createServer();

  server.listen(PORT, () => {
    console.log(`FocoAI disponível em http://localhost:${PORT}`);
  });
}

module.exports = { createServer };
