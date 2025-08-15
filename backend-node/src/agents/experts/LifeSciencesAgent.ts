import { ExpertAgent } from '../ExpertAgent.js';

export class LifeSciencesAgent extends ExpertAgent {
  constructor() {
    super('Life Sciences Expert', 'life-sciences', 'Biomedical Research & Healthcare');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}
