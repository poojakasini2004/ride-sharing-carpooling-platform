Write-Host "Testing Payment API Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/razorpay-key" -Method GET
    Write-Host "Backend is running" -ForegroundColor Green
    Write-Host "   Razorpay Key: $($response.key)" -ForegroundColor Gray
} catch {
    Write-Host "Backend is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Login and get token
Write-Host "Test 2: Login Test" -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/auth/login?email=passenger@test.com&password=password123" -Method POST
    $token = $loginResponse.token
    $userId = $loginResponse.user.id
    Write-Host "Login successful" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "Login failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Fetch payment history
Write-Host "Test 3: Payment History" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $paymentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/passenger/$userId" -Method GET -Headers $headers
    Write-Host "Payment API is accessible" -ForegroundColor Green
    Write-Host "   Number of payments: $($paymentsResponse.Count)" -ForegroundColor Gray
    
    if ($paymentsResponse.Count -eq 0) {
        Write-Host ""
        Write-Host "No payments found - This is normal if you have not booked any rides yet" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Payment Details:" -ForegroundColor Cyan
        foreach ($payment in $paymentsResponse) {
            $amt = $payment.amount
            Write-Host "   - Payment ID $($payment.id): Amount $amt - Status $($payment.paymentStatus)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Failed to fetch payment history" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Fetch payment stats
Write-Host "Test 4: Payment Statistics" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/passenger/$userId/stats" -Method GET -Headers $headers
    Write-Host "Payment stats API is accessible" -ForegroundColor Green
    $spending = $statsResponse.totalSpending
    Write-Host "   Total Spending: $spending" -ForegroundColor Gray
    Write-Host "   Successful Payments: $($statsResponse.successfulPayments)" -ForegroundColor Gray
} catch {
    Write-Host "Failed to fetch payment stats" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- If all tests passed, the payment API is working correctly" -ForegroundColor White
Write-Host "- If you see No payments found, book a ride first to see payment history" -ForegroundColor White
Write-Host "- The translate-page error is from a browser extension, not your app" -ForegroundColor White
