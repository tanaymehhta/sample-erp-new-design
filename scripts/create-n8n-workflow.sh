#!/bin/bash

# Enhanced n8n Workflow Creator
# Creates workflows directly in n8n instance with proper API calls

set -e

# Configuration
N8N_BASE_URL="${N8N_API_URL:-http://localhost:5678}"
N8N_API_KEY="${N8N_API_KEY:-}"
WORKFLOW_FILE=""
WORKFLOW_NAME=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if n8n is running
check_n8n_status() {
    print_status "Checking n8n instance..."
    
    if curl -s --max-time 5 "${N8N_BASE_URL}/healthz" > /dev/null 2>&1; then
        print_success "n8n instance is running at ${N8N_BASE_URL}"
        return 0
    elif curl -s --max-time 5 "${N8N_BASE_URL}" > /dev/null 2>&1; then
        print_success "n8n instance is running at ${N8N_BASE_URL}"
        return 0
    else
        print_error "n8n instance not reachable at ${N8N_BASE_URL}"
        return 1
    fi
}

# Get API key from n8n settings if not provided
get_api_key() {
    if [[ -z "$N8N_API_KEY" ]]; then
        print_warning "No API key provided. Attempting to extract from n8n settings..."
        
        # Try to get from n8n config
        local config_file="$HOME/.n8n/config"
        if [[ -f "$config_file" ]]; then
            N8N_API_KEY=$(grep -o '"apiKey":"[^"]*"' "$config_file" 2>/dev/null | cut -d'"' -f4)
        fi
        
        if [[ -z "$N8N_API_KEY" ]]; then
            print_error "API key required. Set N8N_API_KEY environment variable or configure in n8n settings."
            echo "To generate an API key:"
            echo "1. Go to ${N8N_BASE_URL}/settings/api"
            echo "2. Create a new API key"
            echo "3. Export N8N_API_KEY=your-key-here"
            return 1
        fi
    fi
    return 0
}

# Create workflow via API
create_workflow_api() {
    local workflow_json="$1"
    local workflow_name="$2"
    
    print_status "Creating workflow via n8n API..."
    
    # Prepare the API request
    local api_url="${N8N_BASE_URL}/api/v1/workflows"
    
    # Make the API call
    local response
    response=$(curl -s -X POST "$api_url" \
        -H "Content-Type: application/json" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -d "$workflow_json" 2>&1)
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]] && echo "$response" | grep -q '"id"'; then
        local workflow_id
        workflow_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
        print_success "Workflow created successfully! ID: $workflow_id"
        echo "Access your workflow at: ${N8N_BASE_URL}/workflow/$workflow_id"
        return 0
    else
        print_error "Failed to create workflow via API"
        echo "Response: $response"
        return 1
    fi
}

# Import workflow via file upload simulation
import_workflow_browser() {
    local workflow_file="$1"
    
    print_status "Opening n8n in browser for manual import..."
    
    # Copy workflow to clipboard if available
    if command -v pbcopy > /dev/null 2>&1; then
        cat "$workflow_file" | pbcopy
        print_success "Workflow JSON copied to clipboard!"
    elif command -v xclip > /dev/null 2>&1; then
        cat "$workflow_file" | xclip -selection clipboard
        print_success "Workflow JSON copied to clipboard!"
    fi
    
    # Open n8n in browser
    local import_url="${N8N_BASE_URL}?import=true"
    
    if command -v open > /dev/null 2>&1; then
        open "$import_url"
    elif command -v xdg-open > /dev/null 2>&1; then
        xdg-open "$import_url"
    else
        print_warning "Cannot auto-open browser. Please go to: $import_url"
    fi
    
    echo ""
    echo "Manual Import Steps:"
    echo "1. Click 'Import from File' or use Ctrl+I"
    echo "2. Paste the workflow JSON (already in clipboard)"
    echo "3. Click 'Import'"
    echo "4. Configure Slack credentials if needed"
    echo "5. Activate the workflow"
    
    return 0
}

# Main function
main() {
    echo "🔧 n8n Workflow Creator"
    echo "======================="
    
    # Parse arguments
    if [[ $# -eq 0 ]]; then
        # Look for default workflow file
        if [[ -f "webhook-to-slack-workflow.json" ]]; then
            WORKFLOW_FILE="webhook-to-slack-workflow.json"
            WORKFLOW_NAME="Webhook to Slack"
        else
            print_error "No workflow file specified and default not found"
            echo "Usage: $0 [workflow-file.json] [workflow-name]"
            exit 1
        fi
    else
        WORKFLOW_FILE="$1"
        WORKFLOW_NAME="${2:-$(basename "$WORKFLOW_FILE" .json)}"
    fi
    
    # Validate workflow file
    if [[ ! -f "$WORKFLOW_FILE" ]]; then
        print_error "Workflow file not found: $WORKFLOW_FILE"
        exit 1
    fi
    
    # Check n8n status
    if ! check_n8n_status; then
        print_error "Please start your n8n instance first"
        echo "Try: docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n"
        exit 1
    fi
    
    # Read workflow JSON
    local workflow_json
    workflow_json=$(cat "$WORKFLOW_FILE")
    
    # Try API method first
    if get_api_key; then
        if create_workflow_api "$workflow_json" "$WORKFLOW_NAME"; then
            print_success "Workflow created successfully via API!"
            exit 0
        else
            print_warning "API method failed, falling back to browser import..."
        fi
    else
        print_warning "API key not available, using browser import method..."
    fi
    
    # Fallback to browser method
    import_workflow_browser "$WORKFLOW_FILE"
}

# Run main function
main "$@"