$body = @{
    description = "Sou desenvolvedor full stack com 5 anos de experiência em React, Node.js e TypeScript. Busco oportunidades em empresas inovadoras que valorizem crescimento."
    resumeText = "Full Stack Developer | React, Node.js, TypeScript, PostgreSQL, Docker, AWS | 5 anos de experiência"
    apiKey = $env:NEXT_PUBLIC_GEMINI_API_KEY
} | ConvertTo-Json

Write-Host "🚀 Testando Deep Search API..." -ForegroundColor Cyan
Write-Host "URL: http://localhost:3000/api/jobs/deep-search" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "📡 Enviando requisição..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/jobs/deep-search" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 180 `
        -ErrorAction Stop
    
    Write-Host "✅ Resposta recebida!" -ForegroundColor Green
    Write-Host ""
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Análise concluída com sucesso!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "📊 RESUMO EXECUTIVO:" -ForegroundColor Cyan
        Write-Host "  ├─ Total de vagas: $($result.summary.totalJobs)" -ForegroundColor White
        Write-Host "  ├─ Vagas perfeitas: $($result.summary.perfectMatches)" -ForegroundColor Green
        Write-Host "  ├─ Vagas alternativas: $($result.summary.alternatives)" -ForegroundColor Yellow
        Write-Host "  └─ Score médio: $($result.summary.averageScore)%" -ForegroundColor Blue
        Write-Host ""
        
        Write-Host "👤 ANÁLISE DO PERFIL:" -ForegroundColor Cyan
        $result.profileAnalysis | ConvertTo-Json | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Gray
        }
        Write-Host ""
        
        Write-Host "💼 TOP 5 VAGAS:" -ForegroundColor Cyan
        $result.jobs[0..4] | ForEach-Object {
            $icon = if ($_.matchType -eq "perfect") { "✓" } else { "◆" }
            $scoreColor = if ($_.score -ge 85) { "Green" } else { "Yellow" }
            Write-Host ""
            Write-Host "$icon [$($_.id)] $($_.title)" -ForegroundColor $scoreColor
            Write-Host "    Empresa: $($_.company)" -ForegroundColor Gray
            Write-Host "    Local: $($_.location) | Remoto: $($_.remote)" -ForegroundColor Gray
            Write-Host "    Salário: $($_.salary)" -ForegroundColor Gray
            Write-Host "    Score: $($_.score)% | Match: $($_.matchType)" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "💾 Resposta completa salva em: response.json" -ForegroundColor Green
        $result | ConvertTo-Json -Depth 10 | Out-File "response.json" -Force
        Write-Host ""
        Write-Host "📂 Abra response.json para ver todas as vagas!" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erro na resposta: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro na requisição:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Verifique se:" -ForegroundColor Yellow
    Write-Host "   • O servidor está rodando em http://localhost:3000" -ForegroundColor Gray
    Write-Host "   • A variável NEXT_PUBLIC_GEMINI_API_KEY está configurada" -ForegroundColor Gray
    Write-Host "   • A chave Gemini é válida" -ForegroundColor Gray
}
