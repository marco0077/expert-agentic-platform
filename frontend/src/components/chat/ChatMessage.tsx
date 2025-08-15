"use client";

import { User, Bot, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Component to parse and display structured responses
function StructuredResponse({ content, sources }: { content: string; sources: string[] }) {
  // Parse the structured response
  const sections = parseStructuredContent(content);
  
  return (
    <div className="space-y-3">
      {/* Brief Summary */}
      {sections.summary && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
          <div className="font-medium text-blue-900 text-xs uppercase tracking-wide mb-1">Summary</div>
          <div className="text-blue-800" dangerouslySetInnerHTML={{ 
            __html: processInlineSourceReferences(sections.summary, sources) 
          }} />
        </div>
      )}
      
      {/* Key Points */}
      {sections.keyPoints.length > 0 && (
        <div>
          <div className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-2">Key Points</div>
          <ul className="space-y-1">
            {sections.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ 
                  __html: processInlineSourceReferences(point, sources) 
                }} />
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Additional Details */}
      {sections.details && (
        <div>
          <div className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-2">Additional Details</div>
          <div className="space-y-2">
            {sections.details.split('\n\n').map((paragraph, index) => (
              <p key={index} dangerouslySetInnerHTML={{ 
                __html: processInlineSourceReferences(paragraph.trim(), sources) 
              }} />
            ))}
          </div>
        </div>
      )}
      
      {/* Fallback for non-structured content */}
      {!sections.summary && !sections.keyPoints.length && !sections.details && (
        <div dangerouslySetInnerHTML={{ 
          __html: processInlineSourceReferences(content, sources) 
        }} />
      )}
    </div>
  );
}

// Parse structured content into sections
function parseStructuredContent(content: string) {
  const sections = {
    summary: '',
    keyPoints: [] as string[],
    details: ''
  };
  
  // Extract brief summary
  const summaryMatch = content.match(/\*\*BRIEF SUMMARY:\*\*\s*(.*?)(?=\*\*KEY POINTS:\*\*|$)/s);
  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim();
  }
  
  // Extract key points
  const keyPointsMatch = content.match(/\*\*KEY POINTS:\*\*\s*(.*?)(?=\*\*ADDITIONAL DETAILS:\*\*|$)/s);
  if (keyPointsMatch) {
    sections.keyPoints = keyPointsMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('•'))
      .map(line => line.replace(/^•\s*/, '').trim())
      .filter(Boolean);
  }
  
  // Extract additional details
  const detailsMatch = content.match(/\*\*ADDITIONAL DETAILS:\*\*\s*(.*?)$/s);
  if (detailsMatch) {
    sections.details = detailsMatch[1].trim();
  }
  
  return sections;
}

// Process inline source references like [1], [2] and make them clickable
function processInlineSourceReferences(text: string, sources: string[]): string {
  return text.replace(/\[(\d+)\]/g, (match, num) => {
    const sourceIndex = parseInt(num) - 1;
    if (sourceIndex >= 0 && sourceIndex < sources.length) {
      const source = sources[sourceIndex];
      const [title, url] = source.includes(' - ') ? source.split(' - ', 2) : [null, source];
      const linkUrl = url || source;
      const displayTitle = title || `Source ${num}`;
      
      return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium" title="${displayTitle}">[${num}]</a>`;
    }
    return match;
  });
}

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
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <StructuredResponse content={message.content} sources={message.sources || []} />
          )}
        </div>
        
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