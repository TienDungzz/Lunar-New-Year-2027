import { useEffect, useRef, useState } from 'react';
import { readStorage, writeStorage } from '../lib/experience.mjs';
import { setAudioEnabled, setAudioVolume } from '../lib/audio';
import { DEFAULT_VOLUME, normalizeVolume } from '../lib/audioPreferences.mjs';

export default function useExperienceAudio() {
  const [sound, setSound] = useState(false);
  const [volume, setVolume] = useState(() => normalizeVolume(readStorage('tet-sound-volume', DEFAULT_VOLUME)));
  const soundRequest = useRef(0);
  useEffect(() => () => {
    soundRequest.current++;
    void setAudioEnabled(false);
  }, []);
  useEffect(() => {
    setAudioVolume(volume);
    writeStorage('tet-sound-volume', volume);
  }, [volume]);
  const updateSound = async (enabled: boolean) => {
    const request = ++soundRequest.current;
    setSound(enabled);
    try { await setAudioEnabled(enabled); }
    catch { if (request === soundRequest.current) setSound(false); }
  };
  const changeVolume = (value: number) => {
    const next = normalizeVolume(value);
    setVolume(next);
    setAudioVolume(next);
    void updateSound(next > 0);
  };
  return { sound, volume, changeVolume };
}
