import { ExpertAgent } from '../ExpertAgent.js';

export class MathematicsAgent extends ExpertAgent {
  constructor() {
    super('Mathematics Expert', 'mathematics', 'Applied Mathematics & Statistical Analysis');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}
