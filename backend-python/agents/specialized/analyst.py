from typing import List
from ..base_agent import BaseAgent

class AnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__("Business Analyst", "Strategic Analysis & Insights")
    
    def _get_expertise_keywords(self) -> List[str]:
        return [
            "analysis", "strategic", "business", "insights", "trends",
            "optimization", "efficiency", "performance", "metrics", "kpi",
            "dashboard", "reporting", "stakeholder", "requirements",
            "process", "workflow", "improvement", "recommendations"
        ]
    
    def _generate_specialized_response(self, query: str, search_context: str = "") -> str:
        query_lower = query.lower()
        
        # Base response based on query type
        base_response = ""
        
        if any(term in query_lower for term in ["strategic", "business", "optimization"]):
            base_response = ("From a strategic analysis perspective, this requires understanding "
                           "stakeholder needs, current state assessment, and identification of "
                           "improvement opportunities. Consider both quantitative metrics and "
                           "qualitative factors. Develop actionable recommendations with clear "
                           "success criteria and implementation roadmaps.")
        
        elif any(term in query_lower for term in ["performance", "metrics", "kpi"]):
            base_response = ("Performance analysis should focus on key performance indicators (KPIs) "
                           "that align with organizational objectives. Establish baselines, set "
                           "realistic targets, and implement regular monitoring. Consider leading "
                           "and lagging indicators to provide comprehensive performance insights.")
        
        elif any(term in query_lower for term in ["process", "workflow", "improvement"]):
            base_response = ("Process analysis requires mapping current workflows, identifying "
                           "bottlenecks and inefficiencies, and designing improved processes. "
                           "Use process mapping techniques, gather stakeholder feedback, and "
                           "consider both technological and organizational factors in optimization.")
        
        else:
            base_response = ("From a business analysis standpoint, this requires systematic evaluation "
                           "of current state, identification of gaps and opportunities, and "
                           "development of data-driven recommendations. Focus on measurable outcomes "
                           "and stakeholder value creation.")
        
        # Enhance with search context if available
        if search_context.strip():
            enhanced_response = f"{base_response}\n\nCurrent industry insights:\n{search_context}"
            return enhanced_response
        
        return base_response
    
    def _generate_specialized_insights(self, query: str) -> List[str]:
        return [
            "Align analysis with strategic business objectives",
            "Consider both short-term impacts and long-term implications",
            "Stakeholder buy-in is crucial for successful implementation",
            "Use data visualization to communicate complex insights effectively"
        ]
    
    def _generate_specialized_recommendations(self, query: str) -> List[str]:
        return [
            "Define clear success metrics before beginning implementation",
            "Engage stakeholders early in the analysis process",
            "Develop phased implementation plans with regular checkpoints",
            "Create dashboards for ongoing monitoring and adjustment"
        ]