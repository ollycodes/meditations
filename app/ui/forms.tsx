import React, { useState, useSyncExternalStore } from 'react';
import { Settings } from '@/app/ui/settings';
import { JOURNEY_KEY, Journey } from '@/app/ui/meditations';

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};


interface TimerFormProps {
  toggleTimer: () => void;
}

export function TimerForm({ toggleTimer }: TimerFormProps) {
  const [minutes, setMinutes] = useState(5);
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
  const handleClick = () => {
    if (Number.isFinite(minutes) && minutes >= 1) {
      sessionStorage.setItem('seconds', String(Math.round(minutes * 60)));
      toggleTimer();
    } else {
      alert('Please choose at least 1 minute.');
    }
  };

  return (
    <>
      <div>
        <div
          className="flex flex-col items-center justify-center max-w-sm w-full max-h-full">
          <p className='text-wrap pb-1'>
            Select how long you would like to meditate for and click start.
          </p>
          <button
            type="button"
            className="py-6 w-full
              bg-orange-100 hover:font-bold
              hover:bg-orange-200
              active:bg-orange-300
              border-solid border-2 border-orange-200
              rounded-t-lg"
            onClick={() => { setMinutes(minutes + 5) }}
            aria-label={`Increase meditation session by 5 minutes, current session is ${minutes} minutes.`}
          >Up</button>

          <input
            name='minutes'
            type="number"
            step="1"
            min="1"
            className="py-6 w-full 
              bg-gray-100 font-light text-5xl text-center
              hover:bg-gray-200
              border-gray-200 border-solid border-x-2"
            value={minutes}
            placeholder="Enter minute amount."
            onChange={handleInput}
          ></input>

          <label
            className="py-2 w-full 
              bg-gray-100 font-light text-center
              border-gray-200 border-solid border-x-2"
          >Minutes</label>

          <button
            type="button"
            className="py-6 w-full
              bg-orange-100 hover:font-bold
              hover:bg-orange-200
              active:bg-orange-300
              border-solid border-2 border-orange-200
              rounded-b-lg"
            onClick={() => {
              setMinutes(() => {
                if (minutes >= 10) {
                  return minutes - 5;
                } else {
                  return minutes;
                }
              })
            }}
            aria-label={`Decrease meditation session by 5 minutes, current session is ${minutes} minutes.`}
          >Down</button>

          <button
            type="button"
            className="py-8 w-full my-2
              bg-emerald-100 hover:font-bold
              hover:bg-emerald-200
              active:bg-emerald-300
              border-solid border-2 border-emerald-200
              rounded-lg"
            onClick={handleClick}
            aria-label={`Begin meditation session for ${minutes} minutes.`}
          >Start</button>

          <Settings />

          {journey && journey.sessionCount > 0 && (
            <p className='pt-2 text-sm font-light text-center'>
              {journey.sessionCount} {journey.sessionCount === 1 ? 'session' : 'sessions'}
              {' · '}
              {Math.round(journey.minutesCount)} {Math.round(journey.minutesCount) === 1 ? 'minute' : 'minutes'} meditated
            </p>
          )}
        </div>
      </div>
    </>
  )
}
