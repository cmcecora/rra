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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Raydel Padel Rating System</h1>
                <p className="text-xs text-gray-500">AI-Powered Performance Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center px-6 py-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{currentRating}</div>
                <div className="text-xs text-blue-600 font-medium">Current Rating</div>
              </div>
              {shotHistory.length > 0 && (
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* LEFT SIDEBAR - Scenarios */}
          <div className="col-span-3 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Quick Scenarios</h3>
              <p className="text-xs text-gray-500 mt-1">Click to load configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button className="flex-1 px-4 py-2 text-xs font-semibold text-blue-700 border-b-2 border-blue-600 bg-white">
                Prebuilt
              </button>
              <button
                onClick={generateRandomScenarios}
                disabled={isRolling}
                className="flex-1 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <Dices className={`w-3 h-3 ${isRolling ? 'animate-spin' : ''}`} />
                {isRolling ? 'Rolling...' : 'Random'}
              </button>
            </div>

            {/* Scrollable Scenarios */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {QUICK_SCENARIOS.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => applyQuickScenario(scenario)}
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-lg text-left transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="text-xs font-bold leading-tight pr-2">{scenario.name}</div>
                    <div className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                      {scenario.config.opponentRating}
                    </div>
                  </div>
                  <div className="text-[10px] text-blue-50 space-y-0.5">
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

              {randomScenarios.length > 0 && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="space-y-2">
                    {randomScenarios.map((scenario, index) => (
                      <button
                        key={index}
                        onClick={() => applyQuickScenario(scenario)}
                        className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-3 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="text-xs font-bold leading-tight pr-2">{scenario.name}</div>
                          <div className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                            {scenario.config.opponentRating}
                          </div>
                        </div>
                        <div className="text-[10px] text-emerald-50 space-y-0.5">
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
                </div>
              )}
            </div>
          </div>

          {/* CENTER PANEL - Configuration */}
          <div className="col-span-5 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Shot Configuration</h3>
              <p className="text-xs text-gray-500 mt-1">Configure parameters and calculate impact</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {shotDescription && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                  <p className="text-[10px] font-bold text-blue-800 mb-1 uppercase tracking-wider">
                    Scenario Preview
                  </p>
                  <p className="text-xs text-blue-900 leading-relaxed">{shotDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Shot Type
                  </label>
                  <select
                    value={shotType}
                    onChange={(e) => setShotType(e.target.value as ShotType)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    {SHOT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Technical Execution
                  </label>
                  <select
                    value={technicalExecution}
                    onChange={(e) => setTechnicalExecution(e.target.value as TechnicalExecution)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    {TECHNICAL_EXECUTIONS.map((exec) => (
                      <option key={exec.value} value={exec.value}>
                        {exec.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Outcome
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as Outcome)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    {OUTCOMES.map((out) => (
                      <option key={out.value} value={out.value}>
                        {out.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Court Position
                  </label>
                  <select
                    value={courtPosition}
                    onChange={(e) => setCourtPosition(e.target.value as CourtPosition)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    {COURT_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Match Context
                  </label>
                  <select
                    value={matchContext}
                    onChange={(e) => setMatchContext(e.target.value as MatchContext)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    {MATCH_CONTEXTS.map((ctx) => (
                      <option key={ctx.value} value={ctx.value}>
                        {ctx.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Consecutive Shots
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={consecutiveShots}
                    onChange={(e) => setConsecutiveShots(parseInt(e.target.value) || 1)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Opponent Rating
                  </label>
                  <select
                    value={opponentRating}
                    onChange={(e) => setOpponentRating(parseInt(e.target.value))}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    {RATING_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  rows={3}
                />
              </div>


              <button
                onClick={recordShot}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-4 rounded-xl font-bold text-base mt-6 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Calculate Rating Impact
              </button>
            </div>
          </div>

          {/* RIGHT PANEL - Results & Analysis */}
          <div className="col-span-4 flex flex-col gap-6">
            {/* Live Results Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Live Results</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
                  <div className={`text-6xl font-black mb-1 ${calculatedChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculatedChange >= 0 ? '+' : ''}{calculatedChange.toFixed(1)}
                  </div>
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Rating Change</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
                  <div className="text-5xl font-black mb-1">
                    {Math.round(currentRating + calculatedChange)}
                  </div>
                  <div className="text-xs font-bold text-blue-200 uppercase tracking-wide">Projected New Rating</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wide">Shot Summary</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Shot Type</span>
                      <span className="font-bold text-gray-900">
                        {SHOT_TYPES.find((t) => t.value === shotType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Technical</span>
                      <span className="font-bold text-gray-900">
                        {TECHNICAL_EXECUTIONS.find((t) => t.value === technicalExecution)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Outcome</span>
                      <span className="font-bold text-gray-900">
                        {OUTCOMES.find((o) => o.value === outcome)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Position</span>
                      <span className="font-bold text-gray-900">
                        {COURT_POSITIONS.find((p) => p.value === courtPosition)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Context</span>
                      <span className="font-bold text-gray-900">
                        {MATCH_CONTEXTS.find((c) => c.value === matchContext)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-600 font-medium">Total Multiplier</span>
                      <span className="font-black text-blue-700">{calculatedMultiplier.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex-1">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Formula Breakdown</h3>
              </div>
              <div className="p-6 overflow-y-auto max-h-[500px]">
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
            </div>
          </div>
        </div>

        <div className="text-center mt-4 pb-4 text-xs text-gray-400">
          <p>Powered by Raydel Racing Algorithm (RRA®)</p>
        </div>
      </div>
    </div>
  );
}