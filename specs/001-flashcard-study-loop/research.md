# Pesquisa da Fase 0: Loop de Estudo com Flashcards (MVP)

## Algoritmo de agendamento

**Decisão**: Implementar o SM-2 (SuperMemo 2) com o mapeamento padrão de
quatro notas usado pela maioria dos apps de SRS modernos (incluindo o
benchmark):

- Nota 0 "não lembrei" → reinicia repetições para 0, intervalo para 1
  dia, reduz o fator de facilidade em 0,20 (piso 1,30).
- Nota 1 "lembrei com dificuldade" → intervalo cresce devagar, fator de
  facilidade reduz em 0,15.
- Nota 2 "lembrei" → crescimento padrão do SM-2 (intervalo × fator de
  facilidade), facilidade inalterada.
- Nota 3 "lembrei facilmente" → crescimento padrão do SM-2, fator de
  facilidade aumenta em 0,15.

As duas primeiras repetições bem-sucedidas usam intervalos fixos (1 dia,
depois 6 dias) antes que o multiplicador de fator de facilidade assuma o
controle, conforme o SM-2 original.

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

**Decisão**: `expo-sqlite` diretamente (sua API baseada em Promise /
`useSQLiteContext`), com migrações SQL escritas à mão em
`src/data/schema.sql`, sem ORM.

**Racional**: O esquema do MVP são três tabelas pequenas (Deck, Card,
Review). Um ORM (Drizzle, WatermelonDB) adiciona uma dependência e um
custo de curva de aprendizado que não se justifica nessa escala
(Princípio V da Constituição: disciplina de MVP / YAGNI). O `expo-sqlite`
é oficialmente suportado pelo Expo, funciona totalmente offline e é
direto de testar apontando os repositórios para um arquivo de banco de
dados em memória/temporário no Jest.

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
(agendador, seleção de cards devidos) é testado com Jest puro, sem
dependências de RN — rápido e agnóstico de framework. Os repositórios em
`src/data/` são testados contra um BD SQLite real (arquivo temporário) via
a API do `expo-sqlite` testável em Node. As telas recebem um teste de
smoke com `@testing-library/react-native` por história de usuário (iniciar
sessão → avaliar um card → ver o próximo card; ver lista de decks → ver
contagem de devidos).

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
