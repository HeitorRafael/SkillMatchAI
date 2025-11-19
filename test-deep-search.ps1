# Script PowerShell para testar o endpoint de deep search de vagas
# Uso: .\test-deep-search.ps1 -ApiKey "sua-chave-gemini"

param(
    [string]$ApiKey
)

# Se não forneceu a chave, tenta ler do .env.local
if ([string]::IsNullOrEmpty($ApiKey)) {
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local" -Raw
        $match = [regex]::Match($envContent, 'NEXT_PUBLIC_GEMINI_API_KEY=(.+)')
        if ($match.Success) {
            $ApiKey = $match.Groups[1].Value.Trim()
        }
    }
}

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "❌ Erro: Forneça a chave Gemini com -ApiKey ou configure NEXT_PUBLIC_GEMINI_API_KEY no .env.local" -ForegroundColor Red
    Write-Host "Uso: .\test-deep-search.ps1 -ApiKey 'sua-chave-gemini'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Testando endpoint de deep search de vagas..." -ForegroundColor Green
Write-Host "📍 URL: http://localhost:3000/api/jobs/deep-search" -ForegroundColor Cyan
Write-Host "🔑 API Key: $($ApiKey.Substring(0, 10))...$($ApiKey.Substring($ApiKey.Length - 5))" -ForegroundColor Cyan
Write-Host ""

# Payload de teste
$payload = @{
    description = "Sou desenvolvedor com 5 anos de experiência em React, Node.js e TypeScript. Tenho experiência em projetos de e-commerce, SaaS e API REST. Busco uma oportunidade como Tech Lead ou Senior Developer em uma startup inovadora. Tenho interesse em cloud computing, arquitetura de software e mentoría de equipes. Falo inglês fluente e tenho noção de DevOps."
    resumeText = "Experiência: 5 anos como Full Stack Developer - React, Node.js, TypeScript, PostgreSQL, Docker, AWS. Certificações: AWS Solutions Architect. Projetos principais: E-commerce com 100k usuários, SaaS para análise de dados."
    apiKey = $ApiKey
} | ConvertTo-Json

Write-Host "📤 Enviando requisição..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/jobs/deep-search" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $payload `
        -UseBasicParsing

    # Tentar fazer parse como JSON para formatar melhor
    $jsonResponse = $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host $jsonResponse -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro na requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorContent = $streamReader.ReadToEnd()
        Write-Host "Conteúdo da resposta:" -ForegroundColor Red
        Write-Host $errorContent -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "✅ Teste concluído!" -ForegroundColor Green

# Mostrar resumo
Write-Host ""
Write-Host "📊 RESUMO DA RESPOSTA:" -ForegroundColor Cyan
try {
    $jsonResponse = $response.Content | ConvertFrom-Json
    if ($jsonResponse.metadata) {
        Write-Host "   Total de vagas: $($jsonResponse.metadata.totalJobs)" -ForegroundColor White
        Write-Host "   - Match perfeito: $($jsonResponse.metadata.exactMatchCount)" -ForegroundColor Green
        Write-Host "   - Alternativas: $($jsonResponse.metadata.alternativeCount)" -ForegroundColor Yellow
    }
}
catch {
    # Ignorar erros de parse
}
