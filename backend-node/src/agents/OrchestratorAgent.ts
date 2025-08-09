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
  expertise: string;
  contribution: string;
  confidence: number;
  sources?: string[];
}

export interface UserProfile {
  interests?: string[];
  experienceLevel?: string;
  preferredStyle?: string;
  activeAgents?: string[];
}

export class OrchestratorAgent {
  private experts: Map<string, ExpertAgent>;
  private readonly minConfidenceThreshold = 0.3;

  constructor() {
    this.experts = new Map<string, ExpertAgent>();
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
    const relevantDomains = await this.identifyRelevantDomains(query);
    const complexity = this.assessComplexity(query);
    const activeAgents: ExpertAgent[] = [];

    for (const domain of relevantDomains) {
      const agent = this.experts.get(domain);
      if (agent) {
        const relevance = await agent.assessRelevance(query);
        if (relevance >= this.minConfidenceThreshold) {
          
          if (!userProfile?.activeAgents || 
              userProfile.activeAgents.includes(domain)) {
            activeAgents.push(agent);
          }
        }
      }
    }

    activeAgents.sort((a, b) => b.getConfidence() - a.getConfidence());

    return {
      relevantDomains,
      complexity,
      requiredExpertise: activeAgents.map(agent => agent.getExpertise()),
      activeAgents: activeAgents.slice(0, 5)
    };
  }

  async generateResponse(analysis: QueryAnalysis): Promise<AgentResponse> {
    const contributions: AgentContribution[] = [];
    const allSources: string[] = [];

    for (const agent of analysis.activeAgents) {
      try {
        const response = await agent.generateResponse();
        contributions.push({
          name: agent.getName(),
          expertise: agent.getExpertise(),
          contribution: response.content,
          confidence: Math.round(agent.getConfidence() * 100),
          sources: response.sources
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

  private async identifyRelevantDomains(query: string): Promise<string[]> {
    const lowerQuery = query.toLowerCase();
    const domains: string[] = [];

    const domainKeywords = {
      psychology: ['psychology', 'mental', 'behavior', 'cognitive', 'emotion', 'therapy', 'mind'],
      economy: ['economy', 'economic', 'market', 'gdp', 'inflation', 'recession', 'policy'],
      finance: ['finance', 'investment', 'money', 'portfolio', 'stock', 'trading', 'wealth'],
      architecture: ['architecture', 'building', 'design', 'construction', 'urban', 'planning'],
      engineering: ['engineering', 'technical', 'system', 'software', 'mechanical', 'electrical'],
      design: ['design', 'user', 'interface', 'experience', 'visual', 'creative', 'aesthetic'],
      'life-sciences': ['biology', 'medical', 'health', 'genetic', 'dna', 'cell', 'organism'],
      mathematics: ['math', 'calculation', 'statistics', 'probability', 'algorithm', 'formula'],
      physics: ['physics', 'quantum', 'energy', 'force', 'particle', 'relativity', 'mechanics'],
      philosophy: ['philosophy', 'ethics', 'moral', 'meaning', 'existence', 'logic', 'metaphysics']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        domains.push(domain);
      }
    }

    if (domains.length === 0) {
      return ['psychology', 'philosophy'];
    }

    return domains;
  }

  private assessComplexity(query: string): number {
    const complexityIndicators = [
      'analyze', 'compare', 'evaluate', 'synthesize', 'complex', 'multiple',
      'relationship', 'interaction', 'comprehensive', 'detailed'
    ];

    const matches = complexityIndicators.filter(indicator => 
      query.toLowerCase().includes(indicator)
    );

    return Math.min(matches.length / complexityIndicators.length, 1);
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