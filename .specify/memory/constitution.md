<!--
Relatório de Impacto de Sincronização
- Mudança de versão: [TEMPLATE] → 1.0.0 (ratificação inicial)
- Princípios modificados: n/a (primeira versão)
- Seções adicionadas: Princípios Fundamentais (I-V), Restrições de
  Tecnologia e Dados, Fluxo de Desenvolvimento, Governança
- Seções removidas: nenhuma
- Templates que exigem acompanhamento: nenhum — os templates de
  plan/spec/tasks consomem este arquivo em tempo de execução e não
  precisam de edição para esta ratificação.
- TODOs adiados: nenhum
-->

# Constituição do AnkiApp-Benchmark

## Princípios Fundamentais

### I. Offline-First, Propriedade Local
O app DEVE ser totalmente utilizável sem conexão de rede: sessões de
estudo, agendamento e dados de progresso são lidos e gravados primeiro no
armazenamento do próprio dispositivo. Qualquer funcionalidade futura de
sincronização/backend DEVE ser aditiva e NÃO PODE se tornar uma dependência
de execução para o loop de estudo principal. Racional: isso espelha o
benchmark (AnkiApp) e mantém o MVP entregável sem infraestrutura de backend
ou sistema de contas.

### II. Repetição Espaçada É o Loop Central (NÃO NEGOCIÁVEL)
A razão de existir do produto é o loop de revisão: mostrar um card,
capturar uma resposta avaliada, reagendar o card via um algoritmo de
repetição espaçada (SM-2 ou equivalente documentado). Esse loop DEVE estar
implementado, testado e estável antes de qualquer outra funcionalidade
(navegador de decks, estatísticas, temas, UI de importação/exportação).
Nenhuma funcionalidade pode alterar ou contornar o contrato central do
agendador (entradas: estado do card + nota; saída: próximo intervalo e
data de vencimento) sem uma emenda constitucional.

### III. Testes Primeiro para Lógica de Domínio (NÃO NEGOCIÁVEL)
O algoritmo de agendamento, o modelo de dados de deck/card e o pipeline de
ingestão de conteúdo (lista de palavras Oxford → registros de card) DEVEM
ter testes automatizados escritos antes da implementação, seguindo
red-green-refactor. Componentes de UI e telas são isentos de TDD estrito,
mas DEVEM ter ao menos um teste de integração/smoke por fluxo voltado ao
usuário antes desse fluxo ser lançado. Lógica de agendamento sem teste é
tratada como build quebrado, não como tarefa pendente.

### IV. Pipeline de Conteúdo Rastreável e Respeitando Licenças
Todo conteúdo de flashcard originado das listas de palavras Oxford (ex.:
Oxford 3000/5000) DEVE passar por um único pipeline de ingestão versionado
que registra: documento fonte, data de extração e nível da lista de
palavras (A1-C1). A saída do pipeline é tratada como dado gerado, nunca
editado manualmente no lugar. Antes de qualquer material fonte da Oxford
ser empacotado no app ou no repositório, os termos de licença/uso daquele
material específico DEVEM ser confirmados e registrados em
`content/SOURCES.md`; se os termos não estiverem claros, o pipeline
distribui um conjunto de dados placeholder/amostra em vez do conteúdo real
até que isso seja esclarecido.

### V. Disciplina de MVP (Simplicidade, YAGNI)
Toda funcionalidade adicionada antes que o loop central (Princípio II)
esteja comprovado de ponta a ponta DEVE ser justificada em relação ao
escopo do MVP: navegar por um deck, estudar cards devidos, avaliar uma
resposta, ver o card reagendado. Contas, sincronização em nuvem,
funcionalidades sociais, múltiplas fontes de conteúdo e criação de decks
personalizados estão explicitamente FORA de escopo até que o loop do MVP
seja validado. Prefira três telas parecidas a uma abstração prematura;
prefira um JSON/SQLite local semeado a um sistema de plugins genérico.

## Restrições de Tecnologia e Dados

- **Cliente**: React Native com Expo (managed workflow, a menos que um
  módulo nativo específico force um eject para bare workflow), TypeScript
  em modo strict.
- **Persistência local**: um banco de dados embarcado no dispositivo
  (SQLite via `expo-sqlite` ou um ORM construído sobre ele) é a fonte da
  verdade para decks, cards e histórico de revisões. Nenhum banco de dados
  remoto é necessário para o MVP.
- **Algoritmo de agendamento**: implementado como um módulo TypeScript
  puro e agnóstico de framework, sem imports de React/Expo, para que seja
  testável de forma independente e portável caso o shell do cliente mude.
- **Ingestão de conteúdo**: um pipeline scriptável separado (Node/
  TypeScript) que transforma listas de palavras fonte em um conjunto de
  dados semente versionado, consumido pelo app em tempo de build ou na
  primeira execução. Não roda dentro do runtime mobile.
- **Nenhum serviço de backend** é introduzido para o MVP. Se uma
  funcionalidade futura exigir um, ela é proposta via `/speckit-specify`
  como sua própria feature e avaliada contra o Princípio I antes de ser
  aceita.

## Fluxo de Desenvolvimento

- Funcionalidades são definidas com `/speckit-specify`, planejadas com
  `/speckit-plan` e quebradas com `/speckit-tasks` antes de a implementação
  começar.
- Cada plano de funcionalidade DEVE declarar quais Princípios Fundamentais
  ele toca e como permanece em conformidade; um plano que não consiga
  declarar isso não está pronto para `/speckit-tasks`.
- Pull requests/commits que tocam o agendador ou o pipeline de conteúdo
  DEVEM referenciar os testes que cobrem a mudança.
- O benchmark contra o AnkiApp é qualitativo, não contratual: use-o para
  validar que os fluxos centrais (lista de decks → sessão de estudo →
  avaliação → atualização da data de vencimento) parecem equivalentes, não
  para justificar copiar a UI literalmente.

## Governança

Esta constituição substitui a prática ad-hoc para este repositório.
Emendas são feitas via `/speckit-constitution`, devem declarar uma
justificativa de incremento de versão (MAJOR/MINOR/PATCH conforme
versionamento semântico) e valem imediatamente para trabalho novo. Planos
em andamento não são invalidados retroativamente, mas devem ser
reconciliados na próxima revisão.

Todos os planos de funcionalidade (`/speckit-plan`) DEVEM incluir uma
etapa de Verificação da Constituição que confirme conformidade com os
Princípios Fundamentais acima; violações não resolvidas devem ser
justificadas na seção de Rastreamento de Complexidade do plano, ou o plano
é rejeitado.

**Versão**: 1.0.0 | **Ratificada em**: 2026-08-04 | **Última Emenda**: 2026-08-04
