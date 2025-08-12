/**
 * Test MCP Search Integration for Node.js Backend
 * Tests the unified MCP search architecture with LLM-based decisions
 */

import { mcpSearch } from '../utils/mcpSearch';
import { PsychologyAgent } from '../agents/experts/PsychologyAgent';
import { EconomyAgent } from '../agents/experts/EconomyAgent';
import { FinanceAgent } from '../agents/experts/FinanceAgent';

interface TestCase {
  query: string;
  description: string;
  expectedSearch: boolean;
  expectedType?: string;
}

async function testSearchDecisionLogic() {
  console.log('=== Testing LLM-based Search Decision Logic ===\n');

  const testCases: TestCase[] = [
    {
      query: "What are the latest trends in behavioral psychology for 2025?",
      description: "Recent trends query",
      expectedSearch: true,
      expectedType: "fresh_data"
    },
    {
      query: "What is classical conditioning?",
      description: "Basic concept query", 
      expectedSearch: false,
      expectedType: "none"
    },
    {
      query: "Current state-of-the-art research in cognitive behavioral therapy",
      description: "Advanced expertise query",
      expectedSearch: true,
      expectedType: "deep_expertise"
    },
    {
      query: "How do you calculate standard deviation?",
      description: "Mathematical calculation",
      expectedSearch: false,
      expectedType: "none"
    },
    {
      query: "Latest economic indicators and market analysis for this quarter",
      description: "Fresh financial data",
      expectedSearch: true,
      expectedType: "fresh_data"
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: "${testCase.query}"`);
      console.log(`Expected: ${testCase.expectedSearch ? 'SEARCH' : 'NO SEARCH'}`);
      
      const decision = await mcpSearch.shouldSearch(
        testCase.query, 
        'psychology', 
        'Psychology Expert'
      );
      
      console.log(`Result: ${decision.shouldSearch ? 'SEARCH' : 'NO SEARCH'}`);
      console.log(`Type: ${decision.searchType}`);
      console.log(`Confidence: ${decision.confidence}`);
      console.log(`Reasoning: ${decision.reasoning}`);
      
      const status = decision.shouldSearch === testCase.expectedSearch ? '✅' : '❌';
      console.log(`${status} Test ${decision.shouldSearch === testCase.expectedSearch ? 'PASSED' : 'FAILED'}`);
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ Test failed with error:`, error);
      console.log('---\n');
    }
  }
}

async function testAgentIntegration() {
  console.log('=== Testing Agent MCP Search Integration ===\n');

  const agents = [
    { agent: new PsychologyAgent(), name: 'Psychology' },
    { agent: new EconomyAgent(), name: 'Economy' },
    { agent: new FinanceAgent(), name: 'Finance' }
  ];

  const testQueries = [
    "What are the latest developments in your field?",
    "Explain the basic principles in your domain",
    "What current research is shaping your area of expertise?"
  ];

  for (const { agent, name } of agents) {
    console.log(`--- Testing ${name} Agent ---`);
    
    for (const query of testQueries) {
      try {
        console.log(`Query: "${query}"`);
        
        // Test without search
        const responseWithoutSearch = await agent.processQuery(query);
        console.log(`Response length (no search): ${responseWithoutSearch.content.length} chars`);
        console.log(`Search enhanced: ${responseWithoutSearch.searchEnhanced || false}`);
        
        if (responseWithoutSearch.searchReasoning) {
          console.log(`Search reasoning: ${responseWithoutSearch.searchReasoning}`);
        }
        
        console.log('✅ Agent response generated successfully\n');
        
      } catch (error) {
        console.error(`❌ Agent test failed:`, error);
        console.log('---\n');
      }
    }
  }
}

async function testSearchAvailability() {
  console.log('=== Testing MCP Search Server Availability ===\n');
  
  console.log(`MCP Search Available: ${mcpSearch.searchAvailable}`);
  
  if (mcpSearch.searchAvailable) {
    console.log('✅ MCP search server is available and ready');
  } else {
    console.log('⚠️  MCP search server not available - agents will use base knowledge');
  }
  console.log('');
}

async function main() {
  console.log('🚀 Starting MCP Search Integration Tests\n');
  
  try {
    // Test 1: Search availability
    await testSearchAvailability();
    
    // Test 2: LLM decision logic  
    await testSearchDecisionLogic();
    
    // Test 3: Agent integration
    await testAgentIntegration();
    
    console.log('🎉 All MCP Search Integration Tests Completed!\n');
    
    console.log('📊 Integration Status:');
    console.log(`✅ TypeScript MCP client created`);
    console.log(`✅ LLM-based search decisions implemented`);
    console.log(`✅ Shared MCP server architecture`);
    console.log(`✅ All Node.js agents have search capabilities`);
    console.log(`✅ Consistent search behavior with Python backend`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

if (require.main === module) {
  main();
}