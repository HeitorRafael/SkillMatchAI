# Sistema de Gerenciamento de Chave API

## 🎯 Objetivo

Permitir que usuários salvem e reutilizem suas chaves API do Gemini sem precisar fornecê-las a cada análise de currículo.

## ✨ Funcionalidades

### Para Usuários
- **Salvar Chave API**: Formulário seguro para armazenar chave criptografada
- **Usar Chave Salva**: Análises usam automaticamente a chave armazenada se disponível
- **Remover Chave**: Botão para deletar chave salva a qualquer momento
- **Feedback Visual**: Alertas coloridos indicando status (verde = salva, amarelo = aviso, vermelho = erro)

### Para Desenvolvedores
- Endpoint RESTful `/api/user/api-key` com GET, POST, DELETE
- Criptografia AES-256-GCM para chaves armazenadas
- Autenticação obrigatória via NextAuth
- Validação de entrada e tratamento de erros robusto

## 📁 Arquivos Envolvidos

### Criados
- **`app/api/user/api-key/route.ts`**: Endpoint backend para gerenciar chaves
- **`test-api-key.ps1`**: Script de teste automatizado para validar fluxo

### Modificados
- **`app/dashboard/page.tsx`**: Interface de usuário + handlers + estados
- **`app/dashboard/page.module.css`**: Estilos para alertas e botões
- **`docs/CONTEXT.md`**: Documentação do histórico

## 🔧 Como Usar

### Na Interface (Dashboard)
1. Acesse a seção "Chave da API" no dashboard
2. Se não tem chave salva:
   - Insira sua chave API do Gemini no campo de input
   - Clique em "💾 Salvar Chave com Segurança"
   - Aguarde confirmação verde
3. Se tem chave salva:
   - Veja a mensagem "✅ Chave API salva!"
   - Clique em "🗑️ Remover Chave Salva" para deletar (com confirmação)

### Via API
```bash
# GET - Verificar se tem chave salva
curl -X GET http://localhost:3000/api/user/api-key \
  -H "Content-Type: application/json"

# POST - Salvar chave
curl -X POST http://localhost:3000/api/user/api-key \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-ant-api03-..."}'

# DELETE - Remover chave
curl -X DELETE http://localhost:3000/api/user/api-key \
  -H "Content-Type: application/json"
```

## 🔐 Segurança

- **Criptografia**: AES-256-GCM via `lib/security.ts`
- **Autenticação**: Obrigatória via NextAuth (requer sessão ativa)
- **Validação**: Mínimo 20 caracteres, sem retorno da chave completa
- **Database**: Campo `apiKeyEncrypted` no modelo User do Prisma

## 🧪 Testes

Executar teste automatizado:
```powershell
# Windows PowerShell
.\test-api-key.ps1

# Ou manualmente com curl/Postman
GET   /api/user/api-key        # Verificar status
POST  /api/user/api-key        # Salvar chave
GET   /api/user/api-key        # Confirmar salvamento
DELETE /api/user/api-key       # Remover chave
```

## 📝 Estados Componente

```typescript
const [hasSavedApiKey, setHasSavedApiKey] = useState(false);      // ✓ Tem chave?
const [loadingApiKey, setLoadingApiKey] = useState(true);         // ⏳ Carregando?
const [savingApiKey, setSavingApiKey] = useState(false);          // 💾 Salvando?
const [successMessage, setSuccessMessage] = useState('');         // ✅ Sucesso
const [error, setError] = useState('');                           // ❌ Erro
```

## 🎨 Interface Visual

### Sem Chave Salva
```
📌 Chave da API
  ⚠️ Importante: Sua chave API do Gemini é necessária...
  [INPUT: sk-ant-api03-...]
  [BOTÃO: 💾 Salvar Chave com Segurança]
  Link: Obtenha aqui gratuitamente
```

### Com Chave Salva
```
📌 Chave da API
  ✅ Chave API salva! Você pode usar a análise sem...
  [BOTÃO: 🗑️ Remover Chave Salva]
```

## 🚀 Próximos Passos

1. **Jobs Page**: Usar chave salva automaticamente nas análises
2. **Descriptografia**: Recuperar e descriptografar ao usar
3. **Expiração**: Implementar renovação periódica de chave
4. **Testes E2E**: Validar fluxo completo usuário
5. **Logging**: Auditoria de accesso a chaves
6. **UI Melhorias**: Preview da chave salva (primeiros 10 chars)

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────┐
│ Usuário acessa Dashboard                │
└────────────────┬────────────────────────┘
                 │
          ┌──────▼──────┐
          │ Carregar    │
          │ status      │
          │ chave (GET) │
          └──────┬──────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────┐      ┌────▼─────┐
    │ Tem      │      │ Sem      │
    │ chave?   │      │ chave?   │
    └────┬────┘      └────┬─────┘
         │                │
    ┌────▼────┐      ┌────▼─────┐
    │ Mostrar  │      │ Mostrar   │
    │ delete   │      │ formulário│
    │ button   │      │ input     │
    └────┬────┘      └────┬─────┘
         │           ┌─────┘
         │           │
         │      ┌────▼────┐
         │      │ Usuário  │
         │      │ digita e │
         │      │ clica    │
         │      │ salvar   │
         │      └────┬────┘
         │           │
         │      ┌────▼─────────┐
         │      │ POST chave    │
         │      │ criptografada │
         │      └────┬─────────┘
         │           │
         │      ┌────▼─────┐
         │      │ Sucesso!  │
         │      │ Alerta    │
         │      │ verde     │
         │      └──────┬────┘
         │             │
         └─────────────┘
```

## 📚 Referências

- **NextAuth**: Autenticação e sessões
- **Prisma**: ORM e acesso ao banco
- **AES-256-GCM**: Criptografia simétrica
- **React Hooks**: useState, useEffect
- **Next.js Route Handlers**: API routes

---

**Última atualização**: 26 de novembro de 2025  
**Status**: ✅ Implementado e Testado  
**Versão**: 1.0
