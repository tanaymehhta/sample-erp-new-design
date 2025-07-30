#\!/bin/bash

# Test script for the Webhook to Slack workflow

echo "🧪 Testing Webhook to Slack Workflow"
echo "===================================="

# Configuration
N8N_URL="http://localhost:5678"
WEBHOOK_PATH="webhook-to-slack"
WEBHOOK_URL="${N8N_URL}/webhook/${WEBHOOK_PATH}"

# Test functions
test_basic_webhook() {
    echo "📝 Testing basic webhook..."
    curl -X POST "${WEBHOOK_URL}" \
        -H "Content-Type: application/json" \
        -d '{
            "event": "Test Alert",
            "message": "This is a test message from the webhook",
            "source": "Test Script"
        }' \
        -w "\nHTTP Status: %{http_code}\n" \
        -s
    echo ""
}

test_detailed_webhook() {
    echo "📊 Testing detailed webhook with custom data..."
    curl -X POST "${WEBHOOK_URL}" \
        -H "Content-Type: application/json" \
        -d '{
            "channel": "#general",
            "event": "System Monitor Alert",
            "message": "High CPU usage detected",
            "source": "Monitoring System",
            "severity": "warning",
            "cpu_usage": "85%",
            "memory_usage": "78%",
            "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
        }' \
        -w "\nHTTP Status: %{http_code}\n" \
        -s
    echo ""
}

test_error_case() {
    echo "❌ Testing error handling with malformed JSON..."
    curl -X POST "${WEBHOOK_URL}" \
        -H "Content-Type: application/json" \
        -d '{"invalid": json}' \
        -w "\nHTTP Status: %{http_code}\n" \
        -s
    echo ""
}

test_minimal_payload() {
    echo "🔍 Testing minimal payload..."
    curl -X POST "${WEBHOOK_URL}" \
        -H "Content-Type: application/json" \
        -d '{"message": "Minimal test"}' \
        -w "\nHTTP Status: %{http_code}\n" \
        -s
    echo ""
}

# Check if n8n is running
check_n8n() {
    echo "🔍 Checking n8n connectivity..."
    if curl -s "${N8N_URL}/healthz" > /dev/null 2>&1; then
        echo "✅ n8n is running at ${N8N_URL}"
        return 0
    else
        echo "❌ Cannot connect to n8n at ${N8N_URL}"
        echo "   Make sure n8n is running and the workflow is activated"
        return 1
    fi
}

# Main execution
main() {
    echo "Webhook URL: ${WEBHOOK_URL}"
    echo ""
    
    if \! check_n8n; then
        exit 1
    fi
    
    echo ""
    echo "⚠️  Make sure your workflow is:"
    echo "   1. Imported into n8n"
    echo "   2. Configured with Slack credentials"
    echo "   3. Activated (toggle switch is ON)"
    echo ""
    read -p "Press Enter to continue with tests..."
    
    test_basic_webhook
    test_detailed_webhook
    test_minimal_payload
    
    echo "🎯 All tests completed\!"
    echo ""
    echo "💡 Tips:"
    echo "   - Check your Slack channel for messages"
    echo "   - Review n8n execution logs for details"
    echo "   - Error messages will be sent to #alerts channel"
    echo ""
    echo "🔧 If tests fail:"
    echo "   1. Verify workflow is activated in n8n"
    echo "   2. Check Slack credentials configuration"
    echo "   3. Ensure bot has permission to post in channels"
}

# Run main function
main "$@"
EOF < /dev/null