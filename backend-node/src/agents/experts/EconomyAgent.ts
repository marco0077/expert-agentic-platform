import { ExpertAgent } from '../ExpertAgent';

export class EconomyAgent extends ExpertAgent {
  constructor() {
    super('Economics Expert', 'economy', 'Macroeconomic Policy & Market Analysis');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}