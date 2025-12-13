import React from 'react';
import { type Project } from '~/types';

interface HeaderProps {
  activeProject?: Project;
}

const Header: React.FC<HeaderProps> = ({ activeProject }) => {
  return (
    <div className="py-3 px-6 flex justify-between items-center">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
            {activeProject ? activeProject.name : 'DDD Architect'}
          </h1>
          <p className="text-xs text-gray-500 truncate max-w-md">
            {activeProject?.description || 'Domain-Driven Design & Schema Optimization'}
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium border border-green-200">
           <i className="fa-solid fa-circle text-[8px] mr-1"></i> Gemini 2.0 Pro Active
        </span>
      </div>
    </div>
  );
};

export default Header;
