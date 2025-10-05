export type ShotType =
  | 'forehand'
  | 'backhand'
  | 'volley'
  | 'lob'
  | 'chiquita'
  | 'back-glass'
  | 'smash'
  | 'serve'
  | 'bandeja'
  | 'vibora'
  | 'drop'
  | 'smash-out';

export type TechnicalExecution = 'perfect-shot' | 'good-shot' | 'minor-error' | 'major-error';

export type Outcome = 'winner' | 'loser' | 'in' | 'out';

export type CourtPosition = 'good' | 'bad' | 'strategic-change' | 'wall' | 'baseline' | 'net';

export type MatchContext = 'routine shot' | 'normal play' | 'crucial-point' | 'under-pressure';

const BASE_SHOT_VALUES: Record<ShotType, number> = {
  'forehand': 1.0,
  'backhand': 1.0,
  'volley': 1.2,
  'lob': 1.3,
  'chiquita': 1.4,
  'back-glass': 1.5,
  'smash': 1.6,
  'serve': 1.0,
  'bandeja': 1.3,
  'vibora': 1.4,
  'drop': 1.2,
  'smash-out': 1.6,
};

const TECHNICAL_MULTIPLIERS: Record<TechnicalExecution, number> = {
  'perfect-shot': 2.0,
  'good-shot': 1.5,
  'minor-error': 0.8,
  'major-error': 0.3,
};

const OUTCOME_MULTIPLIERS: Record<Outcome, number> = {
  'winner': 2.0,
  'in': 1.0,
  'loser': -1.5,
  'out': -1.0,
};

const POSITION_MULTIPLIERS: Record<CourtPosition, number> = {
  'good': 1.0,
  'bad': 1.3,
  'strategic-change': 1.2,
  'wall': 1.1,
  'baseline': 1.0,
  'net': 1.2,
};

const CONTEXT_MULTIPLIERS: Record<MatchContext, number> = {
  'routine': 0.8,
  'normal': 1.0,
  'crucial-point': 1.5,
  'under-pressure': 1.8,
};

export function getOpponentDifferentialMultiplier(
  playerRating: number,
  opponentRating: number,
  isVictory: boolean
): number {
  const diff = opponentRating - playerRating;

  if (isVictory) {
    if (diff >= 300) return 2.0;
    if (diff >= 200) return 1.7;
    if (diff >= 100) return 1.4;
    if (diff >= 50) return 1.2;
    if (diff >= 1) return 1.1;
    if (diff === 0) return 1.0;
    if (diff >= -49) return 0.9;
    if (diff >= -99) return 0.8;
    if (diff >= -199) return 0.7;
    if (diff >= -299) return 0.6;
    return 0.5;
  } else {
    if (diff >= 300) return 0.5;
    if (diff >= 200) return 0.6;
    if (diff >= 100) return 0.7;
    if (diff >= 50) return 0.8;
    if (diff >= 1) return 0.9;
    if (diff === 0) return 1.0;
    if (diff >= -49) return 1.1;
    if (diff >= -99) return 1.2;
    if (diff >= -199) return 1.4;
    if (diff >= -299) return 1.7;
    return 2.0;
  }
}

export interface ShotConfig {
  shotType: ShotType;
  technicalExecution: TechnicalExecution;
  outcome: Outcome;
  courtPosition: CourtPosition;
  matchContext: MatchContext;
  consecutiveShots: number;
  playerRating: number;
  opponentRating: number;
}

export function calculateRatingChange(config: ShotConfig): { change: number; multiplier: number } {
  const isVictory = config.outcome === 'winner' || config.outcome === 'in';

  const baseValue = BASE_SHOT_VALUES[config.shotType];
  const technicalMult = TECHNICAL_MULTIPLIERS[config.technicalExecution];
  const outcomeMult = OUTCOME_MULTIPLIERS[config.outcome];
  const positionMult = POSITION_MULTIPLIERS[config.courtPosition];
  const contextMult = CONTEXT_MULTIPLIERS[config.matchContext];
  const consecutiveMult = 1 + (config.consecutiveShots - 1) * 0.1;
  const opponentMult = getOpponentDifferentialMultiplier(
    config.playerRating,
    config.opponentRating,
    isVictory
  );

  const totalMultiplier =
    technicalMult *
    positionMult *
    contextMult *
    consecutiveMult *
    opponentMult;

  const rawChange = baseValue * outcomeMult * totalMultiplier;

  const finalChange = Math.round(rawChange * 100) / 100;

  return {
    change: finalChange,
    multiplier: Math.round(totalMultiplier * 100) / 100,
  };
}

export const SHOT_TYPES: { value: ShotType; label: string }[] = [
  { value: 'forehand', label: 'Forehand (Topspin)' },
  { value: 'backhand', label: 'Backhand (Backspin)' },
  { value: 'volley', label: 'Volley' },
  { value: 'lob', label: 'Lob' },
  { value: 'chiquita', label: 'Chiquita' },
  { value: 'back-glass', label: 'Back Glass' },
  { value: 'smash', label: 'Smash' },
  { value: 'serve', label: 'Serve' },
  { value: 'bandeja', label: 'Bandeja' },
  { value: 'vibora', label: 'Vibora' },
  { value: 'drop', label: 'Drop' },
  { value: 'smash-out', label: 'Smash Out' },
];

export const TECHNICAL_EXECUTIONS: { value: TechnicalExecution; label: string }[] = [
  { value: 'perfect', label: 'Perfect' },
  { value: 'good', label: 'Good' },
  { value: 'minor-error', label: 'Minor Error' },
  { value: 'major-error', label: 'Major Error' },
];

export const OUTCOMES: { value: Outcome; label: string }[] = [
  { value: 'winner', label: 'Winner' },
  { value: 'in', label: 'In' },
  { value: 'loser', label: 'Loser' },
  { value: 'out', label: 'Out' },
];

export const COURT_POSITIONS: { value: CourtPosition; label: string }[] = [
  { value: 'good', label: 'Good' },
  { value: 'bad', label: 'Bad' },
  { value: 'strategic-change', label: 'Strategic Change' },
  { value: 'wall', label: 'Wall' },
  { value: 'baseline', label: 'Baseline' },
  { value: 'net', label: 'Net' },
];

export const MATCH_CONTEXTS: { value: MatchContext; label: string }[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'normal', label: 'Normal' },
  { value: 'crucial-point', label: 'Crucial Point' },
  { value: 'under-pressure', label: 'Under Pressure' },
];

export const RATING_LEVELS = [
  { value: 1000, label: '1000 - Beginner' },
  { value: 1300, label: '1300 - High Beginner' },
  { value: 1400, label: '1400 - Low Intermediate' },
  { value: 1500, label: '1500 - Intermediate' },
  { value: 1600, label: '1600 - High Intermediate' },
  { value: 1800, label: '1800 - Advanced' },
  { value: 2000, label: '2000 - High Advanced' },
  { value: 2200, label: '2200 - Competition Elite' },
];
