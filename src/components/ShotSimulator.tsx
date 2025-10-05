import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Dices } from 'lucide-react';
import {
  ShotType,
  TechnicalExecution,
  Outcome,
  CourtPosition,
  MatchContext,
  calculateRatingChange,
  SHOT_TYPES,
  TECHNICAL_EXECUTIONS,
  OUTCOMES,
  COURT_POSITIONS,
  MATCH_CONTEXTS,
  RATING_LEVELS,
} from '../lib/ratingCalculator';
import FormulaBreakdown from './FormulaBreakdown';

interface QuickScenario {
  name: string;
  config: {
    shotType: ShotType;
    technicalExecution: TechnicalExecution;
    outcome: Outcome;
    courtPosition: CourtPosition;
    matchContext: MatchContext;
    consecutiveShots: number;
    opponentRating: number;
  };
}

const QUICK_SCENARIOS: QuickScenario[] = [
  {
    name: 'Vibora from poor position under pressure',
    config: {
      shotType: 'vibora',
      technicalExecution: 'good-shot',
      outcome: 'winner',
      courtPosition: 'poor',
      matchContext: 'under-pressure',
      consecutiveShots: 1,
      opponentRating: 1800,
    },
  },
  {
    name: 'Perfect lob strategic repositioning',
    config: {
      shotType: 'lob',
      technicalExecution: 'perfect-shot',
      outcome: 'in',
      courtPosition: 'strategic-change',
      matchContext: 'normal play',
      consecutiveShots: 3,
      opponentRating: 1600,
    },
  },
  {
    name: 'Chiquita from optimal position crucial point',
    config: {
      shotType: 'chiquita',
      technicalExecution: 'perfect-shot',
      outcome: 'winner',
      courtPosition: 'optimal',
      matchContext: 'crucial-point',
      consecutiveShots: 1,
      opponentRating: 2000,
    },
  },
  {
    name: 'Drop shot error breaking rally',
    config: {
      shotType: 'drop',
      technicalExecution: 'minor-error',
      outcome: 'out',
      courtPosition: 'out-of-position',
      matchContext: 'normal play',
      consecutiveShots: 7,
      opponentRating: 1400,
    },
  },
  {
    name: 'Bandeja winner from optimal position',
    config: {
      shotType: 'bandeja',
      technicalExecution: 'good-shot',
      outcome: 'winner',
      courtPosition: 'optimal',
      matchContext: 'crucial-point',
      consecutiveShots: 2,
      opponentRating: 1500,
    },
  },
  {
    name: 'Back glass recovery shot',
    config: {
      shotType: 'back-glass',
      technicalExecution: 'good-shot',
      outcome: 'in',
      courtPosition: 'poor',
      matchContext: 'under-pressure',
      consecutiveShots: 5,
      opponentRating: 1800,
    },
  },
  {
    name: 'Volley error out of position routine',
    config: {
      shotType: 'volley',
      technicalExecution: 'major-error',
      outcome: 'loser',
      courtPosition: 'out-of-position',
      matchContext: 'routine shot',
      consecutiveShots: 1,
      opponentRating: 1300,
    },
  },
  {
    name: 'Perfect smash breaking opponent rhythm',
    config: {
      shotType: 'smash',
      technicalExecution: 'perfect-shot',
      outcome: 'winner',
      courtPosition: 'optimal',
      matchContext: 'normal play',
      consecutiveShots: 4,
      opponentRating: 1600,
    },
  },
  {
    name: 'Forehand rally sustainer from optimal position',
    config: {
      shotType: 'forehand',
      technicalExecution: 'good-shot',
      outcome: 'in',
      courtPosition: 'optimal',
      matchContext: 'normal play',
      consecutiveShots: 9,
      opponentRating: 1500,
    },
  },
  {
    name: 'Backhand minor error strategic position',
    config: {
      shotType: 'backhand',
      technicalExecution: 'minor-error',
      outcome: 'loser',
      courtPosition: 'strategic-change',
      matchContext: 'crucial-point',
      consecutiveShots: 2,
      opponentRating: 2200,
    },
  },
];

interface LocalShot {
  id: string;
  shot_type: string;
  technical_execution: string;
  outcome: string;
  court_position: string;
  match_context: string;
  consecutive_shots: number;
  opponent_rating: number;
  player_rating_at_time: number;
  rating_change: number;
  multiplier_applied: number;
  notes: string;
  created_at: string;
}

function generateShotDescription(
  shotType: ShotType,
  technicalExecution: TechnicalExecution,
  outcome: Outcome,
  courtPosition: CourtPosition,
  matchContext: MatchContext,
  consecutiveShots: number,
  opponentRating: number
): string {
  const shotTypeLabel = SHOT_TYPES.find((t) => t.value === shotType)?.label || shotType;
  const techLabel = TECHNICAL_EXECUTIONS.find((t) => t.value === technicalExecution)?.label || technicalExecution;
  const outcomeLabel = OUTCOMES.find((o) => o.value === outcome)?.label || outcome;
  const positionLabel = COURT_POSITIONS.find((p) => p.value === courtPosition)?.label || courtPosition;
  const contextLabel = MATCH_CONTEXTS.find((c) => c.value === matchContext)?.label || matchContext;
  const opponentLevel = RATING_LEVELS.find((r) => r.value === opponentRating)?.label || `${opponentRating} rating`;

  const rallyText = consecutiveShots > 1 ? ` during ${consecutiveShots}-shot rally` : '';

  return `A ${shotTypeLabel.toLowerCase()}, ${techLabel.toLowerCase()}, from ${positionLabel.toLowerCase()} position, ${outcomeLabel.toLowerCase()}${rallyText}, ${contextLabel.toLowerCase()} play against ${opponentLevel} opponent`;
}

export default function ShotSimulator() {
  const [currentRating, setCurrentRating] = useState(1500);
  const [shotHistory, setShotHistory] = useState<LocalShot[]>([]);

  const [shotType, setShotType] = useState<ShotType>('forehand');
  const [technicalExecution, setTechnicalExecution] = useState<TechnicalExecution>('good-shot');
  const [outcome, setOutcome] = useState<Outcome>('in');
  const [courtPosition, setCourtPosition] = useState<CourtPosition>('optimal');
  const [matchContext, setMatchContext] = useState<MatchContext>('normal play');
  const [consecutiveShots, setConsecutiveShots] = useState(1);
  const [opponentRating, setOpponentRating] = useState(1500);
  const [notes, setNotes] = useState('');

  const [calculatedChange, setCalculatedChange] = useState(0);
  const [calculatedMultiplier, setCalculatedMultiplier] = useState(1);
  const [shotDescription, setShotDescription] = useState('');

  const [randomScenarios, setRandomScenarios] = useState<QuickScenario[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (technicalExecution === 'minor-error' || technicalExecution === 'major-error') {
      if (outcome !== 'loser' && outcome !== 'out') {
        setOutcome('loser');
        return;
      }
    }

    if (technicalExecution === 'perfect-shot') {
      if (outcome !== 'winner' && outcome !== 'in') {
        setOutcome('winner');
        return;
      }
    }

    if (shotType === 'serve') {
      if (consecutiveShots !== 1) {
        setConsecutiveShots(1);
        return;
      }
    }

    const result = calculateRatingChange({
      shotType,
      technicalExecution,
      outcome,
      courtPosition,
      matchContext,
      consecutiveShots,
      playerRating: currentRating,
      opponentRating,
    });
    setCalculatedChange(result.change);
    setCalculatedMultiplier(result.multiplier);

    const description = generateShotDescription(
      shotType,
      technicalExecution,
      outcome,
      courtPosition,
      matchContext,
      consecutiveShots,
      opponentRating
    );
    setShotDescription(description);
  }, [
    shotType,
    technicalExecution,
    outcome,
    courtPosition,
    matchContext,
    consecutiveShots,
    opponentRating,
    currentRating,
  ]);

  const recordShot = () => {
    const result = calculateRatingChange({
      shotType,
      technicalExecution,
      outcome,
      courtPosition,
      matchContext,
      consecutiveShots,
      playerRating: currentRating,
      opponentRating,
    });

    const newRating = Math.round(currentRating + result.change);

    const newShot: LocalShot = {
      id: Date.now().toString(),
      shot_type: shotType,
      technical_execution: technicalExecution,
      outcome,
      court_position: courtPosition,
      match_context: matchContext,
      consecutive_shots: consecutiveShots,
      opponent_rating: opponentRating,
      player_rating_at_time: currentRating,
      rating_change: result.change,
      multiplier_applied: result.multiplier,
      notes,
      created_at: new Date().toISOString(),
    };

    setShotHistory([newShot, ...shotHistory]);
    setCurrentRating(newRating);
    setNotes('');
  };

  const resetSimulation = () => {
    setCurrentRating(1500);
    setShotHistory([]);
  };

  const applyQuickScenario = (scenario: QuickScenario) => {
    setShotType(scenario.config.shotType);
    setTechnicalExecution(scenario.config.technicalExecution);
    setOutcome(scenario.config.outcome);
    setCourtPosition(scenario.config.courtPosition);
    setMatchContext(scenario.config.matchContext);
    setConsecutiveShots(scenario.config.consecutiveShots);
    setOpponentRating(scenario.config.opponentRating);
  };

  const generateRandomScenarios = () => {
    setIsRolling(true);

    setTimeout(() => {
      const scenarios: QuickScenario[] = [];

      for (let i = 0; i < 4; i++) {
        const randomShotType = SHOT_TYPES[Math.floor(Math.random() * SHOT_TYPES.length)].value;
        const randomTechnicalExecution = TECHNICAL_EXECUTIONS[Math.floor(Math.random() * TECHNICAL_EXECUTIONS.length)].value;
        let randomOutcome = OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)].value;
        const randomCourtPosition = COURT_POSITIONS[Math.floor(Math.random() * COURT_POSITIONS.length)].value;
        const randomMatchContext = MATCH_CONTEXTS[Math.floor(Math.random() * MATCH_CONTEXTS.length)].value;
        const randomConsecutiveShots = randomShotType === 'serve' ? 1 : Math.floor(Math.random() * 9) + 1;
        const randomOpponentRating = RATING_LEVELS[Math.floor(Math.random() * RATING_LEVELS.length)].value;

        if (randomTechnicalExecution === 'minor-error' || randomTechnicalExecution === 'major-error') {
          randomOutcome = Math.random() > 0.5 ? 'loser' : 'out';
        } else if (randomTechnicalExecution === 'perfect-shot') {
          randomOutcome = Math.random() > 0.5 ? 'winner' : 'in';
        }

        const shotTypeLabel = SHOT_TYPES.find((t) => t.value === randomShotType)?.label || '';
        const techLabel = TECHNICAL_EXECUTIONS.find((t) => t.value === randomTechnicalExecution)?.label || '';
        const outcomeLabel = OUTCOMES.find((o) => o.value === randomOutcome)?.label || '';

        scenarios.push({
          name: `${shotTypeLabel} ${techLabel.toLowerCase()} ${outcomeLabel.toLowerCase()}`,
          config: {
            shotType: randomShotType,
            technicalExecution: randomTechnicalExecution,
            outcome: randomOutcome,
            courtPosition: randomCourtPosition,
            matchContext: randomMatchContext,
            consecutiveShots: randomConsecutiveShots,
            opponentRating: randomOpponentRating,
          },
        });
      }

      setRandomScenarios(scenarios);
      setIsRolling(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Raydel Padel Rating System</h1>
            </div>
            <p className="text-indigo-100 text-sm">
              AI-Powered Advanced Performance Analytics
            </p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Revolutionary Rating System</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Experience the future of competitive evaluation with our proprietary Raydel Racing Algorithm (RRA®).
                This revolutionary system analyzes individual shot performance and strategic decision-making to provide
                unparalleled insights into player development.
              </p>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {currentRating}
                </div>
                <div className="text-sm text-indigo-700 font-medium">Current Rating</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Shot Simulator</h3>
              <p className="text-sm font-medium text-gray-700 mb-3">Prebuilt Scenarios</p>
              <p className="text-xs text-gray-500 mb-4">Click any scenario to load its configuration</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {QUICK_SCENARIOS.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => applyQuickScenario(scenario)}
                    className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-4 rounded-xl text-left transition-all shadow-md hover:shadow-lg group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold leading-tight">{scenario.name}</div>
                      <div className="text-xs bg-white/20 px-2 py-1 rounded">
                        {scenario.config.opponentRating}
                      </div>
                    </div>
                    <div className="text-xs text-indigo-100 space-y-1">
                      <div>
                        {SHOT_TYPES.find((t) => t.value === scenario.config.shotType)?.label} • {' '}
                        {TECHNICAL_EXECUTIONS.find((t) => t.value === scenario.config.technicalExecution)?.label}
                      </div>
                      <div>
                        {OUTCOMES.find((o) => o.value === scenario.config.outcome)?.label} • {' '}
                        {MATCH_CONTEXTS.find((c) => c.value === scenario.config.matchContext)?.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Random Scenarios</p>
                  <button
                    onClick={generateRandomScenarios}
                    disabled={isRolling}
                    className={`group relative bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${
                      isRolling ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    <Dices
                      className={`w-5 h-5 transition-transform ${
                        isRolling ? 'animate-spin' : 'group-hover:rotate-12'
                      }`}
                    />
                    <span>{isRolling ? 'Rolling...' : 'Roll the Dice'}</span>
                  </button>
                </div>

                {randomScenarios.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {randomScenarios.map((scenario, index) => (
                      <button
                        key={index}
                        onClick={() => applyQuickScenario(scenario)}
                        className="bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-xl text-left transition-all shadow-md hover:shadow-lg transform hover:scale-105 animate-fadeIn"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-semibold leading-tight">{scenario.name}</div>
                          <div className="text-xs bg-white/20 px-2 py-1 rounded">
                            {scenario.config.opponentRating}
                          </div>
                        </div>
                        <div className="text-xs text-purple-50 space-y-1">
                          <div>
                            {SHOT_TYPES.find((t) => t.value === scenario.config.shotType)?.label} • {' '}
                            {TECHNICAL_EXECUTIONS.find((t) => t.value === scenario.config.technicalExecution)?.label}
                          </div>
                          <div>
                            {OUTCOMES.find((o) => o.value === scenario.config.outcome)?.label} • {' '}
                            {MATCH_CONTEXTS.find((c) => c.value === scenario.config.matchContext)?.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm font-semibold text-gray-700 mb-4">Custom Shot Configuration</p>

              {shotDescription && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wide">
                    Shot Scenario Description
                  </p>
                  <p className="text-sm text-blue-900 leading-relaxed">{shotDescription}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Shot Type
                  </label>
                  <select
                    value={shotType}
                    onChange={(e) => setShotType(e.target.value as ShotType)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {SHOT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Technical Execution
                  </label>
                  <select
                    value={technicalExecution}
                    onChange={(e) => setTechnicalExecution(e.target.value as TechnicalExecution)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {TECHNICAL_EXECUTIONS.map((exec) => (
                      <option key={exec.value} value={exec.value}>
                        {exec.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Outcome
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as Outcome)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {OUTCOMES.map((out) => (
                      <option key={out.value} value={out.value}>
                        {out.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Court Position
                  </label>
                  <select
                    value={courtPosition}
                    onChange={(e) => setCourtPosition(e.target.value as CourtPosition)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {COURT_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Match Context
                  </label>
                  <select
                    value={matchContext}
                    onChange={(e) => setMatchContext(e.target.value as MatchContext)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {MATCH_CONTEXTS.map((ctx) => (
                      <option key={ctx.value} value={ctx.value}>
                        {ctx.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Consecutive Shots
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={consecutiveShots}
                    onChange={(e) => setConsecutiveShots(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Opponent Rating
                  </label>
                  <select
                    value={opponentRating}
                    onChange={(e) => setOpponentRating(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {RATING_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-6">
                <FormulaBreakdown
                  shotType={shotType}
                  technicalExecution={technicalExecution}
                  outcome={outcome}
                  courtPosition={courtPosition}
                  matchContext={matchContext}
                  consecutiveShots={consecutiveShots}
                  playerRating={currentRating}
                  opponentRating={opponentRating}
                  calculatedChange={calculatedChange}
                />
              </div>

              <button
                onClick={recordShot}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold mt-6 transition-all shadow-lg"
              >
                Calculate Rating Impact
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Shot Analysis</h3>

              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center mb-4">
                <div className={`text-5xl font-bold mb-2 ${calculatedChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculatedChange >= 0 ? '+' : ''}{calculatedChange}
                </div>
                <div className="text-sm text-gray-600">Rating Change</div>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white text-center mb-4">
                <div className="text-4xl font-bold mb-2">
                  {Math.round(currentRating + calculatedChange)}
                </div>
                <div className="text-sm text-indigo-200">Projected New Rating</div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-800 mb-3">Shot Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shot Type:</span>
                    <span className="font-medium text-gray-900">
                      {SHOT_TYPES.find((t) => t.value === shotType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technical:</span>
                    <span className="font-medium text-gray-900">
                      {TECHNICAL_EXECUTIONS.find((t) => t.value === technicalExecution)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outcome:</span>
                    <span className="font-medium text-gray-900">
                      {OUTCOMES.find((o) => o.value === outcome)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium text-gray-900">
                      {COURT_POSITIONS.find((p) => p.value === courtPosition)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Context:</span>
                    <span className="font-medium text-gray-900">
                      {MATCH_CONTEXTS.find((c) => c.value === matchContext)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Multiplier:</span>
                    <span className="font-medium text-gray-900">{calculatedMultiplier}x</span>
                  </div>
                </div>
              </div>
            </div>

            {shotHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Evolution</h3>
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center mb-4">
                  <div className="text-4xl font-bold mb-1">{currentRating}</div>
                  <div className="text-sm text-indigo-200 mb-4">Current Rating</div>
                  <div className="text-3xl font-bold text-green-300">
                    {shotHistory[0] && shotHistory[0].rating_change >= 0 ? '+' : ''}
                    {shotHistory[0]?.rating_change.toFixed(2)}
                  </div>
                  <div className="text-xs text-indigo-200 mt-1">Last Change</div>
                </div>

                <button
                  onClick={resetSimulation}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl text-center font-semibold cursor-pointer transition-all"
                >
                  Reset Simulation
                </button>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-indigo-600" />
                    Raydel Algorithm Factors
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-1">
                        Technical Execution (TECH)
                      </div>
                      <div className="text-gray-600">
                        Evaluates form, mechanics, and execution quality
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-1">
                        Court Positioning (YTEMS)
                      </div>
                      <div className="text-gray-600">
                        Assesses strategic positioning and spatial awareness
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-1">
                        Shot Consistency (YTEMS)
                      </div>
                      <div className="text-gray-600">
                        Tracks rally length and error patterns
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-1">Match Context (SOP%)</div>
                      <div className="text-gray-600">
                        Weighs pressure situations and critical moments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Powered by Raydel Racing Algorithm</p>
        </div>
      </div>
    </div>
  );
}