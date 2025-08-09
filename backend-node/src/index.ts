import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { chatRouter } from './routes/chat';
import { userRouter } from './routes/user';
import { agentsRouter } from './routes/agents';
import { OrchestratorAgent } from './agents/OrchestratorAgent';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const orchestrator = new OrchestratorAgent();

app.use('/api/chat', chatRouter);
app.use('/api/users', userRouter);
app.use('/api/agents', agentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat-message', async (data) => {
    try {
      const result = await orchestrator.processQuery(data.message, data.userProfile);
      
      socket.emit('agent-thinking', { 
        agents: result.activeAgents,
        status: 'processing'
      });

      const response = await orchestrator.generateResponse(result);
      
      socket.emit('chat-response', {
        response: response.content,
        agents: response.contributions,
        sources: response.sources
      });
    } catch (error) {
      console.error('Chat processing error:', error);
      socket.emit('chat-error', { 
        message: 'Sorry, I encountered an error processing your request.' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Node.js server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});