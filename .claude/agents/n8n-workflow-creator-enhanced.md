# Enhanced n8n Workflow Creator Agent

## Purpose
Creates n8n workflows directly in the user's instance, handling both API and manual import methods.

## Usage
This agent should be used when the user requests n8n workflow creation and the standard MCP tools fail.

## Capabilities
1. **Smart Workflow Creation**: Generates complete workflow JSON with proper node connections
2. **Multi-Method Import**: Tries API first, falls back to browser-assisted import
3. **Credential Guidance**: Provides setup instructions for required services
4. **Testing Integration**: Includes test scripts and validation

## Process
1. Generate workflow JSON based on user requirements
2. Attempt direct API creation using enhanced script
3. If API fails, assist with browser import (with clipboard copy)
4. Provide testing commands and setup guidance

## Tools Used
- Custom script: `/scripts/create-n8n-workflow.sh`
- n8n MCP tools (when working)
- File operations for workflow generation
- Browser automation guidance

## Example Invocation
```
Create an n8n workflow that receives webhooks and sends Slack messages, using the enhanced creation method that handles API issues.
```

## Success Criteria
- Workflow is created and importable
- User can access workflow in their n8n instance
- All required credentials are documented
- Testing methods are provided