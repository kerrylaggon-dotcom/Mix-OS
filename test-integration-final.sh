#!/bin/bash

# Simple integration test - written to file
{
  echo "=== Mix OS Backend Integration Test ==="
  echo ""
  echo "Testing at $(date)"
  echo ""
  
  echo "1. Testing GET /api/environments"
  curl --max-time 3 -s http://localhost:5000/api/environments 2>&1
  echo ""
  echo ""
  
  echo "2. Testing POST /api/environments"
  curl --max-time 3 -s -X POST http://localhost:5000/api/environments \
    -H "Content-Type: application/json" \
    -d '{"name":"Test VM","type":"qemu"}' 2>&1
  echo ""
  echo ""
  
  echo "3. Testing GET /api/downloads"
  curl --max-time 3 -s http://localhost:5000/api/downloads 2>&1 | head -c 500
  echo ""
  echo ""
  
  echo "4. Testing GET /api/code-server/status"
  curl --max-time 3 -s http://localhost:5000/api/code-server/status 2>&1
  echo ""
  echo ""
  
  echo "=== Test Results ==="
} | tee /tmp/integration-test-results.txt
