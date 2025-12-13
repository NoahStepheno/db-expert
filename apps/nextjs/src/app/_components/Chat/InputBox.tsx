import React, { useState, useRef } from 'react';
import { ModelType, type Attachment } from '~/types';

interface InputBoxProps {
  onSend: (text: string, model: ModelType, attachments: Attachment[]) => void;
  onStop: () => void;
  isLoading: boolean;
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ onSend, onStop, isLoading, selectedModel, onModelChange: setSelectedModel }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSend(text, selectedModel, attachments);
    setText('');
    setAttachments([]);
  };

  const handleStop = () => {
    onStop();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newAttachments: Attachment[] = [];

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64String = (event.target.result as string).split(',')[1];
            // @ts-expect-error - base64String is possibly undefined if split fails, but here it's fine
            newAttachments.push({
              name: file.name,
              mimeType: file.type,
              data: base64String!
            });
            if (newAttachments.length === files.length) {
              setAttachments(prev => [...prev, ...newAttachments]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">

        {/* Controls: Model Selector & Attachments */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative inline-flex bg-gray-100 rounded-lg p-1 border border-gray-200">
               <button
                onClick={() => setSelectedModel(ModelType.EXPERT)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${selectedModel === ModelType.EXPERT ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <i className="fa-solid fa-brain"></i>
                 Expert Mode
               </button>
               <button
                onClick={() => setSelectedModel(ModelType.FAST)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${selectedModel === ModelType.FAST ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <i className="fa-solid fa-bolt"></i>
                 Fast Mode
               </button>
            </div>
          </div>

          <div className="text-xs text-gray-400">
             {attachments.length} files attached
          </div>
        </div>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group bg-gray-50 border border-gray-200 rounded-md p-2 flex items-center gap-2 min-w-[120px]">
                <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-indigo-600">
                  <i className="fa-solid fa-file-code"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-gray-700">{att.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{att.mimeType}</p>
                </div>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all shadow-sm">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-200"
            title="Attach file (SQL, txt, md, etc.)"
          >
            <i className="fa-solid fa-paperclip text-lg"></i>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".sql,.txt,.md,.json,.js,.ts"
            onChange={handleFileChange}
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "AI is thinking... (Click Stop to interrupt)" : "Describe your business requirements or paste SQL..."}
            className="flex-1 bg-transparent border-0 resize-none focus:ring-0 py-3 px-2 text-gray-800 placeholder-gray-400 max-h-32 min-h-[44px] outline-none"
            rows={1}
            disabled={isLoading}
            style={{ height: 'auto', minHeight: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />

          <button
            onClick={isLoading ? handleStop : handleSend}
            disabled={!isLoading && (!text.trim() && attachments.length === 0)}
            className={`p-3 rounded-lg transition-all flex items-center justify-center shadow-md
              ${isLoading
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : (!text.trim() && attachments.length === 0)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            title={isLoading ? "Stop generating" : "Send message"}
          >
            {isLoading ? (
              <i className="fa-solid fa-stop"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </div>

        <div className="text-center">
            <span className="text-[10px] text-gray-400">
              AI can make mistakes. Please verify critical database schema changes.
            </span>
        </div>
      </div>
    </div>
  );
};

export default InputBox;
