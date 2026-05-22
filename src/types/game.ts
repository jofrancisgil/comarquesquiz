export type GameStatus = 'idle' | 'playing' | 'answering' | 'finished' | 'round_results';

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
  hasAnswered: boolean;
}

export interface Room {
  code: string;
  host: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'round_results' | 'finished';
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
  totalQuestions?: number;
}
