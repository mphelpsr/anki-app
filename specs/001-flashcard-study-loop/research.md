# Pesquisa da Fase 0: Loop de Estudo com Flashcards (MVP)

## Algoritmo de agendamento

**Decisão** (atualizada por `004-recall-grading` — ver nota de
sincronização em
[contracts/scheduler-contract.md](./contracts/scheduler-contract.md)):
duas fases. Cartas novas ou que acabaram de levar "Again" ficam em uma
fase de **aprendizagem** com passos curtos em minutos (Again → 1 min,
Hard → 10 min, Good → gradua com 1 dia, Easy → gradua direto com 4 dias).
Uma vez graduada (`repetitions >= 1`), a carta passa a crescer em dias
via SM-2 clássico (intervalo × fator de facilidade), e "Again" nessa fase
é tratado como lapso — volta para a fase de aprendizagem, não para "1
dia".

O motivo da mudança em relação à primeira versão desta decisão (só em
dias, Again = 1 dia) foi um pedido explícito: o botão "Again" precisa
trazer a mesma carta de volta em questão de segundos/minutos dentro da
mesma sessão, não no dia seguinte — o que uma escala só-em-dias não
consegue expressar.

**Racional**: O SM-2 é simples o suficiente para implementar como uma
pequena função pura, bem documentado, produz exatamente o comportamento
"mais curto ao errar / mais longo em sucessos consecutivos" que a
História 3 e os SC-003/SC-004 da spec exigem, e é próximo o suficiente do
agendador do próprio benchmark para que a intuição do aprendiz sobre
crescimento de intervalo se transfira.

**Alternativas consideradas**: FSRS (algoritmo mais novo, ajustado por ML
— mais preciso a longo prazo, porém com maior complexidade de
implementação/teste, adiado até o loop do MVP ser validado); um esquema
ingênuo de "dobrar o intervalo sempre" (rejeitado — falha na expectativa
de crescimento baseado em facilidade do SC-004 e não diferencia "lembrei"
de "lembrei facilmente").

## Camada de persistência

**Decisão**: `expo-sqlite` diretamente (API `openDatabaseAsync` /
`execAsync` / `runAsync` / `getAllAsync` / `getFirstAsync`), sem ORM. O
schema SQL vive em `src/data/schema.ts` como uma constante de string
(`SCHEMA_SQL`), não em um arquivo `.sql` separado — Metro não empacota
texto `.sql` bruto sem um transformer customizado, e configurar um só
para três `CREATE TABLE` não se justifica (Princípio V: YAGNI). Os
repositórios (`src/data/repositories/`) dependem de uma interface mínima
`Database` (`execAsync`/`runAsync`/`getAllAsync`/`getFirstAsync`) em vez
de importar `expo-sqlite` diretamente — o objeto retornado por
`openDatabaseAsync` já satisfaz essa interface estruturalmente, sem
wrapper nenhum em produção.

**Racional**: O esquema do MVP são três tabelas pequenas (Deck, Card,
Review). Um ORM (Drizzle, WatermelonDB) adiciona uma dependência e um
custo de curva de aprendizado que não se justifica nessa escala
(Princípio V da Constituição: disciplina de MVP / YAGNI). O `expo-sqlite`
é oficialmente suportado pelo Expo e funciona totalmente offline. Depender
apenas da interface `Database` (não da classe concreta `SQLiteDatabase`)
é o que viabiliza testar os repositórios com SQL real fora do Expo — ver
Estratégia de testes abaixo.

**Alternativas consideradas**: WatermelonDB (construído para
sincronização — prematuro para um MVP sem backend); AsyncStorage/arquivo
JSON simples (rejeitado — sem capacidade de query para "cards devidos
agora", exigiria carregar/varrer o dataset inteiro em memória a cada
sessão).

## Navegação

**Decisão**: `expo-router` (roteamento baseado em arquivos) com duas
rotas para esta funcionalidade: `/` (lista de decks) e
`/study/[deckId]` (sessão de estudo).

**Racional**: Padrão recomendado do Expo para novos projetos, boilerplate
mínimo para um MVP de duas telas, e deixa espaço para adicionar mais
rotas (estatísticas, configurações) depois sem reestruturação.

**Alternativas consideradas**: React Navigation configurado manualmente
(capacidade equivalente, mais código de configuração sem benefício para
o MVP).

## Pipeline de ingestão de conteúdo

**Decisão**: Um script Node/TypeScript independente
(`content-pipeline/ingest-oxford.ts`) que lê uma lista de palavras fonte e
grava um arquivo JSON semente versionado em `src/content/seed/`. Até que
os termos de licença/uso do material fonte da Oxford sejam confirmados e
registrados em `content-pipeline/SOURCES.md` (Princípio IV da
Constituição), o pipeline distribui um pequeno dataset de **amostra**
escrito à mão, com o mesmo formato (~20 palavras), para que o app seja
totalmente demonstrável e testável sem depender de questões de
licenciamento não resolvidas.

**Racional**: Desacopla "o loop de estudo funciona" (testável hoje) de
"o conteúdo exato da Oxford 3000/5000 está liberado para empacotamento"
(uma questão de licenciamento fora da engenharia). Mantém o requisito de
rastreabilidade da constituição aplicável por meio de um único script e
um único registro de fontes, em vez de edições de conteúdo ad-hoc.

**Alternativas consideradas**: Fazer parsing dos PDFs da Oxford
diretamente no dispositivo em tempo de execução (rejeitado — viola a
restrição de "a ingestão não roda dentro do runtime mobile", e o parsing
de PDF é complexidade desnecessária para uma etapa única em tempo de
build); digitar todos os cards manualmente direto no app (rejeitado — não
é rastreável até uma fonte, falha no Princípio IV).

## Estratégia de testes

**Decisão**: Jest como único test runner para tudo. `src/domain/`
(agendador, seleção de cards devidos, mastery) é testado com Jest puro,
sem dependências de RN — rápido e agnóstico de framework. Os repositórios
em `src/data/` são testados contra SQLite **real** (não um mock) usando o
módulo nativo `node:sqlite` do Node 22 (`tests/support/
nodeSqliteDatabase.ts`, um adaptador que implementa a mesma interface
`Database` que os repositórios consomem, com um banco `:memory:`). As
telas recebem um teste de smoke com `@testing-library/react-native` por
história de usuário, injetando esse mesmo adaptador como banco de dados
de teste.

**Racional (revisada ao implementar o SQLite real em 001)**: rodar
`expo-sqlite` de verdade dentro do Jest não é viável de forma direta — sua
implementação nativa depende de módulos nativos ausentes no Node puro, e
sua implementação web (usada em `expo start --web`) depende de um runtime
WASM que o preset `jest-expo` não carrega por padrão. Em vez de mockar as
chamadas SQL (o que testaria a forma das chamadas, não se o SQL está
correto), a camada de repositórios foi desenhada contra uma interface
`Database` minúscula e estrutural; em produção, `expo-sqlite` a satisfaz
sem nenhum adaptador, e em teste, `node:sqlite` (mecanismo SQLite real,
diferente binding) a satisfaz via um adaptador de ~15 linhas. Isso mantém
o Princípio III (testes primeiro para o modelo de dados de deck/card)
verificando comportamento SQL genuíno — JOINs, filtros por `nextDueAt`,
etc. — não apenas chamadas de função dubladas.

**Alternativas consideradas**: mock manual do módulo `expo-sqlite`
(rejeitado — testaria que as funções certas foram chamadas, não que as
queries produzem os resultados certos); WatermelonDB/Drizzle com adaptador
de teste embutido (rejeitado junto com a decisão de não usar ORM, ver
Camada de persistência); rodar os testes de repositório apenas
manualmente via `expo start --web` (rejeitado — viola o Princípio III,
que exige testes automatizados para o modelo de dados de deck/card).

**Racional**: Atende ao Princípio III da Constituição (testes primeiro
para lógica de domínio, ao menos um teste de integração por fluxo voltado
ao usuário) com uma única ferramenta, evitando o custo de manutenção de
misturar test runners.

**Alternativas consideradas**: E2E com Detox/Maestro em um simulador
(valioso depois para regressão completa do app, adiado — disciplina de
MVP: não necessário para validar as três histórias de usuário desta
funcionalidade).

## Questões em aberto resolvidas

Todos os itens `NEEDS CLARIFICATION` do Contexto Técnico foram resolvidos
acima; nenhum permanece.
