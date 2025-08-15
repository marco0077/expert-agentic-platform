import { OpenAIService, LLMResponse } from '../services/OpenAIService.js';
import { SYSTEM_PROMPTS } from '../data/systemPrompts.js';
import { EXPERTISE_DATABASE } from '../data/expertiseDatabase.js';
import { mcpSearch, SearchResult, SearchDecision } from '../utils/mcpSearch.js';
import { dynamicSourceGenerator, ValidatedSource } from '../utils/dynamicSources.js';

export interface ExpertResponse {
  content: string;
  confidence: number;
  sources?: string[];
  tokensUsed?: number;
  agentDomain: string;
  searchEnhanced?: boolean;
  searchReasoning?: string;
}

export abstract class ExpertAgent {
  protected name: string;
  protected domain: string;
  protected expertise: string;
  protected confidence: number = 0;
  protected currentQuery: string = '';
  protected openAIService: OpenAIService;

  constructor(name: string, domain: string, expertise: string) {
    this.name = name;
    this.domain = domain;
    this.expertise = expertise;
    this.openAIService = new OpenAIService();
  }

  abstract assessRelevance(query: string): Promise<number>;
  
  async generateResponse(useSearch: boolean = true): Promise<ExpertResponse> {
    if (!this.currentQuery) {
      throw new Error('No query set for agent response generation');
    }

    console.log(`[${this.name}] Starting generateResponse for query: "${this.currentQuery}"`);
    console.log(`[${this.name}] useSearch parameter: ${useSearch}`);

    try {
      // Check if we should enhance response with search data using LLM decision
      let searchContext = '';
      let searchDecision: SearchDecision | null = null;
      
      if (useSearch) {
        console.log(`[${this.name}] Calling simplified search assessment...`);
        const needsSearch = await mcpSearch.shouldSearchSimple(this.currentQuery, this.name, this.expertise);
        
        if (needsSearch) {
          searchDecision = {
            shouldSearch: true,
            reasoning: `${this.name} determined web search needed for current data`,
            confidence: 0.8,
            searchType: 'fresh_data'
          };
          console.log(`[${this.name}] Search approved - ${searchDecision.reasoning}`);
          console.log(`[${this.name}] Search approved, performing contextual search...`);
          const searchResults = await this.performContextualSearch(this.currentQuery);
          if (searchResults.length > 0) {
            searchContext = mcpSearch.formatSearchContext(searchResults, this.currentQuery, searchDecision.searchType);
            console.log(`Enhanced ${this.name} response with ${searchResults.length} search results (${searchDecision.reasoning})`);
          } else {
            console.log(`[${this.name}] No search results returned`);
          }
        } else {
          searchDecision = {
            shouldSearch: false,
            reasoning: `${this.name} determined search not needed`,
            confidence: 0.8,
            searchType: 'none'
          };
          console.log(`[${this.name}] Search not needed - ${searchDecision.reasoning}`);
        }
      } else {
        console.log(`[${this.name}] Search disabled by useSearch parameter`);
      }

      const systemPrompt = SYSTEM_PROMPTS[this.domain];
      if (!systemPrompt) {
        throw new Error(`No system prompt found for domain: ${this.domain}`);
      }

      // Enhance system prompt with search context if available
      const enhancedPrompt = searchContext 
        ? `${systemPrompt}\n\nAdditional current context to consider in your response:\n${searchContext}`
        : systemPrompt;

      // Optimize parameters based on query complexity
      const isSimpleQuery = this.currentQuery.length < 50 && /^(what|how|when|where|who|define|explain).{1,30}\?*$/i.test(this.currentQuery);
      const temperature = isSimpleQuery ? 0.3 : 0.7; // Lower temperature for simple queries
      const maxTokens = isSimpleQuery ? 1000 : 5000; // Fewer tokens for simple queries
      
      console.log(`[${this.name}] Query optimization: simple=${isSimpleQuery}, temp=${temperature}, maxTokens=${maxTokens}`);
      
      const llmResponse: LLMResponse = await this.openAIService.generateResponse(
        enhancedPrompt,
        this.currentQuery,
        temperature,
        maxTokens
      );

      // Skip source generation for empty responses or simple queries to improve performance
      let dynamicSources: string[] = [];
      if (llmResponse.content.trim().length > 0 && this.currentQuery.length > 20) {
        console.log(`[${this.name}] Generating dynamic sources for detailed response`);
        dynamicSources = await this.generateDynamicSources(llmResponse.content);
      } else {
        console.log(`[${this.name}] Skipping source generation for simple/empty response`);
      }

      return {
        content: llmResponse.content,
        confidence: this.confidence,
        sources: dynamicSources,
        tokensUsed: llmResponse.tokensUsed,
        agentDomain: this.domain,
        searchEnhanced: searchDecision?.shouldSearch || false,
        searchReasoning: searchDecision?.reasoning
      };

    } catch (error) {
      console.error(`Error generating response for ${this.name}:`, error);
      return {
        content: `I apologize, but I'm experiencing technical difficulties generating a response. Please try again later.`,
        confidence: 0.1,
        sources: [],
        tokensUsed: 0,
        agentDomain: this.domain,
        searchEnhanced: false
      };
    }
  }

  getName(): string {
    return this.name;
  }

  getExpertise(): string {
    return this.expertise;
  }

  getConfidence(): number {
    return this.confidence;
  }

  async processQuery(query: string): Promise<ExpertResponse> {
    this.currentQuery = query;
    
    // Only assess relevance if confidence hasn't been set by orchestrator
    // (LLM-based selection is more accurate than individual agent assessment)
    if (this.confidence === 0) {
      this.confidence = await this.assessRelevance(query);
    }
    
    return await this.generateResponse();
  }

  protected async performContextualSearch(query: string): Promise<SearchResult[]> {
    // Get expertise-specific keywords from database
    const expertiseData = EXPERTISE_DATABASE[this.domain];
    const expertiseKeywords = expertiseData ? expertiseData.relevanceKeywords.slice(0, 3) : [];
    
    console.log(`${this.name} performing contextual search for: ${query}`);
    return await mcpSearch.search(query, this.domain, expertiseKeywords, 5);
  }

  public setCurrentQuery(query: string): void {
    this.currentQuery = query;
  }

  public setConfidence(confidence: number): void {
    this.confidence = confidence;
  }

  protected async calculateRelevance(query: string): Promise<number> {
    const expertiseData = EXPERTISE_DATABASE[this.domain];
    if (!expertiseData) {
      return 0.3; // Default relevance if no expertise data found
    }

    try {
      // Use semantic relevance calculation via OpenAI
      const semanticRelevance = await this.calculateSemanticRelevance(query, expertiseData);
      
      // Fallback to keyword matching if OpenAI fails
      if (semanticRelevance > 0) {
        return semanticRelevance;
      }
    } catch (error) {
      console.warn(`Semantic relevance calculation failed for ${this.domain}:`, error);
    }
    
    // Fallback to improved keyword matching
    return this.calculateKeywordRelevance(query, expertiseData);
  }

  private async calculateSemanticRelevance(query: string, expertiseData: any): Promise<number> {
    const relevancePrompt = `
    Analyze how relevant this query is to the given domain expertise on a scale of 0.0 to 1.0.

    Query: "${query}"
    
    Domain: ${expertiseData.domain}
    Expertise Areas: ${expertiseData.expertise.join(', ')}
    Specializations: ${expertiseData.specializations.join(', ')}
    Description: ${expertiseData.description}

    Consider:
    - Direct topic matches (1.0)
    - Related concepts and synonyms (0.6-0.9)
    - Tangentially related topics (0.3-0.6)
    - Unrelated topics (0.0-0.2)

    Respond with only a number between 0.0 and 1.0:`;

    try {
      const response = await this.openAIService.generateResponse(
        "You are a domain expertise analyzer. Respond only with a decimal number between 0.0 and 1.0.",
        relevancePrompt,
        0.1, // Low temperature for consistent scoring
        50   // Short response
      );

      const relevanceScore = parseFloat(response.content.trim());
      
      // Validate the response
      if (!isNaN(relevanceScore) && relevanceScore >= 0 && relevanceScore <= 1) {
        return relevanceScore;
      }
    } catch (error) {
      console.warn(`OpenAI relevance calculation failed:`, error);
    }

    return 0; // Return 0 to trigger fallback
  }

  private calculateKeywordRelevance(query: string, expertiseData: any): number {
    const lowerQuery = query.toLowerCase();
    const allKeywords = [
      ...expertiseData.relevanceKeywords,
      ...expertiseData.expertise.map((e: string) => e.toLowerCase()),
      ...expertiseData.specializations.map((s: string) => s.toLowerCase())
    ];

    // More flexible keyword matching
    let matchScore = 0;
    const totalKeywords = allKeywords.length;
    
    for (const keyword of allKeywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Exact match
      if (lowerQuery.includes(keywordLower)) {
        matchScore += 1;
        continue;
      }
      
      // Partial matches for compound words
      const queryWords = lowerQuery.split(/\s+/);
      const keywordWords = keywordLower.split(/\s+/);
      
      for (const queryWord of queryWords) {
        for (const keywordWord of keywordWords) {
          if (queryWord.length > 3 && keywordWord.includes(queryWord)) {
            matchScore += 0.5;
          } else if (keywordWord.length > 3 && queryWord.includes(keywordWord)) {
            matchScore += 0.5;
          }
        }
      }
    }
    
    const baseRelevance = Math.min((matchScore / totalKeywords) * 2, 0.8);
    const complexityBonus = this.assessQueryComplexity(query) * 0.2;
    
    return Math.min(baseRelevance + complexityBonus, 1);
  }

  private assessQueryComplexity(query: string): number {
    const complexTerms = ['how', 'why', 'explain', 'analyze', 'compare', 'evaluate'];
    const matches = complexTerms.filter(term => 
      query.toLowerCase().includes(term)
    );
    return matches.length / complexTerms.length;
  }

  async generateDynamicSources(response: string): Promise<string[]> {
    /**
     * Generate and validate dynamic sources based on response content only
     * Uses LLM to suggest relevant, working URLs that support the response
     */
    try {
      // Use dynamic source generator to get validated sources from response content
      const validatedSources = await dynamicSourceGenerator.generateDynamicSources(
        response,
        this.domain.toLowerCase().replace(' ', '-'),
        6
      );
      
      // Format sources for display
      const formattedSources = validatedSources.map(source => 
        `${source.title} - ${source.url}`
      );
      
      console.log(`Generated ${formattedSources.length} validated sources for ${this.name}`);
      return formattedSources;
      
    } catch (error) {
      console.error(`Dynamic source generation failed for ${this.name}:`, error);
      return [];
    }
  }

  protected generateSources(domain: string): string[] {
    const domainSources = {
      'psychology': [
        'American Psychological Association (APA)',
        'Journal of Experimental Psychology',
        'Psychological Science',
        'Clinical Psychology Review'
      ],
      'economy': [
        'International Monetary Fund (IMF)',
        'World Bank Economic Research',
        'Journal of Economic Perspectives',
        'American Economic Review'
      ],
      'finance': [
        'Journal of Finance',
        'Financial Analysts Journal',
        'CFA Institute Research',
        'Federal Reserve Economic Data'
      ],
      'architecture': [
        'Architectural Review',
        'Journal of Architecture',
        'Green Building Council',
        'Urban Design International'
      ],
      'engineering': [
        'IEEE Xplore Digital Library',
        'ASME Journals',
        'Engineering Science and Technology',
        'Nature Engineering'
      ],
      'design': [
        'Design Studies Journal',
        'International Journal of Design',
        'ACM Digital Library - HCI',
        'UX Research Methods'
      ],
      'life-sciences': [
        'Nature Medicine',
        'Science Translational Medicine',
        'Cell Biology International',
        'Journal of Biomedical Science'
      ],
      'mathematics': [
        'Journal of Mathematical Analysis',
        'Mathematical Statistics',
        'Applied Mathematics Research',
        'Statistical Science'
      ],
      'physics': [
        'Physical Review Letters',
        'Nature Physics',
        'Journal of Physics',
        'American Physical Society'
      ],
      'philosophy': [
        'Journal of Philosophy',
        'Ethics and Moral Philosophy',
        'Philosophical Studies',
        'Stanford Encyclopedia of Philosophy'
      ]
    };

    return domainSources[domain as keyof typeof domainSources] || [
      'Academic Research Database',
      'Peer-reviewed Publications',
      'Expert Analysis'
    ];
  }
}