# SafeLine Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Firebase Hosting](https://img.shields.io/badge/Deploy-Firebase%20Hosting-FFCA28?logo=firebase&logoColor=20232A)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Frontend do **SafeLine**, plataforma de denúncias corporativas destinada ao registro e acompanhamento de denúncias de forma simples, acessível e confidencial.

A aplicação disponibiliza uma área pública para autenticação e registro de denúncias e uma área autenticada para acompanhamento e gerenciamento dos casos, conforme as permissões definidas pelo backend.

> **Importante:** anonimato e confidencialidade dependem também do backend, das políticas da aplicação e da infraestrutura de produção. O frontend, isoladamente, não garante anonimato.

## Visão geral

O SafeLine permite que colaboradores registrem denúncias relacionadas a situações como:

- Assédio.
- Fraude.
- Desvio de conduta.
- Sugestões e melhorias.
- Outras ocorrências.

Após o registro, a denúncia recebe um **protocolo único**, utilizado para acompanhamento do caso.

A aplicação também disponibiliza uma área autenticada para consulta das denúncias e acesso às funcionalidades administrativas autorizadas pelo backend.

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
| GSAP / ScrollTrigger | Animações progressivas nas orientações do colaborador |
| Driver.js | Tour guiado de integração do colaborador |
| Cloudflare Turnstile | Proteção contra automação e bots, com validação no backend |
| Vitest | Execução dos testes automatizados |
| ESLint | Análise estática e padronização do código |
| Firebase Hosting | Hospedagem da aplicação |

## Funcionalidades

### Área pública

- Login com validação de formulário.
- Cadastro de usuários.
- Criação de denúncias.
- Seleção de categoria.
- Validação do Cloudflare Turnstile.
- Tratamento de erros da API.
- Exibição do protocolo após o registro.

### Acompanhamento

- Consulta de denúncias por protocolo.
- Listagem de denúncias vinculadas à sessão autenticada.
- Exibição de protocolo, assunto, status e data de atualização.
- Busca por protocolo ou assunto.

### Área autenticada

- Dashboard protegido por autenticação.
- Controle de acesso conforme permissões definidas pelo backend.
- Envio do token de sessão utilizando `Authorization: Bearer`.
- Logout e remoção da sessão local.

### Área RH

- Dashboard com distribuição real dos casos por status e categoria e evolução mensal quando há períodos suficientes.
- Indicadores limitados aos até 100 casos mais recentes retornados pela API; os números não representam totais históricos.
- Gestão de denúncias em modo de consulta, com busca e filtros por status, categoria e prioridade.
- Detalhes operacionais com contexto do relato, classificação, status, atribuições, anexos e histórico de alterações de status.
- Comunicação centralizada na rota `/rh/mensagens`; a tabela de gestão não oferece um segundo atalho para o chat.
- Orientações específicas para o trabalho do RH em `/orientacoes`.

## Estrutura do projeto

```text
src/
├── components/
│   ├── common/             # Componentes reutilizáveis
│   └── ...
├── pages/
│   ├── Auth/               # Login, cadastro e layout de autenticação
│   └── Cases/              # Criação e acompanhamento de denúncias
├── services/
│   └── api.ts              # Cliente HTTP e comunicação com a API
├── types/                  # Tipagens e contratos da aplicação
├── App.tsx                 # Configuração das rotas
└── index.css               # Estilos e tokens globais
```

## Configuração local

Requisitos: Node.js e npm.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e configure os valores locais. No PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   | Variável | Descrição |
   | --- | --- |
   | `VITE_API_URL` | URL base da API SafeLine |
   | `VITE_TURNSTILE_SITE_KEY` | Chave pública do widget Cloudflare Turnstile |

   Arquivos `.env` locais são ignorados pelo Git. Mantenha `.env.example` atualizado apenas com nomes de variáveis e valores fictícios. Variáveis com prefixo `VITE_` são incluídas no bundle do navegador; não coloque segredos, tokens privados ou credenciais nelas.

3. Inicie a aplicação:

   ```bash
   npm run dev
   ```

   O servidor local do Vite sempre usa a API de desenvolvimento em `http://localhost:5016`, mesmo que `VITE_API_URL` esteja configurada para outro ambiente. Para usar a API de produção, a aplicação precisa ser executada em um build de produção com `VITE_API_URL` configurada.

## Scripts

```bash
npm run dev      # Servidor local com HMR
npm run build    # Verificação TypeScript e build de produção
npm run lint     # Análise estática com ESLint
npm run test     # Testes automatizados com Vitest
npm run preview  # Pré-visualização do build local

```