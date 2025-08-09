export interface ExpertResponse {
  content: string;
  confidence: number;
  sources?: string[];
}

export abstract class ExpertAgent {
  protected name: string;
  protected expertise: string;
  protected confidence: number = 0;
  protected currentQuery: string = '';

  constructor(name: string, expertise: string) {
    this.name = name;
    this.expertise = expertise;
  }

  abstract assessRelevance(query: string): Promise<number>;
  abstract generateResponse(): Promise<ExpertResponse>;

  getName(): string {
    return this.name;
  }

  getExpertise(): string {
    return this.expertise;
  }

  getConfidence(): number {
    return this.confidence;
  }

  protected setCurrentQuery(query: string): void {
    this.currentQuery = query;
  }

  protected calculateRelevance(query: string, keywords: string[]): number {
    const lowerQuery = query.toLowerCase();
    const matches = keywords.filter(keyword => 
      lowerQuery.includes(keyword.toLowerCase())
    );
    
    const baseRelevance = matches.length / keywords.length;
    
    const complexityBonus = this.assessQueryComplexity(query) * 0.2;
    
    return Math.min(baseRelevance + complexityBonus, 1);
  }

  private assessQueryComplexity(query: string): number {
    const complexTerms = ['how', 'why', 'explain', 'analyze', 'compare', 'evaluate'];
    const matches = complexTerms.filter(term => 
      query.toLowerCase().includes(term)
    );
    return matches.length / complexTerms.length;
  }

  protected generateSources(topic: string): string[] {
    const domains = {
      'psychology': [
        'https://www.apa.org',
        'https://www.ncbi.nlm.nih.gov/pmc',
        'https://psycnet.apa.org'
      ],
      'economics': [
        'https://www.investopedia.com',
        'https://www.imf.org',
        'https://www.worldbank.org'
      ],
      'science': [
        'https://www.nature.com',
        'https://www.science.org',
        'https://www.ncbi.nlm.nih.gov'
      ],
      'technology': [
        'https://arxiv.org',
        'https://ieeexplore.ieee.org',
        'https://dl.acm.org'
      ]
    };

    const relevantDomain = Object.keys(domains).find(domain => 
      this.expertise.toLowerCase().includes(domain)
    );

    return relevantDomain ? domains[relevantDomain as keyof typeof domains] || [] : [];
  }
}