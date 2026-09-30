# Registro de aprendizado 0001: API de tarefas e fluxo Git

## Contexto

O projeto FocoAI concluiu a Aula 3 com SQLite versionado no commit `58ed8aa`. A documentação da Aula 4 foi versionada no commit `23402d1`.

## O que foi demonstrado

- `GET /tasks` devolveu uma lista JSON com `200 OK`.
- `POST /tasks` criou uma tarefa com `201 Created`.
- `PATCH /tasks/:id` atualizou o status com `200 OK`.
- Validação sem título respondeu `400`; tarefa inexistente respondeu `404`; título repetido respondeu `409`.
- O banco local `data/foco-ai.db` continua ignorado pelo Git.

## Estado atual do código

- `src/database.js` foi refatorado para exportar a fábrica `createTaskStore`, que permite usar um banco temporário em testes e expõe `listTasks`, `createTask`, `updateTaskStatus` e `close`.
- `src/server.js` ainda importa as funções antigas diretamente e, portanto, está temporariamente incompatível com o novo módulo do banco.
- A próxima alteração deve adaptar `src/server.js` para criar o store padrão apenas ao executar a aplicação e permitir injeção de um store isolado nos testes.
- Não há commit da feature da Aula 4; o diretório de trabalho contém alterações intencionais em `src/database.js`, `src/server.js` e `NOTES.md`.

## Estratégia pedagógica para a retomada

Priorizar o modelo visual do Git no VS Code antes de novos blocos grandes de JavaScript: Changes → Stage → Commit → Push. Usar a comparação de arquivos do painel Source Control para relacionar cada alteração ao próximo commit. Explicar o objetivo de cada mudança antes de pedir que o usuário copie código.

## Retomada: revalidação manual

- O aluno adaptou `src/server.js` para criar o store e usar seus métodos.
- No PowerShell do VS Code, confirmou `GET /tasks` com `200`, `POST /tasks` com `201` e `PATCH /tasks/3` com `200`.
- Também confirmou os contratos de falha: título ausente `400`, tarefa `9999` inexistente `404` e título repetido `409`.
- No PowerShell, `curl` é apelido de `Invoke-WebRequest`; para JSON, usar `Invoke-WebRequest -UseBasicParsing` evita tanto ambiguidade do alias quanto aviso de análise de scripts. Respostas 4xx aparecem como exceções do cliente, mas confirmam o status esperado.

## Próxima evidência

O aluno refatorou o servidor para testes com SQLite temporário, criou `test/server.test.js` e atualizou `npm test`. Evidência: `node --test` terminou com 1 teste aprovado e 0 falhas. Próximo passo: revisar as mudanças no Source Control e só então criar o commit da feature.
