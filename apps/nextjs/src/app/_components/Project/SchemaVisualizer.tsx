import React, { useState } from 'react';
import MermaidBlock from '../Chat/MermaidBlock';

interface SchemaVisualizerProps {
  code: string;
  onUpdate: (newCode: string) => void;
}

const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ code, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localCode, setLocalCode] = useState(code);

  const handleSave = () => {
    onUpdate(localCode);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Mermaid code copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div>
           <h2 className="text-lg font-bold text-gray-800">Domain Model / ER Diagram</h2>
           <p className="text-xs text-gray-500">Visualize your project structure using Mermaid.js</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
             <>
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700">Apply Changes</button>
             </>
          ) : (
             <>
               <button onClick={handleCopy} className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                 <i className="fa-regular fa-copy mr-2"></i>Copy Code
               </button>
               <button onClick={() => { setLocalCode(code); setIsEditing(true); }} className="px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100">
                 <i className="fa-solid fa-pen mr-2"></i>Edit Diagram
               </button>
             </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Editor (Visible when editing) */}
        {isEditing && (
          <div className="w-full md:w-1/3 bg-gray-900 h-full flex flex-col border-r border-gray-700">
            <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-mono border-b border-gray-700">
              Mermaid Syntax Editor
            </div>
            <textarea
              value={localCode}
              onChange={(e) => setLocalCode(e.target.value)}
              className="flex-1 bg-gray-900 text-gray-300 p-4 font-mono text-xs md:text-sm resize-none focus:outline-none"
              spellCheck={false}
              placeholder="erDiagram..."
            />
          </div>
        )}

        {/* Visualization Area */}
        <div className={`flex-1 overflow-auto p-8 bg-gray-50 flex items-start justify-center ${isEditing ? 'bg-gray-100' : ''}`}>
           <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
             {code.trim() ? (
                <MermaidBlock chart={isEditing ? localCode : code} />
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-70 mt-20">
                  <i className="fa-solid fa-project-diagram text-4xl mb-4"></i>
                  <p>No schema defined yet.</p>
                  <p className="text-sm mt-2">Ask the AI to generate an ER Diagram, then it will appear here.</p>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaVisualizer;
