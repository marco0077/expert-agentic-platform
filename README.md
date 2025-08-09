# Expert Agentic Platform

A scalable, mobile-responsive AI-powered platform that orchestrates multiple expert agents across various domains to provide comprehensive answers to user questions.

## 🚀 Features

- **Multi-Domain Expertise**: Expert agents spanning Psychology, Economy, Finance, Architecture, Engineering, Design, Life Sciences, Mathematics, Physics, and Philosophy
- **Intelligent Orchestration**: Advanced orchestrator agent that selects and coordinates relevant experts based on query analysis
- **Interactive Chat Interface**: Real-time chat with visualization of expert agent contributions and confidence levels
- **User Personalization**: My Info tab for managing personal preferences and customizing agent responses
- **Agent Management**: Expert Agents tab with tile-based interface for activating/deactivating agents by expertise area
- **Dual Backend Architecture**: Node.js for real-time chat and Python for advanced analytics and ML processing
- **Mobile Responsive**: Optimized for all device types with modern UI components
- **SEO Optimized**: Comprehensive metadata and performance optimization
- **Dockerized Deployment**: Full containerized setup with Docker Compose

## 🏗️ Architecture

```
├── frontend/          # Next.js 15 + TypeScript + Tailwind
├── backend-node/      # Express.js + TypeScript + Socket.io
├── backend-python/    # FastAPI + ML/Analytics capabilities
├── nginx/            # Reverse proxy configuration
└── docker-compose.yml # Full stack orchestration
```

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React Query for server state
- **Real-time**: Socket.io client for chat interactions
- **TypeScript**: Full type safety throughout

### Backend - Node.js
- **Primary Functions**: Chat orchestration, user management, agent coordination
- **Key Features**: 
  - Real-time WebSocket chat via Socket.io
  - Expert agent system with 10+ specialized agents
  - Intelligent query analysis and agent selection
  - RESTful APIs for user profiles and agent configuration

### Backend - Python
- **Primary Functions**: Advanced analytics, machine learning, data processing
- **Key Features**:
  - FastAPI with async processing
  - ML models for classification, regression, clustering
  - Data analytics with pandas and scikit-learn
  - Specialized research and data science agents

## 🚦 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.11+ (for development)

### Quick Start with Docker

1. **Clone and navigate to project:**
```bash
cd "expert agentic platform"
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Node.js API: http://localhost:5000/api/health
- Python API: http://localhost:8000/health
- Full stack via Nginx: http://localhost

### Development Setup

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

#### Node.js Backend Development
```bash
cd backend-node
npm install
npm run dev
```

#### Python Backend Development
```bash
cd backend-python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 📱 Application Tabs

### 1. Chat Tab
- Interactive chat interface with expert agents
- Real-time query processing and agent coordination
- Visual representation of agent contributions with confidence levels
- Source citations and references
- Mobile-optimized conversation flow

### 2. My Info Tab
- **Profile Management**: Name, email, profession, interests
- **Security**: Password change functionality
- **Preferences**: Language, response style, experience level
- Personalization options to optimize agent responses

### 3. Expert Agents Tab
- **Expertise Areas**: Organized in visually appealing tiles/cards
- **Agent Control**: Activate/deactivate specific agents
- **Performance Metrics**: View agent confidence and performance
- **Scalable Design**: Easy addition of new expertise areas
- **Search & Filter**: Find specific agents or specialties

## 🤖 Expert Agent System

### Current Expertise Areas:

1. **Psychology** - Cognitive processes, behavior analysis, mental health
2. **Economy** - Market analysis, economic policy, macroeconomics
3. **Finance** - Investment strategies, financial planning, risk management
4. **Architecture** - Sustainable design, urban planning, construction
5. **Engineering** - System design, technical solutions, optimization
6. **Design** - UX/UI, visual design, user-centered design
7. **Life Sciences** - Biology, genetics, biotechnology, medicine
8. **Mathematics** - Statistical analysis, modeling, computational methods
9. **Physics** - Physical phenomena, quantum mechanics, theoretical physics
10. **Philosophy** - Ethics, logic, metaphysics, moral reasoning

### Agent Selection Process
- Query analysis for domain relevance
- Confidence threshold filtering
- User preference consideration
- Performance-based prioritization

## 🔧 API Endpoints

### Node.js Backend
- `POST /api/chat` - Process chat messages
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/agents/available` - List available agents
- `PUT /api/agents/configuration` - Update agent settings

### Python Backend
- `POST /api/analyze` - Advanced query analysis
- `POST /api/analytics` - Data analytics processing
- `POST /api/ml` - Machine learning tasks
- `GET /api/capabilities` - List ML capabilities

## 🐳 Docker Deployment

The platform includes comprehensive Docker setup:

- **Frontend**: Multi-stage build with Next.js standalone output
- **Backend Services**: Optimized Node.js and Python containers
- **Nginx**: Reverse proxy with load balancing and SSL termination
- **Health Checks**: Automatic service health monitoring
- **Network Isolation**: Secure inter-service communication

## 📊 Performance & SEO

- **Core Web Vitals**: Optimized for Google's performance metrics
- **SEO**: Comprehensive meta tags, Open Graph, structured data
- **Mobile Performance**: Responsive design with touch optimization
- **Caching**: Static asset optimization and API response caching
- **Bundle Optimization**: Tree shaking and code splitting

## 🔒 Security Features

- **Input Validation**: Comprehensive sanitization of user inputs
- **CORS Configuration**: Proper cross-origin resource sharing
- **Security Headers**: XSS protection, content type validation
- **Environment Isolation**: Secure secrets management
- **Container Security**: Non-root user execution in containers

## 🚀 Scalability

- **Horizontal Scaling**: Load balancer ready architecture
- **Microservices**: Independent service scaling
- **Database Ready**: Easy integration with PostgreSQL/MongoDB
- **CDN Integration**: Static asset delivery optimization
- **Monitoring**: Health checks and logging infrastructure

## 🤝 Contributing

This platform is designed for easy extension:

1. **Adding New Agents**: Extend the base agent classes
2. **New Expertise Areas**: Add to the agent management system
3. **UI Components**: Built with reusable Radix UI components
4. **API Extensions**: RESTful and GraphQL ready architecture

## 📝 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For questions and support:
- Check the documentation in each service directory
- Review the API endpoint documentation
- Examine the Docker compose logs for debugging
- Use the health check endpoints for service monitoring

---

**Built with ❤️ using Next.js, Express.js, FastAPI, and Docker**