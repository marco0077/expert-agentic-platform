import { ExpertAgent, ExpertResponse } from '../ExpertAgent';

export class LifeSciencesAgent extends ExpertAgent {
  private readonly keywords = ['biology', 'medical', 'health', 'genetic', 'dna', 'cell', 'organism', 'biotechnology', 'medicine', 'disease'];

  constructor() {
    super('Life Sciences Expert', 'Life Sciences');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    this.confidence = this.calculateRelevance(query, this.keywords);
    return this.confidence;
  }

  async generateResponse(): Promise<ExpertResponse> {
    const response = `From a life sciences perspective, this involves understanding biological processes, molecular mechanisms, and their applications in healthcare and biotechnology. Modern life sciences emphasize evidence-based approaches and interdisciplinary collaboration.`;
    
    return {
      content: response,
      confidence: this.confidence,
      sources: this.generateSources('science')
    };
  }
}