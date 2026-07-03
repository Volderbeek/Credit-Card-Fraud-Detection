#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -e

# Configuration variables (overridable via env vars)
PROJECT_ID="${GCP_PROJECT_ID:-}"
SERVICE_NAME="${GCP_SERVICE_NAME:-fraud-detection-backend}"
REGION="${GCP_REGION:-us-central1}"

# Get the root directory of the project (parent of the directory containing this script)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change directory to the project root
cd "$ROOT_DIR"

echo "=========================================================="
echo "🛡️  ShieldFlow - Google Cloud Run Backend Deployment 🛡️"
echo "=========================================================="
echo "Project Root:  $ROOT_DIR"
echo "Service Name:  $SERVICE_NAME"
echo "Region:        $REGION"
echo "=========================================================="

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    # Try default local appdata path on Windows (Git Bash / WSL / MSYS)
    LOCAL_GCLOUD_BIN="$LOCALAPPDATA/Google/Cloud SDK/google-cloud-sdk/bin"
    if [ -d "$LOCAL_GCLOUD_BIN" ]; then
        echo "Auto-detected gcloud installation. Temporarily adding to PATH..."
        export PATH="$PATH:$LOCAL_GCLOUD_BIN"
    # Fallback to standard USERPROFILE path
    elif [ -d "$USERPROFILE/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin" ]; then
        echo "Auto-detected gcloud installation. Temporarily adding to PATH..."
        export PATH="$PATH:$USERPROFILE/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin"
    else
        echo "❌ Error: Google Cloud SDK (gcloud CLI) is not installed."
        echo "Please install it from https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
fi


# Ensure user is authenticated
echo "Checking Google Cloud authentication status..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "🔑 You are not logged in. Running 'gcloud auth login'..."
    gcloud auth login
fi

# Select or prompt for project if not set
if [ -z "$PROJECT_ID" ]; then
    echo "Fetching active GCP project..."
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
        echo "❓ No GCP project set in config."
        read -p "Enter your Google Cloud Project ID: " PROJECT_ID
        if [ -z "$PROJECT_ID" ]; then
            echo "❌ Error: Project ID is required."
            exit 1
        fi
        gcloud config set project "$PROJECT_ID"
    fi
fi
echo "Using GCP Project: $PROJECT_ID"

# Copy Dockerfile to root temporarily since gcloud run deploy doesn't support a custom dockerfile path
echo "Copying backend/Dockerfile to project root temporarily..."
cp backend/Dockerfile Dockerfile

# Set up cleanup trap for when the script exits (normally or due to error)
cleanup() {
    echo "Cleaning up temporary Dockerfile from project root..."
    rm -f Dockerfile
}
trap cleanup EXIT

# Build and Deploy to Cloud Run using Cloud Build automatically
echo "🚀 Building and deploying service to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 8080

echo "✅ Deployment completed successfully!"
echo "You can check the service URL above to verify the deployment."
