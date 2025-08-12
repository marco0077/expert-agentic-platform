/**
 * MCP Search Integration Utility for Node.js Backend
 * 
 * Provides web search capabilities via shared MCP server with intelligent
 * LLM-based search decision making for optimal agent responses.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { OpenAIService } from '../services/OpenAIService';

const execAsync = promisify(exec);

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

export interface SearchDecision {
  shouldSearch: boolean;
  reasoning: string;
  confidence: number;
  searchType: 'deep_expertise' | 'fresh_data' | 'comprehensive' | 'none';
}

class MCPSearchClient {
  private isAvailable: boolean = false;
  private initialized: boolean = false;
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
    this.checkMCPAvailability();
  }

  private async checkMCPAvailability(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Test MCP server availability
      const { stdout, stderr } = await execAsync('mcp-search-server --help', { timeout: 5000 });
      this.isAvailable = !stderr || stderr.length === 0;
      console.log('MCP search server availability:', this.isAvailable);
    } catch (error) {
      console.warn('MCP search server not available:', (error as Error).message);
      this.isAvailable = false;
    }
    
    this.initialized = true;
  }

  /**
   * Use LLM to intelligently determine if search is needed
   */
  async shouldSearch(query: string, expertiseArea: string, agentName: string): Promise<SearchDecision> {
    await this.checkMCPAvailability();
    
    if (!this.isAvailable) {
      return {
        shouldSearch: false,
        reasoning: 'MCP search server not available',
        confidence: 1.0,
        searchType: 'none'
      };
    }

    const searchDecisionPrompt = `
Analyze whether this expert agent should use web search to enhance their response.

QUERY: "${query}"
AGENT: ${agentName}
EXPERTISE: ${expertiseArea}

Consider these search scenarios:

1. DEEP_EXPERTISE: Agent needs current research, methodologies, or advanced techniques in their field
2. FRESH_DATA: Query requires recent events, current statistics, or real-time information
3. COMPREHENSIVE: Complex query needing broad current context beyond training data
4. NONE: Agent's existing knowledge is sufficient

Evaluate:
- Does the query ask for "latest", "recent", "current", or time-specific information?
- Does it require deep technical knowledge that benefits from current research?
- Is it asking about events, trends, or developments after the training cutoff?
- Would current web sources significantly improve the response quality?

Respond in this exact JSON format:
{
  "shouldSearch": boolean,
  "reasoning": "Brief explanation of decision",
  "confidence": number (0.0-1.0),
  "searchType": "deep_expertise" | "fresh_data" | "comprehensive" | "none"
}`;

    try {
      const response = await this.openAIService.generateResponse(
        "You are a search decision analyzer. Respond only with valid JSON as specified.",
        searchDecisionPrompt,
        0.3, // Low temperature for consistent decisions
        200  // Concise response
      );

      const decision = JSON.parse(response.content.trim()) as SearchDecision;
      
      // Validate the response structure
      if (typeof decision.shouldSearch === 'boolean' && 
          typeof decision.reasoning === 'string' &&
          typeof decision.confidence === 'number' &&
          ['deep_expertise', 'fresh_data', 'comprehensive', 'none'].includes(decision.searchType)) {
        
        console.log(`Search decision for ${agentName}: ${decision.shouldSearch ? 'SEARCH' : 'NO SEARCH'} (${decision.searchType}, confidence: ${decision.confidence})`);
        return decision;
      } else {
        throw new Error('Invalid decision format');
      }

    } catch (error) {
      console.warn('LLM search decision failed, using fallback logic:', error);
      return this.fallbackSearchDecision(query, expertiseArea);
    }
  }

  /**
   * Fallback search decision using keyword heuristics
   */
  private fallbackSearchDecision(query: string, expertiseArea: string): SearchDecision {
    const queryLower = query.toLowerCase();

    // Basic keyword-based fallback
    const freshDataTriggers = ['latest', 'recent', 'current', '2024', '2025', 'today', 'now'];
    const deepExpertiseTriggers = ['advanced', 'cutting-edge', 'state-of-the-art', 'research'];
    
    const needsFresh = freshDataTriggers.some(trigger => queryLower.includes(trigger));
    const needsDeep = deepExpertiseTriggers.some(trigger => queryLower.includes(trigger));

    if (needsFresh) {
      return {
        shouldSearch: true,
        reasoning: 'Query contains time-sensitive keywords',
        confidence: 0.7,
        searchType: 'fresh_data'
      };
    } else if (needsDeep) {
      return {
        shouldSearch: true,
        reasoning: 'Query requests advanced expertise',
        confidence: 0.7,
        searchType: 'deep_expertise'
      };
    } else {
      return {
        shouldSearch: false,
        reasoning: 'Agent knowledge should be sufficient',
        confidence: 0.8,
        searchType: 'none'
      };
    }
  }

  /**
   * Perform web search using shared MCP server
   */
  async search(query: string, domain: string, expertiseKeywords: string[] = [], maxResults: number = 5): Promise<SearchResult[]> {
    await this.checkMCPAvailability();
    
    if (!this.isAvailable) {
      console.warn('MCP search not available, returning empty results');
      return [];
    }

    try {
      // Build expertise-enhanced search query
      const searchQuery = this.buildExpertiseSearchQuery(query, domain, expertiseKeywords);
      
      console.log(`Performing MCP search for: "${searchQuery}"`);
      
      // TODO: Replace with actual MCP server call
      // This would interface with the same mcp-search-server that Python uses
      // For now, returning empty results as placeholder
      const results: SearchResult[] = [];
      
      return results;
    } catch (error) {
      console.error('MCP search failed:', error);
      return [];
    }
  }

  /**
   * Format search results into context for agent use
   */
  formatSearchContext(results: SearchResult[], query: string, searchType: string): string {
    if (!results || results.length === 0) {
      return '';
    }

    const contextHeader = this.getContextHeader(searchType);
    let context = `${contextHeader} "${query}":\n\n`;

    for (let i = 0; i < Math.min(results.length, 3); i++) {
      const result = results[i];
      if (result) {
        context += `${i + 1}. ${result.title}\n`;
        context += `   ${result.snippet}\n`;
        context += `   Source: ${result.url}\n\n`;
      }
    }

    return context;
  }

  private getContextHeader(searchType: string): string {
    switch (searchType) {
      case 'fresh_data':
        return 'Recent developments relevant to';
      case 'deep_expertise':
        return 'Current research and advanced insights on';
      case 'comprehensive':
        return 'Comprehensive current information about';
      default:
        return 'Additional context for';
    }
  }

  /**
   * Build expertise-enhanced search query
   */
  private buildExpertiseSearchQuery(query: string, domain: string, expertiseKeywords: string[]): string {
    let searchQuery = `${query} ${domain.replace('-', ' ')}`;
    
    // Add top expertise keywords for context
    const topKeywords = expertiseKeywords.slice(0, 2);
    if (topKeywords.length > 0) {
      searchQuery += ` ${topKeywords.join(' ')}`;
    }
    
    return searchQuery;
  }

  /**
   * Get search availability status
   */
  get searchAvailable(): boolean {
    return this.isAvailable;
  }
}

// Export singleton instance
export const mcpSearch = new MCPSearchClient();