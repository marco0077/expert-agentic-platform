import { ExpertAgent } from '../ExpertAgent.js';

export class ArchitectureAgent extends ExpertAgent {
  constructor() {
    super('Architecture Expert', 'architecture', 'Sustainable Design & Urban Planning');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}
