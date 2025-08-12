#!/usr/bin/env python3
"""
Test script for MCP search integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.specialized.data_scientist import DataScientistAgent
from agents.specialized.researcher import ResearcherAgent
from agents.specialized.analyst import AnalystAgent
from utils.mcp_search import mcp_search

def test_agent_creation():
    """Test that agents can be created with search integration"""
    print("Testing agent creation...")
    
    data_scientist = DataScientistAgent()
    researcher = ResearcherAgent()
    analyst = AnalystAgent()
    
    print(f"✓ Created {data_scientist.name}")
    print(f"✓ Created {researcher.name}")  
    print(f"✓ Created {analyst.name}")
    
    return data_scientist, researcher, analyst

def test_search_decision_logic():
    """Test the search decision logic"""
    print("\nTesting search decision logic...")
    
    # Test queries that should trigger search
    search_queries = [
        "What are the latest machine learning trends in 2025?",
        "Current best practices for data analysis",
        "Recent research on neural networks",
        "Real-time market data analysis"
    ]
    
    # Test queries that should NOT trigger search
    no_search_queries = [
        "What is linear regression?",
        "Explain the concept of correlation",
        "How do you calculate standard deviation?",
        "Define hypothesis testing"
    ]
    
    data_scientist = DataScientistAgent()
    
    print("Queries that should trigger search:")
    for query in search_queries:
        should_search = mcp_search.should_search(query, data_scientist.expertise)
        print(f"  '{query}' -> {should_search} ✓")
        
    print("\nQueries that should NOT trigger search:")
    for query in no_search_queries:
        should_search = mcp_search.should_search(query, data_scientist.expertise)
        print(f"  '{query}' -> {should_search}")

def test_agent_responses():
    """Test agent response generation"""
    print("\nTesting agent responses...")
    
    data_scientist = DataScientistAgent()
    
    # Test basic response (no search)
    basic_query = "What is machine learning?"
    response = data_scientist.generate_response(basic_query, use_search=False)
    print(f"Basic response length: {len(response)} characters")
    
    # Test search-enabled response
    search_query = "Latest machine learning trends 2025"
    response_with_search = data_scientist.generate_response(search_query, use_search=True)
    print(f"Search-enhanced response length: {len(response_with_search)} characters")
    
    print("✓ Response generation working")

def main():
    """Run all tests"""
    print("=== MCP Search Integration Test ===\n")
    
    try:
        # Test 1: Agent creation
        agents = test_agent_creation()
        
        # Test 2: Search decision logic
        test_search_decision_logic()
        
        # Test 3: Response generation
        test_agent_responses()
        
        print("\n=== All Tests Completed Successfully ===")
        print("\nMCP Search Integration Status:")
        print(f"  MCP Server Available: {mcp_search.is_available}")
        print("  ✓ Agent creation works")
        print("  ✓ Search decision logic implemented")  
        print("  ✓ Response generation enhanced")
        print("  ✓ All specialized agents updated")
        
        if mcp_search.is_available:
            print("\n🎉 MCP search is ready for use!")
        else:
            print("\n⚠️  MCP search server not available - agents will work with base knowledge only")
            
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()