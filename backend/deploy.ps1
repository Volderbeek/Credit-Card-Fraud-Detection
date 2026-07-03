# PowerShell Script for Google Cloud Run Deployment

$ErrorActionPreference = "Stop"

# Configuration variables (overridable)
$ProjectID = $env:GCP_PROJECT_ID
$ServiceName = if ($env:GCP_SERVICE_NAME) { $env:GCP_SERVICE_NAME } else { "fraud-detection-backend" }
$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }

# Get project root (parent of script directory)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = (Get-Item (Join-Path $ScriptDir "..")).FullName

# Change directory to the project root
Set-Location $RootDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "== ShieldFlow - Google Cloud Run Backend Deployment ==" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Project Root:  $RootDir"
Write-Host "Service Name:  $ServiceName"
Write-Host "Region:        $Region"
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if gcloud CLI is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    $localGcloud = Join-Path $env:LocalAppData "Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    if (Test-Path $localGcloud) {
        Write-Host "Auto-detected gcloud installation. Temporarily adding to PATH..." -ForegroundColor Yellow
        $env:PATH = "$env:PATH;$(Split-Path $localGcloud)"
    } else {
        Write-Error "[ERROR] Google Cloud SDK (gcloud CLI) is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
        exit 1
    }
}


# Ensure user is authenticated
Write-Host "Checking Google Cloud authentication status..."
$authStatus = gcloud auth list --filter="status:ACTIVE" --format="value(account)"
if ([string]::IsNullOrWhiteSpace($authStatus)) {
    Write-Host "[INFO] You are not logged in. Running 'gcloud auth login'..." -ForegroundColor Yellow
    gcloud auth login
}

# Select or prompt for project if not set
if ([string]::IsNullOrWhiteSpace($ProjectID)) {
    Write-Host "Fetching active GCP project..."
    $ProjectID = gcloud config get-value project 2>$null
    
    if ([string]::IsNullOrWhiteSpace($ProjectID) -or $ProjectID -eq "(unset)") {
        Write-Host "[?] No GCP project set in config." -ForegroundColor Yellow
        $ProjectID = Read-Host "Enter your Google Cloud Project ID"
        if ([string]::IsNullOrWhiteSpace($ProjectID)) {
            Write-Error "[ERROR] Project ID is required."
            exit 1
        }
        gcloud config set project $ProjectID
    }
}
Write-Host "Using GCP Project: $ProjectID" -ForegroundColor Green

# Copy Dockerfile to root temporarily since gcloud run deploy doesn't support a custom dockerfile path
Write-Host "Copying backend/Dockerfile to project root temporarily..."
Copy-Item -Path "backend/Dockerfile" -Destination "Dockerfile" -Force

try {
    # Build and Deploy to Cloud Run using Cloud Build automatically
    Write-Host "[DEPLOY] Building and deploying service to Cloud Run..." -ForegroundColor Green
    gcloud run deploy $ServiceName `
        --source . `
        --region $Region `
        --allow-unauthenticated `
        --port 8080
    
    if ($LASTEXITCODE -ne 0) {
        throw "gcloud run deploy failed with exit code $LASTEXITCODE"
    }
}
finally {
    Write-Host "Cleaning up temporary Dockerfile from project root..."
    if (Test-Path "Dockerfile") {
        Remove-Item -Path "Dockerfile" -Force
    }
}

Write-Host "[SUCCESS] Deployment completed successfully!" -ForegroundColor Green
Write-Host "You can check the service URL above to verify the deployment." -ForegroundColor Green
