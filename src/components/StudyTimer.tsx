import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  Coffee,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PresetConfig {
  label: string;
  minutes: number;
}

const PRESETS: Record<TimerMode, PresetConfig[]> = {
  focus: [
    { label: '25m', minutes: 25 },
    { label: '45m', minutes: 45 },
    { label: '50m', minutes: 50 },
  ],
  shortBreak: [
    { label: '5m', minutes: 5 },
    { label: '10m', minutes: 10 },
  ],
  longBreak: [
    { label: '15m', minutes: 15 },
    { label: '20m', minutes: 20 },
  ],
};

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// Play pleasant web audio chime without external assets
function playGentleChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Two-tone soothing harmonic chime
    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.9);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + idx * 0.15);
      osc.stop(ctx.currentTime + idx * 0.15 + 1);
    });
  } catch (e) {
    console.debug('Audio chime unable to play:', e);
  }
}

export const StudyTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [totalSeconds, setTotalSeconds] = useState<number>(DEFAULT_DURATIONS.focus);
  const [secondsLeft, setSecondsLeft] = useState<number>(DEFAULT_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('clearedu_pomodoro_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const intervalRef = useRef<number | null>(null);

  // Switch mode helper
  const handleSelectMode = (newMode: TimerMode, durationMinutes?: number) => {
    setIsRunning(false);
    setMode(newMode);
    const secs = durationMinutes ? durationMinutes * 60 : DEFAULT_DURATIONS[newMode];
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer expired
            if (soundEnabled) {
              playGentleChime();
            }

            if (mode === 'focus') {
              const nextCount = completedSessions + 1;
              setCompletedSessions(nextCount);
              try {
                localStorage.setItem('clearedu_pomodoro_count', String(nextCount));
              } catch (e) {
                console.debug('Storage error:', e);
              }

              // Auto switch to break: long break every 4 sessions, short break otherwise
              if (nextCount % 4 === 0) {
                setMode('longBreak');
                setTotalSeconds(DEFAULT_DURATIONS.longBreak);
                return DEFAULT_DURATIONS.longBreak;
              } else {
                setMode('shortBreak');
                setTotalSeconds(DEFAULT_DURATIONS.shortBreak);
                return DEFAULT_DURATIONS.shortBreak;
              }
            } else {
              // Break finished -> back to focus
              setMode('focus');
              setTotalSeconds(DEFAULT_DURATIONS.focus);
              return DEFAULT_DURATIONS.focus;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, completedSessions, soundEnabled]);

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      handleSelectMode('shortBreak');
    } else {
      handleSelectMode('focus');
    }
  };

  const progressPercentage = Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  const modeTheme = {
    focus: {
      accent: 'indigo',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      badgeBorder: 'border-indigo-200',
      bgGlow: 'from-indigo-50/50 to-white',
      btnActive: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      progress: 'bg-indigo-600',
      title: 'Focus Session',
      desc: 'Watch & take notes without distractions',
    },
    shortBreak: {
      accent: 'emerald',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      bgGlow: 'from-emerald-50/50 to-white',
      btnActive: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      progress: 'bg-emerald-500',
      title: 'Short Break',
      desc: 'Stretch, hydrate & rest your eyes',
    },
    longBreak: {
      accent: 'sky',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-700',
      badgeBorder: 'border-sky-200',
      bgGlow: 'from-sky-50/50 to-white',
      btnActive: 'bg-sky-600 hover:bg-sky-700 text-white',
      progress: 'bg-sky-500',
      title: 'Long Break',
      desc: 'Step away from screen & recharge',
    },
  }[mode];

  return (
    <div className={`rounded-3xl border border-slate-200/90 bg-gradient-to-b ${modeTheme.bgGlow} shadow-xs transition-all`}>
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${modeTheme.badgeBg} ${modeTheme.badgeText} flex items-center justify-center`}>
            {mode === 'focus' ? <Timer className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{modeTheme.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${modeTheme.badgeBg} ${modeTheme.badgeText} ${modeTheme.badgeBorder}`}>
                {mode === 'focus' ? 'Study' : 'Break'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">{modeTheme.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mute/Unmute sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={soundEnabled ? 'Chime sound enabled' : 'Chime muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-300" />}
          </button>

          {/* Minimize / Expand */}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isMinimized ? 'Expand timer' : 'Minimize timer'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Minimized Bar */}
      {isMinimized ? (
        <div className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-extrabold text-slate-900 tracking-tight">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[11px] text-slate-400 capitalize">({mode})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`p-1.5 rounded-xl ${modeTheme.btnActive} transition-transform active:scale-95`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded Panel */
        <div className="p-4 sm:p-5 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => handleSelectMode('focus')}
              className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'focus'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('shortBreak')}
              className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'shortBreak'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Short Break
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('longBreak')}
              className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'longBreak'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Long Break
            </button>
          </div>

          {/* Time Display & Progress Indicator */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
              {formatTime(secondsLeft)}
            </div>

            {/* Progress line */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${modeTheme.progress} transition-all duration-300 ease-out`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Preset quick buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
              {PRESETS[mode].map((preset) => {
                const isActive = totalSeconds === preset.minutes * 60;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectMode(mode, preset.minutes)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg border transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Play/Pause, Reset, Skip */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
              title="Reset current interval"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.98] ${modeTheme.btnActive}`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{secondsLeft === totalSeconds ? 'Start Session' : 'Resume'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
              title="Skip to next stage"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Session Progress Stats */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Completed today:</span>
              <strong className="text-slate-800 font-bold">{completedSessions}</strong>
            </div>

            {/* Visual pomodoro pips (up to 4 per cycle) */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((step) => {
                const cyclePos = ((completedSessions - 1) % 4) + 1;
                const isStepDone = completedSessions > 0 && step <= cyclePos;
                return (
                  <span
                    key={step}
                    title={`Session ${step} of 4`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isStepDone ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
