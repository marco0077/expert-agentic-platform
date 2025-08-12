"use client";

import { User, Bot, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn(
        "max-w-[70%] rounded-lg p-3",
        isUser 
          ? "bg-blue-500 text-white" 
          : "bg-gray-100 text-gray-900"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        
        {/* Display sources for system messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, sourceIndex) => {
                // Parse source format "Title - URL" or just use URL
                const [title, url] = source.includes(' - ') ? source.split(' - ', 2) : [null, source];
                const displayTitle = title || `Source ${sourceIndex + 1}`;
                const linkUrl = url || source;
                
                return (
                  <a
                    key={sourceIndex}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-white px-2 py-1 rounded border"
                    title={linkUrl}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {displayTitle}
                  </a>
                );
              })}
            </div>
          </div>
        )}
        
        <p className={cn(
          "text-xs mt-2 opacity-70",
          isUser ? "text-blue-100" : "text-gray-500"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
          })}
        </p>
      </div>
    </div>
  );
}