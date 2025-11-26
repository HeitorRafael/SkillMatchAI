# Script para testar API de gerenciamento de chave API

$baseUrl = "http://localhost:3000"
$apiKeyEndpoint = "$baseUrl/api/user/api-key"
$testApiKey = "sk-ant-api03-1234567890abcdef1234567890abcdef1234567890"

# Headers com Content-Type
$headers = @{
    'Content-Type' = 'application/json'
}

Write-Host "=== Teste de API de Gerenciamento de Chave API ===" -ForegroundColor Green
Write-Host ""

# 1. GET - Verificar status inicial
Write-Host "[1/4] GET - Verificando se há chave salva..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $apiKeyEndpoint -Method GET -Headers $headers -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Resposta: $(($data | ConvertTo-Json -Compress))" -ForegroundColor Green
    $hasSavedKey = $data.hasSavedKey
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. POST - Salvar chave API
Write-Host "[2/4] POST - Salvando nova chave API..." -ForegroundColor Cyan
$body = @{
    apiKey = $testApiKey
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $apiKeyEndpoint -Method POST -Headers $headers -Body $body -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Resposta: $(($data | ConvertTo-Json -Compress))" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. GET - Verificar se foi salva
Write-Host "[3/4] GET - Verificando se chave foi salva..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $apiKeyEndpoint -Method GET -Headers $headers -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Resposta: $(($data | ConvertTo-Json -Compress))" -ForegroundColor Green
    if ($data.hasSavedKey) {
        Write-Host "✓ Chave API foi salva com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "✗ Chave não foi salva" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. DELETE - Remover chave
Write-Host "[4/4] DELETE - Removendo chave API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $apiKeyEndpoint -Method DELETE -Headers $headers -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Resposta: $(($data | ConvertTo-Json -Compress))" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== ✓ Todos os testes passaram com sucesso! ===" -ForegroundColor Green
