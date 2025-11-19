#!/usr/bin/env pwsh

# Script para testar Deep Search de Vagas
# Uso: .\test-deep-search.ps1 -description "Meu perfil" -apiKey "sua-chave-gemini" -resumeText "seu curriculo (opcional)"

param(
    [string]$description = "Desenvolvedor Full Stack com 5 anos de experiência em React, Node.js e TypeScript. Busco oportunidades em empresas que valorizem inovação e crescimento profissional.",
    [string]$apiKey = $env:NEXT_PUBLIC_GEMINI_API_KEY,
    [string]$resumeText = "Desenvolvedor Full Stack | React, Node.js, TypeScript, AWS, Docker",
    [string]$baseUrl = "http://localhost:3000"
)

if (-not $apiKey) {
    Write-Host "❌ Erro: API key não fornecida." -ForegroundColor Red
    Write-Host "Use: -apiKey 'sua-chave' ou defina NEXT_PUBLIC_GEMINI_API_KEY" -ForegroundColor Yellow
    exit 1
}

$body = @{
    description = $description
    resumeText = $resumeText
    apiKey = $apiKey
} | ConvertTo-Json

Write-Host "🚀 Iniciando Deep Search de Vagas..." -ForegroundColor Cyan
Write-Host "📝 Descrição: $description" -ForegroundColor Gray
Write-Host "📄 Currículo: $resumeText" -ForegroundColor Gray
Write-Host ""

$response = Invoke-WebRequest -Uri "$baseUrl/api/jobs/deep-search" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -TimeoutSec 300 `
    -ErrorAction Stop

$result = $response.Content | ConvertFrom-Json

if ($result.success) {
    Write-Host "✅ Análise Concluída!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📊 RESUMO:" -ForegroundColor Cyan
    Write-Host "  Total de Vagas: $($result.summary.totalJobs)" -ForegroundColor White
    Write-Host "  Match Perfeito: $($result.summary.perfectMatches)" -ForegroundColor Green
    Write-Host "  Alternativas: $($result.summary.alternatives)" -ForegroundColor Yellow
    Write-Host "  Score Médio: $($result.summary.averageScore)%" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "👤 ANÁLISE DO PERFIL:" -ForegroundColor Cyan
    $result.profileAnalysis | ConvertTo-Json | Write-Host
    Write-Host ""
    
    Write-Host "💼 VAGAS ENCONTRADAS:" -ForegroundColor Cyan
    foreach ($job in $result.jobs) {
        $matchColor = if ($job.matchType -eq "perfect") { "Green" } else { "Yellow" }
        Write-Host ""
        Write-Host "[$($job.id)] $($job.title)" -ForegroundColor $matchColor
        Write-Host "   Empresa: $($job.company) | Local: $($job.location)" -ForegroundColor Gray
        Write-Host "   Salário: $($job.salary) | Tipo: $($job.type) | Remoto: $($job.remote)" -ForegroundColor Gray
        Write-Host "   Score: $($job.score)% | Categoria: $($job.filterCategory)" -ForegroundColor Gray
        Write-Host "   Descrição: $($job.description)" -ForegroundColor Gray
        Write-Host "   Tags: $($job.tags -join ', ')" -ForegroundColor DarkGray
        Write-Host "   Insights:" -ForegroundColor DarkGray
        foreach ($insight in $job.insights) {
            Write-Host "     • $insight" -ForegroundColor DarkGray
        }
    }
    
    Write-Host ""
    Write-Host "✨ Resposta JSON completa salva em 'response.json'" -ForegroundColor Cyan
    $result | ConvertTo-Json -Depth 10 | Out-File "response.json"
} else {
    Write-Host "❌ Erro: $($result.error)" -ForegroundColor Red
}
