import React from 'react';
import { GameStatus, PlayMode } from '../types/game';
import { Play, RefreshCw, Check, X, MapPin } from 'lucide-react';

export interface GameStatsProps {
  score: number;
  streak: number;
  remaining: number;
  total: number;
  status: GameStatus;
  feedback: string | null;
  playMode: PlayMode;
  inRoom: boolean;
  onStart: (mode: PlayMode, numQuestions: number) => void;
}

export function GameStats({ score, streak, remaining, total, status, feedback, playMode, inRoom, onStart }: GameStatsProps) {
  const [selectedNum, setSelectedNum] = React.useState<number>(43);

  return (
    <div className="w-full bg-white/50 p-6 md:p-8 flex flex-col gap-4 md:gap-6 shrink-0">
      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Missió</h2>
        <p className="text-lg font-medium leading-snug text-neutral-800">
          {status === 'idle' ? 'Tria la teva missió per començar.' : (playMode === 'capital' ? 'Identifica la capital de la comarca il·luminada en el mapa.' : 'Identifica la comarca il·luminada en el mapa.')}
        </p>
        
        {status === 'idle' && !inRoom && (
          <div className="mt-4">
             <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Nombre de preguntes</span>
             <div className="flex gap-2">
               {[10, 20, 30, 43].map(num => (
                 <button 
                   key={num}
                   onClick={() => setSelectedNum(num)}
                   className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${selectedNum === num ? 'bg-indigo-600 text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}
                 >
                   {num === 43 ? 'Totes' : num}
                 </button>
               ))}
             </div>
          </div>
        )}

        {status !== 'idle' && (
          <div className="mt-6 flex flex-col px-4 py-3 bg-neutral-100 rounded-xl border border-neutral-200">
            <span className="text-neutral-500 uppercase tracking-wide text-[10px] font-bold">Progrés</span>
            <div className="text-xl font-black text-neutral-800 tabular-nums">
              {total > 0 ? (total - remaining) : 0} <span className="text-sm text-neutral-400 font-bold">/ {total}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-end gap-4 min-h-[120px]">
        {status === 'idle' && !inRoom && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onStart('comarca', selectedNum)}
              className="flex w-full items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black tracking-tight transition-transform hover:scale-105 active:scale-95 shadow-md text-sm md:text-base"
            >
              <Play className="w-5 h-5 fill-current" /> ENDEVINA LA COMARCA
            </button>
            <button
              onClick={() => onStart('capital', selectedNum)}
              className="flex w-full items-center justify-center gap-2 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black tracking-tight transition-transform hover:scale-105 active:scale-95 shadow-md text-sm md:text-base"
            >
              <MapPin className="w-5 h-5 fill-current" /> ENDEVINA LA CAPITAL
            </button>
          </div>
        )}
        
        {status === 'finished' && !inRoom && (
          <div className="flex flex-col gap-4">
            <span className="text-xl font-black text-neutral-800 text-center">¡Partida Completada!</span>
            <button
              onClick={() => onStart(playMode, selectedNum)}
              className="flex w-full items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black tracking-tight transition-transform hover:scale-105 active:scale-95 shadow-md"
            >
              <RefreshCw className="w-5 h-5" /> TORNAR A JUGAR
            </button>
            <button
               onClick={() => onStart(playMode === 'comarca' ? 'capital' : 'comarca', selectedNum)}
               className="flex w-full items-center justify-center gap-2 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-2xl font-bold tracking-tight transition-transform active:scale-95 text-xs md:text-sm"
            >
              CANVIAR A JUGAR PER {playMode === 'comarca' ? 'CAPITAL' : 'COMARCA'}
            </button>
          </div>
        )}

        {(status === 'playing' || status === 'answering') && feedback && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 w-full transition-all duration-300 ${
            feedback.includes('Correcto') || feedback.includes('Molt bé') 
              ? 'bg-green-50 border-green-100' 
              : feedback.includes('Incorrecto') || feedback.includes('Error')
              ? 'bg-red-50 border-red-100'
              : 'bg-white border-neutral-200 opacity-0'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
               feedback.includes('Correcto') || feedback.includes('Molt bé') 
                 ? 'bg-green-500' 
                 : feedback.includes('Incorrecto') || feedback.includes('Error')
                 ? 'bg-red-500'
                 : 'bg-neutral-200 text-neutral-500 hidden'
            }`}>
              {feedback.includes('Correcto') || feedback.includes('Molt bé') ? <Check className="w-5 h-5" /> : null}
              {feedback.includes('Incorrecto') || feedback.includes('Error') ? <X className="w-5 h-5" /> : null}
            </div>
            <div className="flex flex-col justify-center min-h-[32px]">
              <p className={`font-bold text-sm ${
                feedback.includes('Correcto') || feedback.includes('Molt bé') ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
