import { ExpertAgent, ExpertResponse } from '../ExpertAgent';

export class FinanceAgent extends ExpertAgent {
  private readonly keywords = [
    'finance', 'investment', 'money', 'portfolio', 'stock', 'trading',
    'wealth', 'risk', 'return', 'asset', 'diversification', 'capital',
    'valuation', 'financial', 'budget', 'retirement', 'savings'
  ];

  constructor() {
    super('Finance Expert', 'Finance');
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

    const response = await this.analyzeFromFinancialPerspective();
    
    return {
      content: response,
      confidence: this.confidence,
      sources: this.generateSources('economics')
    };
  }

  private async analyzeFromFinancialPerspective(): Promise<string> {
    const query = this.currentQuery.toLowerCase();

    if (query.includes('investment') || query.includes('portfolio')) {
      return `From a financial perspective, successful investing requires balancing risk and return through diversification and asset allocation. Modern Portfolio Theory suggests that investors can optimize returns for a given level of risk by combining different asset classes. Key principles include long-term thinking, regular rebalancing, and understanding your risk tolerance and investment timeline.`;
    }

    if (query.includes('risk') || query.includes('volatility')) {
      return `Financial risk management involves identifying, measuring, and mitigating various types of risk including market risk, credit risk, liquidity risk, and operational risk. Diversification across asset classes, geographic regions, and time periods can help reduce overall portfolio risk. Risk-adjusted returns are often more meaningful than absolute returns when evaluating investment performance.`;
    }

    if (query.includes('retirement') || query.includes('planning')) {
      return `Retirement planning requires a comprehensive approach considering factors like current age, retirement goals, expected expenses, inflation, and longevity risk. The power of compound interest makes early and consistent saving crucial. Tax-advantaged accounts like 401(k)s and IRAs can significantly enhance long-term wealth accumulation through tax deferral or tax-free growth.`;
    }

    if (query.includes('valuation') || query.includes('price')) {
      return `Asset valuation in finance relies on fundamental analysis techniques such as discounted cash flow models, price-to-earnings ratios, and comparable company analysis. Market prices reflect the collective wisdom of all market participants, though behavioral biases can create temporary mispricings. Understanding intrinsic value helps investors make informed decisions about buying, holding, or selling assets.`;
    }

    if (query.includes('budget') || query.includes('spending')) {
      return `Financial planning emphasizes the importance of budgeting and cash flow management. The 50/30/20 rule suggests allocating 50% of after-tax income to needs, 30% to wants, and 20% to savings and debt repayment. Building an emergency fund covering 3-6 months of expenses provides financial security and flexibility for unexpected events.`;
    }

    return `From a financial standpoint, this topic involves considerations of risk, return, liquidity, and time value of money. Financial decision-making should be based on quantitative analysis, diversification principles, and alignment with individual financial goals and risk tolerance.`;
  }
}