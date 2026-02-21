$body = @{ email = "admin@seveninc.com"; password = "password123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $resp.data.token
Write-Host "--- LOGIN BERHASIL ---" -ForegroundColor Green
Write-Host "Token: $token"
Write-Host "--- MENCOBA AKSES DATA ---" -ForegroundColor Cyan
$headers = @{ Authorization = "Bearer $token"; Accept = "application/json" }
$data = Invoke-RestMethod -Uri "http://localhost:8000/api/operator/data" -Method Get -Headers $headers
$data | ConvertTo-Json