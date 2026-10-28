try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/auth/login?email=passenger@test.com&password=password123" -Method POST
    Write-Host "✅ Backend is running successfully!" -ForegroundColor Green
    Write-Host "Login response:" -ForegroundColor Cyan
    Write-Host "  Token: $($response.token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "  User: $($response.user.name) ($($response.user.email))" -ForegroundColor Green
    Write-Host "  Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error connecting to backend: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}
