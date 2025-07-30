#\!/bin/bash

# Webhook to Slack Workflow Import Script
# This script helps import the webhook-to-slack workflow into n8n

echo "🚀 Webhook to Slack Workflow Import Script"
echo "=========================================="

# Check if n8n is running
check_n8n() {
    echo "📡 Checking if n8n is running..."
    if curl -s http://localhost:5678/healthz > /dev/null 2>&1; then
        echo "✅ n8n is running on localhost:5678"
        return 0
    else
        echo "❌ n8n is not running on localhost:5678"
        echo "   Please start n8n first by running: npx n8n"
        return 1
    fi
}

# Import workflow function
import_workflow() {
    echo ""
    echo "📋 Workflow Import Options:"
    echo "1. Manual Import (Recommended)"
    echo "2. Copy workflow JSON to clipboard"
    echo ""
    read -p "Choose option (1 or 2): " choice
    
    case $choice in
        1)
            echo ""
            echo "📖 Manual Import Instructions:"
            echo "1. Open your n8n instance at http://localhost:5678"
            echo "2. Click 'Import from File' (or press Ctrl+O)"
            echo "3. Select the 'webhook-to-slack-workflow.json' file"
            echo "4. Click 'Import'"
            echo "5. Follow the setup guide in 'webhook-slack-setup-guide.md'"
            ;;
        2)
            if command -v pbcopy > /dev/null 2>&1; then
                cat webhook-to-slack-workflow.json | pbcopy
                echo "✅ Workflow JSON copied to clipboard\!"
                echo "   Paste it into n8n's import dialog"
            elif command -v xclip > /dev/null 2>&1; then
                cat webhook-to-slack-workflow.json | xclip -selection clipboard
                echo "✅ Workflow JSON copied to clipboard\!"
                echo "   Paste it into n8n's import dialog"
            else
                echo "📄 Clipboard utility not found. Here's the workflow JSON:"
                echo "   Copy the contents of 'webhook-to-slack-workflow.json'"
            fi
            ;;
        *)
            echo "❌ Invalid option. Please run the script again."
            exit 1
            ;;
    esac
}

# Display setup reminders
show_setup_reminders() {
    echo ""
    echo "🔧 Setup Reminders:"
    echo "==================="
    echo "1. Configure Slack credentials in n8n"
    echo "2. Test the webhook endpoint"
    echo "3. Activate the workflow"
    echo "4. Review the complete setup guide: webhook-slack-setup-guide.md"
    echo ""
    echo "📝 Example webhook test:"
    echo "curl -X POST \"http://localhost:5678/webhook/webhook-to-slack\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"event\":\"Test\",\"message\":\"Hello from webhook\!\"}'"
}

# Main execution
main() {
    # Check if required files exist
    if [[ ! -f "webhook-to-slack-workflow.json" ]]; then
        echo "❌ Error: webhook-to-slack-workflow.json not found\!"
        echo "   Please ensure you're in the correct directory."
        exit 1
    fi

    if [[ ! -f "webhook-slack-setup-guide.md" ]]; then
        echo "⚠️  Warning: webhook-slack-setup-guide.md not found\!"
        echo "   The setup guide is recommended for configuration help."
    fi

    # Check n8n status
    if \! check_n8n; then
        echo ""
        echo "🔧 To start n8n:"
        echo "   npm install -g n8n"
        echo "   n8n start"
        echo ""
        echo "📄 You can still import the workflow once n8n is running."
    fi

    # Import workflow
    import_workflow

    # Show setup reminders
    show_setup_reminders

    echo ""
    echo "🎉 Import process complete\!"
    echo "   For detailed setup instructions, see: webhook-slack-setup-guide.md"
}

# Run main function
main "$@"
EOF < /dev/null