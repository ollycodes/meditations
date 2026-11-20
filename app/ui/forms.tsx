import React, { useState, useSyncExternalStore } from 'react';
import { SettingsPanel } from '@/app/ui/settings';
import { JOURNEY_KEY, Journey } from '@/app/ui/meditations';
import { card, chip, softButton, startButton } from '@/app/ui/styles';

const PRESETS = [5, 10, 20, 30];

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};

interface TimerFormProps {
  toggleTimer: () => void;
}

export function TimerForm({ toggleTimer }: TimerFormProps) {
  const [minutes, setMinutes] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  // Read on the client only; the page is prerendered without localStorage.
  const rawJourney = useSyncExternalStore(
    subscribeToStorage,
    () => localStorage.getItem(JOURNEY_KEY),
    () => null,
  );
  const journey: Journey | null = rawJourney ? JSON.parse(rawJourney) : null;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinutes(Number(e.target.value))
  }
  const handleStart = () => {
    if (Number.isFinite(minutes) && minutes >= 1) {
      sessionStorage.setItem('seconds', String(Math.round(minutes * 60)));
      toggleTimer();
    } else {
      alert('Please choose at least 1 minute.');
    }
  };

  if (showSettings) {
    return <SettingsPanel onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className='flex flex-col gap-3'>
      <h1 className='text-center text-2xl'>Simple Meditations</h1>

      <section className={`${card} p-4 flex flex-col gap-4`}>
        <label htmlFor='minutes' className='text-center font-light'>
          How long would you like to sit?
        </label>

        <div className='flex items-center justify-between'>
          <button
            type='button'
            className={`${softButton} h-14 w-14 text-3xl leading-none`}
            onClick={() => setMinutes((m) => (m >= 10 ? m - 5 : m))}
            aria-label={`Decrease session by 5 minutes, currently ${minutes} minutes.`}
          >−</button>

          <div className='flex flex-col items-center'>
            <input
              id='minutes'
              name='minutes'
              type='number'
              inputMode='numeric'
              step='1'
              min='1'
              className='w-32 bg-transparent text-6xl font-light text-center
                rounded-lg focus:outline-none focus:bg-orange-50'
              value={minutes}
              onChange={handleInput}
            />
            <span className='text-sm font-light'>minutes</span>
          </div>

          <button
            type='button'
            className={`${softButton} h-14 w-14 text-3xl leading-none`}
            onClick={() => setMinutes((m) => m + 5)}
            aria-label={`Increase session by 5 minutes, currently ${minutes} minutes.`}
          >+</button>
        </div>

        <div className='grid grid-cols-4 gap-2' role='group' aria-label='Quick session lengths'>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type='button'
              className={chip(minutes === preset)}
              aria-pressed={minutes === preset}
              onClick={() => setMinutes(preset)}
            >{preset} min</button>
          ))}
        </div>
      </section>

      <button
        type='button'
        className={`${startButton} py-6 text-2xl`}
        onClick={handleStart}
        aria-label={`Begin meditation session for ${minutes} minutes.`}
      >Start</button>

      <button
        type='button'
        className={`${softButton} py-3`}
        onClick={() => setShowSettings(true)}
      >Settings</button>

      {/* Height is reserved so the layout doesn't shift once stats load. */}
      <p className='h-5 text-sm font-light text-center'>
        {journey && journey.sessionCount > 0 && (
          <>
            {journey.sessionCount} {journey.sessionCount === 1 ? 'session' : 'sessions'}
            {' · '}
            {Math.round(journey.minutesCount)} {Math.round(journey.minutesCount) === 1 ? 'minute' : 'minutes'} meditated
          </>
        )}
      </p>
    </div>
  )
}
