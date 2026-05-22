import React from 'react';
import { ComarcaInfo, GameStatus, PlayMode } from '../types/game';

interface OptionsPanelProps {
  options: ComarcaInfo[];
  selectedId: string | null;
  currentTargetId: string | null;
  status: GameStatus;
  playMode: PlayMode;
  onSelectOption: (id: string) => void;
}

export function OptionsPanel({ options, selectedId, currentTargetId, status, playMode, onSelectOption }: OptionsPanelProps) {
  if (status === 'idle' || status === 'finished' || options.length === 0) {
    return (
       <footer className="h-24 md:h-48 bg-white border-t border-neutral-200 p-4 md:p-8 shrink-0 flex items-center justify-center text-neutral-400 font-bold uppercase tracking-widest text-sm z-20 relative shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
         Esperant inici de partida...
       </footer>
    );
  }

  return (
    <footer className="h-auto md:h-48 bg-white border-t border-neutral-200 p-4 md:p-8 shrink-0 z-20 relative shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 h-full">
        {options.map((option, index) => {
          let buttonClasses = "relative group overflow-hidden bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-200 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 py-6 md:py-0";
          let indexClasses = "absolute top-3 left-4 text-[10px] font-black text-neutral-300";
          let textClasses = "text-xl md:text-2xl font-black tracking-tight text-neutral-800 group-hover:text-black uppercase px-2 text-center";
          let highlightBar = null;

          if (status === 'answering') {
            const isCorrect = option.id === currentTargetId;
            const isSelected = option.id === selectedId;

            if (isCorrect) {
              buttonClasses = "relative overflow-hidden bg-yellow-400 border-2 border-yellow-500 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all py-6 md:py-0 scale-105 z-10";
              indexClasses = "absolute top-3 left-4 text-[10px] font-black text-yellow-700";
              textClasses = "text-xl md:text-2xl font-black tracking-tight text-yellow-900 uppercase px-2 text-center";
              highlightBar = <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-600"></div>;
            } else if (isSelected && !isCorrect) {
              buttonClasses = "relative overflow-hidden bg-red-400 border-2 border-red-500 rounded-2xl flex flex-col items-center justify-center shadow-inner opacity-90 transition-all py-6 md:py-0 scale-95";
              indexClasses = "absolute top-3 left-4 text-[10px] font-black text-red-700";
              textClasses = "text-xl md:text-2xl font-black tracking-tight text-red-900 uppercase px-2 text-center";
              highlightBar = <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600"></div>;
            } else {
               buttonClasses = "relative overflow-hidden bg-neutral-100 border-2 border-neutral-200 rounded-2xl flex flex-col items-center justify-center opacity-50 transition-all py-6 md:py-0";
               textClasses = "text-xl md:text-2xl font-black tracking-tight text-neutral-400 uppercase px-2 text-center";
            }
          }

          const numberStr = String(index + 1).padStart(2, '0');

          return (
            <button
              key={option.id}
              disabled={status === 'answering'}
              onClick={() => onSelectOption(option.id)}
              className={buttonClasses}
            >
              <span className={indexClasses}>{numberStr}</span>
              <span className={textClasses}>{playMode === 'capital' ? option.capital : option.name}</span>
              {highlightBar}
            </button>
          );
        })}
      </div>
    </footer>
  );
}
