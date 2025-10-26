🧩 2. Exemplo de create (api/users/register)

curl -X POST http://localhost:3001/api/users/register \
 -H "Content-Type: application/json" \
 -d '{
"name": "Roni Developer",
"email": "roni@example.com",
"password": "123456",
"role": "worker"
}' | jq

📤 Resposta esperada (201):

{
"success": true,
"message": "Usuário criado com sucesso",
"data": {
"id": "68fbefc44a1d0677fa996013",
"name": "Roni Developer",
"email": "roni@example.com",
"role": "worker"
}
}

---

🧩 2. Exemplo de login (api/auth/login)

curl -X POST http://localhost:3001/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "roni@example.com",
"password": "123456"
}' | jq

📤 Resposta esperada (200):

{
"success": true,
"message": "Login realizado com sucesso",
"data": {
"user": {
"id": "68fbefc44a1d0677fa996013",
"name": "Roni Developer",
"email": "roni@example.com",
"role": "worker",
"profile": {
"address": {
"country": "Brasil"
},
"hourlyRate": {
"currency": "BRL"
},
"skills": [],
"rating": 0,
"totalJobs": 0,
"isEmailVerified": false,
"isPhoneVerified": false
}
},
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmJlZmM0NGExZDA2NzdmYTk5NjAxMyIsImVtYWlsIjoicm9uaUBleGFtcGxlLmNvbSIsInJvbGUiOiJ3b3JrZXIiLCJpYXQiOjE3NjEzNDE0MjcsImV4cCI6MTc2MTk0NjIyN30.B3PwsqNZOEt3eBr4RzCcRU4GVVHRO4f9QsIU9wzBm-Q"
}
}

---

🧩 3. Testar rota autenticada (api/users/profile)

Depois do login, pegue o token JWT e use assim:

curl -X GET http://localhost:3001/api/users/profile \
 -H "Authorization: Bearer "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmJlZmM0NGExZDA2NzdmYTk5NjAxMyIsImVtYWlsIjoicm9uaUBleGFtcGxlLmNvbSIsInJvbGUiOiJ3b3JrZXIiLCJpYXQiOjE3NjEzNDE0MjcsImV4cCI6MTc2MTk0NjIyN30.B3PwsqNZOEt3eBr4RzCcRU4GVVHRO4f9QsIU9wzBm-Q"

📤 Resposta esperada (200):

{
"success":true,
"data":{"id":"68fbefc44a1d0677fa996013",
"name":"Roni Developer",
"email":"roni@example.com",
"role":"worker",
"profile":{
"address":{
"country":"Brasil"
},
"hourlyRate":{
"currency":"BRL"
},
"skills":[],
"rating":0,
"totalJobs":0,
"isEmailVerified":false,
"isPhoneVerified":false},
"isActive":true}
}%

---

🧩 4. Registro de empresa (company)

Mesmo endpoint api/users/register, apenas mudando o role:

curl -X POST http://localhost:3001/api/users/register \
 -H "Content-Type: application/json" \
 -d '{
"name": "Tecnutri LTDA",
"email": "contato@tecnutri.com",
"password": "empresa123",
"role": "company"
}' | jq

📤 Resposta esperada (200):

{
"success": true,
"message": "Usuário criado com sucesso",
"data": {
"id": "68fbf0754a1d0677fa996018",
"name": "Tecnutri LTDA",
"email": "contato@tecnutri.com",
"role": "company"
}
}

---

curl -X POST http://localhost:3001/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "contato@tecnutri.com",
"password": "empresa123"
}' | jq

📤 Resposta esperada (200):  
{
"success": true,
"message": "Login realizado com sucesso",
"data": {
"user": {
"id": "68fbf0754a1d0677fa996018",
"name": "Tecnutri LTDA",
"email": "contato@tecnutri.com",
"role": "company",
"profile": {
"address": {
"country": "Brasil"
},
"hourlyRate": {
"currency": "BRL"
},
"skills": [],
"rating": 0,
"totalJobs": 0,
"isEmailVerified": false,
"isPhoneVerified": false,
"companyName": "Tecnutri LTDA"
}
},
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmJmMDc1NGExZDA2NzdmYTk5NjAxOCIsImVtYWlsIjoiY29udGF0b0B0ZWNudXRyaS5jb20iLCJyb2xlIjoiY29tcGFueSIsImlhdCI6MTc2MTM0MTY4NSwiZXhwIjoxNzYxOTQ2NDg1fQ.\_o04u7k3ZWf8wF0XlmFbCmWLY_MgDiicRpn8gX_EYbM"
}
}

✅ Resumo do teste

Tipo de conta Endpoint Resultado Observações

Worker POST /api/users/register
✅ 201 Created Usuário salvo com sucesso
Worker POST /api/auth/login
✅ 200 OK Token JWT válido
Worker GET /api/users/profile
✅ 200 OK Perfil retornado corretamente
Company POST /api/users/register
✅ 201 Created Empresa salva com sucesso
Company POST /api/auth/login
✅ 200 OK Token JWT válido, com companyName no profile





🧠 1. Estrutura Geral

Etapa	Rota	Método	Autenticação	Ação

1️⃣	/jobs	POST	✅	Criar vaga
2️⃣	/jobs	GET	❌	Listar vagas (pública)
3️⃣	/jobs/:id	GET	❌	Ver vaga por ID
4️⃣	/jobs/:id	PUT	✅	Atualizar vaga
5️⃣	/jobs/:id/apply	POST	✅	Candidatar-se (worker)
6️⃣	/jobs/company/my	GET	✅	Listar vagas criadas pela empresa
7️⃣	/jobs/:id/select-worker	PATCH	✅	Selecionar um worker
8️⃣	/jobs/:id/cancel	PATCH	✅	Cancelar vaga

🟢 1. Criar vaga (empresa)

curl -X POST http://localhost:3001/api/jobs \ -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmJmMDc1NGExZDA2NzdmYTk5NjAxOCIsImVtYWlsIjoiY29udGF0b0B0ZWNudXRyaS5jb20iLCJyb2xlIjoiY29tcGFueSIsImlhdCI6MTc2MTM0MTY4NSwiZXhwIjoxNzYxOTQ2NDg1fQ.\_o04u7k3ZWf8wF0XlmFbCmWLY_MgDiicRpn8gX_EYbM" \ -H "Content-Type: application/json" \
 -d '{
"title": "Motorista de Entrega", 
"description": "Responsável por realizar entregas em pontos comerciais.", 
"location": "São Paulo - SP",
"requiredSkills": ["CNH B", "Pontualidade", "Comunicação"], 
"budget": { "min": 150, "max": 250, 
"type": "daily", "currency": "BRL" }, "duration": "5 dias",
"dates": {
"start": "2025-10-25T08:00:00Z",
"end": "2025-10-30T17:00:00Z"
},
"workType": "multi_location_route",
"locations": [
{
"sequence": 1,
"name": "Supermercado BomPreço",
"address": "Rua das Flores, 120 - São Paulo",
"type": "supermarket"
},
{
"sequence": 2,
"name": "Loja PontoCerto",
"address": "Av. Paulista, 3000 - São Paulo",
"type": "store"
}
]
}' | jq

📤 Resposta esperada (200): 

{
"message": "Job created successfully",
"job": {
"title": "Motorista de Entrega",
"description": "Responsável por realizar entregas em pontos comerciais.",
"company": "68fbf0754a1d0677fa996018",
"location": "São Paulo - SP",
"requiredSkills": [
"CNH B",
"Pontualidade",
"Comunicação"
],
"budget": {
"min": 150,
"max": 250,
"type": "daily",
"currency": "BRL"
},
"duration": "5 dias",
"status": "open",
"dates": {
"start": "2025-10-25T08:00:00.000Z",
"end": "2025-10-30T17:00:00.000Z"
},
"applicants": [],
"workType": "multi_location_route",
"locations": [
{
"sequence": 1,
"name": "Supermercado BomPreço",
"address": "Rua das Flores, 120 - São Paulo",
"type": "supermarket"
},
{
"sequence": 2,
"name": "Loja PontoCerto",
"address": "Av. Paulista, 3000 - São Paulo",
"type": "store"
}
],
"routeConfig": {
"maxLocationsPerDay": 5,
"allowLocationReplacement": true,
"requirePhotoEachLocation": true,
"travelTimeBetweenLocations": 30
},
"createdAt": "2025-10-24T22:31:11.196Z",
"updatedAt": "2025-10-24T22:31:11.196Z",
"id": "68fbfe2f373721ae990cf500"
}
}

-------------------

🟡 2. Listar todas as vagas (público)

curl -X GET "http://localhost:3001/api/jobs?page=1&limit=10"
 
📤 Resposta esperada (200): 
  
{
  "jobs": [
    {
      "budget": {
        "min": 150,
        "max": 250,
        "type": "daily",
        "currency": "BRL"
      },
      "dates": {
        "start": "2025-10-25T08:00:00.000Z",
        "end": "2025-10-30T17:00:00.000Z"
      },
      "routeConfig": {
        "maxLocationsPerDay": 5,
        "allowLocationReplacement": true,
        "requirePhotoEachLocation": true,
        "travelTimeBetweenLocations": 30
      },
      "title": "Motorista de Entrega",
      "description": "Responsável por realizar entregas em pontos comerciais.",
      "company": {
        "name": "Tecnutri LTDA",
        "profile": {
          "rating": 0,
          "companyName": "Tecnutri LTDA"
        },
        "id": "68fbf0754a1d0677fa996018"
      },
      "location": "São Paulo - SP",
      "requiredSkills": [
        "CNH B",
        "Pontualidade",
        "Comunicação"
      ],
      "duration": "5 dias",
      "status": "open",
      "applicants": [],
      "workType": "multi_location_route",
      "locations": [
        {
          "sequence": 1,
          "name": "Supermercado BomPreço",
          "address": "Rua das Flores, 120 - São Paulo",
          "type": "supermarket"
        },
        {
          "sequence": 2,
          "name": "Loja PontoCerto",
          "address": "Av. Paulista, 3000 - São Paulo",
          "type": "store"
        }
      ],
      "createdAt": "2025-10-24T22:31:11.196Z",
      "updatedAt": "2025-10-24T22:31:11.196Z",
      "id": "68fbfe2f373721ae990cf500"
    }
  ],
  "total": 1
}

🔵 3. Ver detalhes de uma vaga

curl -X GET http://localhost:3000/api/jobs/<JOB_ID>

(Substitua <JOB_ID> pelo ID retornado na criação da vaga.)

---

🟣 4. Worker se candidata à vaga

curl -X POST http://localhost:3000/api/jobs/<JOB_ID>/apply \
  -H "Authorization: Bearer $WORKER_TOKEN"


---

🟠 5. Empresa visualiza suas vagas

curl -X GET http://localhost:3000/api/jobs/company/my \
  -H "Authorization: Bearer $COMPANY_TOKEN"

---

🔴 6. Empresa seleciona um candidato

curl -X PATCH http://localhost:3000/api/jobs/<JOB_ID>/select-worker \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workerId": "68fbefc44a1d0677fa996013"
  }'


---

⚫ 7. Cancelamento (empresa ou worker)

curl -X PATCH http://localhost:3000/api/jobs/<JOB_ID>/cancel \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "initiatedBy": "company",
    "reason": "Cliente cancelou rota de entregas."
  }'

Ou, caso o worker cancele:

curl -X PATCH http://localhost:3000/api/jobs/<JOB_ID>/cancel \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "initiatedBy": "worker",
    "reason": "Não poderei comparecer por motivos pessoais."
  }'


---
