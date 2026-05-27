#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# GCP DEPLOYMENT TROUBLESHOOTING GUIDE
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

PROJECT_ID="${GCP_PROJECT_ID:-hooksniff-app}"
REGION="${GCP_REGION:-europe-west1}"
API_SERVICE="hooksniff-api"
WORKER_SERVICE="hooksniff-worker"

echo ""
echo "🔧 HookSniff GCP Deployment Troubleshooting"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────
# 1. Check Project & Authentication
# ─────────────────────────────────────────────────────────────────
check_auth() {
    info "Checking GCP authentication..."
    
    if ! gcloud auth list | grep -q ACTIVE; then
        error "Not authenticated with GCP. Run: gcloud auth login"
    fi
    
    CURRENT_PROJECT=$(gcloud config get-value project)
    if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
        warn "Current project is '$CURRENT_PROJECT', expected '$PROJECT_ID'"
        info "Switching to $PROJECT_ID..."
        gcloud config set project "$PROJECT_ID" --quiet
    fi
    
    success "Authenticated with project: $PROJECT_ID"
}

# ─────────────────────────────────────────────────────────────────
# 2. Check Cloud Run Services
# ─────────────────────────────────────────────────────────────────
check_services() {
    info "Checking Cloud Run services..."
    
    echo ""
    echo "API Service Status:"
    if gcloud run services describe "$API_SERVICE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
        API_URL=$(gcloud run services describe "$API_SERVICE" --region="$REGION" --format='value(status.url)' --project="$PROJECT_ID")
        success "API is deployed: $API_URL"
        
        # Test health endpoint
        if curl -s "$API_URL/health" &>/dev/null; then
            success "API health check passed"
        else
            error "API health check failed. Check logs: gcloud run logs read $API_SERVICE --region=$REGION --limit=50"
        fi
    else
        error "API service not found. Deploy first: ./deploy/gcp-deploy.sh"
    fi
    
    echo ""
    echo "Worker Service Status:"
    if gcloud run services describe "$WORKER_SERVICE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
        success "Worker is deployed"
    else
        error "Worker service not found. Deploy first: ./deploy/gcp-deploy.sh"
    fi
}

# ─────────────────────────────────────────────────────────────────
# 3. Check Secrets
# ─────────────────────────────────────────────────────────────────
check_secrets() {
    info "Checking secrets in Google Secret Manager..."
    
    REQUIRED_SECRETS=(
        "hooksniff-db-url"
        "hooksniff-redis-url"
        "hooksniff-hmac-secret"
        "hooksniff-jwt-secret"
        "hooksniff-polar-token"
        "hooksniff-polar-webhook-secret"
        "hooksniff-resend-api-key"
    )
    
    MISSING=0
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if gcloud secrets describe "$secret" --project="$PROJECT_ID" &>/dev/null; then
            success "Secret exists: $secret"
        else
            error "Secret missing: $secret"
            MISSING=$((MISSING + 1))
        fi
    done
    
    if [ $MISSING -eq 0 ]; then
        success "All required secrets present"
    else
        error "$MISSING secrets are missing. Run: ./deploy/gcp-deploy.sh"
    fi
}

# ─────────────────────────────────────────────────────────────────
# 4. Check Environment Variables
# ─────────────────────────────────────────────────────────────────
check_env_vars() {
    info "Checking environment variables in Cloud Run..."
    
    echo ""
    echo "API Environment Variables:"
    gcloud run services describe "$API_SERVICE" --region="$REGION" --format='value(spec.template.spec.containers[0].env)' --project="$PROJECT_ID" | head -5
    
    echo ""
    echo "View full config: gcloud run services describe $API_SERVICE --region=$REGION"
}

# ─────────────────────────────────────────────────────────────────
# 5. Check Logs
# ─────────────────────────────────────────────────────────────────
check_logs() {
    info "Retrieving recent logs from API service..."
    
    echo ""
    gcloud run logs read "$API_SERVICE" --region="$REGION" --limit=20 --project="$PROJECT_ID"
}

# ─────────────────────────────────────────────────────────────────
# 6. Check Resource Limits
# ─────────────────────────────────────────────────────────────────
check_resources() {
    info "Checking Cloud Run resource configuration..."
    
    echo ""
    gcloud run services describe "$API_SERVICE" --region="$REGION" --format='
    table(
        spec.template.spec.containers[0].resources.limits.memory,
        spec.template.spec.containers[0].resources.limits.cpu,
        status.conditions[0].message
    )' --project="$PROJECT_ID"
}

# ─────────────────────────────────────────────────────────────────
# 7. Common Deployment Errors & Solutions
# ─────────────────────────────────────────────────────────────────
common_errors() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "COMMON DEPLOYMENT ERRORS & SOLUTIONS"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    echo "❌ Error: 'Permission denied' or 'gcloud: command not found'"
    echo "   ✅ Solution:"
    echo "      - Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    echo "      - Authenticate: gcloud auth login"
    echo "      - Set project: gcloud config set project $PROJECT_ID"
    echo ""
    
    echo "❌ Error: 'Secret not found' in deployment logs"
    echo "   ✅ Solution:"
    echo "      - Check .env.production exists: ls -la .env.production"
    echo "      - Verify all [REQUIRED] fields are filled"
    echo "      - Sync secrets: ./deploy/gcp-deploy.sh"
    echo ""
    
    echo "❌ Error: 'Cloud Build failed' or 'Docker build error'"
    echo "   ✅ Solution:"
    echo "      - Check Dockerfiles are valid: docker build -f Dockerfile.api ."
    echo "      - Check Cargo.lock exists: ls -la Cargo.lock"
    echo "      - View build logs: gcloud builds log <BUILD_ID>"
    echo ""
    
    echo "❌ Error: 'Health check failed' (502 Bad Gateway)"
    echo "   ✅ Solution:"
    echo "      - Check API logs: gcloud run logs read $API_SERVICE --limit=50"
    echo "      - Verify DATABASE_URL is correct"
    echo "      - Check if migrations ran: Check Cloud Build output"
    echo "      - Verify port 3000 is exposed in Dockerfile"
    echo ""
    
    echo "❌ Error: 'Connection refused' or database errors"
    echo "   ✅ Solution:"
    echo "      - Verify DATABASE_URL in Secret Manager"
    echo "      - Check Neon database is running: https://console.neon.tech"
    echo "      - Verify Redis URL in Secret Manager"
    echo "      - Check Upstash Redis is running: https://console.upstash.com"
    echo ""
    
    echo "❌ Error: 'Out of memory' or 'service timeout'"
    echo "   ✅ Solution:"
    echo "      - Increase memory: gcloud run deploy $API_SERVICE --memory=1Gi --region=$REGION"
    echo "      - Check logs: gcloud run logs read $API_SERVICE --limit=100"
    echo ""
}

# ─────────────────────────────────────────────────────────────────
# 8. Deployment Verification Checklist
# ─────────────────────────────────────────────────────────────────
verification_checklist() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "DEPLOYMENT VERIFICATION CHECKLIST"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    CHECKS_PASSED=0
    CHECKS_TOTAL=0
    
    # Check 1: GCP Authentication
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if gcloud auth list | grep -q ACTIVE; then
        success "✓ GCP authentication configured"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        error "✗ GCP authentication missing"
    fi
    
    # Check 2: Project set
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ "$(gcloud config get-value project)" = "$PROJECT_ID" ]; then
        success "✓ GCP project set to $PROJECT_ID"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        error "✗ Wrong GCP project"
    fi
    
    # Check 3: .env.production exists
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ -f ".env.production" ]; then
        success "✓ .env.production file exists"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        error "✗ .env.production missing"
    fi
    
    # Check 4: Dockerfiles exist
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ -f "Dockerfile.api" ] && [ -f "Dockerfile.worker" ] && [ -f "Dockerfile.dashboard" ]; then
        success "✓ All Dockerfiles present"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        error "✗ Missing Dockerfiles"
    fi
    
    # Check 5: Cloud Run services deployed
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if gcloud run services describe "$API_SERVICE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
        success "✓ API Cloud Run service deployed"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        error "✗ API not deployed to Cloud Run"
    fi
    
    # Check 6: Secrets in Secret Manager
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if gcloud secrets describe "hooksniff-db-url" --project="$PROJECT_ID" &>/dev/null; then
        success "✓ Secrets synced to Google Secret Manager"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        error "✗ Secrets not in Secret Manager"
    fi
    
    echo ""
    echo "Result: $CHECKS_PASSED/$CHECKS_TOTAL checks passed"
    echo ""
}

# ─────────────────────────────────────────────────────────────────
# Main Menu
# ─────────────────────────────────────────────────────────────────
main() {
    case "${1:-menu}" in
        auth)
            check_auth
            ;;
        services)
            check_services
            ;;
        secrets)
            check_secrets
            ;;
        envvars)
            check_env_vars
            ;;
        logs)
            check_logs
            ;;
        resources)
            check_resources
            ;;
        errors)
            common_errors
            ;;
        checklist)
            verification_checklist
            ;;
        all)
            check_auth
            check_services
            check_secrets
            check_env_vars
            check_logs
            check_resources
            verification_checklist
            ;;
        *)
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  auth       - Check GCP authentication"
            echo "  services   - Check Cloud Run services status"
            echo "  secrets    - Check Secret Manager secrets"
            echo "  envvars    - Check environment variables"
            echo "  logs       - View recent API logs"
            echo "  resources  - Check resource limits"
            echo "  errors     - Show common errors & solutions"
            echo "  checklist  - Verify deployment checklist"
            echo "  all        - Run all checks"
            echo ""
            echo "Examples:"
            echo "  $0 all           # Run all diagnostic checks"
            echo "  $0 logs          # View API logs"
            echo "  $0 errors        # Show troubleshooting guide"
            ;;
    esac
}

main "$@"
