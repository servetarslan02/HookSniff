@echo off
REM Login
curl -s -X POST http://localhost:3000/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"servetarslan02@gmail.com\",\"password\":\"Alayci_165\"}" > login-response.json
echo Login response saved.

REM Test endpoints endpoint
curl -s -X GET http://localhost:3000/v1/endpoints -H "Authorization: Bearer %1" 
echo.

REM Test admin security events
curl -s -X GET http://localhost:3000/v1/admin/security/events -H "Authorization: Bearer %1"
echo.

REM Test admin audit logs
curl -s -X GET http://localhost:3000/v1/admin/audit-logs -H "Authorization: Bearer %1"
echo.