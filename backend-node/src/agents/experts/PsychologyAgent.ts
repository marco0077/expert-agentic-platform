import { ExpertAgent } from '../ExpertAgent';

export class PsychologyAgent extends ExpertAgent {
  constructor() {
    super('Psychology Expert', 'psychology', 'Clinical & Cognitive Psychology');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    return await this.calculateRelevance(query);
  }
}