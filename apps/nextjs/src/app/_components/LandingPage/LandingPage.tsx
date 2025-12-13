import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative flex flex-col items-center justify-center font-sans selection:bg-indigo-500 selection:text-white">

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      {/* Main Content */}
      <div className="z-10 container mx-auto px-6 relative flex flex-col items-center text-center">

        {/* Badge */}
        <div className="animate-fade-in-up">
           <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-300 text-xs font-semibold tracking-widest uppercase shadow-lg hover:bg-white/10 transition-colors cursor-default">
             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
             Powered by Gemini 2.0 Pro
           </span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-8 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-400 animate-fade-in-up delay-100 drop-shadow-sm">
          Architect Your <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Domain Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
          Bridge the gap between abstract business requirements and concrete database schemas.
          Visualize, optimize, and document with the power of expert AI.
        </p>

        {/* CTA Button */}
        <div className="mt-12 animate-fade-in-up delay-300">
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)]"
          >
            Launch Workspace
            <i className="fa-solid fa-arrow-right-long ml-2 transition-transform group-hover:translate-x-1"></i>
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl animate-fade-in-up delay-500">
           {/* Card 1 */}
           <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <i className="fa-solid fa-layer-group text-xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">DDD Modeling</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Instantly identify bounded contexts, aggregates, and entities from raw text requirements.</p>
           </div>

           {/* Card 2 */}
           <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <i className="fa-solid fa-database text-xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Schema Optimization</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Receive expert SQL generation and performance tuning advice tailored to your domain.</p>
           </div>

           {/* Card 3 */}
           <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Visual Diagrams</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Auto-generate interactive Mermaid JS diagrams (ER & Class) for your technical documentation.</p>
           </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-gray-500 text-xs animate-fade-in-up delay-500">
           <p>© 2025 DDD Architect AI. Designed for developers.</p>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
