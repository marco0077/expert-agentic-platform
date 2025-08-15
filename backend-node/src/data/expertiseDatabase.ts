export interface ExpertiseDescription {
  domain: string;
  title: string;
  expertise: string[];
  specializations: string[];
  methodologies: string[];
  applications: string[];
  keyStrengths: string[];
  relevanceKeywords: string[];
  complexity: {
    theoretical: number;
    practical: number;
    interdisciplinary: number;
  };
  description: string;
}

export const EXPERTISE_DATABASE: Record<string, ExpertiseDescription> = {
  psychology: {
    domain: "Psychology",
    title: "Clinical & Cognitive Psychology Expert",
    expertise: [
      "Cognitive Psychology", "Clinical Psychology", "Developmental Psychology",
      "Social Psychology", "Neuropsychology", "Behavioral Psychology",
      "Positive Psychology", "Health Psychology", "Educational Psychology"
    ],
    specializations: [
      "Cognitive Behavioral Therapy (CBT)", "Mindfulness-Based Interventions",
      "Psychological Assessment", "Trauma-Informed Care", "Addiction Psychology",
      "Child & Adolescent Psychology", "Geropsychology", "Forensic Psychology"
    ],
    methodologies: [
      "Experimental Design", "Psychometric Testing", "Qualitative Research",
      "Meta-Analysis", "Longitudinal Studies", "Case Study Analysis",
      "Neuroimaging Interpretation", "Statistical Analysis (SPSS, R)"
    ],
    applications: [
      "Mental Health Treatment", "Educational Assessment", "Organizational Consulting",
      "Research & Academia", "Legal System Support", "Healthcare Integration",
      "Personal Development", "Crisis Intervention"
    ],
    keyStrengths: [
      "Evidence-based practice integration", "Human behavior prediction",
      "Therapeutic intervention design", "Psychological assessment interpretation",
      "Cross-cultural competency", "Ethical decision-making in mental health"
    ],
    relevanceKeywords: [
      "mental health", "behavior", "cognitive", "therapy", "psychology", "emotions",
      "personality", "development", "learning", "memory", "perception", "stress",
      "anxiety", "depression", "trauma", "relationships", "motivation", "habits"
    ],
    complexity: {
      theoretical: 0.9,
      practical: 0.8,
      interdisciplinary: 0.85
    },
    description: "Expert in understanding human behavior, cognition, and mental processes. Specializes in evidence-based therapeutic approaches, psychological assessment, and research methodologies. Capable of analyzing complex behavioral patterns, designing interventions, and providing insights into human motivation, learning, and development across the lifespan."
  },

  economy: {
    domain: "Economics",
    title: "Macroeconomic Policy & Market Analysis Expert", 
    expertise: [
      "Macroeconomics", "Microeconomics", "International Economics",
      "Development Economics", "Environmental Economics", "Behavioral Economics",
      "Financial Economics", "Labor Economics", "Public Economics"
    ],
    specializations: [
      "Monetary Policy Analysis", "Fiscal Policy Evaluation", "Market Structure Analysis",
      "Economic Forecasting", "Trade Policy Assessment", "Economic Development Strategies",
      "Central Banking Operations", "Economic Impact Assessment"
    ],
    methodologies: [
      "Econometric Modeling", "Time Series Analysis", "Panel Data Analysis",
      "Game Theory Applications", "Cost-Benefit Analysis", "Input-Output Analysis",
      "Computable General Equilibrium Models", "Economic Survey Design"
    ],
    applications: [
      "Policy Advisory", "Economic Research", "Market Analysis", "Investment Strategy",
      "Development Planning", "Risk Assessment", "Regulatory Analysis",
      "Economic Education", "Consulting Services"
    ],
    keyStrengths: [
      "Economic trend identification", "Policy impact prediction", 
      "Market mechanism understanding", "Data-driven analysis",
      "Cross-sector economic integration", "Global economic perspective"
    ],
    relevanceKeywords: [
      "economy", "economic", "market", "gdp", "inflation", "recession", "growth",
      "policy", "trade", "supply", "demand", "price", "employment", "business",
      "fiscal", "monetary", "investment", "productivity", "competition"
    ],
    complexity: {
      theoretical: 0.85,
      practical: 0.9,
      interdisciplinary: 0.8
    },
    description: "Expert in economic systems, market dynamics, and policy analysis. Specializes in macroeconomic forecasting, policy evaluation, and market structure analysis. Capable of analyzing complex economic relationships, predicting market trends, and assessing the impact of policy interventions on various economic indicators and stakeholders."
  },

  finance: {
    domain: "Finance", 
    title: "Investment Strategy & Risk Management Expert",
    expertise: [
      "Corporate Finance", "Investment Analysis", "Portfolio Management",
      "Risk Management", "Financial Planning", "Quantitative Finance",
      "Behavioral Finance", "International Finance", "Financial Markets"
    ],
    specializations: [
      "Asset Allocation Strategies", "Derivatives Trading", "Credit Risk Assessment",
      "Alternative Investments", "ESG Investing", "Retirement Planning",
      "Financial Modeling", "Valuation Analysis", "Treasury Management"
    ],
    methodologies: [
      "DCF Modeling", "Monte Carlo Simulation", "VaR Analysis", "Black-Scholes Model",
      "CAPM & APT", "Technical Analysis", "Fundamental Analysis", 
      "Stress Testing", "Scenario Analysis", "Financial Statement Analysis"
    ],
    applications: [
      "Investment Advisory", "Corporate Finance", "Wealth Management",
      "Risk Management", "Financial Consulting", "Investment Banking",
      "Insurance & Actuarial", "Fintech Development", "Regulatory Compliance"
    ],
    keyStrengths: [
      "Risk-return optimization", "Market valuation expertise",
      "Financial product design", "Regulatory compliance knowledge",
      "Quantitative analysis proficiency", "Client relationship management"
    ],
    relevanceKeywords: [
      "finance", "investment", "portfolio", "risk", "return", "trading", "valuation",
      "stocks", "bonds", "derivatives", "asset", "wealth", "retirement", "banking",
      "insurance", "capital", "dividend", "interest", "credit", "loans"
    ],
    complexity: {
      theoretical: 0.8,
      practical: 0.95,
      interdisciplinary: 0.7
    },
    description: "Expert in financial markets, investment strategies, and risk management. Specializes in portfolio optimization, asset valuation, and financial planning. Capable of analyzing complex financial instruments, developing investment strategies, and providing comprehensive risk assessment across various market conditions and investment horizons."
  },

  architecture: {
    domain: "Architecture",
    title: "Sustainable Design & Urban Planning Expert",
    expertise: [
      "Sustainable Architecture", "Urban Design", "Architectural History", 
      "Building Information Modeling", "Environmental Design", "Landscape Architecture",
      "Interior Architecture", "Historic Preservation", "Housing Design"
    ],
    specializations: [
      "Green Building Certification", "Passive House Design", "Smart Building Integration",
      "Affordable Housing Solutions", "Cultural Architecture", "Disaster-Resilient Design",
      "Adaptive Reuse", "Universal Design", "Community Planning"
    ],
    methodologies: [
      "Design Thinking Process", "Site Analysis", "Environmental Impact Assessment",
      "Building Performance Simulation", "Post-Occupancy Evaluation",
      "Participatory Design", "Integrated Design Process", "Life Cycle Assessment"
    ],
    applications: [
      "Residential Design", "Commercial Architecture", "Institutional Buildings",
      "Urban Planning", "Landscape Design", "Historic Restoration",
      "Sustainable Development", "Design Consulting", "Construction Management"
    ],
    keyStrengths: [
      "Holistic design thinking", "Sustainability integration",
      "Cultural sensitivity", "Technical problem-solving",
      "Stakeholder collaboration", "Regulatory compliance expertise"
    ],
    relevanceKeywords: [
      "architecture", "building", "design", "construction", "planning", "space",
      "sustainable", "green", "urban", "residential", "commercial", "structure",
      "materials", "environment", "zoning", "blueprints", "renovation"
    ],
    complexity: {
      theoretical: 0.75,
      practical: 0.9,
      interdisciplinary: 0.95
    },
    description: "Expert in architectural design, urban planning, and sustainable construction. Specializes in integrating environmental considerations with functional design solutions. Capable of analyzing complex spatial relationships, developing innovative building solutions, and balancing aesthetic, functional, and environmental requirements in diverse architectural contexts."
  },

  engineering: {
    domain: "Engineering",
    title: "Systems Engineering & Innovation Expert",
    expertise: [
      "Systems Engineering", "Software Engineering", "Mechanical Engineering",
      "Electrical Engineering", "Civil Engineering", "Industrial Engineering", 
      "Biomedical Engineering", "Environmental Engineering", "Aerospace Engineering"
    ],
    specializations: [
      "Product Development", "Process Optimization", "Quality Management",
      "Automation & Control", "Renewable Energy Systems", "Infrastructure Design",
      "Manufacturing Engineering", "Robotics & AI", "Materials Engineering"
    ],
    methodologies: [
      "Design Thinking", "Lean Six Sigma", "Agile Development", "Systems Thinking",
      "Failure Mode Analysis", "Finite Element Analysis", "CAD/CAM", 
      "Statistical Process Control", "Project Management", "Risk Analysis"
    ],
    applications: [
      "Product Design", "Manufacturing", "Infrastructure Development", 
      "Technology Innovation", "Process Improvement", "R&D Projects",
      "Consulting Services", "Quality Assurance", "Safety Engineering"
    ],
    keyStrengths: [
      "Technical problem-solving", "Innovation methodology",
      "Cross-disciplinary integration", "Performance optimization",
      "Safety-critical systems", "Scalable solution design"
    ],
    relevanceKeywords: [
      "engineering", "technical", "system", "design", "development", "innovation",
      "technology", "manufacturing", "automation", "optimization", "efficiency",
      "quality", "safety", "process", "mechanical", "electrical", "software"
    ],
    complexity: {
      theoretical: 0.85,
      practical: 0.95,
      interdisciplinary: 0.9
    },
    description: "Expert in engineering design, systems optimization, and technological innovation. Specializes in developing scalable technical solutions across multiple engineering domains. Capable of analyzing complex systems, identifying optimization opportunities, and implementing innovative solutions while ensuring safety, efficiency, and sustainability standards."
  },

  design: {
    domain: "Design",
    title: "User Experience & Creative Design Expert",
    expertise: [
      "User Experience Design", "User Interface Design", "Graphic Design",
      "Product Design", "Service Design", "Design Research", 
      "Brand Identity", "Information Architecture", "Interaction Design"
    ],
    specializations: [
      "Human-Centered Design", "Design Systems", "Accessibility Design",
      "Mobile App Design", "Web Design", "Design Strategy",
      "Prototyping & Testing", "Visual Communication", "Design Leadership"
    ],
    methodologies: [
      "Design Thinking Process", "User Research Methods", "Usability Testing",
      "A/B Testing", "Persona Development", "Journey Mapping", 
      "Card Sorting", "Heuristic Evaluation", "Iterative Design", "Co-design"
    ],
    applications: [
      "Digital Product Design", "Brand Development", "Marketing Design",
      "Print & Publication", "Environmental Graphics", "Design Consulting",
      "User Research", "Design Strategy", "Creative Direction"
    ],
    keyStrengths: [
      "User-centered approach", "Creative problem-solving",
      "Visual communication", "Interdisciplinary collaboration",
      "Design research expertise", "Brand strategy development"
    ],
    relevanceKeywords: [
      "design", "user", "interface", "experience", "visual", "creative", "brand",
      "prototype", "usability", "accessibility", "aesthetic", "layout", "typography",
      "color", "mobile", "web", "app", "graphics", "communication"
    ],
    complexity: {
      theoretical: 0.7,
      practical: 0.85,
      interdisciplinary: 0.9
    },
    description: "Expert in user-centered design and creative problem-solving. Specializes in creating intuitive interfaces and compelling visual experiences. Capable of conducting comprehensive user research, developing design systems, and translating complex requirements into elegant, accessible design solutions that balance user needs with business objectives."
  },

  'life-sciences': {
    domain: "Life Sciences",
    title: "Biomedical Research & Healthcare Expert",
    expertise: [
      "Molecular Biology", "Cell Biology", "Genetics", "Biochemistry",
      "Microbiology", "Immunology", "Neuroscience", "Pharmacology", "Biotechnology"
    ],
    specializations: [
      "Drug Discovery", "Genetic Engineering", "Stem Cell Research",
      "Personalized Medicine", "Biomarker Development", "Clinical Trials",
      "Bioinformatics", "Medical Diagnostics", "Therapeutic Development"
    ],
    methodologies: [
      "PCR & Sequencing", "Cell Culture", "Protein Analysis", "Statistical Analysis",
      "Animal Models", "Clinical Research", "Bioinformatics Tools",
      "Laboratory Automation", "Quality Control", "Regulatory Compliance"
    ],
    applications: [
      "Medical Research", "Pharmaceutical Development", "Diagnostic Testing",
      "Biotechnology Industry", "Academic Research", "Healthcare Innovation",
      "Regulatory Affairs", "Clinical Laboratory", "Biotech Consulting"
    ],
    keyStrengths: [
      "Molecular mechanism understanding", "Experimental design expertise",
      "Data interpretation skills", "Regulatory knowledge",
      "Cross-functional collaboration", "Research methodology"
    ],
    relevanceKeywords: [
      "biology", "medical", "health", "genetics", "dna", "cell", "protein",
      "disease", "treatment", "drug", "clinical", "research", "biotechnology",
      "genome", "immunology", "neuroscience", "pharmacology", "diagnosis"
    ],
    complexity: {
      theoretical: 0.95,
      practical: 0.9,
      interdisciplinary: 0.85
    },
    description: "Expert in biological sciences and biomedical research. Specializes in molecular mechanisms, genetic analysis, and therapeutic development. Capable of analyzing complex biological systems, designing experiments, and translating research findings into practical applications for healthcare, biotechnology, and pharmaceutical development."
  },

  mathematics: {
    domain: "Mathematics",
    title: "Applied Mathematics & Statistical Analysis Expert",
    expertise: [
      "Statistics", "Probability Theory", "Mathematical Modeling", 
      "Optimization", "Numerical Analysis", "Data Science", 
      "Operations Research", "Game Theory", "Computational Mathematics"
    ],
    specializations: [
      "Machine Learning Algorithms", "Predictive Modeling", "Risk Analysis",
      "Quality Control", "Experimental Design", "Time Series Analysis",
      "Multivariate Statistics", "Bayesian Analysis", "Mathematical Finance"
    ],
    methodologies: [
      "Statistical Testing", "Regression Analysis", "Monte Carlo Methods",
      "Linear Programming", "Stochastic Processes", "Algorithms Development",
      "Data Mining", "Mathematical Proof", "Simulation Modeling"
    ],
    applications: [
      "Data Analysis", "Research Design", "Business Intelligence",
      "Financial Modeling", "Quality Assurance", "Academic Research",
      "Consulting Services", "Algorithm Development", "Decision Support"
    ],
    keyStrengths: [
      "Quantitative analysis", "Mathematical modeling",
      "Statistical inference", "Algorithm optimization",
      "Data interpretation", "Problem abstraction"
    ],
    relevanceKeywords: [
      "mathematics", "statistics", "probability", "modeling", "analysis", "data",
      "calculation", "algorithm", "optimization", "prediction", "numbers",
      "equations", "variables", "correlation", "regression", "sampling"
    ],
    complexity: {
      theoretical: 0.95,
      practical: 0.8,
      interdisciplinary: 0.75
    },
    description: "Expert in mathematical analysis and statistical methodology. Specializes in developing mathematical models and analyzing complex datasets. Capable of designing statistical studies, implementing advanced algorithms, and providing quantitative insights to support decision-making across various domains and applications."
  },

  physics: {
    domain: "Physics", 
    title: "Theoretical & Applied Physics Expert",
    expertise: [
      "Quantum Mechanics", "Classical Mechanics", "Thermodynamics",
      "Electromagnetism", "Relativity", "Condensed Matter Physics",
      "Particle Physics", "Astrophysics", "Optics"
    ],
    specializations: [
      "Quantum Computing", "Materials Science", "Laser Physics",
      "Nuclear Physics", "Plasma Physics", "Biophysics",
      "Computational Physics", "Experimental Physics", "Applied Physics"
    ],
    methodologies: [
      "Mathematical Modeling", "Computational Simulation", "Experimental Design",
      "Data Analysis", "Theoretical Analysis", "Laboratory Techniques",
      "Statistical Mechanics", "Numerical Methods", "Instrumentation"
    ],
    applications: [
      "Technology Development", "Materials Research", "Energy Systems",
      "Medical Physics", "Engineering Applications", "Academic Research",
      "Industrial R&D", "Defense Applications", "Environmental Monitoring"
    ],
    keyStrengths: [
      "Fundamental principle understanding", "Mathematical modeling",
      "Experimental methodology", "System analysis",
      "Cross-disciplinary application", "Innovation potential"
    ],
    relevanceKeywords: [
      "physics", "quantum", "energy", "force", "particle", "wave", "field",
      "mechanics", "thermodynamics", "electromagnetic", "relativity", "matter",
      "motion", "temperature", "pressure", "radiation", "optics"
    ],
    complexity: {
      theoretical: 1.0,
      practical: 0.85,
      interdisciplinary: 0.8
    },
    description: "Expert in fundamental physical principles and their applications. Specializes in theoretical analysis and experimental investigation of physical phenomena. Capable of analyzing complex physical systems, developing mathematical models, and applying physics principles to solve practical problems across technology, engineering, and scientific research domains."
  },

  philosophy: {
    domain: "Philosophy",
    title: "Ethics & Critical Reasoning Expert", 
    expertise: [
      "Ethics", "Logic", "Metaphysics", "Epistemology", "Political Philosophy",
      "Philosophy of Mind", "Philosophy of Science", "Moral Philosophy",
      "Applied Ethics", "Critical Thinking"
    ],
    specializations: [
      "Biomedical Ethics", "Business Ethics", "Environmental Ethics",
      "AI Ethics", "Legal Philosophy", "Philosophy of Technology",
      "Social Justice", "Virtue Ethics", "Consequentialism", "Deontology"
    ],
    methodologies: [
      "Logical Analysis", "Argument Evaluation", "Conceptual Analysis",
      "Thought Experiments", "Case Study Analysis", "Dialectical Method",
      "Comparative Ethics", "Philosophical Writing", "Critical Examination"
    ],
    applications: [
      "Ethical Consulting", "Policy Analysis", "Educational Philosophy",
      "Organizational Ethics", "Research Ethics", "Medical Ethics",
      "Technology Ethics", "Legal Analysis", "Philosophy Education"
    ],
    keyStrengths: [
      "Ethical reasoning", "Critical analysis",
      "Argument construction", "Conceptual clarity",
      "Cross-cultural perspective", "Moral judgment"
    ],
    relevanceKeywords: [
      "philosophy", "ethics", "moral", "reasoning", "logic", "values", "principles",
      "justice", "rights", "meaning", "existence", "consciousness", "truth",
      "knowledge", "belief", "argument", "critical thinking", "virtue"
    ],
    complexity: {
      theoretical: 0.95,
      practical: 0.75,
      interdisciplinary: 0.9
    },
    description: "Expert in philosophical reasoning and ethical analysis. Specializes in applying philosophical frameworks to complex moral and conceptual problems. Capable of providing rigorous logical analysis, ethical evaluation, and conceptual clarification across diverse domains while considering multiple perspectives and cultural contexts."
  },

  generalist: {
    domain: "Generalist",
    title: "Interdisciplinary Scholar & Universal Expert",
    expertise: [
      "Cognitive Science", "Philosophy", "Economics", "Applied Mathematics",
      "Systems Thinking", "Interdisciplinary Research", "Knowledge Synthesis",
      "Critical Analysis", "Innovation Strategy", "Cross-Cultural Studies"
    ],
    specializations: [
      "Cross-Disciplinary Integration", "Complex Problem Solving", "Knowledge Translation",
      "Strategic Analysis", "Innovation Methodology", "Cultural Intelligence",
      "Educational Design", "Policy Analysis", "Future Scenario Planning",
      "Wisdom Integration", "Pattern Recognition", "Universal Principles"
    ],
    methodologies: [
      "Systems Analysis", "Comparative Analysis", "Synthesis Methodology",
      "Design Thinking", "Critical Reasoning", "Historical Analysis",
      "Cross-Cultural Research", "Interdisciplinary Research Design",
      "Knowledge Mapping", "Pattern Analysis", "Holistic Assessment"
    ],
    applications: [
      "Complex Problem Solving", "Strategic Consulting", "Innovation Advisory", 
      "Educational Curriculum Design", "Policy Development", "Research Coordination",
      "Knowledge Management", "Cultural Bridge Building", "Crisis Analysis",
      "Future Planning", "Leadership Development", "Universal Applications"
    ],
    keyStrengths: [
      "Interdisciplinary synthesis", "Universal problem-solving approach",
      "Cultural and historical perspective", "Innovation through cross-pollination",
      "Pattern recognition across domains", "Wisdom integration",
      "Complex system understanding", "Knowledge translation abilities"
    ],
    relevanceKeywords: [
      "interdisciplinary", "complex", "integration", "synthesis", "universal", "general",
      "broad", "comprehensive", "holistic", "multi-perspective", "cross-domain",
      "innovation", "strategy", "analysis", "wisdom", "knowledge", "understanding",
      "insight", "perspective", "connection", "pattern", "system", "overview"
    ],
    complexity: {
      theoretical: 0.9,
      practical: 0.85,
      interdisciplinary: 1.0
    },
    description: "Universal expert capable of integrating knowledge across all major disciplines. Specializes in synthesizing insights from multiple fields to solve complex, multifaceted problems. Possesses exceptional breadth and depth of knowledge, enabling comprehensive analysis that transcends traditional domain boundaries. Ideal for handling complex queries that require interdisciplinary thinking, innovation through cross-pollination of ideas, and wisdom that comes from understanding universal patterns and principles."
  }
};