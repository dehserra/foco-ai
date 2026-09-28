const http = require("node:http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ error: "Rota não encontrada" }));
});

server.listen(PORT, () => {
  console.log(`FocoAI disponível em http://localhost:${PORT}`);
});