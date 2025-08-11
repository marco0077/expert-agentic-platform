import { ExpertAgent } from '../ExpertAgent';

export class FinanceAgent extends ExpertAgent {
  constructor() {
    super('Finance Expert', 'finance', 'Investment Strategy & Risk Management');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}