# 测试API Key端点
Write-Host "测试AI API Key端点..."

# 测试GET方法
Write-Host "`n1. 测试GET方法（无API Key）:"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/ai/test" -Method GET
    Write-Host "状态码: $($response.StatusCode)"
    Write-Host "响应: $($response.Content)"
} catch {
    Write-Host "错误: $($_.Exception.Message)"
}

# 测试GET方法（带API Key）
Write-Host "`n2. 测试GET方法（带API Key）:"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/ai/test?apiKey=sk-test12345678901234567890" -Method GET
    Write-Host "状态码: $($response.StatusCode)"
    Write-Host "响应: $($response.Content)"
} catch {
    Write-Host "错误: $($_.Exception.Message)"
}

# 测试POST方法
Write-Host "`n3. 测试POST方法（带API Key）:"
try {
    $body = @{
        apiKey = "sk-test12345678901234567890"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/ai/test" -Method POST -Body $body -ContentType "application/json"
    Write-Host "状态码: $($response.StatusCode)"
    Write-Host "响应: $($response.Content)"
} catch {
    Write-Host "错误: $($_.Exception.Message)"
}

Write-Host "`n测试完成！"