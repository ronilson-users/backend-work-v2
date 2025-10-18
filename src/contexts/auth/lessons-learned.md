🧱 Visão geral do módulo auth

📂 src/contexts/auth/

Arquivo	Responsabilidade

auth.controller.ts	Recebe as requisições (login, register, refresh, logout)
auth.service.ts	Contém a lógica de autenticação e geração de tokens
auth.model.ts	(Opcional) — logs ou tokens persistentes (refresh tokens, etc.)
auth.schema.ts	Validação com Zod
auth.routes.ts	Define as rotas Express e middlewares
