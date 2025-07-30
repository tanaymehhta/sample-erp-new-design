# Fixing n8n MCP Configuration

## Current Issue
The n8n MCP tools are configured with the wrong API endpoint:
- Current: `http://localhost:5678/workflow/new`
- Should be: `http://localhost:5678/api/v1`

## Solution 1: Fix Environment Variable
In your shell profile (`.bashrc`, `.zshrc`, etc.):
```bash
export N8N_API_URL="http://localhost:5678/api/v1"
export N8N_API_KEY="your-api-key-here"
```

## Solution 2: Create Custom Agent
Create an agent that can:
1. Auto-detect n8n instance
2. Import workflows via web interface automation
3. Handle credential setup

## Testing the Fix
After fixing the API URL, test with:
```bash
# This should work after the fix
claude "create an n8n workflow that sends webhooks to slack"
```