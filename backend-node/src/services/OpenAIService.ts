import OpenAI from 'openai';
import { EXPERTISE_DATABASE } from '../data/expertiseDatabase.js';

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

export class OpenAIService {
  private client: OpenAI;
  private model: string = 'gpt-5-mini';

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
    const llmStart = Date.now();
    console.log(`[OpenAI] LLM call started - Model: ${this.model}, MaxTokens: ${maxTokens}`);
    
    try {
      // Adjust parameters for gpt-5-mini model constraints
      const modelParams: any = {
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
        max_completion_tokens: maxTokens
      };

      // Only set temperature if not gpt-5-mini (which only supports default value 1)
      if (!this.model.includes('gpt-5')) {
        modelParams.temperature = temperature;
        modelParams.top_p = 1;
        modelParams.frequency_penalty = 0;
        modelParams.presence_penalty = 0;
      }

      const completion = await this.client.chat.completions.create(modelParams);
      const llmEnd = Date.now();
      
      const response = completion.choices[0]?.message?.content;
      if (response === null || response === undefined) {
        throw new Error('No response generated from OpenAI');
      }

      const tokensUsed = completion.usage?.total_tokens || 0;
      const responseTime = llmEnd - llmStart;
      
      // Check for empty responses and log warning
      if (response.trim().length === 0) {
        console.warn(`[OpenAI] WARNING: Empty response received in ${responseTime}ms - Tokens: ${tokensUsed} - This may indicate model configuration issues`);
      } else {
        console.log(`[OpenAI] LLM call completed in ${responseTime}ms - Tokens: ${tokensUsed}, Response length: ${response.length} chars`);
      }

      return {
        content: response,
        tokensUsed,
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
      // Adjust parameters for gpt-5-mini model constraints
      const modelParams: any = {
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
        max_completion_tokens: maxTokens,
        stream: true
      };

      // Only set temperature if not gpt-5-mini (which only supports default value 1)
      if (!this.model.includes('gpt-5')) {
        modelParams.temperature = temperature;
      }

      const stream = await this.client.chat.completions.create(modelParams);

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

  // Method to analyze query complexity and suggest appropriate agents using comprehensive expert descriptions
  async analyzeQuery(query: string): Promise<{
    complexity: number;
    suggestedAgents: string[];
    reasoning: string;
  }> {
    // Build comprehensive expert descriptions from the database
    const expertDescriptions = Object.entries(EXPERTISE_DATABASE).map(([domain, data]) => {
      return `
**${domain.toUpperCase()}** - ${data.title}
Expertise: ${data.expertise.join(', ')}
Specializations: ${data.specializations.join(', ')}
Key Strengths: ${data.keyStrengths.join(', ')}
Description: ${data.description}
`;
    }).join('\n');

    const analysisPrompt = `
You are an intelligent query analyzer for an expert agentic platform. Your task is to analyze user queries and determine:
1. The complexity level (0.0 to 1.0)
2. Which expert agents would be most relevant (select 2-5 most appropriate)
3. Your reasoning for the selections

Available Expert Agents with Comprehensive Descriptions:
${expertDescriptions}

Analysis Guidelines:
- Consider the specific expertise, specializations, and key strengths of each expert
- Select agents whose expertise directly relates to the query requirements
- Prioritize agents with the most relevant specializations
- Consider interdisciplinary needs - some queries may benefit from multiple experts
- Complexity should reflect the sophistication and depth required for the query
- CRITICAL: You MUST populate the "suggestedAgents" array with the exact domain names of the agents you recommend
- Use the exact domain keys: "psychology", "economy", "finance", "architecture", "engineering", "design", "life-sciences", "mathematics", "physics", "philosophy"

Query to analyze: "${query}"

IMPORTANT EXAMPLES:

Example 1 - Physics query:
Query: "Explain quantum entanglement"
{
  "complexity": 0.7,
  "suggestedAgents": ["physics"],
  "reasoning": "This query requires deep understanding of quantum mechanics..."
}

Example 2 - Interdisciplinary query:
Query: "How does stress affect mathematical problem-solving performance?"
{
  "complexity": 0.8,
  "suggestedAgents": ["psychology", "mathematics"],
  "reasoning": "This requires expertise in both cognitive psychology and mathematical cognition..."
}

Example 3 - Complex physics/math query:
Query: "Analyze the mathematical framework of quantum field theory"
{
  "complexity": 0.9,
  "suggestedAgents": ["physics", "mathematics"],
  "reasoning": "Requires deep mathematical expertise in functional analysis and physics expertise in quantum field theory..."
}

Respond in this exact JSON format:
{
  "complexity": <0.0-1.0>,
  "suggestedAgents": ["domain1", "domain2", ...],
  "reasoning": "<detailed explanation of why these specific experts were selected based on their expertise and the query requirements>"
}`;

    try {
      const response = await this.generateResponse(
        "You are an expert domain analyzer. Analyze queries carefully and select the most appropriate experts based on their detailed expertise descriptions. Respond only with valid JSON.",
        analysisPrompt,
        0.1, // Very low temperature for fast, consistent analysis
        10000  // Increased tokens for complex prompts
      );
      
      // Check for empty response before parsing
      if (!response.content || response.content.trim().length === 0) {
        throw new Error('Empty response from LLM');
      }
      
      const analysis = JSON.parse(response.content.trim());
      
      // Validate the response structure
      if (typeof analysis.complexity === 'number' && 
          Array.isArray(analysis.suggestedAgents) &&
          typeof analysis.reasoning === 'string') {
        
        // Ensure suggested agents exist in our database
        const validAgents = analysis.suggestedAgents.filter((agent: string) => 
          EXPERTISE_DATABASE.hasOwnProperty(agent)
        );
        
        return {
          complexity: Math.min(Math.max(analysis.complexity || 0.5, 0), 1),
          suggestedAgents: validAgents.length > 0 ? validAgents : [], // Empty array triggers orchestrator fallback
          reasoning: analysis.reasoning || 'Expert selection based on domain analysis'
        };
      } else {
        throw new Error('Invalid analysis response format');
      }
    } catch (error) {
      console.error('LLM query analysis failed:', error);
      // Return empty agents to trigger orchestrator fallback
      return {
        complexity: 0.5,
        suggestedAgents: [], // Empty array triggers orchestrator fallback
        reasoning: 'Fallback to orchestrator agent due to analysis error'
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