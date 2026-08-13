# Fontes de Conteúdo

Registro de proveniência exigido pelo Princípio IV da Constituição
("Pipeline de Conteúdo Rastreável e Respeitando Licenças"). Todo dataset
em `src/content/seed/` precisa de uma entrada aqui antes de ser
empacotado no app.

## Decisão de produto: conteúdo original em vez de Oxford licenciado

O plano original (T032/T033) previa ingerir o Oxford 3000/5000 real assim
que a licença fosse esclarecida. Essa rota foi abandonada deliberadamente
(não é mais "adiada", é a direção definitiva do produto): o app é de uso
pessoal, e mesmo assim os termos de uso do Oxford Learner's Dictionaries
não permitem copiar/redistribuir o material (lista, definições, exemplos)
sem permissão por escrito da Oxford University Press — inclusive as
listas publicadas como PDF "de referência" no site deles. Em vez de
aguardar ou negociar essa licença, o conteúdo semente passou a ser
**inteiramente autoral**: palavras-núcleo de cada nível CEFR (conhecimento
geral de frequência lexical, que não é protegido por direito autoral —
só a seleção/expressão específica de uma editora é), com frases de
exemplo, traduções e emojis escritos do zero para este projeto. T032/T033
em `specs/001-flashcard-study-loop/tasks.md` foram atualizadas para
refletir essa decisão.

## `core-vocabulary-a1.json`, `core-vocabulary-a2.json`, `core-vocabulary-b1.json`

- **Fonte**: Conteúdo original, redigido para este projeto — **não** é
  extração de nenhuma lista publicada (Oxford, Cambridge ou qualquer
  outra editora). A escolha de quais palavras incluir em cada nível
  reflete conhecimento geral e público de progressão lexical
  A1→B1 no ensino de inglês, não uma lista curada de terceiros.
- **Status de licença**: N/A (conteúdo original, de autoria do próprio
  projeto).
- **Nível declarado**: A1, A2 e B1 respectivamente — classificação
  editorial própria, não corresponde a uma certificação CEFR formal de
  nenhuma fonte externa.
- **Data de criação**: 2026-08-08.
- **Quantidade**: 20 cartas por nível (60 no total). `core-vocabulary-a2.json`
  reaproveita as 4 cartas originais de `oxford-3000-a1-a2.sample.json`
  (arquivo removido; o nome antigo só citava "oxford" como referência de
  nível-alvo, nunca conteve texto extraído da Oxford) somadas a 16 novas.
- **Próximo passo**: nenhum pendente por licenciamento — para crescer o
  vocabulário, é só escrever mais cartas no mesmo formato
  (`contracts/seed-content-schema.json`), sem depender de terceiros.
