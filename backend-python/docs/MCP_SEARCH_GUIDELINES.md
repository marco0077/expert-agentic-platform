# Unified MCP Search Integration Guidelines

## Overview

All expert agents across both Python and Node.js backends now share intelligent MCP web search capabilities via DuckDuckGo. This unified architecture enables consistent search behavior while allowing agents to enhance their responses with current, up-to-date information when semantically determined to be beneficial.

## Search Usage Policy

### When Agents SHOULD Use Search

1. **Deep Expertise Queries**: When asked about specialized topics that benefit from current research, methodologies, or best practices
2. **Fresh Data Requests**: When users explicitly ask for recent, current, or up-to-date information
3. **Complex Analysis**: When comprehensive responses require current market data, statistics, or trends
4. **Methodology Updates**: When asked about latest techniques, tools, or approaches in the agent's expertise area

### When Agents SHOULD NOT Use Search

1. **Basic Knowledge**: For fundamental concepts well-covered in training data
2. **General Advice**: For standard recommendations that don't require current data
3. **Simple Calculations**: For mathematical or logical operations
4. **Historical Information**: For well-established facts or past events

### Intelligent Search Decision Making

The system uses **LLM-based semantic analysis** to determine when to search, replacing hardcoded keywords:

#### Search Decision Process:
1. **LLM Analysis**: Query is analyzed using GPT-3.5-turbo for semantic understanding
2. **Context Evaluation**: Agent expertise, query complexity, and information freshness needs
3. **Decision Types**:
   - `deep_expertise`: Current research, methodologies, advanced techniques
   - `fresh_data`: Recent events, statistics, real-time information  
   - `comprehensive`: Complex queries needing broad current context
   - `none`: Agent's existing knowledge is sufficient
4. **Fallback Logic**: Keyword-based heuristics if LLM analysis fails

#### Benefits over Keywords:
- **Semantic Understanding**: Understands intent vs. surface-level word matching
- **Context-Aware**: Considers agent expertise in decision making
- **Adaptive**: Learns from query patterns and contexts
- **Consistent**: Same logic applied across Python and Node.js backends

## Agent-Specific Search Behavior

### Data Scientist Agent
- Searches for latest ML algorithms, research papers, and statistical methods
- Focuses on current datasets, benchmarks, and model performance metrics
- Keywords: "machine learning", "statistics", "algorithms", "data analysis"

### Research Specialist Agent  
- Searches for recent academic publications and methodologies
- Focuses on current research trends and evidence-based findings
- Keywords: "research", "methodology", "academic", "peer-reviewed", "studies"

### Business Analyst Agent
- Searches for current industry trends, market data, and business metrics
- Focuses on strategic insights and performance benchmarks
- Keywords: "business analysis", "strategic", "industry trends", "KPI"

## Unified Architecture

### Shared MCP Server
- **Single Instance**: One `mcp-search-server` serves both Python and Node.js backends
- **Consistent Configuration**: Same VS Code settings.json configuration
- **Resource Efficiency**: Single search server process instead of duplicates

### Language-Specific Clients
- **Python Client**: `/backend-python/utils/mcp_search.py`
- **TypeScript Client**: `/backend-node/src/utils/mcpSearch.ts`
- **Consistent API**: Same methods and behavior across languages
- **Native Integration**: Optimized for each language's patterns

### Cross-Backend Consistency
- **Same Decision Logic**: LLM prompts and fallback logic identical
- **Unified Result Formatting**: Consistent search context headers
- **Shared Guidelines**: Single documentation for both backends

## Technical Implementation

### Search Context Enhancement
When search is triggered, agents:
1. Build expertise-specific search queries
2. Include relevant domain keywords
3. Limit results to top 5 most relevant
4. Format search context appropriately
5. Integrate findings with base response

### Search Query Construction
```python
search_query = f"{user_query} {agent_expertise} {top_3_keywords}"
```

### Response Enhancement
```python
if search_context:
    response = f"{base_response}\n\nBased on recent developments:\n{search_context}"
```

## Quality Control

### Search Result Integration
- Search results are clearly marked as "recent developments" or similar
- Base expert knowledge is always provided first
- Search context enhances rather than replaces expertise
- Maximum 3 search results are integrated per response

### Error Handling
- If MCP search fails, agents fall back to base responses
- Search unavailability doesn't interrupt core functionality
- Logging captures search attempts for monitoring

## Monitoring and Usage

### Logging
- All search attempts are logged with agent name and query
- Search triggers and results are tracked for optimization
- Performance metrics monitor search relevance and utility

### Configuration
- Search can be disabled per agent or globally if needed
- Maximum result limits can be adjusted per agent type
- Search timeout and retry logic is configurable

## Best Practices for Future Agent Development

1. **Inherit from BaseAgent**: All new agents automatically get search capabilities
2. **Implement _generate_specialized_response(query, search_context)**: Handle both base and enhanced responses
3. **Define Expertise Keywords**: Provide relevant keywords for search query enhancement
4. **Test Search Integration**: Verify search enhancement improves response quality
5. **Document Search Behavior**: Specify when and how the agent uses search in its domain

## Example Usage

```python
# Agent automatically determines when to search
response = agent.generate_response("What are the latest machine learning trends in 2025?")

# Search can be disabled if needed
response = agent.generate_response("What is regression analysis?", use_search=False)
```

This integration ensures all current and future agents have access to fresh, relevant information while maintaining the quality and expertise of their base knowledge.