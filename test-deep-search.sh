#!/bin/bash

# Script para testar o endpoint de deep search de vagas
# Uso: ./test-deep-search.sh <sua-chave-gemini>

API_KEY="${1:-$(grep NEXT_PUBLIC_GEMINI_API_KEY .env.local | cut -d'=' -f2)}"

if [ -z "$API_KEY" ]; then
  echo "❌ Erro: Forneça a chave Gemini como argumento ou configure NEXT_PUBLIC_GEMINI_API_KEY no .env.local"
  echo "Uso: ./test-deep-search.sh <sua-chave-gemini>"
  exit 1
fi

echo "🚀 Testando endpoint de deep search de vagas..."
echo "📍 URL: http://localhost:3000/api/jobs/deep-search"
echo "🔑 API Key: ${API_KEY:0:10}...${API_KEY: -5}"
echo ""

# Exemplo de payload
PAYLOAD=$(cat <<EOF
{
  "description": "Sou desenvolvedor com 5 anos de experiência em React, Node.js e TypeScript. Tenho experiência em projetos de e-commerce, SaaS e API REST. Busco uma oportunidade como Tech Lead ou Senior Developer em uma startup inovadora. Tenho interesse em cloud computing, arquitetura de software e mentoría de equipes. Falo inglês fluente e tenho noção de DevOps.",
  "resumeText": "Experiência: 5 anos como Full Stack Developer - React, Node.js, TypeScript, PostgreSQL, Docker, AWS. Certificações: AWS Solutions Architect. Projetos principais: E-commerce com 100k usuários, SaaS para análise de dados.",
  "apiKey": "$API_KEY"
}
EOF
)

echo "📤 Enviando requisição..."
echo ""

curl -X POST http://localhost:3000/api/jobs/deep-search \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --compressed \
  -s | jq '.' 2>/dev/null || \
curl -X POST http://localhost:3000/api/jobs/deep-search \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --compressed

echo ""
echo "✅ Teste concluído!"
