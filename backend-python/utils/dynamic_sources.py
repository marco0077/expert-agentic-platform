"""
Dynamic Source Generation and Validation System

This module provides real-time source validation and relevance detection
for expert agent responses, combining general knowledge sources with
search result URLs that are verified to work.
"""

import asyncio
import aiohttp
import json
import logging
import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

@dataclass
class ValidatedSource:
    """A source that has been validated and deemed relevant"""
    title: str
    url: str
    relevance_score: float
    source_type: str  # 'search_result', 'general_knowledge', 'database'
    domain: str
    description: Optional[str] = None

class DynamicSourceGenerator:
    """Generates and validates sources dynamically based on response content and search results"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.url_cache: Dict[str, bool] = {}  # Cache for URL validation results
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=5),
            headers={'User-Agent': 'Expert-Agent-Source-Validator/1.0'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
            
    async def validate_url(self, url: str) -> bool:
        """Test if a URL is valid and accessible"""
        if url in self.url_cache:
            return self.url_cache[url]
            
        if not self.session:
            return False
            
        try:
            # Clean and validate URL format
            if not url.startswith(('http://', 'https://')):
                url = f'https://{url}'
                
            parsed = urlparse(url)
            if not parsed.netloc:
                self.url_cache[url] = False
                return False
                
            async with self.session.head(url, allow_redirects=True) as response:
                is_valid = response.status < 400
                self.url_cache[url] = is_valid
                logger.debug(f"URL validation {url}: {response.status} -> {is_valid}")
                return is_valid
                
        except Exception as e:
            logger.debug(f"URL validation failed for {url}: {e}")
            self.url_cache[url] = False
            return False
    
    def extract_topics_from_response(self, response: str, agent_domain: str) -> List[str]:
        """Extract key topics and concepts from the response text"""
        # Remove common words and focus on domain-specific terms
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'this', 'that', 'these', 'those'}
        
        # Extract potential topic words (2+ chars, not all caps, contains letters)
        words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9-]{1,}\b', response.lower())
        
        # Filter and score words
        topic_scores = {}
        for word in words:
            if word not in stop_words and len(word) > 2:
                topic_scores[word] = topic_scores.get(word, 0) + 1
        
        # Get top topics, prioritizing frequency and length
        topics = sorted(topic_scores.items(), 
                       key=lambda x: (x[1], len(x[0])), 
                       reverse=True)[:10]
        
        return [topic[0] for topic in topics]
    
    async def generate_relevant_knowledge_sources(self, response: str, agent_domain: str, topics: List[str]) -> List[ValidatedSource]:
        """Use LLM to generate relevant knowledge sources based on response content"""
        from utils.mcp_search import openai_client
        
        if not openai_client:
            logger.warning("OpenAI client not available for source generation")
            return []
        
        source_generation_prompt = f"""
Analyze this expert response and suggest 6-10 relevant, authoritative sources that would support the specific information, concepts, and claims made in the response.

EXPERT RESPONSE:
"{response}"

DOMAIN: {agent_domain}
KEY TOPICS: {', '.join(topics[:5])}

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
{{
  "sources": [
    {{
      "title": "Exact source name",
      "url": "https://working-url.com",
      "description": "Specific explanation of how this source supports information in the response"
    }}
  ]
}}"""

        try:
            response_obj = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a research librarian expert at identifying authoritative, relevant sources. Only suggest sources with real, working URLs."},
                    {"role": "user", "content": source_generation_prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            suggested_sources = json.loads(response_obj.choices[0].message.content.strip())
            
            # Validate the suggested sources
            validated_sources = []
            for source_data in suggested_sources.get("sources", [])[:8]:  # Limit to 8 sources
                title = source_data.get("title", "")
                url = source_data.get("url", "")
                description = source_data.get("description", "")
                
                if title and url:
                    is_valid = await self.validate_url(url)
                    if is_valid:
                        # Calculate relevance based on LLM suggestion and content analysis
                        relevance = self._calculate_llm_source_relevance(description, topics, response)
                        
                        validated_sources.append(ValidatedSource(
                            title=title,
                            url=url,
                            relevance_score=relevance,
                            source_type='general_knowledge',
                            domain=agent_domain,
                            description=description
                        ))
                        logger.info(f"Validated LLM-suggested source: {title} -> {url}")
                    else:
                        logger.warning(f"LLM suggested invalid URL: {url} for {title}")
            
            return validated_sources
            
        except Exception as e:
            logger.warning(f"LLM source generation failed: {e}")
            return []
    
    def _calculate_source_relevance(self, title: str, description: str, domain: str, topics: List[str]) -> float:
        """Calculate how relevant a source is to the domain and topics"""
        relevance = 0.0
        text = f"{title} {description}".lower()
        
        # Domain matching
        domain_terms = domain.split('-')
        domain_matches = sum(1 for term in domain_terms if term in text)
        relevance += (domain_matches / len(domain_terms)) * 0.4
        
        # Topic matching  
        if topics:
            topic_matches = sum(1 for topic in topics if topic in text)
            relevance += (topic_matches / len(topics)) * 0.6
        
        return min(relevance, 1.0)
    
    def _calculate_llm_source_relevance(self, description: str, topics: List[str], response: str) -> float:
        """Calculate relevance for LLM-suggested sources"""
        relevance = 0.7  # Base relevance for LLM suggestions (they're already contextual)
        
        # Boost relevance if description mentions topics
        description_lower = description.lower()
        topic_matches = sum(1 for topic in topics if topic in description_lower)
        if topics:
            relevance += (topic_matches / len(topics)) * 0.2
        
        # Boost if description relates to response content  
        response_words = set(re.findall(r'\b\w+\b', response.lower()))
        description_words = set(re.findall(r'\b\w+\b', description_lower))
        
        if response_words and description_words:
            overlap = len(response_words.intersection(description_words))
            total = len(response_words.union(description_words))
            relevance += (overlap / total) * 0.1 if total > 0 else 0
        
        return min(relevance, 1.0)
    
# Removed search result integration - focusing on LLM-generated sources only
    
    async def generate_dynamic_sources(self, 
                                     response: str, 
                                     agent_domain: str, 
                                     max_sources: int = 6) -> List[ValidatedSource]:
        """
        Generate and validate relevant sources dynamically based on response content only
        Uses LLM to suggest authoritative sources that support the information in the response
        """
        if not self.session:
            async with self:
                return await self._generate_sources_internal(response, agent_domain, max_sources)
        else:
            return await self._generate_sources_internal(response, agent_domain, max_sources)
    
    async def _generate_sources_internal(self, response: str, agent_domain: str, max_sources: int) -> List[ValidatedSource]:
        """Internal method to generate sources with active session"""
        # Extract topics from response
        topics = self.extract_topics_from_response(response, agent_domain)
        logger.debug(f"Extracted topics: {topics[:5]}")  # Log top 5 topics
        
        # Generate all sources using LLM based on response content
        all_sources = await self.generate_relevant_knowledge_sources(response, agent_domain, topics)
        
        # Sort by relevance and return top sources
        all_sources.sort(key=lambda x: x.relevance_score, reverse=True)
        final_sources = all_sources[:max_sources]
        
        logger.info(f"Generated {len(final_sources)} validated sources from response content")
        return final_sources

# Global instance
dynamic_source_generator = DynamicSourceGenerator()