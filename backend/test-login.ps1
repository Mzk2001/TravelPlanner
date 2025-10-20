# 测试登录功能的PowerShell脚本

Write-Host "Testing TravelPlanner Login API..."

# 测试健康检查
Write-Host "`n1. Testing health endpoint..."
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET
    Write-Host "Health check: $($healthResponse.Content)"
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)"
}

# 测试用户查询
Write-Host "`n2. Testing user query..."
try {
    $userResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/test/user?username=test" -Method GET
    Write-Host "User query response: $($userResponse.Content)"
} catch {
    Write-Host "User query failed: $($_.Exception.Message)"
}

# 测试登录
Write-Host "`n3. Testing login..."
try {
    $loginBody = @{
        username = "test"
        password = "123456"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "Login successful: $($loginResponse.Content)"
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error response: $responseBody"
        $reader.Close()
        $stream.Close()
    }
}

Write-Host "`nTest completed."
