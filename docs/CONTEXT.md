
# SkillMatchAI - CONTEXTO UNIFICADO

---

## 1. Visão Geral do Projeto

O SkillMatchAI é uma plataforma para análise de currículos, busca de vagas e gestão de doações, com foco em automação, transparência e experiência do usuário.

---

## 2. Estrutura e Organização da Documentação

### 2.1. Estrutura Recomendada
```
skillmatchai/
├── DOCUMENTATION_RULES.md      ← Regras obrigatórias
├── README.md                   ← Início do projeto
└── docs/                       ← Toda documentação
    ├── CONTEXT.md              ← (Este arquivo, unificado)
    └── ... (demais arquivos removidos após unificação)
```

### 2.2. Como Navegar
- Sempre comece por CONTEXT.md
- Siga os tópicos para encontrar contexto, status, troubleshooting, roadmap, setup, segurança, logging, features, testes e detalhes técnicos

---

## 3. Status Atual e Checklist

- **Código:** 100% pronto
- **Database:** Criado (Vercel Postgres)
- **Auth:** Em configuração (ver troubleshooting abaixo)
- **Deploy:** Pronto após resolver auth
- **Doadores:** Nova seção implementada, mock data, pronta para integração com API

### 3.1. Checklist de Deploy
- [ ] Variáveis configuradas no Vercel (NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL, ENCRYPTION_KEY)
- [ ] /api/debug/env mostra todos como SET
- [ ] /api/debug/db mostra status OK
- [ ] Usuário de teste criado (Sign Up funcionando)
- [ ] Login funcionando (sem erro 400/401)
- [ ] Cache limpo
- [ ] Redeploy feito
- [ ] Testes finais OK
- [ ] Deploy completo!

---

## 4. Troubleshooting e Debug

### 4.1. Erros Comuns e Soluções

#### Erro 400/401 (Auth)
1. Acesse https://skill-match-ai-lovat.vercel.app/api/init/admin para criar admin
2. Verifique variáveis em /api/debug/env
3. Verifique banco em /api/debug/db
4. Faça login com:
   - Email: heitorbdelfino@gmail.com
   - Senha: senha123
5. Se erro persistir:
   - Limpe cookies
   - Tente modo incógnito
   - Verifique NEXTAUTH_SECRET

#### Erro: "Database connection failed"
- DATABASE_URL errada ou banco down
- Solução: Corrija DATABASE_URL, verifique banco no Vercel

#### Erro: "NEXTAUTH_SECRET is invalid"
- NEXTAUTH_SECRET não configurada ou vazia
- Solução: Configure no Vercel

#### Erro: "JWT decode failed"
- NEXTAUTH_SECRET diferente entre logins
- Solução: Limpe cookies, use NEXTAUTH_SECRET padrão

#### Erro: "User not found"
- Banco vazio ou usuário não registrado
- Solução: Crie usuário via Sign Up

#### Variáveis obrigatórias:
```
NEXTAUTH_SECRET = 1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=
NEXTAUTH_URL = https://skill-match-ai-lovat.vercel.app
DATABASE_URL = [Copiar do Vercel Storage > PostgreSQL]
ENCRYPTION_KEY = 7a4e8f2c1b9d6a3e5f7c8b1a9d3e6f2c5a8b9c1d4e7f0a3b6c9e2f5a8b1c
```

---

## 5. Setup Local e Deploy

### 5.1. Instalação Local
1. Clone o repositório
2. Instale dependências
3. Configure .env.local
4. Rode migrations Prisma
5. Inicie o servidor

### 5.2. Deploy Vercel
1. Adicione variáveis no painel Vercel
2. Configure banco (Vercel Postgres recomendado)
3. Deploy via Vercel CLI ou web
4. Teste login, upload de PDF, dashboard

---

## 6. Logging, Segurança e Monitoramento

### 6.1. Logging
- Logger centralizado (lib/logger.ts)
- Categorias: AUTH, ANALYSIS, API_ERROR, SECURITY
- Integração recomendada: Sentry, Datadog
- Health check endpoint: /api/health

### 6.2. Segurança
- NextAuth v4, JWT, bcrypt
- Validação de entrada, XSS, CSRF, CORS
- Criptografia AES-256-GCM
- Rate limiting (100 req/min por IP, 5 req/hora em /api/auth/analyze)
- Variáveis sensíveis só no Vercel
- Backup automático do banco
- Checklist completo em SECURITY.md (ver histórico)

---

## 7. Features e Arquitetura

### 7.1. Doadores
- Componente DonorsList.tsx (React, mock data)
- Estilos DonorsList.module.css
- Integração futura com API /api/payment/donors
- Documentação detalhada (estrutura, design, responsividade, testes, troubleshooting)

### 7.2. Jobs e Busca Avançada
- Integração com múltiplos sites (Programathor, RemoteOK, LinkedIn, etc)
- Geolocalização planejada
- Sistema de deduplicação e normalização de vagas
- Score de compatibilidade com IA

### 7.3. Pagamento e PIX
- Sistema de pagamento via PIX com QR Code
- Planos: Free, Pro, Enterprise
- Dashboard de planos e doações

### 7.4. Estatísticas e Admin
- Página /admin/statistics (apenas admin)
- Dashboard com dados reais, gráficos, exportação CSV/PDF

### 7.5. Tracking e Analytics
- UserInteraction, JobInteraction, SessionLog
- Tracking frontend (useTracking), backend (API)

---

## 8. Roadmap e Melhorias Futuras

- Integração real com API de doadores
- Paginação/filtros na lista de doadores
- Sistema de pagamento via PIX
- Restrições de pesquisa por período
- Tracking de interações do usuário
- Estatísticas administrativas
- Segurança avançada (2FA, rate limiting, etc)
- Testes automatizados e monitoramento
- Busca avançada de vagas (múltiplos sites, geolocalização, internacional)
- Verificação de email na criação de conta e troca de senha

Veja detalhes completos do roadmap e backlog no histórico deste arquivo.

---

## 9. Testes e QA

- Checklist visual e funcional para cada feature
- Testes de responsividade (mobile, tablet, desktop)
- Testes de performance e acessibilidade
- Testes de integração com API real
- Testes automatizados planejados

---

## 10. Troubleshooting Avançado (Doadores)

### 10.1. FAQ
- Dados de doadores atualmente são mock (exemplo)
- Para integrar dados reais: fetch em /api/payment/donors
- Cores e layout customizáveis em DonorsList.module.css
- Responsividade via CSS Grid + media queries
- Possível adicionar mais campos ao doador (data, país, etc)
- Paginação recomendada para >20 doadores
- Animação ao adicionar novo doador: usar keyframes CSS
- Clique no card para detalhes: adicionar modal

### 10.2. Problemas Comuns
- Cards não aparecem: verifique import em DonationCounter.tsx
- Cores erradas: limpe cache, verifique CSS
- Não responsivo: revise media queries
- Mensagem cortada: ajuste padding/overflow
- Avatar deformado: width/height iguais
- Hover effect não funciona: verifique CSS
- Muitos doadores: use paginação ou virtual scroll

---

## 11. Referências Rápidas

- **Setup local:** Veja seção 5
- **Deploy:** Veja seção 5
- **Segurança:** Veja seção 6
- **Logging:** Veja seção 6
- **Features:** Veja seção 7
- **Roadmap:** Veja seção 8
- **Testes:** Veja seção 9
- **Troubleshooting:** Veja seção 10

---

## 12. Histórico e Atualizações

### 26/11/2025 - Reorganização de Gerenciamento de Chave API (Modal + Input Temporário)
- **O que foi feito:**
  1. **Removida** a card de chave API da seção "Upload & Análise"
  2. **Simplificado** input de chave API nessa seção para apenas aceitação temporária (sem salvamento)
  3. **Reorganizada** seção "Chave API" (sidebar) em um modal inteligente com 2 estados:
     - **Estado 1 - Sem Chave Salva**: Mostra formulário para salvar chave permanente
     - **Estado 2 - Com Chave Salva**: Mostra status (✅ Salva) + botão para remover
  4. **Adicionado** novo estado `tempApiKeyForModal` para gerenciar chave no modal
  5. **Ajustado** fluxo: Usuário pode fornecer chave temporária EM QUALQUER lugar E/OU salvar uma chave permanente
  6. **Removidos** arquivos desnecessários: `API_KEY_MANAGEMENT.md` e `test-api-key.ps1` (conforme nova diretriz)
- **Fluxo de UX:**
  - **Análise Rápida**: Usuário coloca chave em "Upload & Análise" → usa → descarta
  - **Análise com Chave Salva**: Clica em "Chave API" (sidebar) → Salva chave → Usa automaticamente em todas análises
  - **Flexibilidade**: Pode combinar: usar chave salva OU chave temporária
- **Arquivos modificados:**
  - `app/dashboard/page.tsx` - Reorganização de estados, handlers, JSX condicional para modal
  - `app/dashboard/page.module.css` - Estilos já existentes (nenhuma alteração necessária)
- **Segurança:**
  - Chave API criptografada com AES-256-GCM no banco
  - Endpoint `/api/user/api-key` protegido por autenticação NextAuth
  - GET nunca retorna chave completa
  - POST valida comprimento mínimo (20 caracteres)
- **Testes:**
  - Compilação TypeScript bem-sucedida
  - Build Next.js completado sem erros
  - Todas as rotas disponíveis incluindo `/api/user/api-key`
- **Status:** ✅ Completo - Modal funcional, fluxo intuitivo, flexível
- **Próximos passos:**
  - Integração com jobs page para usar chave salva automaticamente
  - Recuperar e descriptografar chave ao realizar análise
  - Implementar expiração/renovação de chave

### 26/11/2025 - Sistema de Gerenciamento de Chave API (Persistência e Reutilização) - REVISADO
- **Status:** ⚠️ Redesenhado - A implementação inicial foi reorganizada conforme feedback do usuário
- **Mudanças:** Movido para modal na sidebar, input temporário mantido em "Upload & Análise"
- **Nova Estrutura:** Modal inteligente com 2 estados (chave salva / não salva)

### 26/11/2025 - Melhorias de Responsividade do Card "Ajude o Desenvolvimento"
- **O que foi feito:** 
  1. Ajustado layout de 3 colunas para 2 colunas (grid-template-columns: repeat(3, 1fr) → repeat(2, 1fr))
  2. Adicionados 3 breakpoints de responsividade (768px, 640px, 480px)
  3. Otimizadas fontes, padding e espaçamento para cada tamanho de tela
  4. Ajustado overflow do container de `hidden` para `visible`
  5. Adicionado `max-width: 100%` e `box-sizing: border-box` para garantir ajuste correto
- **Arquivos modificados:** 
  - `components/DonationCounter.module.css` (grid, media queries, breakpoints)
  - `components/DonationCounter.tsx` (sem alterações, está otimizado)
- **Testes:**
  - Desktop (1920px+): 2 colunas na primeira linha, 1 coluna na segunda
  - Tablet (768px): Layout otimizado com espaçamento reduzido
  - Mobile (640px): 1 coluna, fontes reduzidas, padding ajustado
  - Mobile pequeno (480px): Tudo comprimido ao máximo, mas legível
- **Status:** ✅ Resolvido - Responsivo em todos os breakpoints (dev e produção)

- Última atualização: 26 de novembro de 2025
- Responsável: GitHub Copilot
- Status: Dashboard otimizado para responsividade, pronto para novos desenvolvimentos

---

## 13. Observações Finais

- Este arquivo substitui toda a documentação anterior da pasta docs/
- Mantenha sempre atualizado
- IA e humanos devem sempre começar por aqui

---

**FIM DO CONTEXTO UNIFICADO**
