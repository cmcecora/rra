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
  'optimal': 2.0,           // +1 point bonus multiplier (1.0 base + 1.0 bonus)
  'strategic-change': 1.5,  // +0.5 points
  'poor': 0.5,              // reduces positive points by 50%
  'out-of-position': 1.0,   // no bonus on successful shots
};

const CONTEXT_MULTIPLIERS: Record<MatchContext, number> = {
  'routine shot': 0.8,
  'normal play': 1.0,
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-gray-800">Formula Breakdown</h4>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Base Calculation
          </div>
          <div className="font-mono text-sm text-gray-800 mb-2">
            Rating Change = Base Value × Outcome × Total Multiplier
          </div>
          <div className="font-mono text-sm text-indigo-600 font-semibold">
            {calculatedChange.toFixed(2)} = {baseValue} × {outcomeMult} × {totalMultiplier.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Multiplier Components
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Shot Value ({shotType}):</span>
              <span className="font-mono font-semibold text-gray-900">{baseValue}</span>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Technical Execution:</span>
              <span className="font-mono font-semibold text-gray-900">×{technicalMult}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Court Position:</span>
              <span className="font-mono font-semibold text-gray-900">×{positionMult}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Match Context:</span>
              <span className="font-mono font-semibold text-gray-900">×{contextMult}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consecutive Shots:</span>
              <span className="font-mono font-semibold text-gray-900">×{consecutiveMult.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Opponent Differential:</span>
              <span className="font-mono font-semibold text-gray-900">×{opponentMult.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-300 my-2"></div>
            <div className="flex justify-between items-center font-semibold">
              <span className="text-gray-800">Total Multiplier:</span>
              <span className="font-mono text-indigo-600">×{totalMultiplier.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Opponent Rating Differential
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Player Rating:</span>
              <span className="font-mono font-semibold text-gray-900">{playerRating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Opponent Rating:</span>
              <span className="font-mono font-semibold text-gray-900">{opponentRating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Differential:</span>
              <span className={`font-mono font-semibold ${opponentRating > playerRating ? 'text-red-600' : 'text-green-600'}`}>
                {opponentRating > playerRating ? '+' : ''}{opponentRating - playerRating}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2 italic">
              {isVictory ?
                (opponentRating > playerRating ?
                  'Beating higher-rated opponent increases rating gain' :
                  'Beating lower-rated opponent reduces rating gain') :
                (opponentRating > playerRating ?
                  'Losing to higher-rated opponent reduces rating loss' :
                  'Losing to lower-rated opponent increases rating loss')
              }
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
          <div className="text-xs font-semibold text-indigo-800 mb-2 uppercase tracking-wider">
            Final Result
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {calculatedChange >= 0 ? '+' : ''}{calculatedChange.toFixed(2)} Rating Points
          </div>
          <div className="text-xs text-indigo-700 mt-1">
            {playerRating} → {Math.round(playerRating + calculatedChange)}
          </div>
        </div>
      </div>
    </div>
  );
}
