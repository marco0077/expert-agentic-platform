import OpenAI from 'openai';

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

export class OpenAIService {
  private client: OpenAI;
  private model: string = 'gpt-4o-mini';

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<LLMResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature,
        max_tokens: maxTokens,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response generated from OpenAI');
      }

      return {
        content: response,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: this.model
      };

    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key configuration.');
      } else if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI quota exceeded. Please check your billing.');
      }
      
      throw new Error(`OpenAI service error: ${error.message || 'Unknown error'}`);
    }
  }

  async generateStreamResponse(
    systemPrompt: string,
    userMessage: string,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<AsyncIterable<string>> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true
      });

      return this.processStream(stream);

    } catch (error: any) {
      console.error('OpenAI Streaming Error:', error);
      throw new Error(`OpenAI streaming service error: ${error.message || 'Unknown error'}`);
    }
  }

  private async* processStream(stream: any): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  // Method to analyze query complexity and suggest appropriate agents
  async analyzeQuery(query: string): Promise<{
    complexity: number;
    suggestedAgents: string[];
    reasoning: string;
  }> {
    const analysisPrompt = `
    You are an intelligent query analyzer for an expert agentic platform. Your task is to analyze user queries and determine:
    1. The complexity level (0.0 to 1.0)
    2. Which expert agents would be most relevant
    3. Your reasoning for the selections

    Available Expert Agents:
    - psychology: Human behavior, cognitive processes, mental health
    - economy: Economic systems, market analysis, policy evaluation
    - finance: Investment strategies, risk management, financial planning
    - architecture: Building design, urban planning, sustainable construction
    - engineering: Technical solutions, system design, innovation
    - design: User experience, visual design, creative solutions
    - life-sciences: Biology, medicine, genetics, biotechnology
    - mathematics: Mathematical analysis, statistics, computational methods
    - physics: Physical phenomena, quantum mechanics, theoretical physics
    - philosophy: Ethics, logic, metaphysics, philosophical reasoning

    Analyze this query and respond in JSON format:
    {
      "complexity": <0.0-1.0>,
      "suggestedAgents": ["agent1", "agent2", ...],
      "reasoning": "<explanation of your analysis>"
    }

    Query: "${query}"
    `;

    try {
      const response = await this.generateResponse(analysisPrompt, query, 0.3, 500);
      const analysis = JSON.parse(response.content);
      
      return {
        complexity: Math.min(Math.max(analysis.complexity || 0.5, 0), 1),
        suggestedAgents: analysis.suggestedAgents || [],
        reasoning: analysis.reasoning || 'Analysis completed'
      };
    } catch (error) {
      console.error('Query analysis failed:', error);
      // Fallback analysis
      return {
        complexity: 0.5,
        suggestedAgents: ['psychology', 'philosophy'],
        reasoning: 'Fallback analysis due to parsing error'
      };
    }
  }

  setModel(model: string) {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}