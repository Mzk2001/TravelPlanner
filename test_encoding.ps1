# 测试字符编码修复
$baseUrl = "http://localhost:8080/api"

# 先注册用户
$registerData = @{
    username = "testuser"
    password = "testpass123"
    email = "test@example.com"
} | ConvertTo-Json

Write-Host "注册用户..."
try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -ContentType "application/json; charset=utf-8"
    Write-Host "注册成功"
} catch {
    Write-Host "注册失败或用户已存在: $($_.Exception.Message)"
}

# 登录获取token
$loginData = @{
    username = "testuser"
    password = "testpass123"
} | ConvertTo-Json

Write-Host "登录获取token..."
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json; charset=utf-8"
    $token = $loginResponse.token
    Write-Host "登录成功，token: $token"
    
    # 测试聊天接口
    $chatData = @{
        message = "我想去日本旅游5天，预算1万元，喜欢美食和购物，请帮我制定详细的旅游计划"
    } | ConvertTo-Json

    Write-Host "测试聊天接口..."
    $response = Invoke-RestMethod -Uri "$baseUrl/conversation/chat" -Method POST -Body $chatData -ContentType "application/json; charset=utf-8" -Headers @{"Authorization"="Bearer $token"; "Accept"="application/json; charset=utf-8"}
    
    Write-Host "响应成功:"
    Write-Host $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "请求失败: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应内容: $responseBody"
    }
}
