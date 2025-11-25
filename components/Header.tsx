import React, { useState } from 'react';
import { SearchCode, HelpCircle, X } from 'lucide-react';

const Header = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
    <header className="bg-white border-b border-slate-200 py-4 px-6 relative z-30">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <SearchCode size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">OwnerSleuth AI</h1>
          <p className="text-xs text-slate-500 font-medium">Automated Business Owner Investigation</p>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
            <button 
                onClick={() => setShowInfo(true)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-xs font-medium bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
                <HelpCircle size={14} />
                How it works
            </button>
            <div className="hidden md:block text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            Gemini 2.5 Flash
            </div>
        </div>
      </div>
    </header>

    {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Investigation Logic & Strategy</h2>
                    <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
                    <section>
                        <h3 className="text-indigo-900 font-semibold mb-2">1. Deep Search Grounding</h3>
                        <p>The AI uses Gemini 2.5 Flash with real-time Google Search tools. It actively searches the web for each business row, looking for official websites, LinkedIn profiles, and news articles.</p>
                    </section>
                    
                    <section>
                        <h3 className="text-indigo-900 font-semibold mb-2">2. Advanced Extraction Pipeline</h3>
                        <p>For every business, the AI executes this reasoning chain:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Scan Official Site:</strong> Checks "About Us", "Team", and Footer sections.</li>
                            <li><strong>Review Analysis:</strong> Scans Google & Yelp reviews for mentions of names (e.g., "Thanks to the owner, [Name]").</li>
                            <li><strong>Cross-Referencing:</strong> Verifies names against LinkedIn public profiles and local business registries.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-indigo-900 font-semibold mb-2">3. Confidence Scoring</h3>
                        <p>The app assigns a confidence level based on the source:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><span className="text-emerald-600 font-medium">High:</span> Found on the official website or verified LinkedIn owner profile.</li>
                            <li><span className="text-amber-600 font-medium">Medium:</span> Mentioned in news articles or third-party directories.</li>
                            <li><span className="text-slate-500 font-medium">Low:</span> Inferred from reviews or unverified mentions.</li>
                        </ul>
                    </section>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                        <h4 className="font-semibold text-slate-800 mb-2">Prompt Strategy for Developers</h4>
                        <p className="font-mono text-xs text-slate-500">
                            "You are an expert investigator. Search for [Business] + 'Owner' OR 'CEO'. Prioritize official site > LinkedIn > Reviews. If multiple names found, look for 'Founder'. Return JSON with Name, Source, and Confidence."
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button onClick={() => setShowInfo(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Close</button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Header;