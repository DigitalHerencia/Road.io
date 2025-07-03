# Road.io setup script for Windows PowerShell

Write-Host "Starting Road.io setup..."

# Change to main folder
Set-Location -Path "main"

# Install dependencies
Write-Host "Installing dependencies (legacy peer deps)..."
npm install --legacy-peer-deps

# Run lint check
Write-Host "Running lint..."
npm run lint
$lint = $LASTEXITCODE

# Run typecheck
Write-Host "Running typecheck..."
npm run typecheck
$typecheck = $LASTEXITCODE

# Run tests
Write-Host "Running tests..."
npm run test
$tests = $LASTEXITCODE

if ($lint -eq 0 -and $typecheck -eq 0 -and $tests -eq 0) {
    Write-Host "All checks passed!"
} else {
    Write-Host "Some checks failed. Please resolve any errors before committing."
    exit 1
}

