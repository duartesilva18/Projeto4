# Passagem a produção — Proposta de Vagas

Caminhos de páginas abaixo são relativos a `ALUNOS_frontend/src/routes/(app)/(modules)/`, salvo indicação em contrário.

---

## Branches

Repositório: [https://github.com/duartesilva18/Projeto4](https://github.com/duartesilva18/Projeto4)

Frontend e backend no mesmo repositório, branch `main`.

| Componente | Pasta | Branch |
|------------|-------|--------|
| Frontend | `ALUNOS_frontend/` | `main` |
| Backend | `ALUNOS_webservices/` | `main` |

---

## Páginas no menu (sidebar)

Menu definido em `ALUNOS_frontend/src/routes/(app)/(modules)/+layout.server.js`.

### Módulo

| Entrada | URL | Descrição |
|---------|-----|-----------|
| Proposta de Vagas | `/proposta-vagas` | Atalho para a tabela principal (aba por defeito) |

### Área: Dados por via de acesso

Todas as entradas usam a mesma página com `?tab=`.

| Menu | URL | Ficheiro | O que faz |
|------|-----|----------|-----------|
| Regime Nacional | `/proposta-vagas?tab=regime-nacional` | `proposta-vagas/+page.svelte` | Tabela CNA (1.ª, 2.ª e 3.ª fase). Edição e importação DGES. |
| Reingresso + Mudança | `/proposta-vagas?tab=reingresso-mudanca` | (idem) | Reingresso e mudança de par/instituição. |
| Concursos Especiais | `/proposta-vagas?tab=concursos` | (idem) | Concursos >23, CET, CTeSP, outros, dupla certificação. |
| Regimes Esp + Internacionais | `/proposta-vagas?tab=regimes-esp-internacionais` | (idem) | Regimes especiais e internacionais. |
| Totais | `/proposta-vagas?tab=totais` | (idem) | Totais e indicadores (ocupação, vagas, sobras, etc.). |

Apoio:

| Ficheiro | Função |
|----------|--------|
| `proposta-vagas/+page.server.js` | Load inicial (`vagas/tabela`, escolas, cursos). |
| `proposta-vagas/DgesImportModal.svelte` | Importação DGES (preview e aplicar). |

### Área: Análise e Administração

| Menu | URL | Ficheiros | O que faz |
|------|-----|-----------|-----------|
| Dashboard | `/dashboard` | `dashboard/+page.svelte`, `dashboard/+page.server.js`, `dashboardViewConfig.js`, `dashboardViewCharts.js`, `dashboardChartConfig.js`, `dashboardChartColors.js`, `EChart.svelte` | KPIs e gráficos por ano, escola e curso. |
| Comparar anos | `/comparar-anos` | `comparar-anos/+page.svelte`, `comparar-anos/+page.server.js`, `comparar-anos/compareTableConfig.js` | Mesmo curso em até 3 anos (B−A, C−B). |
| Gestão de Tabelas | `/gestao-tabelas` | `gestao-tabelas/+page.svelte`, `gestao-tabelas/+page.server.js` | Anos letivos, nova tabela, limpar/apagar; totais de dados e DGES. |

**Menu:** 8 itens + link do módulo. **Frontend:** 13 rotas `+page.svelte`; em produção usam-se 4 páginas do módulo vagas (`proposta-vagas`, `dashboard`, `comparar-anos`, `gestao-tabelas`).

### Rotas fora do menu

Não fazem parte do deploy funcional deste módulo (legado ou portal). Listadas só para referência no código.

| URL | Ficheiro | Notas |
|-----|----------|-------|
| `/` (área autenticada) | `(app)/+page.svelte` | Redireciona para `/proposta-vagas`. |
| `/inicio` | `inicio/+page.svelte` | Entrada/erro do portal. |
| `/sem_login` | `sem_login/+page.svelte` | Login SSO. |
| `/proposta-vagas/base` | `proposta-vagas/base/+page.svelte` | Legado. |
| `/proposta-vagas/formulario` | `proposta-vagas/formulario/+page.svelte` | Legado. |
| `/proposta-vagas/editoras` | `proposta-vagas/editoras/(listagem)/+page.svelte` | Editoras (fora do menu vagas). |
| `/proposta-vagas/editoras/nova` | `proposta-vagas/editoras/nova/+page.svelte` | Nova editora. |
| `/proposta-vagas/editoras/[id]` | `proposta-vagas/editoras/[id]/+page.svelte` | Editar editora. |
| `/proposta-vagas/produto/[id]` | `proposta-vagas/produto/[id=integer]/+page.svelte` | Produto. |
| `/exemplos` | `exemplos/+page.server.js` | Template; sem `+page.svelte`. |

---

## Backend (API)

| Ficheiro | Função |
|----------|--------|
| `ALUNOS_webservices/src/vagas/vagas.service.ts` | Lógica e SQL |
| `ALUNOS_webservices/src/vagas/vagas.controller.ts` | REST `/vagas/...` |
| `ALUNOS_webservices/src/vagas/dges-import.controller.ts` | REST `/vagas/import/dges/...` |

Endpoints usados pelo menu:

| Método | Caminho | Uso |
|--------|---------|-----|
| GET | `/vagas/tabela` | Tabela, dashboard, comparar anos |
| GET | `/vagas/escolas`, `/vagas/cursos` | Filtros |
| GET | `/vagas/anos` | Gestão de tabelas |
| GET/POST | `/vagas/novo-ano` | Criar ano letivo |
| DELETE | `/vagas/ano/:anoInicio` | Apagar ano |
| PUT | `/vagas/ano/:anoInicio/reset` | Limpar dados do ano |
| PATCH | `/vagas/curso/:id` | Regime nacional |
| PATCH | `/vagas/concursos/:id` | Concursos |
| PATCH | `/vagas/regimes-esp-internacionais/:id` | Regimes esp. e internacionais |
| PATCH | `/vagas/reingresso-mudanca/:id` | Reingresso e mudança |
| PATCH | `/vagas/matriculas-ano/:id` | Matrículas por ano |
| PATCH | `/vagas/totais-overrides/:id` | Totais |
| GET | `/vagas/import/dges/tipos`, `/formatos`, `/historico` | Importação DGES |
| POST | `/vagas/import/dges/preview`, `/apply` | Preview e aplicar importação |

Importação DGES (`preview`, `apply`): em produção exige utilizador autenticado (`JwtGuard` em `dges-import.controller.ts`).

### Proxy no frontend

O browser usa `/ep/api/vagas/...`. O SvelteKit reencaminha para `PUBLIC_API_URL` (`ALUNOS_frontend/src/routes/(endpoints)/ep/api/vagas/`).

**Limite de upload (importação DGES):** o frontend usa `adapter-node`, cujo limite de body por defeito é **512 KB** — insuficiente para os PDFs da DGES (o `StCEs25.pdf` tem ~8 MB). Definir a variável de ambiente no serviço do frontend:

```
BODY_SIZE_LIMIT=15M
```

Sem isto, a pré-visualização da importação falha com HTTP 413 para PDFs grandes. O backend aceita até 10 MB por ficheiro (`DGES_MAX_FILE_BYTES`).

---

## Base de dados

### BD nova (instalação limpa)

1. Executar `bd.sql` na raiz (schema `vagas`, inclui `campo_origem` e `vagas_efetivas_3f`).
2. Executar só as migrations que faltam no `bd.sql`:
   - `ALUNOS_webservices/sql/migrations/003_dges_import_preview.sql`
   - `ALUNOS_webservices/sql/migrations/004_dges_import_log.sql`
3. Executar `seed_escolas_cursos.sql` na raiz (**obrigatório em BD nova**). Catálogo de escolas e cursos IPVC; script idempotente, disponibilizado pela orientadora **Sara Paiva**. Sem este ficheiro, `vagas.escola` e `vagas.curso` ficam vazios e «Nova tabela» / novo ano letivo não cria linhas de cursos. O `bd.sql` **não** inclui estes dados.

As migrations `001` e `002` repetem tabelas já no `bd.sql`; só necessárias se o schema não foi criado a partir do `bd.sql`.

### BD já existente em produção

- Verificar em `sys.tables` quais tabelas `vagas.*` faltam.
- Correr apenas os scripts em falta (`001`–`004` usam `IF NOT EXISTS`, são idempotentes).
- **`seed_escolas_cursos.sql`:** só necessário se `vagas.escola` / `vagas.curso` estiverem vazios ou incompletos (script idempotente, fornecido por Sara Paiva). Se a BD de produção **já tiver** o catálogo, **não correr**.
- Não restaurar backup por cima de dados reais sem acordo explícito.

| Script | Tabela | Já no `bd.sql`? |
|--------|--------|------------------|
| `001_vagas_efetivas_3f.sql` | `vagas_efetivas_3f` | Sim |
| `002_campo_origem.sql` | `campo_origem` | Sim |
| `003_dges_import_preview.sql` | `dges_import_preview` | Não |
| `004_dges_import_log.sql` | `dges_import_log` | Não |

---

## Checklist de deploy

**Pré-requisitos:** SQL Server acessível; Node.js e npm nos servidores de build.

1. Checkout da branch `main` (ou a acordada para o release).
2. Base de dados conforme secção acima (nova ou existente).
3. **Backend** (`ALUNOS_webservices/`): `npm i --force`; `npm run build`; publicar; testar `GET /vagas/tabela`.
4. **Frontend** (`ALUNOS_frontend/`): `npm i --force`; `npm run build`; publicar com `BODY_SIZE_LIMIT=15M` no ambiente (ver secção Proxy).
5. No browser: `/proposta-vagas`, `/dashboard`, `/comparar-anos`, `/gestao-tabelas`.
6. Importação DGES: confirmar gravação em `campo_origem`.
7. Em Gestão de Tabelas: criar ano letivo se ainda não existir (cursos vêm do catálogo na BD / seed).

Não commitar: `node_modules/`, `.svelte-kit/`.

---

Atualizar este ficheiro quando mudar entradas no menu (`+layout.server.js`).
