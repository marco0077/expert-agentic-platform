import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[Frontend API] Request started at ${new Date().toISOString()}`);
  
  try {
    const parseStart = Date.now();
    const body = await request.json();
    const { message, userProfile } = body;
    console.log(`[Frontend API] Body parsed in ${Date.now() - parseStart}ms`);

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const nodeBackendUrl = process.env.NODE_BACKEND_URL || 'http://localhost:5000';
    console.log(`[Frontend API] Calling backend at ${nodeBackendUrl} for message: "${message}"`);
    
    const backendStart = Date.now();
    const response = await fetch(`${nodeBackendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userProfile }),
      // Increase timeout for complex expert agent processing
      signal: AbortSignal.timeout(300000), // 5 minutes timeout for expert agents
    });
    const backendEnd = Date.now();
    console.log(`[Frontend API] Backend responded in ${backendEnd - backendStart}ms with status ${response.status}`);

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const parseResponseStart = Date.now();
    const data = await response.json();
    console.log(`[Frontend API] Response parsed in ${Date.now() - parseResponseStart}ms`);
    console.log(`[Frontend API] Total request time: ${Date.now() - startTime}ms`);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Check if it's a timeout error
    const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('timeout'));
    
    if (isTimeout) {
      return NextResponse.json({
        response: "⏱️ The query is taking longer than expected to process. Complex queries with expert agents can take up to 5 minutes. Please try again or consider simplifying your question.",
        agents: [],
        sources: [],
        metadata: {
          queryComplexity: 0.8,
          activeAgentCount: 0,
          relevantDomains: ["timeout"],
          error: "timeout"
        }
      });
    }

    // For other errors, return a generic error message
    return NextResponse.json({
      response: "❌ Sorry, there was an error processing your request. Please try again in a moment.",
      agents: [],
      sources: [],
      metadata: {
        queryComplexity: 0.5,
        activeAgentCount: 0,
        relevantDomains: ["error"],
        error: "processing_error"
      }
    });
  }
}