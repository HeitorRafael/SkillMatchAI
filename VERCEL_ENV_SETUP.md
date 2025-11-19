# 🚨 Como Configurar Variáveis de Ambiente no Vercel

## Problema Atual
Você está recebendo erro `500` em `/api/auth/_log` porque as variáveis de ambiente não estão configuradas corretamente no Vercel.

## Solução: Configurar Variáveis no Painel Vercel

### Passo 1: Acessar o Painel
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto: `skill-match-ai-lovat`
3. Clique em: **Settings** (Engrenagem no topo)

### Passo 2: Ir para Environment Variables
- No menu esquerdo, clique em: **Environment Variables**

### Passo 3: Adicionar Variáveis Obrigatórias

#### A. NEXTAUTH_SECRET
```
Nome: NEXTAUTH_SECRET
Valor: 1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=
```
⚠️ **IMPORTANTE**: Use o mesmo valor do seu `.env` local

#### B. NEXTAUTH_URL
```
Nome: NEXTAUTH_URL
Valor: https://skill-match-ai-lovat.vercel.app
```

#### C. DATABASE_URL
```
Nome: DATABASE_URL
Valor: postgresql://seu_usuario:sua_senha@seu_host:5432/SkillMatchAI
```

⚠️ **IMPORTANTE**: 
- `seu_usuario` = usuário PostgreSQL
- `sua_senha` = senha do PostgreSQL
- `seu_host` = host/IP do servidor (não pode ser `localhost`)
- `SkillMatchAI` = nome do banco de dados

**Exemplo válido**:
```
postgresql://postgres:senha123@152.67.99.55:5432/SkillMatchAI
```

#### D. NEXT_PUBLIC_GEMINI_API_KEY
```
Nome: NEXT_PUBLIC_GEMINI_API_KEY
Valor: AIzaXyz123...
```

#### E. ENCRYPTION_KEY
```
Nome: ENCRYPTION_KEY
Valor: seu_encryption_key_aqui
```

### Passo 4: Salvar e Re-deploy
1. Clique em **Save**
2. Todas as variáveis aparecerão na lista
3. O Vercel irá fazer re-deploy automático
4. Espere 1-2 minutos

### Passo 5: Testar
- Acesse: https://skill-match-ai-lovat.vercel.app
- Tente fazer login
- Se ainda houver erro, verifique se o PostgreSQL está acessível de fora

---

## ⚠️ Problemas Comuns

### Erro: "Failed to connect to PostgreSQL"
**Causa**: O PostgreSQL local (`localhost`) não é acessível do Vercel

**Solução**: Use um PostgreSQL gerenciado:
- **Recomendado**: Vercel Postgres (integrado)
- **Alternativa 1**: AWS RDS
- **Alternativa 2**: Railway
- **Alternativa 3**: Digital Ocean

### Erro: "NEXTAUTH_SECRET is invalid"
**Causa**: NEXTAUTH_SECRET não configurado ou vazio

**Solução**: 
1. Copie exatamente: `1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=`
2. Cole no Vercel sem adicionar/remover caracteres
3. Clique **Save**

### Erro: "JWT_SESSION_ERROR"
**Causa**: Session strategy ou secret incorreto

**Solução**: 
1. Certifique-se que `NEXTAUTH_SECRET` tem pelo menos 32 caracteres
2. Não use aspas no Vercel: `"1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk="`

---

## 📋 Checklist

- [ ] Acessei Vercel > Settings > Environment Variables
- [ ] Adicionei `NEXTAUTH_SECRET`
- [ ] Adicionei `NEXTAUTH_URL`
- [ ] Adicionei `DATABASE_URL` (com host acessível, não localhost)
- [ ] Adicionei `NEXT_PUBLIC_GEMINI_API_KEY`
- [ ] Adicionei `ENCRYPTION_KEY`
- [ ] Cliquei **Save**
- [ ] Aguardei re-deploy automático (1-2 min)
- [ ] Testei em https://skill-match-ai-lovat.vercel.app

---

## 🔗 Usando Vercel Postgres (Recomendado)

Se você quer usar o PostgreSQL gerenciado do Vercel:

1. No painel Vercel, vá em **Storage**
2. Clique **Create Database > Postgres**
3. A `DATABASE_URL` será criada automaticamente
4. Já virá configurada nas variáveis de ambiente

---

## 🚀 Próximas Etapas

Após configurar as variáveis:
1. O Vercel fará re-deploy automático
2. Você poderá fazer login normalmente
3. O PDF upload funcionará
4. A análise com Gemini funcionará

Se ainda tiver problemas, compartilhe o erro específico!
