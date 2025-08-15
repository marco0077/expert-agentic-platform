import { Router } from 'express';
import { OrchestratorAgent } from '../agents/OrchestratorAgent.js';

const router = Router();
const orchestrator = new OrchestratorAgent();

const agentConfigurations = new Map<string, string[]>();

router.get('/available', (req, res) => {
  try {
    const availableExperts = orchestrator.getAvailableExperts();
    
    const expertDetails = availableExperts.map(expertId => ({
      id: expertId,
      name: expertId.charAt(0).toUpperCase() + expertId.slice(1),
      active: true
    }));

    return res.json({
      experts: expertDetails,
      total: expertDetails.length
    });

  } catch (error) {
    console.error('Error fetching available agents:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch available agents' 
    });
  }
});

router.get('/configuration/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const activeAgents = agentConfigurations.get(userId) || orchestrator.getAvailableExperts();
    
    return res.json({
      activeAgents,
      userId
    });

  } catch (error) {
    console.error('Error fetching agent configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch agent configuration' 
    });
  }
});

router.get('/configuration', (req, res) => {
  try {
    const userId = 'default';
    const activeAgents = agentConfigurations.get(userId) || orchestrator.getAvailableExperts();
    
    return res.json({
      activeAgents,
      userId
    });

  } catch (error) {
    console.error('Error fetching agent configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch agent configuration' 
    });
  }
});

router.put('/configuration/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const { activeAgents } = req.body;

    if (!Array.isArray(activeAgents)) {
      return res.status(400).json({ 
        error: 'activeAgents must be an array' 
      });
    }

    const availableExperts = orchestrator.getAvailableExperts();
    const validAgents = activeAgents.filter(agent => availableExperts.includes(agent));

    agentConfigurations.set(userId, validAgents);

    return res.json({
      success: true,
      message: 'Agent configuration updated successfully',
      activeAgents: validAgents,
      userId
    });

  } catch (error) {
    console.error('Error updating agent configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to update agent configuration' 
    });
  }
});

router.put('/configuration', (req, res) => {
  try {
    const userId = 'default';
    const { activeAgents } = req.body;

    if (!Array.isArray(activeAgents)) {
      return res.status(400).json({ 
        error: 'activeAgents must be an array' 
      });
    }

    const availableExperts = orchestrator.getAvailableExperts();
    const validAgents = activeAgents.filter(agent => availableExperts.includes(agent));

    agentConfigurations.set(userId, validAgents);

    return res.json({
      success: true,
      message: 'Agent configuration updated successfully',
      activeAgents: validAgents,
      userId
    });

  } catch (error) {
    console.error('Error updating agent configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to update agent configuration' 
    });
  }
});

export { router as agentsRouter };