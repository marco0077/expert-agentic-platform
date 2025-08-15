/**
 * MCP Search Integration Utility for Node.js Backend
 * 
 * Provides web search capabilities via shared MCP server with intelligent
 * LLM-based search decision making for optimal agent responses.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { OpenAIService } from '../services/OpenAIService.js';

const execAsync = promisify(exec);

// MCP Web Tools Client will be loaded dynamically
let MCPWebToolsClient: any = null;

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string; // Extracted content from the URL
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
  private mcpClient: any = null;

  constructor() {
    this.openAIService = new OpenAIService();
    this.checkMCPAvailability();
  }

  private async checkMCPAvailability(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Dynamic import for ES module
      if (!MCPWebToolsClient) {
        const mcpModule = await import('mcp-search-tools');
        MCPWebToolsClient = mcpModule.MCPWebToolsClient || mcpModule.default;
        console.log('MCP module imported successfully:', Object.keys(mcpModule));
      }
      
      if (MCPWebToolsClient) {
        this.mcpClient = new MCPWebToolsClient();
        // Try to connect to the server
        await this.mcpClient.connect('mcp-search-server');
        this.isAvailable = true;
        console.log('MCP search client connected successfully');
      } else {
        this.isAvailable = false;
        console.warn('MCPWebToolsClient class not available in imported module');
      }
    } catch (error) {
      console.warn('MCP search client connection failed:', (error as Error).message);
      this.isAvailable = false;
      this.mcpClient = null;
    }
    
    this.initialized = true;
  }

  /**
   * Simplified LLM search assessment - reusable by all agents
   */
  async shouldSearchSimple(query: string, agentName: string, agentExpertise: string): Promise<boolean> {
    const simplePrompt = `Query: "${query}"
Agent: ${agentName} (${agentExpertise})

Does this agent need current web data to answer accurately?

Consider:
- Recent events, data, news
- Current prices, scores, standings  
- Real-time information
- Recent research in the agent's field

Examples:
- "define photosynthesis" → NO (definition doesn't change)
- "current Tesla stock price" → YES (prices change)
- "Yankees standings" → YES (sports data changes)
- "latest AI research" → YES (research is ongoing)

Answer: YES or NO`;

    try {
      const response = await this.openAIService.generateResponse(
        `You are a search decision assistant for ${agentName}. Answer only YES or NO.`,
        simplePrompt,
        0.1, // Very low temperature
        10   // Very short response
      );

      const decision = response.content.trim().toUpperCase();
      const needsSearch = decision === 'YES';
      
      console.log(`[${agentName}] Search assessment: ${needsSearch ? 'YES' : 'NO'}`);
      return needsSearch;

    } catch (error) {
      console.warn(`[${agentName}] Search assessment failed, using fallback:`, error);
      return this.fallbackSearchDecisionSimple(query);
    }
  }

  private fallbackSearchDecisionSimple(query: string): boolean {
    const queryLower = query.toLowerCase();
    const freshDataTriggers = [
      'latest', 'recent', 'current', '2024', '2025', 'today', 'now',
      'standings', 'score', 'price', 'stock', 'weather', 'news', 'update',
      'status', 'live', 'real-time', 'this year', 'this month'
    ];
    
    return freshDataTriggers.some(trigger => queryLower.includes(trigger));
  }

  /**
   * Use LLM to intelligently determine if search is needed (original method)
   */
  async shouldSearch(query: string, expertiseArea: string, agentName: string): Promise<SearchDecision> {
    console.log(`[MCP Search] Evaluating search decision for "${query}" - Agent: ${agentName}`);
    await this.checkMCPAvailability();
    console.log(`[MCP Search] MCP Available: ${this.isAvailable}`);
    
    if (!this.isAvailable) {
      console.log(`[MCP Search] Search server not available, skipping search`);
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
      console.warn('[MCP Search] LLM search decision failed, using fallback logic:', error);
      const fallbackDecision = this.fallbackSearchDecision(query, expertiseArea);
      console.log(`[MCP Search] Fallback decision: ${fallbackDecision.shouldSearch ? 'SEARCH' : 'NO SEARCH'} (${fallbackDecision.searchType}) - ${fallbackDecision.reasoning}`);
      return fallbackDecision;
    }
  }

  /**
   * Fallback search decision using keyword heuristics
   */
  private fallbackSearchDecision(query: string, expertiseArea: string): SearchDecision {
    const queryLower = query.toLowerCase();

    // Expanded keyword-based fallback
    const freshDataTriggers = [
      'latest', 'recent', 'current', '2024', '2025', 'today', 'now',
      'standings', 'score', 'price', 'stock', 'weather', 'news', 'update',
      'status', 'live', 'real-time', 'this year', 'this month'
    ];
    const deepExpertiseTriggers = ['advanced', 'cutting-edge', 'state-of-the-art', 'research'];
    
    const needsFresh = freshDataTriggers.some(trigger => queryLower.includes(trigger));
    const needsDeep = deepExpertiseTriggers.some(trigger => queryLower.includes(trigger));

    console.log(`[MCP Search] Fallback analysis - Query: "${query}"`);
    console.log(`[MCP Search] Fresh data triggers found: ${freshDataTriggers.filter(trigger => queryLower.includes(trigger))}`);
    console.log(`[MCP Search] Deep expertise triggers found: ${deepExpertiseTriggers.filter(trigger => queryLower.includes(trigger))}`);

    if (needsFresh) {
      return {
        shouldSearch: true,
        reasoning: 'Query contains time-sensitive keywords including sports data, prices, or current information',
        confidence: 0.8,
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
   * Extract content from a URL and clean it for agent use
   */
  private async extractContentFromUrl(url: string): Promise<string | null> {
    try {
      console.log(`[MCP Search] Extracting content from: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000,
        maxRedirects: 5,
        maxContentLength: 2000000 // Limit content size to 2MB
      });

      const html = response.data;
      
      // Extract text content using targeted patterns for financial data
      let textContent = html;
      
      // First, try to extract specific financial data patterns
      const pricePatterns = [
        // Tesla stock price patterns
        /tesla.*?(\$[0-9.,]+)/gi,
        /tsla.*?(\$[0-9.,]+)/gi,
        /price.*?(\$[0-9.,]+)/gi,
        /current.*?(\$[0-9.,]+)/gi,
        // Generic stock price patterns
        /\$([0-9]{2,4}(?:\.[0-9]{2})?)/g,
        // Price with currency symbol
        /[\$£€]([0-9,]+\.?[0-9]*)/g
      ];
      
      let extractedData = '';
      for (const pattern of pricePatterns) {
        const matches = textContent.match(pattern);
        if (matches) {
          extractedData += matches.slice(0, 5).join(' ') + ' ';
        }
      }
      
      // Clean HTML and extract general text
      textContent = html
        // Remove script and style elements
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Remove HTML tags
        .replace(/<[^>]*>/g, ' ')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // If we found specific financial data, prioritize it
      if (extractedData.trim()) {
        textContent = extractedData + ' ' + textContent.substring(0, 2000);
      }

      // Limit content length for processing
      if (textContent.length > 4000) {
        textContent = textContent.substring(0, 4000) + '...';
      }

      console.log(`[MCP Search] Extracted ${textContent.length} characters from ${url}`);
      console.log('='.repeat(80));
      console.log(`EXTRACTED CONTENT FROM: ${url}`);
      console.log('='.repeat(80));
      console.log(textContent);
      console.log('='.repeat(80));
      return textContent;

    } catch (error) {
      console.warn(`[MCP Search] Failed to extract content from ${url}:`, (error as Error).message);
      return null;
    }
  }

  /**
   * Perform web search using MCP Web Tools Client
   */
  async search(query: string, domain: string, expertiseKeywords: string[] = [], maxResults: number = 5): Promise<SearchResult[]> {
    await this.checkMCPAvailability();
    
    if (!this.isAvailable || !this.mcpClient) {
      console.warn('MCP search not available, returning empty results');
      return [];
    }

    try {
      // Build expertise-enhanced search query
      const searchQuery = this.buildExpertiseSearchQuery(query, domain, expertiseKeywords);
      
      console.log(`Performing MCP web search for: "${searchQuery}"`);
      
      // Use MCP Web Tools Client to perform search
      const searchInput = {
        query: searchQuery,
        maxResults: maxResults,
        region: 'us', // Default to US region
        time: 'recent' // Focus on recent results for fresh data
      };
      
      const searchResponse = await this.mcpClient.searchWeb(searchInput);
      console.log('MCP search response:', searchResponse);
      
      const results: SearchResult[] = [];
      
      // Parse the search results based on the MCP response format
      if (searchResponse && typeof searchResponse === 'object') {
        const content = (searchResponse as any).content;
        if (content && Array.isArray(content)) {
          for (const item of content) {
            if (item.type === 'text' && item.text) {
              try {
                // The text contains JSON with search results
                const searchData = JSON.parse(item.text);
                if (searchData.results && Array.isArray(searchData.results)) {
                  for (const result of searchData.results) {
                    if (result.title && result.url) {
                      results.push({
                        title: result.title,
                        url: result.url,
                        snippet: result.snippet || `Information from ${result.source || 'web search'}`,
                        relevanceScore: 0.9 // High relevance for fresh search results
                      });
                    }
                  }
                }
              } catch (parseError) {
                console.warn('Failed to parse JSON search results, trying line parsing:', parseError);
                // Fallback to line-by-line parsing if JSON parsing fails
                const lines = item.text.split('\n');
                let currentResult: Partial<SearchResult> = {};
                
                for (const line of lines) {
                  if (line.startsWith('Title: ')) {
                    if (currentResult.title && currentResult.url) {
                      results.push({
                        title: currentResult.title,
                        url: currentResult.url,
                        snippet: currentResult.snippet || '',
                        relevanceScore: 0.8
                      });
                    }
                    currentResult = { title: line.substring(7) };
                  } else if (line.startsWith('URL: ')) {
                    currentResult.url = line.substring(5);
                  } else if (line.startsWith('Snippet: ')) {
                    currentResult.snippet = line.substring(9);
                  }
                }
                
                // Add the last result if complete
                if (currentResult.title && currentResult.url) {
                  results.push({
                    title: currentResult.title,
                    url: currentResult.url,
                    snippet: currentResult.snippet || '',
                    relevanceScore: 0.8
                  });
                }
              }
            }
          }
        }
      }
      
      console.log(`MCP search returned ${results.length} results`);
      
      // Extract content from the top search results
      const resultsWithContent: SearchResult[] = [];
      const maxContentExtractions = Math.min(results.length, 3); // Extract content from top 3 results
      
      for (let i = 0; i < maxContentExtractions; i++) {
        const result = results[i];
        if (result) {
          try {
            const content = await this.extractContentFromUrl(result.url);
            resultsWithContent.push({
              ...result,
              content: content || undefined
            });
          } catch (error) {
            console.warn(`[MCP Search] Content extraction failed for ${result.url}:`, error);
            // Add result without content if extraction fails
            resultsWithContent.push(result);
          }
        }
      }
      
      // Add remaining results without content extraction
      for (let i = maxContentExtractions; i < results.length; i++) {
        const result = results[i];
        if (result) {
          resultsWithContent.push(result);
        }
      }
      
      console.log(`MCP search completed with ${resultsWithContent.filter(r => r.content).length} results having extracted content`);
      return resultsWithContent.slice(0, maxResults);
      
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
        
        // Include extracted content if available
        if (result.content) {
          context += `   Content: ${result.content}\n`;
          console.log(`[MCP Search] Including content in search context for ${result.title}: ${result.content.substring(0, 200)}...`);
        }
        
        context += `   Source: ${result.url}\n\n`;
      }
    }

    console.log(`[MCP Search] Final search context length: ${context.length} characters`);
    console.log(`[MCP Search] Search context preview: ${context.substring(0, 300)}...`);
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