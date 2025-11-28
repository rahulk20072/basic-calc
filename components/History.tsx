import React from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect, onClear }) => {
  return (
    <div className="w-full h-full bg-slate-900/50 flex flex-col animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p>No history yet</p>
          </div>
        ) : (
          history.slice().reverse().map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-right p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-all group flex flex-col items-end border border-transparent hover:border-slate-700"
            >
              <span className="text-sm text-slate-400 group-hover:text-slate-300 mb-1 font-mono">{item.expression}</span>
              <span className="text-2xl text-emerald-400 font-light tracking-wide">{item.result}</span>
            </button>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
          <button
            onClick={onClear}
            className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default History;