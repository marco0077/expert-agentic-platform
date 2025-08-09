import asyncio
import time
from typing import Dict, List, Optional, Any
from .base_agent import BaseAgent
from .specialized.data_scientist import DataScientistAgent
from .specialized.researcher import ResearcherAgent
from .specialized.analyst import AnalystAgent

class PythonOrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__("Python Orchestrator", "Advanced Analysis Coordination")
        self.specialists = {
            "data_scientist": DataScientistAgent(),
            "researcher": ResearcherAgent(), 
            "analyst": AnalystAgent()
        }
    
    def _get_expertise_keywords(self) -> List[str]:
        return ["analysis", "data", "research", "advanced", "python", "ml", "analytics"]
    
    def _generate_specialized_response(self, query: str) -> str:
        return f"Advanced Python-based analysis coordinated across multiple specialist agents for: {query}"
        
    async def process_advanced_query(
        self, 
        query: str, 
        user_profile: Optional[Dict] = None,
        analysis_type: str = "standard"
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        # Analyze query complexity and requirements
        query_analysis = self._analyze_query_requirements(query, analysis_type)
        
        # Select appropriate specialists
        active_specialists = self._select_specialists(query_analysis)
        
        # Coordinate specialist responses
        specialist_results = await self._coordinate_specialists(
            query, active_specialists, user_profile
        )
        
        # Synthesize final analysis
        synthesis = self._synthesize_analysis(specialist_results, query_analysis)
        
        processing_time = time.time() - start_time
        
        return {
            "analysis": synthesis["primary_analysis"],
            "insights": synthesis["insights"],
            "recommendations": synthesis["recommendations"], 
            "confidence": synthesis["confidence"],
            "processing_time": processing_time,
            "specialists_used": list(active_specialists.keys()),
            "query_complexity": query_analysis["complexity"]
        }
    
    def _analyze_query_requirements(self, query: str, analysis_type: str) -> Dict[str, Any]:
        complexity_indicators = [
            "analyze", "compare", "predict", "model", "correlate",
            "statistical", "trend", "pattern", "optimize", "recommend"
        ]
        
        data_indicators = [
            "data", "dataset", "numbers", "statistics", "metrics",
            "measurement", "quantify", "calculate", "estimate"
        ]
        
        research_indicators = [
            "research", "study", "literature", "evidence", "theory",
            "hypothesis", "methodology", "peer-reviewed", "academic"
        ]
        
        query_lower = query.lower()
        
        complexity_score = sum(1 for indicator in complexity_indicators 
                             if indicator in query_lower) / len(complexity_indicators)
        
        data_relevance = sum(1 for indicator in data_indicators 
                           if indicator in query_lower) / len(data_indicators)
        
        research_relevance = sum(1 for indicator in research_indicators 
                               if indicator in query_lower) / len(research_indicators)
        
        return {
            "complexity": complexity_score,
            "data_focus": data_relevance,
            "research_focus": research_relevance,
            "analysis_type": analysis_type,
            "requires_modeling": any(term in query_lower for term in ["model", "predict", "forecast"]),
            "requires_comparison": any(term in query_lower for term in ["compare", "versus", "difference"]),
            "requires_optimization": any(term in query_lower for term in ["optimize", "improve", "maximize", "minimize"])
        }
    
    def _select_specialists(self, query_analysis: Dict[str, Any]) -> Dict[str, BaseAgent]:
        active_specialists = {}
        
        # Always include analyst for basic analysis
        active_specialists["analyst"] = self.specialists["analyst"]
        
        # Add data scientist if data-focused or requires modeling
        if (query_analysis["data_focus"] > 0.3 or 
            query_analysis["requires_modeling"] or
            query_analysis["complexity"] > 0.5):
            active_specialists["data_scientist"] = self.specialists["data_scientist"]
            
        # Add researcher if research-focused or high complexity
        if (query_analysis["research_focus"] > 0.2 or 
            query_analysis["complexity"] > 0.6):
            active_specialists["researcher"] = self.specialists["researcher"]
            
        return active_specialists
    
    async def _coordinate_specialists(
        self, 
        query: str, 
        specialists: Dict[str, BaseAgent],
        user_profile: Optional[Dict]
    ) -> Dict[str, Dict[str, Any]]:
        
        tasks = []
        for name, specialist in specialists.items():
            task = self._get_specialist_analysis(specialist, query, user_profile)
            tasks.append((name, task))
        
        results = {}
        for name, task in tasks:
            try:
                results[name] = await task
            except Exception as e:
                results[name] = {
                    "error": str(e),
                    "analysis": "Analysis unavailable due to processing error",
                    "confidence": 0.0
                }
                
        return results
    
    async def _get_specialist_analysis(
        self, 
        specialist: BaseAgent, 
        query: str, 
        user_profile: Optional[Dict]
    ) -> Dict[str, Any]:
        
        await asyncio.sleep(0.1)  # Simulate processing time
        
        return {
            "analysis": specialist.generate_response(query),
            "confidence": specialist.assess_relevance(query),
            "specialty": specialist.expertise,
            "insights": specialist.generate_insights(query),
            "recommendations": specialist.generate_recommendations(query)
        }
    
    def _synthesize_analysis(
        self, 
        specialist_results: Dict[str, Dict[str, Any]],
        query_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        
        # Combine analyses from all specialists
        primary_analysis = self._combine_primary_analyses(specialist_results)
        
        # Extract and combine insights
        all_insights = []
        for results in specialist_results.values():
            if "insights" in results and results["insights"]:
                all_insights.extend(results["insights"])
        
        # Extract and combine recommendations  
        all_recommendations = []
        for results in specialist_results.values():
            if "recommendations" in results and results["recommendations"]:
                all_recommendations.extend(results["recommendations"])
        
        # Calculate overall confidence
        confidences = [results.get("confidence", 0.0) 
                      for results in specialist_results.values()]
        overall_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        return {
            "primary_analysis": primary_analysis,
            "insights": all_insights[:5],  # Limit to top 5
            "recommendations": all_recommendations[:5],  # Limit to top 5
            "confidence": overall_confidence
        }
    
    def _combine_primary_analyses(self, specialist_results: Dict[str, Dict[str, Any]]) -> str:
        analyses = []
        
        # Prioritize by confidence and specialty relevance
        sorted_results = sorted(
            specialist_results.items(),
            key=lambda x: x[1].get("confidence", 0.0),
            reverse=True
        )
        
        for name, results in sorted_results:
            if results.get("analysis") and not results.get("error"):
                analyses.append(f"{results['analysis']}")
        
        if not analyses:
            return "Unable to provide comprehensive analysis due to processing limitations."
            
        # Combine top analyses
        combined = analyses[0]  # Start with highest confidence
        
        if len(analyses) > 1:
            combined += "\n\nAdditional perspectives:\n"
            for analysis in analyses[1:3]:  # Add up to 2 more
                combined += f"• {analysis}\n"
                
        return combined