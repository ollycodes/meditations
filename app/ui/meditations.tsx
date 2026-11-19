import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { showNotification, useWakeLock } from '@/app/ui/pwa';
import { azeretMono } from '@/app/fonts';

export const JOURNEY_KEY = 'journey';

export interface Journey {
  sessionCount: number;
  minutesCount: number;
  history: { startTime: string, endTime: string, minutes: number }[];
}

export function readJourney(): Journey {
  const local = localStorage.getItem(JOURNEY_KEY);
  return local ? JSON.parse(local) : {
    sessionCount: 0,
    minutesCount: 0,
    history: [],
  };
}

function updateSessionInfo(minutes: number, startTime: string) {
  const journey = readJourney();
  journey.sessionCount += 1;
  journey.minutesCount += minutes;
  journey.history.push({
    startTime,
    endTime: new Date().toISOString(),
    minutes,
  });
  localStorage.setItem(JOURNEY_KEY, JSON.stringify(journey));
  // Earlier versions accidentally saved under this key.
  localStorage.removeItem('[object Object]');
}

function ringBell(volumeType: string) {
  const local = localStorage.getItem(volumeType);
  const bell = new Audio('/sounds/bell.wav');
  bell.volume = local ? Number(local) : 0.5;
  bell.play().catch((err) => console.log('Bell could not play:', err));
}

// Seconds-remaining marks at which an interval bell rings, latest-first
// (e.g. 15 min every 5 min -> [600, 300]). The ending bell is separate.
function calculateBells(seconds: number): number[] {
  const local = localStorage.getItem('intervalSettings');
  const settings = local ? JSON.parse(local) : { on: false, distance: 300 };
  const bells: number[] = [];
  if (settings.on && settings.distance > 0) {
    for (let elapsed = settings.distance; elapsed < seconds; elapsed += settings.distance) {
      bells.push(seconds - elapsed);
    }
  }
  return bells;
}

function finishSession(minutes: number, startTime: string) {
  ringBell('endingBellVolume');
  showNotification('Meditation complete', {
    body: 'Let\'s carry this mindfulness with us throughout our day.',
    icon: '/icons/apple-touch-icon.png'
  });
  updateSessionInfo(minutes, startTime);
}

const pretty = (num: number): string => {
  return (num < 10) ? '0' + num : num.toString();
}

interface TimerProps {
  toggleTimer: () => void;
}

export function Timer({ toggleTimer }: TimerProps) {
  const [seconds] = useState<number>(() => Number(sessionStorage.getItem('seconds')));
  const [displayTime, setDisplayTime] = useState<number>(seconds);
  const [paused, setPaused] = useState<boolean>(false);
  const [dimmed, setDimmed] = useState<boolean>(false);
  const remainingTimeRef = useRef<number>(seconds * 1000);
  const bellsRef = useRef<number[] | null>(null);
  const startTimeRef = useRef<string>('');
  const finishedRef = useRef<boolean>(false);
  const wakeLockSupported = useWakeLock(!paused);

  useEffect(() => {
    if (!startTimeRef.current) startTimeRef.current = new Date().toISOString();
    if (!bellsRef.current) bellsRef.current = calculateBells(seconds);
    if (paused) return;

    const worker = new Worker('/timer.js');
    worker.onmessage = (e) => {
      const { command, rawRemaining } = e.data;
      if (command !== 'update' || finishedRef.current) return;

      remainingTimeRef.current = Math.max(rawRemaining, 0);
      const remainingSeconds = Math.ceil(remainingTimeRef.current / 1000);
      setDisplayTime(remainingSeconds);

      // `<=` rather than `===` so a bell isn't skipped if ticks were delayed
      // (e.g. the tab was in the background). Several missed bells ring once.
      const bells = bellsRef.current ?? [];
      let due = false;
      while (bells.length && remainingSeconds <= bells[0]) {
        bells.shift();
        due = true;
      }
      if (due && remainingSeconds > 0) ringBell('intervalBellVolume');

      if (remainingTimeRef.current <= 0) {
        finishedRef.current = true;
        worker.postMessage({ command: 'stop' });
        finishSession(seconds / 60, startTimeRef.current);
        toggleTimer();
      }
    };

    worker.postMessage({
      command: 'start',
      endsAt: Date.now() + remainingTimeRef.current,
    });

    return () => {
      worker.postMessage({ command: 'stop' });
      worker.terminate();
    }
  }, [paused, seconds, toggleTimer])

  const hh = pretty(Math.floor(displayTime / 3600));
  const mm = pretty(Math.floor(displayTime / 60 % 60));
  const ss = pretty(Math.floor(displayTime % 60));

  useEffect(() => {
    document.title = paused ? `Paused · ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  }, [hh, mm, ss, paused]);
  useEffect(() => () => { document.title = 'Simple Meditations'; }, []);

  if (dimmed) {
    return (
      <button
        type='button'
        className={`${azeretMono.className}
          fixed inset-0 z-50 w-full h-full
          flex flex-col items-center justify-center
          bg-black text-neutral-700 text-5xl`}
        onClick={() => setDimmed(false)}
        aria-label='Screen dimmed. Tap to show controls.'
      >
        {hh}:{mm}:{ss}
        <span className='mt-6 text-base font-sans'>Tap to show controls</span>
      </button>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      <div
        id='countdown-label'
        role='timer'
        aria-label={paused ? 'Timer paused.' : 'Timer counting down.'}
        className={`${azeretMono.className}
          py-8 bg-indigo-400 text-white tabular-nums
          border-2 border-indigo-500 rounded-lg
          text-center text-5xl`}>
        {hh}:{mm}:{ss}
      </div>
      <p className='h-5 text-sm font-light text-center'>{paused ? 'Paused' : ''}</p>

      <button
        type='button'
        className={`${paused
          ? 'bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 border-emerald-200'
          : 'bg-pink-200 hover:bg-pink-300 active:bg-pink-400 border-pink-300'}
          py-6 text-4xl border-2 rounded-lg transition-colors`}
        onClick={() => setPaused(!paused)}
        aria-label={paused ? 'Resume meditation session.' : 'Pause meditation session.'}
      >{paused ? 'Resume' : 'Pause'}</button>

      <button
        type='button'
        className='py-4 text-2xl
          bg-pink-100 hover:bg-pink-200 active:bg-pink-300 border-2 border-pink-200
          rounded-lg transition-colors'
        onClick={() => {
          setPaused(true)
          toggleTimer()
        }}
      >Cancel</button>

      <button
        type='button'
        className='py-3 text-neutral-300
          bg-neutral-800 hover:bg-neutral-900 active:bg-black
          border-2 border-neutral-700 rounded-lg transition-colors'
        onClick={() => setDimmed(true)}
        aria-label='Dim the screen while the timer keeps running.'
      >Dim screen</button>

      <p className='text-sm font-light text-center'>
        {wakeLockSupported
          ? 'Your screen will stay on until the session ends.'
          : 'Keep this screen open. This browser can\'t keep the screen awake, and phones pause web timers when the screen turns off.'}
      </p>
    </div>
  );
}
