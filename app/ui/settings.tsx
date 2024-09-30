import { useState, useEffect } from 'react';
import { PermissionRequest, InstallPrompt } from '@/app/ui/pwa';

interface VolumeSettingsProps {
  volumeType: string,
}

function VolumeSettings({ volumeType }: VolumeSettingsProps) {
  const localName = volumeType;
  const [volume, setVolume] = useState(() => {
    const local = localStorage.getItem(localName);
    return local ? Number(local) : 0.5;
  })

  useEffect(() => {
    localStorage.setItem(localName, volume.toString());
  }, [volume])

  return (
    <>
      <div className='py-2 w-3/4 flex flex-row justify-between'>
        <label>Volume: {(volume * 100).toFixed(0)}</label>
        <button type='button'
          className='bg-orange-50 hover:bg-orange-200 
          border-solid border-2 border-orange-200'
          onClick={() => {
            let bell = new Audio('sounds/bell.wav');
            bell.volume = volume;
            bell.play();
          }}
        >Test</button>
      </div>

      <input type='range'
        className='cursor-ew-resize appearance-none
        -webkit-appearance : none;
        hover:bg-orange-300
        h-2 my-2 rounded-lg w-3/4
        transparent border-transparent bg-orange-200'
        min={0} max={1} step={0.01}
        value={volume}
        onChange={(e: any) => { setVolume(Number(e.target.value)) }}
      />
    </>
  )
}

function IntervalSettings() {
  const intervalSettingsName = 'intervalSettings'
  const [intervalSettings, setIntervalSettings] = useState(() => {
    const local = localStorage.getItem(intervalSettingsName);
    return local ? JSON.parse(local) : { 'on': false, 'distance': 300 }
  })

  useEffect(() => {
    localStorage.setItem(intervalSettingsName, JSON.stringify(intervalSettings));
  }, [intervalSettings])

  return (<>
    <div className='py-2 w-3/4 flex flex-row justify-between items-center'>
      <label>Interval Settings </label>
      <button type='button'
        className='bg-orange-50 hover:bg-orange-200
        px-2 border-solid border-2 border-orange-200'
        onClick={() => {
          setIntervalSettings({ ...intervalSettings, 'on': !intervalSettings.on })
        }}
      >{intervalSettings.on ? 'On' : 'Off'}</button>
    </div>

    {intervalSettings.on ? (<>
      <VolumeSettings volumeType={'intervalBellVolume'} />
      <div className='py-2 w-3/4 flex flex-row justify-between items-center'>
        <label>Ring every </label>
        <select
          value={intervalSettings.distance}
          onChange={(e) => {
            setIntervalSettings({ ...intervalSettings, 'distance': Number(e.target.value) })
          }}
          className='hover:bg-orange-300 cursor-pointer
                my-2 p-2 rounded-md
                transparent border-transparent bg-orange-200'>
          <option value="120">2 minutes.</option>
          <option value="300">5 minutes.</option>
          <option value="600">10 minutes.</option>
        </select>
      </div>
    </>) : (<>
    </>)}
  </>)
}

function SettingsMenu() {
  return (<>
    <div className='flex flex-col items-center justify-between
      bg-orange-100 border-solid border-2 border-orange-200
      w-full my-2 rounded-lg font-light'>
      <label className='font-normal'>Settings</label>
      <PermissionRequest />
      <label>Ending Bell</label>
      <VolumeSettings volumeType={'endingBellVolume'} />
      <IntervalSettings />
      <InstallPrompt />
    </div>
  </>)
}

export function Settings() {
  const [settingsMenu, toggleSettingsMenu] = useState(false);
  return (<>
    {settingsMenu ? (<SettingsMenu />) : <></>}
    <button type='button'
      className='py-6 w-full my-2
        bg-orange-100 hover:font-bold
        hover:bg-orange-200
        active:bg-orange-300
        border-solid border-2 border-orange-200
        rounded-lg'
      aria-label=
      {settingsMenu ? 'Close Settings' : 'Open settings'}
      onClick={() => toggleSettingsMenu(!settingsMenu)}>
      {settingsMenu ? 'Close Settings' : 'Open settings'}
    </button>
  </>)
}
