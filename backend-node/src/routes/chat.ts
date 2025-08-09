import { Router } from 'express';
import { OrchestratorAgent } from '../agents/OrchestratorAgent';

const router = Router();
const orchestrator = new OrchestratorAgent();

router.post('/', async (req, res) => {
  try {
    const { message, userProfile } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const analysis = await orchestrator.processQuery(message, userProfile);
    
    const response = await orchestrator.generateResponse(analysis);

    return res.json({
      response: response.content,
      agents: response.contributions,
      sources: response.sources,
      metadata: {
        queryComplexity: analysis.complexity,
        activeAgentCount: analysis.activeAgents.length,
        relevantDomains: analysis.relevantDomains
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