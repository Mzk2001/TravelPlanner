# 测试上海旅游桩程序
Write-Host "测试上海旅游桩程序..." -ForegroundColor Green

try {
    $body = @{
        apiKey = "test-key"
        userMessage = "我想去上海旅游"
        planContext = ""
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/generate" -Method POST -ContentType "application/json" -Body $body

    Write-Host "上海旅游计划:" -ForegroundColor Yellow
    Write-Host $response.result -ForegroundColor White

} catch {
    Write-Host "请求失败: $($_.Exception.Message)" -ForegroundColor Red
}
