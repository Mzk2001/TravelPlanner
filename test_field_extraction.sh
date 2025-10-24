#!/bin/bash

echo "测试字段提取功能..."

# 发送测试请求
curl -X POST http://localhost:8080/api/conversations/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "message": "我想去日本东京旅游，预算1万元，2个人，喜欢美食和动漫"
  }' \
  | jq '.'

echo "测试完成"
