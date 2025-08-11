import { ExpertAgent } from '../ExpertAgent';

export class DesignAgent extends ExpertAgent {
  constructor() {
    super('Design Expert', 'design', 'User Experience & Creative Design');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}
