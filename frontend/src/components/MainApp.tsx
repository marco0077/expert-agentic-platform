"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { MessageCircle, User, Brain } from "lucide-react";
import { ChatInterface } from "./chat/ChatInterface";
import { MyInfo } from "./myinfo/MyInfo";
import { ExpertAgents } from "./agents/ExpertAgents";

export function MainApp() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2">
            Expert Agentic Platform
          </h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Ask questions and get expert answers from specialized AI agents across multiple domains
          </p>
        </div>

        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <Tabs.List className="flex bg-white rounded-lg p-1 shadow-md mb-6 overflow-x-auto">
            <Tabs.Trigger
              value="chat"
              className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-blue-50 hover:text-blue-700"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Tabs.Trigger>
            <Tabs.Trigger
              value="myinfo"
              className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-blue-50 hover:text-blue-700"
            >
              <User className="w-4 h-4" />
              My Info
            </Tabs.Trigger>
            <Tabs.Trigger
              value="agents"
              className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-blue-50 hover:text-blue-700"
            >
              <Brain className="w-4 h-4" />
              Expert Agents
            </Tabs.Trigger>
          </Tabs.List>

          <div className="bg-white rounded-lg shadow-lg min-h-[600px]">
            <Tabs.Content
              value="chat"
              className="p-6 focus:outline-none"
            >
              <ChatInterface />
            </Tabs.Content>

            <Tabs.Content
              value="myinfo"
              className="p-6 focus:outline-none"
            >
              <MyInfo />
            </Tabs.Content>

            <Tabs.Content
              value="agents"
              className="p-6 focus:outline-none"
            >
              <ExpertAgents />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}