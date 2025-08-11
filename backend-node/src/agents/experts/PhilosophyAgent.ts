import { ExpertAgent } from '../ExpertAgent';

export class PhilosophyAgent extends ExpertAgent {
  constructor() {
    super('Philosophy Expert', 'philosophy', 'Ethics & Critical Reasoning');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}