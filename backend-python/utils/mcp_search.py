"""
MCP Search Integration Utility

This utility provides web search capabilities to all agents via the configured MCP server.
Only use search when agents need:
1. Deep information on areas of expertise for task execution
2. Fresh, up-to-date recent data not available in training
"""

import subprocess
import json
import logging
import openai
import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Initialize OpenAI client for search decisions (optional)
openai_client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = openai.OpenAI(api_key=api_key)
    else:
        logger.warning("OPENAI_API_KEY not set - LLM search decisions will use fallback logic")
except Exception as e:
    logger.warning(f"Failed to initialize OpenAI client: {e} - Using fallback search decisions")

@dataclass
class SearchResult:
    """Structured search result"""
    title: str
    url: str
    snippet: str
    relevance_score: float = 0.0

@dataclass 
class SearchDecision:
    """LLM-based search decision"""
    should_search: bool
    reasoning: str
    confidence: float
    search_type: str  # 'deep_expertise' | 'fresh_data' | 'comprehensive' | 'none'

class MCPSearchClient:
    """Client for interacting with MCP search server"""
    
    def __init__(self):
        self.is_available = self._check_mcp_availability()
        
    def _check_mcp_availability(self) -> bool:
        """Check if MCP search server is available"""
        try:
            # Test MCP server availability
            result = subprocess.run(
                ["mcp-search-server", "--help"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception as e:
            logger.warning(f"MCP search server not available: {e}")
            return False
    
    async def should_search(self, query: str, expertise_area: str, agent_name: str) -> SearchDecision:
        """
        Use LLM to intelligently determine if search is needed
        
        Args:
            query: The user query
            expertise_area: Agent's area of expertise  
            agent_name: Name of the expert agent
            
        Returns:
            SearchDecision: LLM decision with reasoning
        """
        if not self.is_available:
            return SearchDecision(
                should_search=False,
                reasoning="MCP search server not available",
                confidence=1.0,
                search_type="none"
            )
        
        search_decision_prompt = f"""
Analyze whether this expert agent should use web search to enhance their response.

QUERY: "{query}"
AGENT: {agent_name}
EXPERTISE: {expertise_area}

Consider these search scenarios:

1. DEEP_EXPERTISE: Agent needs current research, methodologies, or advanced techniques in their field
2. FRESH_DATA: Query requires recent events, current statistics, or real-time information  
3. COMPREHENSIVE: Complex query needing broad current context beyond training data
4. NONE: Agent's existing knowledge is sufficient

Evaluate:
- Does the query ask for "latest", "recent", "current", or time-specific information?
- Does it require deep technical knowledge that benefits from current research?
- Is it asking about events, trends, or developments after the training cutoff?
- Would current web sources significantly improve the response quality?

Respond in this exact JSON format:
{{
  "should_search": boolean,
  "reasoning": "Brief explanation of decision",
  "confidence": number (0.0-1.0),
  "search_type": "deep_expertise" | "fresh_data" | "comprehensive" | "none"
}}"""

        try:
            if not openai_client:
                raise Exception("OpenAI client not available")
                
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a search decision analyzer. Respond only with valid JSON as specified."},
                    {"role": "user", "content": search_decision_prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            decision_data = json.loads(response.choices[0].message.content.strip())
            decision = SearchDecision(
                should_search=decision_data["should_search"],
                reasoning=decision_data["reasoning"],
                confidence=decision_data["confidence"],
                search_type=decision_data["search_type"]
            )
            
            logger.info(f"Search decision for {agent_name}: {'SEARCH' if decision.should_search else 'NO SEARCH'} ({decision.search_type}, confidence: {decision.confidence})")
            return decision
            
        except Exception as e:
            logger.warning(f"LLM search decision failed, using fallback: {e}")
            return self._fallback_search_decision(query, expertise_area)
    
    def _fallback_search_decision(self, query: str, expertise_area: str) -> SearchDecision:
        """Fallback search decision using keyword heuristics"""
        query_lower = query.lower()
        
        # Basic keyword-based fallback
        fresh_data_triggers = ['latest', 'recent', 'current', '2024', '2025', 'today', 'now']
        deep_expertise_triggers = ['advanced', 'cutting-edge', 'state-of-the-art', 'research']
        
        needs_fresh = any(trigger in query_lower for trigger in fresh_data_triggers)
        needs_deep = any(trigger in query_lower for trigger in deep_expertise_triggers)
        
        if needs_fresh:
            return SearchDecision(
                should_search=True,
                reasoning="Query contains time-sensitive keywords",
                confidence=0.7,
                search_type="fresh_data"
            )
        elif needs_deep:
            return SearchDecision(
                should_search=True,
                reasoning="Query requests advanced expertise", 
                confidence=0.7,
                search_type="deep_expertise"
            )
        else:
            return SearchDecision(
                should_search=False,
                reasoning="Agent knowledge should be sufficient",
                confidence=0.8,
                search_type="none"
            )
    
    def search(self, query: str, domain: str = "", expertise_keywords: List[str] = None, max_results: int = 5) -> List[SearchResult]:
        """
        Perform web search using MCP server
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List[SearchResult]: Search results
        """
        if not self.is_available:
            logger.warning("MCP search not available, returning empty results")
            return []
            
        try:
            # Build enhanced search query
            search_query = query
            if domain:
                search_query += f" {domain.replace('-', ' ')}"
            if expertise_keywords:
                search_query += f" {' '.join(expertise_keywords[:2])}"
            
            logger.info(f"Performing MCP search for: {search_query}")
            
            # TODO: Implement actual MCP search server call
            # For now, return empty results as we're focusing on LLM-generated sources
            results = []
            
            logger.info(f"Returned {len(results)} search results")
            return results
            
        except Exception as e:
            logger.error(f"MCP search failed: {e}")
            return []
    
    def format_search_context(self, results: List[SearchResult], query: str, search_type: str) -> str:
        """
        Format search results into context for agent use
        
        Args:
            results: Search results
            query: Original query
            search_type: Type of search performed
            
        Returns:
            str: Formatted context string
        """
        if not results:
            return ""
        
        context_header = self._get_context_header(search_type)
        context = f"{context_header} '{query}':\n\n"
        
        for i, result in enumerate(results[:3], 1):  # Limit to top 3 results
            context += f"{i}. {result.title}\n"
            context += f"   {result.snippet}\n"
            context += f"   Source: {result.url}\n\n"
            
        return context
    
    def _get_context_header(self, search_type: str) -> str:
        """Get appropriate context header based on search type"""
        headers = {
            'fresh_data': 'Recent developments relevant to',
            'deep_expertise': 'Current research and advanced insights on',
            'comprehensive': 'Comprehensive current information about'
        }
        return headers.get(search_type, 'Additional context for')

# Global instance
mcp_search = MCPSearchClient()