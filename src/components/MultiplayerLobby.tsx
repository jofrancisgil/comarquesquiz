import React, { useState } from 'react';
import { Users, UserPlus, Play, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { Room } from '../types/game';

export interface MultiplayerLobbyProps {
  room: Room | null;
  isHost: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (code: string, name: string) => void;
  onStartMultiplayerGame: (mode: 'comarca' | 'capital', numQuestions: number) => void;
  onLeaveRoom: () => void;
  onNextRound?: () => void;
}

export function MultiplayerLobby({ room, isHost, onCreateRoom, onJoinRoom, onStartMultiplayerGame, onLeaveRoom, onNextRound }: MultiplayerLobbyProps) {
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [view, setView] = useState<'menu' | 'join'>('menu');
  const [selectedNum, setSelectedNum] = useState<number>(43);

  if (!room) {
    if (view === 'join') {
      return (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Unir-se a una sala</h3>
          <input 
            type="text" 
            placeholder="Codi de la Sala (EX: A1B2)" 
            value={joinCode} 
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().trim())}
            maxLength={4}
            className="p-3 border border-neutral-300 rounded-xl font-mono text-center text-xl uppercase"
          />
          <input 
            type="text" 
            placeholder="El teu nom" 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)}
            className="p-3 border border-neutral-300 rounded-xl font-medium"
          />
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setView('menu')}
              className="flex-1 px-4 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-xl font-bold transition-colors"
            >
              TORNAR
            </button>
            <button 
              onClick={() => {
                if (joinCode && playerName) onJoinRoom(joinCode, playerName);
              }}
              disabled={!joinCode || !playerName}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
            >
              UNIR-SE
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-3">
         <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight flex items-center gap-2">
           <Users className="w-5 h-5 text-indigo-600" /> Mode Multijugador
         </h3>
         <p className="text-sm text-neutral-500 mb-2">Crea una sala per projectar a classe i que els alumnes responguin, o uneix-te a una sala existent.</p>
         <button 
           onClick={onCreateRoom}
           className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl font-bold transition-colors"
         >
           <UserPlus className="w-5 h-5" /> CREAR SALA (MESTRE)
         </button>
         <button 
           onClick={() => setView('join')}
           className="w-full flex items-center justify-center gap-2 p-3 bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-600 rounded-xl font-bold transition-colors"
         >
           <Users className="w-5 h-5" /> UNIR-SE (ALUMNE)
         </button>
      </div>
    );
  }

  // Inside a room
  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> SALA ACTUAL
          </h3>
          <div className="text-3xl font-black font-mono tracking-widest text-indigo-600 mt-1">{room.code}</div>
        </div>
        <button onClick={onLeaveRoom} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Sortir de la sala">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex-1 max-h-[200px] overflow-y-auto">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Jugadors Connectats ({room.players.length})</h4>
        {room.players.length === 0 ? (
          <div className="text-sm text-neutral-500 italic text-center py-4">Esperant jugadors...</div>
        ) : (
          <ul className="space-y-2">
            {room.players.map(p => (
              <li key={p.id} className="flex justify-between items-center text-sm font-medium bg-white p-2 rounded border border-neutral-100 shadow-sm">
                <span>{p.name} <span className="text-xs text-neutral-400">(Score: {p.score})</span></span>
                {room.status === 'playing' ? (
                   p.hasAnswered ? <div className="w-3 h-3 rounded-full bg-neutral-400"></div> : <div className="w-4 h-4 rounded-full border-2 border-dashed border-neutral-300 animate-spin-slow"></div>
                ) : room.status === 'round_results' ? (
                   p.answeredCorrectly ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isHost && room.status === 'waiting' && (
        <div className="flex flex-col gap-3 mt-2 border-t pt-4">
           <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-1">Nombre de preguntes</span>
           <div className="flex gap-2 mb-2">
             {[10, 20, 30, 43].map(num => (
               <button 
                 key={num}
                 onClick={() => setSelectedNum(num)}
                 className={`flex-1 py-1 rounded-lg text-sm font-bold transition-colors ${selectedNum === num ? 'bg-indigo-600 text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}
               >
                 {num === 43 ? 'Totes' : num}
               </button>
             ))}
           </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onStartMultiplayerGame('comarca', selectedNum)}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 text-xs"
            >
              <Play className="w-4 h-4" /> INICIAR (COMARCA)
            </button>
            <button 
              onClick={() => onStartMultiplayerGame('capital', selectedNum)}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 text-xs"
            >
              <Play className="w-4 h-4" /> INICIAR (CAPITAL)
            </button>
          </div>
        </div>
      )}

      {isHost && room.status === 'round_results' && onNextRound && (
        <button 
          onClick={onNextRound}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
        >
          SEGÜENT PREGUNTA <Play className="w-4 h-4" />
        </button>
      )}

      {isHost && room.status === 'finished' && (
        <div className="flex flex-col gap-2">
          <div className="text-center font-bold text-green-600">¡Partida Completada!</div>
          <div className="flex gap-2">
            <button 
              onClick={() => onStartMultiplayerGame('comarca', selectedNum)}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 text-xs"
            >
              <Play className="w-4 h-4" /> REINICIAR (COMARCA)
            </button>
            <button 
              onClick={() => onStartMultiplayerGame('capital', selectedNum)}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 text-xs"
            >
              <Play className="w-4 h-4" /> REINICIAR (CAPITAL)
            </button>
          </div>
        </div>
      )}
      
      {!isHost && room.status === 'waiting' && (
        <div className="text-center p-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-sm">
          Esperant que el mestre iniciï la partida...
        </div>
      )}
    </div>
  );
}
