# 测试旅游计划保存功能
Write-Host "测试旅游计划保存功能..." -ForegroundColor Green

try {
    # 测试北京旅游计划生成和保存
    $body = @{
        userId = 3
        message = "我想去北京旅游3天"
        planId = $null
        apiKey = ""
    } | ConvertTo-Json

    Write-Host "发送聊天请求..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/conversations/chat" -Method POST -ContentType "application/json" -Body $body

    Write-Host "聊天响应:" -ForegroundColor Yellow
    Write-Host "消息: $($response.message.Substring(0, [Math]::Min(100, $response.message.Length)))..." -ForegroundColor White
    Write-Host "处理时间: $($response.processingTime)ms" -ForegroundColor White
    Write-Host "创建的计划ID: $($response.createdPlanId)" -ForegroundColor Green

    if ($response.createdPlanId) {
        Write-Host "`n检查创建的旅游计划..." -ForegroundColor Yellow
        $planResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/plans/$($response.createdPlanId)" -Method GET
        Write-Host "计划名称: $($planResponse.planName)" -ForegroundColor White
        Write-Host "目的地: $($planResponse.destination)" -ForegroundColor White
        Write-Host "状态: $($planResponse.status)" -ForegroundColor White
        Write-Host "AI生成内容长度: $($planResponse.aiGenerated.Length) 字符" -ForegroundColor White
    }

} catch {
    Write-Host "请求失败: $($_.Exception.Message)" -ForegroundColor Red
}
