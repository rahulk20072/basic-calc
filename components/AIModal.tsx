import React, { useState, useRef, useEffect } from 'react';
import { solveWithGemini } from '../services/geminiService';

interface AIViewProps {
  onResult: (result: string) => void;
  isActive: boolean;
}

const AIView: React.FC<AIViewProps> = ({ onResult, isActive }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isActive]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await solveWithGemini(input);
      onResult(result);
      setInput(''); // Clear after successful send
    } catch (err) {
      setError("Failed to process request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/50 animate-in fade-in duration-300">
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-glow shadow-purple-900/20">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Ask Gemini</h2>
          <p className="text-slate-400 max-w-sm mx-auto">
            Describe your math problem in plain English. I can solve equations, conversions, and word problems.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xl relative">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 'Solve 3x + 10 = 25' or '15% of 850'"
              className="relative w-full bg-slate-950 border border-slate-800 rounded-xl p-6 text-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none h-48 shadow-xl"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm mt-3 bg-red-900/20 py-2 px-4 rounded-lg inline-block">{error}</p>}

          <div className="mt-6 flex justify-center">
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-purple-900/30 flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  Calculating...
                </>
              ) : (
                <>
                  Solve with AI
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIView;