from typing import List
from ..base_agent import BaseAgent

class DataScientistAgent(BaseAgent):
    def __init__(self):
        super().__init__("Data Scientist", "Data Science & Machine Learning")
    
    def _get_expertise_keywords(self) -> List[str]:
        return [
            "data", "analysis", "statistics", "model", "algorithm",
            "machine learning", "prediction", "correlation", "regression",
            "classification", "clustering", "pattern", "trend", "distribution",
            "dataset", "feature", "training", "validation", "accuracy"
        ]
    
    def _generate_specialized_response(self, query: str, search_context: str = "") -> str:
        query_lower = query.lower()
        
        # Base response based on query type
        base_response = ""
        
        if any(term in query_lower for term in ["predict", "forecast", "model"]):
            base_response = ("From a data science perspective, predictive modeling requires careful "
                           "feature selection, appropriate algorithm choice, and rigorous validation. "
                           "Consider ensemble methods, cross-validation, and feature engineering to "
                           "improve model performance. Always evaluate models using appropriate metrics "
                           "and test for overfitting.")
        
        elif any(term in query_lower for term in ["pattern", "trend", "analyze"]):
            base_response = ("Data analysis should follow a systematic approach: exploratory data analysis, "
                           "statistical testing, and visualization. Look for patterns in the data distribution, "
                           "identify outliers, and consider both correlation and causation. Use appropriate "
                           "statistical tests and visualizations to communicate findings effectively.")
        
        elif any(term in query_lower for term in ["correlation", "relationship"]):
            base_response = ("When examining relationships in data, distinguish between correlation and "
                           "causation. Use scatter plots, correlation matrices, and statistical tests "
                           "to identify relationships. Consider confounding variables and apply "
                           "appropriate controls in your analysis.")
        
        else:
            base_response = ("From a data science perspective, this problem requires systematic data "
                           "collection, cleaning, analysis, and interpretation. Apply statistical "
                           "rigor, validate assumptions, and use appropriate visualization techniques "
                           "to communicate insights effectively.")
        
        # Enhance with search context if available
        if search_context.strip():
            enhanced_response = f"{base_response}\n\nBased on recent developments:\n{search_context}"
            return enhanced_response
        
        return base_response
    
    def _generate_specialized_insights(self, query: str) -> List[str]:
        return [
            "Data quality is crucial - invest time in cleaning and validation",
            "Always validate model assumptions and check for bias",
            "Feature engineering often has more impact than algorithm selection",
            "Visualize data distributions before applying statistical methods"
        ]
    
    def _generate_specialized_recommendations(self, query: str) -> List[str]:
        return [
            "Start with exploratory data analysis to understand the data structure",
            "Use cross-validation to get reliable performance estimates",
            "Document your methodology for reproducibility",
            "Consider the business context when interpreting statistical results"
        ]