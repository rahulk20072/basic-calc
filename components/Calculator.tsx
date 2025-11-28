import React, { useState, useEffect } from 'react';
import { CalculatorState, ButtonVariant, HistoryItem } from '../types';
import Display from './Display';
import Button from './Button';
import History from './History';
import AIModal from './AIModal';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    currentValue: '0',
    previousValue: null,
    operator: null,
    overwriteNext: false,
    history: [],
    isScientific: false,
    error: null,
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // --- Logic Helpers ---

  const handleNumber = (num: string) => {
    setState(prev => {
      if (prev.overwriteNext) {
        return {
          ...prev,
          currentValue: num === '00' ? '0' : num,
          overwriteNext: false,
          error: null
        };
      }
      if (prev.currentValue === '0' && num !== '.') {
        if (num === '00') return prev; // Don't add 00 to 0
        return { ...prev, currentValue: num, error: null };
      }
      if (num === '.' && prev.currentValue.includes('.')) {
        return prev;
      }
      // Limit length
      if (prev.currentValue.replace('.', '').length >= 15) return prev;

      return {
        ...prev,
        currentValue: prev.currentValue + num,
        error: null
      };
    });
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': 
        if (b === 0) throw new Error("Divide by zero");
        return a / b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleOperator = (op: string) => {
    setState(prev => {
      if (prev.operator && prev.overwriteNext) {
        return { ...prev, operator: op };
      }

      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: prev.currentValue,
          operator: op,
          overwriteNext: true,
          error: null
        };
      }

      try {
        const result = calculate(
          parseFloat(prev.previousValue),
          parseFloat(prev.currentValue),
          prev.operator!
        );
        return {
          ...prev,
          previousValue: String(result),
          currentValue: String(result),
          operator: op,
          overwriteNext: true,
          error: null
        };
      } catch (err) {
        return { ...prev, currentValue: 'Error', error: 'Error', overwriteNext: true };
      }
    });
  };

  const handleEquals = () => {
    setState(prev => {
      if (!prev.operator || prev.previousValue === null) return prev;

      try {
        const result = calculate(
          parseFloat(prev.previousValue),
          parseFloat(prev.currentValue),
          prev.operator
        );

        const formattedResult = parseFloat(result.toPrecision(12)).toString();

        const newHistoryItem: HistoryItem = {
          id: generateId(),
          expression: `${prev.previousValue} ${prev.operator} ${prev.currentValue} =`,
          result: formattedResult,
          timestamp: Date.now()
        };

        return {
          ...prev,
          currentValue: formattedResult,
          previousValue: null,
          operator: null,
          overwriteNext: true,
          history: [...prev.history, newHistoryItem],
          error: null
        };
      } catch (err) {
        return { ...prev, currentValue: 'Error', error: 'Error', overwriteNext: true };
      }
    });
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      currentValue: '0',
      previousValue: null,
      operator: null,
      overwriteNext: false,
      error: null
    }));
  };

  const handleDelete = () => {
    setState(prev => {
      if (prev.overwriteNext) return { ...prev, currentValue: '0', overwriteNext: false };
      if (prev.currentValue.length === 1) return { ...prev, currentValue: '0' };
      return { ...prev, currentValue: prev.currentValue.slice(0, -1) };
    });
  };

  const handleScientific = (func: string) => {
    setState(prev => {
      try {
        const val = parseFloat(prev.currentValue);
        let result = 0;
        switch (func) {
          case 'sin': result = Math.sin(val); break;
          case 'cos': result = Math.cos(val); break;
          case 'tan': result = Math.tan(val); break;
          case '√': 
            if (val < 0) throw new Error("Invalid Input");
            result = Math.sqrt(val); break;
          case 'ln': 
            if (val <= 0) throw new Error("Invalid Input");
            result = Math.log(val); break;
          case 'log': 
            if (val <= 0) throw new Error("Invalid Input");
            result = Math.log10(val); break;
          case 'x²': result = Math.pow(val, 2); break;
          default: return prev;
        }
        
        const formattedResult = parseFloat(result.toPrecision(12)).toString();
        
        return {
          ...prev,
          currentValue: formattedResult,
          overwriteNext: true,
          error: null
        };
      } catch (e) {
        return { ...prev, currentValue: 'Error', error: 'Error', overwriteNext: true };
      }
    });
  };

  const handlePercent = () => {
    setState(prev => {
      const val = parseFloat(prev.currentValue);
      return {
        ...prev,
        currentValue: (val / 100).toString(),
        overwriteNext: true
      };
    });
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setState(prev => ({
      ...prev,
      currentValue: item.result,
      overwriteNext: true
    }));
    setHistoryOpen(false);
  };

  const handleAIResult = (result: string) => {
    setState(prev => ({
      ...prev,
      currentValue: result,
      overwriteNext: true,
      error: null
    }));
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (e.key === '.') handleNumber('.');
      if (e.key === 'Enter') { e.preventDefault(); handleEquals(); }
      if (e.key === '=' && !e.shiftKey) { e.preventDefault(); handleEquals(); }
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') handleClear();
      if (e.key === '+') handleOperator('+');
      if (e.key === '-') handleOperator('-');
      if (e.key === '*') handleOperator('×');
      if (e.key === '/') { e.preventDefault(); handleOperator('÷'); }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-purple-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-indigo-900/10 blur-[120px] pointer-events-none"></div>

      {/* Header Controls */}
      <div className="flex justify-between items-center p-6 z-10 shrink-0 absolute top-0 w-full">
        <button 
          onClick={() => setHistoryOpen(!historyOpen)}
          className={`p-3 rounded-2xl transition-all duration-200 ${historyOpen ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
        </button>
        
        <div className="flex gap-3">
           <button 
             onClick={() => setAiModalOpen(true)}
             className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-purple-900/30"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              <span>Ask AI</span>
           </button>
           <button 
             onClick={() => setState(p => ({...p, isScientific: !p.isScientific}))}
             className={`px-5 py-3 rounded-full font-bold border-2 transition-all ${state.isScientific ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
           >
             Sci
           </button>
        </div>
      </div>

      {/* Display Area - Expanded Size (approx 40% height) */}
      <div className="flex-grow-[4] flex flex-col justify-end pb-8 px-8 z-10 shrink-0 min-h-[35%] pt-20">
        <Display 
          value={state.currentValue} 
          expression={state.previousValue ? `${state.previousValue} ${state.operator}` : null} 
          operator={state.operator}
        />
      </div>

      {/* Buttons Grid - (approx 60% height) */}
      <div className={`flex-grow-[6] grid gap-3 sm:gap-4 p-4 pb-6 z-10 ${state.isScientific ? 'grid-cols-5' : 'grid-cols-4'}`}>
        
        {/* Row 1 */}
        {state.isScientific && <Button label="sin" variant={ButtonVariant.SCIENTIFIC} onClick={() => handleScientific('sin')} />}
        <Button label="AC" variant={ButtonVariant.ACTION} onClick={handleClear} />
        <Button label={state.isScientific ? "√" : "⌫"} variant={state.isScientific ? ButtonVariant.SCIENTIFIC : ButtonVariant.ACTION} onClick={() => state.isScientific ? handleScientific('√') : handleDelete()} />
        <Button label="%" variant={ButtonVariant.ACTION} onClick={handlePercent} />
        <Button label="÷" variant={ButtonVariant.OPERATOR} onClick={() => handleOperator('÷')} />

        {/* Row 2 */}
        {state.isScientific && <Button label="cos" variant={ButtonVariant.SCIENTIFIC} onClick={() => handleScientific('cos')} />}
        <Button label="7" onClick={() => handleNumber('7')} />
        <Button label="8" onClick={() => handleNumber('8')} />
        <Button label="9" onClick={() => handleNumber('9')} />
        <Button label="×" variant={ButtonVariant.OPERATOR} onClick={() => handleOperator('×')} />

        {/* Row 3 */}
        {state.isScientific && <Button label="tan" variant={ButtonVariant.SCIENTIFIC} onClick={() => handleScientific('tan')} />}
        <Button label="4" onClick={() => handleNumber('4')} />
        <Button label="5" onClick={() => handleNumber('5')} />
        <Button label="6" onClick={() => handleNumber('6')} />
        <Button label="-" variant={ButtonVariant.OPERATOR} onClick={() => handleOperator('-')} />

        {/* Row 4 */}
        {state.isScientific && <Button label="ln" variant={ButtonVariant.SCIENTIFIC} onClick={() => handleScientific('ln')} />}
        <Button label="1" onClick={() => handleNumber('1')} />
        <Button label="2" onClick={() => handleNumber('2')} />
        <Button label="3" onClick={() => handleNumber('3')} />
        <Button label="+" variant={ButtonVariant.OPERATOR} onClick={() => handleOperator('+')} />

        {/* Row 5 */}
        {state.isScientific && <Button label="log" variant={ButtonVariant.SCIENTIFIC} onClick={() => handleScientific('log')} />}
        <Button label="0" onClick={() => handleNumber('0')} />
        <Button label="00" onClick={() => handleNumber('00')} />
        <Button label="." onClick={() => handleNumber('.')} />
        <Button label="=" variant={ButtonVariant.EQUALS} onClick={handleEquals} />
      </div>

      {/* History Side Panel */}
      <History 
        history={state.history} 
        onSelect={handleHistorySelect} 
        onClear={() => setState(p => ({...p, history: []}))}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {/* AI Modal */}
      <AIModal 
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onResult={handleAIResult}
      />
    </div>
  );
};

export default Calculator;