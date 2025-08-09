import { ExpertAgent, ExpertResponse } from '../ExpertAgent';

export class EconomyAgent extends ExpertAgent {
  private readonly keywords = [
    'economy', 'economic', 'market', 'gdp', 'inflation', 'recession',
    'policy', 'trade', 'supply', 'demand', 'price', 'growth',
    'employment', 'business', 'industry', 'commerce', 'fiscal'
  ];

  constructor() {
    super('Economics Expert', 'Economy');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    this.confidence = this.calculateRelevance(query, this.keywords);
    return this.confidence;
  }

  async generateResponse(): Promise<ExpertResponse> {
    if (!this.currentQuery) {
      throw new Error('No query set for processing');
    }

    const response = await this.analyzeFromEconomicPerspective();
    
    return {
      content: response,
      confidence: this.confidence,
      sources: this.generateSources('economics')
    };
  }

  private async analyzeFromEconomicPerspective(): Promise<string> {
    const query = this.currentQuery.toLowerCase();

    if (query.includes('inflation') || query.includes('price')) {
      return `From an economic standpoint, inflation represents a sustained increase in the general price level of goods and services. It's typically caused by factors such as increased money supply, rising production costs, or excess demand. Central banks often use monetary policy tools like interest rate adjustments to manage inflation expectations and maintain price stability.`;
    }

    if (query.includes('market') || query.includes('supply') || query.includes('demand')) {
      return `Economic theory demonstrates that markets operate through the interaction of supply and demand forces. When demand exceeds supply, prices tend to rise, signaling producers to increase output. Market efficiency depends on factors like perfect information, competition, and the absence of externalities. Government intervention may be warranted when market failures occur.`;
    }

    if (query.includes('growth') || query.includes('gdp')) {
      return `Economic growth, typically measured by GDP growth, represents an increase in a country's production of goods and services. Sustainable growth requires investments in human capital, infrastructure, technology, and institutions. However, economists also consider factors like income distribution, environmental sustainability, and quality of life when evaluating economic progress.`;
    }

    if (query.includes('employment') || query.includes('job')) {
      return `Labor economics shows that employment levels are influenced by both cyclical and structural factors. Cyclical unemployment fluctuates with business cycles, while structural unemployment results from mismatches between worker skills and job requirements. Policy interventions might include fiscal stimulus, job training programs, or labor market reforms.`;
    }

    if (query.includes('trade') || query.includes('global')) {
      return `International trade theory suggests that countries benefit from specializing in goods where they have comparative advantage. Trade can increase overall welfare through efficiency gains, technology transfer, and access to larger markets. However, trade policies must also consider distributional effects and the need for adjustment assistance for affected industries.`;
    }

    return `From an economic perspective, this issue involves analyzing resource allocation, incentive structures, and market mechanisms. Economic principles of efficiency, equity, and sustainability provide frameworks for evaluating policies and understanding behavioral responses to different economic conditions.`;
  }
}