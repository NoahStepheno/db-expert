import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type ProjectDocument } from '~/types';

interface DocManagerProps {
  documents: ProjectDocument[];
  onAddDoc: (title: string, content: string) => void;
  onUpdateDoc: (id: string, content: string) => void;
  onDeleteDoc: (id: string) => void;
}

const DocManager: React.FC<DocManagerProps> = ({ documents, onAddDoc, onUpdateDoc, onDeleteDoc }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(documents.length > 0 ? documents[0]!.id : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Create New State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const activeDoc = documents.find(d => d.id === selectedDocId);

  const handleStartEdit = () => {
    if (activeDoc) {
      setEditContent(activeDoc.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedDocId) {
      onUpdateDoc(selectedDocId, editContent);
      setIsEditing(false);
    }
  };

  const handleCreate = () => {
    if (newTitle.trim()) {
      onAddDoc(newTitle, '# ' + newTitle + '\n\nStart writing here...');
      setNewTitle('');
      setIsCreating(false);
      // Select the new one (conceptually we'd need the ID, but for now user can select it)
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Doc List Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Documents</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded"
            title="New Document"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>

        {isCreating && (
          <div className="p-2 border-b border-gray-200 bg-white">
            <input
              autoFocus
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-2"
              placeholder="Doc Title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setIsCreating(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleCreate} className="text-indigo-600 font-medium">Create</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => { setSelectedDocId(doc.id); setIsEditing(false); }}
              className={`p-3 cursor-pointer border-l-4 transition-all ${
                selectedDocId === doc.id
                  ? 'bg-white border-indigo-600 shadow-sm'
                  : 'border-transparent hover:bg-gray-100 text-gray-600'
              }`}
            >
              <div className="text-sm font-medium truncate">{doc.title}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(doc.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          ))}

          {documents.length === 0 && !isCreating && (
            <div className="p-6 text-center text-gray-400 text-sm">
              No documents yet.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeDoc ? (
          <>
            <div className="h-14 border-b border-gray-200 flex justify-between items-center px-6 bg-white shrink-0">
              <h2 className="text-lg font-bold text-gray-800 truncate">{activeDoc.title}</h2>
              <div className="flex gap-2">
                 <button
                    onClick={() => onDeleteDoc(activeDoc.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete Document"
                 >
                   <i className="fa-regular fa-trash-can"></i>
                 </button>
                 <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
                 {isEditing ? (
                   <button onClick={handleSaveEdit} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700">
                     Save
                   </button>
                 ) : (
                   <button onClick={handleStartEdit} className="text-gray-600 border border-gray-300 px-4 py-1.5 rounded text-sm hover:bg-gray-50">
                     Edit
                   </button>
                 )}
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full h-full p-8 outline-none resize-none font-mono text-sm leading-relaxed text-gray-800"
                />
              ) : (
                <div className="markdown-body p-8 max-w-3xl mx-auto">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {activeDoc.content}
                   </ReactMarkdown>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <i className="fa-regular fa-file-lines text-4xl mb-4"></i>
            <p>Select a document to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocManager;
