#!/usr/bin/env python3
"""
Demonstration of MCP search integration with expert agents
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.specialized.data_scientist import DataScientistAgent
from agents.specialized.researcher import ResearcherAgent  
from agents.specialized.analyst import AnalystAgent

def demo_search_enhancement():
    """Demonstrate how search enhances agent responses"""
    print("=== MCP Search Enhancement Demo ===\n")
    
    # Create agents
    data_scientist = DataScientistAgent()
    researcher = ResearcherAgent()
    analyst = AnalystAgent()
    
    # Demo queries that should trigger search
    demo_queries = [
        {
            "query": "What are the latest trends in machine learning for 2025?",
            "agent": data_scientist,
            "description": "Data Science - Current Trends"
        },
        {
            "query": "Recent research on large language models",
            "agent": researcher,
            "description": "Research - Recent Publications"
        },
        {
            "query": "Current market analysis best practices",
            "agent": analyst,
            "description": "Business Analysis - Industry Standards"
        }
    ]
    
    for i, demo in enumerate(demo_queries, 1):
        print(f"\n--- Demo {i}: {demo['description']} ---")
        print(f"Query: \"{demo['query']}\"")
        print(f"Agent: {demo['agent'].name}")
        
        # Get response without search
        print("\n📝 Base Response (without search):")
        base_response = demo['agent'].generate_response(demo['query'], use_search=False)
        print(base_response)
        
        # Get response with search 
        print("\n🔍 Enhanced Response (with search capability):")
        enhanced_response = demo['agent'].generate_response(demo['query'], use_search=True)
        print(enhanced_response)
        
        print("\n" + "="*60)

def demo_search_decision_logic():
    """Demonstrate the intelligent search decision making"""
    print("\n=== Search Decision Logic Demo ===\n")
    
    agent = DataScientistAgent()
    
    test_cases = [
        ("What are the latest machine learning algorithms in 2025?", "Should search - asks for latest info"),
        ("What is linear regression?", "Should NOT search - basic concept"),
        ("Current state-of-the-art in neural networks", "Should search - cutting-edge info"),
        ("How do you calculate correlation?", "Should NOT search - standard calculation"),
        ("Recent breakthroughs in AI research", "Should search - recent developments"),
        ("Explain supervised learning", "Should NOT search - fundamental concept")
    ]
    
    from utils.mcp_search import mcp_search
    
    for query, expected in test_cases:
        should_search = mcp_search.should_search(query, agent.expertise)
        status = "✓" if should_search else "○"
        print(f"{status} \"{query}\"")
        print(f"   Expected: {expected}")
        print(f"   Decision: {'SEARCH' if should_search else 'NO SEARCH'}")
        print()

if __name__ == "__main__":
    demo_search_decision_logic()
    demo_search_enhancement()
    
    print("\n🎯 Key Benefits:")
    print("• Agents automatically determine when fresh information is needed")
    print("• Search results are intelligently integrated with expert knowledge")  
    print("• Base expertise is always available even when search is unavailable")
    print("• All current and future agents inherit this capability")
    print("\n✨ MCP search integration is now available to all expert agents!")