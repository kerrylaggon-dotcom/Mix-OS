#!/bin/bash

echo "=== Testing Mix OS Backend Integration ==="
echo ""

# Wait for server to be ready
sleep 2

echo "1. Testing GET /api/environments"
curl -s http://localhost:5000/api/environments
echo ""
echo ""

echo "2. Testing POST /api/environments (Create VM)"
curl -s -X POST http://localhost:5000/api/environments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test VM",
    "type": "qemu",
    "cpuCores": 2,
    "memoryMB": 1024,
    "diskSizeGB": 10
  }' | head -100
echo ""
echo ""

echo "3. Testing GET /api/downloads"
curl -s http://localhost:5000/api/downloads | head -100
echo ""
echo ""

echo "4. Testing GET /api/code-server/status"
curl -s http://localhost:5000/api/code-server/status
echo ""
echo ""

echo "=== Integration Test Complete ==="
