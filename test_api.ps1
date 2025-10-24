$body = @{
    userId = 1
    message = "我想去日本东京旅游，预算1万元，2个人，喜欢美食和动漫"
} | ConvertTo-Json

Write-Host "发送请求体: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/conversations/chat" -Method POST -ContentType "application/json" -Body $body
    Write-Host "响应:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "错误: $($_.Exception.Message)"
    Write-Host "响应内容: $($_.Exception.Response)"
}
