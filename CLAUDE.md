# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This appears to be a newly initialized project with minimal structure. The repository currently contains only a VS Code workspace file (`expert agentic platform.code-workspace`) and no source code, dependencies, or documentation.

## Current Structure

- `expert agentic platform.code-workspace`: VS Code workspace configuration file

## Development Setup

Since this is an empty project, development commands will need to be established based on the technology stack chosen. Once the project structure is defined, this section should be updated with:

- Installation/setup commands
- Build commands
- Test commands
- Linting commands
- Development server commands

## Architecture Notes

### Expert Agent System
The platform implements a multi-agent architecture with specialized expert agents:

- **Base Agent Class**: Abstract base class with MCP search integration
- **Specialized Agents**: Data Scientist, Researcher, Business Analyst
- **Orchestrator Agent**: Coordinates multiple specialists for complex queries
- **Search Integration**: All agents can access real-time web data via MCP server

### Unified MCP Search Integration
All agents across both Python and Node.js backends share intelligent web search capabilities:
- **Shared MCP Server**: Single `mcp-search-server` instance serves both backends
- **LLM-Based Search Decisions**: Intelligent determination using semantic analysis instead of keywords
- **Language-Specific Clients**: Python and TypeScript clients for optimal integration
- **Consistent Search Behavior**: Same decision logic and result formatting across backends
- **Smart Context Enhancement**: Search results intelligently integrated with expert knowledge
- **Quality Control**: Limited to top 3 results, clearly marked by search type
- See `/backend-python/docs/MCP_SEARCH_GUIDELINES.md` for detailed usage guidelines

### Key Design Patterns
- **Expert Selection**: Agents self-assess relevance and coordinate responses
- **Async Processing**: Non-blocking specialist coordination
- **Search-Enhanced Responses**: Dynamic integration of current information
- **Modular Architecture**: Easy addition of new expert agents

## Next Steps for Development

1. Initialize the project with a chosen technology stack
2. Set up basic project structure and configuration files
3. Update this CLAUDE.md with specific commands and architectural guidance