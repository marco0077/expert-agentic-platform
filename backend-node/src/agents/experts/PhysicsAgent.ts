import { ExpertAgent } from '../ExpertAgent.js';

export class PhysicsAgent extends ExpertAgent {
  constructor() {
    super('Physics Expert', 'physics', 'Theoretical & Applied Physics');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}
