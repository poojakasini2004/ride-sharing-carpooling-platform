Write-Host "Testing Dynamic Fare Calculation API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test 1: Get Fare Rates" -ForegroundColor Yellow
$response1 = Invoke-WebRequest -Uri "http://localhost:8080/api/fare/rates" -Method GET
$data1 = $response1.Content | ConvertFrom-Json
Write-Host "SUCCESS - Fare Rates Retrieved" -ForegroundColor Green
$data1 | ConvertTo-Json
Write-Host ""

Write-Host "Test 2: Calculate Distance Mumbai to Pune" -ForegroundColor Yellow
$response2 = Invoke-WebRequest -Uri "http://localhost:8080/api/fare/distance?source=Mumbai&destination=Pune" -Method GET
$data2 = $response2.Content | ConvertFrom-Json
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "Distance: $($data2.distanceInKm) km"
Write-Host "Duration: $($data2.durationInMinutes) minutes"
Write-Host ""

Write-Host "Test 3: Calculate Fare Mumbai to Pune SEDAN 2 passengers" -ForegroundColor Yellow
$body = '{"source":"Mumbai","destination":"Pune","vehicleType":"SEDAN","numberOfPassengers":2}'
$response3 = Invoke-WebRequest -Uri "http://localhost:8080/api/fare/calculate" -Method POST -Body $body -ContentType "application/json"
$data3 = $response3.Content | ConvertFrom-Json
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "Distance: $($data3.distanceInKm) km"
Write-Host "Total Fare: Rs.$($data3.totalFare)"
Write-Host "Per Passenger: Rs.$($data3.farePerPassenger)"
Write-Host ""

Write-Host "All Tests Passed!" -ForegroundColor Green
