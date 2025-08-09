"use client";

import { Brain, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentContribution {
  name: string;
  expertise: string;
  contribution: string;
  confidence: number;
  sources?: string[];
}

interface AgentVisualizationProps {
  agents: AgentContribution[];
}

const expertiseColors: Record<string, string> = {
  Psychology: "bg-purple-100 text-purple-800 border-purple-200",
  Economy: "bg-green-100 text-green-800 border-green-200",
  Finance: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Architecture: "bg-orange-100 text-orange-800 border-orange-200",
  Engineering: "bg-blue-100 text-blue-800 border-blue-200",
  Design: "bg-pink-100 text-pink-800 border-pink-200",
  "Life Sciences": "bg-teal-100 text-teal-800 border-teal-200",
  Mathematics: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Physics: "bg-cyan-100 text-cyan-800 border-cyan-200",
  Philosophy: "bg-amber-100 text-amber-800 border-amber-200",
};

export function AgentVisualization({ agents }: AgentVisualizationProps) {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Expert Agent Contributions</span>
      </div>

      <div className="space-y-3">
        {agents.map((agent, index) => (
          <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{agent.name}</span>
                <span className={cn(
                  "px-2 py-1 text-xs rounded-full border",
                  expertiseColors[agent.expertise] || "bg-gray-100 text-gray-800 border-gray-200"
                )}>
                  {agent.expertise}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${agent.confidence}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{agent.confidence}%</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-2">
              {agent.contribution}
            </p>

            {agent.sources && agent.sources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {agent.sources.map((source, sourceIndex) => (
                  <a
                    key={sourceIndex}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Source {sourceIndex + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}