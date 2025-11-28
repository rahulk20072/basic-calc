import React from 'react';
import Calculator from './components/Calculator';

function App() {
  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden text-slate-100 selection:bg-indigo-500/30">
      <Calculator />
    </div>
  );
}

export default App;