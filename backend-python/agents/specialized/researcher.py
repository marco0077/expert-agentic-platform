from typing import List
from ..base_agent import BaseAgent

class ResearcherAgent(BaseAgent):
    def __init__(self):
        super().__init__("Research Specialist", "Academic Research & Methodology")
    
    def _get_expertise_keywords(self) -> List[str]:
        return [
            "research", "study", "literature", "evidence", "methodology",
            "hypothesis", "theory", "academic", "peer-review", "publication",
            "systematic review", "meta-analysis", "empirical", "qualitative",
            "quantitative", "experimental", "observational", "survey", "case study"
        ]
    
    def _generate_specialized_response(self, query: str, search_context: str = "") -> str:
        query_lower = query.lower()
        
        # Base response based on query type
        base_response = ""
        
        if any(term in query_lower for term in ["research", "study", "evidence"]):
            base_response = ("From a research methodology perspective, this requires a systematic approach "
                           "with clear research questions, appropriate study design, and rigorous data "
                           "collection methods. Consider the hierarchy of evidence, potential biases, "
                           "and ensure adequate sample sizes for statistical power.")
        
        elif any(term in query_lower for term in ["literature", "review", "sources"]):
            base_response = ("A comprehensive literature review should include systematic searching of "
                           "multiple databases, critical appraisal of evidence quality, and synthesis "
                           "of findings. Focus on peer-reviewed sources, consider publication bias, "
                           "and evaluate the strength of evidence using established frameworks.")
        
        elif any(term in query_lower for term in ["methodology", "design", "approach"]):
            base_response = ("Research design should align with your research questions and objectives. "
                           "Consider whether quantitative, qualitative, or mixed methods are most "
                           "appropriate. Ensure proper controls, randomization where applicable, "
                           "and plan for potential confounding variables.")
        
        else:
            base_response = ("From an academic research standpoint, this topic requires systematic "
                           "investigation with proper methodology, critical evaluation of existing "
                           "evidence, and rigorous analysis. Follow established research protocols "
                           "and maintain objectivity throughout the investigation.")
        
        # Enhance with search context if available
        if search_context.strip():
            enhanced_response = f"{base_response}\n\nRecent research indicates:\n{search_context}"
            return enhanced_response
        
        return base_response
    
    def _generate_specialized_insights(self, query: str) -> List[str]:
        return [
            "Systematic reviews provide stronger evidence than individual studies",
            "Consider both statistical and clinical significance in research findings",
            "Publication bias may affect the availability of negative results",
            "Replication studies are crucial for validating research findings"
        ]
    
    def _generate_specialized_recommendations(self, query: str) -> List[str]:
        return [
            "Conduct a comprehensive literature search using multiple databases",
            "Use established research frameworks and methodologies",
            "Consider ethical implications and obtain necessary approvals",
            "Plan for peer review and publication of findings"
        ]