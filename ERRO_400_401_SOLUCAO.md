# ⚡ ERRO 400/401 - Solução Rápida

## 🔴 Problema

```
Failed to load resource: the server responded with a status of 400/401
/api/auth/callback/credentials
```

## 🎯 Causas Possíveis (em ordem de probabilidade)

1. **Variáveis não configuradas no Vercel**
   - `NEXTAUTH_SECRET` ❌
   - `NEXTAUTH_URL` ❌
   - `DATABASE_URL` ❌

2. **Banco de dados vazio (sem usuários)**
   - Você criou novo banco no Vercel Postgres
   - Não rodou migrations
   - Resultado: Nenhum usuário existe para login

3. **Banco conectado, mas sem dados**
   - Usuário não foi criado
   - Email diferente
   - Senha diferente

---

## ✅ PASSO 1: Verificar Variáveis

Abra em seu navegador:
```
https://skill-match-ai-lovat.vercel.app/api/debug/env
```

Você deve ver:
```json
{
  "NEXTAUTH_SECRET": "✅ SET",
  "NEXTAUTH_URL": "https://skill-match-ai-lovat.vercel.app",
  "DATABASE_URL": "✅ SET (masked)"
}
```

Se algum tiver `❌ MISSING`, configure agora no Vercel:
1. Vercel Dashboard
2. Projeto: skill-match-ai-lovat
3. Settings > Environment Variables
4. Adicione as 3 variáveis

---

## ✅ PASSO 2: Verificar Banco de Dados

Abra em seu navegador:
```
https://skill-match-ai-lovat.vercel.app/api/debug/db
```

Você deve ver:
```json
{
  "status": "OK",
  "message": "Database connection successful",
  "userCount": 0 ou mais
}
```

Se error, o banco não está configurado corretamente.

---

## ✅ PASSO 3: Criar Um Usuário

Se `userCount` é 0, você precisa registrar um usuário NOVO:

1. Acesse: https://skill-match-ai-lovat.vercel.app
2. Clique em "Sign Up" ou "Cadastro"
3. Preencha:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Password123!@#`
4. Clique "Register"

**Espere 2-3 segundos** - se não aparecer erro, user foi criado!

---

## ✅ PASSO 4: Fazer Login

1. Agora acesse o login
2. Email: `test@example.com`
3. Senha: `Password123!@#`
4. Clique "Sign In"

Se aparecer error 400/401:
- Verifique se as variáveis estão mesmo SET (passo 1)
- Verifique se o usuário foi criado (passo 3)
- Tente novamente em 5 segundos

---

## 🔧 Soluções Rápidas

### Se erro persistir

**Opção 1: Clear Cache**
```
1. Abra DevTools (F12)
2. Clique em Application
3. Clique em Cookies
4. Delete todos os cookies do domínio
5. Recarregue a página
6. Tente novamente
```

**Opção 2: Incógnito**
```
1. Abra uma aba em Modo Incógnito
2. Acesse https://skill-match-ai-lovat.vercel.app
3. Tente fazer login
4. Sem cache, funciona melhor
```

**Opção 3: Novo Deploy**
```
1. Vercel Dashboard
2. Deployments
3. Clique em "Redeploy"
4. Aguarde terminar
5. Tente novamente
```

---

## 🚨 Se Tudo Falhar

1. Abra Vercel Logs:
   ```
   Vercel Dashboard > Deployments > [Latest] > Logs
   ```

2. Procure por erros relacionados a:
   - `NEXTAUTH_SECRET`
   - `DATABASE_URL`
   - `Prisma`

3. Copie o erro e compartilhe

---

## 🎯 Resumo

```
Erro 400/401 = Autenticação falhando

Checklist rápido:
☐ Variáveis configuradas (teste em /api/debug/env)
☐ Banco conectando (teste em /api/debug/db)
☐ Usuário existe (veja userCount > 0)
☐ Credenciais corretas (email/senha exatos)
☐ Cache limpo
☐ Tente em modo incógnito
☐ Se não funcionar, compartilhe logs do Vercel
```

---

**Faça isso e volta com resultado!** 👇
