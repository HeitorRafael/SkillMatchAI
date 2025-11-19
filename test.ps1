#!/usr/bin/env pwsh
$key = "AIzaSyD7qZnRomy7BwiNP4hQgAOSMYFIxPybRzg"
$desc = "Sou desenvolvedor full stack com 5 anos. React, Node.js, TypeScript. Busco inovação."
$resume = "Full Stack | React, Node, TS, Docker, AWS | 5 anos"

$data = @{
    description = $desc
    resumeText = $resume
    apiKey = $key
} | ConvertTo-Json

Write-Host "🚀 Testando Deep Search..." -ForegroundColor Cyan
Write-Host "Aguardando resposta..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest "http://localhost:3000/api/jobs/deep-search" `
        -Method POST `
        -ContentType "application/json" `
        -Body $data `
        -TimeoutSec 120

    $result = $response.Content | ConvertFrom-Json

    if ($result.success) {
        Write-Host "✅ SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 RESUMO:" -ForegroundColor Cyan
        Write-Host "Total: $($result.summary.totalJobs) vagas"
        Write-Host "Perfect: $($result.summary.perfectMatches)"
        Write-Host "Alternatives: $($result.summary.alternatives)"
        Write-Host "Score Médio: $($result.summary.averageScore)%"
        Write-Host ""
        
        Write-Host "💼 Top 3 Vagas:" -ForegroundColor Cyan
        foreach($job in $result.jobs[0..2]) {
            Write-Host "  [$($job.id)] $($job.title) - $($job.company) - $($job.score)%"
        }
    } else {
        Write-Host "Erro: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}
