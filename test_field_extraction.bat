@echo off
echo 等待服务启动...
timeout /t 15 /nobreak > nul

echo 测试字段提取功能...
curl -X POST http://localhost:8080/api/test/extract-fields ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"我想去日本东京旅游，预算1万元，2个人，喜欢美食和动漫\"}"

echo.
echo 测试完成！
pause
