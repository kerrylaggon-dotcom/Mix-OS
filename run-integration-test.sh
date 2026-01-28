#!/bin/bash
set -e

echo "=== Mix OS Integration Test ===" > /tmp/test-results.txt
echo "" >> /tmp/test-results.txt
echo "Timestamp: $(date)" >> /tmp/test-results.txt
echo "" >> /tmp/test-results.txt

sleep 2

echo "1. GET /api/environments" >> /tmp/test-results.txt
curl -s http://localhost:5000/api/environments >> /tmp/test-results.txt 2>&1
echo "" >> /tmp/test-results.txt
echo "" >> /tmp/test-results.txt

echo "2. POST /api/environments (Create VM)" >> /tmp/test-results.txt
curl -s -X POST http://localhost:5000/api/environments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test VM",
    "type": "qemu",
    "cpuCores": 2,
    "memoryMB": 1024,
    "diskSizeGB": 10
  }' >> /tmp/test-results.txt 2>&1
echo "" >> /tmp/test-results.txt
echo "" >> /tmp/test-results.txt

echo "3. GET /api/downloads" >> /tmp/test-results.txt
curl -s http://localhost:5000/api/downloads >> /tmp/test-results.txt 2>&1
echo "" >> /tmp/test-results.txt
echo "" >> /tmp/test-results.txt

echo "4. GET /api/code-server/status" >> /tmp/test-results.txt
curl -s http://localhost:5000/api/code-server/status >> /tmp/test-results.txt 2>&1
echo "" >> /tmp/test-results.txt
echo "" >> /tmp/test-results.txt

echo "=== Test Complete ===" >> /tmp/test-results.txt

cat /tmp/test-results.txt
