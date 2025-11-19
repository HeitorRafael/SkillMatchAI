# 📚 Variáveis de Ambiente Explicadas em Detalhes

## 🎯 Por Que Precisamos Delas?

Variáveis de ambiente são **configurações sensíveis** que:
- Não podem ser commitadas no Git (são secretas)
- Mudam entre ambientes (local ≠ produção)
- Precisam ser injetadas pelo Vercel em tempo de execução

---

## 📋 Tabela Rápida de Variáveis

| Variável | Obrigatória? | Como Gerar? | Fixa? | Impacto |
|----------|-------------|-----------|-------|--------|
| **NEXTAUTH_SECRET** | ✅ Sim | ✅ Já existe | ✅ Sim | Crítico - sem isso, login não funciona |
| **NEXTAUTH_URL** | ✅ Sim | 🔄 Depende do domain | ✅ Sim | Crítico - sem isso, auth é rejeitada |
| **DATABASE_URL** | ✅ Sim | 📊 Vercel gera | ✅ Sim | Crítico - sem isso, banco não conecta |
| **ENCRYPTION_KEY** | ⚠️ Opcional | 🔐 Pode gerar | ✅ Sim | Médio - se não existir, gera automaticamente |

---

## 🔑 Explicação Detalhada de Cada Variável

### 1️⃣ NEXTAUTH_SECRET

#### O que é?
Uma chave aleatória e segura usada para **criptografar JWT tokens** de sessão.

#### Por que é necessária?
```
Quando você faz login:
1. Usuario coloca email + senha
2. NextAuth valida no banco de dados
3. NextAuth GERA um JWT token (um "cartão de identidade")
4. JWT é CRIPTOGRAFADO com NEXTAUTH_SECRET
5. JWT é enviado no navegador (seguro porque está criptografado)
6. Em cada requisição, o JWT é descriptografado usando NEXTAUTH_SECRET
7. Se a chave estiver diferente, o token fica inválido → logout automático
```

#### Como é gerada?
- **Status Atual**: ✅ JÁ FOI GERADA
- **Valor**: `1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=`
- **Processo**: Gerada com algoritmo criptográfico seguro (PBKDF2 ou similar)
- **Tamanho**: 32 caracteres mínimo (a sua tem 44 - muito bom)

#### É fixa?
✅ **SIM, MUITO FIXA!**
- Se você mudar durante a produção, **TODOS os usuários serão deslogados**
- Imagine: JWT gerado com a chave A, mas você tenta descriptografar com chave B
- Resultado: Erro de autenticação → usuário logout involuntário
- **Solução**: Use a mesma chave sempre (local, staging, produção)

#### Impacto se não estiver configurada?
```
❌ Erro: NEXTAUTH_SECRET is not set
Resultado: 
  - Login falha
  - Aplicação não inicia em produção
  - Usuários não conseguem acessar
Severidade: 🔴 CRÍTICA
```

#### Onde configurar?
- Local: `.env.local` (já está lá)
- Vercel: Settings > Environment Variables

---

### 2️⃣ NEXTAUTH_URL

#### O que é?
A URL raiz da sua aplicação. Usada para validar callbacks de autenticação.

#### Por que é necessária?
```
Fluxo OAuth/Redirect:
1. Usuário acessa https://skill-match-ai-lovat.vercel.app/login
2. NextAuth redireciona para provider (ex: Google, GitHub)
3. Provider depois redireciona de volta para: NEXTAUTH_URL/api/auth/callback/[provider]
4. Se NEXTAUTH_URL não combinar, o redirect falha
5. Segurança: evita que alguém redirecione para domínio errado

Exemplo:
- Usuário em: https://skill-match-ai-lovat.vercel.app
- Esperado voltar para: https://skill-match-ai-lovat.vercel.app/api/auth/callback
- Se NEXTAUTH_URL = http://localhost:3000 (ERRADO)
- ❌ Redirect falha e login não funciona
```

#### Como é gerada?
- **Não é "gerada"**, é configurada manualmente
- **Localmente**: `http://localhost:3000`
- **Em produção**: `https://skill-match-ai-lovat.vercel.app`
- **Processo**: Você define baseado em onde a app está rodando

#### É fixa?
✅ **SIM, FIXA POR AMBIENTE**
- Muda entre local/staging/produção
- MAS dentro de cada ambiente, deve ser sempre a mesma
- Se usar diferentes valores no mesmo ambiente, login quebra

#### Impacto se não estiver configurada?
```
❌ Erro: NEXTAUTH_URL is not set
Resultado:
  - Login funciona parcialmente
  - Mas redirect pós-login falha
  - Usuário fica em branco ou vê erro confuso
Severidade: 🔴 CRÍTICA
```

#### Onde configurar?
- Local: `.env.local` → `http://localhost:3000` ✅ (já está)
- Vercel: Settings > Environment Variables → `https://skill-match-ai-lovat.vercel.app`

---

### 3️⃣ DATABASE_URL

#### O que é?
Connection string do PostgreSQL. Contém as credenciais para conectar ao banco.

#### Por que é necessária?
```
Banco de dados precisa saber:
- Qual servidor PostgreSQL conectar?
- Qual a senha de acesso?
- Qual banco de dados usar?

Formato:
postgresql://usuario:senha@host:porta/database_name

Seu exemplo:
postgresql://postgres:senha123@localhost:5432/SkillMatchAI
                 ↑      ↑       ↑       ↑   ↑
              usuário  senha  hostname porta nome BD

Sem DATABASE_URL:
- Prisma não consegue conectar
- Queries ao banco falham
- App não consegue ler/escrever dados
```

#### Como é gerada?
- **Não é gerada**, é **fornecida pelo provedor**
- **Localmente**: Você cria/configura do PostgreSQL local
- **No Vercel**: Vercel Postgres gera automaticamente quando você cria o banco
- **Seu status**: ✅ JÁ EXISTE (você configurou Vercel Postgres)

#### É fixa?
✅ **SIM, MUITO FIXA**
- É a credencial do seu banco de dados
- Muda apenas se você trocar o servidor PostgreSQL
- NÃO deve ser compartilhada
- Contém senha real do banco

#### Impacto se não estiver configurada?
```
❌ Erro: PrismaClientInitializationError: Database connection failed
Resultado:
  - Nenhuma query ao banco funciona
  - Login falha (não consegue validar usuário no BD)
  - Análise de PDF falha (não consegue salvar no BD)
  - Qualquer operação de dados falha
Severidade: 🔴 CRÍTICA
```

#### Onde configurar?
- Local: `.env.local` → seu PostgreSQL local
- Vercel: Settings > Environment Variables → `postgres://...` (já está lá como SkillMatchAI_POSTGRES_URL)

**⚠️ ATENÇÃO**: Você configurou em Vercel com nome `SkillMatchAI_POSTGRES_URL`, mas o código procura por `DATABASE_URL`. Precisa mapear corretamente.

---

### 4️⃣ ENCRYPTION_KEY (Opcional)

#### O que é?
Chave para criptografar dados sensíveis armazenados no banco de dados.

#### Por que é necessária?
```
Alguns dados do usuário podem ser sensíveis:
- Tokens de terceiros
- Informações financeiras
- Dados pessoais criptografados

Exemplo de uso:
1. Usuário salva API key do Google Gemini
2. App criptografa com ENCRYPTION_KEY
3. Armazena no banco (agora está seguro)
4. Quando precisa usar, descriptografa com a mesma chave

Se alguém roubar o banco de dados:
- ✅ COM ENCRYPTION_KEY: dados aparecem como lixo criptografado
- ❌ SEM ENCRYPTION_KEY: dados aparecem em texto plano
```

#### Como é gerada?
- **Pode ser gerada** com ferramenta de números aleatórios
- **Ou**: App gera automaticamente se não encontrar a variável
- **Comando para gerar** (PowerShell):
```powershell
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
[System.Convert]::ToHexString($bytes)
```
- **Resultado**: String com 64 caracteres hexadecimais (exemplo: `a3f5c8e9d2b1...`)

#### É fixa?
✅ **SIM, DEVE SER FIXA**
- Se você muda a chave:
  - Dados antigos criptografados com chave A não conseguem ser descriptografados com chave B
  - Você perde acesso aos dados antigos criptografados
  - **NÃO MUDE sem backup**

#### Impacto se não estiver configurada?
```
⚠️ Aviso: ENCRYPTION_KEY not set, using random key
Resultado:
  - App gera chave aleatória cada vez que inicia
  - Dados criptografados na inicialização 1 não conseguem ser acessados na inicialização 2
  - ❌ Você PERDE dados sensíveis
  - ❌ Perfil do usuário pode não ser carregado

Severidade: 🟠 MÉDIA (quebra funcionalidades, mas não bloqueia login)
```

#### Onde configurar?
- Local: `.env.local` → opcional (gera automaticamente se não configurar)
- Vercel: Settings > Environment Variables → recomendado (para persistência)

---

## 📊 Comparação: Local vs Vercel

```
┌─────────────────┬──────────────────────────┬────────────────────────────┐
│   Variável      │      Local (.env)        │    Vercel (Settings)       │
├─────────────────┼──────────────────────────┼────────────────────────────┤
│ NEXTAUTH_SECRET │ 1KPwSLHeAc69pTKyq1...   │ 1KPwSLHeAc69pTKyq1... (MESMA) │
│ NEXTAUTH_URL    │ http://localhost:3000    │ https://skill-match...      │
│ DATABASE_URL    │ postgres://postgres:...  │ postgres://vercel...        │
│ ENCRYPTION_KEY  │ Opcional ou auto-gera    │ Opcional (recomendado)     │
└─────────────────┴──────────────────────────┴────────────────────────────┘
```

**Regra de Ouro**: 
- ✅ Use a mesma `NEXTAUTH_SECRET` em todos os lugares
- ✅ Mude `NEXTAUTH_URL` conforme o ambiente
- ✅ Use `DATABASE_URL` diferente para cada banco
- ✅ Mantenha `ENCRYPTION_KEY` consistente se usar

---

## 🚨 Cenários de Erro e Soluções

### Cenário 1: "Invalid JWT Token"
```
Causa: NEXTAUTH_SECRET diferente entre sistemas
Exemplo:
  - Local: NEXTAUTH_SECRET = ABC123
  - Vercel: NEXTAUTH_SECRET = XYZ789
  - JWT criado com ABC123 não consegue ser lido com XYZ789

Solução:
  1. Use a MESMA NEXTAUTH_SECRET em todos os ambientes
  2. Copie exatamente: 1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=
  3. Não adicione/remova espaços
```

### Cenário 2: "OAuth callback failed"
```
Causa: NEXTAUTH_URL não combina com URL real
Exemplo:
  - Usuário acessa: https://skill-match-ai-lovat.vercel.app
  - NEXTAUTH_URL = http://localhost:3000
  - Callback vai para localhost que não existe em produção

Solução:
  1. Configure NEXTAUTH_URL = https://skill-match-ai-lovat.vercel.app
  2. Deve ser HTTPS em produção
  3. Deve ser http://localhost:3000 em local
```

### Cenário 3: "Cannot connect to database"
```
Causa: DATABASE_URL apontando para servidor errado
Exemplo:
  - DATABASE_URL = postgres://localhost:5432/db (local)
  - Localhost não existe no Vercel
  - Conexão falha

Solução:
  1. Use DATABASE_URL do Vercel Postgres (não localhost)
  2. Verifique se host é acessível publicamente
  3. Se usar banco local, coloque nome de domínio ou IP público
```

### Cenário 4: "Data decryption failed"
```
Causa: ENCRYPTION_KEY mudou ou não foi configurada
Exemplo:
  - Dados criptografados com chave A
  - App reinicia com chave B (ou aleatória)
  - Decrypt falha

Solução:
  1. Gere ENCRYPTION_KEY segura uma vez
  2. Configure em Vercel
  3. Nunca mude depois (a menos que você limpe dados antigos)
```

---

## ✅ Checklist: O Que Você Precisa Fazer

### Para Deploy no Vercel

#### Variável 1: NEXTAUTH_SECRET
- [ ] Vai para Vercel Settings > Environment Variables
- [ ] Nome: `NEXTAUTH_SECRET`
- [ ] Valor: `1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=`
- [ ] Environments: Production, Preview, Development
- [ ] Clique Save

#### Variável 2: NEXTAUTH_URL
- [ ] Vai para Vercel Settings > Environment Variables
- [ ] Nome: `NEXTAUTH_URL`
- [ ] Valor: `https://skill-match-ai-lovat.vercel.app`
- [ ] Environments: Production, Preview, Development
- [ ] Clique Save

#### Variável 3: DATABASE_URL
- [ ] Verifique em Vercel Storage > Databases
- [ ] Copie a `DATABASE_URL` do seu PostgreSQL
- [ ] Vá para Settings > Environment Variables
- [ ] Nome: `DATABASE_URL`
- [ ] Valor: (copiar do Storage)
- [ ] Clique Save

#### Variável 4: ENCRYPTION_KEY (Opcional)
- [ ] Gere com o comando PowerShell acima
- [ ] Vá para Vercel Settings > Environment Variables
- [ ] Nome: `ENCRYPTION_KEY`
- [ ] Valor: (resultado do comando)
- [ ] Clique Save

---

## 🎓 Resumo em Uma Frase

| Variável | Resumo |
|----------|--------|
| **NEXTAUTH_SECRET** | Chave para criptografar JWTs de login |
| **NEXTAUTH_URL** | URL da sua aplicação em produção |
| **DATABASE_URL** | Credenciais do banco PostgreSQL |
| **ENCRYPTION_KEY** | Chave para criptografar dados sensíveis (opcional) |

---

## 🔗 Relacionamento Entre Variáveis

```
┌─────────────────────────────────────────────────────────┐
│                    SkillMatchAI App                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Usuário acessa: NEXTAUTH_URL                          │
│       ↓                                                  │
│  Faz login (email + senha)                             │
│       ↓                                                  │
│  App valida no: DATABASE_URL                           │
│       ↓                                                  │
│  Se OK, cria JWT com: NEXTAUTH_SECRET                  │
│       ↓                                                  │
│  Dados sensíveis criptografados com: ENCRYPTION_KEY    │
│       ↓                                                  │
│  JWT é salvo no navegador (cookie)                     │
│       ↓                                                  │
│  Próximas requisições usam JWT                         │
│       ↓                                                  │
│  JWT é descriptografado com: NEXTAUTH_SECRET           │
│       ↓                                                  │
│  Se válido: acesso concedido ✅                        │
│  Se inválido: logout automático ❌                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Próximas Etapas

1. **Gerar ENCRYPTION_KEY** (opcionalmente):
```powershell
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
[System.Convert]::ToHexString($bytes)
```

2. **Copiar resultado** (será algo como: `a3f5c8e9d2b1...`)

3. **Ir para Vercel Dashboard**:
   - Settings > Environment Variables
   - Adicionar as 4 variáveis

4. **Clicar Save**
   - Vercel vai redeployar automaticamente

5. **Testar em produção**:
   - Acessar https://skill-match-ai-lovat.vercel.app
   - Tentar fazer login
   - Verificar se tudo funciona

Quer que eu gere a ENCRYPTION_KEY agora e configure tudo automaticamente?
