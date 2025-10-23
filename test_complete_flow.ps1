# 完整测试流程：登录 -> 聊天 -> 保存旅游计划
Write-Host "完整测试流程..." -ForegroundColor Green

try {
    # 1. 先登录获取token
    Write-Host "1. 登录获取token..." -ForegroundColor Yellow
    $loginBody = @{
        username = "111"
        password = "111"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    Write-Host "登录成功，token: $($token.Substring(0, 20))..." -ForegroundColor Green

    # 2. 使用token发送聊天请求
    Write-Host "`n2. 发送聊天请求..." -ForegroundColor Yellow
    $chatBody = @{
        userId = $loginResponse.userId
        message = "我想去北京旅游3天"
        planId = $null
        apiKey = ""
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $chatResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/conversations/chat" -Method POST -Headers $headers -Body $chatBody

    Write-Host "聊天响应:" -ForegroundColor Yellow
    Write-Host "消息: $($chatResponse.message.Substring(0, [Math]::Min(100, $chatResponse.message.Length)))..." -ForegroundColor White
    Write-Host "处理时间: $($chatResponse.processingTime)ms" -ForegroundColor White
    Write-Host "创建的计划ID: $($chatResponse.createdPlanId)" -ForegroundColor Green

    # 3. 检查创建的旅游计划
    if ($chatResponse.createdPlanId) {
        Write-Host "`n3. 检查创建的旅游计划..." -ForegroundColor Yellow
        $planResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/plans/$($chatResponse.createdPlanId)" -Method GET -Headers $headers
        Write-Host "计划名称: $($planResponse.planName)" -ForegroundColor White
        Write-Host "目的地: $($planResponse.destination)" -ForegroundColor White
        Write-Host "状态: $($planResponse.status)" -ForegroundColor White
        Write-Host "AI生成内容长度: $($planResponse.aiGenerated.Length) 字符" -ForegroundColor White
        
        Write-Host "`n✅ 旅游计划保存功能测试成功！" -ForegroundColor Green
    } else {
        Write-Host "`n❌ 没有创建旅游计划" -ForegroundColor Red
    }

} catch {
    Write-Host "请求失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应内容: $responseBody" -ForegroundColor Red
    }
}
