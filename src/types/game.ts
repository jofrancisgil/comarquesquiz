export type GameStatus = 'idle' | 'playing' | 'answering' | 'finished';

export interface ComarcaInfo {
  id: string;
  name: string;
  capital: string;
}

export type PlayMode = 'comarca' | 'capital';

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  answeredCorrectly: boolean;
}

export interface Room {
  code: string;
  host: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  state: any;
}

export interface GameState {
  status: GameStatus;
  score: number;
  streak: number;
  remainingIds: string[];
  currentTargetId: string | null;
  options: ComarcaInfo[];
  selectedId: string | null;
  playMode: PlayMode;
  room?: Room | null;
  isHost?: boolean;
}
