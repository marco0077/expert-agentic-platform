import { ExpertAgent } from './ExpertAgent';
import { PsychologyAgent } from './experts/PsychologyAgent';
import { EconomyAgent } from './experts/EconomyAgent';
import { FinanceAgent } from './experts/FinanceAgent';
import { ArchitectureAgent } from './experts/ArchitectureAgent';
import { EngineeringAgent } from './experts/EngineeringAgent';
import { DesignAgent } from './experts/DesignAgent';
import { LifeSciencesAgent } from './experts/LifeSciencesAgent';
import { MathematicsAgent } from './experts/MathematicsAgent';
import { PhysicsAgent } from './experts/PhysicsAgent';
import { PhilosophyAgent } from './experts/PhilosophyAgent';
import { OpenAIService } from '../services/OpenAIService';
import { EXPERTISE_DATABASE } from '../data/expertiseDatabase';

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
    
    // Use OpenAI to analyze the query intelligently
    const aiAnalysis = await this.openAIService.analyzeQuery(query);
    
    // Get relevant domains based on expertise database and AI analysis
    const relevantDomains = await this.identifyRelevantDomains(query, aiAnalysis.suggestedAgents);
    const complexity = aiAnalysis.complexity;
    const activeAgents: ExpertAgent[] = [];

    // Evaluate each relevant domain
    console.log(`Processing ${relevantDomains.length} relevant domains:`, relevantDomains);
    
    for (const domain of relevantDomains) {
      const agent = this.experts.get(domain);
      if (agent) {
        const relevance = await agent.assessRelevance(query);
        console.log(`${domain} agent relevance: ${relevance}, threshold: ${this.minConfidenceThreshold}`);
        
        if (relevance >= this.minConfidenceThreshold) {
          // Check if user has this agent activated
          if (!userProfile?.activeAgents || 
              userProfile.activeAgents.includes(domain)) {
            console.log(`Adding ${domain} agent to active agents`);
            activeAgents.push(agent);
          } else {
            console.log(`${domain} agent not activated in user profile`);
          }
        }
      } else {
        console.log(`No agent found for domain: ${domain}`);
      }
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
    const contributions: AgentContribution[] = [];
    const allSources: string[] = [];

    for (const agent of analysis.activeAgents) {
      try {
        const response = await agent.processQuery(this.currentQuery);
        contributions.push({
          name: agent.getName(),
          domain: response.agentDomain || 'unknown',
          expertise: agent.getExpertise(),
          contribution: response.content,
          confidence: Math.round(agent.getConfidence() * 100),
          sources: response.sources,
          tokensUsed: response.tokensUsed
        });
        
        if (response.sources) {
          allSources.push(...response.sources);
        }
      } catch (error) {
        console.error(`Error from ${agent.getName()}:`, error);
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
    const lowerQuery = query.toLowerCase();
    const domains: string[] = [];
    
    // Start with AI-suggested agents if available
    if (suggestedAgents && suggestedAgents.length > 0) {
      domains.push(...suggestedAgents);
    }

    // Use expertise database for comprehensive matching
    for (const [domain, expertise] of Object.entries(EXPERTISE_DATABASE)) {
      if (!domains.includes(domain)) {
        const relevanceKeywords = expertise.relevanceKeywords || [];
        const domainKeywords = expertise.expertise.map(e => e.toLowerCase()) || [];
        const allKeywords = [...relevanceKeywords, ...domainKeywords];
        
        // Check for keyword matches
        const matchCount = allKeywords.filter(keyword => 
          lowerQuery.includes(keyword.toLowerCase())
        ).length;
        
        // Add domain if it has sufficient keyword matches
        if (matchCount > 0) {
          domains.push(domain);
        }
      }
    }

    // Fallback to general-purpose agents if no matches
    if (domains.length === 0) {
      return ['psychology', 'philosophy'];
    }

    // Remove duplicates and limit to most relevant
    return [...new Set(domains)].slice(0, 6);
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
    if (contributions.length === 0) {
      return "I apologize, but I don't have sufficient expertise to answer that question adequately.";
    }

    if (contributions.length === 1) {
      return contributions[0]?.contribution || '';
    }

    const highConfidenceContributions = contributions.filter(c => c.confidence >= 80);
    const mediumConfidenceContributions = contributions.filter(c => c.confidence >= 60 && c.confidence < 80);

    let response = "Based on analysis from multiple expert agents:\n\n";

    if (highConfidenceContributions.length > 0) {
      const primary = highConfidenceContributions[0];
      response += primary?.contribution || '';
      
      if (highConfidenceContributions.length > 1) {
        response += "\n\nAdditional expert perspectives:\n";
        for (let i = 1; i < Math.min(highConfidenceContributions.length, 3); i++) {
          const contrib = highConfidenceContributions[i];
          if (contrib) {
            response += `\n• From ${contrib.expertise}: ${contrib.contribution}`;
          }
        }
      }
    }

    if (mediumConfidenceContributions.length > 0) {
      response += "\n\nSupplementary insights:\n";
      for (const contrib of mediumConfidenceContributions.slice(0, 2)) {
        response += `\n• ${contrib.expertise} perspective: ${contrib.contribution}`;
      }
    }

    return response;
  }

  getAvailableExperts(): string[] {
    return Array.from(this.experts.keys());
  }
}