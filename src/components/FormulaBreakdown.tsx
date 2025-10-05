import { Calculator } from 'lucide-react';
import {
  ShotType,
  TechnicalExecution,
  Outcome,
  CourtPosition,
  MatchContext,
  getOpponentDifferentialMultiplier,
} from '../lib/ratingCalculator';

interface FormulaBreakdownProps {
  shotType: ShotType;
  technicalExecution: TechnicalExecution;
  outcome: Outcome;
  courtPosition: CourtPosition;
  matchContext: MatchContext;
  consecutiveShots: number;
  playerRating: number;
  opponentRating: number;
  calculatedChange: number;
}

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
  'perfect': 2.0,
  'good': 1.5,
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

export default function FormulaBreakdown({
  shotType,
  technicalExecution,
  outcome,
  courtPosition,
  matchContext,
  consecutiveShots,
  playerRating,
  opponentRating,
  calculatedChange,
}: FormulaBreakdownProps) {
  const isVictory = outcome === 'winner' || outcome === 'in';

  const baseValue = BASE_SHOT_VALUES[shotType];
  const technicalMult = TECHNICAL_MULTIPLIERS[technicalExecution];
  const outcomeMult = OUTCOME_MULTIPLIERS[outcome];
  const positionMult = POSITION_MULTIPLIERS[courtPosition];
  const contextMult = CONTEXT_MULTIPLIERS[matchContext];
  const consecutiveMult = 1 + (consecutiveShots - 1) * 0.1;
  const opponentMult = getOpponentDifferentialMultiplier(
    playerRating,
    opponentRating,
    isVictory
  );

  const totalMultiplier = technicalMult * positionMult * contextMult * consecutiveMult * opponentMult;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
        <div className="text-[10px] font-bold text-blue-800 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" />
          Base Calculation
        </div>
        <div className="font-mono text-xs text-gray-700 mb-1.5">
          Rating = Base × Outcome × Multiplier
        </div>
        <div className="font-mono text-sm text-blue-700 font-black">
          {calculatedChange.toFixed(2)} = {baseValue} × {outcomeMult} × {totalMultiplier.toFixed(2)}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="text-[10px] font-bold text-gray-700 mb-3 uppercase tracking-wider">
          Multiplier Components
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 font-medium">Base Shot ({shotType})</span>
            <span className="font-mono font-bold text-gray-900">{baseValue}</span>
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 font-medium">Technical</span>
            <span className="font-mono font-bold text-gray-900">×{technicalMult}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 font-medium">Position</span>
            <span className="font-mono font-bold text-gray-900">×{positionMult}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 font-medium">Context</span>
            <span className="font-mono font-bold text-gray-900">×{contextMult}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 font-medium">Consecutive</span>
            <span className="font-mono font-bold text-gray-900">×{consecutiveMult.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 font-medium">Opponent Diff</span>
            <span className="font-mono font-bold text-gray-900">×{opponentMult.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-300 my-1.5"></div>
          <div className="flex justify-between items-center py-1.5 bg-blue-50 -mx-4 px-4 rounded">
            <span className="text-gray-800 font-bold">Total Multiplier</span>
            <span className="font-mono text-blue-700 font-black">×{totalMultiplier.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="text-[10px] font-bold text-gray-700 mb-3 uppercase tracking-wider">
          Opponent Differential
        </div>
        <div className="text-xs space-y-1.5">
          <div className="flex justify-between py-1">
            <span className="text-gray-600 font-medium">Player Rating</span>
            <span className="font-mono font-bold text-gray-900">{playerRating}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600 font-medium">Opponent Rating</span>
            <span className="font-mono font-bold text-gray-900">{opponentRating}</span>
          </div>
          <div className="flex justify-between py-1 bg-slate-50 -mx-4 px-4 rounded">
            <span className="text-gray-700 font-bold">Differential</span>
            <span className={`font-mono font-black ${opponentRating > playerRating ? 'text-red-600' : 'text-green-600'}`}>
              {opponentRating > playerRating ? '+' : ''}{opponentRating - playerRating}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 leading-relaxed italic bg-gray-50 p-2 rounded">
            {isVictory ?
              (opponentRating > playerRating ?
                'Beating higher-rated opponent increases gain' :
                'Beating lower-rated opponent reduces gain') :
              (opponentRating > playerRating ?
                'Losing to higher-rated opponent reduces loss' :
                'Losing to lower-rated opponent increases loss')
            }
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-4 border-2 border-slate-600">
        <div className="text-[10px] font-bold text-slate-300 mb-2 uppercase tracking-wider">
          Final Result
        </div>
        <div className="text-2xl font-black text-white">
          {calculatedChange >= 0 ? '+' : ''}{calculatedChange.toFixed(2)} pts
        </div>
        <div className="text-xs text-slate-300 mt-1 font-mono">
          {playerRating} → {Math.round(playerRating + calculatedChange)}
        </div>
      </div>
    </div>
  );
}
