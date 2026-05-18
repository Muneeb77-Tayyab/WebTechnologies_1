# Run backend and frontend dev servers in separate PowerShell windows
# Usage: Right-click -> Run with PowerShell, or from PowerShell: .\run-dev.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root ''
$frontend = Join-Path $root 'react-app'

Write-Host "Starting backend in new window: $backend"
Start-Process powershell.exe -ArgumentList '-NoExit','-NoProfile','-Command',"Set-Location -LiteralPath '$backend'; if (-not (Test-Path node_modules)) { npm install }; npm run dev"

Start-Sleep -Milliseconds 800
Write-Host "Starting frontend in new window: $frontend"
Start-Process powershell.exe -ArgumentList '-NoExit','-NoProfile','-Command',"Set-Location -LiteralPath '$frontend'; if (-not (Test-Path node_modules)) { npm install }; npm run dev"

Write-Host 'Both dev servers have been started in separate windows.'
