import { ExpertAgent, ExpertResponse } from '../ExpertAgent';

export class PsychologyAgent extends ExpertAgent {
  private readonly keywords = [
    'psychology', 'mental', 'behavior', 'cognitive', 'emotion', 'therapy',
    'mind', 'personality', 'learning', 'memory', 'perception', 'stress',
    'anxiety', 'depression', 'motivation', 'development', 'social'
  ];

  constructor() {
    super('Psychology Expert', 'Psychology');
  }

  async assessRelevance(query: string): Promise<number> {
    this.setCurrentQuery(query);
    this.confidence = this.calculateRelevance(query, this.keywords);
    return this.confidence;
  }

  async generateResponse(): Promise<ExpertResponse> {
    if (!this.currentQuery) {
      throw new Error('No query set for processing');
    }

    const response = await this.analyzeFromPsychologyPerspective();
    
    return {
      content: response,
      confidence: this.confidence,
      sources: this.generateSources('psychology')
    };
  }

  private async analyzeFromPsychologyPerspective(): Promise<string> {
    const query = this.currentQuery.toLowerCase();

    if (query.includes('behavior') || query.includes('habit')) {
      return `From a psychological perspective, human behavior is influenced by multiple factors including cognitive processes, emotional states, social context, and learned patterns. Behavioral change typically requires understanding the underlying motivations and implementing evidence-based strategies such as operant conditioning, cognitive restructuring, or social modeling approaches.`;
    }

    if (query.includes('emotion') || query.includes('feeling')) {
      return `Emotional experiences involve complex interactions between cognitive appraisal, physiological arousal, and behavioral expression. According to contemporary emotion theory, our emotional responses are shaped by how we interpret situations, our past experiences, and our current psychological state. Managing emotions effectively often involves developing emotional intelligence and regulation strategies.`;
    }

    if (query.includes('learning') || query.includes('memory')) {
      return `From a cognitive psychology standpoint, learning and memory are fundamental processes that involve encoding, storing, and retrieving information. Effective learning strategies include spaced repetition, elaborative processing, and connecting new information to existing knowledge structures. Memory performance can be enhanced through techniques like chunking, mnemonics, and creating meaningful associations.`;
    }

    if (query.includes('stress') || query.includes('anxiety')) {
      return `Psychological research shows that stress and anxiety responses are adaptive mechanisms that can become problematic when chronic or excessive. Cognitive-behavioral approaches focus on identifying thought patterns that contribute to distress and developing coping strategies. Mindfulness-based interventions and relaxation techniques have shown efficacy in managing stress-related symptoms.`;
    }

    if (query.includes('social') || query.includes('relationship')) {
      return `Social psychology reveals that human relationships and social interactions are fundamental to well-being. Our behavior in social contexts is influenced by social norms, group dynamics, attribution processes, and interpersonal skills. Building healthy relationships involves effective communication, empathy, boundary-setting, and understanding social cognitive processes.`;
    }

    return `From a psychological perspective, this topic involves understanding human cognition, emotion, and behavior. Psychological principles suggest that individual differences, environmental factors, and learned experiences all play important roles in shaping human responses and decision-making processes.`;
  }
}