import { ExpertAgent } from './ExpertAgent.js';
import { PsychologyAgent } from './experts/PsychologyAgent.js';
import { EconomyAgent } from './experts/EconomyAgent.js';
import { FinanceAgent } from './experts/FinanceAgent.js';
import { ArchitectureAgent } from './experts/ArchitectureAgent.js';
import { EngineeringAgent } from './experts/EngineeringAgent.js';
import { DesignAgent } from './experts/DesignAgent.js';
import { LifeSciencesAgent } from './experts/LifeSciencesAgent.js';
import { MathematicsAgent } from './experts/MathematicsAgent.js';
import { PhysicsAgent } from './experts/PhysicsAgent.js';
import { PhilosophyAgent } from './experts/PhilosophyAgent.js';
import { OpenAIService } from '../services/OpenAIService.js';
import { EXPERTISE_DATABASE } from '../data/expertiseDatabase.js';
import { mcpSearch, SearchResult } from '../utils/mcpSearch.js';

export interface QueryAnalysis {
  relevantDomains: string[];
  complexity: number;
  requiredExpertise: string[];
  activeAgents: ExpertAgent[];
}

export interface AgentResponse {
  content: string;
  contributions: AgentContribution[];
  sources: string[];
}

export interface AgentContribution {
  name: string;
  domain: string;
  expertise: string;
  contribution: string;
  confidence: number;
  sources?: string[];
  tokensUsed?: number;
}

export interface UserProfile {
  interests?: string[];
  experienceLevel?: string;
  preferredStyle?: string;
  activeAgents?: string[];
}

export class OrchestratorAgent {
  private experts: Map<string, ExpertAgent>;
  private readonly minConfidenceThreshold = 0.2; // Lowered threshold for better coverage
  private openAIService: OpenAIService;
  private currentQuery: string = '';

  constructor() {
    this.experts = new Map<string, ExpertAgent>();
    this.openAIService = new OpenAIService();
    
    // Initialize all expert agents
    this.experts.set('psychology', new PsychologyAgent());
    this.experts.set('economy', new EconomyAgent());
    this.experts.set('finance', new FinanceAgent());
    this.experts.set('architecture', new ArchitectureAgent());
    this.experts.set('engineering', new EngineeringAgent());
    this.experts.set('design', new DesignAgent());
    this.experts.set('life-sciences', new LifeSciencesAgent());
    this.experts.set('mathematics', new MathematicsAgent());
    this.experts.set('physics', new PhysicsAgent());
    this.experts.set('philosophy', new PhilosophyAgent());
  }

  async processQuery(query: string, userProfile?: UserProfile): Promise<QueryAnalysis> {
    // Store the current query for later use in response generation
    this.currentQuery = query;
    
    // Unified assessment: simple query detection + search need + direct answer
    const unifiedAssessment = await this.assessQueryUnified(query);
    if (unifiedAssessment.isSimple) {
      console.log(`[Orchestrator] Simple query detected - Search needed: ${unifiedAssessment.needsSearch}`);
      // Return minimal analysis to trigger direct handling in generateResponse
      return {
        relevantDomains: ['orchestrator-direct'],
        complexity: 0.1,
        requiredExpertise: ['direct-response'],
        activeAgents: []
      };
    }
    
    // Use OpenAI to analyze the query intelligently for complex queries
    console.log(`[Orchestrator] Complex query - analyzing with LLM: "${query}"`);
    const aiAnalysis = await this.openAIService.analyzeQuery(query);
    console.log(`[Orchestrator] LLM Analysis Results:`);
    console.log(`  - Complexity: ${aiAnalysis.complexity}`);
    console.log(`  - Suggested Agents: ${aiAnalysis.suggestedAgents.join(', ')}`);
    console.log(`  - Reasoning: ${aiAnalysis.reasoning}`);
    
    // Get relevant domains based on LLM analysis
    const relevantDomains = await this.identifyRelevantDomains(query, aiAnalysis.suggestedAgents);
    const complexity = aiAnalysis.complexity;
    const activeAgents: ExpertAgent[] = [];

    // Use LLM-selected agents directly (no additional relevance assessment needed)
    console.log(`Processing ${relevantDomains.length} LLM-selected domains:`, relevantDomains);
    
    for (const domain of relevantDomains) {
      const agent = this.experts.get(domain);
      if (agent) {
        // LLM has already determined this agent is relevant - use it directly
        if (!userProfile?.activeAgents || 
            userProfile.activeAgents.includes(domain)) {
          console.log(`Adding LLM-selected ${domain} agent to active agents`);
          // Set the agent's query and confidence based on LLM selection
          agent.setCurrentQuery(query);
          // Use fixed high confidence since LLM selected this agent
          agent.setConfidence(0.8); 
          activeAgents.push(agent);
        } else {
          console.log(`${domain} agent not activated in user profile`);
        }
      } else {
        console.log(`No agent found for domain: ${domain}`);
      }
    }

    // If no agents were selected by LLM, use orchestrator as fallback
    if (activeAgents.length === 0) {
      console.log('No specialist agents selected by LLM - using orchestrator as fallback');
      console.log('Query that triggered orchestrator fallback:', query);
      console.log('LLM suggested agents:', aiAnalysis.suggestedAgents);
      // Return orchestrator-fallback to handle in generateResponse
      return {
        relevantDomains: ['orchestrator-fallback'],
        complexity: aiAnalysis.complexity,
        requiredExpertise: ['general-knowledge'],
        activeAgents: []
      };
    }

    // Sort by confidence and limit to top performers
    activeAgents.sort((a, b) => b.getConfidence() - a.getConfidence());
    const topAgents = activeAgents.slice(0, Math.min(5, activeAgents.length));

    return {
      relevantDomains,
      complexity,
      requiredExpertise: topAgents.map(agent => agent.getExpertise()),
      activeAgents: topAgents
    };
  }

  async generateResponse(analysis: QueryAnalysis): Promise<AgentResponse> {
    // Check if this is a direct simple query response
    if (analysis.relevantDomains.includes('orchestrator-direct')) {
      const directResponse = await this.handleSimpleQueryUnified(this.currentQuery);
      if (directResponse) {
        return {
          content: directResponse,
          contributions: [],
          sources: []
        };
      }
    }

    // Check if this is an orchestrator fallback for complex queries
    if (analysis.relevantDomains.includes('orchestrator-fallback')) {
      const fallbackResponse = await this.handleOrchestratorFallback(this.currentQuery);
      return {
        content: fallbackResponse,
        contributions: [],
        sources: []
      };
    }

    const contributions: AgentContribution[] = [];
    const allSources: string[] = [];

    for (const agent of analysis.activeAgents) {
      try {
        const response = await agent.processQuery(this.currentQuery);
        
        // Only add contribution if the response has actual content
        if (response.content && response.content.trim().length > 0) {
          contributions.push({
            name: agent.getName(),
            domain: response.agentDomain || 'unknown',
            expertise: agent.getExpertise(),
            contribution: response.content,
            confidence: Math.round(agent.getConfidence() * 100),
            sources: response.sources,
            tokensUsed: response.tokensUsed
          });
          
          console.log(`[Orchestrator] Valid contribution received from ${agent.getName()}: ${response.content.length} chars`);
          
          if (response.sources) {
            allSources.push(...response.sources);
          }
        } else {
          console.warn(`[Orchestrator] Empty response from ${agent.getName()} - skipping contribution`);
        }
      } catch (error) {
        console.error(`[Orchestrator] Error from ${agent.getName()}:`, error);
      }
    }

    const synthesizedResponse = await this.synthesizeResponses(contributions);

    return {
      content: synthesizedResponse,
      contributions,
      sources: [...new Set(allSources)]
    };
  }

  private async identifyRelevantDomains(query: string, suggestedAgents?: string[]): Promise<string[]> {
    // Use LLM-suggested agents as the primary source
    if (suggestedAgents && suggestedAgents.length > 0) {
      console.log(`Using LLM-suggested agents: ${suggestedAgents.join(', ')}`);
      return suggestedAgents;
    }

    // Fallback to generalist if no LLM suggestions (shouldn't happen with improved error handling)
    console.log('No LLM suggestions available, falling back to generalist');
    return ['generalist'];
  }

  private assessComplexity(query: string): number {
    const complexityIndicators = [
      'analyze', 'compare', 'evaluate', 'synthesize', 'complex', 'multiple',
      'relationship', 'interaction', 'comprehensive', 'detailed', 'explain',
      'how', 'why', 'integrate', 'relationship', 'impact', 'implications'
    ];

    const matches = complexityIndicators.filter(indicator => 
      query.toLowerCase().includes(indicator)
    );

    const baseComplexity = Math.min(matches.length / complexityIndicators.length, 0.8);
    const lengthBonus = Math.min(query.length / 200, 0.2); // Longer queries tend to be more complex
    
    return Math.min(baseComplexity + lengthBonus, 1);
  }

  private async synthesizeResponses(contributions: AgentContribution[]): Promise<string> {
    // Filter out empty or invalid contributions
    const validContributions = contributions.filter(c => 
      c && c.contribution && c.contribution.trim().length > 0
    );
    
    console.log(`[Orchestrator] Synthesis: ${contributions.length} total contributions, ${validContributions.length} valid contributions`);
    
    if (validContributions.length === 0) {
      console.log(`[Orchestrator] No valid contributions found - all expert responses were empty`);
      return "I apologize, but I don't have sufficient expertise to answer that question adequately.";
    }

    if (validContributions.length === 1) {
      const firstContribution = validContributions[0];
      if (!firstContribution) {
        console.log(`[Orchestrator] Single contribution is null/undefined`);
        return "I apologize, but I don't have sufficient expertise to answer that question adequately.";
      }
      // For single agent responses, return directly without expensive LLM synthesis
      console.log(`[Orchestrator] Single valid contribution from ${firstContribution.name} - skipping synthesis for performance`);
      return firstContribution.contribution;
    }

    // Use valid contributions for confidence filtering
    console.log(`[Orchestrator] Confidence debugging - valid contributions:`, validContributions.map(c => ({name: c.name, confidence: c.confidence, length: c.contribution.length})));
    
    const highConfidenceContributions = validContributions.filter(c => c.confidence >= 80);
    const mediumConfidenceContributions = validContributions.filter(c => c.confidence >= 60 && c.confidence < 80);
    const allValidContributions = [...highConfidenceContributions, ...mediumConfidenceContributions];

    console.log(`[Orchestrator] Confidence filtering results: ${highConfidenceContributions.length} high, ${mediumConfidenceContributions.length} medium, ${allValidContributions.length} total`);

    const primaryContribution = highConfidenceContributions[0] || allValidContributions[0];
    if (!primaryContribution) {
      console.log(`[Orchestrator] No primary contribution found after filtering`);
      return "I apologize, but I don't have sufficient expertise to answer that question adequately.";
    }

    console.log(`[Orchestrator] Primary contribution from ${primaryContribution.name}, processing ${allValidContributions.length} total valid contributions for synthesis`);
    return this.createStructuredResponse(primaryContribution, allValidContributions);
  }

  private async createStructuredResponse(primaryContribution: AgentContribution, allContributions: AgentContribution[]): Promise<string> {
    // Fast path for simple queries - detect basic questions
    const isSimpleQuery = this.isSimpleQuery(this.currentQuery);
    if (isSimpleQuery && allContributions.length <= 2) {
      console.log(`[Orchestrator] Simple query detected - using fast synthesis`);
      return this.createSimpleResponse(primaryContribution, allContributions);
    }
    
    // Collect all available sources
    const allSources = allContributions.flatMap(c => c.sources || []);
    const uniqueSources = [...new Set(allSources)];
    
    // Generate structured response using LLM
    const synthesisPrompt = `
Create a structured, concise response based on expert analysis. Follow this exact format:

**BRIEF SUMMARY:** [One clear sentence summarizing the core answer]

**KEY POINTS:**
• [3-5 essential bullet points that capture the most important information]

**ADDITIONAL DETAILS:**
[2-3 concise paragraphs with supporting information - keep focused and avoid repetition]

PRIMARY EXPERT CONTRIBUTION:
Domain: ${primaryContribution.expertise}
Content: ${primaryContribution.contribution}

${allContributions.length > 1 ? `
ADDITIONAL EXPERT PERSPECTIVES:
${allContributions.slice(1, 3).map(c => `${c.expertise}: ${c.contribution.substring(0, 300)}...`).join('\n\n')}
` : ''}

${uniqueSources.length > 0 ? `
AVAILABLE SOURCES TO REFERENCE:
${uniqueSources.slice(0, 6).map((source, i) => `[${i+1}] ${source}`).join('\n')}
` : ''}

Requirements:
- Keep summary to exactly one sentence
- Use 3-5 bullet points for key insights
- Additional details should be 2-3 short paragraphs max
- Be concise but comprehensive
- Focus on practical, actionable information
- Avoid unnecessary repetition between sections
- IMPORTANT: Throughout the summary, bullet points, and additional details, reference which expert provided specific insights by mentioning their domain (e.g., "from an engineering perspective," "according to mathematical analysis," "life sciences research shows"). Do NOT repeat the full contributions - just attribute key points to the relevant experts naturally within the text.
- IMPORTANT: When relevant information relates to available sources, reference them inline using [1], [2], etc. where they naturally support the content. Don't force source references - only use them where they genuinely add value to specific claims or information.

Generate the structured response:`;

    try {
      const response = await this.openAIService.generateResponse(
        "You are an expert content synthesizer. Create structured, concise responses that prioritize clarity and actionability while properly attributing insights to expert domains.",
        synthesisPrompt,
        0.3, // Low temperature for consistency
        5000  // Increased token limit for gpt-5-mini
      );

      return response.content;
    } catch (error) {
      console.error('Structured response generation failed:', error);
      // Fallback to original contribution
      return primaryContribution.contribution;
    }
  }

  private isSimpleQuery(query: string): boolean {
    const simplePatterns = [
      /^what\s+is\s+\d+[\+\-\*\/]\d+/i,  // "what is 2+2"
      /^\d+[\+\-\*\/]\d+/,                // "2+2"
      /^(what|who|when|where|how)\s+.{1,30}\?*$/i, // Short wh-questions
      /^(define|explain)\s+\w+$/i,        // "define X"
      /^(yes|no)\s+.{1,20}\?*$/i         // Short yes/no questions
    ];
    
    return query.length < 50 && simplePatterns.some(pattern => pattern.test(query.trim()));
  }

  private createSimpleResponse(primaryContribution: AgentContribution, allContributions: AgentContribution[]): string {
    // Create a simple formatted response without LLM synthesis
    let response = primaryContribution.contribution;
    
    // Add any additional perspectives if available
    if (allContributions.length > 1) {
      const additionalPerspectives = allContributions
        .slice(1, 2) // Limit to 1 additional perspective for simplicity
        .map(c => `\n\n**${c.expertise}**: ${c.contribution.substring(0, 200)}...`)
        .join('');
      response += additionalPerspectives;
    }
    
    return response;
  }

  private async assessQueryUnified(query: string): Promise<{
    isSimple: boolean;
    needsSearch: boolean;
    directAnswer?: string;
  }> {
    const unifiedPrompt = `Analyze this query and answer two questions:

Query: "${query}"

Questions:
1. Is this a simple question that can be answered directly without expert analysis? (basic facts, definitions, simple calculations, current info lookups)
2. Does answering this query require current/recent data from web search? (sports standings, prices, news, weather, etc.)

If both answers are "simple=YES" and "search=NO", also provide the direct answer.

Respond in this exact JSON format:
{
  "isSimple": true/false,
  "needsSearch": true/false,
  "directAnswer": "answer here if simple=true and search=false, otherwise omit this field"
}

Examples:
- "2+2" → {"isSimple": true, "needsSearch": false, "directAnswer": "4"}
- "define photosynthesis" → {"isSimple": true, "needsSearch": false, "directAnswer": "Photosynthesis is..."}
- "Yankees standings" → {"isSimple": true, "needsSearch": true}
- "analyze the complex relationship between..." → {"isSimple": false, "needsSearch": false}`;

    try {
      const response = await this.openAIService.generateResponse(
        "You are a query analyzer. Respond only with valid JSON as specified.",
        unifiedPrompt,
        0.1, // Very low temperature for consistent analysis
        10000  // Increased token limit
      );

      const assessment = JSON.parse(response.content.trim());
      
      // Validate the response structure
      if (typeof assessment.isSimple === 'boolean' && 
          typeof assessment.needsSearch === 'boolean') {
        
        console.log(`[Orchestrator] Unified assessment: Simple=${assessment.isSimple}, Search=${assessment.needsSearch}, DirectAnswer=${!!assessment.directAnswer}`);
        return assessment;
      } else {
        throw new Error('Invalid assessment format');
      }

    } catch (error) {
      console.warn('[Orchestrator] Unified assessment failed, using fallback:', error);
      // Fallback to pattern-based detection
      return this.fallbackUnifiedAssessment(query);
    }
  }

  private fallbackUnifiedAssessment(query: string): {
    isSimple: boolean;
    needsSearch: boolean;
    directAnswer?: string;
  } {
    const cleanQuery = query.trim().toLowerCase();
    
    // Simple patterns
    const isSimple = cleanQuery.length < 50 && 
                    cleanQuery.split(/\s+/).length <= 10 &&
                    !/\b(analyze|synthesize|comprehensive|detailed|complex|relationship|interaction|implication|compare|contrast|evaluate)\b/i.test(cleanQuery);
    
    // Search needed patterns
    const needsSearch = /\b(standings?|score|price|stock|weather|news|current|latest|recent|today|now|2024|2025|live|real-time)\b/i.test(cleanQuery);
    
    // Try arithmetic
    let directAnswer: string | undefined;
    if (isSimple && !needsSearch) {
      const arithmeticResult = this.tryArithmetic(query);
      if (arithmeticResult) {
        directAnswer = arithmeticResult;
      }
    }
    
    console.log(`[Orchestrator] Fallback assessment: Simple=${isSimple}, Search=${needsSearch}, DirectAnswer=${!!directAnswer}`);
    return { isSimple, needsSearch, directAnswer };
  }

  private async handleSimpleQueryUnified(query: string): Promise<string | null> {
    const assessment = await this.assessQueryUnified(query);
    
    if (!assessment.isSimple) {
      return null;
    }

    // Path 1: Simple + No search + Has direct answer
    if (!assessment.needsSearch && assessment.directAnswer) {
      console.log(`[Orchestrator] Returning direct answer without search`);
      return assessment.directAnswer;
    }

    // Path 2: Simple + Search needed
    if (assessment.needsSearch) {
      console.log(`[Orchestrator] Simple query needs search - performing web search`);
      try {
        const searchResults = await mcpSearch.search(query, 'general', [], 3);
        let searchContext = '';
        if (searchResults.length > 0) {
          searchContext = mcpSearch.formatSearchContext(searchResults, query, 'fresh_data');
          console.log(`[Orchestrator] Enhanced simple query with ${searchResults.length} search results`);
        }
        return await this.generateDirectResponse(query, searchContext);
      } catch (error) {
        console.warn(`[Orchestrator] Search failed for simple query:`, error);
        return await this.generateDirectResponse(query, '');
      }
    }

    // Path 3: Simple + No search + No direct answer (generate with LLM)
    console.log(`[Orchestrator] Simple query without search - generating direct response`);
    return await this.generateDirectResponse(query, '');
  }

  private isSimpleQueryHybrid(query: string): boolean {
    const cleanQuery = query.trim().toLowerCase();
    
    // Pattern matching - expanded for general factual questions
    const simplePatterns = [
      /^what\s+is\s+\d+[\+\-\*\/]\d+/i,           // "what is 2+2"
      /^\d+[\+\-\*\/]\d+\s*[=?]*$/i,              // "2+2" or "2+2="
      /^(what|who|when|where)\s+.{1,35}\?*$/i,   // Short wh-questions (increased length)
      /^(define|explain)\s+\w+$/i,                // "define X"
      /^(yes|no)\s+.{1,15}\?*$/i,                // Short yes/no questions
      /^(how\s+many|how\s+much)\s+.{1,25}\?*$/i, // Simple counting questions
      /^(what\s+time|what\s+date|what\s+year)/i, // Time/date questions
      
      // General factual patterns
      /^.*(standings?|position|rank|ranking)\s+.{1,30}$/i,             // "standings of X", "position in Y"
      /^.{1,25}\s+(standings?|position|rank|ranking).*$/i,             // "X standings", "team position"
      /^(current|latest|today\'?s)\s+.{1,30}$/i,                       // "current X", "latest Y", "today's Z"
      /^(status|state|condition)\s+(of|for)?\s*.{1,25}$/i,             // "status of X"
      /^(price|cost|value)\s+(of|for)?\s*.{1,25}$/i,                   // "price of X"
      /^(weather|temperature)\s+(in|at|for)?\s*.{1,20}$/i,             // "weather in NYC"
      /^.{1,20}\s+(score|result|stats?|rating|review)$/i,              // "game score", "movie rating"
      /^(who\s+is|what\s+is)\s+.{1,25}$/i,                             // "who is X", "what is Y"
      /^(how\s+old|how\s+tall|how\s+long)\s+.{1,20}$/i                 // "how old is X"
    ];
    
    // Query characteristics analysis
    const characteristics = {
      length: cleanQuery.length < 50, // Increased length threshold
      wordCount: cleanQuery.split(/\s+/).length <= 10, // Increased word count
      hasComplexTerms: !/\b(analyze|synthesize|comprehensive|detailed|complex|relationship|interaction|implication|compare|contrast|evaluate)\b/i.test(cleanQuery),
      isArithmetic: /^\d+[\+\-\*\/\d\s=?]*$/i.test(cleanQuery),
      isDefinition: /^(what\s+is|define|meaning\s+of)\s+\w+$/i.test(cleanQuery),
      isFactualLookup: /^(what|who|when|where|which|how)\s+.{1,35}\?*$/i.test(cleanQuery)
    };
    
    // Hybrid decision
    const patternMatch = simplePatterns.some(pattern => pattern.test(cleanQuery));
    const characteristicMatch = (characteristics.length && characteristics.wordCount && characteristics.hasComplexTerms) ||
                               characteristics.isArithmetic ||
                               characteristics.isDefinition ||
                               characteristics.isFactualLookup;
    
    console.log(`[Orchestrator] Simple query analysis for "${query}":`, {
      patternMatch,
      characteristicMatch,
      characteristics,
      isSimple: patternMatch || characteristicMatch
    });
    
    return patternMatch || characteristicMatch;
  }

  private async assessSearchNeedWithLLM(query: string): Promise<boolean> {
    try {
      // Use the standardized search assessment from mcpSearch
      const searchDecision = await mcpSearch.shouldSearch(query, 'general', 'OrchestratorAgent');
      
      console.log(`[Orchestrator] Reusing mcpSearch assessment: ${searchDecision.shouldSearch ? 'SEARCH NEEDED' : 'NO SEARCH NEEDED'} (${searchDecision.searchType})`);
      return searchDecision.shouldSearch;
      
    } catch (error) {
      console.warn('[Orchestrator] mcpSearch assessment failed, using fallback:', error);
      // Fallback to keyword-based assessment
      return this.assessSearchNeedFallback(query);
    }
  }

  private assessSearchNeedFallback(query: string): boolean {
    const recentDataIndicators = [
      'current', 'recent', 'latest', 'today', 'now', 'this year', '2025', '2024',
      'standings', 'price', 'stock', 'news', 'weather', 'status', 'update'
    ];
    
    const lowerQuery = query.toLowerCase();
    return recentDataIndicators.some(indicator => lowerQuery.includes(indicator));
  }

  private async generateDirectResponse(query: string, searchContext: string): Promise<string> {
    // Handle pure arithmetic first
    const arithmeticResult = this.tryArithmetic(query);
    if (arithmeticResult !== null) {
      return arithmeticResult;
    }
    
    // Truncate search context at 20000 characters to prevent LLM overload
    let truncatedContext = searchContext;
    if (searchContext.length > 20000) {
      truncatedContext = searchContext.substring(0, 20000) + '...';
      console.log(`[Orchestrator] Truncated search context from ${searchContext.length} to ${truncatedContext.length} characters`);
    }
    
    // Calculate token limit based on context size + 10,000
    // Rough estimate: 1 token per 3-4 characters for context + query
    const contextTokens = Math.ceil(truncatedContext.length / 3.5);
    const queryTokens = Math.ceil(query.length / 3.5);
    const maxTokens = contextTokens + queryTokens + 10000; // Context + query + 10k for response
    
    // Use LLM for other simple queries with optimized parameters
    const systemPrompt = truncatedContext 
      ? `You are a helpful assistant that MUST use the provided current data to answer questions. The following information was just retrieved from the web:\n\n${truncatedContext}\n\nIMPORTANT: Extract and use the specific information from above to answer the user's question directly. Do NOT say you cannot access current data - you have current data provided above. Be specific and factual.`
      : 'You are a helpful assistant providing quick, concise answers to simple questions. Be brief and direct.';
    
    try {
      console.log(`[Orchestrator] Generating direct response - Context: ${truncatedContext.length} chars, Tokens: ${maxTokens}`);
      
      const response = await this.openAIService.generateResponse(
        systemPrompt,
        query,
        0.3, // Low temperature for consistency
        maxTokens
      );
      
      if (!response.content || response.content.trim().length === 0) {
        console.warn('[Orchestrator] Empty response from LLM - check token limits or model configuration');
        return "I found relevant information but couldn't format a response. Please try rephrasing your question.";
      }
      
      return response.content;
    } catch (error) {
      console.error('[Orchestrator] Direct response generation failed:', error);
      return "I apologize, but I'm having trouble generating a response right now. Please try again.";
    }
  }

  private tryArithmetic(query: string): string | null {
    // Simple arithmetic evaluation for basic math queries
    const cleanQuery = query.toLowerCase().replace(/what\s+is\s+/i, '').replace(/[=?\s]/g, '');
    const arithmeticPattern = /^\d+[\+\-\*\/]\d+$/;
    
    if (arithmeticPattern.test(cleanQuery)) {
      try {
        // Safe evaluation for simple arithmetic
        const result = Function('"use strict"; return (' + cleanQuery + ')')();
        if (typeof result === 'number' && !isNaN(result)) {
          return `${cleanQuery} = ${result}`;
        }
      } catch (error) {
        console.warn('[Orchestrator] Arithmetic evaluation failed:', error);
      }
    }
    
    return null;
  }

  private async handleOrchestratorFallback(query: string): Promise<string> {
    console.log(`[Orchestrator] Handling fallback for complex query: "${query}"`);
    
    // Assess if search is needed for this complex query
    const needsSearch = await mcpSearch.shouldSearchSimple(query, 'OrchestratorAgent', 'general knowledge and web search');
    
    let searchContext = '';
    if (needsSearch) {
      console.log(`[Orchestrator] Fallback query needs search - performing web search`);
      try {
        const searchResults = await mcpSearch.search(query, 'general', [], 5);
        if (searchResults.length > 0) {
          searchContext = mcpSearch.formatSearchContext(searchResults, query, 'comprehensive');
          console.log(`[Orchestrator] Enhanced fallback with ${searchResults.length} search results`);
        }
      } catch (error) {
        console.warn(`[Orchestrator] Search failed for fallback query:`, error);
      }
    }

    // Generate response using orchestrator's LLM capabilities
    return await this.generateOrchestratorResponse(query, searchContext);
  }

  private async generateOrchestratorResponse(query: string, searchContext: string): Promise<string> {
    // Truncate search context at 20000 characters
    let truncatedContext = searchContext;
    if (searchContext.length > 20000) {
      truncatedContext = searchContext.substring(0, 20000) + '...';
      console.log(`[Orchestrator] Truncated search context from ${searchContext.length} to ${truncatedContext.length} characters`);
    }

    // Calculate token limit based on context size + 10,000
    const contextTokens = Math.ceil(truncatedContext.length / 3.5);
    const queryTokens = Math.ceil(query.length / 3.5);
    const maxTokens = contextTokens + queryTokens + 10000; // Context + query + 10k for response

    const systemPrompt = truncatedContext 
      ? `You are a knowledgeable assistant providing comprehensive answers to complex questions. Use the following current information when relevant:\n\n${truncatedContext}\n\nIMPORTANT: Provide a well-structured, informative response that addresses all aspects of the question. Use the provided data when relevant and cite sources when possible.`
      : 'You are a knowledgeable assistant providing comprehensive answers to complex questions. Draw from your knowledge to provide detailed, helpful responses.';

    try {
      console.log(`[Orchestrator] Generating fallback response - Context: ${truncatedContext.length} chars, Tokens: ${maxTokens}`);
      
      const response = await this.openAIService.generateResponse(
        systemPrompt,
        query,
        0.7, // Higher temperature for more creative responses
        maxTokens
      );
      
      if (!response.content || response.content.trim().length === 0) {
        console.warn('[Orchestrator] Empty response from LLM in fallback mode');
        return "I understand your question, but I'm having difficulty generating a comprehensive response right now. Please try rephrasing your question or being more specific about what you'd like to know.";
      }
      
      return response.content;
    } catch (error) {
      console.error('[Orchestrator] Fallback response generation failed:', error);
      return "I apologize, but I'm having trouble processing your question right now. Please try again or rephrase your query.";
    }
  }

  getAvailableExperts(): string[] {
    return Array.from(this.experts.keys());
  }
}