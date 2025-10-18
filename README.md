# backend-work-v2

Descrição
Um backend modularizado organizado por contexts (auth, users, companies, payments, etc.). Este README oferece passos mínimos para rodar o projeto localmente, padrão de variáveis de ambiente e comandos úteis.

Pré-requisitos
- Node.js >= 18
- npm ou pnpm/yarn
- Banco de dados configurado (conforme config/database.ts)

Instalação
1. Clone o repositório
2. Instale dependências:
   - npm install
   - ou pnpm install

Variáveis de ambiente
Crie um arquivo `.env` baseado em `.env.example` (adicione este arquivo ao repositório se desejar). Variáveis importantes:
- NODE_ENV=development
- PORT=3000
- DATABASE_URL=postgres://user:pass@host:port/dbname
- JWT_SECRET=your_jwt_secret
- (outras conforme shared/config/env.ts)

Scripts úteis
- npm run dev        # rodar em modo desenvolvimento (ex.: ts-node / nodemon)
- npm run build      # compilar TypeScript
- npm run start      # rodar build
- npm run lint       # rodar linter
- npm run test       # rodar testes
- npm run typecheck  # rodar checagem de tipos (tsc --noEmit)

Estrutura
- src/contexts — features organizadas por contexto (controller, service, model, routes, schema)
- src/shared — configs, middlewares, utils e tipagens globais
- src/server.ts — inicialização do servidor
- src/routes — roteamento principal

Boas práticas recomendadas
- Usar validação via schemas para todas as rotas (body, params, query)
- Não commitar variáveis sensíveis
- Configurar CI para rodar lint, typecheck e testes antes de merge
- Adicionar cobertura de testes para áreas críticas (auth, pagamentos, criação de dados)

Próximos passos sugeridos
- Adicionar testes automatizados e integrar CI
- Adicionar documentação de API (OpenAPI/Swagger)
- Mapear dependências críticas e adicionar atualização/monitoramento

Contatos
- Mantainer: @ronilson-users# backend-work-v2
