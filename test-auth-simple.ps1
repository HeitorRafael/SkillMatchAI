# Script de teste simples para autenticacao

$BASE_URL = "http://localhost:3000"

Write-Host "==== TESTE DE AUTENTICACAO ====" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Inicializar banco com admin
Write-Host "1. Inicializando banco (criando admin)..." -ForegroundColor Yellow
$result1 = Invoke-RestMethod -Uri "$BASE_URL/api/init/complete" -Method GET
Write-Host "Resultado:" -ForegroundColor Green
$result1 | ConvertTo-Json -Depth 2 | Write-Host
Write-Host ""

# Teste 2: Login com admin
Write-Host "2. Testando login com admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "heitorbdelfino@gmail.com"
    password = "senha123"
} | ConvertTo-Json

$result2 = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "Resultado:" -ForegroundColor Green
$result2 | ConvertTo-Json -Depth 2 | Write-Host
Write-Host ""

# Teste 3: Registrar novo usuario
Write-Host "3. Testando registro de novo usuario..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    name = "Usuario Teste"
    email = "teste_$timestamp@example.com"
    password = "SenhaForte123!"
} | ConvertTo-Json

$result3 = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody

Write-Host "Resultado:" -ForegroundColor Green
$result3 | ConvertTo-Json -Depth 2 | Write-Host
Write-Host ""

# Teste 4: Login com novo usuario
if ($result3.success -eq $true) {
    Write-Host "4. Testando login com novo usuario..." -ForegroundColor Yellow
    $newLoginBody = @{
        email = $result3.user.email
        password = "SenhaForte123!"
    } | ConvertTo-Json

    $result4 = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $newLoginBody

    Write-Host "Resultado:" -ForegroundColor Green
    $result4 | ConvertTo-Json -Depth 2 | Write-Host
    Write-Host ""
}

Write-Host "==== RESUMO ====" -ForegroundColor Cyan
Write-Host "Email do Admin: heitorbdelfino@gmail.com" -ForegroundColor White
Write-Host "Senha do Admin: senha123" -ForegroundColor White
Write-Host ""
