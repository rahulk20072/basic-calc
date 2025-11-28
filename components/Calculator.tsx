import React, { useState, useEffect } from 'react';
import { CalculatorState, ButtonVariant, HistoryItem } from '../types';
import Display from './Display';
import Button from './Button';
import History from './History';
import AIView from './AIModal';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

type Tab = 'standard' | 'scientific' | 'history' | 'ai';

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

  const [activeTab, setActiveTab] = useState<Tab>('standard');

  // Sync isScientific state with tab
  useEffect(() => {
    if (activeTab === 'scientific') {
      setState(s => ({ ...s, isScientific: true }));
    } else if (activeTab === 'standard') {
      setState(s => ({ ...s, isScientific: false }));
    }
  }, [activeTab]);

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
    // Switch back to standard view to see/use the value
    setActiveTab('standard');
  };

  const handleAIResult = (result: string) => {
    setState(prev => ({
      ...prev,
      currentValue: result,
      overwriteNext: true,
      error: null
    }));
    // Switch back to standard view to see the result
    setActiveTab('standard');
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Allow keyboard input only on calc tabs
      if (activeTab === 'history' || activeTab === 'ai') return;

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
  }, [activeTab]); // Re-bind when tab changes

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-purple-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-indigo-900/10 blur-[120px] pointer-events-none"></div>

      {/* Navigation Tabs */}
      <div className="flex justify-center p-4 z-20 shrink-0">
        <div className="flex bg-slate-900/80 p-1.5 rounded-full border border-slate-800 shadow-lg backdrop-blur-md">
           <button 
             onClick={() => setActiveTab('standard')}
             className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'standard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             Standard
           </button>
           <button 
             onClick={() => setActiveTab('scientific')}
             className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'scientific' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             Scientific
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             History
           </button>
           <button 
             onClick={() => setActiveTab('ai')}
             className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
             Ask AI
           </button>
        </div>
      </div>

      {/* Display Area */}
      <div className="flex-grow-[3] flex flex-col justify-end pb-4 px-8 z-10 shrink-0 min-h-[30%]">
        <Display 
          value={state.currentValue} 
          expression={state.previousValue ? `${state.previousValue} ${state.operator}` : null} 
          operator={state.operator}
        />
      </div>

      {/* Content Area (Switches based on Tab) */}
      <div className="flex-grow-[7] flex flex-col z-10 bg-slate-900/30 border-t border-slate-800/50 backdrop-blur-sm rounded-t-[3rem] overflow-hidden shadow-2xl">
        
        {/* Calculator Keypads */}
        {(activeTab === 'standard' || activeTab === 'scientific') && (
          <div className={`grid gap-3 sm:gap-4 p-6 w-full h-full ${state.isScientific ? 'grid-cols-5' : 'grid-cols-4'} animate-in slide-in-from-bottom-10 fade-in duration-300`}>
            
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
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <History 
            history={state.history} 
            onSelect={handleHistorySelect} 
            onClear={() => setState(p => ({...p, history: []}))}
          />
        )}

        {/* AI View */}
        {activeTab === 'ai' && (
          <AIView 
            isActive={activeTab === 'ai'}
            onResult={handleAIResult}
          />
        )}

      </div>
    </div>
  );
};

export default Calculator;