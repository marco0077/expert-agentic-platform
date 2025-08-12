from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import logging
from utils.mcp_search import mcp_search, SearchResult
from utils.dynamic_sources import dynamic_source_generator, ValidatedSource

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, expertise: str):
        self.name = name
        self.expertise = expertise
        self.confidence = 0.0
        
    def assess_relevance(self, query: str) -> float:
        """Assess how relevant this agent is for the given query"""
        query_lower = query.lower()
        
        # Define keywords for this agent's expertise
        keywords = self._get_expertise_keywords()
        
        # Calculate relevance based on keyword matches
        matches = sum(1 for keyword in keywords if keyword in query_lower)
        relevance = min(matches / len(keywords) * 2, 1.0)  # Cap at 1.0
        
        self.confidence = relevance
        return relevance
    
    async def generate_response(self, query: str, use_search: bool = True) -> Dict[str, Any]:
        """Generate a response to the query from this agent's perspective with dynamic sources"""
        # Check if we should enhance response with search data using LLM decision
        search_context = ""
        search_results = []
        
        if use_search:
            search_decision = await mcp_search.should_search(query, self.expertise, self.name)
            if search_decision.should_search:
                search_results = await self._perform_contextual_search(query)
                if search_results:
                    search_context = mcp_search.format_search_context(search_results, query, search_decision.search_type)
                    logger.info(f"Enhanced {self.name} response with {len(search_results)} search results ({search_decision.reasoning})")
        
        # Generate the main response
        response_text = self._generate_specialized_response(query, search_context)
        
        # Generate dynamic validated sources based on response content
        sources = await self.generate_dynamic_sources(response_text)
        
        return {
            "content": response_text,
            "sources": sources,
            "search_enhanced": len(search_results) > 0,
            "source_count": len(sources)
        }
    
    def generate_insights(self, query: str) -> List[str]:
        """Generate insights related to the query"""
        return self._generate_specialized_insights(query)
    
    def generate_recommendations(self, query: str) -> List[str]:
        """Generate recommendations based on the query"""
        return self._generate_specialized_recommendations(query)
    
    async def _perform_contextual_search(self, query: str) -> List[SearchResult]:
        """
        Perform MCP search with expertise-specific context
        Only searches when agent deems it necessary for comprehensive response
        """
        # Get expertise-specific keywords
        expertise_keywords = self._get_expertise_keywords()[:3]  # Top 3 keywords
        
        logger.info(f"{self.name} performing contextual search for: {query}")
        return mcp_search.search(query, self.expertise.lower(), expertise_keywords, max_results=5)
    
    async def generate_dynamic_sources(self, response: str) -> List[str]:
        """
        Generate and validate dynamic sources based on response content only
        Uses LLM to suggest relevant, working URLs that support the response
        """
        try:
            # Use dynamic source generator to get validated sources from response content
            validated_sources = await dynamic_source_generator.generate_dynamic_sources(
                response=response,
                agent_domain=self.expertise.lower().replace(' ', '-'),
                max_sources=6
            )
            
            # Format sources for display
            formatted_sources = []
            for source in validated_sources:
                formatted_sources.append(f"{source.title} - {source.url}")
            
            logger.info(f"Generated {len(formatted_sources)} validated sources for {self.name}")
            return formatted_sources
            
        except Exception as e:
            logger.error(f"Dynamic source generation failed for {self.name}: {e}")
            return []
    
    @abstractmethod
    def _get_expertise_keywords(self) -> List[str]:
        """Return keywords associated with this agent's expertise"""
        pass
    
    @abstractmethod 
    def _generate_specialized_response(self, query: str, search_context: str = "") -> str:
        """Generate a specialized response for this agent type"""
        pass
    
    def _generate_specialized_insights(self, query: str) -> List[str]:
        """Generate specialized insights - can be overridden by subclasses"""
        return [
            f"From a {self.expertise.lower()} perspective, this requires careful consideration",
            f"Key factors in {self.expertise.lower()} analysis include multiple variables",
            f"This topic intersects with several areas within {self.expertise.lower()}"
        ]
    
    def _generate_specialized_recommendations(self, query: str) -> List[str]:
        """Generate specialized recommendations - can be overridden by subclasses"""
        return [
            f"Consider consulting {self.expertise.lower()} best practices",
            f"Implement a systematic approach based on {self.expertise.lower()} principles",
            f"Monitor outcomes using {self.expertise.lower()} metrics"
        ]