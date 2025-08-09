import { ExpertAgent, ExpertResponse } from '../ExpertAgent';

export class PhilosophyAgent extends ExpertAgent {
  private readonly keywords = ['philosophy', 'ethics', 'moral', 'meaning', 'existence', 'logic', 'metaphysics', 'consciousness', 'reality', 'truth'];

  constructor() {
    super('Philosophy Expert', 'Philosophy');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    this.confidence = this.calculateRelevance(query, this.keywords);
    return this.confidence;
  }

  async generateResponse(): Promise<ExpertResponse> {
    const response = `From a philosophical perspective, this raises questions about fundamental assumptions, ethical implications, and deeper meanings. Philosophy encourages critical thinking about the nature of knowledge, reality, and human values.`;
    
    return {
      content: response,
      confidence: this.confidence,
      sources: this.generateSources('science')
    };
  }
}