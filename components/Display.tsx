import React, { useEffect, useRef, useMemo } from 'react';

interface DisplayProps {
  value: string;
  expression: string | null;
  operator: string | null;
}

const Display: React.FC<DisplayProps> = ({ value, expression, operator }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [value]);

  const operationText = useMemo(() => {
    if (!operator) return '\u00A0';
    switch(operator) {
      case '+': return 'Adding';
      case '-': return 'Subtracting';
      case '×': return 'Multiplying';
      case '÷': return 'Dividing';
      case '^': return 'Power';
      default: return 'Calculating';
    }
  }, [operator]);

  return (
    <div className="flex flex-col items-end justify-end w-full h-full gap-2">
      <div className="flex flex-col items-end opacity-60">
        <span className="text-emerald-400 text-lg sm:text-xl font-medium tracking-widest uppercase mb-1">
          {operator ? operationText : '\u00A0'}
        </span>
        <div className="text-slate-300 text-3xl sm:text-5xl font-light text-right break-all h-14">
          {expression || '\u00A0'}
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto overflow-y-hidden text-right whitespace-nowrap scrollbar-hide pb-2"
      >
        <span className="text-[5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem] leading-none font-thin text-white tracking-tighter font-sans">
          {value}
        </span>
      </div>
    </div>
  );
};

export default Display;