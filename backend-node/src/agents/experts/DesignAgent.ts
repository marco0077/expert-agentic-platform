import { ExpertAgent, ExpertResponse } from '../ExpertAgent';

export class DesignAgent extends ExpertAgent {
  private readonly keywords = ['design', 'user', 'interface', 'experience', 'visual', 'creative', 'aesthetic', 'usability', 'ux', 'ui'];

  constructor() {
    super('Design Expert', 'Design');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    this.confidence = this.calculateRelevance(query, this.keywords);
    return this.confidence;
  }

  async generateResponse(): Promise<ExpertResponse> {
    const response = `From a design perspective, this involves user-centered design principles, visual hierarchy, accessibility, and creating intuitive experiences. Good design balances form and function while considering user needs, business goals, and technical constraints.`;
    
    return {
      content: response,
      confidence: this.confidence,
      sources: this.generateSources('technology')
    };
  }
}