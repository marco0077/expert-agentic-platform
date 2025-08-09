import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import json

class AnalyticsAgent:
    def __init__(self):
        self.name = "Analytics Agent"
        self.supported_types = [
            "descriptive", "diagnostic", "comparative", 
            "trend", "distribution", "correlation"
        ]
    
    async def analyze_data(self, data: List[Dict], analysis_type: str = "descriptive") -> Dict[str, Any]:
        try:
            # Convert data to DataFrame for analysis
            df = pd.DataFrame(data)
            
            if df.empty:
                return self._empty_data_response()
            
            # Route to appropriate analysis method
            if analysis_type == "descriptive":
                return self._descriptive_analysis(df)
            elif analysis_type == "diagnostic":
                return self._diagnostic_analysis(df)
            elif analysis_type == "comparative":
                return self._comparative_analysis(df)
            elif analysis_type == "trend":
                return self._trend_analysis(df)
            elif analysis_type == "distribution":
                return self._distribution_analysis(df)
            elif analysis_type == "correlation":
                return self._correlation_analysis(df)
            else:
                return self._descriptive_analysis(df)
                
        except Exception as e:
            return {
                "error": str(e),
                "summary": "Analysis failed due to data processing error",
                "insights": ["Unable to process the provided data"],
                "visualizations": []
            }
    
    def _descriptive_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        results = {
            "summary": f"Descriptive analysis of {len(df)} records with {len(df.columns)} variables",
            "insights": [],
            "visualizations": [],
            "statistics": {}
        }
        
        # Basic statistics
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            stats = df[numeric_cols].describe()
            results["statistics"]["numeric"] = stats.to_dict()
            
            # Generate insights
            for col in numeric_cols:
                mean_val = df[col].mean()
                std_val = df[col].std()
                results["insights"].append(
                    f"{col}: Mean = {mean_val:.2f}, Std Dev = {std_val:.2f}"
                )
        
        # Categorical analysis
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        if len(categorical_cols) > 0:
            for col in categorical_cols:
                value_counts = df[col].value_counts()
                results["statistics"][col] = value_counts.to_dict()
                results["insights"].append(
                    f"{col}: {len(value_counts)} unique values, "
                    f"most common is '{value_counts.index[0]}' ({value_counts.iloc[0]} occurrences)"
                )
        
        # Suggest visualizations
        if len(numeric_cols) > 0:
            results["visualizations"].append({
                "type": "histogram",
                "columns": list(numeric_cols),
                "title": "Distribution of Numeric Variables"
            })
        
        if len(categorical_cols) > 0:
            results["visualizations"].append({
                "type": "bar_chart", 
                "columns": list(categorical_cols),
                "title": "Frequency of Categorical Variables"
            })
        
        return results
    
    def _correlation_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        results = {
            "summary": "Correlation analysis of numeric variables",
            "insights": [],
            "visualizations": [],
            "correlations": {}
        }
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) < 2:
            results["summary"] = "Insufficient numeric variables for correlation analysis"
            results["insights"].append("Need at least 2 numeric variables for correlation analysis")
            return results
        
        # Calculate correlations
        corr_matrix = df[numeric_cols].corr()
        results["correlations"] = corr_matrix.to_dict()
        
        # Find strong correlations
        strong_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                col1 = corr_matrix.columns[i]
                col2 = corr_matrix.columns[j]
                corr_val = corr_matrix.iloc[i, j]
                
                if abs(corr_val) > 0.7:
                    strong_corr.append({
                        "variable1": col1,
                        "variable2": col2,
                        "correlation": corr_val
                    })
        
        # Generate insights
        if strong_corr:
            results["insights"].append(f"Found {len(strong_corr)} strong correlations (|r| > 0.7)")
            for corr in strong_corr[:3]:  # Top 3
                results["insights"].append(
                    f"Strong correlation between {corr['variable1']} and {corr['variable2']}: "
                    f"r = {corr['correlation']:.3f}"
                )
        else:
            results["insights"].append("No strong correlations found (|r| > 0.7)")
        
        # Visualization suggestions
        results["visualizations"].append({
            "type": "correlation_heatmap",
            "data": "correlation_matrix", 
            "title": "Variable Correlation Heatmap"
        })
        
        if strong_corr:
            results["visualizations"].append({
                "type": "scatter_plot",
                "x": strong_corr[0]["variable1"],
                "y": strong_corr[0]["variable2"],
                "title": f"Scatter Plot: {strong_corr[0]['variable1']} vs {strong_corr[0]['variable2']}"
            })
        
        return results
    
    def _trend_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        results = {
            "summary": "Trend analysis over time",
            "insights": [],
            "visualizations": [],
            "trends": {}
        }
        
        # Look for date/time columns
        datetime_cols = []
        for col in df.columns:
            if df[col].dtype == 'datetime64[ns]' or 'date' in col.lower() or 'time' in col.lower():
                datetime_cols.append(col)
        
        if not datetime_cols:
            results["summary"] = "No time-based columns found for trend analysis"
            results["insights"].append("Add date/time columns to enable trend analysis")
            return results
        
        # Use first datetime column found
        time_col = datetime_cols[0]
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) == 0:
            results["insights"].append("No numeric variables found for trend analysis")
            return results
        
        # Sort by time column
        df_sorted = df.sort_values(by=time_col)
        
        # Analyze trends for numeric columns
        for col in numeric_cols:
            if df_sorted[col].notna().sum() > 3:  # Need at least 4 points
                # Simple trend calculation (slope)
                x = np.arange(len(df_sorted))
                y = df_sorted[col].values
                
                # Remove NaN values
                mask = ~np.isnan(y)
                if mask.sum() > 3:
                    slope, intercept = np.polyfit(x[mask], y[mask], 1)
                    results["trends"][col] = {
                        "slope": slope,
                        "direction": "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable"
                    }
                    
                    results["insights"].append(
                        f"{col} shows a {results['trends'][col]['direction']} trend "
                        f"(slope: {slope:.4f})"
                    )
        
        # Visualization suggestions
        if numeric_cols.any():
            results["visualizations"].append({
                "type": "line_chart",
                "x": time_col,
                "y": list(numeric_cols),
                "title": "Trends Over Time"
            })
        
        return results
    
    def _diagnostic_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        # Simplified diagnostic analysis
        return {
            "summary": "Diagnostic analysis identifying data quality issues",
            "insights": [
                f"Dataset contains {df.isnull().sum().sum()} missing values",
                f"Data types: {df.dtypes.value_counts().to_dict()}",
                f"Memory usage: {df.memory_usage(deep=True).sum()} bytes"
            ],
            "visualizations": [
                {"type": "missing_data_heatmap", "title": "Missing Data Pattern"}
            ]
        }
    
    def _comparative_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        # Simplified comparative analysis
        return {
            "summary": "Comparative analysis across groups",
            "insights": ["Group comparison requires categorical grouping variables"],
            "visualizations": [
                {"type": "box_plot", "title": "Distribution Comparison by Group"}
            ]
        }
    
    def _distribution_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        # Simplified distribution analysis
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        return {
            "summary": f"Distribution analysis of {len(numeric_cols)} numeric variables",
            "insights": [f"Analyzing distributions for: {', '.join(numeric_cols)}"],
            "visualizations": [
                {"type": "histogram", "columns": list(numeric_cols), "title": "Variable Distributions"},
                {"type": "box_plot", "columns": list(numeric_cols), "title": "Distribution Summary"}
            ]
        }
    
    def _empty_data_response(self) -> Dict[str, Any]:
        return {
            "summary": "No data provided for analysis",
            "insights": ["Please provide data to analyze"],
            "visualizations": [],
            "error": "Empty dataset"
        }