import { Router } from 'express';
import { OrchestratorAgent } from '../agents/OrchestratorAgent.js';

const router = Router();
const orchestrator = new OrchestratorAgent();

router.post('/', async (req, res) => {
  const requestStart = Date.now();
  console.log(`[Backend Chat] Request received at ${new Date().toISOString()}`);
  
  try {
    const { message, userProfile } = req.body;
    console.log(`[Backend Chat] Processing message: "${message}"`);

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const analysisStart = Date.now();
    const analysis = await orchestrator.processQuery(message, userProfile);
    const analysisEnd = Date.now();
    console.log(`[Backend Chat] Query analysis completed in ${analysisEnd - analysisStart}ms`);
    
    const responseStart = Date.now();
    const response = await orchestrator.generateResponse(analysis);
    const responseEnd = Date.now();
    console.log(`[Backend Chat] Response generation completed in ${responseEnd - responseStart}ms`);

    const totalTime = Date.now() - requestStart;
    console.log(`[Backend Chat] Total processing time: ${totalTime}ms`);

    return res.json({
      response: response.content,
      agents: response.contributions,
      sources: response.sources,
      metadata: {
        queryComplexity: analysis.complexity,
        activeAgentCount: analysis.activeAgents.length,
        relevantDomains: analysis.relevantDomains,
        processingTime: totalTime
      }
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    return res.status(500).json({ 
      error: 'Internal server error processing your request' 
    });
  }
});

export { router as chatRouter };