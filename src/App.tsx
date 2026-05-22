import React, { useEffect, useState, useRef } from 'react';
import { MapComponent } from './components/MapComponent';
import { GameStats } from './components/GameStats';
import { OptionsPanel } from './components/OptionsPanel';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { getPreparedGeoJSON, getAllComarcas, shuffleArray, generateOptions } from './utils/gameLogic';
import { GameState, ComarcaInfo, PlayMode, Room } from './types/game';
import { io, Socket } from 'socket.io-client';

export default function App() {
  const [geoData, setGeoData] = useState<any>(null);
  const [allComarcas, setAllComarcas] = useState<ComarcaInfo[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    score: 0,
    streak: 0,
    remainingIds: [],
    currentTargetId: null,
    options: [],
    selectedId: null,
    playMode: 'comarca',
    room: null,
    isHost: false,
  });
  
  const [feedback, setFeedback] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on('roomUpdate', (roomData: Room) => {
      setGameState(prev => {
        let newScore = prev.score;
        let newStreak = prev.streak;

        // If playing as guest, sync our local status with the room status
        const isHost = prev.isHost ?? false;
        
        // Update local score from room player
        const me = roomData.players.find(p => p.id === s.id);
        if (me) {
           newScore = me.score;
           newStreak = me.streak;
        }

        if (!isHost && roomData.status === 'playing' && roomData.state) {
            const { mode, allComarcas: roomComarcas, currentIndex } = roomData.state;
            const currentTargetId = roomComarcas[currentIndex] || null;
            // Only update options if it's a new question
            const options = prev.currentTargetId !== currentTargetId && currentTargetId ? generateOptions(currentTargetId, allComarcas) : prev.options;
            
            return {
                ...prev,
                room: roomData,
                status: 'playing',
                playMode: mode,
                currentTargetId,
                options: options.length > 0 ? options : prev.options,
                score: newScore,
                streak: newStreak
            };
        }
        
        if (!isHost && roomData.status === 'round_results') {
           return { ...prev, room: roomData, status: 'round_results' };
        }
        
        if (!isHost && roomData.status === 'finished') {
           return { ...prev, room: roomData, status: 'finished' };
        }

        if (isHost && roomData.status === 'playing' && roomData.state) {
            const { mode, allComarcas: roomComarcas, currentIndex } = roomData.state;
            const currentTargetId = roomComarcas[currentIndex] || null;
            return { ...prev, room: roomData, status: 'playing', playMode: mode, currentTargetId };
        }
        
        if (isHost && (roomData.status === 'round_results' || roomData.status === 'finished')) {
            return { ...prev, room: roomData, status: roomData.status };
        }

        return { ...prev, room: roomData, score: newScore, streak: newStreak };
      });
    });

    s.on('roomDestroyed', () => {
       setGameState(prev => ({ ...prev, room: null, isHost: false, status: 'idle' }));
       alert("El mestre ha tancat la sala.");
    });

    return () => { s.disconnect(); };
  }, [allComarcas]);

  useEffect(() => {
    const data = getPreparedGeoJSON();
    if (data) {
      setGeoData(data);
      setAllComarcas(getAllComarcas(data));
    }
  }, []);

  const handleCreateRoom = () => {
    socket?.emit('createRoom', (res: { code: string }) => {
       setGameState(prev => ({ ...prev, isHost: true }));
    });
  };

  const handleJoinRoom = (code: string, name: string) => {
    socket?.emit('joinRoom', { code, playerName: name }, (res: any) => {
       if (res.error) {
          alert(res.error);
       } else {
          setGameState(prev => ({ ...prev, isHost: false }));
       }
    });
  };

  const handleLeaveRoom = () => {
    socket?.disconnect();
    const s = io();
    setSocket(s);
    setGameState(prev => ({ 
       ...prev, 
       room: null, 
       isHost: false, 
       status: 'idle',
       remainingIds: [],
       currentTargetId: null,
       selectedId: null,
       options: []
    }));
    setFeedback(null);
  };

  const startMultiplayerGame = (mode: PlayMode, numQuestions: number = 43) => {
    if (allComarcas.length === 0 || !gameState.room) return;
    let shuffledIds = shuffleArray(allComarcas.map((c) => c.id));
    if (numQuestions < 43) {
       shuffledIds = shuffledIds.slice(0, numQuestions);
    }
    socket?.emit('startGame', { code: gameState.room.code, allComarcas: shuffledIds, mode });
  };

  const startGame = (mode: PlayMode, numQuestions: number = 43) => {
    if (allComarcas.length === 0) return;
    
    let shuffledIds: string[] = shuffleArray(allComarcas.map((c: ComarcaInfo) => c.id));
    if (numQuestions < 43) {
       shuffledIds = shuffledIds.slice(0, numQuestions);
    }
    
    setGameState(prev => ({
      ...prev,
      status: 'idle',
      score: 0,
      streak: 0,
      remainingIds: shuffledIds,
      currentTargetId: null,
      options: [],
      selectedId: null,
      playMode: mode,
      totalQuestions: shuffledIds.length
    }));
    setFeedback(null);
    
    setTimeout(() => {
      nextRound(shuffledIds);
    }, 100);
  };

  const nextRound = (currentRemaining: string[]) => {
    if (currentRemaining.length === 0) {
      setGameState(prev => ({ ...prev, status: 'finished', remainingIds: [] }));
      setFeedback("¡Molt bé! Has completat totes les comarques.");
      return;
    }

    const nextTargetId = currentRemaining[0];
    const newRemaining = currentRemaining.slice(1);
    const nextOptions = generateOptions(nextTargetId, allComarcas);

    setGameState(prev => ({
      ...prev,
      status: 'playing',
      remainingIds: newRemaining,
      currentTargetId: nextTargetId,
      options: nextOptions,
      selectedId: null,
    }));
    setFeedback(null);
  };

  const handleSelectOption = (id: string) => {
    if (gameState.status !== 'playing') return;

    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    const isCorrect = id === gameState.currentTargetId;

    if (gameState.room) {
      // Send answer to server
      socket?.emit('submitAnswer', { code: gameState.room.code, isCorrect });
      
      // If student, just show result and wait for host to advance round
      if (!gameState.isHost) {
         setGameState(prev => ({
            ...prev,
            status: 'answering',
            selectedId: id,
         }));
         setFeedback(isCorrect ? '¡Molt bé! Esperant el mestre...' : 'Error. Esperant el mestre...');
         return;
      }
    }

    setGameState(prev => ({
      ...prev,
      status: 'answering',
      selectedId: id,
      score: isCorrect ? prev.score + (10 * (prev.streak + 1)) : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));

    setFeedback(isCorrect ? '¡Molt bé!' : 'Error.');

    timeoutRef.current = setTimeout(() => {
        setGameState(current => {
            nextRound(current.remainingIds);
            return current;
        });
    }, isCorrect ? 1500 : 2500);
  };

  const handleNextMultiplayerRound = () => {
    if (gameState.room && gameState.isHost) {
      socket?.emit('nextRound', { code: gameState.room.code });
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-50 flex flex-col font-sans text-neutral-900 select-none overflow-hidden relative">
      <header className="h-20 md:h-24 px-4 md:px-8 flex items-center justify-between border-b border-neutral-200 bg-white shadow-sm z-20 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-bold text-neutral-400">
            Exploració Geogràfica
          </span>
          <h1 className="text-xl md:text-3xl font-black tracking-tighter text-neutral-900 leading-tight">
            COMARQUES DE <span className="text-yellow-500">CAT</span><span className="text-red-600">ALUNYA</span>
          </h1>
        </div>
        
        <div className="flex gap-2 md:gap-6 items-center">
          {(gameState.status !== 'idle' || gameState.room) && (
            <button 
               onClick={handleLeaveRoom} // Which resets to idle.
               className="bg-neutral-800 hover:bg-neutral-900 text-white px-3 md:px-5 py-2 md:py-3 rounded-[12px] md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-colors shrink-0"
               title="Sortir / Tornar enrere"
            >
               Sortir
            </button>
          )}
          <div className="bg-neutral-100 px-3 md:px-6 py-1 md:py-2 rounded-[12px] md:rounded-2xl border border-neutral-200 flex flex-col items-center min-w-[80px] md:min-w-[120px]">
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-neutral-500">Puntuació</span>
            <span className="text-lg md:text-2xl font-black tabular-nums">{gameState.score.toString().padStart(4, '0')}</span>
          </div>
          <div className="bg-indigo-600 px-3 md:px-6 py-1 md:py-2 rounded-[12px] md:rounded-2xl border border-indigo-700 flex flex-col items-center min-w-[60px] md:min-w-[100px] text-white">
            <span className="text-[8px] md:text-[10px] uppercase font-bold opacity-80">Racha</span>
            <span className="text-lg md:text-2xl font-black tabular-nums">x{gameState.streak}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 flex flex-col shrink-0 border-r border-neutral-200 bg-white/50 overflow-y-auto">
          <GameStats 
            score={gameState.score}
            streak={gameState.streak}
            remaining={gameState.room && gameState.room.state ? (gameState.room.state.allComarcas.length - gameState.room.state.currentIndex) : gameState.remainingIds.length}
            total={gameState.room ? (gameState.room.state?.allComarcas?.length || 0) : (gameState.totalQuestions || allComarcas.length)}
            status={gameState.status}
            feedback={feedback}
            playMode={gameState.playMode}
            inRoom={!!gameState.room}
            onStart={startGame}
          />
          <div className="p-4 border-t border-neutral-200">
            <MultiplayerLobby
               room={gameState.room || null}
               isHost={gameState.isHost || false}
               onCreateRoom={handleCreateRoom}
               onJoinRoom={handleJoinRoom}
               onStartMultiplayerGame={startMultiplayerGame}
               onLeaveRoom={handleLeaveRoom}
               onNextRound={handleNextMultiplayerRound}
            />
          </div>
        </div>

        <div className="flex-1 bg-neutral-100 relative overflow-hidden flex flex-col">
           <MapComponent 
             geoData={geoData}
             currentTargetId={gameState.currentTargetId}
             selectedId={gameState.selectedId}
             status={gameState.status}
           />
           
           {gameState.status === 'playing' && (
             <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none w-max max-w-[90%] transition-transform duration-300">
               <div className="bg-white/90 backdrop-blur px-6 py-2 md:px-8 md:py-3 rounded-full border border-neutral-200 shadow-xl">
                 <span className="text-[16px] md:text-xl font-black uppercase tracking-tighter italic text-neutral-800">
                   {gameState.playMode === 'capital' ? '¿Quina és la capital de la comarca marcada?' : '¿Quina comarca és la marcada?'}
                 </span>
               </div>
             </div>
           )}
           
           <div className="absolute bottom-2 md:bottom-4 right-4 text-[10px] font-mono text-neutral-400 opacity-50 z-[400] pointer-events-none">
             V.2.0.4 — GEO-CAT_ENGINE
           </div>
        </div>
      </main>

      {!gameState.isHost && (
        <OptionsPanel 
            options={gameState.options}
            selectedId={gameState.selectedId}
            currentTargetId={gameState.currentTargetId}
            status={gameState.status}
            playMode={gameState.playMode}
            onSelectOption={handleSelectOption}
        />
      )}
    </div>
  );
}
