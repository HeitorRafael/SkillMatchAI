# Script de teste para autenticacao

$LOCAL_URL = "http://localhost:3000"
$BASE_URL = $LOCAL_URL

Write-Host "TESTE DE AUTENTICACAO" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# 1. Criar admin se nao existir
Write-Host "1. Inicializando banco (criando admin)..." -ForegroundColor Yellow
try {
    $initResponse = Invoke-WebRequest -Uri "$BASE_URL/api/init/complete" -Method GET
}
catch {
    $initResponse = $_.Exception.Response
}
Write-Host "Status: $($initResponse.StatusCode)" -ForegroundColor Green
$initData = $initResponse.Content | ConvertFrom-Json
Write-Host "Resposta: " -ForegroundColor Green
$initData | ConvertTo-Json -Depth 2
Write-Host ""

# 2. Testar login com admin
Write-Host "2. Testando login com admin..." -ForegroundColor Yellow
$loginBody = @{
    email    = "heitorbdelfino@gmail.com"
    password = "senha123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
}
catch {
    $loginResponse = $_.Exception.Response
}

Write-Host "Status: $($loginResponse.StatusCode)" -ForegroundColor Green
$loginData = $loginResponse.Content | ConvertFrom-Json
Write-Host "Resposta: " -ForegroundColor Green
$loginData | ConvertTo-Json -Depth 2
Write-Host ""

# 3. Testar registro de novo usuario
Write-Host "3. Testando registro de novo usuario..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    name     = "Usuario Teste"
    email    = "teste_$timestamp@example.com"
    password = "SenhaForte123!"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$BASE_URL/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
}
catch {
    $registerResponse = $_.Exception.Response
}

Write-Host "Status: $($registerResponse.StatusCode)" -ForegroundColor Green
$registerData = $registerResponse.Content | ConvertFrom-Json
Write-Host "Resposta: " -ForegroundColor Green
$registerData | ConvertTo-Json -Depth 2

if ($registerResponse.StatusCode -eq 201) {
    $newUserEmail = $registerData.user.email
    $newUserId = $registerData.user.id
    Write-Host ""
    
    # 4. Testar login com novo usuario
    Write-Host "4. Testando login com novo usuario..." -ForegroundColor Yellow
    $newLoginBody = @{
        email    = $newUserEmail
        password = "SenhaForte123!"
    } | ConvertTo-Json

    try {
        $newLoginResponse = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $newLoginBody
    }
    catch {
        $newLoginResponse = $_.Exception.Response
    }

    Write-Host "Status: $($newLoginResponse.StatusCode)" -ForegroundColor Green
    $newLoginData = $newLoginResponse.Content | ConvertFrom-Json
    Write-Host "Resposta: " -ForegroundColor Green
    $newLoginData | ConvertTo-Json -Depth 2
}

Write-Host ""
Write-Host "TESTES CONCLUIDOS" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumo:" -ForegroundColor Yellow
Write-Host "- Admin Email: heitorbdelfino@gmail.com" -ForegroundColor White
Write-Host "- Admin Password: senha123" -ForegroundColor White
Write-Host ""
