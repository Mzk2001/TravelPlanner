# 测试桩程序AI API
Write-Host "测试桩程序AI API..." -ForegroundColor Green

try {
    $body = @{
        apiKey = "test-key"
        userMessage = "我想去北京旅游"
        planContext = ""
    } | ConvertTo-Json

    Write-Host "发送请求到: http://localhost:8080/api/ai/generate" -ForegroundColor Yellow
    Write-Host "请求体: $body" -ForegroundColor Gray

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/generate" -Method POST -ContentType "application/json" -Body $body

    Write-Host "响应成功!" -ForegroundColor Green
    Write-Host "响应内容:" -ForegroundColor Yellow
    Write-Host $response.result -ForegroundColor White

} catch {
    Write-Host "请求失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "错误详情: $($_.Exception)" -ForegroundColor Red
}
