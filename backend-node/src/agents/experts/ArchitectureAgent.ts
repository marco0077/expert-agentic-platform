import { ExpertAgent, ExpertResponse } from '../ExpertAgent';

export class ArchitectureAgent extends ExpertAgent {
  private readonly keywords = [
    'architecture', 'building', 'design', 'construction', 'urban',
    'planning', 'structure', 'space', 'sustainable', 'green',
    'blueprint', 'engineering', 'materials', 'zoning'
  ];

  constructor() {
    super('Architecture Expert', 'Architecture');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    this.confidence = this.calculateRelevance(query, this.keywords);
    return this.confidence;
  }

  async generateResponse(): Promise<ExpertResponse> {
    const response = `From an architectural perspective, this involves considerations of spatial design, structural integrity, environmental sustainability, and human-centered functionality. Modern architecture emphasizes sustainable materials, energy efficiency, and creating spaces that enhance human well-being while respecting environmental constraints.`;
    
    return {
      content: response,
      confidence: this.confidence,
      sources: this.generateSources('technology')
    };
  }
}