/**
 * Dynamic Source Generation and Validation System
 * 
 * Provides real-time source validation and relevance detection
 * for expert agent responses, using LLM to generate relevant sources
 * based on response content and validating URLs.
 */

import axios, { AxiosRequestConfig } from 'axios';
import { OpenAIService } from '../services/OpenAIService';

export interface ValidatedSource {
  title: string;
  url: string;
  relevanceScore: number;
  sourceType: 'general_knowledge';
  domain: string;
  description?: string;
}

export class DynamicSourceGenerator {
  private urlCache: Map<string, boolean> = new Map();
  private openAIService: OpenAIService;
  
  constructor() {
    this.setupAxiosDefaults();
    this.openAIService = new OpenAIService();
  }

  private setupAxiosDefaults(): void {
    axios.defaults.timeout = 5000;
    axios.defaults.headers.common['User-Agent'] = 'Expert-Agent-Source-Validator/1.0';
  }

  async validateUrl(url: string): Promise<boolean> {
    if (this.urlCache.has(url)) {
      return this.urlCache.get(url)!;
    }

    try {
      // Clean and validate URL format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      const urlObj = new URL(url);
      if (!urlObj.hostname) {
        this.urlCache.set(url, false);
        return false;
      }

      const config: AxiosRequestConfig = {
        method: 'HEAD',
        url: url,
        timeout: 5000,
        maxRedirects: 3,
        validateStatus: (status) => status < 400
      };

      const response = await axios(config);
      const isValid = response.status < 400;
      this.urlCache.set(url, isValid);
      console.debug(`URL validation ${url}: ${response.status} -> ${isValid}`);
      return isValid;

    } catch (error) {
      console.debug(`URL validation failed for ${url}:`, error);
      this.urlCache.set(url, false);
      return false;
    }
  }

  extractTopicsFromResponse(response: string, agentDomain: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'this', 'that', 'these', 'those']);

    // Extract potential topic words (2+ chars, not all caps, contains letters)
    const words = response.toLowerCase().match(/\b[a-zA-Z][a-zA-Z0-9-]{1,}\b/g) || [];

    // Filter and score words
    const topicScores: { [word: string]: number } = {};
    for (const word of words) {
      if (!stopWords.has(word) && word.length > 2) {
        topicScores[word] = (topicScores[word] || 0) + 1;
      }
    }

    // Get top topics, prioritizing frequency and length
    const topics = Object.entries(topicScores)
      .sort(([a, scoreA], [b, scoreB]) => {
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.length - a.length;
      })
      .slice(0, 10)
      .map(([topic]) => topic);

    return topics;
  }

  async generateRelevantKnowledgeSources(response: string, agentDomain: string, topics: string[]): Promise<ValidatedSource[]> {
    const sourceGenerationPrompt = `
Analyze this expert response and suggest 6-10 relevant, authoritative sources that would support the specific information, concepts, and claims made in the response.

EXPERT RESPONSE:
"${response}"

DOMAIN: ${agentDomain}
KEY TOPICS: ${topics.slice(0, 5).join(', ')}

Your task:
1. Identify the main claims, concepts, and information presented in the response
2. Suggest authoritative sources that specifically support these points
3. Include sources that would contain the type of information mentioned in the response
4. If the response mentions recent developments, include sources that would have current information
5. If the response cites general principles, include foundational academic sources

For each source, provide:
- Exact title of the organization/journal/database/website
- Working URL (must be a real, accessible URL that exists)
- Specific description of how this source supports claims in the response

Focus on:
- Academic journals and research databases
- Professional organizations and institutions
- Government databases and official resources  
- Reputable news sources and industry publications
- Educational institutions and their resources
- Established encyclopedias and reference works

CRITICAL: Only suggest sources with real URLs that actually exist and are accessible.

Respond in this exact JSON format:
{
  "sources": [
    {
      "title": "Exact source name",
      "url": "https://working-url.com",
      "description": "Specific explanation of how this source supports information in the response"
    }
  ]
}`;

    try {
      const llmResponse = await this.openAIService.generateResponse(
        "You are a research librarian expert at identifying authoritative, relevant sources. Only suggest sources with real, working URLs.",
        sourceGenerationPrompt,
        0.3,
        800
      );

      const suggestedSources = JSON.parse(llmResponse.content.trim());
      const validatedSources: ValidatedSource[] = [];

      for (const sourceData of suggestedSources.sources?.slice(0, 10) || []) {
        const { title, url, description } = sourceData;
        
        if (title && url) {
          const isValid = await this.validateUrl(url);
          if (isValid) {
            const relevance = this.calculateLlmSourceRelevance(description, topics, response);
            
            validatedSources.push({
              title,
              url,
              relevanceScore: relevance,
              sourceType: 'general_knowledge',
              domain: agentDomain,
              description
            });
            
            console.log(`Validated LLM-suggested source: ${title} -> ${url}`);
          } else {
            console.warn(`LLM suggested invalid URL: ${url} for ${title}`);
          }
        }
      }

      return validatedSources;

    } catch (error) {
      console.warn('LLM source generation failed:', error);
      return [];
    }
  }

  private calculateLlmSourceRelevance(description: string, topics: string[], response: string): number {
    let relevance = 0.7; // Base relevance for LLM suggestions

    // Boost relevance if description mentions topics
    const descriptionLower = description.toLowerCase();
    const topicMatches = topics.filter(topic => descriptionLower.includes(topic)).length;
    if (topics.length > 0) {
      relevance += (topicMatches / topics.length) * 0.2;
    }

    // Boost if description relates to response content
    const responseWords = new Set(response.toLowerCase().match(/\b\w+\b/g) || []);
    const descriptionWords = new Set(descriptionLower.match(/\b\w+\b/g) || []);

    if (responseWords.size > 0 && descriptionWords.size > 0) {
      const overlap = [...responseWords].filter(word => descriptionWords.has(word)).length;
      const total = new Set([...responseWords, ...descriptionWords]).size;
      relevance += (overlap / total) * 0.1;
    }

    return Math.min(relevance, 1.0);
  }

  async generateDynamicSources(
    response: string,
    agentDomain: string,
    maxSources: number = 6
  ): Promise<ValidatedSource[]> {
    // Extract topics from response
    const topics = this.extractTopicsFromResponse(response, agentDomain);
    console.debug(`Extracted topics: ${topics.slice(0, 5)}`);

    // Generate all sources using LLM based on response content
    const allSources = await this.generateRelevantKnowledgeSources(response, agentDomain, topics);

    // Sort by relevance and return top sources
    allSources.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const finalSources = allSources.slice(0, maxSources);

    console.log(`Generated ${finalSources.length} validated sources from response content`);
    return finalSources;
  }
}

// Export singleton instance
export const dynamicSourceGenerator = new DynamicSourceGenerator();