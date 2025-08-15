import { ExpertAgent } from '../ExpertAgent.js';

export class DesignAgent extends ExpertAgent {
  constructor() {
    super('Design Expert', 'design', 'User Experience & Creative Design');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}
