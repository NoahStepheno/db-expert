import React, { useState } from 'react';
import { type Project } from '~/types';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onUpdateProject: (id: string, name: string, description: string) => void;
  onDeleteProject: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // State for editing
  const [editingProject, setEditingProject] = useState<{id: string, name: string, description: string} | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const startEditing = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject({
      id: project.id,
      name: project.name,
      description: project.description
    });
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && editingProject.name.trim()) {
      onUpdateProject(editingProject.id, editingProject.name, editingProject.description);
      setEditingProject(null);
    }
  };

  return (
    <>
      <div className="w-64 bg-gray-900 text-white flex flex-col h-full flex-shrink-0 transition-all duration-300 relative z-20">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-layer-group text-sm"></i>
          </div>
          <span className="font-bold text-sm tracking-wide">Workspace</span>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Projects
          </div>

          <div className="space-y-1 px-2">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm
                  ${activeProjectId === project.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                  }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <i className={`fa-solid ${activeProjectId === project.id ? 'fa-folder-open' : 'fa-folder'} text-xs opacity-70 flex-shrink-0`}></i>
                  <span className="truncate">{project.name}</span>
                </div>

                {/* Action Buttons (visible on hover) */}
                <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${projects.length === 1 && activeProjectId === project.id ? 'opacity-100' : ''}`}>
                  <button
                    onClick={(e) => startEditing(e, project)}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 hover:text-white"
                    title="Edit Project"
                  >
                    <i className="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm(`Delete "${project.name}"? This cannot be undone.`)) onDeleteProject(project.id);
                    }}
                    className={`w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 ${projects.length === 1 ? 'hidden' : ''}`}
                    title="Delete Project"
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create New Project */}
        <div className="p-3 border-t border-gray-800">
          {isCreating ? (
            <form onSubmit={handleCreate} className="bg-gray-800 p-2 rounded-md">
              <input
                type="text"
                autoFocus
                placeholder="Project Name..."
                className="w-full bg-gray-900 text-white text-sm px-2 py-1 rounded border border-gray-700 focus:border-indigo-500 outline-none mb-2"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs bg-indigo-600 px-2 py-1 rounded text-white hover:bg-indigo-500"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-3 rounded-md transition-colors text-sm border border-gray-700 border-dashed"
            >
              <i className="fa-solid fa-plus"></i>
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Edit Modal Overlay */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Edit Project</h3>
              <button onClick={() => setEditingProject(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <form onSubmit={saveEdit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={e => setEditingProject({...editingProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white text-gray-900"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingProject.description}
                  onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                  rows={3}
                  placeholder="Describe the business domain or project scope..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none bg-white text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
