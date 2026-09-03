# SafeLine Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Firebase Hosting](https://img.shields.io/badge/Deploy-Firebase%20Hosting-FFCA28?logo=firebase&logoColor=20232A)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Frontend do **SafeLine**, plataforma de denúncias corporativas destinada ao registro e acompanhamento de manifestações de forma simples, acessível e confidencial.

A aplicação disponibiliza uma área pública para autenticação e registro de manifestações e uma área autenticada para acompanhamento e gerenciamento dos casos, conforme as permissões definidas pelo backend.

> **Importante:** anonimato e confidencialidade dependem também do backend, das políticas da aplicação e da infraestrutura de produção. O frontend, isoladamente, não garante anonimato.

## Visão geral

O SafeLine permite que colaboradores registrem manifestações relacionadas a situações como:

- Assédio.
- Fraude.
- Desvio de conduta.
- Sugestões e melhorias.
- Outras ocorrências.

Após o registro, a manifestação recebe um **protocolo único**, utilizado para acompanhamento do caso.

A aplicação também disponibiliza uma área autenticada para consulta das manifestações e acesso às funcionalidades administrativas autorizadas pelo backend.

## Stack

| Tecnologia | Utilização |
| --- | --- |
| React 19 | Construção da interface |
| React DOM | Renderização da aplicação |
| Vite 8 | Desenvolvimento, HMR e build |
| TypeScript 6 | Tipagem estática |
| React Router 7 | Navegação e roteamento SPA |
| CSS | Estilos, temas e layout responsivo |
| Lucide React | Ícones da interface |
| Cloudflare Turnstile | Proteção contra automação e bots |
| Firebase Hosting | Hospedagem da aplicação |

## Funcionalidades

### Área pública

- Login com validação de formulário.
- Cadastro de usuários.
- Criação de manifestações.
- Seleção de categoria.
- Validação do Cloudflare Turnstile.
- Tratamento de erros da API.
- Exibição do protocolo após o registro.

### Acompanhamento

- Consulta de manifestações por protocolo.
- Listagem de manifestações vinculadas à sessão autenticada.
- Exibição de protocolo, assunto, status e data de atualização.
- Busca por protocolo ou assunto.

### Área autenticada

- Dashboard protegido por autenticação.
- Controle de acesso conforme permissões definidas pelo backend.
- Envio do token de sessão utilizando `Authorization: Bearer`.
- Logout e remoção da sessão local.

## Estrutura do projeto

```text
src/
├── components/
│   ├── common/             # Componentes reutilizáveis
│   └── ...
├── pages/
│   ├── Auth/               # Login, cadastro e layout de autenticação
│   └── Cases/              # Criação e acompanhamento de manifestações
├── services/
│   └── api.ts              # Cliente HTTP e comunicação com a API
├── types/                  # Tipagens e contratos da aplicação
├── App.tsx                 # Configuração das rotas
└── index.css               # Estilos e tokens globais