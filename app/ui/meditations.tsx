import React, { useState, useEffect, useRef } from 'react';
import { azeretMono } from '@/app/fonts';

function ringBell(volumeType: string) {
  const local = localStorage.getItem(volumeType);
  let bell = new Audio('sounds/bell.wav');
  bell.volume = local ? Number(local) : 0.5;
  bell.play();
}

function updateSessionInfo(minutes: number, startTime: string) {
  const local = localStorage.getItem('journey');
  const journey = local ? JSON.parse(local) : {
    'sessionCount': 0,
    'minutesCount': 0,
    'history': [],
  };

  journey.sessionCount += 1;
  journey.minutesCount += minutes;
  journey.history.push({
    startTime,
    endTime: Date(),
    minutes,
  });

  localStorage.setItem(journey, JSON.stringify(journey));
}

function handleNotifications() {
  const permission = useRef(Notification ? Notification.permission : null);
  if (permission.current === 'granted') {
    new Notification('Meditation complete', {
      body: 'Let\'s carry this mindfullness with us throuhgout our day.',
      icon: 'favicons/apple-touch-icon.png'
    })
  }
  document.title = "Finished!";
  ringBell('endingBellVolume');
}

interface TimerProps {
  toggleTimer: () => void;
}

export function Timer({ toggleTimer }: TimerProps) {
  const seconds = Number(sessionStorage.getItem('seconds'));
  const [displayTime, setDisplayTime] = useState<number>(seconds);
  const [paused, setPaused] = useState<boolean>(false);
  const remainingTimeRef = useRef<number>(seconds * 1000);
  const intervalArray = useRef<number[]>([]);
  const startTime = Date();

  const calculateIntervals = () => {
    intervalArray.current = [];
    const local = localStorage.getItem('intervalSettings');
    const intervalSettings = local ? JSON.parse(local) : {
      'on': false,
      'distance': 300,
    }

    if (intervalSettings.on) {
      for (let i = (seconds / intervalSettings.distance) - 1; i > 0; i--) {
        intervalArray.current.push(seconds - (intervalSettings.distance * i));
      }
    }

    return (intervalSettings)
  };

  useEffect(() => {
    let worker = new Worker('timer.js');
    const intervalSettings = calculateIntervals();

    worker.onmessage = (e) => {
      const { command, rawRemaining } = e.data;
      switch (command) {
        case ("update"):
          const roundedRemaining = Math.floor(rawRemaining / 1000);
          setDisplayTime(roundedRemaining);
          remainingTimeRef.current = rawRemaining;
          if (intervalSettings.on) {
            if (intervalArray.current.includes(roundedRemaining)) {
              intervalArray.current.pop();
              ringBell('intervalBellVolume');
            }
          }
          if (remainingTimeRef.current <= 0) {
            handleNotifications()
            updateSessionInfo(seconds / 60, startTime);
            worker.postMessage({ command: 'stop' })
            toggleTimer();
          }
          break;
      }
    }

    if (!paused) {
      worker.postMessage({
        command: 'start',
        remainingTime: remainingTimeRef.current,
      })
    } else {
      worker.postMessage({ command: 'stop' })
    }

    return () => {
      worker.postMessage({ command: 'stop' });
      worker.terminate();
    }
  }, [paused])

  const pretty = (num: number): string => {
    return (num < 10) ? '0' + num : num.toString();
  }

  let hh = pretty(Math.floor(displayTime / 3600));
  let mm = pretty(Math.floor(displayTime / 60 % 60));
  let ss = pretty(Math.floor(displayTime % 60));
  document.title = `${hh}:${mm}:${ss}`;

  return (
    <>
      <div
        className="flex flex-col items-center justify-center w-full max-w-lg h-screen">
        <label
          id='countdown-label'
          aria-label={`${paused ? 'Timer Currently Paused.' : 'Timer currently Counting Down.'}`}
          className={`${azeretMono.className} 
            py-6 w-full mb-10
            bg-indigo-400 text-white
            border-solid border-2 border-indigo-500
            text-center break-all text-5xl
            rounded-lg`}>
          {hh}:{mm}:{ss}
        </label>

        <button
          type='button'
          className={`${paused ?
            "bg-green-200 hover:bg-green-300 active:bg-green-400 border-green-300" :
            "bg-pink-200 hover:bg-pink-300 active:bg-pink-400 border-pink-300"}
            py-6 pw-10 w-full
            text-white text-center text-5xl
            border-solid border-2
            rounded-lg`}
          onClick={() => setPaused(!paused)}
          aria-label={paused ? 'Resume Meditation Session.' : 'Pause Meditation Session.'}
        >{paused ? 'Resume' : 'Pause'}</button>

        <button
          type='button'
          className='py-4 mt-5 pw-10 w-full
            bg-pink-300 hover:bg-pink-400 active:bg-pink-500 border-pink-400
            text-white text-center text-5xl
            border-solid border-2 rounded-lg'
          onClick={() => {
            setPaused(!paused)
            toggleTimer()
          }}
        >Cancel</button>
      </div >
    </>
  );
}
