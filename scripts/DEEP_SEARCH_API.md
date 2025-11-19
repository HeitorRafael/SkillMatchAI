# 🔍 Deep Search API - Análise Inteligente de Vagas com Gemini

## Visão Geral

Este endpoint realiza uma análise profunda do perfil profissional do usuário utilizando a API Gemini para gerar 20 vagas personalizadas:
- **10 vagas de match perfeito** (alinhadas com currículo e perfil)
- **10 vagas alternativas** (baseadas apenas em skills, sem contexto)

## Como Funciona

### Etapas da Análise

1. **Análise do Perfil**: Extrai informações da descrição do usuário
2. **Análise do Currículo**: Identifica skills, experiência e especialidades
3. **Geração de Prompts**: Cria prompts otimizados e específicos
4. **Busca de Vagas Perfeitas**: Encontra 10 vagas com match perfeito
5. **Busca de Vagas Alternativas**: Encontra 10 vagas alternativas baseadas em skills

## 🚀 Como Testar

### Opção 1: PowerShell (Windows)

```powershell
cd c:\DESENVOLVIMENTO\SkillMatchAIv3\skillmatchai

# Teste básico com perfil padrão
.\scripts\test-deep-search.ps1

# Teste com perfil customizado
.\scripts\test-deep-search.ps1 `
  -description "Sou um engenheiro de dados com 7 anos de experiência em Python, SQL e Spark. Busco trabalhar em startups inovadoras." `
  -apiKey "sua-chave-gemini-aqui"
```

### Opção 2: CURL (Linux/Mac)

```bash
cd c:\DESENVOLVIMENTO\SkillMatchAIv3\skillmatchai

# Teste básico
./scripts/test-deep-search.sh

# Teste customizado
./scripts/test-deep-search.sh \
  "Desenvolv Full Stack com React e Node.js" \
  "sua-chave-gemini" \
  "5 anos experiência em web"
```

### Opção 3: CURL Manual (Windows/Linux/Mac)

```bash
curl -X POST http://localhost:3000/api/jobs/deep-search \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Sou desenvolvedor full stack com 5 anos. React, Node.js, TypeScript. Busco inovação.",
    "resumeText": "Full Stack Dev | React, Node.js, TS, AWS, Docker | 5 anos",
    "apiKey": "sua-chave-gemini"
  }' | jq '.'
```

## 📋 Request

```json
{
  "description": "string - Descrição do perfil profissional (obrigatório)",
  "resumeText": "string - Currículo/resume em texto (opcional)",
  "apiKey": "string - Chave da API Gemini (obrigatório)"
}
```

## 📤 Response

```json
{
  "success": true,
  "profileAnalysis": {
    "careerGoal": "string",
    "currentFocus": "string",
    "desiredEnvironment": "string",
    "importantFactors": ["..."],
    "growthAreas": ["..."],
    "workPreferences": {
      "remote": "yes|no|hybrid",
      "teamSize": "startup|small|medium|large|enterprise",
      "industry": ["..."]
    }
  },
  "resumeAnalysis": {
    "skills": ["..."],
    "seniority": "junior|pleno|sênior|lead|especialista",
    "yearsOfExperience": 5,
    "primaryRole": "string",
    "specialties": ["..."],
    "strengths": ["..."],
    "certifications": ["..."],
    "languages": ["..."],
    "industryExperience": ["..."],
    "toolsAndTechnologies": ["..."],
    "softSkills": ["..."]
  },
  "jobs": [
    {
      "id": 1,
      "title": "string",
      "company": "string",
      "location": "string",
      "remote": "remote|hybrid|onsite",
      "salary": "R$ X.XXX - R$ X.XXX",
      "type": "CLT|PJ|Autônomo",
      "score": 95,
      "matchType": "perfect|alternative",
      "filterCategory": "core_match|skill_focus|industry_pivot|growth_opportunity",
      "description": "string",
      "tags": ["tag1", "tag2", "..."],
      "insights": ["insight1", "insight2", "insight3", "insight4"],
      "requirements": ["req1", "req2", "req3"],
      "benefits": ["benefit1", "benefit2", "benefit3"],
      "postedDays": 2
    }
  ],
  "summary": {
    "totalJobs": 20,
    "perfectMatches": 10,
    "alternatives": 10,
    "averageScore": "82.5"
  },
  "timestamp": "2025-11-19T..."
}
```

## 🎯 Tipos de Match

### Perfect Match (10 vagas)
- Score: 85-100%
- Categoria: `core_match`
- Alinhadas com currículo + descrição do perfil
- Mesma senioridade + skills relevantes

### Alternative Match (10 vagas)
- Score: 60-85%
- Categorias variadas:
  - `skill_focus`: Foco em skills específicas
  - `industry_pivot`: Pivot para novo setor
  - `growth_opportunity`: Oportunidade de crescimento
  - `certification_path`: Caminho com certificações
  - `side_project`: Oportunidade paralela
- Baseadas APENAS em skills, sem contexto

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

```env
NEXT_PUBLIC_GEMINI_API_KEY=sua-chave-aqui
```

### Como obter a chave Gemini API

1. Acesse [Google AI Studio](https://aistudio.google.com/app/api-keys)
2. Clique em "Get API Key"
3. Selecione um projeto ou crie um novo
4. Copie a chave e salve em `.env.local`

## 📊 Exemplos de Uso

### Desenvolvedor Full Stack

```bash
curl -X POST http://localhost:3000/api/jobs/deep-search \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Full Stack Dev com 5 anos em React e Node.js. Busco trabalhar em startups inovadoras com bom clima.",
    "resumeText": "React | Node.js | TypeScript | PostgreSQL | Docker | AWS | 5 anos de experiência",
    "apiKey": "sua-chave"
  }'
```

### Engenheiro de Dados

```bash
curl -X POST http://localhost:3000/api/jobs/deep-search \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Data Engineer com foco em big data. Python, Spark, SQL. Busco trabalhar com dados em escala.",
    "resumeText": "Python | Spark | SQL | Hadoop | PostgreSQL | 7 anos | Certified GCP",
    "apiKey": "sua-chave"
  }'
```

## 📁 Output

Os scripts salvam a resposta completa em `response.json` no diretório atual.

```bash
cat response.json | jq '.jobs[] | {id, title, company, score, matchType}'
```

## ⚙️ Troubleshooting

### Erro: "API key necessária"
- Verifique se a chave foi passada ou está em `NEXT_PUBLIC_GEMINI_API_KEY`

### Erro: "Gemini Error"
- Verifique se a chave está correta
- Tente chamar diretamente em [Google AI Studio](https://aistudio.google.com)

### Timeout
- Aumentar timeout no script (padrão 300s)
- Verificar velocidade da internet

## 🎨 Próximas Melhorias

- [ ] Caching de análises
- [ ] Filtros por faixa salarial
- [ ] Preferências por localização
- [ ] Integração com LinkedIn
- [ ] Score de viabilidade de entrevista
