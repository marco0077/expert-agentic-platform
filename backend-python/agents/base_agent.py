from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

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
    
    def generate_response(self, query: str) -> str:
        """Generate a response to the query from this agent's perspective"""
        return self._generate_specialized_response(query)
    
    def generate_insights(self, query: str) -> List[str]:
        """Generate insights related to the query"""
        return self._generate_specialized_insights(query)
    
    def generate_recommendations(self, query: str) -> List[str]:
        """Generate recommendations based on the query"""
        return self._generate_specialized_recommendations(query)
    
    @abstractmethod
    def _get_expertise_keywords(self) -> List[str]:
        """Return keywords associated with this agent's expertise"""
        pass
    
    @abstractmethod 
    def _generate_specialized_response(self, query: str) -> str:
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