"use client";

import { useState, useEffect } from "react";
import { Brain, Toggle, ChevronRight, Users, Zap } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  active: boolean;
  performance: number;
}

interface ExpertiseArea {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  agents: Agent[];
}

export function ExpertAgents() {
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseArea[]>([
    {
      id: "psychology",
      name: "Psychology",
      description: "Human behavior, cognitive processes, and mental health",
      color: "purple",
      icon: "🧠",
      agents: [
        {
          id: "cognitive-psychologist",
          name: "Cognitive Psychologist",
          description: "Expert in memory, learning, perception, and problem-solving",
          specialties: ["Memory", "Learning", "Perception", "Problem-solving"],
          active: true,
          performance: 92
        },
        {
          id: "clinical-psychologist",
          name: "Clinical Psychologist",
          description: "Specialist in mental health disorders and therapeutic approaches",
          specialties: ["Mental Health", "Therapy", "Disorders", "Assessment"],
          active: true,
          performance: 88
        }
      ]
    },
    {
      id: "economy",
      name: "Economy",
      description: "Economic systems, market analysis, and policy evaluation",
      color: "green",
      icon: "📈",
      agents: [
        {
          id: "macroeconomist",
          name: "Macroeconomist",
          description: "Expert in national and global economic trends and policies",
          specialties: ["GDP", "Inflation", "Monetary Policy", "Fiscal Policy"],
          active: true,
          performance: 85
        },
        {
          id: "market-analyst",
          name: "Market Analyst",
          description: "Specialist in market dynamics and consumer behavior",
          specialties: ["Market Research", "Consumer Behavior", "Competition"],
          active: false,
          performance: 79
        }
      ]
    },
    {
      id: "finance",
      name: "Finance",
      description: "Investment strategies, risk management, and financial planning",
      color: "emerald",
      icon: "💰",
      agents: [
        {
          id: "investment-advisor",
          name: "Investment Advisor",
          description: "Expert in portfolio management and investment strategies",
          specialties: ["Portfolio Management", "Risk Assessment", "Asset Allocation"],
          active: true,
          performance: 91
        },
        {
          id: "financial-planner",
          name: "Financial Planner",
          description: "Specialist in personal finance and retirement planning",
          specialties: ["Personal Finance", "Retirement Planning", "Tax Strategy"],
          active: true,
          performance: 86
        }
      ]
    },
    {
      id: "architecture",
      name: "Architecture",
      description: "Building design, urban planning, and sustainable construction",
      color: "orange",
      icon: "🏗️",
      agents: [
        {
          id: "sustainable-architect",
          name: "Sustainable Architect",
          description: "Expert in eco-friendly and energy-efficient design",
          specialties: ["Green Building", "Energy Efficiency", "LEED Certification"],
          active: false,
          performance: 83
        }
      ]
    },
    {
      id: "engineering",
      name: "Engineering",
      description: "Technical solutions, system design, and innovation",
      color: "blue",
      icon: "⚙️",
      agents: [
        {
          id: "software-engineer",
          name: "Software Engineer",
          description: "Expert in software development and system architecture",
          specialties: ["Software Development", "System Architecture", "DevOps"],
          active: true,
          performance: 94
        },
        {
          id: "mechanical-engineer",
          name: "Mechanical Engineer",
          description: "Specialist in mechanical systems and product design",
          specialties: ["Mechanical Design", "Manufacturing", "Materials"],
          active: true,
          performance: 87
        }
      ]
    },
    {
      id: "design",
      name: "Design",
      description: "User experience, visual design, and creative solutions",
      color: "pink",
      icon: "🎨",
      agents: [
        {
          id: "ux-designer",
          name: "UX Designer",
          description: "Expert in user-centered design and interface optimization",
          specialties: ["User Research", "Interface Design", "Usability Testing"],
          active: true,
          performance: 89
        }
      ]
    },
    {
      id: "life-sciences",
      name: "Life Sciences",
      description: "Biology, medicine, genetics, and biotechnology",
      color: "teal",
      icon: "🧬",
      agents: [
        {
          id: "molecular-biologist",
          name: "Molecular Biologist",
          description: "Expert in genetics, DNA, and cellular processes",
          specialties: ["Genetics", "DNA Analysis", "Cell Biology", "Biotechnology"],
          active: false,
          performance: 90
        }
      ]
    },
    {
      id: "mathematics",
      name: "Mathematics",
      description: "Mathematical analysis, statistics, and computational methods",
      color: "indigo",
      icon: "📊",
      agents: [
        {
          id: "statistician",
          name: "Statistician",
          description: "Expert in data analysis and statistical modeling",
          specialties: ["Data Analysis", "Statistical Modeling", "Probability"],
          active: true,
          performance: 93
        }
      ]
    },
    {
      id: "physics",
      name: "Physics",
      description: "Physical phenomena, quantum mechanics, and theoretical physics",
      color: "cyan",
      icon: "⚛️",
      agents: [
        {
          id: "theoretical-physicist",
          name: "Theoretical Physicist",
          description: "Expert in quantum mechanics and theoretical frameworks",
          specialties: ["Quantum Mechanics", "Relativity", "Particle Physics"],
          active: false,
          performance: 88
        }
      ]
    },
    {
      id: "philosophy",
      name: "Philosophy",
      description: "Ethics, logic, metaphysics, and philosophical reasoning",
      color: "amber",
      icon: "🤔",
      agents: [
        {
          id: "ethicist",
          name: "Ethicist",
          description: "Expert in moral philosophy and ethical decision-making",
          specialties: ["Ethics", "Moral Philosophy", "Applied Ethics"],
          active: true,
          performance: 85
        }
      ]
    }
  ]);

  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleAgent = (areaId: string, agentId: string) => {
    setExpertiseAreas(prev => 
      prev.map(area => 
        area.id === areaId 
          ? {
              ...area,
              agents: area.agents.map(agent => 
                agent.id === agentId 
                  ? { ...agent, active: !agent.active }
                  : agent
              )
            }
          : area
      )
    );
  };

  const getColorClasses = (color: string, variant: "bg" | "text" | "border") => {
    const colorMap = {
      purple: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
      green: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
      orange: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
      blue: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
      pink: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
      teal: { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
      cyan: { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
      amber: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || "bg-gray-100";
  };

  const filteredAreas = expertiseAreas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.agents.some(agent => 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const totalAgents = expertiseAreas.reduce((sum, area) => sum + area.agents.length, 0);
  const activeAgents = expertiseAreas.reduce((sum, area) => 
    sum + area.agents.filter(agent => agent.active).length, 0
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Expert Agents</h2>
        <p className="text-gray-600 mb-4">
          Activate or deactivate expert agents across different domains to customize your experience
        </p>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {activeAgents} of {totalAgents} agents active
            </span>
          </div>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search agents or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAreas.map((area) => (
          <div
            key={area.id}
            className={cn(
              "rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg cursor-pointer",
              selectedArea === area.id ? "ring-2 ring-blue-500" : "",
              getColorClasses(area.color, "bg"),
              getColorClasses(area.color, "border")
            )}
            onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{area.icon}</span>
                <div>
                  <h3 className={cn("font-semibold text-lg", getColorClasses(area.color, "text"))}>
                    {area.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">
                      {area.agents.filter(a => a.active).length}/{area.agents.length} active
                    </span>
                    <Zap className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
              <ChevronRight 
                className={cn(
                  "w-5 h-5 text-gray-400 transition-transform",
                  selectedArea === area.id ? "transform rotate-90" : ""
                )} 
              />
            </div>

            <p className="text-sm text-gray-700 mb-4">
              {area.description}
            </p>

            {selectedArea === area.id && (
              <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                {area.agents.map((agent) => (
                  <div key={agent.id} className="bg-white rounded-md p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{agent.name}</h4>
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={cn(
                                  "h-1.5 rounded-full",
                                  agent.performance >= 90 ? "bg-green-500" :
                                  agent.performance >= 80 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${agent.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{agent.performance}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{agent.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.specialties.map((specialty, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Switch.Root
                        checked={agent.active}
                        onCheckedChange={() => toggleAgent(area.id, agent.id)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                      >
                        <Switch.Thumb className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
                      </Switch.Root>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No agents found matching your search.</p>
        </div>
      )}
    </div>
  );
}