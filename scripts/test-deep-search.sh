#!/bin/bash

# Script para testar Deep Search de Vagas com curl
# Uso: ./test-deep-search.sh

DESCRIPTION="${1:-Desenvolvedor Full Stack com 5 anos de experiência em React, Node.js e TypeScript. Busco oportunidades em empresas que valorizem inovação e crescimento profissional.}"
API_KEY="${2:-$NEXT_PUBLIC_GEMINI_API_KEY}"
RESUME_TEXT="${3:-Desenvolvedor Full Stack | React, Node.js, TypeScript, AWS, Docker}"
BASE_URL="${4:-http://localhost:3000}"

if [ -z "$API_KEY" ]; then
    echo "❌ Erro: API key não fornecida"
    echo "Uso: ./test-deep-search.sh \"descrição\" \"api-key\" \"currículo\""
    exit 1
fi

echo "🚀 Iniciando Deep Search de Vagas..."
echo "📝 Descrição: $DESCRIPTION"
echo "📄 Currículo: $RESUME_TEXT"
echo ""

PAYLOAD=$(cat <<EOF
{
  "description": "$DESCRIPTION",
  "resumeText": "$RESUME_TEXT",
  "apiKey": "$API_KEY"
}
EOF
)

echo "📡 Enviando requisição..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/jobs/deep-search" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "$RESPONSE" | jq '.' > response.json
echo "✨ Resposta salva em response.json"

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ Análise concluída!"
    echo ""
    echo "📊 RESUMO:"
    echo "  Total: $(echo $RESPONSE | jq '.summary.totalJobs')"
    echo "  Match Perfeito: $(echo $RESPONSE | jq '.summary.perfectMatches')"
    echo "  Alternativas: $(echo $RESPONSE | jq '.summary.alternatives')"
    echo ""
    echo "💼 Primeiras 3 vagas:"
    echo $RESPONSE | jq '.jobs[0:3][] | "\(.id). \(.title) - \(.company) (\(.score)%)"'
else
    echo "❌ Erro: $(echo $RESPONSE | jq '.error')"
fi
