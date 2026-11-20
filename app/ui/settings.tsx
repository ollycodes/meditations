import { useState, useEffect } from 'react';
import { NotificationSetting, InstallPrompt } from '@/app/ui/pwa';
import { card, chip, divider, softButton } from '@/app/ui/styles';

const INTERVAL_KEY = 'intervalSettings';
const INTERVAL_OPTIONS = [
  { seconds: 120, label: '2 min' },
  { seconds: 300, label: '5 min' },
  { seconds: 600, label: '10 min' },
];

interface VolumeControlProps {
  label: string,
  volumeType: string,
  disabled?: boolean,
}

function VolumeControl({ label, volumeType, disabled = false }: VolumeControlProps) {
  const [volume, setVolume] = useState(() => {
    const local = localStorage.getItem(volumeType);
    return local ? Number(local) : 0.5;
  })

  useEffect(() => {
    localStorage.setItem(volumeType, volume.toString());
  }, [volume, volumeType])

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex justify-between'>
        <label htmlFor={volumeType}>{label}</label>
        <span className='text-sm font-light tabular-nums'>{Math.round(volume * 100)}%</span>
      </div>
      <div className='flex items-center gap-3'>
        <input
          id={volumeType}
          type='range'
          className='flex-1 cursor-pointer disabled:cursor-not-allowed'
          style={{ '--fill': `${volume * 100}%` } as React.CSSProperties}
          min={0} max={1} step={0.01}
          value={volume}
          disabled={disabled}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <button
          type='button'
          className={`${softButton} px-3 py-1 text-sm`}
          disabled={disabled}
          aria-label={`Play ${label.toLowerCase()} at ${Math.round(volume * 100)}% volume`}
          onClick={() => {
            const bell = new Audio('/sounds/bell.wav');
            bell.volume = volume;
            bell.play().catch((err) => console.log('Bell could not play:', err));
          }}
        >Test</button>
      </div>
    </div>
  )
}

interface SwitchProps {
  on: boolean,
  onToggle: () => void,
  labelledBy: string,
}

function Switch({ on, onToggle, labelledBy }: SwitchProps) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={on}
      aria-labelledby={labelledBy}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors
        ${on ? 'bg-emerald-300 border-emerald-400' : 'bg-orange-50 border-orange-200'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow
        transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function IntervalSettings() {
  const [intervalSettings, setIntervalSettings] = useState(() => {
    const local = localStorage.getItem(INTERVAL_KEY);
    return local ? JSON.parse(local) : { on: false, distance: 300 }
  })

  useEffect(() => {
    localStorage.setItem(INTERVAL_KEY, JSON.stringify(intervalSettings));
  }, [intervalSettings])

  const on: boolean = intervalSettings.on;

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <span id='interval-label'>Interval bells</span>
        <Switch
          on={on}
          labelledBy='interval-label'
          onToggle={() => setIntervalSettings({ ...intervalSettings, on: !on })}
        />
      </div>

      {/* Always rendered (dimmed when off) so toggling never shifts the layout. */}
      <div className={`flex flex-col gap-3 transition-opacity ${on ? '' : 'opacity-50'}`}>
        <VolumeControl label='Interval volume' volumeType='intervalBellVolume' disabled={!on} />
        <div className='flex flex-col gap-1'>
          <span id='ring-every-label'>Ring every</span>
          <div className='grid grid-cols-3 gap-2' role='group' aria-labelledby='ring-every-label'>
            {INTERVAL_OPTIONS.map(({ seconds, label }) => (
              <button
                key={seconds}
                type='button'
                disabled={!on}
                aria-pressed={intervalSettings.distance === seconds}
                className={`${chip(intervalSettings.distance === seconds)} disabled:cursor-not-allowed`}
                onClick={() => setIntervalSettings({ ...intervalSettings, distance: seconds })}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SettingsPanelProps {
  onClose: () => void,
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <section className={`${card} p-4 flex flex-col gap-4`} aria-labelledby='settings-title'>
      <header className='flex items-center justify-between'>
        <h2 id='settings-title' className='text-2xl'>Settings</h2>
        <button
          type='button'
          className={`${softButton} px-4 py-1`}
          onClick={onClose}
        >Done</button>
      </header>

      <NotificationSetting />
      <hr className={divider} />
      <VolumeControl label='Ending bell' volumeType='endingBellVolume' />
      <hr className={divider} />
      <IntervalSettings />
      <InstallPrompt />
    </section>
  )
}
