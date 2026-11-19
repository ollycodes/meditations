import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { showNotification, useWakeLock } from '@/app/ui/pwa';
import { azeretMono } from '@/app/fonts';
import { card, softButton, startButton, stopButton } from '@/app/ui/styles';

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

  const sessionMinutes = Math.round(seconds / 60);
  const progress = seconds > 0 ? Math.min(100, (1 - displayTime / seconds) * 100) : 0;

  return (
    <div className='flex flex-col gap-3'>
      <h1 className='text-center text-2xl'>
        {sessionMinutes} {sessionMinutes === 1 ? 'minute' : 'minutes'} of stillness
      </h1>

      <section className={`${card} p-4 flex flex-col items-center gap-4`}>
        <span className='font-light' aria-live='polite'>
          {paused ? 'Paused' : 'Time remaining'}
        </span>
        <div
          id='countdown-label'
          role='timer'
          aria-label={paused ? 'Timer paused.' : 'Timer counting down.'}
          className={`${azeretMono.className} text-5xl font-light tabular-nums
            ${paused ? 'opacity-50' : ''} transition-opacity`}>
          {hh}:{mm}:{ss}
        </div>
        {/* Same track and fill colors as the volume sliders. */}
        <div
          className='w-full h-2 rounded-full bg-orange-200 overflow-hidden'
          role='progressbar'
          aria-label='Session progress'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className='h-full rounded-full bg-orange-400 transition-[width] duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <button
        type='button'
        className={`${paused ? startButton : stopButton} py-6 text-2xl`}
        onClick={() => setPaused(!paused)}
        aria-label={paused ? 'Resume meditation session.' : 'Pause meditation session.'}
      >{paused ? 'Resume' : 'Pause'}</button>

      <div className='grid grid-cols-2 gap-3'>
        <button
          type='button'
          className={`${softButton} py-3`}
          onClick={() => {
            setPaused(true)
            toggleTimer()
          }}
        >Cancel</button>
        <button
          type='button'
          className={`${softButton} py-3`}
          onClick={() => setDimmed(true)}
          aria-label='Dim the screen while the timer keeps running.'
        >Dim screen</button>
      </div>

      <p className='text-sm font-light text-center'>
        {wakeLockSupported
          ? 'Your screen will stay on until the session ends.'
          : 'Keep this screen open. This browser can\'t keep the screen awake, and phones pause web timers when the screen turns off.'}
      </p>
    </div>
  );
}
