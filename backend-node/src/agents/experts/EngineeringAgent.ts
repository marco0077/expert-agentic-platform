import { ExpertAgent } from '../ExpertAgent.js';

export class EngineeringAgent extends ExpertAgent {
  constructor() {
    super('Engineering Expert', 'engineering', 'Systems Engineering & Innovation');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}
