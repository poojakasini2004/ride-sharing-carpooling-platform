# Test Script for Dynamic Fare Calculation API
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Dynamic Fare Calculation API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get Fare Rates
Write-Host "Test 1: Get Fare Rates" -ForegroundColor Yellow
Write-Host "GET /api/fare/rates" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/fare/rates" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $data | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ FAILED: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Calculate Distance
Write-Host "Test 2: Calculate Distance (Mumbai to Pune)" -ForegroundColor Yellow
Write-Host "GET /api/fare/distance?source=Mumbai&destination=Pune" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/fare/distance?source=Mumbai&destination=Pune" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    $distance = $data.distanceInKm
    $duration = $data.durationInMinutes
    Write-Host "Distance: $distance km" -ForegroundColor White
    Write-Host "Duration: $duration minutes" -ForegroundColor White
} catch {
    Write-Host "✗ FAILED: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Calculate Fare
Write-Host "Test 3: Calculate Fare (Mumbai to Pune, SEDAN, 2 passengers)" -ForegroundColor Yellow
Write-Host "POST /api/fare/calculate" -ForegroundColor Gray
try {
    $body = @{
        source = 'Mumbai'
        destination = 'Pune'
        vehicleType = 'SEDAN'
        numberOfPassengers = 2
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/fare/calculate' -Method POST -Body $body -ContentType 'application/json'
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    $distance = $data.distanceInKm
    $baseFare = $data.baseFare
    $perKm = $data.perKmRate
    $total = $data.totalFare
    $perPass = $data.farePerPassenger
    Write-Host "Distance: $distance km" -ForegroundColor White
    Write-Host "Base Fare: Rs.$baseFare" -ForegroundColor White
    Write-Host "Per Km Rate: Rs.$perKm/km" -ForegroundColor White
    Write-Host "Total Fare: Rs.$total" -ForegroundColor Cyan
    Write-Host "Per Passenger: Rs.$perPass" -ForegroundColor Cyan
} catch {
    Write-Host "✗ FAILED: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Quick Estimate
Write-Host "Test 4: Quick Estimate (Delhi to Agra, SUV, 3 passengers)" -ForegroundColor Yellow
Write-Host "GET /api/fare/estimate" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/fare/estimate?source=Delhi&destination=Agra&vehicleType=SUV&passengers=3" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    $distance = $data.distanceInKm
    $total = $data.totalFare
    $perPass = $data.farePerPassenger
    Write-Host "Distance: $distance km" -ForegroundColor White
    Write-Host "Total Fare: Rs.$total" -ForegroundColor Cyan
    Write-Host "Per Passenger: Rs.$perPass" -ForegroundColor Cyan
} catch {
    Write-Host "✗ FAILED: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Short Distance (Mumbai Central to Gateway of India)
Write-Host "Test 5: Short Distance (Mumbai Central to Gateway of India)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/fare/estimate?source=Mumbai%20Central%20Station&destination=Gateway%20of%20India,%20Mumbai&vehicleType=HATCHBACK&passengers=1" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    $distance = $data.distanceInKm
    $total = $data.totalFare
    Write-Host "Distance: $distance km" -ForegroundColor White
    Write-Host "Total Fare: Rs.$total" -ForegroundColor Cyan
} catch {
    Write-Host "✗ FAILED: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
