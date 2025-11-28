import React, { useState, useRef, useEffect } from 'react';
import { solveWithGemini } from '../services/geminiService';
import Button from './Button';
import { ButtonVariant } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (result: string) => void;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onResult }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setInput('');
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await solveWithGemini(input);
      // Try to parse the result to see if it's a number to put on the calculator display
      // If it's text, we might want to just show it here or copy it.
      // For this app, let's assume if it contains a number we pass it back, otherwise we show an alert?
      // Better: we pass the text back to the calculator display if short, or alert if long.
      
      // Heuristic: If result is short (< 20 chars), put in display.
      onResult(result);
      onClose();
    } catch (err) {
      setError("Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>
             </div>
             <h2 className="text-xl font-bold text-white">Ask Gemini</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <p className="text-slate-400 mb-4 text-sm">
          Type any math problem in natural language. e.g., "What is the square root of 5 plus 10?" or "Solve 3x + 5 = 20"
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-32"
            />
            {loading && (
              <div className="absolute bottom-4 right-4">
                 <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <div className="mt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
            >
              {loading ? 'Thinking...' : 'Solve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIModal;