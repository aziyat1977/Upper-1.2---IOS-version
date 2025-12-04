import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Scene from './components/Scene';
import { IconMenu, IconClose, IconStar, IconLock, IconPlay } from './components/Icons';
import { Button, Card, Badge } from './components/UI';
import { LEVELS, INTRO_SLIDES, PASS_THRESHOLD, QUESTIONS_PER_LEVEL, STORAGE_KEY } from './constants';
import { generateQuestions } from './utils/grammar';
import { audio } from './utils/audio';
import { UserProgress, GameState } from './types';

// --- INITIAL STATE ---
const INITIAL_PROGRESS: UserProgress = {
  unlockedMax: 0,
  bestByLevel: {},
};

const INITIAL_GAME: GameState = {
  status: 'boot',
  levelId: 0,
  qIdx: 0,
  score: 0,
  correctCount: 0,
  questions: [],
  locked: false,
  history: [],
};

// --- REDUCER ---
type Action = 
  | { type: 'START' }
  | { type: 'LOAD_LEVEL'; levelId: number; questions: any[] }
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_LEVEL' }
  | { type: 'RESTART' }
  | { type: 'GO_HOME' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'intro' };
    case 'LOAD_LEVEL':
      return { ...INITIAL_GAME, status: 'quiz', levelId: action.levelId, questions: action.questions };
    case 'ANSWER':
      return { 
        ...state, 
        score: action.correct ? state.score + 100 : state.score,
        correctCount: action.correct ? state.correctCount + 1 : state.correctCount,
        locked: true,
        history: [...state.history, action.correct]
      };
    case 'NEXT_QUESTION':
      return { ...state, locked: false, qIdx: state.qIdx + 1 };
    case 'FINISH_LEVEL':
      return { ...state, status: 'result' };
    case 'RESTART':
      return { ...INITIAL_GAME, status: 'boot' }; // Or logic to restart current
    case 'GO_HOME':
      return { ...state, status: 'intro' };
    default:
      return state;
  }
}

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [game, dispatch] = useReducer(gameReducer, INITIAL_GAME);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setProgress(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (progress.unlockedMax > 0 || Object.keys(progress.bestByLevel).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  // --- ACTIONS ---
  const handleStart = () => {
    audio.unlock();
    audio.playClick();
    dispatch({ type: 'START' });
  };

  const loadLevel = (id: number) => {
    if (id > progress.unlockedMax) return;
    setMenuOpen(false);
    const qs = generateQuestions(id, QUESTIONS_PER_LEVEL);
    dispatch({ type: 'LOAD_LEVEL', levelId: id, questions: qs });
  };

  const handleAnswer = (idx: number) => {
    if (game.locked) return;
    const q = game.questions[game.qIdx];
    const isCorrect = idx === q.correctIndex;
    
    if (isCorrect) audio.playSuccess();
    else audio.playError();

    dispatch({ type: 'ANSWER', correct: isCorrect });
  };

  const nextQuestion = () => {
    if (game.qIdx + 1 < QUESTIONS_PER_LEVEL) {
      dispatch({ type: 'NEXT_QUESTION' });
    } else {
      finishLevel();
    }
  };

  const finishLevel = () => {
    const passed = game.correctCount >= PASS_THRESHOLD;
    const stars = game.correctCount >= 14 ? 3 : game.correctCount >= 12 ? 2 : game.correctCount >= 10 ? 1 : 0;
    
    // Update progress
    setProgress(prev => {
      const currentBest = prev.bestByLevel[game.levelId];
      const newBestCorrect = Math.max(currentBest?.bestCorrect || 0, game.correctCount);
      const newBestStars = Math.max(currentBest?.bestStars || 0, stars);
      const isPassed = currentBest?.passed || passed;
      
      let nextUnlocked = prev.unlockedMax;
      if (passed && game.levelId === prev.unlockedMax) {
        nextUnlocked = Math.min(LEVELS.length - 1, prev.unlockedMax + 1);
      }

      return {
        unlockedMax: nextUnlocked,
        bestByLevel: {
          ...prev.bestByLevel,
          [game.levelId]: { bestCorrect: newBestCorrect, bestStars: newBestStars, passed: isPassed }
        }
      };
    });

    if (passed) audio.playSuccess();
    dispatch({ type: 'FINISH_LEVEL' });
  };

  const handleNextSlide = () => {
    if (slideIdx < INTRO_SLIDES.length - 1) {
      setSlideIdx(s => s + 1);
      audio.playClick();
    } else {
      loadLevel(0); // Start level 1 after intro
    }
  };

  // --- RENDER HELPERS ---
  const renderStars = (count: number) => (
    <div className="flex gap-1">
      {[1, 2, 3].map(i => <IconStar key={i} fill={i <= count} />)}
    </div>
  );

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-display text-white selection:bg-neon-cyan/30">
      <Scene mode={game.status === 'quiz' ? 'active' : game.status === 'result' ? 'success' : 'idle'} />
      
      {/* --- HUD --- */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-safe px-4 flex justify-between items-center h-[var(--hud-height)] pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => { setMenuOpen(true); audio.playClick(); }}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Menu"
          >
            <IconMenu />
          </button>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">WRIELTS<span className="text-neon-cyan">.ARCH</span></span>
            {game.status === 'quiz' && (
              <span className="text-xs font-mono text-white/50 tracking-widest">LVL {game.levelId + 1} • {game.score} PTS</span>
            )}
          </div>
        </div>
      </header>

      {/* --- PROGRESS BAR (Bottom) --- */}
      {game.status === 'quiz' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe px-4 py-4 pointer-events-none">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${((game.qIdx) / QUESTIONS_PER_LEVEL) * 100}%` }}
              transition={{ type: 'spring', bounce: 0 }}
            />
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="fixed inset-0 z-30 flex items-center justify-center pt-safe pb-safe px-4 pointer-events-none">
        <div className="w-full max-w-2xl pointer-events-auto">
          <AnimatePresence mode="wait">
            
            {/* 1. BOOT SCREEN */}
            {game.status === 'boot' && (
              <motion.div 
                key="boot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                className="text-center"
              >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">
                  GRAMMAR<span className="text-neon-cyan">.OS</span>
                </h1>
                <p className="font-mono text-sm text-white/60 mb-8 tracking-[0.2em] uppercase">System Ready</p>
                <Button onClick={handleStart}>Initialize</Button>
                <div className="mt-8 text-xs text-white/30 font-mono">
                  Optimized for iOS • WebAudio • R3F
                </div>
              </motion.div>
            )}

            {/* 2. INTRO SLIDES */}
            {game.status === 'intro' && (
              <motion.div 
                key={`slide-${slideIdx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <Card>
                  <div className="flex justify-between items-center mb-6">
                    <Badge color="cyan">LESSON {slideIdx + 1}/{INTRO_SLIDES.length}</Badge>
                  </div>
                  <h2 className={`text-3xl font-bold mb-4 ${
                    INTRO_SLIDES[slideIdx].mode === 'continuous' ? 'text-neon-pink' : 
                    INTRO_SLIDES[slideIdx].mode === 'simple' ? 'text-neon-cyan' : 'text-white'
                  }`}>
                    {INTRO_SLIDES[slideIdx].title}
                  </h2>
                  <div className="prose prose-invert mb-6" dangerouslySetInnerHTML={{ __html: INTRO_SLIDES[slideIdx].content }} />
                  
                  {INTRO_SLIDES[slideIdx].examples.length > 0 && (
                    <div className="space-y-3 mb-8">
                      {INTRO_SLIDES[slideIdx].examples.map((ex, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="text-lg font-medium mb-1">{ex.en}</p>
                          <p className="text-xs text-white/50 font-mono">{ex.ru}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleNextSlide} variant="neon">
                      {slideIdx < INTRO_SLIDES.length - 1 ? "Next" : "Start Quiz"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 3. QUIZ INTERFACE */}
            {game.status === 'quiz' && game.questions[game.qIdx] && (
              <motion.div
                key={`q-${game.qIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <Card>
                  <div className="flex justify-between items-center mb-6">
                    <Badge color="gray">QUESTION {game.qIdx + 1}/{QUESTIONS_PER_LEVEL}</Badge>
                    <Badge color={game.questions[game.qIdx].mode === 'continuous' ? 'pink' : 'cyan'}>
                      {game.questions[game.qIdx].mode}
                    </Badge>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold leading-relaxed mb-8">
                    {game.questions[game.qIdx].text}
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {game.questions[game.qIdx].opts.map((opt, i) => {
                       let stateStyles = "bg-white/5 border-white/10 hover:bg-white/10";
                       if (game.locked) {
                         if (i === game.questions[game.qIdx].correctIndex) stateStyles = "bg-neon-cyan/20 border-neon-cyan text-neon-cyan";
                         else if (i !== game.questions[game.qIdx].correctIndex && document.activeElement === document.getElementById(`opt-${i}`)) {
                            // This logic is tricky in React without refs, utilizing simplified logic below
                            stateStyles = "bg-neon-pink/20 border-neon-pink text-neon-pink opacity-50"; 
                         } else {
                           stateStyles = "opacity-30";
                         }
                       }

                       // Simple check for selected wrong answer visual
                       // In a real app we'd track selected index in state, here relying on structure
                       return (
                        <button
                          key={i}
                          id={`opt-${i}`}
                          disabled={game.locked}
                          onClick={() => handleAnswer(i)}
                          className={`
                            p-5 rounded-xl border text-left font-bold transition-all duration-200
                            flex items-center gap-4
                            ${stateStyles}
                          `}
                        >
                          <span className="font-mono text-xs opacity-50 w-6 h-6 rounded-full border border-white/30 flex items-center justify-center">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {game.locked && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-white/10"
                    >
                      <p className="text-sm text-white/80 mb-4 bg-white/5 p-4 rounded-lg font-mono">
                        ℹ️ {game.questions[game.qIdx].explain}
                      </p>
                      <Button onClick={nextQuestion} className="w-full">Continue</Button>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* 4. RESULT SCREEN */}
            {game.status === 'result' && (
              <motion.div 
                key="res"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full text-center"
              >
                <Card>
                  <h2 className="text-4xl font-bold mb-2">Level Complete</h2>
                  <div className="flex justify-center my-6">
                    {renderStars(game.correctCount >= 14 ? 3 : game.correctCount >= 12 ? 2 : game.correctCount >= 10 ? 1 : 0)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs font-mono opacity-50 mb-1">SCORE</div>
                      <div className="text-2xl font-bold text-neon-gold">{game.score}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs font-mono opacity-50 mb-1">ACCURACY</div>
                      <div className="text-2xl font-bold text-neon-cyan">{game.correctCount}/{QUESTIONS_PER_LEVEL}</div>
                    </div>
                  </div>

                  <p className="mb-8 opacity-80">
                    {game.correctCount >= PASS_THRESHOLD 
                      ? "Excellent work. Neural pathways reinforced." 
                      : "Threshold not met. Review and retry."}
                  </p>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => loadLevel(game.levelId)}>Retry</Button>
                    {game.correctCount >= PASS_THRESHOLD && (
                      <Button variant="neon" onClick={() => loadLevel(game.levelId + 1)}>Next Level</Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* --- MENU DRAWER --- */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-glass backdrop-blur-xl border-r border-white/10 z-50 flex flex-col pt-safe pb-safe"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <span className="font-mono text-sm tracking-widest">NAVIGATION</span>
                <button onClick={() => setMenuOpen(false)}><IconClose /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {LEVELS.map((lvl) => {
                  const isLocked = lvl.id > progress.unlockedMax;
                  const data = progress.bestByLevel[lvl.id];
                  
                  return (
                    <button
                      key={lvl.id}
                      disabled={isLocked}
                      onClick={() => loadLevel(lvl.id)}
                      className={`
                        w-full p-4 rounded-xl border text-left transition-all
                        ${isLocked ? 'border-transparent opacity-40 bg-white/5' : 'border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98]'}
                        ${lvl.id === game.levelId && game.status === 'quiz' ? 'border-neon-cyan/50 bg-neon-cyan/5' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm">LEVEL {lvl.id + 1}</span>
                        {isLocked ? <IconLock /> : data?.passed ? <span className="text-neon-cyan">✓</span> : <IconPlay />}
                      </div>
                      <div className="text-xs opacity-70 mb-2">{lvl.name}</div>
                      {!isLocked && data && (
                        <div className="flex items-center gap-2">
                          <div className="flex text-neon-gold scale-75 origin-left">
                            {[1, 2, 3].map(i => <IconStar key={i} fill={i <= data.bestStars} />)}
                          </div>
                          <span className="text-[10px] font-mono opacity-50">{data.bestCorrect}/{QUESTIONS_PER_LEVEL}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/10">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-[10px] font-mono uppercase opacity-50 mb-1">Total Mastery</div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neon-gold" 
                      style={{ width: `${(Object.values(progress.bestByLevel).filter((l: any) => l.passed).length / LEVELS.length) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}