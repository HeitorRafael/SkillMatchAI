# 🔐 Guia de Segurança das Variáveis de Ambiente

## Resumo das Variáveis Necessárias

### ✅ OBRIGATÓRIAS (Vercel + Local)
Estas variáveis são **NECESSÁRIAS** para a aplicação funcionar:

#### 1. **NEXTAUTH_SECRET**
- **O que é**: Chave para criptografar JWT tokens de sessão
- **Exposição**: ❌ **NUNCA expor** (armazenada apenas no servidor)
- **Como gerar**: Já foi gerado: `1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=`
- **Onde configurar**: 
  - `.env.local` (local)
  - Settings > Environment Variables (Vercel)
- **Obrigatório em**: Produção (Vercel)

#### 2. **NEXTAUTH_URL**
- **O que é**: URL onde a aplicação está hospedada
- **Exposição**: ✅ Pode ser exposta (é pública)
- **Valor local**: `http://localhost:3000`
- **Valor Vercel**: `https://skill-match-ai-lovat.vercel.app`
- **Onde configurar**: `.env.local` + Vercel
- **Obrigatório em**: Produção (Vercel)

#### 3. **DATABASE_URL**
- **O que é**: Connection string do PostgreSQL
- **Exposição**: ❌ **NUNCA expor** (contém credenciais)
- **Formato**: `postgresql://usuario:senha@host:porta/database`
- **Onde configurar**: `.env.local` + Vercel (como Secret)
- **Obrigatório em**: Produção (Vercel)
- **Nota**: Você já possui este valor no Vercel Postgres

---

### ⚠️ OPCIONAIS (Recomendadas)

#### 4. **NEXT_PUBLIC_GEMINI_API_KEY** *(NÃO USE ASSIM)*
- **O que é**: Chave da API do Google Gemini
- **Exposição**: ❌ **NÃO DEVE SER PÚBLICA** (apesar do prefixo `NEXT_PUBLIC_`)
- **Problema**: O prefixo `NEXT_PUBLIC_` expõe no client-side JavaScript
- **Solução Correta**: 
  1. Remover prefixo e usar apenas `GEMINI_API_KEY`
  2. Chamar API sempre do servidor (route handlers)
  3. Nunca expor para o navegador
- **Status Atual**: ❌ Não está sendo usada (a chave é enviada pelo cliente)
- **Recomendação**: **Gerar uma nova chave e usar como Secret no Vercel**

#### 5. **ENCRYPTION_KEY**
- **O que é**: Chave para criptografar dados sensíveis no banco
- **Exposição**: ❌ **NUNCA expor** (armazenada apenas no servidor)
- **Como gerar**: Automaticamente, mas pode ser customizada
- **Valor Atual**: Gerado aleatoriamente se não configurado
- **Onde configurar**: `.env.local` + Vercel (como Secret)
- **Nota**: Opcional pois a app gera automaticamente se não existir

---

## 📋 Variáveis Atualmente Necessárias

### Para Desenvolvimento Local
```env
# Obrigatórias
NEXTAUTH_SECRET=1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:senha123@localhost:5432/SkillMatchAI

# Opcionais (se a app gerar não precisa)
ENCRYPTION_KEY=sua_chave_aqui_ou_deixe_em_branco
```

### Para Vercel (Production)
```
Obrigatórias:
- NEXTAUTH_SECRET
- NEXTAUTH_URL  
- DATABASE_URL (via Vercel Postgres)

Recomendadas (opcionais):
- ENCRYPTION_KEY
```

---

## 🔧 Como Configurar no Vercel

### Passo 1: Settings > Environment Variables
1. Vá para https://vercel.com/dashboard
2. Selecione projeto `skill-match-ai-lovat`
3. Clique em **Settings** (engrenagem)
4. Clique em **Environment Variables** (esquerda)

### Passo 2: Adicionar Variáveis
Para cada variável, clique **Add New** e configure:

#### NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: 1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=
Environments: Production, Preview, Development
```

#### NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://skill-match-ai-lovat.vercel.app
Environments: Production, Preview, Development
```

#### DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://seu_user:sua_senha@host:5432/SkillMatchAI
Environments: Production, Preview, Development
```

#### ENCRYPTION_KEY (Opcional)
```
Name: ENCRYPTION_KEY
Value: [gerar com: openssl rand -hex 32]
Environments: Production, Preview, Development
```

### Passo 3: Salvar e Deploy
1. Clique **Save**
2. Vercel vai redeployar automaticamente
3. Aguarde 2-3 minutos

---

## ⚠️ Segurança: O Que NÃO Fazer

### ❌ NUNCA:
- ❌ Usar prefixo `NEXT_PUBLIC_` para chaves sensíveis
- ❌ Expor `DATABASE_URL` no cliente
- ❌ Expor `NEXTAUTH_SECRET` no cliente
- ❌ Expor `ENCRYPTION_KEY` no cliente
- ❌ Enviar chaves de API pelo formulário (sempre enviar pelo servidor)
- ❌ Commitar `.env` com valores reais no Git
- ❌ Compartilhar valores de chaves em Slack/Email

### ✅ SEMPRE:
- ✅ Usar `.env.local` (que está em `.gitignore`)
- ✅ Configurar variáveis no Vercel como "Secrets"
- ✅ Chamar APIs sensíveis sempre do servidor
- ✅ Validar e sanitizar inputs no servidor
- ✅ Usar HTTPS em produção (Vercel faz isso)

---

## 🔑 Gerando Chaves Seguras

### NEXTAUTH_SECRET (já foi gerado)
```bash
# Já existe: 1KPwSLHeAc69pTKyq16hUPWqLJQ4VsgOFVmMhp4YuKk=
# NÃO GERE NOVO - pode quebrar sessões existentes
```

### ENCRYPTION_KEY (novo, opcionalmente)
```bash
# Windows PowerShell:
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Linux/Mac:
openssl rand -hex 32
```

---

## 📊 Checklist de Segurança

- [ ] NEXTAUTH_SECRET configurada no Vercel
- [ ] NEXTAUTH_URL configurada no Vercel  
- [ ] DATABASE_URL configurada no Vercel
- [ ] `.env.local` está em `.gitignore`
- [ ] Nenhuma chave secreta no `.env` commitado
- [ ] Nunca usar `NEXT_PUBLIC_` para valores sensíveis
- [ ] API calls sensíveis sempre feitas do servidor
- [ ] HTTPS habilitado em produção (Vercel padrão)

---

## 🚨 Próximas Ações

1. ✅ Confirmar que variáveis obrigatórias existem no Vercel
2. ⏳ Gerar ENCRYPTION_KEY se quiser usar (opcional)
3. ⏳ Fazer commit das mudanças de código
4. ⏳ Vercel vai redeployar automaticamente
5. ⏳ Testar login em produção

**Você quer que eu gere a ENCRYPTION_KEY e configure tudo?**
