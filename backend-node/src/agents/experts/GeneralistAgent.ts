import { ExpertAgent } from '../ExpertAgent.js';

export class GeneralistAgent extends ExpertAgent {
  constructor() {
    super('Generalist Expert', 'generalist', 'Interdisciplinary Knowledge & Critical Analysis');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    
    // The generalist agent always has moderate relevance (0.6) as a fallback
    // This ensures it can handle any query when no specialist agent is suitable
    const baseRelevance = 0.6;
    
    // Try to calculate enhanced relevance using the standard method
    try {
      const calculatedRelevance = await this.calculateRelevance(query);
      // Use the higher of base relevance or calculated relevance
      return Math.max(baseRelevance, calculatedRelevance);
    } catch (error) {
      console.warn('Generalist agent relevance calculation failed, using base relevance:', error);
      return baseRelevance;
    }
  }
}