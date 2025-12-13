import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { type Message, Sender } from '~/types';
import MermaidBlock from './MermaidBlock';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isThinking = message.isThinking;

  // Custom renderer for code blocks to handle Mermaid
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (!inline && language === 'mermaid') {
        return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
      }

      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className} bg-gray-200 text-gray-800 rounded px-1 py-0.5 text-sm`} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>

        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-green-600'} text-white`}>
          <i className={`fa ${isUser ? 'fa-user' : 'fa-robot'} text-sm`}></i>
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
            ${isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
            } ${isThinking ? 'animate-pulse' : ''}`}
          >
            {isThinking ? (
              <div className="flex items-center gap-2 text-gray-500">
                <i className="fa-solid fa-brain fa-bounce"></i>
                <span>Analyzing domain model...</span>
              </div>
            ) : (
              <div className={`markdown-body ${isUser ? 'text-white' : 'text-gray-800'}`}>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {message.attachments.map((att, idx) => (
                      <div key={idx} className="bg-black/10 px-2 py-1 rounded text-xs flex items-center gap-1 border border-white/20">
                         <i className="fa-solid fa-paperclip"></i>
                         <span className="truncate max-w-[150px]">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={components}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Metadata */}
          <span className="text-xs text-gray-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {!isUser && message.modelUsed && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] text-gray-500 font-medium">
                {message.modelUsed.includes('flash') ? '⚡ Flash' : '🧠 Pro'}
              </span>
            )}
          </span>
        </div>

      </div>
    </div>
  );
};

export default MessageItem;
