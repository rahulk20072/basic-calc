import React from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl z-20 flex flex-col transition-transform duration-300 ease-in-out transform">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-slate-200 font-semibold">History</h3>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {history.length === 0 ? (
          <div className="text-center text-slate-500 mt-10 text-sm">No history yet</div>
        ) : (
          history.slice().reverse().map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-right p-3 rounded-xl hover:bg-slate-800 transition-colors group flex flex-col items-end"
            >
              <span className="text-xs text-slate-400 group-hover:text-slate-300 mb-1">{item.expression}</span>
              <span className="text-lg text-emerald-400 font-mono">{item.result}</span>
            </button>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onClear}
            className="w-full py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default History;