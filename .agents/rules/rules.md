---
trigger: always_on
---

---

# AI Development Rules — Frontend

Este arquivo define as regras obrigatórias para qualquer IA que analise, projete, modifique, refatore, teste ou gere código neste repositório.

Estas regras têm como objetivo preservar **qualidade, segurança, consistência arquitetural, acessibilidade, usabilidade, manutenibilidade e previsibilidade**.

As regras devem ser seguidas em todas as tarefas de desenvolvimento.

---

# 1. Princípios Fundamentais

A IA deve seguir, nesta ordem de prioridade:

1. **Segurança**
2. **Correção funcional**
3. **Integridade dos dados**
4. **Acessibilidade**
5. **Manutenibilidade**
6. **Consistência arquitetural**
7. **Performance**
8. **Experiência do usuário**
9. **Estética**

Quando houver conflito entre requisitos, priorize os itens de maior precedência.

Nunca sacrifique segurança, correção ou acessibilidade apenas para obter uma implementação mais rápida ou visualmente mais atraente.

---

# 2. Comunicação

- Seja objetivo, técnico e profissional.
- Não utilize linguagem informal, emojis ou conteúdo motivacional.
- Evite explicações que não contribuam para a tarefa.
- Não repita informações desnecessariamente.
- Não oculte problemas encontrados.
- Não apresente hipóteses como fatos.
- Não declare uma tarefa como concluída antes da implementação e validação.

Ao relatar alterações, utilize:

- **Onde:** arquivo, componente, hook, service, página ou módulo.
- **O que:** alteração realizada.
- **Por que:** justificativa técnica.
- **Validação:** verificações realizadas.
- **Pendências:** somente quando existirem.

---

# 3. Análise Obrigatória Antes da Implementação

Antes de modificar qualquer código:

1. Analise a estrutura do projeto.
2. Localize os arquivos relacionados à tarefa.
3. Entenda a implementação existente.
4. Identifique componentes, hooks, services, tipos e utilitários reutilizáveis.
5. Identifique dependências entre os módulos afetados.
6. Verifique padrões já utilizados no projeto.
7. Verifique se já existe solução para o problema solicitado.
8. Avalie possíveis impactos e regressões.

Não implemente diretamente com base apenas na descrição da tarefa quando o código existente puder fornecer informações relevantes.

### Regra de reutilização

Antes de criar:

- componente;
- hook;
- service;
- função;
- tipo;
- utilitário;
- constante;
- estilo;

verifique se já existe uma implementação reutilizável.

**Duplicação de responsabilidade é proibida quando uma solução existente puder ser reutilizada adequadamente.**

---

# 4. Escopo

- Modifique somente o necessário para atender ao requisito.
- Não faça refatorações não relacionadas à tarefa.
- Não altere comportamento existente fora do escopo.
- Não reorganize arquivos apenas por preferência pessoal.
- Não substitua tecnologias ou padrões existentes sem necessidade técnica.
- Não remova funcionalidades sem solicitação ou justificativa.
- Não introduza comportamento novo sem relação com o requisito.
- Não transforme uma tarefa simples em uma refatoração arquitetural ampla.

Toda alteração deve possuir uma relação clara com o objetivo da tarefa.

---

# 5. Incerteza e Suposições

A IA **não deve inventar informações**.

É proibido inventar:

- APIs.
- Endpoints.
- Métodos.
- Propriedades.
- Tipos.
- Respostas de API.
- Bibliotecas.
- Configurações.
- Regras de negócio.
- Dados.
- Comportamentos.

Quando uma informação puder ser descoberta pelo código existente, investigue antes de perguntar.

Quando uma informação essencial não puder ser determinada:

1. Não invente.
2. Identifique explicitamente a lacuna.
3. Solicite esclarecimento quando necessário.

Quando houver comportamento dependente de versão de framework, biblioteca ou ferramenta, utilize a documentação oficial correspondente quando necessário.

---

# 6. Simplicidade e Complexidade

Priorize:

- KISS.
- DRY.
- YAGNI.
- Separation of Concerns.
- Single Responsibility.
- Composition over Inheritance.

### Regra principal

**A solução mais simples que atende corretamente ao requisito deve ser preferida.**

Não:

- crie abstrações prematuras;
- crie camadas sem necessidade;
- crie factories sem necessidade;
- crie wrappers sem necessidade;
- crie managers genéricos sem necessidade;
- crie hooks para lógica que não precisa ser reutilizada;
- introduza padrões arquiteturais apenas por formalidade.

SOLID deve ser utilizado quando trouxer benefício real, não como justificativa para overengineering.

---

# 7. Arquitetura Frontend

Respeite a arquitetura existente.

Quando aplicável, mantenha separadas:

- Pages.
- Components.
- Hooks.
- Services.
- Types.
- Utils.
- Configuration.
- State.

### Responsabilidades

**Pages**

- Composição de telas.
- Organização do fluxo da página.

**Components**

- Apresentação.
- Interação.
- Composição de interface.

**Hooks**

- Lógica reutilizável relacionada ao React.
- Estado e comportamento de apresentação.

**Services**

- Comunicação com APIs.
- Integrações externas.
- Operações de infraestrutura.

**Types**

- Contratos e modelos compartilhados.

**Utils**

- Funções puras e reutilizáveis.

Não misture:

- chamadas HTTP;
- regras complexas;
- transformação de dados;
- estado;
- apresentação;

em um único componente quando houver separação apropriada.

Não introduza novas camadas arquiteturais sem justificativa técnica.

---

# 8. React

- Utilize componentes funcionais.
- Utilize Hooks conforme as regras do React.
- Evite componentes monolíticos.
- Mantenha componentes com responsabilidade única sempre que possível.
- Prefira composição.
- Utilize estado local por padrão.
- Eleve estado somente quando necessário.
- Evite estado global sem justificativa.
- Não introduza biblioteca de gerenciamento de estado sem necessidade real.
- Evite múltiplas fontes de verdade.
- Não armazene dados derivados no estado quando puderem ser calculados.
- Evite `useEffect` desnecessário.
- Não utilize `useEffect` para lógica que possa ocorrer diretamente na renderização ou em eventos.
- Não utilize `useMemo`, `useCallback` ou `React.memo` indiscriminadamente.
- Não utilize refs para substituir estado sem justificativa.
- Evite manipulação direta do DOM.
- Não realize chamadas HTTP diretamente dentro de componentes quando houver `services` ou hooks apropriados.

---

# 9. TypeScript

Type safety é obrigatória.

- Utilize TypeScript em modo estrito.
- Evite `any`.
- **Nunca utilize `any` apenas para fazer um erro desaparecer.**
- Quando o tipo for desconhecido, utilize `unknown`.
- Transforme `unknown` em tipos confiáveis por meio de:
  - type guards;
  - validações;
  - schemas;
  - narrowing;
  - discriminated unions;
  - generics quando apropriado.

### Proibido como workaround

```ts
any
as any
@ts-ignore
@ts-nocheck
```

`@ts-expect-error` somente quando houver justificativa técnica clara.

Evite:

- type assertions desnecessárias;
- non-null assertions (`!`);
- tipos excessivamente genéricos;
- duplicação de tipos.

Trate corretamente:

```text
null
undefined
unknown
optional properties
union types
```

Prefira representar corretamente o domínio da aplicação através do sistema de tipos.

**O compilador deve ajudar a encontrar problemas, não ser silenciado para escondê-los.**

---

# 10. Dados Externos e APIs

Toda informação externa deve ser considerada **não confiável até ser validada**.

Trate adequadamente:

- respostas inválidas;
- campos ausentes;
- tipos inesperados;
- erros HTTP;
- timeout;
- falhas de rede;
- respostas parcialmente preenchidas.

Não acople a UI diretamente ao formato bruto da API quando uma camada de transformação for apropriada.

Fluxo preferencial:

```text
API
 ↓
Service
 ↓
Validation / Mapping
 ↓
Application Model
 ↓
Hook / State
 ↓
Component
 ↓
UI
```

Não invente contratos de API.

Não assuma que uma resposta sempre possuirá os dados esperados.

---

# 11. Segurança

Nunca:

- exponha secrets;
- versione credenciais;
- coloque tokens privados no código;
- utilize secrets em variáveis que serão enviadas ao cliente;
- desabilite mecanismos de segurança para contornar erros;
- confie em dados provenientes do usuário;
- exponha stack traces;
- exponha informações internas desnecessárias.

Considere riscos de:

- XSS.
- Injection.
- Credential Exposure.
- Data Leakage.
- CORS.
- Manipulação de dados no cliente.
- URLs e parâmetros controlados pelo usuário.

Evite `dangerouslySetInnerHTML`.

Quando seu uso for inevitável, o conteúdo deve ser devidamente sanitizado.

**Frontend não é ambiente seguro para armazenar segredo.**

---

# 12. Tratamento de Erros

Erros devem ser tratados na camada apropriada.

Não:

- ignore exceções;
- utilize `catch` apenas para esconder problemas;
- exiba stack traces;
- transforme qualquer erro em mensagem genérica;
- silencie falhas.

Separe:

```text
Erro técnico
      ↓
Tratamento interno
      ↓
Mensagem segura para o usuário
```

A interface deve representar estados relevantes:

- Loading.
- Success.
- Error.
- Empty.
- Unavailable.

Sempre que possível, mensagens de erro devem:

1. Informar o que aconteceu.
2. Evitar detalhes internos.
3. Indicar o que o usuário pode fazer.

---

# 13. UI e UX

A interface deve priorizar:

1. Clareza.
2. Consistência.
3. Previsibilidade.
4. Acessibilidade.
5. Feedback.
6. Responsividade.
7. Eficiência.
8. Estética.

Antes de alterar uma interface, considere:

- hierarquia visual;
- espaçamento;
- tipografia;
- contraste;
- alinhamento;
- affordance;
- feedback;
- estados de interação;
- navegação;
- responsividade;
- acessibilidade.

Não adicione elementos apenas para preencher espaço.

Não utilize estética para esconder problemas de UX.

---

# 14. Heurísticas de Nielsen

Ao projetar ou avaliar interfaces, considere as 10 heurísticas de usabilidade de Jakob Nielsen:

### 1. Visibilidade do status do sistema

O usuário deve saber o que está acontecendo.

Utilize feedback para:

- carregamento;
- processamento;
- sucesso;
- erro.

### 2. Correspondência entre sistema e mundo real

Utilize linguagem compreensível para o público-alvo.

Evite terminologia técnica desnecessária.

### 3. Controle e liberdade

Permita:

- cancelar;
- voltar;
- desfazer;

quando aplicável.

### 4. Consistência e padrões

Elementos semelhantes devem possuir comportamento semelhante.

### 5. Prevenção de erros

Prefira impedir erros a apenas informá-los depois.

### 6. Reconhecimento em vez de memorização

Não exija que o usuário memorize informações desnecessariamente.

### 7. Flexibilidade e eficiência

Permita fluxos eficientes para usuários recorrentes quando aplicável.

### 8. Estética e design minimalista

Apresente somente informações relevantes para a tarefa.

### 9. Reconhecimento e recuperação de erros

Mensagens de erro devem ajudar o usuário a entender e corrigir o problema.

### 10. Ajuda e documentação

Funcionalidades complexas devem possuir orientação adequada quando necessário.

As heurísticas são **princípios de avaliação**, não justificativa para mudanças arbitrárias.

---

# 15. Acessibilidade

Acessibilidade é requisito funcional.

Sempre que aplicável:

- utilize HTML semântico;
- priorize elementos nativos;
- mantenha navegação por teclado;
- mantenha foco visível;
- utilize labels adequados;
- forneça textos alternativos;
- mantenha contraste suficiente;
- não dependa apenas de cores;
- não dependa exclusivamente de hover;
- considere leitores de tela;
- utilize ARIA somente quando necessário.

Prefira:

```html
<button>
```

em vez de:

```html
<div onClick={...}>
```

quando a intenção for representar um botão.

Não utilize ARIA para compensar HTML semântico inadequado quando um elemento nativo resolver o problema.

---

# 16. Design Visual

Conceitos como:

- Skeuomorfismo.
- Neumorfismo.
- Flat Design.
- Material Design.
- Glassmorphism.
- Minimalismo.
- Brutalismo.
- Outros estilos visuais.

podem ser utilizados quando forem coerentes com o produto e com o público.

### Regras

- Não utilize estilos apenas por tendência.
- Não misture estilos sem intenção de design.
- Preserve consistência visual.
- Priorize legibilidade.
- Preserve contraste.
- Preserve affordance.
- Preserve acessibilidade.
- Não sacrifique usabilidade pela estética.

### Skeuomorfismo

Pode ser utilizado quando metáforas visuais ajudarem o usuário a compreender a função de um elemento.

### Neumorfismo

Utilize com cautela devido ao risco de:

- baixo contraste;
- baixa percepção de interação;
- dificuldade de acessibilidade.

### Glassmorphism

Utilize somente quando:

- houver contraste suficiente;
- o conteúdo permanecer legível;
- o efeito não prejudicar performance ou acessibilidade.

**A estética deve servir à interface, nunca o contrário.**

---

# 17. Design System

Quando existir um Design System:

- reutilize componentes;
- reutilize tokens;
- reutilize espaçamentos;
- reutilize tipografia;
- reutilize cores;
- reutilize padrões de interação.

Antes de criar um novo componente, verifique se existe equivalente.

Não crie:

```text
Button
PrimaryButton
CustomButton
ModernButton
NewButton
```

quando um componente existente já atender ao requisito.

Quando não existir Design System:

- mantenha padrões consistentes;
- evite duplicação;
- extraia componentes somente quando houver reutilização real.

---

# 18. Responsividade

A interface deve funcionar adequadamente nos dispositivos suportados.

Considere:

- desktop;
- tablet;
- mobile;
- diferentes larguras;
- diferentes densidades de tela.

Evite:

- dimensões fixas desnecessárias;
- overflow horizontal;
- breakpoints arbitrários;
- exceções CSS excessivas.

Prefira layouts fluidos e padrões consistentes com o projeto.

---

# 19. CSS e Estilização

- Respeite a estratégia existente.
- Não introduza nova metodologia sem necessidade.
- Evite estilos duplicados.
- Evite inline styles quando houver abordagem estruturada.
- Evite seletores excessivamente abrangentes.
- Evite `!important`.
- Utilize `!important` somente quando houver justificativa técnica.
- Reutilize tokens e variáveis.
- Evite valores mágicos repetidos.
- Não altere estilos globais sem avaliar impactos.
- Preserve responsividade e acessibilidade.

---

# 20. Performance

Não faça otimização prematura.

Antes de otimizar:

1. Identifique o possível problema.
2. Avalie seu impacto.
3. Escolha a solução proporcional ao problema.

Considere:

- renders desnecessários;
- chamadas duplicadas;
- bundle size;
- carregamento de recursos;
- imagens;
- lazy loading;
- code splitting;
- cache;
- debounce;
- throttle.

Não utilize:

- `useMemo`;
- `useCallback`;
- `React.memo`;

apenas por hábito.

Não sacrifique legibilidade por micro-otimizações.

---

# 21. Dependências

Antes de adicionar qualquer dependência:

1. Verifique se o projeto já possui solução equivalente.
2. Verifique se React, TypeScript ou JavaScript nativo resolvem o problema.
3. Avalie necessidade real.
4. Verifique compatibilidade.
5. Avalie manutenção.
6. Avalie impacto no bundle.
7. Avalie estabilidade.

Não adicione uma biblioteca para resolver um problema trivial.

Não atualize dependências sem necessidade relacionada à tarefa.

Não altere versões apenas para contornar erros sem investigar a causa raiz.

---

# 22. Configuração

Não altere configurações sem necessidade técnica.

Antes de modificar:

- `package.json`;
- `tsconfig`;
- Vite;
- ESLint;
- Prettier;
- configurações de build;
- variáveis de ambiente;

avalie impactos.

É proibido desabilitar ferramentas de qualidade para esconder erros.

Não:

```text
desabilite TypeScript
desabilite ESLint
ignore warnings
remova validações
```

apenas para fazer a implementação passar.

---

# 23. Testes

Novas funcionalidades devem possuir testes quando aplicável.

Correções de bugs devem possuir testes que reproduzam o problema quando tecnicamente viável.

Priorize testes para:

- regras de negócio;
- transformação de dados;
- services;
- hooks;
- validações;
- comportamentos críticos.

Prefira testar comportamento observável em vez de detalhes internos.

Não altere ou remova testes apenas para fazer uma implementação passar.

---

# 24. Git

Não altere diretamente a `main`.

Utilize branches:

```text
feat/<descricao>
fix/<descricao>
refactor/<descricao>
chore/<descricao>
docs/<descricao>
test/<descricao>
perf/<descricao>
```

Não:

- faça commits de alterações não relacionadas;
- versione secrets;
- altere histórico sem necessidade;
- utilize `git push --force` sem autorização;
- utilize `git reset --hard` sem autorização;
- faça operações destrutivas sem avaliar risco de perda de trabalho.

---

# 25. Arquivos e Estrutura

Antes de criar um arquivo:

1. Verifique se já existe arquivo com responsabilidade semelhante.
2. Verifique se existe localização apropriada.
3. Verifique padrões de nomenclatura.
4. Verifique dependências existentes.

Não crie arquivos duplicados.

Não mova arquivos sem avaliar imports e consumidores.

Não remova arquivos sem verificar referências.

---

# 26. Refatoração

Refatoração deve possuir objetivo técnico claro.

Não refatore apenas porque:

- outra organização parece mais bonita;
- existe uma preferência pessoal;
- o código poderia ser escrito de outra forma.

Durante uma refatoração:

- preserve comportamento;
- minimize alterações;
- mantenha contratos;
- valide após a mudança.

Se houver alteração funcional, ela deve ser explicitamente identificada.

---

# 27. Proibição de Workarounds

É proibido mascarar problemas técnicos.

Não utilize como solução:

```text
any
as any
@ts-ignore
@ts-nocheck
eslint-disable
remoção de validação
desativação de regra
catch vazio
duplicação temporária
valores arbitrários
configuração alterada apenas para silenciar erro
```

Quando houver erro:

**investigue a causa raiz antes de criar um workaround.**

---

# 28. Validação Obrigatória

Após implementar qualquer alteração, execute as verificações disponíveis.

Prioridade:

```text
Typecheck
 ↓
Lint
 ↓
Testes
 ↓
Build
```

Quando disponíveis.

Também verifique:

- imports;
- dependências;
- erros de compilação;
- comportamento afetado;
- possíveis regressões;
- estados de erro;
- responsividade quando houver alteração visual;
- acessibilidade quando houver alteração de interface.

Não considere a tarefa concluída apenas porque o código foi escrito.

Se alguma validação não puder ser executada:

- informe qual;
- informe o motivo;
- não apresente a tarefa como totalmente validada.

---

# 29. Regra de Não-Regressão

Toda alteração deve preservar o comportamento não relacionado ao requisito.

Avalie impactos em:

- componentes;
- páginas;
- hooks;
- services;
- tipos;
- rotas;
- estado;
- APIs;
- estilos;
- testes.

Se uma regressão for identificada:

1. Corrija-a, se estiver dentro do escopo seguro da alteração.
2. Caso não seja possível, informe claramente o risco.

Nunca esconda uma regressão para apresentar a tarefa como concluída.

---

# 30. Critérios de Conclusão

Uma tarefa somente estará concluída quando:

- o requisito estiver implementado;
- a solução estiver integrada à arquitetura existente;
- não houver duplicação desnecessária;
- não houver erros conhecidos introduzidos;
- a tipagem estiver correta;
- os estados relevantes estiverem tratados;
- a interface estiver adequada ao contexto;
- acessibilidade tiver sido considerada;
- as validações disponíveis tiverem sido executadas;
- não houver workaround proibido;
- alterações fora do escopo tiverem sido evitadas.

---

# 31. Ordem de Raciocínio para Implementação

Para cada tarefa, siga mentalmente esta sequência:

```text
1. Entender o requisito
        ↓
2. Inspecionar o projeto
        ↓
3. Identificar soluções existentes
        ↓
4. Identificar restrições e impactos
        ↓
5. Escolher a solução mais simples adequada
        ↓
6. Implementar
        ↓
7. Revisar tipagem e segurança
        ↓
8. Revisar UX, acessibilidade e responsividade
        ↓
9. Executar validações
        ↓
10. Corrigir problemas encontrados
        ↓
11. Revisar escopo e possíveis regressões
        ↓
12. Relatar resultado
```

Não pule etapas relevantes.

---

# 32. Princípio Final

**Não invente.  
Não suponha.  
Não complique.  
Não duplique.  
Não mascare erros.  
Não ignore segurança.  
Não ignore acessibilidade.  
Não altere o que não precisa ser alterado.  
Não utilize `any` para fugir da tipagem.  
Não considere concluído aquilo que não foi validado.**

A melhor implementação é aquela que resolve corretamente o problema, respeita a arquitetura existente, possui tipagem segura, é acessível, é compreensível para outro desenvolvedor e introduz a menor complexidade necessária.