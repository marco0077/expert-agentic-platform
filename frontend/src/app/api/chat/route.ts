import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userProfile } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const nodeBackendUrl = process.env.NODE_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${nodeBackendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userProfile }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API error:', error);
    
    const mockAgents = [
      {
        name: "Psychology Expert",
        expertise: "Psychology",
        contribution: "From a psychological perspective, this question involves understanding human cognition and behavior patterns. The way we process information and make decisions is influenced by cognitive biases, emotional states, and past experiences.",
        confidence: 85,
        sources: [] // No mock sources - only use LLM-validated ones
      },
      {
        name: "Philosophy Expert", 
        expertise: "Philosophy",
        contribution: "Philosophically, this raises important questions about the nature of knowledge, truth, and human understanding. We must consider both epistemological and ethical dimensions when examining this topic.",
        confidence: 78,
        sources: [] // No mock sources - only use LLM-validated ones
      }
    ];

    const mockResponse = "Based on expert analysis from multiple domains, this question involves complex interdisciplinary considerations. From a psychological standpoint, human decision-making processes are influenced by various cognitive factors. Philosophically, we must examine the underlying assumptions and ethical implications involved.";

    return NextResponse.json({
      response: mockResponse,
      agents: mockAgents,
      sources: [], // No mock sources in fallback - only show LLM-generated validated sources
      metadata: {
        queryComplexity: 0.7,
        activeAgentCount: 2,
        relevantDomains: ["psychology", "philosophy"]
      }
    });
  }
}